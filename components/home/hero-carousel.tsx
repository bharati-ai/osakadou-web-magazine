"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react";
import { inCmsEdit } from "@/components/cms-bridge";
type Slide = { image: { src: string; alt: string }; caption: string; pos?: string };

/**
 * OSAKA-INFO style slider: one large photo, caption, thumbnail strip. Autoplay (page-builder setting) pauses on
 * hover/focus/button and never runs for reduced motion. Slides without a photo are skipped.
 */
export function HeroCarousel({ slides: all, autoplay = true, seconds = 6.5 }: { slides: Slide[]; autoplay?: boolean; seconds?: number }) {
  const slides = all.map((s, k) => ({ ...s, k })).filter((s) => s.image.src); // k = index in the page content
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [hold, setHold] = useState(false);
  // other slides render (and autoplay starts) only after slide 1 has loaded, so they do not compete with the LCP image
  const [ready, setReady] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) setPlaying(false);
    if (!inCmsEdit()) return;
    // visual editor: hold still, render every slide, and show the slide being edited
    setPlaying(false);
    setReady(true);
    const f = (e: Event) => {
      const m = /^home:hero\.slides\.(\d+)\./.exec((e as CustomEvent<Element>).detail.getAttribute("data-cms") ?? "");
      if (m) setI(Math.max(0, slides.findIndex((s) => s.k === Number(m[1]))));
    };
    addEventListener("cms:focus", f);
    return () => removeEventListener("cms:focus", f);
  }, []);
  useEffect(() => {
    if (!playing || hold || !ready) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), seconds * 1000);
    return () => clearTimeout(t);
  }, [i, playing, hold, ready, slides.length, seconds]);

  const go = (n: number) => {
    setReady(true);
    setI((n + slides.length) % slides.length);
  };
  if (!slides.length) return <div className="aspect-[3/4] rounded-[var(--radius-card)] bg-paper-2 sm:aspect-[4/3] md:aspect-[16/10]" />;
  const cur = slides[Math.min(i, slides.length - 1)];

  return (
    <div
      className="min-w-0"
      role="region"
      aria-roledescription="カルーセル"
      aria-label="大阪の風景"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-paper-2 sm:aspect-[4/3] md:aspect-[16/10]">
        {slides.map((s, n) => (n === 0 || ready) && (
          <figure
            key={n}
            aria-hidden={n !== i}
            className={`absolute inset-0 m-0 transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              data-cms={`home:hero.slides.${s.k}.image`}
              src={s.image.src}
              alt={s.image.alt}
              fill
              loading={n === 0 ? "eager" : "lazy"}
              fetchPriority={n === 0 ? "high" : undefined}
              onLoad={n === 0 ? () => setReady(true) : undefined}
              sizes="(min-width:1280px) 1050px, (min-width:768px) 80vw, calc(100vw - 100px)"
              className="object-cover"
              style={{ objectPosition: s.pos }}
            />
            <figcaption data-cms={`home:hero.slides.${s.k}.caption`} className="absolute bottom-0 left-0 rounded-tr-[var(--radius-card)] bg-paper/90 px-3 py-1.5 text-xs">{s.caption}</figcaption>
          </figure>
        ))}
        {autoplay && slides.length > 1 && (
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "自動再生を止める" : "自動再生する"} className="grid size-11 place-items-center rounded-full bg-paper/90 text-ink">
              {playing ? <Pause size={16} weight="fill" aria-hidden /> : <Play size={16} weight="fill" aria-hidden />}
            </button>
          </div>
        )}
      </div>
      {slides.length > 1 && <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => go(i - 1)} aria-label="前の写真" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper">
          <CaretLeft size={16} weight="bold" aria-hidden />
        </button>
        <ol className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {slides.map((s, n) => (
            <li key={n} className="shrink-0">
              <button
                type="button"
                onClick={() => go(n)}
                aria-label={`${n + 1}枚目：${s.caption}`}
                aria-current={n === i}
                className={`relative block h-11 w-16 overflow-hidden rounded-md outline-offset-2 md:h-12 md:w-20 ${n === i ? "ring-2 ring-shu" : "opacity-70"}`}
              >
                <Image src={s.image.src} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: s.pos }} />
              </button>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => go(i + 1)} aria-label="次の写真" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper">
          <CaretRight size={16} weight="bold" aria-hidden />
        </button>
      </div>}
      {/* announce only user-driven changes, not every autoplay tick */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>{`${i + 1}枚目：${cur.caption}`}</p>
    </div>
  );
}
