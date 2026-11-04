import type { Metadata } from "next";
import { Listing } from "@/components/blog/listing";
import { livePosts } from "@/lib/cms/posts";
import { seoMeta } from "@/lib/cms/seo";
import { BLOG_INDEX } from "@/lib/cms/seo-paths";

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return seoMeta("/blog", BLOG_INDEX.title, BLOG_INDEX.description);
}

export default function BlogIndex() {
  const { posts } = livePosts({ limit: 60 });
  return (
    <Listing
      title="読みもの"
      en="Stories & Guides"
      lead="5つのテーマで、大阪で暮らす人の役に立つ記事を届けます。制度や連絡先は、公式ページで確かめてから書いています。"
      posts={posts}
    />
  );
}
