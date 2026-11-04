import type { Metadata } from "next";
import { requireUser } from "@/lib/cms/auth";
import { can } from "@/lib/cms/perms";
import { getL } from "@/lib/cms/lang";
import { listMedia, mediaUrl, mediaUsage } from "@/lib/cms/media";
import { thumb } from "@/lib/cms/render";
import { MediaUploader } from "@/components/admin/media-uploader";
import { ConfirmSubmit, Notice, btnGhost, input } from "@/components/admin/ui";
import { removeMedia, saveMediaAlt } from "../manage-actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("メディア", "Media") };
}

export default async function MediaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireUser();
  const L = await getL();
  const sp = await searchParams;
  const manage = can(me, "media.manage");
  const page = Math.max(1, Number(sp.page) || 1);
  const items = listMedia({ q: sp.q ?? "", limit: 48, offset: (page - 1) * 48 });
  return (
    <div className="grid max-w-[1200px] gap-5">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("メディア", "Media")}</h1>
        <p className="mt-1 text-sm text-ink-2">{L("アップロードした画像は WebP（長辺2000px まで）に変換し、位置情報などのメタデータを取り除いて保存します。", "Uploads are converted to WebP (up to 2000px on the long side) and stripped of metadata such as location.")}</p>
      </div>
      {sp.deleted && <Notice kind="ok">{L("画像を削除しました。", "Image deleted.")}</Notice>}
      {sp.inuse && <Notice kind="warn">{L("その画像は記事またはページで使われているため削除できません。先に使用箇所から外してください。", "That image is used in a post or page, so it can’t be deleted. Remove it from there first.")}</Notice>}
      {sp.saved && <Notice kind="ok">{L("代替テキストを保存しました。", "Alt text saved.")}</Notice>}
      {can(me, "media.upload") && <MediaUploader />}
      <form action="/admin/media" className="flex gap-2">
        <input name="q" defaultValue={sp.q} placeholder={L("代替テキスト・ファイル名で検索", "Search alt text or file name")} aria-label={L("検索", "Search")} className={`${input} max-w-[320px]`} />
        <button className={btnGhost}>{L("検索", "Search")}</button>
      </form>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => {
          const use = mediaUsage(m);
          const url = mediaUrl(m.path);
          return (
            <li key={m.id} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(url)} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full bg-paper-2 object-cover" />
              <div className="grid gap-2 p-3 text-xs">
                <p className="text-ink-2">{m.width}×{m.height}・{Math.round(m.bytes / 1024)}KB{m.original_name ? `・${m.original_name}` : ""}</p>
                <code className="select-all break-all text-[11px]">{url}</code>
                {manage ? <form action={saveMediaAlt} className="flex gap-1">
                  <input type="hidden" name="id" value={m.id} />
                  <input name="alt" defaultValue={m.alt} aria-label={L("代替テキスト（alt）", "Alt text")} placeholder={L("代替テキスト（alt）", "Alt text")} className={`${input} py-1 text-xs`} />
                  <button className="shrink-0 rounded border border-line px-2">{L("保存", "Save")}</button>
                </form> : m.alt && <p>{m.alt}</p>}
                <p className="text-ink-2">{use.posts.length || use.pages.length
                  ? L(`使用中：記事${use.posts.length}件${use.pages.length ? `・ページ ${use.pages.join("、")}` : ""}`, `In use: ${use.posts.length} ${use.posts.length === 1 ? "post" : "posts"}${use.pages.length ? `, pages ${use.pages.join(", ")}` : ""}`)
                  : L("未使用", "Unused")}</p>
                {manage && !use.posts.length && !use.pages.length && (
                  <form action={removeMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmSubmit message={L("この画像をサーバーから削除します。元に戻せません。", "Delete this image from the server? This cannot be undone.")} className="text-[#b3261e] underline">{L("削除", "Delete")}</ConfirmSubmit>
                  </form>
                )}
              </div>
            </li>
          );
        })}
        {!items.length && <li className="col-span-full rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-sm text-ink-2">{L("画像はまだありません。", "No images yet.")}</li>}
      </ul>
      <nav className="flex gap-2 text-sm" aria-label={L("ページ", "Pagination")}>
        {page > 1 && <a className={btnGhost} href={`/admin/media?page=${page - 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}>{L("← 前へ", "← Previous")}</a>}
        {items.length === 48 && <a className={btnGhost} href={`/admin/media?page=${page + 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}>{L("次へ →", "Next →")}</a>}
      </nav>
    </div>
  );
}
