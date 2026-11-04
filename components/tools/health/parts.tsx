"use client";

import { useState } from "react";
import Link from "next/link";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { Choice, NumberField, num } from "../fields";
import { PAL_LABEL, palFor, type PalLevel, type Sex } from "./data";

/** Sex / age / height / weight state shared by most body tools. Gentle range checks, never blocks typing. */
export function useBody(init: { sex?: Sex; age?: string; h?: string; w?: string } = {}, minAge = 18) {
  const [sex, setSex] = useState<Sex>(init.sex ?? "f");
  const [age, setAge] = useState(init.age ?? "35");
  const [h, setH] = useState(init.h ?? "158");
  const [w, setW] = useState(init.w ?? "53");
  const a = num(age), hc = num(h), wk = num(w);
  const ok = {
    age: a !== null && a >= minAge && a <= 100,
    h: hc !== null && hc >= 120 && hc <= 220,
    w: wk !== null && wk >= 25 && wk <= 250,
  };
  /** Under 18: adult BMI bands and target weights do not apply, so tools hide them. */
  const minor = a !== null && a >= 1 && a < 18;
  return { sex, setSex, age, setAge, h, setH, w, setW, a: a ?? 0, hc: hc ?? 0, wk: wk ?? 0, ok, minAge, minor };
}
export type Body = ReturnType<typeof useBody>;

export function BodyFields({ b, sex = true, age = true, weight = true }: { b: Body; sex?: boolean; age?: boolean; weight?: boolean }) {
  return (
    <div className="grid gap-4">
      {sex && <SexChoice value={b.sex} onChange={b.setSex} />}
      <div className="grid gap-4 sm:grid-cols-3">
        {age && (
          <NumberField label="年齢" unit="歳" value={b.age} onChange={b.setAge} min={b.minAge} max={100} step={1}
            hint={b.ok.age || b.minor ? undefined : `${b.minAge}〜100歳で入力してください。`} />
        )}
        <NumberField label="身長" unit="cm" value={b.h} onChange={b.setH} min={120} max={220}
          hint={b.ok.h ? undefined : "120〜220cmで入力してください。"} />
        {weight && (
          <NumberField label="体重" unit="kg" value={b.w} onChange={b.setW} min={25} max={250}
            hint={b.ok.w ? undefined : "25〜250kgで入力してください。"} />
        )}
      </div>
      {age && b.minor && <Under18 />}
    </div>
  );
}

export function Under18() {
  return (
    <p role="note" className="rounded-[var(--radius-card)] bg-band p-4 text-sm leading-relaxed">
      18歳未満の方は成長の途中にあるため、大人のBMIの判定や目標体重はあてはまりません。子どもの体格は
      <Link href="/tools/kaup-shisuu" className="font-bold text-shu-ink underline underline-offset-4">カウプ指数計算</Link>
      の肥満度で確かめられます。体重のことで気になるときは、学校の保健室の先生やかかりつけの小児科に相談してください。
    </p>
  );
}

/** Where to talk about eating or weight worries (verified NCNP pages). */
export function EdHelp() {
  return (
    <p className="text-sm leading-relaxed text-ink-2">
      食事や体重のことで悩んだら、
      <a href="https://edcenter.ncnp.go.jp/edportal_general/" target="_blank" rel="noopener" className="underline underline-offset-4">摂食障害情報ポータルサイト</a>
      （国立精神・神経医療研究センター）の情報や、
      <a href="https://edcenter.ncnp.go.jp/consultation.html" target="_blank" rel="noopener" className="underline underline-offset-4">摂食障害全国支援センターの相談窓口</a>
      の案内も参考にしてください。お住まいの地域の精神保健福祉センターでも相談できます。
    </p>
  );
}

export function SexChoice({ value, onChange }: { value: Sex; onChange: (v: Sex) => void }) {
  return <Choice label="性別" value={value} onChange={onChange} options={[{ value: "f", label: "女性" }, { value: "m", label: "男性" }]} />;
}

// 食事摂取基準（2025年版）の身体活動レベルの説明を、短く言い換えたもの
const PAL_HELP: Record<PalLevel, string> = {
  low: "一日の大半を座って過ごし、体を動かすことが少ない。",
  mid: "座り仕事が中心でも、通勤や買い物での歩行、家事、立ち作業、軽い運動などをしている。",
  high: "立ち仕事や移動の多い仕事をしている、または活発な運動の習慣がある。",
};

export function PalChoice({ value, onChange, age }: { value: PalLevel; onChange: (v: PalLevel) => void; age: number }) {
  const pal = palFor(age);
  const levels = (Object.keys(PAL_LABEL) as PalLevel[]).filter((k) => pal[k] !== null);
  return (
    <div className="grid gap-1.5">
      <Choice label="ふだんの活動量（身体活動レベル）" value={value} onChange={onChange}
        options={levels.map((k) => ({ value: k, label: `${PAL_LABEL[k]}（${pal[k]!.toFixed(2)}）` }))} />
      <p className="text-xs text-ink-2">{pal[value] === null ? "75歳以上には「高い」の基準値がないため、「ふつう」で計算しています。" : PAL_HELP[value]}</p>
    </div>
  );
}
/** Small secondary results under the big Result. */
export function Stats({ items }: { items: { label: string; value: string; unit?: string; note?: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-[var(--radius-card)] border border-line bg-card p-4">
          <dt className="text-xs font-bold text-ink-2">{it.label}</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums">
            {it.value}
            {it.unit && <span className="ml-0.5 whitespace-nowrap text-sm font-normal">{it.unit}</span>}
          </dd>
          {it.note && <dd className="mt-1 text-xs leading-relaxed text-ink-2">{it.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Prominent caution box (one 朱 accent). */
export function Alert({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="note" className="flex gap-3 rounded-[var(--radius-card)] border-2 border-shu bg-band p-4">
      <Warning size={24} weight="fill" className="mt-0.5 shrink-0 text-shu" aria-hidden />
      <div className="text-sm leading-relaxed">
        <p className="font-bold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

/** Simple data table. `mark` highlights a row (e.g. the reader's age group). */
export function Table({ caption, head, rows, mark }: { caption: string; head: string[]; rows: React.ReactNode[][]; mark?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-sm tabular-nums">
        <caption className="mb-2 text-left text-xs text-ink-2">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-line text-left text-xs text-ink-2">
            {head.map((x) => <th key={x} scope="col" className="px-2 py-2 font-bold">{x}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-line ${i === mark ? "bg-band font-bold" : ""}`}>
              {r.map((c, j) => (j === 0 ? <th key={j} scope="row" className="min-w-[5.5em] px-2 py-2 text-left font-bold">{c}</th> : <td key={j} className="whitespace-nowrap px-2 py-2">{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Collapsible reference block (keeps the tool short on mobile). */
export function More({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-[var(--radius-card)] border border-line bg-card px-4 py-1">
      <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-bold [&::-webkit-details-marker]:hidden">
        <span className="mr-1 inline-block text-shu transition-transform group-open:rotate-90" aria-hidden>›</span>
        {title}
      </summary>
      <div className="grid gap-3 pb-4 pt-2">{children}</div>
    </details>
  );
}
