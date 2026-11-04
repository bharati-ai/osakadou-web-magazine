"use client";

import { useEffect, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { Photo } from "@/components/ui";
import { photos } from "@/lib/photos";
import { MATSURI, jstToday, statusOf, type Status } from "./matsuri";

const fmt = (iso: string, weekday = true) =>
  new Intl.DateTimeFormat("ja-JP", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric", ...(weekday && { weekday: "short" }) }).format(new Date(iso + "T00:00:00Z"));
const rank = (st: Status) => (st.s === "now" ? -1 : st.s === "soon" ? st.days : 1e6);

function Count({ st }: { st: Status | null }) {
  if (!st) return <p className="font-latin text-5xl font-bold text-ink-2" aria-hidden>--</p>;
  if (st.s === "now")
    return (
      <p>
        <span className="font-maru text-4xl font-bold text-shu-ink">開催中</span>
        <span className="mt-1 block text-sm">{st.left === 0 ? "今日が最終日です" : `あと${st.left}日で終了`}</span>
      </p>
    );
  if (st.s === "tba") return <p className="font-maru text-lg font-bold">日程は主催者の発表を確認</p>;
  return (
    <p>
      あと<span className="mx-1 font-latin text-6xl font-bold tabular-nums text-shu-ink">{st.days}</span>日
      <span className="mt-1 block text-sm text-ink-2">{fmt(st.start)}から</span>
    </p>
  );
}

export function MatsuriCountdown() {
  // Counted in the browser so the numbers are never frozen at build time.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(jstToday()), []);

  const list = MATSURI.map((ev) => ({ ev, st: today ? statusOf(ev, today) : null }));
  if (today) list.sort((a, b) => rank(a.st!) - rank(b.st!));

  return (
    <div className="grid gap-6">
      <p className="text-sm text-ink-2" aria-live="polite">
        {today ? <>今日は{fmt(today)}。開催初日までの日数を、日本時間で数えています。</> : "日数を計算しています…"}
      </p>
      <ul className="grid gap-5 sm:grid-cols-2">
        {list.map(({ ev, st }) => (
          <li key={ev.name} className="card-hard flex flex-col overflow-hidden">
            <div className="relative aspect-[3/2]">
              <Photo slot={ev.photo} ar="3:2" fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw" />
              <span className="absolute bottom-2 right-2 rounded-[var(--radius-chip)] bg-night/75 px-2 py-0.5 text-[11px] text-on-night">
                写真：{photos[ev.photo].caption}
              </span>
            </div>
            <div className="grid flex-1 content-start gap-3 p-5">
              <div>
                <h3 className="font-maru text-xl font-bold">{ev.name}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{ev.when}<br />{ev.place}</p>
              </div>
              <Count st={st} />
              <p className="text-[13.5px] leading-relaxed">{ev.note}</p>
              <a
                href={ev.href}
                target="_blank"
                rel="noopener"
                className="mt-auto inline-flex min-h-11 items-center gap-1 text-sm font-bold text-shu-ink underline underline-offset-4"
              >
                {ev.src}<ArrowSquareOut size={14} aria-hidden />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
