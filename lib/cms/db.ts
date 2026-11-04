import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { runBootstrap } from "./bootstrap";

// One SQLite file under DATA_DIR (default ./data). Needs a persistent disk: run with `next start` on a VPS or container volume.
export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? path.join(process.cwd(), "data"));
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const NOW = "(strftime('%Y-%m-%dT%H:%M:%fZ','now'))";

const MIGRATIONS = [
  `CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','writer')),
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    last_login_at TEXT
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    expires_at TEXT NOT NULL
  );
  CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    last_used_at TEXT,
    revoked_at TEXT
  );
  CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
  );
  CREATE UNIQUE INDEX categories_slug ON categories(ifnull(parent_id, 0), slug);
  CREATE TABLE media (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    sha256 TEXT NOT NULL UNIQUE,
    mime TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    bytes INTEGER NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    original_name TEXT,
    source_url TEXT,
    created_by TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content_html TEXT NOT NULL DEFAULT '',
    cover_src TEXT,
    cover_alt TEXT NOT NULL DEFAULT '',
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    tags TEXT NOT NULL DEFAULT '[]',
    sources TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
    author_name TEXT NOT NULL DEFAULT '',
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    noindex INTEGER NOT NULL DEFAULT 0,
    reading_minutes INTEGER NOT NULL DEFAULT 1,
    origin TEXT NOT NULL DEFAULT 'editor',
    published_at TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX posts_list ON posts(status, published_at DESC);
  CREATE INDEX posts_category ON posts(category_id);
  CREATE TABLE post_revisions (
    id INTEGER PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX post_revisions_post ON post_revisions(post_id, id DESC);
  CREATE TABLE page_versions (
    page TEXT NOT NULL,
    version INTEGER NOT NULL,
    data TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (page, version)
  );`,
  // 2: longer category descriptions (only rows still holding the original text)
  `UPDATE categories SET description = '大阪で毎日を過ごす人のための読みもの。一人暮らしの始め方、商店街や水辺のまち歩きなど、住む人の目線で大阪の街を紹介します。' WHERE parent_id IS NULL AND slug = 'living' AND description = '大阪の街で毎日をどう過ごすかを、住む人の目線で。';
  UPDATE categories SET description = '休日・夜間の相談窓口、かかりつけ医の探し方、がん検診や特定健診の受け方など、大阪で医療を利用するときの基本を、国や大阪府・大阪市の公式情報をもとにまとめています。' WHERE parent_id IS NULL AND slug = 'health' AND description = '医療機関の探し方や相談先など、公的機関の情報をもとにした医療の基本情報。';
  UPDATE categories SET description = '季節に合わせたスキンケアの習慣、化粧品の成分表示の読み方、美容医療を契約する前の確認点と相談先など、毎日のセルフケアに役立つ基本情報をまとめています。' WHERE parent_id IS NULL AND slug = 'beauty' AND description = 'スキンケアや睡眠など、毎日のセルフケアの基本と、情報の読み方。';
  UPDATE categories SET description = 'だしと粉もんの歴史、銭湯、中之島のミュージアムなど、大阪の暮らしに根づく文化を、住む人の目線で紹介します。' WHERE parent_id IS NULL AND slug = 'culture' AND description = 'だしや粉もん、銭湯、ミュージアム。大阪の暮らしに根づく文化。';
  UPDATE categories SET description = '大阪市のごみの分け方と出し方、引っ越しの手続き、南海トラフ地震への備えなど、大阪で暮らすための実用情報を、公式ページへのリンクとともにまとめています。' WHERE parent_id IS NULL AND slug = 'guide' AND description = 'ごみ、防災、手続き。大阪で暮らすための実用情報を、公式情報へのリンクとともに。';`,
  // 3: SEO center (permission flag, per-post SEO fields, redirects, per-path overrides)
  `ALTER TABLE users ADD COLUMN can_seo INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE posts ADD COLUMN seo TEXT NOT NULL DEFAULT '{}';
  CREATE TABLE redirects (
    id INTEGER PRIMARY KEY,
    source TEXT NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    code INTEGER NOT NULL DEFAULT 301 CHECK (code IN (301, 302, 307, 308)),
    hits INTEGER NOT NULL DEFAULT 0,
    last_hit_at TEXT,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE TABLE seo_overrides (
    path TEXT PRIMARY KEY,
    data TEXT NOT NULL DEFAULT '{}',
    updated_by TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );`,
  // 4: roles & permissions (users rebuilt: the role CHECK changes), post ownership and review requests,
  // page-builder drafts for the live canvas, and an audit log. Old writers keep what they could do (custom permissions).
  `CREATE TABLE users_new (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','editor','seo','author','contributor','viewer')),
    perms TEXT,
    note TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    must_change_password INTEGER NOT NULL DEFAULT 0,
    password_changed_at TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    last_login_at TEXT
  );
  INSERT INTO users_new (id, email, name, role, perms, password_hash, active, created_at, last_login_at)
    SELECT id, email, name, CASE role WHEN 'admin' THEN 'admin' ELSE 'editor' END,
      CASE WHEN role = 'admin' THEN NULL
        WHEN can_seo = 1 THEN '["posts.create","posts.edit_others","posts.publish","posts.delete","categories","media.upload","media.manage","seo"]'
        ELSE '["posts.create","posts.edit_others","posts.publish","posts.delete","categories","media.upload","media.manage"]' END,
      password_hash, active, created_at, last_login_at
    FROM users;
  DROP TABLE users;
  ALTER TABLE users_new RENAME TO users;
  ALTER TABLE posts ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
  ALTER TABLE posts ADD COLUMN review_requested_at TEXT;
  CREATE TABLE page_drafts (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (user_id, page)
  );
  CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL DEFAULT ${NOW},
    actor_id INTEGER,
    actor TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL,
    target_id INTEGER,
    target TEXT NOT NULL DEFAULT '',
    detail TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX audit_log_target ON audit_log(target_id, id DESC);`,
];

// The five magazine themes and their sub-categories (the landing page's 15 series map onto these).
const SEED_CATEGORIES: { slug: string; name: string; description: string; children: [string, string][] }[] = [
  { slug: "living", name: "大阪の暮らし", description: "大阪で毎日を過ごす人のための読みもの。一人暮らしの始め方、商店街や水辺のまち歩きなど、住む人の目線で大阪の街を紹介します。", children: [["hitorigurashi", "一人暮らし"], ["machi-aruki", "まち歩き"], ["mizube", "水辺・公園"]] },
  { slug: "health", name: "健康・医療", description: "休日・夜間の相談窓口、かかりつけ医の探し方、がん検診や特定健診の受け方など、大阪で医療を利用するときの基本を、国や大阪府・大阪市の公式情報をもとにまとめています。", children: [["kakaritsuke", "かかりつけ医・受診"], ["kenshin", "健診・検診"], ["kyukyu", "救急・相談窓口"]] },
  { slug: "beauty", name: "美容・ウェルネス", description: "季節に合わせたスキンケアの習慣、化粧品の成分表示の読み方、美容医療を契約する前の確認点と相談先など、毎日のセルフケアに役立つ基本情報をまとめています。", children: [["seibun", "成分・表示"], ["biyou-iryou", "美容医療と契約"], ["skincare", "スキンケア"]] },
  { slug: "culture", name: "ひと・トレンド・カルチャー", description: "だしと粉もんの歴史、銭湯、中之島のミュージアムなど、大阪の暮らしに根づく文化を、住む人の目線で紹介します。", children: [["food", "食"], ["sento", "銭湯"], ["museum", "ミュージアム"]] },
  { slug: "guide", name: "暮らしのガイド", description: "大阪市のごみの分け方と出し方、引っ越しの手続き、南海トラフ地震への備えなど、大阪で暮らすための実用情報を、公式ページへのリンクとともにまとめています。", children: [["gomi", "ごみ・リサイクル"], ["tetsuzuki", "手続き"], ["bousai", "防災"]] },
];

const g = globalThis as unknown as { __olDb?: DatabaseSync; __olSeeding?: boolean };

export function db(): DatabaseSync {
  if (g.__olDb) return g.__olDb;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const d = new DatabaseSync(path.join(DATA_DIR, "osakadou.db"));
  // busy_timeout first: switching to WAL needs a lock, and parallel build workers must wait for it, not fail
  // foreign keys stay off while migrating (SQLite's table-rebuild procedure; the pragma is a no-op inside a transaction)
  d.exec("PRAGMA busy_timeout=10000; PRAGMA journal_mode=WAL; PRAGMA foreign_keys=OFF; PRAGMA synchronous=NORMAL;");
  tx(d, () => {
    let v = (d.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
    for (; v < MIGRATIONS.length; v++) {
      d.exec(MIGRATIONS[v]);
      d.exec(`PRAGMA user_version=${v + 1}`);
    }
    const broken = d.prepare("PRAGMA foreign_key_check").all();
    if (broken.length) throw new Error(`[cms] migration left broken references: ${JSON.stringify(broken.slice(0, 5))}`);
    if (!d.prepare("SELECT 1 FROM categories LIMIT 1").get()) seedCategories(d);
  });
  d.exec("PRAGMA foreign_keys=ON");
  g.__olDb = d;
  bootstrap(d);
  return d;
}

/** BEGIN IMMEDIATE so parallel build workers serialise migrations and seeding. Re-entrant: nested calls join the outer transaction. */
export function tx<T>(d: DatabaseSync, fn: () => T): T {
  if (d.isTransaction) return fn();
  d.exec("BEGIN IMMEDIATE");
  try {
    const r = fn();
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

function seedCategories(d: DatabaseSync) {
  const ins = d.prepare("INSERT INTO categories (parent_id, slug, name, description, sort) VALUES (?, ?, ?, ?, ?)");
  SEED_CATEGORIES.forEach((c, i) => {
    const parent = Number(ins.run(null, c.slug, c.name, c.description, i).lastInsertRowid);
    c.children.forEach(([slug, name], j) => ins.run(parent, slug, name, "", j));
  });
}

function bootstrap(d: DatabaseSync) {
  if (g.__olSeeding) return;
  g.__olSeeding = true;
  try {
    runBootstrap(d);
  } finally {
    g.__olSeeding = false;
  }
}

export const nowIso = () => new Date().toISOString();
export const json = <T>(s: string | null | undefined, fallback: T): T => {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
};
