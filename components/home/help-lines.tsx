import { Ambulance, Baby, Compass, FirstAid, MagnifyingGlass, Phone, PhoneCall } from "@phosphor-icons/react/dist/ssr";
import { SectionTitle } from "@/components/ui";
import { HELP_QUICK, HELP_RESOURCES } from "@/lib/content";
import type { HomeContent } from "@/lib/cms/pages";
import { ShareButton } from "@/components/share-button";

const ICONS = { Ambulance, Baby, PhoneCall, MagnifyingGlass, FirstAid, Compass } as const;

/** 保存版: emergency band (119 + quick numbers) and the official resources as icon cards. */
export function HelpLines({ c }: { c: HomeContent["help"] }) {
  return (
    <section id="unwell" aria-labelledby="h-unwell" className="bg-band py-16 md:py-24">
      <div className="wrap">
        <SectionTitle id="h-unwell" tag={c.tag} tagCms="home:help.tag" cms="home:help.title" ja={c.title} en="Help Lines" />
        <p data-cms="home:help.lead" className="mx-auto -mt-4 mb-10 max-w-[34em] text-center text-ink-2">{c.lead}</p>

        <div className="grid overflow-hidden rounded-[var(--radius-card)] border-2 border-ink bg-card lg:grid-cols-[320px_minmax(0,1fr)]">
          <a href="tel:119" className="flex flex-col justify-center gap-1 bg-shu p-6 text-on-shu md:p-8">
            <span className="font-maru text-lg font-bold">命に関わる緊急時は、迷わず</span>
            <span className="flex items-center gap-3 font-sans text-6xl font-bold tracking-[0.02em]"><Phone size={44} weight="fill" aria-hidden />119</span>
          </a>
          <ul className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="おもな相談先の番号">
            {HELP_QUICK.map((q) => (
              <li key={q.num} className="flex flex-col gap-1 p-5">
                <span className="text-[13px] text-ink-2">{q.when}<span className="nw">（{q.hours}）</span></span>
                <a href={`tel:${q.tel}`} className="font-sans text-[28px] font-bold leading-tight tracking-[0.02em] text-shu-ink">{q.num}</a>
                {"alt" in q && (
                  <span className="text-xs text-ink-2">つながらないとき <a href={`tel:${q.altTel}`} className="inline-block py-2 underline">{q.alt}</a></span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p data-cms="home:help.hashNote" className="mt-3 text-xs text-ink-2">{c.hashNote}</p>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {HELP_RESOURCES.map((r, i) => {
            const x = c.resources[i];
            const Icon = ICONS[r.icon];
            return (
              <li key={r.title} className="card-hard flex flex-col gap-2 p-5">
                <span className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-band text-shu"><Icon size={24} weight="duotone" aria-hidden /></span>
                  <h3 data-cms={`home:help.resources.${i}.title`} className="font-maru text-[17px] font-bold">{x.title}</h3>
                </span>
                <a href={r.link.href} {...(r.link.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} className="w-fit py-1 font-sans text-xl font-bold text-shu-ink underline-offset-4 hover:underline">
                  {r.link.label}
                </a>
                <p data-cms={`home:help.resources.${i}.meta`} className="text-xs text-ink-2">{x.meta}</p>
                <p data-cms={`home:help.resources.${i}.when`} className="text-[14px] leading-[1.8]">{x.when}</p>
                <p className="mt-auto pt-2 text-xs text-ink-2">出典：<a href={r.source.href} target="_blank" rel="noopener" className="underline underline-offset-2">{r.source.label}</a></p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[42em] text-xs text-ink-2"><span data-cms="home:help.disclaimer">{c.disclaimer}</span>最終確認日：<span data-cms="home:help.checked" className="nw">{c.checked}</span></p>
          <ShareButton label="相談先を共有" text={`${c.title}（#7119・#8000ほか）｜オオサカ堂`} path="/#unwell" />
        </div>
      </div>
    </section>
  );
}
