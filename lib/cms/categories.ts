import { pick, type L as Tr } from "@/lib/admin-i18n";
import { db } from "./db";

export type Category = { id: number; parent_id: number | null; slug: string; name: string; description: string; sort: number };
export type CategoryNode = Category & { children: Category[]; postCount: number };

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function allCategories() {
  // spread: node:sqlite rows have a null prototype, which React cannot pass to client components
  return (db().prepare("SELECT * FROM categories ORDER BY sort, id").all() as Category[]).map((r) => ({ ...r }));
}

/** Top-level categories with their sub-categories and published post counts (including sub-categories). */
export function categoryTree(opts: { publishedOnly?: boolean } = {}): CategoryNode[] {
  const cats = allCategories();
  const where = opts.publishedOnly ? "WHERE status = 'published' AND published_at <= ?" : "";
  const counts = new Map(
    (db().prepare(`SELECT category_id, count(*) n FROM posts ${where} GROUP BY category_id`).all(...(opts.publishedOnly ? [new Date().toISOString()] : [])) as { category_id: number; n: number }[]).map((r) => [r.category_id, r.n]),
  );
  return cats
    .filter((c) => c.parent_id === null)
    .map((c) => {
      const children = cats.filter((k) => k.parent_id === c.id);
      return { ...c, children, postCount: (counts.get(c.id) ?? 0) + children.reduce((n, k) => n + (counts.get(k.id) ?? 0), 0) };
    });
}

export function categoryById(id: number) {
  return db().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
}

/** Resolve "health" or "health" + "kenshin" to a category row. */
export function categoryByPath(cat: string, sub?: string | null) {
  const parent = db().prepare("SELECT * FROM categories WHERE parent_id IS NULL AND slug = ?").get(cat) as Category | undefined;
  if (!parent || !sub) return parent;
  return db().prepare("SELECT * FROM categories WHERE parent_id = ? AND slug = ?").get(parent.id, sub) as Category | undefined;
}

/** [parent, child] for a category id (child is undefined for a top-level category). */
export function categoryChain(id: number): { parent: Category; child?: Category } | undefined {
  const c = categoryById(id);
  if (!c) return;
  if (c.parent_id === null) return { parent: c };
  const parent = categoryById(c.parent_id);
  return parent && { parent, child: c };
}

export function categoryPath(id: number) {
  const ch = categoryChain(id);
  return ch ? `/blog/category/${ch.parent.slug}${ch.child ? `/${ch.child.slug}` : ""}` : "/blog";
}

/** `L` defaults to Japanese: the public API (app/api/v1) keeps Japanese messages; the admin passes its own. */
export function validateCategory(input: { name?: string; slug?: string; parent_id?: number | null; description?: string }, L: Tr = pick("ja")) {
  const errs: string[] = [];
  if (!input.name?.trim() || input.name.trim().length > 40) errs.push(L("name: 1〜40文字で指定してください", "name: use 1–40 characters"));
  if (!input.slug || !SLUG_RE.test(input.slug) || input.slug.length > 40) errs.push(L("slug: 半角英小文字・数字・ハイフン（40文字まで）で指定してください", "slug: use lowercase letters, numbers, and hyphens (up to 40 characters)"));
  if ((input.description ?? "").length > 300) errs.push(L("description: 300文字までです", "description: up to 300 characters"));
  if (input.parent_id != null) {
    const p = categoryById(input.parent_id);
    if (!p) errs.push(L("parent: 親カテゴリが見つかりません", "parent: parent category not found"));
    else if (p.parent_id !== null) errs.push(L("parent: サブカテゴリの下にはカテゴリを作れません（2階層まで）", "parent: categories can’t be nested under a subcategory (two levels max)"));
  }
  return errs;
}

export function createCategory(input: { name: string; slug: string; parent_id: number | null; description?: string }) {
  const sort = (db().prepare("SELECT ifnull(max(sort), -1) + 1 s FROM categories WHERE ifnull(parent_id, 0) = ifnull(?, 0)").get(input.parent_id) as { s: number }).s;
  return Number(
    db().prepare("INSERT INTO categories (parent_id, slug, name, description, sort) VALUES (?, ?, ?, ?, ?)").run(input.parent_id, input.slug, input.name.trim(), input.description?.trim() ?? "", sort).lastInsertRowid,
  );
}

export function updateCategory(id: number, input: { name: string; slug: string; description?: string; sort?: number }) {
  db().prepare("UPDATE categories SET name = ?, slug = ?, description = ?, sort = coalesce(?, sort) WHERE id = ?").run(input.name.trim(), input.slug, input.description?.trim() ?? "", input.sort ?? null, id);
}

/** Only empty categories (no posts, no sub-categories) can be deleted. */
export function deleteCategory(id: number, L: Tr = pick("ja")) {
  const d = db();
  if (d.prepare("SELECT 1 FROM categories WHERE parent_id = ?").get(id)) return L("サブカテゴリがあるため削除できません", "It has sub-categories, so it can’t be deleted");
  if (d.prepare("SELECT 1 FROM posts WHERE category_id = ?").get(id)) return L("記事があるため削除できません（先に記事のカテゴリを変更してください）", "It has posts, so it can’t be deleted (move those posts to another category first)");
  d.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return null;
}
