import Link from "next/link";
import { Photo, PillLink, SectionTitle } from "@/components/ui";
import { TOOL_CATEGORIES } from "@/lib/tools/categories";
import { TOOLS, promotedIn } from "@/lib/tools";
import { Tabs } from "./tabs";
import { fill, type HomeContent } from "@/lib/cms/pages";

/** 無料ツール: OSAKA-INFO style filter tabs. Each panel = category photo + up to 6 tool cards. */
export function ToolsShowcase({ c }: { c: HomeContent["tools"] }) {
  const cats = TOOL_CATEGORIES.filter((c) => promotedIn(c.id).length > 0);
  return (
    <section id="tools" aria-labelledby="h-tools" className="py-16 md:py-24">
      <div className="wrap">
        <SectionTitle id="h-tools" cms="home:tools.title" ja={c.title} en="Free Tools" />
        <p data-cms="home:tools.lead" data-cms-vars={JSON.stringify({ n: TOOLS.length })} className="mx-auto -mt-4 mb-8 max-w-[34em] text-center text-ink-2">{fill(c.lead, { n: TOOLS.length })}</p>
        <Tabs labels={cats.map((c) => c.label)}>
          {cats.map((c) => (
            <div key={c.id} className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)]">
              <Link href={`/tools#${c.id}`} className="group relative isolate hidden min-h-[300px] overflow-hidden rounded-[var(--radius-card)] bg-night text-on-night lg:flex">
                <Photo slot={c.photo} fill sizes="400px" className="-z-10 transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-night/85 to-transparent" aria-hidden />
                <span className="mt-auto p-5">
                  <span className="block font-maru text-2xl font-bold">{c.label}</span>
                  <span className="mt-1 block text-sm text-on-night/85">{c.short}</span>
                </span>
              </Link>
              <ul className="grid content-start gap-3 sm:grid-cols-2">
                {promotedIn(c.id).slice(0, 6).map((t) => {
                  const Icon = t.icon;
                  return (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className="card-hard group flex h-full items-start gap-3 p-4 transition-transform hover:-translate-y-0.5">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-band text-shu group-hover:bg-shu group-hover:text-on-shu">
                          <Icon size={24} weight="duotone" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-maru font-bold">{t.title}</span>
                          <span className="mt-0.5 block text-[12.5px] leading-[1.6] text-ink-2">{t.short}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Tabs>
        <div className="mt-10 text-center">
          <PillLink href="/tools">無料ツールをすべて見る</PillLink>
        </div>
      </div>
    </section>
  );
}
