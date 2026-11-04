import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/cms/auth";
import { can } from "@/lib/cms/perms";
import { db, nowIso } from "@/lib/cms/db";
import { getL } from "@/lib/cms/lang";
import { listPosts } from "@/lib/cms/posts";
import { jaDate } from "@/lib/cms/render";
import { Notice } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/status-badge";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("ダッシュボード", "Dashboard") };
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string; pw?: string }> }) {
  const user = await requireUser();
  const L = await getL();
  const sp = await searchParams;
  const d = db();
  const n = (sql: string, ...a: string[]) => (d.prepare(sql).get(...a) as { n: number }).n;
  const now = nowIso();
  const stats = [
    { label: L("公開中", "Published"), value: n("SELECT count(*) n FROM posts WHERE status='published' AND published_at <= ?", now), href: "/admin/posts?status=live" },
    { label: L("予約投稿", "Scheduled"), value: n("SELECT count(*) n FROM posts WHERE status='published' AND published_at > ?", now), href: "/admin/posts?status=scheduled" },
    { label: L("下書き", "Drafts"), value: n("SELECT count(*) n FROM posts WHERE status='draft'"), href: "/admin/posts?status=draft" },
    { label: L("画像", "Images"), value: n("SELECT count(*) n FROM media"), href: "/admin/media" },
  ];
  const review = can(user, "posts.publish") ? n("SELECT count(*) n FROM posts WHERE review_requested_at IS NOT NULL AND status = 'draft'") : 0;
  const mine = can(user, "posts.edit_others") ? 0 : n("SELECT count(*) n FROM posts WHERE created_by = ? AND status = 'draft'", String(user.id));
  const recent = listPosts({ limit: 8 }).posts;
  return (
    <div className="grid max-w-[1100px] gap-8">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L(`ようこそ、${user.name}さん`, `Welcome, ${user.name}`)}</h1>
        <p className="mt-1 text-sm text-ink-2">{L("記事の執筆・公開、トップページの文言や写真の編集ができます。", "Write and publish posts, and edit the home page copy and photos.")}</p>
      </div>
      {sp.denied && <Notice kind="warn">{L("その画面や操作を使う権限がありません。必要なら管理者に依頼してください。", "You don’t have permission for that screen or action. Ask an admin if you need it.")}</Notice>}
      {sp.pw && <Notice kind="ok">{L("パスワードを変更しました。", "Password changed.")}</Notice>}
      {review > 0 && <Notice kind="warn"><Link href="/admin/posts?status=review" className="font-bold underline">{L(`レビュー待ちの記事が ${review}件あります`, `${review} post${review > 1 ? "s are" : " is"} waiting for review`)}</Link></Notice>}
      {mine > 0 && <Notice kind="info"><Link href="/admin/posts?mine=1" className="underline">{L(`自分の下書き：${mine}件`, `Your drafts: ${mine}`)}</Link></Notice>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-[var(--radius-card)] border border-line bg-card p-4 hover:border-ink">
            <p className="text-xs text-ink-2">{s.label}</p>
            <p className="mt-1 font-latin text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {can(user, "posts.create") && <Link href="/admin/posts/new" className="inline-flex min-h-11 items-center rounded-lg bg-shu px-5 font-bold text-on-shu">{L("記事を書く", "Write a post")}</Link>}
        {can(user, "pages") && <Link href="/admin/pages/home" className="inline-flex min-h-11 items-center rounded-lg border border-line bg-card px-5 font-bold">{L("トップページを編集", "Edit home page")}</Link>}
        <Link href="/admin/style-guide" className="inline-flex min-h-11 items-center rounded-lg border border-line bg-card px-5 font-bold">{L("スタイルガイド", "Style guide")}</Link>
      </div>
      <section>
        <h2 className="font-maru text-lg font-bold">{L("最近更新した記事", "Recently updated")}</h2>
        <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
          {recent.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <StatusBadge post={p} />
              <Link href={`/admin/posts/${p.id}`} className="line-clamp-1 min-w-0 flex-1 font-bold hover:underline">{p.title}</Link>
              <span className="text-xs text-ink-2">{jaDate(p.updated_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
