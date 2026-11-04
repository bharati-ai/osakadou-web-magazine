import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { SITE } from "@/lib/site";
import { sha256 } from "./auth";
import { categoryById, categoryByPath, categoryTree, type Category } from "./categories";
import { db, nowIso } from "./db";
import { excerptFrom, processHtml, resolveLocal } from "./html";
import { ingestImage, MediaError, mediaUrl } from "./media";
import { isLive, postUrl, type Post, type PostFields, type PostStatus, type Source } from "./posts";
import { cleanPostSeo } from "./seo";

export const API_VERSION = "1.0";
export type ApiKey = { id: number; name: string; prefix: string; created_at: string; last_used_at: string | null; revoked_at: string | null };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export function errorResponse(e: unknown) {
  if (e instanceof ApiError) return Response.json({ error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } }, { status: e.status });
  if (e instanceof MediaError) return Response.json({ error: { code: "image_error", message: e.message } }, { status: 422 });
  console.error("[api]", e);
  return Response.json({ error: { code: "internal", message: "サーバーエラーが発生しました" } }, { status: 500 });
}

// --- keys
export function newApiKey(name: string, userId: number) {
  const key = `odk_${crypto.randomBytes(32).toString("base64url")}`;
  db().prepare("INSERT INTO api_keys (name, prefix, key_hash, created_by) VALUES (?, ?, ?, ?)").run(name.trim(), key.slice(0, 12), sha256(key), userId);
  return key; // shown once; only the hash is stored
}

// ponytail: per-process fixed-window limit; use a shared store if you scale to several instances.
const hits = new Map<number, { n: number; t: number }>();
const PER_MIN = 120;

/** Bearer-key auth for /api/v1. Throws ApiError. */
export function authenticate(req: Request): ApiKey {
  const m = /^Bearer\s+(odk_[A-Za-z0-9_-]{20,})$/.exec(req.headers.get("authorization") ?? "");
  if (!m) throw new ApiError(401, "unauthorized", "Authorization: Bearer <APIキー> ヘッダーが必要です");
  const key = db().prepare("SELECT id, name, prefix, created_at, last_used_at, revoked_at FROM api_keys WHERE key_hash = ?").get(sha256(m[1])) as ApiKey | undefined;
  if (!key || key.revoked_at) throw new ApiError(401, "unauthorized", "APIキーが無効です");
  const now = Date.now();
  const h = hits.get(key.id);
  if (h && now - h.t < 60_000) {
    if (++h.n > PER_MIN) throw new ApiError(429, "rate_limited", `リクエストが多すぎます（1分あたり${PER_MIN}回まで）`);
  } else hits.set(key.id, { n: 1, t: now });
  db().prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(nowIso(), key.id);
  return key;
}

export async function readJson(req: Request, maxBytes = 25 * 1024 * 1024): Promise<Record<string, unknown>> {
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) throw new ApiError(415, "unsupported_media_type", "Content-Type: application/json で送ってください");
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) throw new ApiError(413, "payload_too_large", `リクエストが大きすぎます（${maxBytes / 1024 / 1024}MBまで）`);
  const text = await req.text();
  if (text.length > maxBytes) throw new ApiError(413, "payload_too_large", `リクエストが大きすぎます（${maxBytes / 1024 / 1024}MBまで）`);
  try {
    const v = JSON.parse(text);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v;
  } catch {
    throw new ApiError(400, "bad_request", "JSON オブジェクトとして読めません");
  }
}

/** Purge cached public pages after a write (home lists series links, /blog lists posts, sitemap, feed). */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

// --- serialisation
export function categoryOut(c: Category | undefined) {
  if (!c) return null;
  const parent = c.parent_id ? categoryById(c.parent_id) : undefined;
  return { id: c.id, slug: c.slug, name: c.name, parent: parent ? { id: parent.id, slug: parent.slug, name: parent.name } : null, path: parent ? `${parent.slug}/${c.slug}` : c.slug };
}

export const abs = (p: string | null) => (p && p.startsWith("/") ? `${SITE.url}${p}` : p);

export function postOut(p: Post, withContent = true) {
  return {
    id: p.id, slug: p.slug, url: abs(postUrl(p)), status: p.status, live: isLive(p),
    scheduled: p.status === "published" && !isLive(p),
    title: p.title, excerpt: p.excerpt, ...(withContent ? { content_html: p.content_html } : {}),
    cover_image: p.cover_src ? { src: p.cover_src, url: abs(p.cover_src), alt: p.cover_alt } : null,
    category: categoryOut(categoryById(p.category_id)), tags: p.tags, sources: p.sources, author: p.author_name,
    seo_title: p.seo_title, seo_description: p.seo_description, noindex: !!p.noindex, reading_minutes: p.reading_minutes,
    seo: { focus_keyphrase: p.seo.focusKeyphrase ?? null, canonical: p.seo.canonical ?? null, og_title: p.seo.ogTitle ?? null, og_description: p.seo.ogDescription ?? null, og_image: p.seo.ogImage ?? null, nofollow: !!p.seo.nofollow, schema_type: p.seo.schemaType ?? "BlogPosting", faq_schema: p.seo.faqSchema !== false },
    external_id: p.external_id, origin: p.origin, published_at: p.published_at, reviewed_at: p.reviewed_at, created_at: p.created_at, updated_at: p.updated_at,
  };
}

// --- input → PostFields (shared by create and update)
const str = (v: unknown, field: string, errs: string[]) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") { errs.push(`${field}: 文字列で指定してください`); return undefined; }
  return v;
};

function isoDate(v: unknown, field: string, errs: string[]) {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const d = typeof v === "string" ? new Date(v) : null;
  if (!d || isNaN(d.getTime())) { errs.push(`${field}: ISO 8601 形式の日時で指定してください（例 2026-11-01T09:00:00+09:00）`); return undefined; }
  return d.toISOString();
}

export async function postFieldsFromInput(body: Record<string, unknown>, base: PostFields | null, actor: string) {
  const errs: string[] = [];
  const warnings: string[] = [];
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);
  const f: PostFields = base
    ? { ...base }
    : {
        title: "", slug: "", excerpt: "", content_html: "", cover_src: null, cover_alt: "", category_id: 0, tags: [], sources: [], status: "draft",
        author_name: SITE.editors, seo_title: "", seo_description: "", noindex: false, reading_minutes: 1, published_at: null, reviewed_at: null, external_id: null, seo: {},
      };

  for (const k of ["title", "slug", "excerpt", "seo_title", "seo_description"] as const) {
    const v = str(body[k], k, errs);
    if (v !== undefined) f[k] = v.trim();
  }
  const author = str(body.author, "author", errs);
  if (author !== undefined) f.author_name = author.trim();
  if (has("external_id")) f.external_id = (str(body.external_id, "external_id", errs) ?? "").trim().slice(0, 100) || null;
  if (has("noindex")) f.noindex = body.noindex === true;
  // advanced SEO (snake_case in the API, camelCase in storage); only the keys sent are changed
  if (has("seo")) {
    const i = (body.seo && typeof body.seo === "object" ? body.seo : {}) as Record<string, unknown>;
    const map: Record<string, string> = { focus_keyphrase: "focusKeyphrase", canonical: "canonical", og_title: "ogTitle", og_description: "ogDescription", og_image: "ogImage", nofollow: "nofollow", schema_type: "schemaType", faq_schema: "faqSchema" };
    const next: Record<string, unknown> = { ...f.seo };
    for (const [k, v] of Object.entries(i)) if (map[k]) next[map[k]] = v === null ? undefined : v;
    f.seo = cleanPostSeo(next);
  }
  if (has("status")) {
    const s = body.status;
    if (s !== "draft" && s !== "published" && s !== "archived") errs.push("status: draft / published / archived のいずれかです");
    else f.status = s as PostStatus;
  }
  const pub = isoDate(body.published_at, "published_at", errs);
  if (pub !== undefined) f.published_at = pub;
  const rev = isoDate(body.reviewed_at, "reviewed_at", errs);
  if (rev !== undefined) f.reviewed_at = rev;

  if (has("tags")) {
    if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== "string")) errs.push("tags: 文字列の配列で指定してください");
    else f.tags = [...new Set((body.tags as string[]).map((t) => t.trim()).filter(Boolean))];
  }
  if (has("sources")) {
    if (!Array.isArray(body.sources)) errs.push("sources: [{ title, url }] の配列で指定してください");
    else f.sources = (body.sources as Source[]).map((s) => ({ title: String(s?.title ?? "").trim(), url: String(s?.url ?? "").trim() }));
  }

  // category: "category" (+ optional "subcategory") slugs, "category_path" ("health/kenshin") or "category_id"
  if (has("category") || has("category_path") || has("category_id")) {
    let cat: Category | undefined;
    if (typeof body.category_id === "number") cat = categoryById(body.category_id);
    else {
      const [c, s] = typeof body.category_path === "string" ? body.category_path.split("/") : [body.category, body.subcategory];
      if (typeof c === "string") cat = categoryByPath(c, typeof s === "string" && s ? s : null);
    }
    if (!cat) {
      const known = categoryTree().map((c) => `${c.slug}[${c.children.map((k) => k.slug).join(",")}]`).join(" ");
      errs.push(`category: 見つかりません。使えるカテゴリ: ${known}`);
    } else f.category_id = cat.id;
  }

  const onImageError = body.on_image_error === "drop" ? "drop" : "fail";
  let bodyText = "";
  if (has("content_html")) {
    const raw = str(body.content_html, "content_html", errs) ?? "";
    if (raw.length > 2_000_000) errs.push("content_html: 2MB までです（画像は data URI より URL で送ってください）");
    else if (raw.trim()) {
      const r = await processHtml(raw, { by: actor, onImageError });
      f.content_html = r.html;
      f.reading_minutes = r.readingMinutes;
      bodyText = r.text;
      warnings.push(...r.warnings);
      if (!f.cover_src && r.images[0] && !has("cover_image")) {
        f.cover_src = r.images[0].src;
        f.cover_alt = r.images[0].alt;
        warnings.push("cover_image がないため、本文の最初の画像をアイキャッチにしました");
      }
    } else f.content_html = "";
  }
  if (has("cover_image")) {
    const c = body.cover_image as { url?: unknown; data?: unknown; src?: unknown; alt?: unknown } | null;
    if (c === null) { f.cover_src = null; f.cover_alt = ""; }
    else if (typeof c !== "object") errs.push("cover_image: { url | data | src, alt } で指定してください");
    else {
      const alt = typeof c.alt === "string" ? c.alt.trim() : "";
      const src = [c.src, c.url, c.data].find((v) => typeof v === "string") as string | undefined;
      if (!src) errs.push("cover_image: url（https）、data（data URI）、または src（/media/… /photos/…）が必要です");
      else {
        const local = resolveLocal(src);
        if (local) f.cover_src = local.src;
        else {
          try { f.cover_src = mediaUrl((await ingestImage(src, { alt, by: actor })).path); }
          catch (e) {
            if (onImageError === "fail") throw e;
            warnings.push(`cover_image を取り込めませんでした — ${(e as Error).message}`);
          }
        }
        f.cover_alt = alt;
        if (!alt) warnings.push("cover_image.alt が空です（画像の説明文を入れてください）");
      }
    }
  }
  if (!f.excerpt && bodyText) f.excerpt = excerptFrom(bodyText);
  if (!f.slug && !base) f.slug = `post-${Date.now().toString(36)}`;
  return { fields: f, errs, warnings };
}

type Ctx<P> = { params: Promise<P> };
/** Route handler wrapper: API-key auth + uniform JSON errors. */
export function apiRoute<P = Record<string, never>>(fn: (req: Request, key: ApiKey, params: P) => Promise<Response>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const key = authenticate(req);
      return await fn(req, key, await ctx.params);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export const actorOf = (key: ApiKey) => `api:${key.name}`;
