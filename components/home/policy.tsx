import { SectionTitle } from "@/components/ui";
import type { HomeContent } from "@/lib/cms/pages";

export function Policy({ c }: { c: HomeContent["policy"] }) {
  return (
    <section id="policy" aria-labelledby="h-policy" className="py-16 md:py-20">
      <div className="wrap">
        <SectionTitle id="h-policy" cms="home:policy.title" ja={c.title} en="Editorial Policy" />
        <div className="grid gap-x-10 gap-y-8 text-[14px] leading-[1.85] md:grid-cols-2">
          {c.blocks.map((b, i) => (
            <div key={i}>
              <h3 data-cms={`home:policy.blocks.${i}.title`} className="border-l-4 border-shu pl-3 font-maru text-base font-bold">{b.title}</h3>
              <p data-cms={`home:policy.blocks.${i}.body`} className="mt-2 text-justify">{b.body}</p>
            </div>
          ))}
          <div className="md:col-span-2">
            <h3 data-cms="home:policy.dataTitle" className="border-l-4 border-shu pl-3 font-maru text-base font-bold">{c.dataTitle}</h3>
            <p data-cms="home:policy.dataBody" className="mt-2">{c.dataBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
