export function renderLoginPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>墨韵书阁 · 私享书架鉴权</title>
  <style>
    :root {
      --bg: #f6f1e7;
      --card: #fdfaf3;
      --border: #e4d9c5;
      --text: #2c241b;
      --muted: #7a6b58;
      --accent: #a8382b;
      --accent-hover: #8d2b20;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #121316;
        --card: #1b1d22;
        --border: #2d3139;
        --text: #e6e1d6;
        --muted: #948e82;
        --accent: #d45547;
        --accent-hover: #e0685a;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      color: var(--text);
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Serif SC", "Noto Serif SC", serif;
      padding: 24px;
      background-image: radial-gradient(circle at 20% 20%, rgba(168, 56, 43, 0.06), transparent 45%),
                        radial-gradient(circle at 80% 80%, rgba(180, 130, 70, 0.08), transparent 50%);
    }
    .login-box {
      width: 100%;
      max-width: 420px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 40px 34px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .seal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: var(--accent);
      color: #fff;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 18px;
      box-shadow: 0 8px 20px rgba(168, 56, 43, 0.28);
      letter-spacing: 1px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 14px;
      color: var(--muted);
      margin-bottom: 28px;
      line-height: 1.6;
    }
    .input-group {
      text-align: left;
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--muted);
    }
    input[type="password"] {
      width: 100%;
      padding: 13px 16px;
      font-size: 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      color: var(--text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input[type="password"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(168, 56, 43, 0.15);
    }
    button {
      width: 100%;
      padding: 13px 18px;
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    button:hover { background: var(--accent-hover); }
    button:active { transform: scale(0.99); }
    .err {
      margin-top: 14px;
      font-size: 13px;
      color: #d93829;
      min-height: 20px;
    }
    .footer-note {
      margin-top: 26px;
      padding-top: 18px;
      border-top: 1px dashed var(--border);
      font-size: 12px;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="login-box">
    <div class="seal">墨韵</div>
    <h1>墨韵书阁 · 私享阅读馆</h1>
    <p class="subtitle">InkOS AI 实时连载书库 · 请输入通行密码开启阅读</p>
    <form id="loginForm">
      <div class="input-group">
        <label for="pwd">阅读通行密码</label>
        <input type="password" id="pwd" name="password" placeholder="请输入阅读密码..." required autofocus autocomplete="current-password" />
      </div>
      <button type="submit" id="submitBtn">验证并进入书架</button>
      <div class="err" id="errMsg"></div>
    </form>
    <div class="footer-note">
      <span>Cloudflare Workers + D1</span>
      <span>服务端加密鉴权</span>
    </div>
  </div>
  <script>
    const form = document.getElementById('loginForm');
    const errMsg = document.getElementById('errMsg');
    const btn = document.getElementById('submitBtn');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errMsg.textContent = '';
      btn.disabled = true;
      btn.textContent = '正在核验密钥...';
      try {
        const password = document.getElementById('pwd').value;
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          window.location.reload();
        } else {
          errMsg.textContent = data.error || '密码不正确，请重试';
          btn.disabled = false;
          btn.textContent = '验证并进入书架';
        }
      } catch (err) {
        errMsg.textContent = '网络请求异常，请稍后重试';
        btn.disabled = false;
        btn.textContent = '验证并进入书架';
      }
    });
  </script>
</body>
</html>`;
}

export function renderReaderApp(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>墨韵书阁 · InkOS 云端小说阅读器</title>
  <style>
    :root, [data-theme="sepia"] {
      --bg: #f4ecd8;
      --bg-elev: #fbf6ea;
      --paper: #f8f1e0;
      --border: #e2d5b8;
      --text: #2b2318;
      --text-secondary: #6e5f49;
      --accent: #a8382b;
      --accent-soft: rgba(168, 56, 43, 0.1);
      --tag-bg: #ebe1c9;
      --shadow: 0 8px 30px rgba(43, 35, 24, 0.07);
    }
    [data-theme="white"] {
      --bg: #f5f6f8;
      --bg-elev: #ffffff;
      --paper: #ffffff;
      --border: #e5e7eb;
      --text: #1f2937;
      --text-secondary: #6b7280;
      --accent: #b91c1c;
      --accent-soft: rgba(185, 28, 28, 0.08);
      --tag-bg: #f3f4f6;
      --shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
    }
    [data-theme="green"] {
      --bg: #dcead6;
      --bg-elev: #e8f3e3;
      --paper: #e4f0df;
      --border: #c5dbc0;
      --text: #1e2d1b;
      --text-secondary: #4e6849;
      --accent: #2c6e31;
      --accent-soft: rgba(44, 110, 49, 0.12);
      --tag-bg: #cfe3c8;
      --shadow: 0 8px 28px rgba(20, 45, 20, 0.07);
    }
    [data-theme="dark"] {
      --bg: #111317;
      --bg-elev: #1a1d24;
      --paper: #171a20;
      --border: #2a2f3a;
      --text: #d8d4cb;
      --text-secondary: #8a8f99;
      --accent: #e05d4f;
      --accent-soft: rgba(224, 93, 79, 0.15);
      --tag-bg: #232832;
      --shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      min-height: 100vh;
      transition: background 0.25s, color 0.25s;
    }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; }

    /* Top Navigation Bar */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--bg-elev);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(10px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.5px;
    }
    .brand-seal {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 13px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .btn-primary {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .btn-primary:hover {
      opacity: 0.92;
      color: #fff;
    }
    .btn-danger {
      color: #dc2626;
      border-color: rgba(220, 38, 38, 0.3);
    }
    .btn-danger:hover {
      background: #dc2626;
      color: #fff;
    }
    .theme-pills {
      display: inline-flex;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px;
      background: var(--bg);
      gap: 2px;
    }
    .theme-dot {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 2px solid transparent;
      cursor: pointer;
      title: "切换主题";
    }
    .theme-dot.active { border-color: var(--accent); }
    .dot-sepia { background: #f4ecd8; }
    .dot-white { background: #ffffff; }
    .dot-green { background: #cce3c4; }
    .dot-dark  { background: #1e222a; }

    /* Container */
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 28px 20px 80px;
    }

    /* Bookshelf Banner & Grid */
    .shelf-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .shelf-title h1 {
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .shelf-title p {
      font-size: 14px;
      color: var(--text-secondary);
    }
    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 20px;
    }
    .book-card {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      gap: 18px;
      box-shadow: var(--shadow);
      transition: transform 0.18s, border-color 0.18s;
      cursor: pointer;
      position: relative;
    }
    .book-card:hover {
      transform: translateY(-3px);
      border-color: var(--accent);
    }
    .book-cover {
      width: 102px;
      height: 142px;
      flex-shrink: 0;
      border-radius: 8px;
      padding: 12px 10px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
      position: relative;
      overflow: hidden;
      font-family: "Songti SC", "Source Han Serif SC", "Noto Serif SC", serif;
    }
    .book-cover::after {
      content: "";
      position: absolute;
      left: 6px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgba(255, 255, 255, 0.22);
    }
    .book-cover-genre {
      font-size: 10px;
      background: rgba(0, 0, 0, 0.28);
      padding: 2px 6px;
      border-radius: 4px;
      align-self: flex-start;
    }
    .book-cover-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.35;
      word-break: break-all;
    }
    .book-cover-author {
      font-size: 10px;
      opacity: 0.85;
    }
    .book-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .book-title {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 6px;
      line-height: 1.35;
    }
    .book-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }
    .tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 99px;
      background: var(--tag-bg);
      color: var(--text-secondary);
      font-weight: 600;
    }
    .tag-accent {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .book-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.55;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .book-meta {
      font-size: 12px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed var(--border);
      padding-top: 8px;
    }

    /* Book Detail View */
    .detail-hero {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      gap: 28px;
      margin-bottom: 24px;
      box-shadow: var(--shadow);
      flex-wrap: wrap;
    }
    .detail-cover {
      width: 140px;
      height: 196px;
      border-radius: 10px;
      padding: 16px 14px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
      font-family: "Songti SC", "Source Han Serif SC", "Noto Serif SC", serif;
      flex-shrink: 0;
    }
    .detail-cover .book-cover-title { font-size: 18px; }
    .detail-main { flex: 1; min-width: 260px; }
    .detail-title {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .detail-stats {
      display: flex;
      gap: 24px;
      margin: 14px 0;
      padding: 12px 16px;
      background: var(--bg);
      border-radius: 10px;
      flex-wrap: wrap;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-val {
      font-size: 18px;
      font-weight: 800;
      color: var(--accent);
    }
    .stat-lbl {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .detail-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 22px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .tab-btn {
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 700;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
    }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* Chapter Directory Grid */
    .volume-section {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 18px;
    }
    .volume-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .volume-title {
      font-size: 16px;
      font-weight: 700;
    }
    .chapter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 10px;
    }
    .chapter-item {
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chapter-item:hover {
      border-color: var(--accent);
      transform: translateX(2px);
    }
    .chapter-item-title {
      font-size: 14px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 10px;
    }
    .chapter-item-meta {
      font-size: 11px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    /* Role Cards */
    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .role-card {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
    }
    .role-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--border);
    }
    .role-name {
      font-size: 18px;
      font-weight: 800;
    }

    /* Markdown Prose Box */
    .prose-box {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 26px;
      line-height: 1.8;
      font-size: 15px;
      overflow-x: auto;
    }
    .prose-box h1, .prose-box h2, .prose-box h3 {
      margin: 18px 0 10px;
      color: var(--accent);
    }
    .prose-box h1:first-child, .prose-box h2:first-child { margin-top: 0; }
    .prose-box p { margin-bottom: 12px; }
    .prose-box ul, .prose-box ol { margin: 8px 0 14px 20px; }
    .prose-box li { margin-bottom: 6px; }
    .prose-box table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 13px;
    }
    .prose-box th, .prose-box td {
      border: 1px solid var(--border);
      padding: 8px 10px;
      text-align: left;
    }
    .prose-box th { background: var(--tag-bg); }

    /* Immersive Chapter Reader */
    .reader-wrap {
      max-width: var(--reader-width, 800px);
      margin: 0 auto;
    }
    .reader-paper {
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 44px 48px;
      box-shadow: var(--shadow);
      min-height: 75vh;
    }
    @media (max-width: 640px) {
      .reader-paper { padding: 26px 20px; }
    }
    .reader-breadcrumb {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .reader-chapter-title {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 12px;
      line-height: 1.35;
      font-family: var(--reader-font, "Songti SC", "Source Han Serif SC", "Noto Serif SC", serif);
    }
    .reader-chapter-meta {
      font-size: 13px;
      color: var(--text-secondary);
      padding-bottom: 22px;
      margin-bottom: 28px;
      border-bottom: 1px dashed var(--border);
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
    }
    .reader-content {
      font-family: var(--reader-font, "Songti SC", "Source Han Serif SC", "Noto Serif SC", serif);
      font-size: var(--reader-size, 19px);
      line-height: var(--reader-lh, 1.95);
      letter-spacing: 0.02em;
    }
    .reader-content p {
      margin-bottom: 1.15em;
      text-indent: 2em;
      text-align: justify;
    }
    .reader-toolbar {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 18px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    .reader-nav-footer {
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .reader-nav-footer .btn {
      flex: 1;
      justify-content: center;
      padding: 13px;
      font-size: 15px;
    }

    /* Drawer & Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 90;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-backdrop.open { display: flex; }
    .modal-panel {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: 16px;
      max-width: 680px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .form-row { margin-bottom: 14px; }
    .form-row label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .form-row input, .form-row textarea, .form-row select {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-family: inherit;
      font-size: 14px;
    }
    .form-row textarea { min-height: 120px; resize: vertical; }
    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 99px;
      background: rgba(22, 163, 74, 0.12);
      color: #16a34a;
      font-weight: 600;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #16a34a;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
  </style>
</head>
<body>
  <header class="navbar">
    <div class="brand" onclick="navigateHome()">
      <span class="brand-seal">墨</span>
      <span>墨韵书阁</span>
      <span class="live-badge" title="InkOS 后台写作自动同步中">
        <span class="live-dot"></span>实时连载同步
      </span>
    </div>
    <div class="nav-actions">
      <div class="theme-pills" title="阅读配色">
        <div class="theme-dot dot-sepia" onclick="setTheme('sepia')" title="羊皮纸"></div>
        <div class="theme-dot dot-white" onclick="setTheme('white')" title="宣纸白"></div>
        <div class="theme-dot dot-green" onclick="setTheme('green')" title="护眼绿"></div>
        <div class="theme-dot dot-dark" onclick="setTheme('dark')" title="夜间模式"></div>
      </div>
      <button class="btn" onclick="openManageModal()">+ 新增/管理书籍</button>
      <button class="btn" onclick="refreshCurrentView()">刷新同步</button>
      <button class="btn" onclick="logout()">退出锁屏</button>
    </div>
  </header>

  <main class="container" id="appRoot">
    <div style="text-align:center;padding:60px 20px;color:var(--text-secondary);">正在加载书架数据...</div>
  </main>

  <!-- 目录抽屉 / 管理弹窗 -->
  <div class="modal-backdrop" id="modalBackdrop" onclick="if(event.target===this)closeModal()">
    <div class="modal-panel" id="modalContent"></div>
  </div>

  <script>
    const state = {
      books: [],
      currentBook: null,
      currentRoles: [],
      currentChapters: [],
      currentTab: 'chapters',
      readingChapter: null,
      theme: localStorage.getItem('inkos_theme') || 'sepia',
      fontSize: parseInt(localStorage.getItem('inkos_fontsize') || '19', 10),
      fontFamily: localStorage.getItem('inkos_font') || 'serif',
      readerWidth: parseInt(localStorage.getItem('inkos_width') || '820', 10),
    };

    function applyPreferences() {
      document.documentElement.setAttribute('data-theme', state.theme);
      document.querySelectorAll('.theme-dot').forEach(el => {
        el.classList.toggle('active', el.classList.contains('dot-' + state.theme));
      });
      const fontMap = {
        serif: '"Songti SC", "Source Han Serif SC", "Noto Serif SC", "STSong", serif',
        kaiti: '"Kaiti SC", "STKaiti", "KaiTi", serif',
        sans: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
      };
      document.documentElement.style.setProperty('--reader-font', fontMap[state.fontFamily] || fontMap.serif);
      document.documentElement.style.setProperty('--reader-size', state.fontSize + 'px');
      document.documentElement.style.setProperty('--reader-width', state.readerWidth + 'px');
    }

    function setTheme(t) {
      state.theme = t;
      localStorage.setItem('inkos_theme', t);
      applyPreferences();
    }

    function setFontSize(delta) {
      state.fontSize = Math.max(14, Math.min(28, state.fontSize + delta));
      localStorage.setItem('inkos_fontsize', String(state.fontSize));
      applyPreferences();
      const label = document.getElementById('fontSizeLabel');
      if (label) label.textContent = state.fontSize + 'px';
    }

    function setFontFamily(f) {
      state.fontFamily = f;
      localStorage.setItem('inkos_font', f);
      applyPreferences();
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function formatTime(iso) {
      if (!iso) return '刚刚';
      try {
        const d = new Date(iso);
        return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      } catch {
        return iso;
      }
    }

    // Simple Markdown renderer for outlines, roles, and hooks
    function renderMarkdown(md) {
      if (!md) return '<p style="color:var(--text-secondary)">暂无内容</p>';
      const lines = String(md).replace(/\\r\\n/g, '\\n').split('\\n');
      let html = '';
      let inTable = false;
      let inList = false;

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();

        if (line.startsWith('|') && line.endsWith('|')) {
          if (inList) { html += '</ul>'; inList = false; }
          const cells = line.slice(1, -1).split('|').map(c => c.trim());
          if (cells.every(c => /^[-:\\s]+$/.test(c))) continue;
          if (!inTable) {
            html += '<table><thead><tr>' + cells.map(c => '<th>' + formatInline(c) + '</th>').join('') + '</tr></thead><tbody>';
            inTable = true;
          } else {
            html += '<tr>' + cells.map(c => '<td>' + formatInline(c) + '</td>').join('') + '</tr>';
          }
          continue;
        } else if (inTable) {
          html += '</tbody></table>';
          inTable = false;
        }

        if (!line) {
          if (inList) { html += '</ul>'; inList = false; }
          continue;
        }
        if (line.startsWith('### ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h3>' + formatInline(line.slice(4)) + '</h3>';
        } else if (line.startsWith('## ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h2>' + formatInline(line.slice(3)) + '</h2>';
        } else if (line.startsWith('# ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h1>' + formatInline(line.slice(2)) + '</h1>';
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          if (!inList) { html += '<ul>'; inList = true; }
          html += '<li>' + formatInline(line.slice(2)) + '</li>';
        } else if (line.startsWith('> ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<blockquote style="border-left:3px solid var(--accent);padding-left:12px;color:var(--text-secondary);margin:10px 0;">' + formatInline(line.slice(2)) + '</blockquote>';
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<p>' + formatInline(line) + '</p>';
        }
      }
      if (inList) html += '</ul>';
      if (inTable) html += '</tbody></table>';
      return html;
    }

    function formatInline(text) {
      return escapeHtml(text)
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\`(.+?)\`/g, '<code style="background:var(--tag-bg);padding:2px 5px;border-radius:4px;">$1</code>');
    }

    async function api(path, opts = {}) {
      const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        ...opts
      });
      if (res.status === 401) {
        window.location.reload();
        throw new Error('Unauthorized');
      }
      return res.json();
    }

    async function navigateHome() {
      location.hash = '';
      await loadBookshelf();
    }

    async function loadBookshelf() {
      const data = await api('/api/books');
      state.books = data.books || [];
      state.currentBook = null;
      state.readingChapter = null;

      const root = document.getElementById('appRoot');
      const totalWords = state.books.reduce((acc, b) => acc + (b.word_count || 0), 0);
      const totalChaps = state.books.reduce((acc, b) => acc + (b.chapter_count || 0), 0);

      root.innerHTML = \`
        <div class="shelf-header">
          <div class="shelf-title">
            <h1>私人藏书阁 (\${state.books.length} 部作品)</h1>
            <p>支持多部小说分卷管理、世界观设定查阅与 InkOS 实时自动连载同步 · 累计 \${(totalWords / 10000).toFixed(2)} 万字 / \${totalChaps} 章</p>
          </div>
        </div>
        <div class="books-grid">
          \${state.books.map(b => {
            let tags = [];
            try { tags = JSON.parse(b.tags_json || '[]'); } catch {}
            const progress = localStorage.getItem('inkos_progress_' + b.id);
            return \`
              <div class="book-card" onclick="openBook('\${escapeHtml(b.id)}')">
                <div class="book-cover" style="background: linear-gradient(145deg, \${escapeHtml(b.cover_color || '#8c2d19')}, #1f1916);">
                  <span class="book-cover-genre">\${escapeHtml(b.genre || '都市重生')}</span>
                  <div class="book-cover-title">\${escapeHtml(b.title)}</div>
                  <div class="book-cover-author">\${escapeHtml(b.author || 'InkOS')} 著</div>
                </div>
                <div class="book-info">
                  <div>
                    <div class="book-title">\${escapeHtml(b.title)}</div>
                    <div class="book-tags">
                      <span class="tag tag-accent">\${escapeHtml(b.status || '连载中')}</span>
                      <span class="tag">\${escapeHtml(b.genre || '都市')}</span>
                      <span class="tag">已更 \${b.chapter_count || 0}/\${b.target_chapters || 50} 章</span>
                      \${tags.slice(0, 2).map(t => \`<span class="tag">\${escapeHtml(t)}</span>\`).join('')}
                    </div>
                    <div class="book-desc">\${escapeHtml(b.summary || '点击查看完整分卷大纲、角色卡与连载正文...')}</div>
                  </div>
                  <div class="book-meta">
                    <span>\${b.latest_chapter_num ? '最新：第' + b.latest_chapter_num + '章 ' + escapeHtml(b.latest_chapter_title) : '大纲已就绪 · 待更正文'}</span>
                    <span>\${((b.word_count || 0) / 10000).toFixed(2)}万字</span>
                  </div>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    async function openBook(bookId, tab) {
      if (tab) state.currentTab = tab;
      location.hash = '#book/' + encodeURIComponent(bookId);
      const data = await api('/api/books/' + encodeURIComponent(bookId));
      state.currentBook = data.book;
      state.currentRoles = data.roles || [];
      state.currentChapters = data.chapters || [];
      state.readingChapter = null;
      renderBookDetail();
    }

    function renderBookDetail() {
      const b = state.currentBook;
      if (!b) return;
      const root = document.getElementById('appRoot');
      const savedChap = parseInt(localStorage.getItem('inkos_progress_' + b.id) || '1', 10);
      const firstOrSaved = state.currentChapters.find(c => c.chapter_num === savedChap)
        ? savedChap
        : (state.currentChapters[0]?.chapter_num || 1);

      let tabContentHtml = '';
      if (state.currentTab === 'chapters') {
        // Group chapters by volume
        const groups = new Map();
        for (const ch of state.currentChapters) {
          const vKey = ch.volume_title || '正文卷';
          if (!groups.has(vKey)) groups.set(vKey, []);
          groups.get(vKey).push(ch);
        }
        if (state.currentChapters.length === 0) {
          tabContentHtml = \`<div class="prose-box"><p>InkOS 正在后台撰写章节，写完后会自动推送至此处，无需手动干预。</p></div>\`;
        } else {
          for (const [vTitle, chList] of groups.entries()) {
            tabContentHtml += \`
              <div class="volume-section">
                <div class="volume-header">
                  <span class="volume-title">\${escapeHtml(vTitle)} （共 \${chList.length} 章）</span>
                  <button class="btn" onclick="openAddChapterModal('\${escapeHtml(b.id)}')">+ 手动添加/上传章节</button>
                </div>
                <div class="chapter-grid">
                  \${chList.map(c => \`
                    <div class="chapter-item" onclick="openChapter('\${escapeHtml(b.id)}', \${c.chapter_num})">
                      <span class="chapter-item-title">第\${c.chapter_num}章 \${escapeHtml(c.title)}</span>
                      <span class="chapter-item-meta">\${c.word_count || 0}字</span>
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`;
          }
        }
      } else if (state.currentTab === 'outline') {
        tabContentHtml = \`
          <div class="prose-box" style="margin-bottom:20px;">
            <h2>一、全书分卷大纲与节奏规划 (volume_map.md)</h2>
            \${renderMarkdown(b.volume_map)}
          </div>
          <div class="prose-box">
            <h2>二、故事主框架与世界观铁律 (story_frame.md)</h2>
            \${renderMarkdown(b.story_frame)}
          </div>
        \`;
      } else if (state.currentTab === 'roles') {
        tabContentHtml = \`
          <div class="roles-grid">
            \${state.currentRoles.map(r => \`
              <div class="role-card">
                <div class="role-head">
                  <span class="role-name">\${escapeHtml(r.name)}</span>
                  <span class="tag tag-accent">\${escapeHtml(r.category)}</span>
                </div>
                <div style="font-size:14px;line-height:1.75;">
                  \${renderMarkdown(r.content)}
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (state.currentTab === 'hooks') {
        tabContentHtml = \`
          <div class="prose-box" style="margin-bottom:20px;">
            <h2>伏笔池与回收追踪 (pending_hooks.md)</h2>
            \${renderMarkdown(b.pending_hooks)}
          </div>
          \${b.current_state ? \`
            <div class="prose-box" style="margin-bottom:20px;">
              <h2>当前世界状态快照 (current_state.md)</h2>
              \${renderMarkdown(b.current_state)}
            </div>
          \` : ''}
          \${b.style_guide ? \`
            <div class="prose-box">
              <h2>文风与叙事规范 (style_guide.md)</h2>
              \${renderMarkdown(b.style_guide)}
            </div>
          \` : ''}
        \`;
      }

      root.innerHTML = \`
        <div style="margin-bottom:14px;">
          <button class="btn" onclick="navigateHome()">← 返回私人藏书阁</button>
        </div>
        <div class="detail-hero">
          <div class="detail-cover" style="background: linear-gradient(145deg, \${escapeHtml(b.cover_color || '#8c2d19')}, #1f1916);">
            <span class="book-cover-genre">\${escapeHtml(b.genre)}</span>
            <div class="book-cover-title">\${escapeHtml(b.title)}</div>
            <div class="book-cover-author">\${escapeHtml(b.author)} 著</div>
          </div>
          <div class="detail-main">
            <div class="detail-title">\${escapeHtml(b.title)}</div>
            <div class="book-tags">
              <span class="tag tag-accent">\${escapeHtml(b.status)}</span>
              <span class="tag">目标 \${b.target_chapters} 章</span>
              <span class="tag">最近同步：\${formatTime(b.updated_at)}</span>
            </div>
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-top:10px;">
              \${escapeHtml(b.summary)}
            </p>
            <div class="detail-stats">
              <div class="stat-item">
                <span class="stat-val">\${b.chapter_count || 0} / \${b.target_chapters || 50}</span>
                <span class="stat-lbl">已更章节 / 规划总章</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">\${((b.word_count || 0) / 10000).toFixed(2)} 万字</span>
                <span class="stat-lbl">已生成正文字数</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">\${state.currentRoles.length} 位</span>
                <span class="stat-lbl">建档人物卡</span>
              </div>
            </div>
            <div class="detail-actions">
              \${state.currentChapters.length > 0 ? \`
                <button class="btn btn-primary" onclick="openChapter('\${escapeHtml(b.id)}', \${firstOrSaved})">
                  立即阅读（第 \${firstOrSaved} 章）
                </button>
              \` : ''}
              <button class="btn" onclick="switchBookTab('outline')">查阅 50 章大纲</button>
              <button class="btn" onclick="switchBookTab('roles')">人物关系档案 (\${state.currentRoles.length})</button>
              <button class="btn" onclick="openAddChapterModal('\${escapeHtml(b.id)}')">+ 上传章节</button>
            </div>
          </div>
        </div>

        <div class="tabs">
          <button class="tab-btn \${state.currentTab === 'chapters' ? 'active' : ''}" onclick="switchBookTab('chapters')">
            章节目录 (\${state.currentChapters.length})
          </button>
          <button class="tab-btn \${state.currentTab === 'outline' ? 'active' : ''}" onclick="switchBookTab('outline')">
            分卷大纲与世界观
          </button>
          <button class="tab-btn \${state.currentTab === 'roles' ? 'active' : ''}" onclick="switchBookTab('roles')">
            角色人物卡 (\${state.currentRoles.length})
          </button>
          <button class="tab-btn \${state.currentTab === 'hooks' ? 'active' : ''}" onclick="switchBookTab('hooks')">
            伏笔池与状态追踪
          </button>
        </div>

        <div id="tabBody">\${tabContentHtml}</div>
      \`;
    }

    function switchBookTab(t) {
      state.currentTab = t;
      renderBookDetail();
    }

    async function openChapter(bookId, chapterNum) {
      location.hash = '#read/' + encodeURIComponent(bookId) + '/' + chapterNum;
      const data = await api('/api/books/' + encodeURIComponent(bookId) + '/chapters/' + chapterNum);
      state.readingChapter = data.chapter;
      state.currentBook = data.book;
      state.currentChapters = data.allChapters || state.currentChapters;
      localStorage.setItem('inkos_progress_' + bookId, String(chapterNum));
      renderChapterReader();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderChapterReader() {
      const ch = state.readingChapter;
      const b = state.currentBook;
      if (!ch || !b) return;

      const paragraphs = String(ch.content || '')
        .replace(/\\r\\n/g, '\\n')
        .split('\\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('# '))
        .map(line => '<p>' + formatInline(line) + '</p>')
        .join('');

      const hasPrev = ch.prev_num !== null && ch.prev_num !== undefined;
      const hasNext = ch.next_num !== null && ch.next_num !== undefined;

      const root = document.getElementById('appRoot');
      root.innerHTML = \`
        <div class="reader-wrap">
          <div class="reader-toolbar">
            <div class="toolbar-group">
              <button class="btn" onclick="openBook('\${escapeHtml(b.id)}', 'chapters')">← 返回书页</button>
              <button class="btn" onclick="openDirectoryDrawer()">目录 (\${state.currentChapters.length}章)</button>
            </div>
            <div class="toolbar-group">
              <span>字体：</span>
              <button class="btn" onclick="setFontFamily('serif')">宋体</button>
              <button class="btn" onclick="setFontFamily('kaiti')">楷体</button>
              <button class="btn" onclick="setFontFamily('sans')">黑体</button>
              <span style="margin-left:6px;">字号：</span>
              <button class="btn" onclick="setFontSize(-1)">A-</button>
              <span id="fontSizeLabel" style="min-width:36px;text-align:center;font-weight:700;">\${state.fontSize}px</span>
              <button class="btn" onclick="setFontSize(1)">A+</button>
            </div>
          </div>

          <article class="reader-paper">
            <div class="reader-breadcrumb">
              <span>《\${escapeHtml(b.title)}》 · \${escapeHtml(ch.volume_title || '正文卷')}</span>
              <span>进度：第 \${ch.chapter_num} / \${b.target_chapters || 50} 章</span>
            </div>
            <h1 class="reader-chapter-title">第\${ch.chapter_num}章 \${escapeHtml(ch.title)}</h1>
            <div class="reader-chapter-meta">
              <span>本章字数：\${ch.word_count || 0} 字</span>
              <span>更新时间：\${formatTime(ch.updated_at)}</span>
              <span>键盘左右键 ⬅ ➡ 可快速翻章</span>
            </div>
            <div class="reader-content">
              \${paragraphs || '<p>本章正文正在生成中...</p>'}
            </div>

            \${ch.intent || ch.plan ? \`
              <details style="margin-top:32px;padding:14px 18px;border:1px dashed var(--border);border-radius:10px;font-size:13px;color:var(--text-secondary);">
                <summary style="cursor:pointer;font-weight:700;">查看本章写作意图与细纲推演 (InkOS 创作档案)</summary>
                <div style="margin-top:12px;">
                  \${ch.intent ? '<h4>【章节意图】</h4>' + renderMarkdown(ch.intent) : ''}
                  \${ch.plan ? '<h4 style="margin-top:12px;">【细纲推演】</h4>' + renderMarkdown(ch.plan) : ''}
                </div>
              </details>
            \` : ''}

            <div class="reader-nav-footer">
              <button class="btn" \${hasPrev ? \`onclick="openChapter('\${escapeHtml(b.id)}', \${ch.prev_num})"\` : 'disabled style="opacity:0.4;cursor:not-allowed;"'}>
                ← 上一章
              </button>
              <button class="btn" onclick="openDirectoryDrawer()">
                章节目录
              </button>
              <button class="btn btn-primary" \${hasNext ? \`onclick="openChapter('\${escapeHtml(b.id)}', \${ch.next_num})"\` : 'disabled style="opacity:0.4;cursor:not-allowed;"'}>
                \${hasNext ? '下一章 →' : '已追至最新章（后台写作中）'}
              </button>
            </div>
          </article>
        </div>
      \`;
    }

    function openDirectoryDrawer() {
      const b = state.currentBook;
      if (!b) return;
      const modal = document.getElementById('modalContent');
      modal.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>《\${escapeHtml(b.title)}》章节目录</h3>
          <button class="btn" onclick="closeModal()">关闭</button>
        </div>
        <div class="chapter-grid">
          \${state.currentChapters.map(c => \`
            <div class="chapter-item" style="\${state.readingChapter?.chapter_num === c.chapter_num ? 'border-color:var(--accent);font-weight:700;' : ''}"
                 onclick="closeModal();openChapter('\${escapeHtml(b.id)}', \${c.chapter_num})">
              <span class="chapter-item-title">第\${c.chapter_num}章 \${escapeHtml(c.title)}</span>
              <span class="chapter-item-meta">\${c.word_count || 0}字</span>
            </div>
          \`).join('')}
        </div>
      \`;
      document.getElementById('modalBackdrop').classList.add('open');
    }

    function openManageModal() {
      const modal = document.getElementById('modalContent');
      modal.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>新增作品 / 书库管理</h3>
          <button class="btn" onclick="closeModal()">关闭</button>
        </div>
        <form onsubmit="submitNewBook(event)">
          <div class="form-row">
            <label>书名</label>
            <input id="mb_title" required placeholder="例如：重生羊城十五岁：从城中村少年到巅峰人生" />
          </div>
          <div class="form-row">
            <label>书籍 ID（英文或中文标识，唯一）</label>
            <input id="mb_id" required placeholder="例如：my-second-novel" />
          </div>
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label>题材分类</label>
              <input id="mb_genre" value="都市重生" />
            </div>
            <div>
              <label>目标章数</label>
              <input id="mb_target" type="number" value="50" />
            </div>
          </div>
          <div class="form-row">
            <label>作品简介</label>
            <textarea id="mb_summary" placeholder="输入核心故事梗概..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">保存至云端书架</button>
        </form>
      \`;
      document.getElementById('modalBackdrop').classList.add('open');
    }

    async function submitNewBook(e) {
      e.preventDefault();
      const payload = {
        id: document.getElementById('mb_id').value.trim(),
        title: document.getElementById('mb_title').value.trim(),
        genre: document.getElementById('mb_genre').value.trim(),
        target_chapters: parseInt(document.getElementById('mb_target').value || '50', 10),
        summary: document.getElementById('mb_summary').value.trim(),
      };
      await api('/api/sync/book', { method: 'POST', body: JSON.stringify(payload) });
      closeModal();
      await loadBookshelf();
    }

    function openAddChapterModal(bookId) {
      const nextNum = (state.currentChapters[state.currentChapters.length - 1]?.chapter_num || 0) + 1;
      const modal = document.getElementById('modalContent');
      modal.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>上传/编辑章节</h3>
          <button class="btn" onclick="closeModal()">关闭</button>
        </div>
        <form onsubmit="submitNewChapter(event, '\${escapeHtml(bookId)}')">
          <div class="form-row" style="display:grid;grid-template-columns:120px 1fr;gap:10px;">
            <div>
              <label>章节序号</label>
              <input id="mc_num" type="number" required value="\${nextNum}" />
            </div>
            <div>
              <label>章节标题（不含“第X章”）</label>
              <input id="mc_title" required placeholder="例如：十三行的第一桶金" />
            </div>
          </div>
          <div class="form-row">
            <label>所属分卷名称</label>
            <input id="mc_vol" value="第一卷：从泥里爬起来" />
          </div>
          <div class="form-row">
            <label>章节正文</label>
            <textarea id="mc_content" style="min-height:240px;" required placeholder="粘贴或输入章节正文..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">保存并发布章节</button>
        </form>
      \`;
      document.getElementById('modalBackdrop').classList.add('open');
    }

    async function submitNewChapter(e, bookId) {
      e.preventDefault();
      const content = document.getElementById('mc_content').value;
      const payload = {
        book_id: bookId,
        chapter_num: parseInt(document.getElementById('mc_num').value, 10),
        title: document.getElementById('mc_title').value.trim(),
        volume_title: document.getElementById('mc_vol').value.trim(),
        content,
        word_count: content.replace(/\\s+/g, '').length,
      };
      await api('/api/sync/chapter', { method: 'POST', body: JSON.stringify(payload) });
      closeModal();
      await openBook(bookId, 'chapters');
    }

    function closeModal() {
      document.getElementById('modalBackdrop').classList.remove('open');
    }

    async function refreshCurrentView() {
      await routeByHash();
    }

    async function logout() {
      await fetch('/api/logout', { method: 'POST' });
      window.location.reload();
    }

    async function routeByHash() {
      const h = location.hash || '';
      if (h.startsWith('#read/')) {
        const parts = h.slice(6).split('/');
        const bookId = decodeURIComponent(parts[0] || '');
        const chapNum = parseInt(parts[1] || '1', 10);
        if (bookId && chapNum) {
          await openChapter(bookId, chapNum);
          return;
        }
      }
      if (h.startsWith('#book/')) {
        const bookId = decodeURIComponent(h.slice(6));
        if (bookId) {
          await openBook(bookId);
          return;
        }
      }
      await loadBookshelf();
    }

    window.addEventListener('keydown', (e) => {
      if (!state.readingChapter || !state.currentBook) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft' && state.readingChapter.prev_num) {
        openChapter(state.currentBook.id, state.readingChapter.prev_num);
      } else if (e.key === 'ArrowRight' && state.readingChapter.next_num) {
        openChapter(state.currentBook.id, state.readingChapter.next_num);
      }
    });

    applyPreferences();
    routeByHash();
  </script>
</body>
</html>`;
}
