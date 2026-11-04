import type { Metadata } from "next";
import { cache } from "react";
import { SITE } from "@/lib/site";
import { db, json, nowIso, tx } from "./db";
import { resolveLocal } from "./html";

// ---------------------------------------------------------------- global settings (versioned like page content)

export type AiCrawlers = "allow" | "block-training" | "block-all";
export type SeoSettings = {
  siteTitle: string;
  /** must contain %s, e.g. "%s｜オオサカ堂" */
  titleTemplate: string;
  siteDescription: string;
  ogDescription: string;
  /** "" = /og-default.jpg; otherwise a /media/… or /photos/… path */
  defaultOgImage: string;
  /** "@handle" for twitter:site */
  twitterSite: string;
  /** Organization sameAs (official social / profile URLs) */
  sameAs: string[];
  verification: { google: string; bing: string; yandex: string };
  aiCrawlers: AiCrawlers;
  robotsDisallow: string[];
  robotsCustom: string;
  sitemap: { blog: boolean; categories: boolean; tools: boolean; about: boolean };
  indexing: { subCategoryMinPosts: number; noindexCategories: boolean };
  schema: { faq: boolean; breadcrumbs: boolean };
  llms: { enabled: boolean; intro: string };
};

export const DEFAULT_SEO: SeoSettings = {
  siteTitle: SITE.title,
  titleTemplate: `%s｜${SITE.name}`,
  siteDescription: SITE.description,
  ogDescription: SITE.ogDescription,
  defaultOgImage: "",
  twitterSite: "",
  sameAs: [],
  verification: { google: "", bing: "", yandex: "" },
  aiCrawlers: "allow",
  robotsDisallow: [],
  robotsCustom: "",
  sitemap: { blog: true, categories: true, tools: true, about: true },
  indexing: { subCategoryMinPosts: 3, noindexCategories: false },
  schema: { faq: true, breadcrumbs: true },
  llms: {
    enabled: true,
    intro: "オオサカ堂は、大阪で暮らす人のためのWebマガジンです。暮らし・健康と医療の相談先・美容とウェルネス・カルチャー・暮らしの手続きを、国や大阪府・大阪市の公式情報を確かめて書いています。",
  },
};

const SEO_KEY = "seo"; // row key in page_versions (history + restore come for free)

/** Merge stored values over defaults, keeping only known keys and the right types. */
function mergeDefaults<T>(def: T, val: unknown): T {
  if (Array.isArray(def)) return (Array.isArray(val) ? val.filter((x) => typeof x === "string") : def) as T;
  if (def && typeof def === "object") {
    const v = (val && typeof val === "object" ? val : {}) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(def).map(([k, d]) => [k, mergeDefaults(d, v[k])])) as T;
  }
  return (typeof val === typeof def ? val : def) as T;
}

export const getSeo = cache((): SeoSettings => {
  const row = db().prepare("SELECT data FROM page_versions WHERE page = ? ORDER BY version DESC LIMIT 1").get(SEO_KEY) as { data: string } | undefined;
  return mergeDefaults(DEFAULT_SEO, row ? json(row.data, {}) : {});
});

const isUrl = (s: string) => /^https:\/\/[^\s]+$/.test(s);
const isPath = (s: string) => /^\/[^\s?#]*$/.test(s);

export function validateSeo(input: unknown, L: (ja: string, en: string) => string = (ja) => ja) {
  const s = mergeDefaults(DEFAULT_SEO, input);
  const errs: string[] = [];
  const trimArr = (a: string[]) => [...new Set(a.map((x) => x.trim()).filter(Boolean))];
  s.sameAs = trimArr(s.sameAs).slice(0, 15);
  s.robotsDisallow = trimArr(s.robotsDisallow).slice(0, 50);
  if (!s.titleTemplate.includes("%s")) errs.push(L("タイトルのテンプレートに %s を入れてください", "The title template must contain %s"));
  if (!s.siteTitle.trim() || s.siteTitle.length > 70) errs.push(L("サイトのタイトルは1〜70文字です", "Site title must be 1–70 characters"));
  if (s.siteDescription.length > 200 || s.ogDescription.length > 200) errs.push(L("説明文は200文字までです", "Descriptions are limited to 200 characters"));
  if (s.defaultOgImage && !resolveLocal(s.defaultOgImage)) errs.push(L("既定のOGP画像が見つかりません（メディアから選んでください）", "Default OG image not found (choose it from the media library)"));
  if (s.twitterSite && !/^@[A-Za-z0-9_]{1,15}$/.test(s.twitterSite)) errs.push(L("Xのアカウントは @から始まる形式です", "The X handle must look like @name"));
  for (const u of s.sameAs) if (!isUrl(u)) errs.push(L(`sameAs のURLが正しくありません：${u}`, `Invalid sameAs URL: ${u}`));
  for (const p of s.robotsDisallow) if (!isPath(p)) errs.push(L(`robots の除外パスは / から始めてください：${p}`, `Disallow paths must start with /: ${p}`));
  for (const [k, v] of Object.entries(s.verification)) if (v && !/^[A-Za-z0-9_\-:.=]{4,120}$/.test(v)) errs.push(L(`認証コード（${k}）の形式が正しくありません（content の値だけを入れてください）`, `Invalid ${k} verification code (paste only the content value)`));
  if (s.robotsCustom.length > 4000) errs.push(L("robots の追加ルールが長すぎます", "Custom robots rules are too long"));
  if (!["allow", "block-training", "block-all"].includes(s.aiCrawlers)) s.aiCrawlers = "allow";
  s.indexing.subCategoryMinPosts = Math.max(0, Math.min(50, Math.round(s.indexing.subCategoryMinPosts)));
  if (s.llms.intro.length > 2000) errs.push(L("llms.txt の紹介文は2000文字までです", "The llms.txt intro is limited to 2000 characters"));
  return { settings: s, errs };
}

export function saveSeo(s: SeoSettings, author: string, note: string) {
  const d = db();
  return tx(d, () => {
    const n = ((d.prepare("SELECT max(version) v FROM page_versions WHERE page = ?").get(SEO_KEY) as { v: number | null }).v ?? 0) + 1;
    d.prepare("INSERT INTO page_versions (page, version, data, author, note) VALUES (?, ?, ?, ?, ?)").run(SEO_KEY, n, JSON.stringify(s), author, note);
    return n;
  });
}

export function seoVersions() {
  return db().prepare("SELECT version, data, author, note, created_at FROM page_versions WHERE page = ? ORDER BY version DESC LIMIT 50").all(SEO_KEY) as {
    version: number; data: string; author: string; note: string; created_at: string;
  }[];
}

export function seoVersion(v: number) {
  return db().prepare("SELECT data FROM page_versions WHERE page = ? AND version = ?").get(SEO_KEY, v) as { data: string } | undefined;
}

// ---------------------------------------------------------------- per-path overrides (static pages, categories, tools)

export type SeoOverride = {
  title?: string; description?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; canonical?: string; noindex?: boolean; nofollow?: boolean;
};

const STR_KEYS = ["title", "description", "ogTitle", "ogDescription", "ogImage", "canonical"] as const;
const LIMITS: Record<(typeof STR_KEYS)[number], number> = { title: 70, description: 200, ogTitle: 90, ogDescription: 200, ogImage: 300, canonical: 300 };

/** Keep known keys, trim strings, drop empties. */
export function cleanOverride(v: unknown): SeoOverride {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const out: SeoOverride = {};
  for (const k of STR_KEYS) if (typeof o[k] === "string" && (o[k] as string).trim()) out[k] = (o[k] as string).trim().slice(0, LIMITS[k]);
  if (o.noindex === true) out.noindex = true;
  if (o.nofollow === true) out.nofollow = true;
  return out;
}

export function validateOverride(o: SeoOverride, L: (ja: string, en: string) => string = (ja) => ja) {
  const errs: string[] = [];
  if (o.canonical && !(isPath(o.canonical) || o.canonical.startsWith(SITE.url + "/") || o.canonical === SITE.url)) errs.push(L("canonical はサイト内のパス（/…）か https://osakadou.live/… で指定してください", "Canonical must be a site path (/…) or https://osakadou.live/…"));
  if (o.ogImage && !resolveLocal(o.ogImage)) errs.push(L("OGP画像が見つかりません（メディアから選んでください）", "OG image not found (choose it from the media library)"));
  return errs;
}

const overridesMap = cache(() => {
  const rows = db().prepare("SELECT path, data FROM seo_overrides").all() as { path: string; data: string }[];
  return new Map(rows.map((r) => [r.path, cleanOverride(json(r.data, {}))]));
});

export const getOverride = (path: string) => overridesMap().get(path) ?? {};
export const listOverrides = () =>
  db().prepare("SELECT path, data, updated_by, updated_at FROM seo_overrides ORDER BY path").all() as { path: string; data: string; updated_by: string; updated_at: string }[];

export function setOverride(path: string, o: SeoOverride, by: string) {
  if (!Object.keys(o).length) return db().prepare("DELETE FROM seo_overrides WHERE path = ?").run(path);
  db()
    .prepare("INSERT INTO seo_overrides (path, data, updated_by, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(path) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = excluded.updated_at")
    .run(path, JSON.stringify(o), by, nowIso());
}

/** Absolute or site-relative og:image entry for a local image path. */
const ogImage = (src: string, alt: string) => {
  const r = resolveLocal(src);
  const url = src.startsWith("/media/") || src.startsWith("/photos/") ? `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=55` : src;
  return { url, width: 1200, height: r ? Math.round((1200 * r.height) / r.width) : undefined, alt };
};

export const defaultOgImages = () => {
  const s = getSeo();
  return s.defaultOgImage ? [ogImage(s.defaultOgImage, s.siteTitle)] : [{ url: "/og-default.jpg", width: 1200, height: 630, alt: s.siteTitle }];
};

/**
 * Metadata for a public page: base title/description, then the SEO team's override for this path.
 * Every page sets its own openGraph (Next replaces, not merges, a parent's), so the default image is added here.
 */
export function seoMeta(path: string, title: string, description: string, extra: Metadata = {}): Metadata {
  const s = getSeo();
  const o = getOverride(path);
  const t = o.title || title;
  const d = o.description || description;
  const eog = (extra.openGraph ?? {}) as Record<string, unknown>;
  const robots = o.noindex || o.nofollow ? { index: !o.noindex, follow: !o.nofollow } : extra.robots;
  // precedence: SEO-center override > what the page supplies > site defaults
  return {
    ...extra,
    title: t,
    description: d,
    alternates: { ...(extra.alternates ?? {}), canonical: o.canonical || extra.alternates?.canonical || path },
    robots,
    openGraph: {
      type: "website", locale: "ja_JP", siteName: SITE.name, url: path,
      ...eog,
      title: o.ogTitle || (eog.title as string | undefined) || s.titleTemplate.replace("%s", t),
      description: o.ogDescription || (eog.description as string | undefined) || d,
      images: o.ogImage ? [ogImage(o.ogImage, t)] : (eog.images as never) ?? defaultOgImages(),
    } as Metadata["openGraph"],
  };
}

/** og:image for a post cover / override. */
export const postOgImages = (src: string | null | undefined, alt: string) => (src ? [ogImage(src, alt)] : defaultOgImages());

// ---------------------------------------------------------------- post-level SEO (posts.seo JSON)

export const SCHEMA_TYPES = ["BlogPosting", "Article", "NewsArticle"] as const;
export type PostSeo = {
  focusKeyphrase?: string; canonical?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; nofollow?: boolean;
  schemaType?: (typeof SCHEMA_TYPES)[number]; faqSchema?: boolean;
};

export function cleanPostSeo(v: unknown): PostSeo {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const s = (k: string, n: number) => (typeof o[k] === "string" && (o[k] as string).trim() ? (o[k] as string).trim().slice(0, n) : undefined);
  const out: PostSeo = {
    focusKeyphrase: s("focusKeyphrase", 60), canonical: s("canonical", 300), ogTitle: s("ogTitle", 90), ogDescription: s("ogDescription", 200), ogImage: s("ogImage", 300),
  };
  if (o.nofollow === true) out.nofollow = true;
  if (SCHEMA_TYPES.includes(o.schemaType as never)) out.schemaType = o.schemaType as PostSeo["schemaType"];
  if (o.faqSchema === false) out.faqSchema = false;
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined)) as PostSeo;
}

export const validatePostSeo = (s: PostSeo, L?: (ja: string, en: string) => string) => validateOverride({ canonical: s.canonical, ogImage: s.ogImage }, L);

// ---------------------------------------------------------------- redirects (applied in proxy.ts)

export type Redirect = { id: number; source: string; destination: string; code: 301 | 302 | 307 | 308; hits: number; last_hit_at: string | null; note: string; created_at: string; updated_at: string };

export const listRedirects = () => db().prepare("SELECT * FROM redirects ORDER BY source").all() as Redirect[];

/** Exact-path match (trailing slash ignored). Counts the hit. */
export function findRedirect(path: string) {
  const p = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const r = db().prepare("SELECT id, destination, code FROM redirects WHERE source = ?").get(p) as Pick<Redirect, "id" | "destination" | "code"> | undefined;
  if (r) db().prepare("UPDATE redirects SET hits = hits + 1, last_hit_at = ? WHERE id = ?").run(nowIso(), r.id);
  return r;
}

const RESERVED = /^\/(admin|api|_next|media)(\/|$)/;

export function validateRedirect(r: { source: string; destination: string; code: number }, selfId: number | null, L: (ja: string, en: string) => string = (ja) => ja) {
  const errs: string[] = [];
  const source = r.source.trim().replace(/\/+$/, "") || "/";
  if (!isPath(source)) errs.push(L("転送元は / から始まるパスです（?や#は使えません）", "Source must be a path starting with / (no ? or #)"));
  else if (source === "/" || RESERVED.test(source)) errs.push(L("このパスは転送元にできません", "This path cannot be redirected"));
  const dest = r.destination.trim();
  if (!(isPath(dest) || isUrl(dest))) errs.push(L("転送先は / から始まるパスか https:// のURLです", "Destination must be a path starting with / or an https:// URL"));
  if (dest.replace(/\/+$/, "") === source) errs.push(L("転送元と転送先が同じです", "Source and destination are the same"));
  if (![301, 302, 307, 308].includes(r.code)) errs.push(L("ステータスコードが正しくありません", "Invalid status code"));
  const loop = db().prepare("SELECT id FROM redirects WHERE source = ? AND destination = ?").get(dest.replace(/\/+$/, ""), source) as { id: number } | undefined;
  if (loop && loop.id !== selfId) errs.push(L("逆向きの転送があるため、ループになります", "A reverse redirect exists; this would loop"));
  const dup = db().prepare("SELECT id FROM redirects WHERE source = ?").get(source) as { id: number } | undefined;
  if (dup && dup.id !== selfId) errs.push(L("この転送元はすでに登録されています", "A redirect for this source already exists"));
  return { errs, source, dest };
}

export function saveRedirect(id: number | null, source: string, destination: string, code: number, note: string) {
  if (id) db().prepare("UPDATE redirects SET source = ?, destination = ?, code = ?, note = ?, updated_at = ? WHERE id = ?").run(source, destination, code, note, nowIso(), id);
  else db().prepare("INSERT INTO redirects (source, destination, code, note) VALUES (?, ?, ?, ?)").run(source, destination, code, note);
}

export const deleteRedirect = (id: number) => db().prepare("DELETE FROM redirects WHERE id = ?").run(id);

// ---------------------------------------------------------------- robots.txt

const AI_TRAINING = ["GPTBot", "Google-Extended", "CCBot", "ClaudeBot", "anthropic-ai", "Applebot-Extended", "Bytespider", "meta-externalagent", "Amazonbot", "cohere-ai", "Diffbot"];
const AI_SEARCH = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User", "DuckAssistBot", "YouBot"];

/** The whole robots.txt: base rules, the AI-crawler policy, the SEO team's custom lines, then the sitemap. */
export function robotsTxt(s = getSeo()) {
  const out = ["User-agent: *", "Allow: /", ...["/api/", "/admin", ...s.robotsDisallow].map((p) => `Disallow: ${p}`)];
  if (s.aiCrawlers !== "allow") out.push("", ...(s.aiCrawlers === "block-all" ? [...AI_TRAINING, ...AI_SEARCH] : AI_TRAINING).map((b) => `User-agent: ${b}`), "Disallow: /");
  const custom = s.robotsCustom.replace(/\r/g, "").split("\n").filter((l) => !/^\s*sitemap\s*:/i.test(l)).join("\n").trim();
  if (custom) out.push("", custom);
  out.push("", `Sitemap: ${SITE.url}/sitemap.xml`, "");
  return out.join("\n");
}

export { AI_SEARCH, AI_TRAINING };
