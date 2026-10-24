import {
  AuthEnv,
  clearSessionCookie,
  createSessionCookie,
  timingSafeEqualStrings,
  verifySessionRequest,
} from "./auth";
import { renderLoginPage, renderReaderApp } from "./ui";

export interface Env extends AuthEnv {
  DB: D1Database;
  READER_PASSWORD?: string;
  SESSION_SECRET?: string;
  SYNC_TOKEN?: string;
}

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function htmlResponse(html: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
      ...extraHeaders,
    },
  });
}

async function recalculateBookStats(db: D1Database, bookId: string): Promise<void> {
  const stats = await db
    .prepare(
      `SELECT COUNT(*) AS cnt, COALESCE(SUM(word_count), 0) AS words, COALESCE(MAX(chapter_num), 0) AS max_num
       FROM chapters WHERE book_id = ?1`
    )
    .bind(bookId)
    .first<{ cnt: number; words: number; max_num: number }>();

  let latestTitle = "";
  if (stats && stats.max_num > 0) {
    const latest = await db
      .prepare(`SELECT title FROM chapters WHERE book_id = ?1 AND chapter_num = ?2`)
      .bind(bookId, stats.max_num)
      .first<{ title: string }>();
    latestTitle = latest?.title || "";
  }

  await db
    .prepare(
      `UPDATE books
       SET chapter_count = ?1,
           word_count = ?2,
           latest_chapter_num = ?3,
           latest_chapter_title = ?4,
           updated_at = ?5
       WHERE id = ?6`
    )
    .bind(
      stats?.cnt || 0,
      stats?.words || 0,
      stats?.max_num || 0,
      latestTitle,
      new Date().toISOString(),
      bookId
    )
    .run();
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const isSecure = url.protocol === "https:";

    if (pathname === "/health") {
      return jsonResponse({ ok: true, service: "inkos-novel-reader" });
    }

    // Public auth routes
    if (pathname === "/api/login" && request.method === "POST") {
      let body: { password?: string } = {};
      try {
        body = (await request.json()) as { password?: string };
      } catch {
        return jsonResponse({ ok: false, error: "请求格式错误" }, 400);
      }
      const password = String(body.password || "").trim();
      const expectedPassword = env.READER_PASSWORD || "";
      if (!expectedPassword) {
        return jsonResponse({ ok: false, error: "服务端尚未配置阅读密码" }, 500);
      }
      const matched = await timingSafeEqualStrings(password, expectedPassword);
      if (!matched) {
        return jsonResponse({ ok: false, error: "阅读密码不正确，请核对后重试" }, 401);
      }
      const secret = env.SESSION_SECRET || expectedPassword;
      const cookie = await createSessionCookie(secret, isSecure);
      return jsonResponse({ ok: true }, 200, { "Set-Cookie": cookie });
    }

    if (pathname === "/api/logout" && request.method === "POST") {
      return jsonResponse({ ok: true }, 200, {
        "Set-Cookie": clearSessionCookie(isSecure),
      });
    }

    // Verify authentication for all other routes
    const authed = await verifySessionRequest(request, env);
    if (!authed) {
      if (pathname.startsWith("/api/")) {
        return jsonResponse({ ok: false, error: "未授权，请先输入阅读密码登录" }, 401);
      }
      return htmlResponse(renderLoginPage(), 200);
    }

    // Serve SPA shell for authenticated users
    if (request.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
      return htmlResponse(renderReaderApp(), 200);
    }

    // List all books
    if (pathname === "/api/books" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, title, subtitle, author, genre, platform, status, target_chapters,
                word_count, chapter_count, latest_chapter_num, latest_chapter_title,
                cover_color, tags_json, summary, created_at, updated_at
         FROM books
         ORDER BY updated_at DESC`
      ).all();
      return jsonResponse({ ok: true, books: results || [] });
    }

    // Single book details + chapters list + roles
    const bookMatch = pathname.match(/^\/api\/books\/([^/]+)$/);
    if (bookMatch && request.method === "GET") {
      const bookId = decodeURIComponent(bookMatch[1]);
      const book = await env.DB.prepare(`SELECT * FROM books WHERE id = ?1`).bind(bookId).first();
      if (!book) {
        return jsonResponse({ ok: false, error: "未找到该书籍" }, 404);
      }
      const [chaptersRes, rolesRes] = await Promise.all([
        env.DB.prepare(
          `SELECT book_id, chapter_num, volume_num, volume_title, title, status, word_count, summary, created_at, updated_at
           FROM chapters WHERE book_id = ?1 ORDER BY chapter_num ASC`
        )
          .bind(bookId)
          .all(),
        env.DB.prepare(
          `SELECT book_id, name, category, role_tag, content, sort_order, updated_at
           FROM roles WHERE book_id = ?1 ORDER BY sort_order ASC, name ASC`
        )
          .bind(bookId)
          .all(),
      ]);
      return jsonResponse({
        ok: true,
        book,
        chapters: chaptersRes.results || [],
        roles: rolesRes.results || [],
      });
    }

    // Delete a book
    if (bookMatch && request.method === "DELETE") {
      const bookId = decodeURIComponent(bookMatch[1]);
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM chapters WHERE book_id = ?1`).bind(bookId),
        env.DB.prepare(`DELETE FROM roles WHERE book_id = ?1`).bind(bookId),
        env.DB.prepare(`DELETE FROM books WHERE id = ?1`).bind(bookId),
      ]);
      return jsonResponse({ ok: true });
    }

    // Get a single chapter with prev/next navigation
    const chapMatch = pathname.match(/^\/api\/books\/([^/]+)\/chapters\/(\d+)$/);
    if (chapMatch && request.method === "GET") {
      const bookId = decodeURIComponent(chapMatch[1]);
      const chapNum = parseInt(chapMatch[2], 10);

      const [book, chapter, allChapsRes] = await Promise.all([
        env.DB.prepare(
          `SELECT id, title, author, genre, status, target_chapters, chapter_count, word_count, updated_at
           FROM books WHERE id = ?1`
        )
          .bind(bookId)
          .first(),
        env.DB.prepare(`SELECT * FROM chapters WHERE book_id = ?1 AND chapter_num = ?2`)
          .bind(bookId, chapNum)
          .first<Record<string, unknown>>(),
        env.DB.prepare(
          `SELECT chapter_num, volume_num, volume_title, title, word_count, updated_at
           FROM chapters WHERE book_id = ?1 ORDER BY chapter_num ASC`
        )
          .bind(bookId)
          .all<{ chapter_num: number }>(),
      ]);

      if (!book || !chapter) {
        return jsonResponse({ ok: false, error: "未找到该章节" }, 404);
      }

      const allChapters = allChapsRes.results || [];
      const nums = allChapters.map((c) => c.chapter_num);
      const idx = nums.indexOf(chapNum);
      const prev_num = idx > 0 ? nums[idx - 1] : null;
      const next_num = idx >= 0 && idx < nums.length - 1 ? nums[idx + 1] : null;

      return jsonResponse({
        ok: true,
        book,
        chapter: { ...chapter, prev_num, next_num },
        allChapters,
      });
    }

    // Upsert book metadata, outlines, roles
    if (pathname === "/api/sync/book" && request.method === "POST") {
      const body = (await request.json()) as Record<string, unknown>;
      const id = String(body.id || "").trim();
      const title = String(body.title || id).trim();
      if (!id || !title) {
        return jsonResponse({ ok: false, error: "id and title are required" }, 400);
      }
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO books (
           id, title, subtitle, author, genre, platform, status, target_chapters,
           cover_color, tags_json, summary, story_frame, volume_map, pending_hooks,
           style_guide, current_state, chapter_summaries, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           subtitle = excluded.subtitle,
           author = excluded.author,
           genre = excluded.genre,
           platform = excluded.platform,
           status = excluded.status,
           target_chapters = excluded.target_chapters,
           cover_color = excluded.cover_color,
           tags_json = excluded.tags_json,
           summary = CASE WHEN excluded.summary != '' THEN excluded.summary ELSE books.summary END,
           story_frame = CASE WHEN excluded.story_frame != '' THEN excluded.story_frame ELSE books.story_frame END,
           volume_map = CASE WHEN excluded.volume_map != '' THEN excluded.volume_map ELSE books.volume_map END,
           pending_hooks = CASE WHEN excluded.pending_hooks != '' THEN excluded.pending_hooks ELSE books.pending_hooks END,
           style_guide = CASE WHEN excluded.style_guide != '' THEN excluded.style_guide ELSE books.style_guide END,
           current_state = CASE WHEN excluded.current_state != '' THEN excluded.current_state ELSE books.current_state END,
           chapter_summaries = CASE WHEN excluded.chapter_summaries != '' THEN excluded.chapter_summaries ELSE books.chapter_summaries END,
           updated_at = excluded.updated_at`
      )
        .bind(
          id,
          title,
          String(body.subtitle || ""),
          String(body.author || "InkOS AI"),
          String(body.genre || "都市重生"),
          String(body.platform || "番茄小说"),
          String(body.status || "连载中"),
          Number(body.target_chapters || 50),
          String(body.cover_color || "#8c2d19"),
          typeof body.tags_json === "string" ? body.tags_json : JSON.stringify(body.tags || []),
          String(body.summary || ""),
          String(body.story_frame || ""),
          String(body.volume_map || ""),
          String(body.pending_hooks || ""),
          String(body.style_guide || ""),
          String(body.current_state || ""),
          String(body.chapter_summaries || ""),
          String(body.created_at || now),
          now
        )
        .run();

      if (Array.isArray(body.roles)) {
        const stmts: D1PreparedStatement[] = [];
        for (let i = 0; i < body.roles.length; i++) {
          const r = body.roles[i] as Record<string, unknown>;
          const name = String(r.name || "").trim();
          if (!name) continue;
          stmts.push(
            env.DB.prepare(
              `INSERT INTO roles (book_id, name, category, role_tag, content, sort_order, updated_at)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
               ON CONFLICT(book_id, name) DO UPDATE SET
                 category = excluded.category,
                 role_tag = excluded.role_tag,
                 content = excluded.content,
                 sort_order = excluded.sort_order,
                 updated_at = excluded.updated_at`
            ).bind(
              id,
              name,
              String(r.category || "主要角色"),
              String(r.role_tag || ""),
              String(r.content || ""),
              Number(r.sort_order ?? i),
              now
            )
          );
        }
        if (stmts.length > 0) {
          await env.DB.batch(stmts);
        }
      }

      await recalculateBookStats(env.DB, id);
      return jsonResponse({ ok: true, id });
    }

    // Upsert a chapter
    if (pathname === "/api/sync/chapter" && request.method === "POST") {
      const body = (await request.json()) as Record<string, unknown>;
      const bookId = String(body.book_id || "").trim();
      const chapterNum = Number(body.chapter_num || 0);
      const title = String(body.title || "").trim();
      if (!bookId || !chapterNum || !title) {
        return jsonResponse({ ok: false, error: "book_id, chapter_num, title required" }, 400);
      }
      const content = String(body.content || "");
      const wordCount = Number(body.word_count || content.replace(/\s+/g, "").length);
      const now = new Date().toISOString();

      const volumeNum = Number(
        body.volume_num || (chapterNum <= 18 ? 1 : chapterNum <= 36 ? 2 : 3)
      );
      const volumeTitle = String(
        body.volume_title ||
          (volumeNum === 1
            ? "第一卷：从泥里爬起来"
            : volumeNum === 2
            ? "第二卷：站住脚，被人看见"
            : "第三卷：掀桌子")
      );

      await env.DB.prepare(
        `INSERT INTO chapters (
           book_id, chapter_num, volume_num, volume_title, title, status,
           word_count, content, intent, plan, summary, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
         ON CONFLICT(book_id, chapter_num) DO UPDATE SET
           volume_num = excluded.volume_num,
           volume_title = excluded.volume_title,
           title = excluded.title,
           status = excluded.status,
           word_count = excluded.word_count,
           content = excluded.content,
           intent = CASE WHEN excluded.intent != '' THEN excluded.intent ELSE chapters.intent END,
           plan = CASE WHEN excluded.plan != '' THEN excluded.plan ELSE chapters.plan END,
           summary = CASE WHEN excluded.summary != '' THEN excluded.summary ELSE chapters.summary END,
           updated_at = excluded.updated_at`
      )
        .bind(
          bookId,
          chapterNum,
          volumeNum,
          volumeTitle,
          title,
          String(body.status || "published"),
          wordCount,
          content,
          String(body.intent || ""),
          String(body.plan || ""),
          String(body.summary || ""),
          String(body.created_at || now),
          now
        )
        .run();

      await recalculateBookStats(env.DB, bookId);
      return jsonResponse({ ok: true, book_id: bookId, chapter_num: chapterNum, word_count: wordCount });
    }

    return htmlResponse(renderReaderApp(), 200);
  },
} satisfies ExportedHandler<Env>;
