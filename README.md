# 墨韵书阁 · InkOS 云端小说阅读器 (Cloudflare Workers + D1)

基于 **Cloudflare Workers + D1 数据库（100% 纯免费额度）** 构建的私享多书籍在线小说阅读与管理系统，专为 [InkOS](https://github.com/Narcooo/inkos) AI 小说创作流水线打造，支持后台写作实时自动上云、多部小说分卷管理、沉浸式阅读体验与服务端密码鉴权。

## 核心特性

1. **服务端密码鉴权（零内容泄露）**
   - 未登录访问任何页面或接口均受服务端拦截，仅返回密码输入页（无任何小说内容或元数据泄露）。
   - 采用 Web Crypto API `SHA-256` 恒定时间比对与 `HMAC-SHA256` 签名 `HttpOnly` 会话 Cookie（有效期 30 天）。
2. **多书籍藏书阁与分卷章节管理**
   - 支持同时管理多部小说，首页展示书籍封面、题材标签、连载状态、字数统计与最新章节。
   - 单书详情页支持四个维度切换：**章节目录（按卷分组）**、**分卷大纲与世界观（`volume_map.md` / `story_frame.md`）**、**角色人物卡（`roles/`）**、**伏笔池与状态追踪（`pending_hooks.md` / `current_state.md`）**。
   - 支持在网页端直接新增书籍或手动上传/编辑章节。
3. **沉浸式中文网文阅读体验**
   - 四种精选阅读配色：**羊皮纸（默认）**、**宣纸白**、**护眼绿**、**夜间暗黑**。
   - 字体切换（宋体 / 楷体 / 黑体）与字号无级缩放（14px–28px）。
   - 支持查看每章 InkOS **写作意图（Intent）与细纲推演（Plan）** 折叠档案。
   - 支持键盘 `⬅` / `➡` 左右方向键快速翻章、悬浮目录抽屉与自动阅读进度记忆。
4. **InkOS 实时自动同步守护进程 (`scripts/sync-books.mjs`)**
   - 自动扫描并监听本地 InkOS `books/` 目录，当新章节、大纲、人物卡或伏笔表落盘时，10 秒内自动通过 Bearer Token 增量推送至 Cloudflare D1 数据库。

## 快速部署（Cloudflare Free 计划）

```bash
npm install

# 1. 创建免费 D1 数据库并初始化表结构
npx wrangler d1 create inkos-novel-reader
npm run db:migrate:remote

# 2. 配置安全密钥（通过 Wrangler Secret 存储，不写入代码库）
npx wrangler secret put READER_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put SYNC_TOKEN

# 3. 部署至 Cloudflare Workers
npm run deploy
```

## 实时同步脚本使用

```bash
# 单次全量同步
INKOS_SYNC_TOKEN="<your-sync-token>" npm run sync

# 启动后台常驻监听守护进程（每 10 秒增量检测新章节自动上传）
INKOS_SYNC_TOKEN="<your-sync-token>" npm run sync:watch
```
