CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'InkOS AI',
  genre TEXT NOT NULL DEFAULT '都市重生',
  platform TEXT NOT NULL DEFAULT '番茄小说',
  status TEXT NOT NULL DEFAULT '连载中',
  target_chapters INTEGER NOT NULL DEFAULT 50,
  word_count INTEGER NOT NULL DEFAULT 0,
  chapter_count INTEGER NOT NULL DEFAULT 0,
  latest_chapter_num INTEGER NOT NULL DEFAULT 0,
  latest_chapter_title TEXT NOT NULL DEFAULT '',
  cover_color TEXT NOT NULL DEFAULT '#b45309',
  tags_json TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  story_frame TEXT NOT NULL DEFAULT '',
  volume_map TEXT NOT NULL DEFAULT '',
  pending_hooks TEXT NOT NULL DEFAULT '',
  style_guide TEXT NOT NULL DEFAULT '',
  current_state TEXT NOT NULL DEFAULT '',
  chapter_summaries TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  book_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '主要角色',
  role_tag TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (book_id, name)
);

CREATE TABLE IF NOT EXISTS chapters (
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  volume_num INTEGER NOT NULL DEFAULT 1,
  volume_title TEXT NOT NULL DEFAULT '第一卷',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  word_count INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL DEFAULT '',
  intent TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (book_id, chapter_num)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  book_id TEXT PRIMARY KEY,
  chapter_num INTEGER NOT NULL DEFAULT 1,
  scroll_pct REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id, chapter_num);
CREATE INDEX IF NOT EXISTS idx_roles_book ON roles(book_id, sort_order);
