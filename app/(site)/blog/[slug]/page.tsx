import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView } from "@/components/blog/article-view";
import { modifiedAt, publicPost } from "@/lib/cms/posts";
import { postOgImages, seoMeta } from "@/lib/cms/seo";

// Rendered on first visit, then cached. CMS saves purge the cache; scheduled posts appear within 5 minutes.
export const revalidate = 300;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = publicPost((await params).slug);
  if (!p) return {};
  const s = p.seo;
  const title = p.seo_title || p.title;
  return seoMeta(`/blog/${p.slug}`, title, p.seo_description || p.excerpt, {
    alternates: s.canonical ? { canonical: s.canonical } : undefined,
    robots: p.noindex || s.nofollow ? { index: !p.noindex, follow: !s.nofollow } : undefined,
    openGraph: {
      type: "article",
      ...(s.ogTitle ? { title: s.ogTitle } : {}),
      ...(s.ogDescription ? { description: s.ogDescription } : {}),
      publishedTime: p.published_at ?? undefined,
      modifiedTime: modifiedAt(p),
      tags: p.tags,
      images: postOgImages(s.ogImage || p.cover_src, p.cover_alt || title),
    },
  });
}

export default async function PostPage({ params }: Props) {
  const slug = (await params).slug;
  if (slug !== slug.toLowerCase()) permanentRedirect(`/blog/${slug.toLowerCase()}`);
  const p = publicPost(slug);
  if (!p) notFound();
  return <ArticleView post={p} />;
}
