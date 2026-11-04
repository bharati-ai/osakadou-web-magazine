import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/cms/auth";
import { can, canEditPost } from "@/lib/cms/perms";
import { categoryChain, categoryTree } from "@/lib/cms/categories";
import { listPosts, type ListFilter } from "@/lib/cms/posts";
import { getL } from "@/lib/cms/lang";
import { jaDate } from "@/lib/cms/render";
import { StatusBadge } from "@/components/admin/status-badge";
import { Notice } from "@/components/admin/ui";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("記事", "Posts") };
}

const TABS: [string, string, string][] = [["", "すべて", "All"], ["live", "公開中", "Published"], ["scheduled", "予約投稿", "Scheduled"], ["draft", "下書き", "Drafts"], ["review", "レビュー待ち", "In review"], ["archived", "非公開", "Unpublished"]];
const PER = 30;

export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireUser();
  const L = await getL();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { total, posts } = listPosts({ status: (sp.status || undefined) as ListFilter["status"], categoryId: Number(sp.cat) || undefined, q: sp.q || undefined, createdBy: sp.mine ? me.id : undefined, limit: PER, offset: (page - 1) * PER });
  const pages = Math.ceil(total / PER);
  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ status: sp.status, cat: sp.cat, q: sp.q, mine: sp.mine, ...o })) if (v) u.set(k, String(v));
    return `/admin/posts?${u}`;
  };
  return (
    <div className="grid max-w-[1200px] gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-maru text-2xl font-bold">{L("記事", "Posts")}</h1>
        {can(me, "posts.create") && <Link href="/admin/posts/new" className="inline-flex min-h-10 items-center rounded-lg bg-shu px-4 text-sm font-bold text-on-shu">{L("新規記事", "New post")}</Link>}
      </div>
      {sp.deleted && <Notice kind="ok">{L("記事を削除しました。", "Post deleted.")}</Notice>}
      <div className="flex flex-wrap gap-2 text-sm">
        {TABS.map(([v, ja, en]) => (
          <Link key={v} href={qs({ status: v || undefined, page: undefined })} aria-current={(sp.status ?? "") === v ? "page" : undefined} className="rounded-full border border-line px-3 py-1.5 aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper">{L(ja, en)}</Link>
        ))}
        {can(me, "posts.create") && <Link href={qs({ mine: sp.mine ? undefined : "1", page: undefined })} aria-pressed={!!sp.mine} className="ml-auto rounded-full border border-line px-3 py-1.5 aria-pressed:border-shu aria-pressed:bg-shu/10 aria-pressed:font-bold">{L("自分の記事だけ", "Only mine")}</Link>}
      </div>
      <form className="flex flex-wrap gap-2" action="/admin/posts">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        {sp.mine && <input type="hidden" name="mine" value="1" />}
        <input name="q" defaultValue={sp.q} placeholder={L("タイトル・スラッグで検索", "Search title or slug")} aria-label={L("検索", "Search")} className="min-h-10 w-full max-w-[320px] rounded-lg border border-line bg-card px-3" />
        <select name="cat" defaultValue={sp.cat ?? ""} aria-label={L("カテゴリ", "Category")} className="min-h-10 rounded-lg border border-line bg-card px-3">
          <option value="">{L("すべてのカテゴリ", "All categories")}</option>
          {categoryTree().map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="min-h-10 rounded-lg border border-line bg-card px-4 text-sm font-bold">{L("絞り込む", "Filter")}</button>
      </form>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-paper-2 text-left text-xs text-ink-2">
            <tr><th className="px-4 py-2">{L("タイトル", "Title")}</th><th className="px-4 py-2">{L("状態", "Status")}</th><th className="px-4 py-2">{L("カテゴリ", "Category")}</th><th className="px-4 py-2">{L("公開日", "Published")}</th><th className="px-4 py-2">{L("更新", "Updated")}</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.map((p) => {
              const ch = categoryChain(p.category_id);
              return (
                <tr key={p.id} className="hover:bg-paper">
                  <td className="max-w-[460px] px-4 py-3">
                    <Link href={canEditPost(me, p) ? `/admin/posts/${p.id}` : `/admin/posts/${p.id}/preview`} className="font-bold hover:underline">{p.title}</Link>
                    <p className="truncate font-mono text-xs text-ink-2">/blog/{p.slug}{p.origin === "api" ? "　· API" : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge post={p} />
                    {p.review_requested_at && p.status === "draft" && <span className="mt-1 block text-xs font-bold text-[var(--caution)]">{L("レビュー待ち", "In review")}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs">{ch ? `${ch.parent.name}${ch.child ? ` › ${ch.child.name}` : ""}` : "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{jaDate(p.published_at) || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-2">{jaDate(p.updated_at)}</td>
                </tr>
              );
            })}
            {!posts.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-2">{L("記事がありません", "No posts found")}</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav aria-label={L("ページ", "Pagination")} className="flex gap-2 text-sm">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={qs({ page: n })} aria-current={n === page ? "page" : undefined} className="grid size-9 place-items-center rounded-lg border border-line aria-[current=page]:bg-ink aria-[current=page]:text-paper">{n}</Link>
          ))}
        </nav>
      )}
      <p className="text-xs text-ink-2">{L(`${total}件`, `${total} ${total === 1 ? "post" : "posts"}`)}</p>
    </div>
  );
}
