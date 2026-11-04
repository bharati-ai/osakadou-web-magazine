import { categoryTree } from "./categories";
import { getAboutPage, getToolsPage } from "./pages";
import { getSeo } from "./seo";
import { TOOLS } from "@/lib/tools";

export const BLOG_INDEX = {
  title: "読みもの（記事一覧）",
  description: "大阪の暮らし、健康・医療、美容・ウェルネス、カルチャー、暮らしのガイド。国や大阪府・大阪市の公式情報を確かめて書いた記事の一覧です。",
};

export type SeoPath = { path: string; group: "page" | "category" | "tool"; title: string; description: string };

/**
 * Every non-article page the SEO center can override, with the title/description the page uses by default.
 * ponytail: category/tool defaults mirror the page files; if a page changes its wording, update it here too.
 */
export function seoPaths(): SeoPath[] {
  const s = getSeo();
  const t = getToolsPage();
  const a = getAboutPage();
  return [
    { path: "/", group: "page", title: s.siteTitle, description: s.siteDescription },
    { path: "/blog", group: "page", ...BLOG_INDEX },
    { path: "/tools", group: "page", title: t.title, description: t.metaDescription },
    { path: "/about", group: "page", title: a.title, description: a.metaDescription },
    ...categoryTree().flatMap((c): SeoPath[] => [
      { path: `/blog/category/${c.slug}`, group: "category", title: `${c.name}の記事一覧`, description: c.description || `${c.name}の記事一覧です。` },
      ...c.children.map((k): SeoPath => ({
        path: `/blog/category/${c.slug}/${k.slug}`, group: "category", title: `${k.name}の記事一覧（${c.name}）`,
        description: k.description || `${c.name}のなかから、「${k.name}」の記事をまとめています。`,
      })),
    ]),
    ...TOOLS.map((x): SeoPath => ({ path: `/tools/${x.slug}`, group: "tool", title: x.seoTitle ?? x.title, description: x.description ?? x.short })),
  ];
}
