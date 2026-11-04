"use client";

import { useState } from "react";
import { Choice, Result } from "../fields";
import { KCAL_PER_G, KCAL_PER_KG_FAT, balanceGoal, bmiOf, fmt, ganpule, ganpuleInRange, palFor, proteinRda, type PalLevel } from "./data";
import { BodyFields, PalChoice, Stats, Table, useBody } from "./parts";

type Goal = "lose" | "keep" | "gain";
// 目標量（%エネルギー）の範囲内で、このツールが置く配分。減量・増量はたんぱく質を上限寄りにする。
const SPLIT: Record<Goal, { p: number; f: number; c: number }> = {
  lose: { p: 20, f: 25, c: 55 },
  keep: { p: 15, f: 25, c: 60 },
  gain: { p: 20, f: 25, c: 55 },
};
// 体脂肪1kg ≒ 7,000kcal（身体活動・運動ガイド2023）を、月1kgのペースにあてはめた1日あたりの差
const DELTA = Math.round(KCAL_PER_KG_FAT / 30);
const NAMES = { p: "たんぱく質", f: "脂質", c: "炭水化物" } as const;

export function PfcTool() {
  const b = useBody();
  const [level, setLevel] = useState<PalLevel>("mid");
  const [goal, setGoal] = useState<Goal>("keep");
  const valid = b.ok.age && b.ok.h && b.ok.w;
  const age = b.ok.age ? b.a : 35;
  const pal = palFor(age)[level] ?? palFor(age).mid!;
  const bmr = valid ? ganpule(b.sex, b.wk, b.hc, b.a) : null;
  const tdee = bmr === null ? null : bmr * pal;
  // BMI under 18.5: 減量 is not offered (Guide 2023 frames weight loss for people with obesity)
  const thin = b.ok.h && b.ok.w && bmiOf(b.hc, b.wk) < 18.5;
  const g: Goal = thin && goal === "lose" ? "keep" : goal;
  const kcal = tdee === null ? null : tdee + (g === "lose" ? -DELTA : g === "gain" ? DELTA : 0);
  const split = SPLIT[g];
  const range = balanceGoal(age);
  const grams = (k: keyof typeof NAMES, pct: number) => (kcal! * pct) / 100 / KCAL_PER_G[k];
  const pG = kcal === null ? 0 : grams("p", split.p);
  const rda = proteinRda(b.sex, age);

  return (
    <div className="grid gap-6">
      <BodyFields b={b} />
      <PalChoice value={level} onChange={setLevel} age={age} />
      <Choice label="目的" value={g} onChange={setGoal}
        options={[...(thin ? [] : [{ value: "lose" as const, label: "減量" }]), { value: "keep", label: "維持" }, { value: "gain", label: "増量" }]} />
      {thin && (
        <p className="rounded-[var(--radius-card)] bg-band p-4 text-sm leading-relaxed">
          今のBMIは低体重（18.5未満）の範囲です。減量はおすすめできないため、「減量」は表示していません。体重や食事のことは、医療機関や管理栄養士に相談してください。
        </p>
      )}
      <Result
        label="1日の目標エネルギー（目安）"
        value={kcal === null ? "-" : fmt(kcal, 0)}
        unit="kcal"
        sub={
          kcal === null ? "年齢・身長・体重を入力すると計算します。"
          : <>
              {g === "keep" ? <>基礎代謝量 {fmt(bmr!, 0)}kcal × 身体活動レベル {pal.toFixed(2)}で、今の体重を保つ目安です。</>
              : <>維持の目安 {fmt(tdee!, 0)}kcal から約{DELTA}kcal{g === "lose" ? "減らした" : "増やした"}量で、月におよそ1kgのペースにあたります。</>}
              {!ganpuleInRange(b.a) && " 基礎代謝量の式は20〜74歳のデータによるため、参考値です。"}
            </>
        }
      />
      {kcal !== null && (
        <>
          <div aria-hidden className="flex h-9 overflow-hidden rounded-full text-xs font-bold">
            {(["p", "f", "c"] as const).map((k, i) => (
              <span key={k} style={{ width: `${split[k]}%` }} className={`grid place-items-center ${["bg-shu text-on-shu", "bg-shu/45 text-ink", "bg-shu/20 text-ink"][i]}`}>
                {k.toUpperCase()} {split[k]}%
              </span>
            ))}
          </div>
          <Table
            caption="エネルギー産生栄養素の配分（Pはたんぱく質、Fは脂質、Cは炭水化物）"
            head={["栄養素", "配分", "1日の量", "目標量の範囲"]}
            rows={(["p", "f", "c"] as const).map((k) => [
              NAMES[k],
              `${split[k]}%`,
              <b key="g" className="whitespace-nowrap">{fmt(grams(k, split[k]), 0)}g</b>,
              <span key="r" className="whitespace-nowrap">{range[k][0]}〜{range[k][1]}%<br /><span className="text-xs text-ink-2">{fmt(grams(k, range[k][0]), 0)}〜{fmt(grams(k, range[k][1]), 0)}g</span></span>,
            ])}
          />
          <Stats
            items={[
              { label: "たんぱく質の推奨量", value: `${rda}`, unit: "g/日", note: <>この計算では{fmt(pG, 0)}g（{pG >= rda ? "推奨量以上" : "推奨量に届きません。配分を見直してください"}）</> },
              { label: "体重1kgあたりのたんぱく質", value: fmt(pG / b.wk), unit: "g" },
              { label: "基礎代謝量（推定）", value: fmt(bmr!, 0), unit: "kcal/日", note: kcal < bmr! ? "目標が基礎代謝量を下回っています。" : "国立健康・栄養研究所の式" },
            ]}
          />
        </>
      )}
    </div>
  );
}
