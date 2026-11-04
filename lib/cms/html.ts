import sanitizeHtml from "sanitize-html";
import { photos, type PhotoSlot } from "@/lib/photos";
import { SITE } from "@/lib/site";
import { MediaError, ingestImage, mediaByPath, mediaUrl } from "./media";

// The article HTML contract. Keep in sync with docs/cms/HTML-STYLE-GUIDE.md and the editor (components/admin/editor).
export const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "br", "strong", "em", "u", "s", "mark", "code", "pre", "a", "ul", "ol", "li", "blockquote",
  "figure", "figcaption", "img", "table", "thead", "tbody", "tr", "th", "td", "hr", "aside", "details", "summary",
];
export const ALLOWED_CLASSES: Record<string, string[]> = {
  p: ["ol-lead", "ol-box__title"],
  a: ["ol-linkcard"],
  ul: ["ol-check", "ol-sources"],
  ol: ["ol-steps", "ol-sources"],
  figure: ["ol-figure", "ol-figure--narrow"],
  aside: ["ol-box", "ol-box--point", "ol-box--note", "ol-box--caution", "ol-box--info"],
  details: ["ol-faq"],
};
const BOX_MODS = ["ol-box--point", "ol-box--note", "ol-box--caution", "ol-box--info"];
const ALIGN = { "text-align": [/^(left|right|center|justify)$/] };
const RENAME: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4", b: "strong", i: "em", del: "s", strike: "s" };
// Never transform a tag into a disallowed name: sanitize-html then leaks that name onto the next sibling's end tag.
// Plain <div>s are simply not allowed (unwrapped, children kept); boxes become <aside>; bad images go via exclusiveFilter.
const DROP_ATTR = "data-ol-drop";

export type ResolvedImage = { src: string; width: number; height: number };
export type ProcessResult = { html: string; warnings: string[]; text: string; readingMinutes: number; images: { src: string; alt: string }[] };

/** div.ol-box / aside.ol-box → <aside class="ol-box ol-box--…">; any other div keeps its name and is unwrapped. */
function box(name: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
  const cls = (attribs.class ?? "").split(/\s+/);
  if (!cls.includes("ol-box")) return { tagName: name, attribs: {} };
  return { tagName: "aside", attribs: { class: `ol-box ${cls.find((c) => BOX_MODS.includes(c)) ?? "ol-box--note"}` } };
}

function options(resolve: (src: string) => ResolvedImage | null | undefined, onImage?: (src: string) => void): sanitizeHtml.IOptions {
  let sec = 0;
  return {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "class", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding", DROP_ATTR],
      th: ["scope", "colspan", "rowspan", "style"],
      td: ["colspan", "rowspan", "style"],
      ol: ["start", "class"],
      ul: ["class"],
      p: ["class", "style"],
      h2: ["id", "style"], h3: ["id", "style"], h4: ["style"],
      figure: ["class"], aside: ["class"], details: ["class"],
    },
    allowedClasses: ALLOWED_CLASSES,
    allowedStyles: { p: ALIGN, h2: ALIGN, h3: ALIGN, h4: ALIGN, th: ALIGN, td: ALIGN },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed", "svg", "math", "template", "title", "head"],
    transformTags: {
      ...Object.fromEntries(Object.entries(RENAME).map(([from, to]) => [from, (_: string, attribs: sanitizeHtml.Attributes) => ({ tagName: to, attribs })])),
      h1: (_, attribs) => ({ tagName: "h2", attribs: { ...attribs, id: `sec-${++sec}` } }),
      h2: (_, attribs) => ({ tagName: "h2", attribs: { ...attribs, id: `sec-${++sec}` } }),
      h3: (_, attribs) => ({ tagName: "h3", attribs: { ...attribs, id: `sec-${++sec}` } }),
      div: box,
      aside: box,
      a: (_, attribs) => {
        const href = (attribs.href ?? "").trim();
        const external = /^https?:\/\//i.test(href) && !href.startsWith(SITE.url);
        const out: sanitizeHtml.Attributes = { href };
        if (attribs.title) out.title = attribs.title;
        if (attribs.class) out.class = attribs.class;
        if (external) Object.assign(out, { target: "_blank", rel: "noopener noreferrer" });
        return { tagName: "a", attribs: out };
      },
      img: (_, attribs): sanitizeHtml.Tag => {
        const src = (attribs.src ?? "").trim();
        onImage?.(src);
        const r = resolve(src);
        if (!r) return { tagName: "img", attribs: { [DROP_ATTR]: "1" } };
        return { tagName: "img", attribs: { src: r.src, alt: attribs.alt ?? "", width: String(r.width), height: String(r.height), loading: "lazy", decoding: "async" } };
      },
    },
    // drop empty paragraphs (the editor leaves <p></p> between blocks)
    exclusiveFilter: (frame) =>
      (frame.tag === "img" && !!frame.attribs[DROP_ATTR]) || ((frame.tag === "p" || frame.tag === "figcaption") && !frame.text.trim() && !frame.mediaChildren.length),
  };
}

/** Images already on this server: the site's photos and uploaded media. */
export function resolveLocal(src: string): ResolvedImage | undefined {
  const photo = /^\/photos\/([A-Za-z0-9]+)\.jpg$/.exec(src);
  if (photo && photo[1] in photos) {
    const p = photos[photo[1] as PhotoSlot];
    return { src, width: 2400, height: Math.round((2400 * p.h) / p.w) };
  }
  const local = src.startsWith(SITE.url) ? src.slice(SITE.url.length) : src;
  const m = /^\/media\/([0-9]{4}\/[0-9]{2}\/[a-f0-9]{20}\.webp)$/.exec(local);
  const row = m && mediaByPath(m[1]);
  if (row) return { src: mediaUrl(row.path), width: row.width, height: row.height };
}

/** Report what the sanitizer will drop, so API clients can fix their templates. */
function preflight(raw: string) {
  const warnings = new Set<string>();
  const known = new Set([...ALLOWED_TAGS, ...Object.keys(RENAME), "div", "span", "section", "article", "colgroup", "col"]); // colgroup: editor tables
  for (const [, tag] of raw.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g)) {
    const t = tag.toLowerCase();
    if (!known.has(t)) warnings.add(`<${t}> は使えないため削除しました`);
  }
  for (const [, tag, cls] of raw.matchAll(/<([a-zA-Z0-9]+)[^>]*?\sclass\s*=\s*["']([^"']*)["']/g)) {
    const t = tag.toLowerCase();
    const allowed = ALLOWED_CLASSES[t === "div" ? "aside" : (RENAME[t] ?? t)] ?? [];
    for (const c of cls.split(/\s+/).filter(Boolean)) if (!allowed.includes(c) && c !== "ol-table") warnings.add(`<${tag}> の class="${c}" は使えないため削除しました`);
  }
  if (/\son[a-z]+\s*=/i.test(raw)) warnings.add("イベント属性（onclick など）を削除しました");
  if (/href\s*=\s*["']?\s*(javascript|data|vbscript):/i.test(raw)) warnings.add("javascript: などの危険なリンク先を削除しました");
  if (/\sstyle\s*=\s*["'](?![^"']*text-align)[^"']*["']/i.test(raw.replace(/<(table|col)[^>]*>/gi, ""))) warnings.add("style 属性は text-align 以外を削除しました");
  if (/<img(?![^>]*\salt\s*=)[^>]*>/i.test(raw)) warnings.add("alt のない画像があります（説明文を入れてください）");
  return warnings;
}

function finish(html: string, warnings: Set<string>): ProcessResult {
  const wrapped = html.replace(/<table>/g, '<div class="ol-table"><table>').replace(/<\/table>/g, "</table></div>");
  const spaced = html.replace(/<\/(p|h[2-4]|li|td|th|figcaption|summary|aside|blockquote|pre)>|<br\s*\/?>/g, "$& ");
  const text = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  for (const w of lint(text)) warnings.add(w);
  const images = [...wrapped.matchAll(/<img\s+src="([^"]+)"\s+alt="([^"]*)"/g)].map((m) => ({ src: m[1], alt: m[2] }));
  return { html: wrapped, warnings: [...warnings], text, readingMinutes: Math.max(1, Math.round(text.length / 500)), images };
}

/** Synchronous path for HTML whose images are already on this server (seed files, editor saves without new images). */
export function processLocalHtml(input: string): ProcessResult {
  const raw = input.replace(/\r\n?/g, "\n");
  const warnings = preflight(raw);
  const html = sanitizeHtml(raw, options((src) => {
    const r = resolveLocal(src);
    if (!r) warnings.add(`画像 ${src.slice(0, 80)} を取り込めないため削除しました`);
    return r;
  }));
  return finish(html, warnings);
}

/**
 * Full path: remote (https) and data: images are downloaded, stored under /media and the src rewritten.
 * onImageError "fail" throws a MediaError listing every failed image; "drop" removes them and warns.
 */
export async function processHtml(input: string, opts: { by: string; onImageError?: "fail" | "drop" }): Promise<ProcessResult> {
  const raw = input.replace(/\r\n?/g, "\n"); // form posts send CRLF
  const warnings = preflight(raw);
  const srcs = new Set<string>();
  sanitizeHtml(raw, options(() => null, (s) => s && srcs.add(s)));
  if (srcs.size > 40) throw new MediaError("too many images (max 40 per post)");
  const map = new Map<string, ResolvedImage>();
  const failed: string[] = [];
  const altOf = (src: string) => /alt\s*=\s*"([^"]*)"/.exec(raw.slice(raw.indexOf(src) - 300, raw.indexOf(src) + src.length + 300))?.[1];
  for (const src of srcs) {
    const local = resolveLocal(src);
    if (local) { map.set(src, local); continue; }
    if (!/^(https?:|data:image\/)/i.test(src)) { failed.push(`${src.slice(0, 80)}: 外部URL（https）または data URI を指定してください`); continue; }
    try {
      const m = await ingestImage(src, { alt: altOf(src), by: opts.by });
      map.set(src, { src: mediaUrl(m.path), width: m.width, height: m.height });
    } catch (e) {
      failed.push(`${src.startsWith("data:") ? "data URI" : src.slice(0, 120)}: ${(e as Error).message}`);
    }
  }
  if (failed.length && opts.onImageError !== "drop") throw new MediaError(`画像を取り込めませんでした：${failed.join(" / ")}`);
  failed.forEach((f) => warnings.add(`画像を削除しました：${f}`));
  return finish(sanitizeHtml(raw, options((src) => map.get(src))), warnings);
}

// --- 薬機法・景表法 lint. Warnings only: an editor decides.
const NG: [RegExp, string][] = [
  [/(治る|治す|治ります|治せる|完治)/, "治療効果を示す表現（治る・完治など）"],
  [/(効く|効きます|効果抜群|効果絶大|即効)/, "効き目を断定する表現（効く・即効など）"],
  [/副作用(が|は)?(ない|無い|なし|ありません)/, "副作用がないとする表現"],
  [/(必ず|絶対に?)(治|効|痩|やせ|改善|良くな|きれいにな)/, "効果を断定する表現（必ず・絶対）"],
  [/(最安|日本一|No\.?\s?1|ナンバーワン|業界初|世界初)/i, "最上級・No.1 表示（景表法）"],
  [/(個人輸入|処方箋(なし|不要)|医師の(診断|処方)(は)?(なし|不要))/, "個人輸入・処方に関する表現（薬機法）"],
  [/(100%安全|安心安全|絶対安全|安全性が保証)/, "安全性を保証する表現"],
  [/(痩せる|やせる|若返る|シミが消える|シワが消える|美白効果|アンチエイジング)/, "美容効果を断定する表現"],
  [/(がん|癌|糖尿病|高血圧|認知症).{0,8}(予防|治療|改善)(できる|します|効果|に効)/, "疾病の予防・治療効果を示す表現"],
];

export function lint(text: string) {
  const out: string[] = [];
  for (const [re, label] of NG) {
    const m = re.exec(text);
    if (m) out.push(`表現チェック：${label} 「…${text.slice(Math.max(0, m.index - 12), m.index + m[0].length + 12)}…」`);
  }
  return out;
}

/** Table of contents from the h2/h3 ids added at save time. */
export function toc(html: string) {
  return [...html.matchAll(/<h([23]) id="(sec-\d+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({
    level: Number(m[1]),
    id: m[2],
    text: m[3].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim(),
  }));
}

export function excerptFrom(text: string, n = 110) {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}
