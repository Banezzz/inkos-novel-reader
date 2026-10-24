#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BOOKS_ROOT = process.env.INKOS_BOOKS_DIR || "/workspace/gz-rebirth-novel/books";
const API_BASE = (process.env.INKOS_READER_URL || "https://inkos-novel-reader.zhangbane.workers.dev").replace(/\/+$/, "");
const SYNC_TOKEN = process.env.INKOS_SYNC_TOKEN || process.env.READER_PASSWORD || "";

function readIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  } catch {}
  return "";
}

async function postJson(endpoint, payload) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SYNC_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} on ${endpoint}: ${text}`);
  }
  return res.json();
}

function collectRoles(storyDir) {
  const rolesDir = path.join(storyDir, "roles");
  const roles = [];
  if (!fs.existsSync(rolesDir)) return roles;

  let order = 0;
  for (const cat of fs.readdirSync(rolesDir)) {
    const catPath = path.join(rolesDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    for (const file of fs.readdirSync(catPath)) {
      if (!file.endsWith(".md")) continue;
      const name = file.replace(/\.md$/, "");
      const content = readIfExists(path.join(catPath, file));
      roles.push({
        name,
        category: cat,
        role_tag: cat === "主要角色" ? "核心人物" : "重要角色",
        content,
        sort_order: cat === "主要角色" ? order++ : 100 + order++,
      });
    }
  }
  return roles;
}

function extractSummary(storyFrame, brief) {
  const src = storyFrame || brief || "";
  const lines = src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith(">"));
  return (lines[0] || "重生回 2008 年广州城中村十五岁少年，激活系统，改写命运与红颜人生。").slice(0, 260);
}

const syncedChapterHashes = new Map();
const syncedBookHashes = new Map();

async function syncAllBooks(force = false) {
  if (!fs.existsSync(BOOKS_ROOT)) return;
  const bookDirs = fs.readdirSync(BOOKS_ROOT);

  for (const dirName of bookDirs) {
    const bookPath = path.join(BOOKS_ROOT, dirName);
    if (!fs.statSync(bookPath).isDirectory()) continue;

    const bookJsonPath = path.join(bookPath, "book.json");
    if (!fs.existsSync(bookJsonPath)) continue;

    let bookMeta = {};
    try {
      bookMeta = JSON.parse(fs.readFileSync(bookJsonPath, "utf8"));
    } catch {
      continue;
    }

    const bookId = bookMeta.id || dirName;
    const storyDir = path.join(bookPath, "story");
    const storyFrame = readIfExists(path.join(storyDir, "outline", "story_frame.md"));
    const volumeMap = readIfExists(path.join(storyDir, "outline", "volume_map.md"));
    const pendingHooks = readIfExists(path.join(storyDir, "pending_hooks.md"));
    const styleGuide = readIfExists(path.join(storyDir, "style_guide.md"));
    const currentState = readIfExists(path.join(storyDir, "current_state.md"));
    const chapterSummaries = readIfExists(path.join(storyDir, "chapter_summaries.md"));
    const brief = readIfExists(path.join(storyDir, "brief.md"));
    const roles = collectRoles(storyDir);

    const bookSignature = JSON.stringify({
      title: bookMeta.title,
      u: bookMeta.updatedAt,
      sf: storyFrame.length,
      vm: volumeMap.length,
      ph: pendingHooks.length,
      cs: currentState.length,
      r: roles.length,
    });

    if (force || syncedBookHashes.get(bookId) !== bookSignature) {
      const payload = {
        id: bookId,
        title: bookMeta.title || bookId,
        subtitle: "2008 羊城城中村 · 红颜气运系统",
        author: "InkOS AI",
        genre: bookMeta.genre === "urban" ? "都市重生" : (bookMeta.genre || "都市重生"),
        platform: bookMeta.platform === "tomato" ? "番茄小说" : (bookMeta.platform || "番茄小说"),
        status: bookMeta.status === "active" ? "连载中" : (bookMeta.status || "连载中"),
        target_chapters: bookMeta.targetChapters || 50,
        cover_color: "#8c2d19",
        tags: ["重生2008", "广州十三行", "系统流", "多女主", "商战逆袭"],
        summary: extractSummary(storyFrame, brief),
        story_frame: storyFrame,
        volume_map: volumeMap,
        pending_hooks: pendingHooks,
        style_guide: styleGuide,
        current_state: currentState,
        chapter_summaries: chapterSummaries,
        created_at: bookMeta.createdAt || new Date().toISOString(),
        roles,
      };
      await postJson("/api/sync/book", payload);
      syncedBookHashes.set(bookId, bookSignature);
      console.log(`[sync] Synced book metadata & ${roles.length} roles for: ${payload.title}`);
    }

    // Sync chapters
    const chaptersDir = path.join(bookPath, "chapters");
    const runtimeDir = path.join(storyDir, "runtime");
    if (!fs.existsSync(chaptersDir)) continue;

    let indexList = [];
    try {
      const idxRaw = readIfExists(path.join(chaptersDir, "index.json"));
      if (idxRaw) indexList = JSON.parse(idxRaw);
    } catch {}
    const indexByNum = new Map(indexList.map((item) => [Number(item.number), item]));

    const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".md")).sort();
    for (const file of files) {
      const match = file.match(/^0*(\d+)_(.+)\.md$/);
      if (!match) continue;
      const chapNum = parseInt(match[1], 10);
      const fileTitle = match[2];
      const fullPath = path.join(chaptersDir, file);
      const content = readIfExists(fullPath);
      if (!content.trim()) continue;

      const padNum = String(chapNum).padStart(4, "0");
      const intent = readIfExists(path.join(runtimeDir, `chapter-${padNum}.intent.md`));
      const plan = readIfExists(path.join(runtimeDir, `chapter-${padNum}.plan.md`));

      const sig = `${content.length}:${intent.length}:${plan.length}`;
      const key = `${bookId}#${chapNum}`;
      if (!force && syncedChapterHashes.get(key) === sig) continue;

      const idxMeta = indexByNum.get(chapNum) || {};
      const volumeNum = chapNum <= 18 ? 1 : chapNum <= 36 ? 2 : 3;
      const volumeTitle =
        volumeNum === 1
          ? "第一卷：从泥里爬起来（第1—18章）"
          : volumeNum === 2
          ? "第二卷：站住脚，被人看见（第19—36章）"
          : "第三卷：掀桌子（第37—50章）";

      await postJson("/api/sync/chapter", {
        book_id: bookId,
        chapter_num: chapNum,
        volume_num: volumeNum,
        volume_title: volumeTitle,
        title: idxMeta.title || fileTitle,
        status: idxMeta.status || "published",
        word_count: idxMeta.wordCount || content.replace(/\s+/g, "").length,
        content,
        intent,
        plan,
        created_at: idxMeta.createdAt || new Date().toISOString(),
      });
      syncedChapterHashes.set(key, sig);
      console.log(`[sync] Synced Chapter ${chapNum}: ${idxMeta.title || fileTitle}`);
    }
  }
}

const isWatch = process.argv.includes("--watch");

async function main() {
  if (!SYNC_TOKEN) {
    throw new Error("Please set INKOS_SYNC_TOKEN environment variable");
  }
  await syncAllBooks(true);
  if (!isWatch) return;
  console.log(`[watcher] Watching ${BOOKS_ROOT} every 10s for new InkOS chapters...`);
  setInterval(async () => {
    try {
      await syncAllBooks(false);
    } catch (err) {
      console.error("[watcher] sync error:", err.message);
    }
  }, 10000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
