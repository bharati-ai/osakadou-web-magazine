"use server";

import { redirect } from "next/navigation";
import { revalidateSite } from "@/lib/cms/api";
import { requireUser, type User } from "@/lib/cms/auth";
import { can, canEditPost } from "@/lib/cms/perms";
import { excerptFrom, processHtml } from "@/lib/cms/html";
import { MediaError, listMedia, mediaUrl } from "@/lib/cms/media";
import {
  createPost, deletePost, getPost, listPosts, postUrl, revision, revisionFields, setReviewRequest, toFields, updatePost, validatePost, type Post, type PostFields, type Source,
} from "@/lib/cms/posts";
import { TOOLS } from "@/lib/tools";
import { getL } from "@/lib/cms/lang";
import { cleanPostSeo } from "@/lib/cms/seo";

const FIELD_EN: Record<string, string> = {
  title: "Title", slug: "Slug", excerpt: "Excerpt", content_html: "Body", seo_title: "SEO title", seo_description: "Meta description",
  author: "Author", "cover alt": "Alt text", category: "Category", tags: "Tags", sources: "Sources", status: "Status", external_id: "External ID", seo: "SEO",
};
const FIELD_JA: Record<string, string> = {
  title: "タイトル", slug: "スラッグ", excerpt: "概要", content_html: "本文", seo_title: "SEOタイトル", seo_description: "メタディスクリプション",
  author: "著者", "cover alt": "代替テキスト", category: "カテゴリ", tags: "タグ", sources: "参考・出典", status: "状態", external_id: "外部ID", seo: "SEO",
};

export type SaveState = { ok?: boolean; errors?: string[]; warnings?: string[]; savedAt?: string } | null;

/** "2026-11-05T09:00" typed in the admin is Japan time. */
const jstToIso = (v: string) => (v ? new Date(`${v}:00+09:00`).toISOString() : null);

/** Why this user may not change this post (null = allowed). Without "publish", only drafts can be changed, and only into drafts. */
function editProblem(u: User, L: (ja: string, en: string) => string, p: Pick<Post, "created_by" | "status"> | undefined, nextStatus?: string) {
  if (!p) return can(u, "posts.create") ? null : L("記事を作る権限がありません", "You don’t have permission to create posts");
  if (!canEditPost(u, p)) return L("この記事を編集する権限がありません（自分の記事だけ編集できます）", "You can’t edit this post (you can edit only your own)");
  if (!can(u, "posts.publish") && (p.status !== "draft" || (nextStatus && nextStatus !== "draft")))
    return L("公開・予約・非公開の操作と、公開済みの記事の編集には「公開する」権限が必要です。下書きとして保存し、レビューを依頼してください。", "Publishing, scheduling, unpublishing, or changing a published post needs the Publish permission. Save as a draft and ask for review.");
  return null;
}

export async function savePost(_prev: SaveState, form: FormData): Promise<SaveState> {
  const user = await requireUser();
  const L = await getL();
  const id = Number(form.get("id")) || null;
  const existing = id ? getPost(id) : undefined;
  if (id && !existing) return { errors: [L("記事が見つかりません（削除された可能性があります）", "Post not found (it may have been deleted)")] };
  const problem = editProblem(user, L, existing, String(form.get("status") ?? "draft"));
  if (problem) return { errors: [problem] };
  const s = (k: string) => String(form.get(k) ?? "").trim();
  let sources: Source[] = [];
  try { sources = (JSON.parse(s("sources") || "[]") as Source[]).filter((x) => x.title || x.url); } catch {}

  let processed;
  try {
    processed = await processHtml(String(form.get("content_html") ?? ""), { by: user.email, onImageError: "fail" });
  } catch (e) {
    if (e instanceof MediaError) return { errors: [e.message] };
    throw e;
  }
  const status = (["draft", "published", "archived"].includes(s("status")) ? s("status") : "draft") as PostFields["status"];
  const fields: PostFields = {
    title: s("title"),
    slug: s("slug").toLowerCase(),
    excerpt: s("excerpt") || excerptFrom(processed.text),
    content_html: processed.html,
    cover_src: s("cover_src") || processed.images[0]?.src || null,
    cover_alt: s("cover_src") ? s("cover_alt") : (processed.images[0]?.alt ?? ""),
    category_id: Number(form.get("category_id")) || 0,
    tags: [...new Set(s("tags").split(/[,、\n]/).map((t) => t.trim()).filter(Boolean))],
    sources,
    status,
    author_name: s("author_name"),
    seo_title: s("seo_title"),
    seo_description: s("seo_description"),
    noindex: form.get("noindex") === "on",
    reading_minutes: processed.readingMinutes,
    published_at: jstToIso(s("published_at")) ?? (status === "published" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null)),
    reviewed_at: s("reviewed_at") ? new Date(`${s("reviewed_at")}T09:00:00+09:00`).toISOString() : null,
    external_id: existing?.external_id ?? null,
    seo: (() => { try { return cleanPostSeo(JSON.parse(s("seo") || "{}")); } catch { return {}; } })(),
  };
  // field keys stay English for the API; editors see Japanese names
  const names = L("ja", "en") === "en" ? FIELD_EN : FIELD_JA;
  const errors = validatePost(fields, id ?? undefined).map((e) => e.replace(/^([\w ]+):\s*/, (_, k: string) => `${names[k] ?? k}：`));
  if (errors.length) return { errors, warnings: processed.warnings };
  const note = s("note") || (existing ? L("更新", "Update") : L("作成", "Created"));
  let newId = id;
  if (existing) updatePost(existing.id, fields, user.name, note);
  else newId = createPost(fields, "editor", user.name, user.id);
  // review requests: contributors tick the box; publishing (or an editor unticking it) clears it
  setReviewRequest(newId!, fields.status === "draft" && form.get("review") === "on");
  revalidateSite();
  if (!existing) redirect(`/admin/posts/${newId}?created=1`);
  return { ok: true, warnings: processed.warnings, savedAt: new Date().toISOString() };
}

export async function restoreRevision(form: FormData) {
  const user = await requireUser();
  const L = await getL();
  const rev = revision(Number(form.get("rev")));
  if (!rev) return;
  const post = getPost(rev.post_id);
  if (!post) return;
  const f = revisionFields(rev.data);
  if (editProblem(user, L, post, f.status)) redirect("/admin?denied=1");
  updatePost(post.id, { ...f, external_id: post.external_id }, user.name, L(`版 ${rev.id} に戻す`, `Restore version ${rev.id}`));
  revalidateSite();
  redirect(`/admin/posts/${post.id}?restored=${rev.id}`);
}

export async function deletePostAction(form: FormData) {
  const user = await requireUser("posts.delete");
  const L = await getL();
  const id = Number(form.get("id"));
  if (editProblem(user, L, getPost(id))) redirect("/admin?denied=1");
  if (id) deletePost(id);
  revalidateSite();
  redirect("/admin/posts?deleted=1");
}

export async function duplicatePost(form: FormData) {
  const user = await requireUser("posts.create");
  const p = getPost(Number(form.get("id")));
  if (!p) return;
  const id = createPost({ ...toFields(p), title: `${p.title}（コピー）`, slug: `${p.slug}-copy-${Date.now().toString(36)}`, status: "draft", published_at: null, external_id: null }, "editor", user.name, user.id);
  redirect(`/admin/posts/${id}`);
}

export type LinkHit = { title: string; href: string; kind: string };

/** Internal-link search for the editor: posts, tools and site sections. */
export async function searchLinks(q: string): Promise<LinkHit[]> {
  await requireUser();
  const L = await getL();
  const page = L("ページ", "Page");
  const term = q.trim();
  const posts = listPosts({ q: term || undefined, limit: 12 }).posts.map((p) => ({ title: p.title, href: postUrl(p), kind: p.status === "published" ? L("記事", "Post") : L("記事（未公開）", "Post (unpublished)") }));
  const lc = term.toLowerCase();
  const tools = TOOLS.filter((t) => !term || t.title.toLowerCase().includes(lc) || t.slug.includes(lc)).slice(0, 8).map((t) => ({ title: t.title, href: `/tools/${t.slug}`, kind: L("ツール", "Tool") }));
  const pages = [
    { title: "相談先（休日・夜間の医療相談）", href: "/#unwell", kind: page },
    { title: "大阪の天気と季節カレンダー", href: "/#calendar", kind: page },
    { title: "大阪暮らしスタンプカード", href: "/#checklist", kind: page },
    { title: "読みもの一覧", href: "/blog", kind: page },
    { title: "無料ツール一覧", href: "/tools", kind: page },
  ].filter((p) => !term || p.title.includes(term));
  return [...posts, ...tools, ...pages];
}

export type MediaHit = { src: string; alt: string; width: number; height: number };

export async function mediaLibrary(q: string, page = 1): Promise<MediaHit[]> {
  await requireUser();
  return listMedia({ q, limit: 40, offset: (page - 1) * 40 }).map((m) => ({ src: mediaUrl(m.path), alt: m.alt, width: m.width, height: m.height }));
}
