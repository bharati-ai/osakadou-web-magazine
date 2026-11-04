import Image from "next/image";
import Link from "next/link";
import { categoryChain } from "@/lib/cms/categories";
import { postUrl, type Post } from "@/lib/cms/posts";
import { jaDate } from "@/lib/cms/render";

/** Photo card for post lists. `big` spans two columns on wide screens. */
export function PostCard({ post, big, priority }: { post: Post; big?: boolean; priority?: boolean }) {
  const ch = categoryChain(post.category_id);
  const cat = ch?.child ?? ch?.parent;
  return (
    <article className={`card-hard group relative flex h-full flex-col overflow-hidden ${big ? "md:col-span-2 md:flex-row" : ""}`}>
      <div className={`relative aspect-[16/10] shrink-0 overflow-hidden bg-paper-2 ${big ? "md:aspect-auto md:w-[55%]" : ""}`}>
        {post.cover_src && (
          <Image src={post.cover_src} alt={post.cover_alt} fill loading={priority ? "eager" : undefined} fetchPriority={priority ? "high" : undefined} sizes={big ? "(min-width: 768px) 420px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {cat && <span className="w-fit rounded-[var(--radius-chip)] bg-band px-2 py-0.5 text-xs font-bold text-shu-ink">{cat.name}</span>}
        <h3 className={`mt-2 font-maru font-bold leading-snug ${big ? "text-2xl" : "text-lg"}`}>
          <Link href={postUrl(post)} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.8] text-ink-2">{post.excerpt}</p>
        <p className="mt-auto pt-3 text-xs text-ink-2">
          <time dateTime={post.published_at ?? undefined}>{jaDate(post.published_at)}</time>
          <span className="ml-3">約{post.reading_minutes}分で読めます</span>
        </p>
      </div>
    </article>
  );
}
