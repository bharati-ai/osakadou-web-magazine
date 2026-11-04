import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/blog/listing";
import { categoryById, categoryByPath, categoryTree } from "@/lib/cms/categories";
import { livePosts } from "@/lib/cms/posts";
import { getSeo, seoMeta } from "@/lib/cms/seo";

export const revalidate = 300;
export const generateStaticParams = async () => categoryTree().flatMap((c) => c.children.map((k) => ({ cat: c.slug, sub: k.slug })));

type Props = { params: Promise<{ cat: string; sub: string }> };

async function load(params: Props["params"]) {
  const { cat, sub } = await params;
  const s = categoryByPath(cat, sub);
  const parent = s?.parent_id ? categoryById(s.parent_id) : undefined;
  return s && parent ? { s, parent } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await load(params);
  if (!r) return {};
  const live = livePosts({ categoryId: r.s.id, limit: 1 }).total;
  const ix = getSeo().indexing;
  return seoMeta(`/blog/category/${r.parent.slug}/${r.s.slug}`, `${r.s.name}の記事一覧（${r.parent.name}）`, r.s.description || `${r.parent.name}のなかから、「${r.s.name}」の記事をまとめています。`, {
    // thin until a sub-category has a few posts (SEO setting): keep it crawlable but out of the index
    robots: ix.noindexCategories || live < ix.subCategoryMinPosts ? { index: false, follow: true } : undefined,
  });
}

export default async function SubCategoryPage({ params }: Props) {
  const r = await load(params);
  if (!r) notFound();
  const { posts } = livePosts({ categoryId: r.s.id, limit: 60 });
  return (
    <Listing
      title={r.s.name}
      en="Category"
      lead={r.s.description || `${r.parent.name}のなかから、「${r.s.name}」の記事をまとめています。`}
      posts={posts}
      current={r.parent}
      sub={r.s}
      crumbs={[{ name: r.parent.name, href: `/blog/category/${r.parent.slug}` }, { name: r.s.name }]}
    />
  );
}
