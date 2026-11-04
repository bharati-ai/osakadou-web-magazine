import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Pic, PillLink, SectionTitle } from "@/components/ui";
import { THEMES } from "@/lib/content";
import type { HomeContent } from "@/lib/cms/pages";

/** 5つのテーマ: horizontal scroll-snap of tall photo cards; each series title links to its article. */
export function Themes({ c }: { c: HomeContent["themes"] }) {
  return (
    <section id="themes" aria-labelledby="h-themes" className="overflow-hidden bg-band py-16 md:py-24">
      <div className="wrap">
        <SectionTitle id="h-themes" cms="home:themes.title" ja={c.title} en="Five Themes" />
        <p data-cms="home:themes.lead" className="mx-auto -mt-4 mb-10 max-w-[34em] text-center text-ink-2">{c.lead}</p>
      </div>
      <ul
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(16px,calc((100vw-1200px)/2+40px))] pb-6 [scroll-padding-inline:max(16px,calc((100vw-1200px)/2+40px))]"
        aria-label="5つのテーマ"
        tabIndex={0}
      >
        {THEMES.map((t, i) => {
          const x = c.items[i];
          return (
            <li key={t.id} id={t.id} className="w-[min(82vw,340px)] shrink-0 snap-start">
              <article className="card-hard flex h-full flex-col overflow-hidden">
                <Link href={`/blog/category/${t.id}`} tabIndex={-1} aria-hidden="true" className="group relative block aspect-[4/3] overflow-hidden bg-paper-2">
                  <Pic cms={`home:themes.items.${i}.image`} img={x.image} sizes="340px" className="transition-transform duration-700 group-hover:scale-105" />
                  <span lang="en" className="absolute left-3 top-2 font-latin text-5xl font-bold text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.45)]">{t.n}</span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-maru text-xl font-bold"><Link href={`/blog/category/${t.id}`} className="hover:text-shu-ink" data-cms={`home:themes.items.${i}.title`}>{x.title}</Link></h3>
                  <p lang="en" data-cms={`home:themes.items.${i}.en`} className="font-latin text-sm text-ink-2">{x.en}</p>
                  <p data-cms={`home:themes.items.${i}.desc`} className="mt-3 text-[14px] leading-[1.85]">{x.desc}</p>
                  <p data-cms="home:themes.seriesLabel" className="mt-4 text-xs font-bold text-ink-2">{c.seriesLabel}</p>
                  <ul className="mt-1 grid gap-0.5 border-t-2 border-ink pt-1">
                    {x.series.map((s, si) => (
                      <li key={si}>
                        <Link href={s.href || `/blog/category/${t.id}`} className="group flex items-start justify-between gap-2 py-1.5 font-maru text-[14.5px] font-bold hover:text-shu-ink">
                          <span data-cms={`home:themes.items.${i}.series.${si}.title`}>{s.title}</span>
                          <CaretRight size={14} weight="bold" className="mt-1.5 shrink-0 text-shu transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      <div className="wrap mt-8 text-center">
        <PillLink href="/blog">読みものをすべて見る</PillLink>
      </div>
    </section>
  );
}
