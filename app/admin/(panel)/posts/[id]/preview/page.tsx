import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { canEditPost } from "@/lib/cms/perms";
import { getL } from "@/lib/cms/lang";
import { getPost, revision, revisionFields } from "@/lib/cms/posts";
import { ArticleView } from "@/components/blog/article-view";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("プレビュー", "Preview") };
}

const when = (iso: string) => new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

/** Draft or old-version preview with the public article layout. */
export default async function Preview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ rev?: string }> }) {
  const me = await requireUser();
  const L = await getL();
  const post = getPost(Number((await params).id));
  if (!post) notFound();
  const revId = Number((await searchParams).rev);
  const rev = revId ? revision(revId) : undefined;
  const shown = rev && rev.post_id === post.id ? { ...post, ...revisionFields(rev.data), noindex: post.noindex } : post;
  return (
    <div className="-mx-4 -my-6 bg-paper md:-mx-8 md:-my-8">
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-1 bg-[var(--caution)] px-4 py-2 text-sm font-bold text-white">
        <a href={canEditPost(me, post) ? `/admin/posts/${post.id}` : "/admin/posts"} className="rounded-md border border-white/70 px-2.5 py-1 hover:bg-white/15">← {canEditPost(me, post) ? L("編集に戻る", "Back to editor") : L("記事一覧", "All posts")}</a>
        <p className="flex-1 text-center">
          {L("プレビュー", "Preview")}{rev ? L(`（版 #${rev.id}・${when(rev.created_at)}）`, ` (version #${rev.id}, ${when(rev.created_at)})`) : ""}{L("：この画面は公開されていません", ": this page is not public")}
        </p>
      </div>
      <ArticleView post={shown} preview />
    </div>
  );
}
