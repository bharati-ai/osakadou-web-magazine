"use client";

import { useId, useState } from "react";
import { Choice, Result } from "../fields";

const CYCLE = 90; // 約90分（e-ヘルスネット）。個人差あり

type Age = "adult" | "senior" | "teen" | "child";
// 厚生労働省「健康づくりのための睡眠ガイド2023」の推奨（成人6時間以上、高齢者は床上時間8時間未満、中高生8〜10時間、小学生9〜12時間）
const AGES: Record<Age, { label: string; cycles: number[]; target: number; rule: string; ok: (sleepMin: number, bedMin: number) => boolean }> = {
  adult: { label: "成人", cycles: [3, 4, 5, 6], target: 450, rule: "6時間以上を目安に", ok: (s) => s >= 360 && s <= 540 },
  senior: { label: "高齢者", cycles: [3, 4, 5, 6], target: 450, rule: "床にいる時間が8時間以上にならないように", ok: (s, b) => s >= 360 && b < 480 },
  teen: { label: "中学・高校生", cycles: [4, 5, 6, 7], target: 540, rule: "8〜10時間を参考に", ok: (s) => s >= 480 && s <= 600 },
  child: { label: "小学生", cycles: [5, 6, 7], target: 630, rule: "9〜12時間を参考に", ok: (s) => s >= 540 && s <= 720 },
};

const toMin = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const fmt = (m: number) => {
  const x = ((m % 1440) + 1440) % 1440;
  return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, "0")}`;
};
const dur = (m: number) => `${Math.floor(m / 60)}時間${m % 60 ? `${m % 60}分` : ""}`;

export function sleepPlans(mode: "wake" | "bed", time: number, latency: number, age: Age) {
  const a = AGES[age];
  // listed in clock order: longest sleep first when counting back from the wake time
  const plans = (mode === "wake" ? [...a.cycles].reverse() : a.cycles).map((n) => {
    const sleep = n * CYCLE;
    const at = mode === "wake" ? time - sleep - latency : time + latency + sleep;
    return { n, sleep, at, ok: a.ok(sleep, sleep + latency) };
  });
  const pool = plans.some((p) => p.ok) ? plans.filter((p) => p.ok) : plans;
  const best = pool.reduce((x, y) => (Math.abs(y.sleep - a.target) < Math.abs(x.sleep - a.target) ? y : x));
  return { plans, best };
}

export function SuiminCycleTool() {
  const id = useId();
  const [mode, setMode] = useState<"wake" | "bed">("wake");
  const [wake, setWake] = useState("07:00");
  const [bed, setBed] = useState("23:00");
  const [lat, setLat] = useState("15");
  const [age, setAge] = useState<Age>("adult");
  const time = toMin(mode === "wake" ? wake : bed);
  const latency = Number(lat);
  const r = time === null ? null : sleepPlans(mode, time, latency, age);
  const a = AGES[age];

  return (
    <div className="grid gap-6">
      <Choice label="何から計算しますか" value={mode} onChange={setMode} options={[{ value: "wake", label: "起きたい時刻から" }, { value: "bed", label: "寝る時刻から" }]} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor={id} className="text-sm font-bold">{mode === "wake" ? "起きたい時刻" : "布団に入る時刻"}</label>
          <input
            id={id}
            type="time"
            value={mode === "wake" ? wake : bed}
            onChange={(e) => (mode === "wake" ? setWake : setBed)(e.target.value)}
            className="h-12 w-full rounded-[10px] border-2 border-line-strong bg-paper px-3 text-lg font-bold tabular-nums outline-none focus:border-shu"
          />
          {time === null && <p className="text-xs text-ink-2">時刻を入れると計算します（例：7:00）。</p>}
        </div>
        <Choice label="寝つくまでの時間" value={lat} onChange={setLat} options={["5", "15", "30"].map((v) => ({ value: v, label: `${v}分` }))} />
      </div>
      <Choice label="年代" value={age} onChange={setAge} options={(Object.keys(AGES) as Age[]).map((k) => ({ value: k, label: AGES[k].label }))} />

      {r && (
        <>
          <Result
            label={mode === "wake" ? "おすすめの布団に入る時刻" : "おすすめの起きる時刻"}
            value={fmt(r.best.at)}
            sub={<>{r.best.n}サイクル・睡眠 <b>{dur(r.best.sleep)}</b>＋寝つくまで{latency}分。{a.label}は「{a.rule}」が目安です。</>}
          />
          <section aria-labelledby={`${id}-list`}>
            <h2 id={`${id}-list`} className="font-maru text-lg font-bold">{mode === "wake" ? "布団に入る時刻の候補" : "起きる時刻の候補"}</h2>
            <ul className="mt-3 grid gap-2">
              {r.plans.map((p) => (
                <li key={p.n} className={`flex items-center justify-between gap-3 rounded-[10px] border-2 px-4 py-3 ${p === r.best ? "border-shu" : "border-line"}`}>
                  <span className="grid">
                    <span className="font-latin text-3xl font-bold tabular-nums text-shu-ink">{fmt(p.at)}</span>
                    <span className="text-sm text-ink-2">{p.n}サイクル・睡眠{dur(p.sleep)}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${p.ok ? "bg-shu text-on-shu" : "bg-paper-2 text-ink-2"}`}>
                    {p.ok ? "目安の範囲" : p.sleep < a.target ? "短め" : "長め"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-2">1サイクルを約90分として計算しています。サイクルの長さは人によって、また一晩のなかでも変わります。</p>
          </section>
        </>
      )}
    </div>
  );
}
