import { livePosts, postUrl } from "@/lib/cms/posts";
import { SITE } from "@/lib/site";

export const revalidate = 300;

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS 2.0 of the 30 newest posts. */
export function GET() {
  const { posts } = livePosts({ limit: 30 });
  const items = posts
    .map((p) => `<item><title>${x(p.title)}</title><link>${SITE.url}${postUrl(p)}</link><guid isPermaLink="true">${SITE.url}${postUrl(p)}</guid><pubDate>${new Date(p.published_at!).toUTCString()}</pubDate><description>${x(p.excerpt)}</description></item>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${x(SITE.name)}｜読みもの</title><link>${SITE.url}/blog</link><atom:link href="${SITE.url}/blog/feed.xml" rel="self" type="application/rss+xml"/><description>大阪の暮らし、健康・医療、美容・ウェルネス、カルチャー、暮らしのガイドの記事。国や大阪府・大阪市の公式情報を確かめて書いています。</description><language>ja</language><lastBuildDate>${new Date(posts[0]?.updated_at ?? Date.now()).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
