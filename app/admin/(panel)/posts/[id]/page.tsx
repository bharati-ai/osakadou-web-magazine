import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { can, canEditPost } from "@/lib/cms/perms";
import { categoryTree } from "@/lib/cms/categories";
import { getL } from "@/lib/cms/lang";
import { changedFields, getPost, revisions } from "@/lib/cms/posts";
import { SITE } from "@/lib/site";
import { PostForm } from "@/components/admin/post-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { BackLink, ConfirmSubmit, Notice, StickyBar, btnGhost } from "@/components/admin/ui";
import { deletePostAction, duplicatePost, restoreRevision } from "../actions";
import { formValues } from "../form-values";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("記事を編集", "Edit post") };
}

const FIELDS: Record<string, [string, string]> = {
  title: ["タイトル", "Title"], slug: ["スラッグ（URL）", "Slug"], excerpt: ["概要", "Excerpt"], content_html: ["本文", "Body"], cover_src: ["アイキャッチ画像", "Featured image"],
  cover_alt: ["代替テキスト", "Alt text"], category_id: ["カテゴリ", "Category"], tags: ["タグ", "Tags"], sources: ["参考・出典", "Sources"], status: ["状態", "Status"],
  author_name: ["著者", "Author"], seo_title: ["SEOタイトル", "SEO title"], seo_description: ["メタディスクリプション", "Meta description"], noindex: ["noindex", "noindex"],
  published_at: ["公開日時", "Publish date"], reviewed_at: ["最終確認日", "Fact-checked"], reading_minutes: ["読了時間", "Reading time"], external_id: ["外部ID", "External ID"], seo: ["SEO詳細", "Advanced SEO"],
};

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireUser();
  const L = await getL();
  const post = getPost(Number((await params).id));
  if (!post) notFound();
  const sp = await searchParams;
  const revs = revisions(post.id);
  const f = (k: string) => (FIELDS[k] ? L(FIELDS[k][0], FIELDS[k][1]) : k);
  const publish = can(me, "posts.publish");
  // without Publish, authors and contributors may change only their drafts; published posts open read-only
  const editable = canEditPost(me, post) && (publish || post.status === "draft");
  const head = (
    <>
      <BackLink href="/admin/posts">{L("記事一覧", "All posts")}</BackLink>
      <h1 className="max-w-[32ch] truncate font-maru text-lg font-bold" title={post.title}>{post.title || L("記事を編集", "Edit post")}</h1>
      <StatusBadge post={post} />
      {post.review_requested_at && post.status === "draft" && <span className="rounded-md border border-[var(--caution)] px-2 py-0.5 text-xs font-bold text-[var(--caution)]">{L("レビュー待ち", "In review")}</span>}
      {post.origin === "api" && <span className="rounded-md border border-line px-2 py-0.5 text-xs text-ink-2">{L("API投稿", "Via API")}</span>}
    </>
  );
  return (
    <div className="grid gap-6">
      {!editable && (
        <StickyBar>
          {head}
          <a href={`/admin/posts/${post.id}/preview`} className={`${btnGhost} ml-auto`}>{L("プレビューを見る", "View preview")}</a>
        </StickyBar>
      )}
      {!editable && <Notice kind="warn">{canEditPost(me, post) ? L("公開済みの記事は、「公開する」権限のある人だけが編集できます。直したい点は編集者に伝えてください。", "Only people with the Publish permission can change a published post. Tell an editor what needs fixing.") : L("この記事を編集する権限がありません（自分の記事だけ編集できます）。", "You don’t have permission to edit this post (you can edit only your own).")}</Notice>}
      {sp.created && <Notice kind="ok">{L("記事を作成しました。", "Post created.")}</Notice>}
      {sp.restored && <Notice kind="ok">{L(`版 ${sp.restored} の内容に戻しました（戻す前の内容も履歴に残っています）。`, `Restored version ${sp.restored} (the previous content is kept in the history).`)}</Notice>}
      {editable && <PostForm key={sp.restored ?? "edit"} values={formValues(post, { author: SITE.editors })} categories={categoryTree()} head={head} canPublish={publish} />}

      <section aria-labelledby="h-rev" className="max-w-[1100px] rounded-[var(--radius-card)] border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
          <h2 id="h-rev" className="font-maru text-lg font-bold">{L("版の履歴", "Version history")}（{revs.length}）</h2>
          <p className="text-xs text-ink-2">{L("保存のたびに版が残ります。「この版に戻す」を押しても、いまの内容は新しい版として残ります。", "Every save keeps a version. Restoring also keeps the current content as a new version.")}</p>
        </div>
        <ol className="divide-y divide-line">
          {revs.map((r, i) => {
            const changed = changedFields(r.data, revs[i + 1]?.data);
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="font-mono text-xs text-ink-2">{L("版", "v")} {r.id}</span>
                <span className="whitespace-nowrap">{new Date(r.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</span>
                <span className="font-bold">{r.author || "-"}</span>
                <span className="text-ink-2">{r.note}</span>
                {changed.length > 0 && <span className="text-xs text-ink-2">{L("変更：", "Changed: ")}{changed.map(f).join(L("・", ", "))}</span>}
                <span className="ml-auto flex gap-2">
                  <a href={`/admin/posts/${post.id}/preview?rev=${r.id}`} target="_blank" className={`${btnGhost} min-h-8 px-3 text-xs`}>{L("この版を見る", "View")}</a>
                  {i > 0 && editable && (
                    <form action={restoreRevision}>
                      <input type="hidden" name="rev" value={r.id} />
                      <ConfirmSubmit message={L(`版 ${r.id} の内容に戻しますか？`, `Restore version ${r.id}?`)} className={`${btnGhost} min-h-8 px-3 text-xs`}>{L("この版に戻す", "Restore")}</ConfirmSubmit>
                    </form>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex max-w-[1100px] flex-wrap gap-3">
        {can(me, "posts.create") && <form action={duplicatePost}><input type="hidden" name="id" value={post.id} /><ConfirmSubmit message={L("この記事を複製して下書きを作りますか？", "Duplicate this post as a draft?")} className={btnGhost}>{L("複製して下書きを作る", "Duplicate as draft")}</ConfirmSubmit></form>}
        {editable && can(me, "posts.delete") && <form action={deletePostAction}><input type="hidden" name="id" value={post.id} /><ConfirmSubmit message={L("この記事を完全に削除します。版の履歴も消え、元に戻せません。よろしいですか？（公開をやめるだけなら「非公開」にしてください）", "Permanently delete this post and its history? This cannot be undone. (To just take it offline, set it to Unpublished.)")}>{L("完全に削除", "Delete permanently")}</ConfirmSubmit></form>}
      </section>
    </div>
  );
}
