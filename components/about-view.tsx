import Link from "next/link";
import { SectionTitle } from "@/components/ui";
import { categoryTree } from "@/lib/cms/categories";
import type { AboutContent, HomeContent } from "@/lib/cms/pages";
import { SITE } from "@/lib/site";

/** The about page body, shared by the public page and the page-builder canvas (which passes unsaved content). */
export function AboutView({ a, policy, children }: { a: AboutContent; policy: HomeContent["policy"]; children?: React.ReactNode }) {
  return (
    <article className="pb-20">
      {children}
      <header className="bg-band py-14 md:py-20">
        <div className="wrap max-w-[860px] text-center">
          <p className="font-mincho text-[44px] font-bold tracking-[0.08em] md:text-[64px]">オオサカ堂</p>
          <p lang="en" className="font-latin tracking-[0.42em] text-ink-2">OSAKADOU</p>
          <h1 data-cms="about:title" className="mt-6 font-maru text-2xl font-bold tracking-[0.06em] md:text-3xl">{a.title}</h1>
          <p data-cms="about:lead" className="mx-auto mt-4 max-w-[34em] text-[15px] leading-[1.9] text-ink-2">{a.lead}</p>
        </div>
      </header>

      <div className="wrap mt-12 grid max-w-[860px] gap-14">
        <section aria-labelledby="h-about">
          <h2 id="h-about" data-cms="about:introTitle" className="border-l-4 border-shu pl-3 font-maru text-xl font-bold">{a.introTitle}</h2>
          <div className="mt-4 grid gap-4 font-mincho text-[16.5px] leading-[2.05]">
            {a.paragraphs.map((p, i) => p && <p key={i} data-cms={`about:paragraphs.${i}`}>{p}</p>)}
          </div>
        </section>

        <section aria-labelledby="h-themes">
          <h2 id="h-themes" data-cms="about:themesTitle" className="border-l-4 border-shu pl-3 font-maru text-xl font-bold">{a.themesTitle}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {categoryTree().map((c) => (
              <li key={c.id}>
                <Link href={`/blog/category/${c.slug}`} className="card-hard block h-full p-4 hover:-translate-y-0.5">
                  <span className="font-maru font-bold">{c.name}</span>
                  <span className="mt-1 block text-[13px] leading-[1.7] text-ink-2">{c.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="policy" aria-labelledby="h-policy" className="scroll-mt-24">
          <SectionTitle id="h-policy" ja={policy.title} en="Editorial Policy" />
          <div className="grid gap-x-10 gap-y-8 text-[14.5px] leading-[1.9] md:grid-cols-2">
            {policy.blocks.map((b, i) => (
              <div key={i}>
                <h3 className="border-l-4 border-shu pl-3 font-maru text-base font-bold">{b.title}</h3>
                <p className="mt-2 text-justify">{b.body}</p>
              </div>
            ))}
            <div>
              <h3 data-cms="about:correctionsTitle" className="border-l-4 border-shu pl-3 font-maru text-base font-bold">{a.correctionsTitle}</h3>
              <p data-cms="about:corrections" className="mt-2 text-justify">{a.corrections}</p>
            </div>
            <div>
              <h3 className="border-l-4 border-shu pl-3 font-maru text-base font-bold">{policy.dataTitle}</h3>
              <p className="mt-2">{policy.dataBody}</p>
            </div>
          </div>
        </section>

        <p className="text-right text-sm text-ink-2">{SITE.editors}</p>
      </div>
    </article>
  );
}
