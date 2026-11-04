import { db, json, nowIso, tx } from "./db";
import { categoryById, categoryPath, SLUG_RE } from "./categories";
import { cleanPostSeo, validatePostSeo, type PostSeo } from "./seo";

export type Source = { title: string; url: string };
export type PostStatus = "draft" | "published" | "archived";
export type PostRow = {
  id: number; slug: string; external_id: string | null; title: string; excerpt: string; content_html: string;
  cover_src: string | null; cover_alt: string; category_id: number; tags: string; sources: string; status: PostStatus;
  author_name: string; seo_title: string; seo_description: string; noindex: number; reading_minutes: number; origin: string;
  published_at: string | null; reviewed_at: string | null; created_at: string; updated_at: string; seo: string;
  /** the admin user who created it (null for API and seeded posts) */
  created_by: number | null;
  /** set while a contributor waits for an editor to review the draft */
  review_requested_at: string | null;
};
export type Post = Omit<PostRow, "tags" | "sources" | "seo"> & { tags: string[]; sources: Source[]; seo: PostSeo };

/** Fields a save can set. content_html must already be processed (lib/cms/html). */
export type PostFields = {
  title: string; slug: string; excerpt: string; content_html: string; cover_src: string | null; cover_alt: string;
  category_id: number; tags: string[]; sources: Source[]; status: PostStatus; author_name: string; seo_title: string;
  seo_description: string; noindex: boolean; reading_minutes: number; published_at: string | null; reviewed_at: string | null;
  external_id: string | null;
  /** advanced SEO: focus keyphrase, canonical, OG overrides, nofollow, schema type, FAQ schema */
  seo: PostSeo;
};
const FIELDS = ["title", "slug", "excerpt", "content_html", "cover_src", "cover_alt", "category_id", "tags", "sources", "status", "author_name", "seo_title", "seo_description", "noindex", "reading_minutes", "published_at", "reviewed_at", "external_id", "seo"] as const;

export const hydrate = (r: PostRow): Post => ({ ...r, tags: json(r.tags, []), sources: json(r.sources, []), seo: cleanPostSeo(json(r.seo, {})) });
export const postUrl = (p: { slug: string }) => `/blog/${p.slug}`;
/** The content's real last change: edits (not seed imports) or a later source re-check. Used for UI, JSON-LD, OG and sitemap. */
export function modifiedAt(p: Pick<Post, "origin" | "updated_at" | "published_at" | "reviewed_at">) {
  const pub = p.published_at ?? p.updated_at;
  const u = p.origin !== "seed" && p.updated_at > pub ? p.updated_at : pub;
  return p.reviewed_at && p.reviewed_at > u ? p.reviewed_at : u;
}

/** Edits and imports linking to a path (used to list related articles on tool pages). */
export function postsLinkingTo(path: string, n = 3) {
  return db()
    .prepare("SELECT slug, title FROM posts WHERE status = 'published' AND published_at <= ? AND content_html LIKE ? ORDER BY published_at DESC LIMIT ?")
    .all(nowIso(), `%href="${path}"%`, n) as { slug: string; title: string }[];
}

export const isLive = (p: Pick<Post, "status" | "published_at">) => p.status === "published" && !!p.published_at && p.published_at <= nowIso();

/** Shared validation for the editor and the API. Returns field-level messages. */
export function validatePost(f: Partial<PostFields>, selfId?: number) {
  const errs: string[] = [];
  const len = (s: string | null | undefined) => (s ?? "").length;
  if (!f.title?.trim() || len(f.title) > 120) errs.push("title: 1〜120文字で指定してください");
  if (!f.slug || !SLUG_RE.test(f.slug) || f.slug.length > 80) errs.push("slug: 半角英小文字・数字・ハイフン（80文字まで）で指定してください");
  else {
    const dup = db().prepare("SELECT id FROM posts WHERE slug = ?").get(f.slug) as { id: number } | undefined;
    if (dup && dup.id !== selfId) errs.push(`slug: 「${f.slug}」はすでに使われています（記事ID ${dup.id}）`);
  }
  if (f.external_id) {
    const dup = db().prepare("SELECT id FROM posts WHERE external_id = ?").get(f.external_id) as { id: number } | undefined;
    if (dup && dup.id !== selfId) errs.push(`external_id: すでに使われています（記事ID ${dup.id}）`);
  }
  if (!f.content_html?.trim()) errs.push("content_html: 本文が空です");
  if (len(f.content_html) > 600_000) errs.push("content_html: 本文が大きすぎます（600KBまで）");
  if (len(f.excerpt) > 300) errs.push("excerpt: 300文字までです");
  if (len(f.seo_title) > 70) errs.push("seo_title: 70文字までです");
  if (len(f.seo_description) > 200) errs.push("seo_description: 200文字までです");
  if (len(f.author_name) > 60) errs.push("author: 60文字までです");
  if (len(f.cover_alt) > 200) errs.push("cover alt: 200文字までです");
  if (!f.category_id || !categoryById(f.category_id)) errs.push("category: カテゴリが見つかりません");
  if ((f.tags ?? []).length > 10 || (f.tags ?? []).some((t) => !t.trim() || t.length > 30)) errs.push("tags: 1〜30文字のタグを10個までです");
  if ((f.sources ?? []).length > 30 || (f.sources ?? []).some((s) => !s.title?.trim() || !/^https?:\/\//.test(s.url ?? ""))) errs.push("sources: title と http(s) の url を持つ項目を30個までです");
  if (f.status && !["draft", "published", "archived"].includes(f.status)) errs.push("status: draft / published / archived のいずれかです");
  if (f.seo) errs.push(...validatePostSeo(f.seo).map((e) => `seo: ${e}`));
  return errs;
}

function row(f: PostFields) {
  return [
    f.title.trim(), f.slug, f.excerpt.trim(), f.content_html, f.cover_src, f.cover_alt.trim(), f.category_id,
    JSON.stringify(f.tags.map((t) => t.trim())), JSON.stringify(f.sources), f.status, f.author_name.trim(), f.seo_title.trim(),
    f.seo_description.trim(), f.noindex ? 1 : 0, f.reading_minutes,
    f.status === "published" ? (f.published_at ?? nowIso()) : f.published_at, f.reviewed_at, f.external_id, JSON.stringify(cleanPostSeo(f.seo)),
  ];
}

function snapshot(id: number, author: string, note: string) {
  const p = db().prepare("SELECT * FROM posts WHERE id = ?").get(id) as PostRow;
  const data = Object.fromEntries(FIELDS.map((k) => [k, p[k as keyof PostRow]]));
  db().prepare("INSERT INTO post_revisions (post_id, data, author, note) VALUES (?, ?, ?, ?)").run(id, JSON.stringify(data), author, note);
}

export function createPost(f: PostFields, origin: "editor" | "api" | "seed", author: string, createdBy: number | null = null) {
  const d = db();
  return tx(d, () => {
    const id = Number(
      d.prepare(`INSERT INTO posts (${FIELDS.join(", ")}, origin) VALUES (${FIELDS.map(() => "?").join(", ")}, ?)`).run(...(row(f) as never[]), origin).lastInsertRowid,
    );
    if (createdBy) d.prepare("UPDATE posts SET created_by = ? WHERE id = ?").run(createdBy, id);
    snapshot(id, author, "作成");
    return id;
  });
}

export function updatePost(id: number, f: PostFields, author: string, note = "更新") {
  const d = db();
  tx(d, () => {
    d.prepare(`UPDATE posts SET ${FIELDS.map((k) => `${k} = ?`).join(", ")}, updated_at = ? WHERE id = ?`).run(...(row(f) as never[]), nowIso(), id);
    snapshot(id, author, note);
  });
}

export function deletePost(id: number) {
  db().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

export function getPost(id: number) {
  const r = db().prepare("SELECT * FROM posts WHERE id = ?").get(id) as PostRow | undefined;
  return r && hydrate(r);
}

/** id, "slug" or external_id (API references). */
export function findPost(ref: string, by: "id" | "slug" | "external_id" = /^\d+$/.test(ref) ? "id" : "slug") {
  const r = db().prepare(`SELECT * FROM posts WHERE ${by} = ?`).get(by === "id" ? Number(ref) : ref) as PostRow | undefined;
  return r && hydrate(r);
}

export function toFields(p: Post): PostFields {
  return {
    title: p.title, slug: p.slug, excerpt: p.excerpt, content_html: p.content_html, cover_src: p.cover_src, cover_alt: p.cover_alt,
    category_id: p.category_id, tags: p.tags, sources: p.sources, status: p.status, author_name: p.author_name, seo_title: p.seo_title,
    seo_description: p.seo_description, noindex: !!p.noindex, reading_minutes: p.reading_minutes, published_at: p.published_at,
    reviewed_at: p.reviewed_at, external_id: p.external_id, seo: p.seo,
  };
}

export function publicPost(slug: string) {
  const r = db().prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= ?").get(slug, nowIso()) as PostRow | undefined;
  return r && hydrate(r);
}

export type ListFilter = { status?: PostStatus | "scheduled" | "live" | "review"; categoryId?: number; tag?: string; q?: string; createdBy?: number; limit?: number; offset?: number };

/** Admin and API listing. "live" = published and due; "scheduled" = published with a future date. */
export function listPosts(f: ListFilter = {}) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  const now = nowIso();
  if (f.status === "live") { where.push("status = 'published' AND published_at <= ?"); args.push(now); }
  else if (f.status === "scheduled") { where.push("status = 'published' AND published_at > ?"); args.push(now); }
  else if (f.status === "review") where.push("status = 'draft' AND review_requested_at IS NOT NULL");
  else if (f.status) { where.push("status = ?"); args.push(f.status); }
  if (f.categoryId) { where.push("(category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?))"); args.push(f.categoryId, f.categoryId); }
  if (f.tag) { where.push("EXISTS (SELECT 1 FROM json_each(posts.tags) WHERE value = ?)"); args.push(f.tag); }
  if (f.createdBy) { where.push("created_by = ?"); args.push(f.createdBy); }
  if (f.q) { where.push("(title LIKE ? OR slug LIKE ? OR excerpt LIKE ?)"); args.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`); }
  const sql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (db().prepare(`SELECT count(*) n FROM posts ${sql}`).get(...args) as { n: number }).n;
  const rows = db()
    .prepare(`SELECT * FROM posts ${sql} ORDER BY coalesce(published_at, updated_at) DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, f.limit ?? 20, f.offset ?? 0) as PostRow[];
  return { total, posts: rows.map(hydrate) };
}

export const livePosts = (f: Omit<ListFilter, "status"> = {}) => listPosts({ ...f, status: "live" });

/** Same sub-category first, then same top category, newest first. */
export function relatedPosts(p: Post, n = 3) {
  const c = categoryById(p.category_id);
  const top = c?.parent_id ?? c?.id ?? 0;
  return (
    db()
      .prepare(
        `SELECT * FROM posts WHERE status = 'published' AND published_at <= ? AND id != ?
         AND (category_id = ? OR category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?))
         ORDER BY (category_id = ?) DESC, published_at DESC LIMIT ?`,
      )
      .all(nowIso(), p.id, p.category_id, top, top, p.category_id, n) as PostRow[]
  ).map(hydrate);
}

export function revisions(postId: number) {
  return db().prepare("SELECT id, author, note, created_at, data FROM post_revisions WHERE post_id = ? ORDER BY id DESC LIMIT 100").all(postId) as {
    id: number; author: string; note: string; created_at: string; data: string;
  }[];
}

export function revision(id: number) {
  return db().prepare("SELECT * FROM post_revisions WHERE id = ?").get(id) as { id: number; post_id: number; data: string; created_at: string } | undefined;
}

export function revisionFields(data: string): PostFields {
  const d = JSON.parse(data);
  return { ...d, tags: json(d.tags, []), sources: json(d.sources, []), noindex: !!d.noindex, seo: cleanPostSeo(json(d.seo, {})) };
}

/** Names of the fields that differ between two revision snapshots. */
export function changedFields(a: string, b?: string) {
  if (!b) return [];
  const x = JSON.parse(a), y = JSON.parse(b);
  return Object.keys(x).filter((k) => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
}

export function postCategoryUrl(p: Post) {
  return categoryPath(p.category_id);
}

/** A contributor asks for review (or withdraws); publishing clears it. */
export function setReviewRequest(id: number, on: boolean) {
  db().prepare("UPDATE posts SET review_requested_at = CASE WHEN ? THEN coalesce(review_requested_at, ?) END WHERE id = ?").run(on ? 1 : 0, nowIso(), id);
}
