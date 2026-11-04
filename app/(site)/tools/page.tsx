import type { Metadata } from "next";
import Link from "next/link";
import { Photo, Pic, SectionTitle } from "@/components/ui";
import { getToolsPage } from "@/lib/cms/pages";
import { seoMeta } from "@/lib/cms/seo";
import { TOOL_CATEGORIES } from "@/lib/tools/categories";
import { toolsIn } from "@/lib/tools";

export function generateMetadata(): Metadata {
  const c = getToolsPage();
  return seoMeta("/tools", c.title, c.metaDescription);
}

export default function ToolsIndex() {
  const c = getToolsPage();
  return (
    <div className="pb-20">
      <header className="relative isolate overflow-hidden bg-night py-14 text-on-night md:py-20">
        <Pic cms="tools:image" img={c.image} sizes="(min-width: 768px) 50vw, 100vw" priority className="-z-10 opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/50 to-night/85" aria-hidden />
        <div className="wrap text-center">
          <h1 className="font-maru text-[32px] font-bold tracking-[0.08em] md:text-[48px]" data-cms="tools:title">{c.title}</h1>
          <p lang="en" className="mt-1 font-latin tracking-[0.12em] text-white/80">Free Tools</p>
          <p data-cms="tools:lead" className="mx-auto mt-4 max-w-[34em] text-[15px] text-white/90">{c.lead}</p>
        </div>
      </header>

      <nav aria-label="ツールのカテゴリ" className="wrap relative z-10 -mt-6 flex snap-x scroll-px-[clamp(16px,4vw,40px)] gap-2 overflow-x-auto pb-2">
        {TOOL_CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="shrink-0 snap-start rounded-full border-2 border-ink bg-card px-5 py-2.5 font-maru text-sm font-bold shadow-[3px_3px_0_var(--ink)]">
            {c.label}
          </a>
        ))}
      </nav>

      {TOOL_CATEGORIES.map((c, i) => {
        const tools = toolsIn(c.id);
        if (!tools.length) return null;
        return (
          <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`} className={`py-14 md:py-20 ${i % 2 ? "bg-band" : ""}`}>
            <div className="wrap">
              <SectionTitle id={`h-${c.id}`} ja={c.label} en={c.short} />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className="card-hard group flex h-full gap-4 p-5 transition-transform hover:-translate-y-1">
                        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-band text-shu group-hover:bg-shu group-hover:text-on-shu">
                          <Icon size={26} weight="duotone" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-maru text-lg font-bold">{t.title}</span>
                          <span className="mt-1 block text-[13.5px] leading-[1.7] text-ink-2">{t.short}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
