import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/blog/listing";
import { categoryByPath, categoryTree } from "@/lib/cms/categories";
import { livePosts } from "@/lib/cms/posts";
import { getSeo, seoMeta } from "@/lib/cms/seo";

export const revalidate = 300;
export const generateStaticParams = async () => categoryTree().map((c) => ({ cat: c.slug }));

type Props = { params: Promise<{ cat: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = categoryByPath((await params).cat);
  if (!c) return {};
  return seoMeta(`/blog/category/${c.slug}`, `${c.name}の記事一覧`, c.description || `${c.name}の記事一覧です。`, {
    robots: getSeo().indexing.noindexCategories ? { index: false, follow: true } : undefined,
  });
}

export default async function CategoryPage({ params }: Props) {
  const c = categoryByPath((await params).cat);
  if (!c || c.parent_id !== null) notFound();
  const { posts } = livePosts({ categoryId: c.id, limit: 60 });
  return <Listing title={c.name} en="Category" lead={c.description} posts={posts} current={c} crumbs={[{ name: c.name }]} />;
}
