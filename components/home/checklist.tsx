"use client";

import { useEffect, useState } from "react";
import { CHECKLIST_SOURCES } from "@/lib/content";
import type { HomeContent } from "@/lib/cms/pages";
import { fill } from "@/lib/cms/fill";
import { ShareButton } from "@/components/share-button";

const KEY = "osakalive:checklist";

/** スタンプカード: each done item gets a 朱 「済」 stamp. Saved on this device only, by item id (so edits and reordering keep progress). */
export function Checklist({ c }: { c: HomeContent["checklist"] }) {
  const ids = c.groups.flatMap((g, gi) => g.items.map((it, ii) => it.id || `${gi}-${ii}`));
  const TOTAL = ids.length;
  const IDS = new Set<string>(ids);
  const vars = { n: TOTAL };
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {}); } catch {}
  }, []);
  const toggle = (id: string) =>
    setDone((d) => {
      const next = { ...d, [id]: !d[id] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  const count = Object.entries(done).filter(([k, v]) => v && IDS.has(k)).length;

  return (
    <section id="checklist" aria-labelledby="h-checklist" className="py-16 md:py-24">
      <div className="wrap">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-[var(--radius-chip)] border border-shu px-2 py-1 text-xs font-bold leading-none text-shu-ink" data-cms="home:checklist.tag">{c.tag}</span>
          <h2 id="h-checklist" data-cms="home:checklist.title" className="font-maru text-[26px] font-bold tracking-[0.08em] md:text-[34px]">{c.title}</h2>
          <p lang="en" className="mt-1 font-latin text-sm tracking-[0.12em] text-ink-2">Living Checklist</p>
          <p data-cms="home:checklist.lead" data-cms-vars={JSON.stringify(vars)} className="mx-auto mt-4 max-w-[34em] text-ink-2">{fill(c.lead, vars)}</p>
        </div>

        <p aria-live="polite" className="mb-6 text-center font-maru font-bold">
          {count === TOTAL ? <span data-cms="home:checklist.done" data-cms-vars={JSON.stringify(vars)}>{fill(c.done, vars)}</span> : <>{TOTAL}個中 <span className="font-latin text-3xl text-shu-ink">{count}</span> 個 達成</>}
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          {c.groups.map((g, gi) => (
            <fieldset key={gi} className="rounded-[var(--radius-card)] border-2 border-dashed border-line bg-card p-5">
              <legend data-cms={`home:checklist.groups.${gi}.group`} className="px-2 font-maru text-lg font-bold">{g.group}</legend>
              <ul className="grid gap-3">
                {g.items.map((x, ii) => {
                  const id = x.id || `${gi}-${ii}`;
                  const on = !!done[id];
                  return (
                    <li key={id}>
                      <label className="flex cursor-pointer gap-3 rounded-[10px] p-2 hover:bg-band has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-shu">
                        <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(id)} />
                        <span aria-hidden className="relative grid size-14 shrink-0 place-items-center rounded-full border-2 border-dashed border-line">
                          <span
                            className={`grid size-12 place-items-center rounded-full border-[3px] border-shu font-mincho text-xl font-bold text-shu transition duration-300 ${on ? "rotate-[-12deg] scale-100 opacity-100" : "rotate-12 scale-150 opacity-0"}`}
                          >
                            済
                          </span>
                        </span>
                        <span className="text-[14.5px] font-bold leading-[1.6]">
                          <span data-cms={`home:checklist.groups.${gi}.items.${ii}.label`}>{x.label}</span>
                          <span data-cms={`home:checklist.groups.${gi}.items.${ii}.note`} className="mt-1 block text-[12.5px] font-normal text-ink-2">{x.note}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-2">
          <p className="max-w-[48em]">
            出典：
            {CHECKLIST_SOURCES.map((s, n) => (
              <span key={s.href}>{n > 0 && "・"}<a href={s.href} target="_blank" rel="noopener" className="underline underline-offset-2">{s.label}</a></span>
            ))}
            　最終確認日：<span data-cms="home:checklist.checked" className="nw">{c.checked}</span>。制度は変わることがあるため、公式ページでご確認ください。
          </p>
          <ShareButton label="チェックリストを共有" text={`${c.title}（防災・医療・手続きの${TOTAL}項目）｜オオサカ堂`} path="/#checklist" />
        </div>
      </div>
    </section>
  );
}
