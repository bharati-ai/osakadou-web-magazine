"use client";

import { useId } from "react";

/** Shared, accessible form pieces for every tool. Labels above inputs; numbers use inputMode="decimal". */

export function NumberField({
  label, unit, value, onChange, min, max, step = 0.1, hint,
}: {
  label: string; unit?: string; value: string; onChange: (v: string) => void;
  min?: number; max?: number; step?: number; hint?: string;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      <div className="flex items-center rounded-[10px] border-2 border-line-strong bg-paper focus-within:border-shu">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? `${id}-h` : undefined}
          className="h-12 w-full min-w-0 bg-transparent px-3 text-lg font-bold tabular-nums outline-none"
        />
        {unit && <span className="shrink-0 whitespace-nowrap px-3 text-sm text-ink-2">{unit}</span>}
      </div>
      {hint && <p id={`${id}-h`} className="text-xs text-ink-2">{hint}</p>}
    </div>
  );
}

export function Choice<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  const name = useId();
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line px-4 py-2 text-sm font-bold has-[:checked]:border-shu has-[:checked]:bg-shu has-[:checked]:text-on-shu has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-shu"
          >
            <input type="radio" name={name} value={o.value} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Big result number. Announced politely to screen readers when it changes. */
export function Result({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub?: React.ReactNode }) {
  return (
    <div aria-live="polite" className="rounded-[var(--radius-card)] bg-band p-5">
      <p className="text-sm font-bold text-ink-2">{label}</p>
      {/* long Japanese values (e.g. 「よく乾く」) get a smaller, rounded-gothic setting */}
      <p className={`mt-1 font-bold tabular-nums text-shu-ink ${/^[\d.,\-+〜~ /:%]+$/.test(value) ? "font-latin text-5xl" : "font-maru text-3xl leading-snug"}`}>
        {value}
        {unit && <span className="ml-1 font-sans text-lg text-ink">{unit}</span>}
      </p>
      {sub && <div className="mt-2 text-sm">{sub}</div>}
    </div>
  );
}

/** A banded scale with a marker (e.g. BMI categories). Bands are labelled; no progress-bar track. */
export function BandScale({
  min, max, value, bands,
}: {
  min: number; max: number; value: number | null; bands: { to: number; label: string }[];
}) {
  const pct = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
  let from = min;
  return (
    <div className="mt-4">
      <div className="relative flex h-3 overflow-hidden rounded-full" aria-hidden>
        {bands.map((b, i) => {
          const w = `calc(${pct(Math.min(b.to, max))} - ${pct(from)})`;
          from = b.to;
          return <span key={b.label} style={{ width: w, opacity: 0.25 + (i / bands.length) * 0.75 }} className="bg-shu" />;
        })}
        {value !== null && <span className="absolute top-[-3px] h-[18px] w-1 rounded bg-ink" style={{ left: pct(value) }} />}
      </div>
      <ol className="mt-1 flex text-[11px] text-ink-2" aria-hidden>
        {(() => { let f = min; return bands.map((b) => { const w = `calc(${pct(Math.min(b.to, max))} - ${pct(f)})`; f = b.to; return <li key={b.label} style={{ width: w }} className="truncate text-center">{b.label}</li>; }); })()}
      </ol>
    </div>
  );
}

export const num = (s: string) => (s.trim() === "" || Number.isNaN(Number(s)) ? null : Number(s));
