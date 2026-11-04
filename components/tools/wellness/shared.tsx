"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowClockwise, CheckSquare, Square } from "@phosphor-icons/react";
import type { Weather } from "@/lib/weather";

/** Live Osaka weather from /api/weather, refreshed every 10 minutes. */
export function useWeather() {
  const [data, setData] = useState<Weather | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/weather");
      if (!r.ok) throw new Error(String(r.status));
      setData((await r.json()) as Weather);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 600_000);
    return () => clearInterval(id);
  }, [load]);
  return { data, error, reload: load };
}

/** Skeleton while loading, a gentle retry box on error, otherwise the children. */
export function WeatherGate({ w, children }: { w: ReturnType<typeof useWeather>; children: (d: Weather) => React.ReactNode }) {
  if (w.data) return <>{children(w.data)}</>;
  if (w.error)
    return (
      <div role="alert" className="grid justify-items-start gap-3 rounded-[var(--radius-card)] bg-band p-5">
        <p className="font-bold">いま天気データを読み込めませんでした。</p>
        <p className="text-sm text-ink-2">通信状況を確かめて、少し時間をおいてからもう一度お試しください。</p>
        <button type="button" onClick={w.reload} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-shu px-5 text-sm font-bold text-shu-ink">
          <ArrowClockwise size={18} aria-hidden /> 再読み込み
        </button>
      </div>
    );
  return (
    <div aria-busy="true" aria-label="天気データを読み込み中" className="grid animate-pulse motion-reduce:animate-none gap-4">
      <div className="h-32 rounded-[var(--radius-card)] bg-band" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-[var(--radius-card)] bg-paper-2" />)}
      </div>
      <div className="h-28 rounded-[var(--radius-card)] bg-paper-2" />
    </div>
  );
}

/** Five-step level shown as filled pills, with a readable label for screen readers. */
export function Level({ level, label }: { level: number; label: string }) {
  return (
    <span role="img" aria-label={`${label}：5段階中${level}`} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-2 w-5 rounded-full ${i <= level ? "bg-shu" : "bg-line"}`} />
      ))}
    </span>
  );
}

/** One outlook card: title, level, short value and a note. */
export function LevelCard({ title, level, value, note }: { title: string; level: number; value: string; note: string }) {
  return (
    <div className="grid content-start gap-1.5 rounded-[var(--radius-card)] border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{title}</p>
        <Level level={level} label={title} />
      </div>
      <p className="font-maru text-lg font-bold text-shu-ink">{value}</p>
      <p className="text-xs leading-relaxed text-ink-2">{note}</p>
    </div>
  );
}

export const clamp5 = (n: number) => Math.max(1, Math.min(5, Math.round(n)));
export const hourLabel = (t: string) => `${Number(t.slice(11, 13))}時`;
export const updatedLabel = (w: Weather) =>
  `${new Date(w.fetchedAt).toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "numeric", minute: "2-digit" })}更新・10分ごとに自動更新`;

/** Checklist state kept in localStorage. Storage can be blocked, so every access is wrapped. */
export function useChecked(key: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) setChecked(JSON.parse(s));
    } catch {
      /* private mode or blocked storage: start empty */
    }
  }, [key]);
  const toggle = (id: string) =>
    setChecked((c) => {
      const next = { ...c, [id]: !c[id] };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* keep in memory only */
      }
      return next;
    });
  const reset = () => {
    setChecked({});
    try {
      localStorage.removeItem(key);
    } catch {
      /* nothing to clear */
    }
  };
  return { checked, toggle, reset };
}

/** A checklist row with a 44px tap target. */
export function CheckRow({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      <span className="mt-0.5 shrink-0 text-shu" aria-hidden>
        {checked ? <CheckSquare size={24} weight="fill" /> : <Square size={24} />}
      </span>
      <span className={`min-w-0 flex-1 ${checked ? "text-ink-2 line-through decoration-1" : ""}`}>{children}</span>
    </label>
  );
}

/** Multi-select pill (checkbox) styled like the shared Choice pills. */
export function TogglePill({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line px-4 text-sm font-bold has-[:checked]:border-shu has-[:checked]:bg-shu has-[:checked]:text-on-shu has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-shu">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
