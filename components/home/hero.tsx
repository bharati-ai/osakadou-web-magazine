import type { HomeContent } from "@/lib/cms/pages";
import { srcPos } from "@/lib/photos";
import { HeroCarousel } from "./hero-carousel";

export function Hero({ c }: { c: HomeContent["hero"] }) {
  return (
    <section id="top" aria-labelledby="h1" className="relative overflow-hidden pb-10 pt-5 md:pb-14 md:pt-8">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-3">
          <h1 id="h1" className="font-mincho text-[clamp(52px,11vw,128px)] font-bold leading-[1] tracking-[0.06em] [overflow-wrap:normal]">
            オオサカ堂
            <span lang="en" className="mt-2 block font-latin text-[clamp(13px,1.4vw,18px)] font-medium tracking-[0.42em] text-ink-2">OSAKADOU</span>
          </h1>
          <p className="text-[13px] tracking-[0.1em]">
            <span data-cms="home:hero.issue">{c.issue}</span>
            <span data-cms="home:hero.issueEn" lang="en" className="ml-2 font-latin text-xl text-shu-ink md:block md:ml-0 md:text-right md:text-2xl">{c.issueEn}</span>
          </p>
          <p className="phrase basis-full font-maru text-[15px] font-bold tracking-[0.1em] md:text-lg">
            <span data-cms="home:hero.catch" className="mr-3 text-[1.3em] text-shu-ink">{c.catch}</span>
            <span data-cms="home:hero.deck">{c.deck}</span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-3 md:mt-7 md:gap-6">
          <HeroCarousel slides={c.slides.map((s) => ({ ...s, pos: s.pos || srcPos(s.image.src)?.objectPosition }))} autoplay={c.autoplay} seconds={c.interval} />
          <p className="tate pt-1 font-mincho text-[clamp(22px,2.7vw,40px)] font-bold leading-[1.6] tracking-[0.12em]">
            <span data-cms="home:hero.h1a">{c.h1a}</span>
            <br />
            <span data-cms="home:hero.h1b" className="text-shu-ink">{c.h1b}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
