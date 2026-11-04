import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { SITE } from "@/lib/site";
import { categoryTree, type Category } from "@/lib/cms/categories";
import type { Post } from "@/lib/cms/posts";
import { PostCard } from "./post-card";

/** Header band + category pills + post grid, shared by /blog and the category archives. */
type Crumb = { name: string; href?: string };

export function Listing({ title, en, lead, posts, current, sub, crumbs = [] }: { title: string; en: string; lead: string; posts: Post[]; current?: Category; sub?: Category; crumbs?: Crumb[] }) {
  const trail: Crumb[] = [{ name: "ホーム", href: "/" }, { name: "読みもの", href: crumbs.length ? "/blog" : undefined }, ...crumbs];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, ...(c.href ? { item: `${SITE.url}${c.href === "/" ? "" : c.href}` } : {}) })),
  };
  const tree = categoryTree({ publishedOnly: true });
  const children = current ? (tree.find((c) => c.id === current.id)?.children ?? []) : [];
  const pill = (active: boolean) =>
    `shrink-0 snap-start rounded-full border-2 px-4 py-2 font-maru text-sm font-bold ${active ? "border-shu bg-shu text-on-shu" : "border-ink bg-card shadow-[3px_3px_0_var(--ink)]"}`;
  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      <header className="bg-band pb-14 pt-6 md:pb-20 md:pt-8">
        <nav aria-label="パンくずリスト" className="wrap text-xs text-ink-2">
          <ol className="flex flex-wrap items-center gap-1">
            {trail.map((c, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <CaretRight size={10} aria-hidden />}
                {c.href ? <Link href={c.href} className="hover:underline">{c.name}</Link> : <span aria-current="page">{c.name}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <div className="wrap mt-6 text-center md:mt-8">
          <h1 className="font-maru text-[30px] font-bold tracking-[0.08em] md:text-[42px]">{title}</h1>
          <p lang="en" className="mt-1 font-latin tracking-[0.12em] text-ink-2">{en}</p>
          {lead && <p className="mx-auto mt-4 max-w-[38em] text-[15px] text-ink-2">{lead}</p>}
        </div>
      </header>
      <nav aria-label="カテゴリ" className="wrap relative z-10 -mt-6 flex snap-x scroll-px-[clamp(16px,4vw,40px)] gap-2 overflow-x-auto pb-3 pt-1">
        <Link href="/blog" className={pill(!current)} aria-current={!current ? "page" : undefined}>すべて</Link>
        {tree.map((c) => (
          <Link key={c.id} href={`/blog/category/${c.slug}`} className={pill(current?.id === c.id)} aria-current={current?.id === c.id && !sub ? "page" : undefined}>
            {c.name}
          </Link>
        ))}
      </nav>
      {children.length > 0 && current && (
        <nav aria-label="サブカテゴリ" className="wrap mt-3 flex flex-wrap gap-2 text-sm">
          <Link href={`/blog/category/${current.slug}`} aria-current={!sub ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full px-4 ${!sub ? "bg-ink text-paper" : "border border-line"}`}>すべて</Link>
          {children.map((k) => (
            <Link key={k.id} href={`/blog/category/${current.slug}/${k.slug}`} aria-current={sub?.id === k.id ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full px-4 ${sub?.id === k.id ? "bg-ink text-paper" : "border border-line"}`}>
              {k.name}
            </Link>
          ))}
        </nav>
      )}
      <div className="wrap mt-10">
        <h2 className="sr-only">記事一覧</h2>
        {posts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => <PostCard key={p.id} post={p} big={i === 0 && posts.length > 3} priority={i === 0} />)}
          </div>
        ) : (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-ink-2">{current ? "このカテゴリの記事は準備中です。" : "記事はまだありません。公開まで、しばらくお待ちください。"}</p>
        )}
      </div>
    </div>
  );
}
