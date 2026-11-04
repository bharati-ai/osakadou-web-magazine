// Roles and permissions. Pure data: imported by server code and by admin client components alike.

/** Permissions an admin can grant or remove per user. Users and API keys stay with the admin role. */
export const PERMS = ["posts.create", "posts.edit_others", "posts.publish", "posts.delete", "categories", "media.upload", "media.manage", "pages", "seo"] as const;
export type GrantablePerm = (typeof PERMS)[number];
export type Perm = GrantablePerm | "users" | "api_keys";

export const ROLES = ["admin", "editor", "seo", "author", "contributor", "viewer"] as const;
export type Role = (typeof ROLES)[number];
export const isRole = (s: string): s is Role => (ROLES as readonly string[]).includes(s);

export const ROLE_PERMS: Record<Role, readonly Perm[]> = {
  admin: [...PERMS, "users", "api_keys"],
  editor: ["posts.create", "posts.edit_others", "posts.publish", "posts.delete", "categories", "media.upload", "media.manage", "pages"],
  seo: ["posts.edit_others", "posts.publish", "media.upload", "seo"],
  author: ["posts.create", "posts.publish", "media.upload"],
  contributor: ["posts.create", "media.upload"],
  viewer: [],
};

/** [name ja, name en, description ja, description en] */
export const ROLE_INFO: Record<Role, [string, string, string, string]> = {
  admin: ["管理者", "Administrator", "すべての操作。ユーザーとAPIキーの管理もできます。", "Everything, including users and API keys."],
  editor: ["編集者", "Editor", "すべての記事の編集・公開・削除、カテゴリ、メディア、ページ編集。", "All posts (edit, publish, delete), categories, media and the page builder."],
  seo: ["SEO担当", "SEO specialist", "SEOセンターと、すべての記事の編集・公開（SEO設定の調整用）。", "The SEO center, plus editing and publishing any post (to tune its SEO)."],
  author: ["投稿者", "Author", "自分の記事を書いて公開できます。", "Writes and publishes their own posts."],
  contributor: ["寄稿者", "Contributor", "自分の記事を下書きし、レビューを依頼します（公開はできません）。", "Drafts their own posts and asks for review (cannot publish)."],
  viewer: ["閲覧者", "Viewer", "管理画面の閲覧とプレビューのみ（監修・確認用）。", "Read-only: browse the admin and preview posts (for reviewers)."],
};

export const PERM_INFO: Record<Perm, [string, string, string, string]> = {
  "posts.create": ["記事を書く", "Write posts", "新しい記事を作り、自分の記事を編集する", "Create posts and edit their own"],
  "posts.edit_others": ["他の人の記事を編集", "Edit others’ posts", "API・初期記事を含む、すべての記事を編集する", "Edit every post, including API and seeded ones"],
  "posts.publish": ["公開する", "Publish", "公開・予約・非公開にする。公開中の記事を書き換える", "Publish, schedule, unpublish, and change live posts"],
  "posts.delete": ["記事を削除", "Delete posts", "編集できる記事を完全に削除する", "Permanently delete posts they can edit"],
  categories: ["カテゴリ", "Categories", "カテゴリの追加・編集・削除", "Add, edit and delete categories"],
  "media.upload": ["画像のアップロード", "Upload images", "メディアに画像を追加する", "Add images to the media library"],
  "media.manage": ["メディアの管理", "Manage media", "代替テキストの編集と画像の削除", "Edit alt text and delete images"],
  pages: ["ページ編集", "Page builder", "トップページなどの文言・写真・スライド", "Home page and other page copy, photos and slides"],
  seo: ["SEOセンター", "SEO center", "全体設定・ページ別設定・リダイレクト・監査", "Global settings, per-page settings, redirects, audit"],
  users: ["ユーザー管理", "Users", "ユーザーの追加・権限・無効化", "Add users, set access, deactivate"],
  api_keys: ["APIキー", "API keys", "自動投稿用キーの発行と失効", "Issue and revoke keys for automated posting"],
};

/** Effective permissions: the user's custom list when set, otherwise the role's. Admins always get everything. */
export function permsOf(u: { role: string; perms?: string | null }): Set<Perm> {
  const role: Role = isRole(u.role) ? u.role : "viewer";
  if (role === "admin" || !u.perms) return new Set(ROLE_PERMS[role]);
  try {
    const list = JSON.parse(u.perms) as string[];
    return new Set(PERMS.filter((p) => list.includes(p)));
  } catch {
    return new Set(ROLE_PERMS[role]);
  }
}

export const can = (u: { role: string; perms?: string | null }, p: Perm | "admin") => (p === "admin" ? u.role === "admin" : permsOf(u).has(p));

/** Stored form of a permission choice: null when it equals the role's defaults. */
export function storedPerms(role: Role, chosen: string[]): string | null {
  if (role === "admin") return null;
  const set = PERMS.filter((p) => chosen.includes(p));
  const def = ROLE_PERMS[role];
  return set.length === def.length && set.every((p) => def.includes(p)) ? null : JSON.stringify(set);
}

/** Own posts need "posts.create"; anyone else's (API, seeded, colleagues') need "posts.edit_others". */
export const canEditPost = (u: { id: number; role: string; perms?: string | null }, p: { created_by: number | null }) =>
  can(u, "posts.edit_others") || (can(u, "posts.create") && p.created_by === u.id);
