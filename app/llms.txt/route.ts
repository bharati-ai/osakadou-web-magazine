import { categoryTree } from "@/lib/cms/categories";
import { livePosts } from "@/lib/cms/posts";
import { getOverride, getSeo } from "@/lib/cms/seo";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

/** llms.txt (llmstxt.org): a plain map of the site for AI assistants. Off when the SEO team disables it. */
export function GET() {
  const s = getSeo();
  if (!s.llms.enabled) return new Response("Not found", { status: 404 });
  const one = (t: string) => t.replace(/\s+/g, " ").trim();
  const posts = livePosts({ limit: 5000 }).posts.filter((p) => !p.noindex && !getOverride(`/blog/${p.slug}`).noindex);
  const byCat = new Map<number, typeof posts>();
  for (const p of posts) byCat.set(p.category_id, [...(byCat.get(p.category_id) ?? []), p]);
  const lines = [`# ${SITE.name}`, "", `> ${one(s.llms.intro || s.siteDescription)}`, ""];
  for (const c of categoryTree({ publishedOnly: true })) {
    const list = [c, ...c.children].flatMap((k) => byCat.get(k.id) ?? []);
    if (!list.length) continue;
    lines.push(`## ${c.name}`, "", ...list.map((p) => `- [${one(p.title)}](${SITE.url}/blog/${p.slug}): ${one(p.seo_description || p.excerpt)}`), "");
  }
  lines.push("## 無料ツール", "", ...TOOLS.map((t) => `- [${one(t.title)}](${SITE.url}/tools/${t.slug}): ${one(t.short)}`), "");
  lines.push("## Optional", "", `- [${SITE.name}について](${SITE.url}/about): 編集方針・訂正の方針・プライバシー`, `- [RSS](${SITE.url}/blog/feed.xml)`, "");
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
