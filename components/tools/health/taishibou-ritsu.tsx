"use client";

import { useState } from "react";
import { NumberField, Result, num } from "../fields";
import { bmiOf, cunBae, deurenberg, fmt, jasso, navy } from "./data";
import { BodyFields, Stats, Table, useBody } from "./parts";

export function TaishibouTool() {
  const b = useBody();
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const valid = b.ok.age && b.ok.h && b.ok.w;
  const bmi = valid ? bmiOf(b.hc, b.wk) : null;

  const wa = num(waist), ne = num(neck), hp = num(hip);
  const navyIn = wa !== null && ne !== null && wa > ne && (b.sex === "m" || (hp !== null && hp > 0));
  const nv = valid && navyIn ? navy(b.sex, b.hc, wa!, ne!, hp ?? 0) : null;

  const ests = bmi === null ? [] : [
    { name: "CUN-BAE式（BMI）", v: cunBae(b.sex, bmi, b.a) },
    { name: "Deurenberg式（BMI）", v: deurenberg(b.sex, bmi, b.a) },
    ...(nv !== null && nv > 2 && nv < 70 ? [{ name: "米海軍式（周囲径）", v: nv }] : []),
  ];
  // Whole numbers: the formulas carry errors of several points, so decimals would overstate precision.
  const vs = ests.map((e) => Math.round(e.v));
  const lo = Math.min(...vs), hi = Math.max(...vs);
  const waistLine = b.sex === "m" ? 85 : 90;

  return (
    <div className="grid gap-6">
      <BodyFields b={b} />
      <fieldset className="grid gap-3 rounded-[var(--radius-card)] border border-line p-4">
        <legend className="px-1 text-sm font-bold">周囲径（任意・メジャーで測った値）</legend>
        <p className="text-xs text-ink-2">入力すると、米海軍式でも推定します。ウエストはおへその高さ、首はのど仏のすぐ下、ヒップはいちばん太いところで測ります。</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="ウエスト" unit="cm" value={waist} onChange={setWaist} min={40} max={200} />
          <NumberField label="首まわり" unit="cm" value={neck} onChange={setNeck} min={20} max={70} />
          {b.sex === "f" && <NumberField label="ヒップ" unit="cm" value={hip} onChange={setHip} min={50} max={200} hint="女性の式ではヒップも使います。" />}
        </div>
      </fieldset>
      <Result
        label="推定体脂肪率"
        value={ests.length === 0 ? "-" : hi > lo ? `${lo}〜${hi}` : `${lo}`}
        unit="%"
        sub={ests.length === 0 ? "年齢・身長・体重を入力すると計算します。" : <>式によって数％の幅があります。あくまで推定です。BMIは<b>{fmt(bmi!)}</b>（{jasso(bmi!)}）です。</>}
      />
      {ests.length > 0 && (
        <Table
          caption="推定の方法ごとの結果"
          head={["方法", "体脂肪率", "脂肪量", "除脂肪量"]}
          rows={ests.map((e) => [e.name, `${fmt(e.v)}%`, `${fmt((b.wk * e.v) / 100)}kg`, `${fmt(b.wk * (1 - e.v / 100))}kg`])}
        />
      )}
      {valid && (
        <Stats
          items={[
            { label: "成人の体脂肪率の基準値", value: "なし", note: "e-ヘルスネットによると、成人の基準値はまだ決まっていません。肥満の判定にはBMIを使います。" },
            {
              label: `メタボリックシンドロームの診断基準で使われる腹囲（${b.sex === "m" ? "男性" : "女性"}）`,
              value: `${waistLine}`,
              unit: "cm以上",
              note: <>{wa === null ? "ウエストを入力すると比べられます。" : <>あなたのウエスト {fmt(wa)}cm（{wa >= waistLine ? "基準以上" : "基準未満"}）。</>}腹囲だけでは診断されません。</>,
            },
          ]}
        />
      )}
    </div>
  );
}
