"use client";

import { useEffect, useState } from "react";
import { Choice, NumberField, Result, num } from "../fields";
import { useWeather } from "./shared";

type Act = "low" | "mid" | "high";
const ACT: Record<Act, { label: string; add: number }> = {
  low: { label: "低い（座っている時間が長い）", add: 0 },
  mid: { label: "ふつう（通勤や家事でよく動く）", add: 0.5 },
  high: { label: "高い（立ち仕事・運動の習慣）", add: 1.0 },
};

/**
 * 飲み物でとる水分の目安（L/日）。推定です。
 * - 基本：環境省「健康のため水を飲もう」推進運動の図（成人男性の例）で、飲み水は1日1.2L。体重60kgを基準に比例させ、体重は40〜90kgに収める（当サイトの仮定）。
 * - 活動：日本人の食事摂取基準（2020年版）で、水の必要量は活動レベルが低い集団で2.3〜2.5L/日、高い集団で3.3〜3.5L/日程度と推定。その差（約1L）を上乗せ。
 * - 気温：汗の分として、最高25℃以上で+0.25L、30℃以上で+0.5L（当サイトの仮定）。
 */
export function waterGuide(kg: number, act: Act, maxTemp: number) {
  // ponytail: weight is clamped to 40–90 kg so heavy or light inputs don't give extreme amounts
  const base = 1.2 * (Math.min(90, Math.max(40, kg)) / 60);
  const heat = maxTemp >= 30 ? 0.5 : maxTemp >= 25 ? 0.25 : 0;
  const total = Math.round((base + ACT[act].add + heat) * 10) / 10;
  return { base, act: ACT[act].add, heat, total, cups: Math.round(total / 0.2) };
}

export function SuibunMeyasuTool() {
  const w = useWeather();
  const [kg, setKg] = useState("60");
  const [act, setAct] = useState<Act>("low");
  const [temp, setTemp] = useState("25");
  const [touched, setTouched] = useState(false);
  const osakaMax = w.data ? Math.round(w.data.daily[0].max) : null;
  useEffect(() => {
    if (osakaMax !== null && !touched) setTemp(String(osakaMax));
  }, [osakaMax, touched]);

  const k = num(kg), t = num(temp);
  const valid = k !== null && k >= 30 && k <= 200 && t !== null && t > -20 && t < 45;
  const g = valid ? waterGuide(k, act, t) : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="体重" unit="kg" value={kg} onChange={setKg} min={30} max={200} hint={k !== null && (k < 40 || k > 90) ? "大人向けの目安です。体重は40〜90kgの範囲で計算します。" : undefined} />
        <NumberField
          label="その日の最高気温"
          unit="℃"
          value={temp}
          onChange={(v) => { setTouched(true); setTemp(v); }}
          min={-20}
          max={45}
          step={1}
          hint={osakaMax !== null ? `今日の大阪の予想最高気温は${osakaMax}℃です${touched ? "" : "（自動で入れています）"}。` : w.error ? "予報を読み込めませんでした。気温を入力してください。" : "今日の大阪の予報を読み込み中です。"}
        />
      </div>
      <Choice label="ふだんの活動量" value={act} onChange={setAct} options={(Object.keys(ACT) as Act[]).map((a) => ({ value: a, label: ACT[a].label }))} />

      <Result
        label="飲み物でとりたい水分の目安（1日）"
        value={g ? g.total.toFixed(1) : "-"}
        unit="L"
        sub={g ? <>コップ（200mL）でおよそ<b>{g.cups}杯</b>。食事に含まれる水分とは別に、飲み物でとる量の推定です。</> : "体重と気温を入力してください。"}
      />

      {g && (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-[var(--radius-card)] border border-line p-4 text-sm">
          <dt>基本（体重から。40〜90kgの範囲で計算）</dt><dd className="text-right tabular-nums">{g.base.toFixed(2)} L</dd>
          <dt>活動量の上乗せ</dt><dd className="text-right tabular-nums">+{g.act.toFixed(2)} L</dd>
          <dt>気温の上乗せ（汗の分）</dt><dd className="text-right tabular-nums">+{g.heat.toFixed(2)} L</dd>
        </dl>
      )}

      <section aria-labelledby="suibun-when">
        <h2 id="suibun-when" className="font-maru text-lg font-bold">飲むタイミングのコツ</h2>
        <ul className="mt-3 grid gap-2 text-[15px]">
          {[
            "一度にたくさんではなく、早めに、こまめに。",
            "起きたときと寝る前に、コップ1杯を習慣に。",
            "運動の前・最中・あと、入浴の前後にも。",
            "のどが渇いたと感じる前に飲むのがポイントです。",
          ].map((s) => (
            <li key={s} className="flex gap-2"><span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-shu" />{s}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
