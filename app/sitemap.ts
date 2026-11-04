import type { MetadataRoute } from "next";
import { categoryTree } from "@/lib/cms/categories";
import { livePosts, modifiedAt } from "@/lib/cms/posts";
import { getOverride, getSeo } from "@/lib/cms/seo";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export const revalidate = 3600;

const TOOLS_REVIEWED = new Date("2026-10-31T00:00:00+09:00"); // the date ToolShell shows

/** Follows the SEO center: section switches, the sub-category threshold, and per-page noindex overrides. */
export default function sitemap(): MetadataRoute.Sitemap {
  const s = getSeo();
  const posts = livePosts({ limit: 5000 }).posts.filter((p) => !p.noindex && !p.seo.canonical);
  const newest = posts.map(modifiedAt).sort().pop();
  const lastmod = newest ? new Date(newest) : undefined;
  const counts = new Map<number, number>();
  for (const p of posts) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  type E = MetadataRoute.Sitemap[number];
  const entries: E[] = [
    { url: SITE.url, lastModified: lastmod, changeFrequency: "daily", priority: 1 },
    ...(s.sitemap.blog ? [{ url: `${SITE.url}/blog`, lastModified: lastmod, changeFrequency: "daily", priority: 0.9 } as E] : []),
    ...(s.sitemap.categories && !s.indexing.noindexCategories
      ? categoryTree({ publishedOnly: true })
          .filter((c) => c.postCount > 0)
          .flatMap((c): E[] => [
            { url: `${SITE.url}/blog/category/${c.slug}`, changeFrequency: "weekly", priority: 0.6 },
            ...c.children
              .filter((k) => (counts.get(k.id) ?? 0) >= s.indexing.subCategoryMinPosts)
              .map((k): E => ({ url: `${SITE.url}/blog/category/${c.slug}/${k.slug}`, changeFrequency: "weekly", priority: 0.5 })),
          ])
      : []),
    ...(s.sitemap.blog ? posts.map((p): E => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: new Date(modifiedAt(p)), changeFrequency: "monthly", priority: 0.8 })) : []),
    ...(s.sitemap.tools
      ? [
          { url: `${SITE.url}/tools`, lastModified: TOOLS_REVIEWED, changeFrequency: "monthly", priority: 0.8 } as E,
          ...TOOLS.map((t): E => ({ url: `${SITE.url}/tools/${t.slug}`, lastModified: TOOLS_REVIEWED, changeFrequency: "monthly", priority: 0.7 })),
        ]
      : []),
    ...(s.sitemap.about ? [{ url: `${SITE.url}/about`, changeFrequency: "yearly", priority: 0.4 } as E] : []),
  ];
  // a page the SEO team set to noindex (or pointed elsewhere with canonical) does not belong in the sitemap
  return entries.filter((e) => {
    const o = getOverride(e.url.slice(SITE.url.length) || "/");
    return !o.noindex && !o.canonical;
  });
}
