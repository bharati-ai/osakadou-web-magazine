import { db, nowIso } from "./db";

const WIDTHS = [640, 828, 1080, 1200, 1920]; // all in next/image's default deviceSizes
const opt = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=55`;
export const thumb = (src: string, w = 384) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=55`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Delivery-time enhancements; the stored HTML stays canonical.
 * - local images get a responsive srcset through the image optimizer
 * - internal link cards show the target post's photo and excerpt
 */
export function renderArticle(html: string) {
  let out = html.replace(/<img src="(\/(?:media|photos)\/[^"]+)"([^>]*)>/g, (_, src: string, rest: string) => {
    const w = Number(/width="(\d+)"/.exec(rest)?.[1] ?? 2000);
    const set = WIDTHS.filter((x) => x <= w * 1.2).map((x) => `${opt(src, x)} ${x}w`);
    if (!set.length) set.push(`${opt(src, 640)} 640w`);
    return `<img src="${opt(src, 1200)}" srcset="${set.join(", ")}" sizes="(min-width: 800px) 720px, calc(100vw - 32px)"${rest}>`;
  });
  out = out.replace(/<a href="\/blog\/([a-z0-9-]+)" class="ol-linkcard">([\s\S]*?)<\/a>/g, (whole, slug: string, label: string) => {
    const p = db()
      .prepare("SELECT title, excerpt, cover_src FROM posts WHERE slug = ? AND status = 'published' AND published_at <= ?")
      .get(slug, nowIso()) as { title: string; excerpt: string; cover_src: string | null } | undefined;
    if (!p) return whole;
    const img = p.cover_src ? `<img class="ol-linkcard__thumb" src="${thumb(p.cover_src, 256).replace(/&/g, "&amp;")}" alt="" loading="lazy" width="96" height="72">` : "";
    return `<a href="/blog/${slug}" class="ol-linkcard">${img}<span class="ol-linkcard__body"><span class="ol-linkcard__label">あわせて読みたい</span><span class="ol-linkcard__title">${esc(p.title) || label}</span><span class="ol-linkcard__excerpt">${esc(p.excerpt)}</span></span></a>`;
  });
  out = out.replace(/<div class="ol-table">/g, '<div class="ol-table" role="region" tabindex="0" aria-label="表（横にスクロールできます）">');
  return out;
}

/** "2026年10月31日" in JST. */
export function jaDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}
