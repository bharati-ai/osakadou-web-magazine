import Link from "next/link";
import { CaretRight, Info } from "@phosphor-icons/react/dist/ssr";
import { Photo } from "@/components/ui";
import { TOOL_CATEGORIES } from "@/lib/tools/categories";
import { promotedIn } from "@/lib/tools";
import { postsLinkingTo } from "@/lib/cms/posts";
import { SITE } from "@/lib/site";
import type { ToolMeta } from "@/lib/tools/types";

export type Source = { label: string; href: string };

/**
 * Page frame for every free tool: photo header band, the interactive tool, "how it works",
 * sources, an optional caution note, and related tools from the same category.
 */
export function ToolShell({
  tool,
  children,
  about,
  sources = [],
  caution,
}: {
  tool: ToolMeta;
  children: React.ReactNode;
  about?: React.ReactNode;
  sources?: Source[];
  caution?: string;
}) {
  const cat = TOOL_CATEGORIES.find((c) => c.id === tool.category)!;
  const related = promotedIn(tool.category).filter((t) => t.slug !== tool.slug).slice(0, 6);
  const Icon = tool.icon;
  const reads = postsLinkingTo(`/tools/${tool.slug}`);
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "無料ツール", item: `${SITE.url}/tools` },
      { "@type": "ListItem", position: 3, name: tool.title },
    ],
  };
  return (
    <article className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd).replace(/</g, "\\u003c") }} />
      <header className="relative isolate overflow-hidden bg-night text-on-night">
        <Photo slot={tool.photo ?? cat.photo} fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-10 opacity-55" priority />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/95 via-night/75 to-night/30" aria-hidden />
        <div className="wrap py-10 md:py-16">
          <nav aria-label="パンくずリスト" className="text-xs text-white/80">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="hover:underline">ホーム</Link></li>
              <li aria-hidden><CaretRight size={10} /></li>
              <li><Link href="/tools" className="hover:underline">無料ツール</Link></li>
              <li aria-hidden><CaretRight size={10} /></li>
              <li><Link href={`/tools#${cat.id}`} className="hover:underline">{cat.label}</Link></li>
            </ol>
          </nav>
          <div className="mt-5 flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-shu text-on-shu md:size-16">
              <Icon size={30} weight="duotone" aria-hidden />
            </span>
            <div>
              <h1 className="font-maru text-[28px] font-bold tracking-[0.06em] md:text-[40px]">{tool.title}</h1>
              <p className="mt-2 max-w-[36em] text-[15px] text-white/90">{tool.short}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="wrap mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="grid min-w-0 content-start gap-4">
          <section aria-label={tool.title} className="card-hard p-5 md:p-8">{children}</section>
          {caution && (
            <section aria-labelledby="caution" className="flex gap-3 rounded-[var(--radius-card)] border-2 border-shu/40 bg-card p-4 md:p-5">
              <Info size={22} className="mt-0.5 shrink-0 text-shu" aria-hidden />
              <div>
                <h2 id="caution" className="font-maru text-[15px] font-bold">ご利用にあたって</h2>
                <p className="mt-1 text-[13.5px] leading-[1.8]">{caution}</p>
              </div>
            </section>
          )}
          <p className="text-xs text-ink-2">内容の最終確認日：2026年10月31日{tool.category === "health" || tool.category === "beauty" ? "　結果は一般的な目安で、診断ではありません。" : ""}</p>
        </div>
        <aside className="grid content-start gap-6">
          {about && (
            <section className="rounded-[var(--radius-card)] bg-band p-5 md:p-6">
              <h2 className="font-maru text-lg font-bold">使い方・計算のしくみ</h2>
              <div className="mt-3 grid gap-3 text-[14.5px] leading-[1.85]">{about}</div>
            </section>
          )}
          {sources.length > 0 && (
            <section>
              <h2 className="font-maru text-sm font-bold text-ink-2">参考・出典</h2>
              <ul className="mt-2 grid gap-1 text-[13px]">
                {sources.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-shu-ink">{s.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {reads.length > 0 && (
            <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
              <h2 className="font-maru text-base font-bold">この話題の読みもの</h2>
              <ul className="mt-2 grid gap-1.5 text-[14px] leading-[1.7]">
                {reads.map((r) => (
                  <li key={r.slug}><Link href={`/blog/${r.slug}`} className="underline underline-offset-4 hover:text-shu-ink">{r.title}</Link></li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="wrap mt-16">
          <h2 id="related" className="font-maru text-xl font-bold">{cat.label}のほかのツール</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => {
              const RIcon = t.icon;
              return (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="card-hard flex h-full items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
                    <RIcon size={26} weight="duotone" className="shrink-0 text-shu" aria-hidden />
                    <span className="font-maru font-bold">{t.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
