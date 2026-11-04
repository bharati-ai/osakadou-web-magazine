import { Train } from "@phosphor-icons/react/dist/ssr";
import { Pic, SectionTitle } from "@/components/ui";
import type { HomeContent } from "@/lib/cms/pages";

/** 大阪まるわかり-style mosaic: one tall tile + five, each a photo with the area kanji, then details below. */
export function Areas({ c }: { c: HomeContent["areas"] }) {
  const n = c.items.length;
  return (
    <section id="areas" aria-labelledby="h-areas" className="py-16 md:py-24">
      <div className="wrap">
        <SectionTitle id="h-areas" cms="home:areas.title" ja={c.title} en="Area Guide" />
        <p data-cms="home:areas.lead" className="mx-auto -mt-4 mb-10 max-w-[34em] text-center text-ink-2">{c.lead}</p>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((a, i) => (
            <li key={i} className={`flex flex-col ${i === 0 || i === n - 1 ? "lg:col-span-2" : ""}`}>
              <div className="group relative isolate aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-night text-on-night lg:aspect-auto lg:h-[240px]">
                <Pic cms={`home:areas.items.${i}.image`} img={a.image} sizes="(min-width:1024px) 50vw, (min-width:640px) 50vw, 100vw" className="-z-10 transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-night/85 via-night/20 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                  <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-shu font-mincho text-[30px] font-bold text-on-shu" data-cms={`home:areas.items.${i}.kanji`}>{a.kanji}</span>
                  <h3 className="font-maru text-2xl font-bold leading-tight">
                    <span data-cms={`home:areas.items.${i}.name`}>{a.name}</span>
                    <span data-cms={`home:areas.items.${i}.ward`} className="mt-1 block font-sans text-xs font-normal text-on-night/85">{a.ward}</span>
                  </h3>
                </div>
              </div>
              <div className="px-1 pt-3">
                <p data-cms={`home:areas.items.${i}.desc`} className="text-[14.5px] leading-[1.85]">{a.desc}</p>
                <p className="mt-2 text-[13px] text-ink-2"><span className="font-bold text-shu-ink">こんな日に</span>　<span data-cms={`home:areas.items.${i}.day`}>{a.day}</span></p>
                <p className="mt-1 flex gap-1.5 text-[13px] text-ink-2 [word-break:keep-all]"><Train size={16} className="mt-0.5 shrink-0" aria-hidden /><span className="sr-only">主な駅：</span><span data-cms={`home:areas.items.${i}.stations`}>{a.stations}</span></p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
