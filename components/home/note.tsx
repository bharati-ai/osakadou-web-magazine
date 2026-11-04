import { Pic } from "@/components/ui";
import type { HomeContent } from "@/lib/cms/pages";

/** 編集部より: vertical kicker, editorial text, and a two-photo collage. */
export function EditorsNote({ c }: { c: HomeContent["note"] }) {
  return (
    <section id="note" aria-labelledby="h-note" className="relative overflow-hidden bg-band py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-[image:var(--wagara-band)] bg-[length:40px_20px] bg-repeat-x" aria-hidden />
      <div className="wrap grid items-start gap-10 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,380px)] md:gap-14">
        <h2 id="h-note" data-cms="home:note.heading" className="font-maru text-[26px] font-bold tracking-[0.3em] md:text-[30px] md:[writing-mode:vertical-rl]">{c.heading}</h2>
        <div className="max-w-[33em] font-mincho text-[16.5px] leading-[2.1] [&>p]:mb-5 [&>p]:text-justify">
          {c.paragraphs.map((p, i) => p && <p key={i} data-cms={`home:note.paragraphs.${i}`}>{p}</p>)}
          <p data-cms="home:note.signature" className="mt-8 text-right font-sans text-sm">{c.signature}</p>
        </div>
        <div className="relative mx-auto w-full max-w-[380px] pb-16">
          <figure className="m-0 w-[78%]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-paper-2">
              <Pic cms="home:note.photo1" img={c.photo1} sizes="300px" />
            </div>
            {c.caption1 && <figcaption data-cms="home:note.caption1" className="mt-2 text-xs text-ink-2">{c.caption1}</figcaption>}
          </figure>
          <figure className="absolute bottom-0 right-0 m-0 w-[52%] rotate-2 rounded-[var(--radius-card)] border-4 border-card shadow-[var(--shadow-hard)]">
            <div className="relative aspect-square overflow-hidden rounded-[10px] bg-paper-2">
              <Pic cms="home:note.photo2" img={c.photo2} sizes="200px" />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
