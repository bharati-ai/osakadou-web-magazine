"use client";

import { useState } from "react";
import Link from "next/link";
import { NumberField, Result, num } from "../fields";
import { bmiOf, fmt, leeSkeletalMuscle, normalizedFfmi } from "./data";
import { BodyFields, Stats, useBody } from "./parts";

// AWGS 2019：スクリーニングのふくらはぎ周囲長（男性34cm未満、女性33cm未満）
const CALF = { m: 34, f: 33 };

export function KinnikuTool() {
  const b = useBody();
  const [fat, setFat] = useState("28");
  const [calf, setCalf] = useState("");
  const bf = num(fat), cf = num(calf);
  const fatOk = bf !== null && bf >= 3 && bf <= 60;
  const valid = b.ok.age && b.ok.h && b.ok.w && fatOk;

  const lbm = valid ? b.wk * (1 - bf! / 100) : null;
  const hm = b.hc / 100;
  const ffmi = lbm === null ? null : lbm / hm ** 2;
  const sm = valid ? leeSkeletalMuscle(b.sex, b.wk, b.hc, b.a) : null;
  const bmi = valid ? bmiOf(b.hc, b.wk) : null;

  return (
    <div className="grid gap-6">
      <BodyFields b={b} />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="体脂肪率" unit="%" value={fat} onChange={setFat} min={3} max={60}
          hint={fatOk ? "体組成計の値を入れてください。" : "3〜60%で入力してください。"} />
        <NumberField label="ふくらはぎ周囲長（任意）" unit="cm" value={calf} onChange={setCalf} min={15} max={70}
          hint="ふくらはぎのいちばん太いところ。" />
      </div>
      <p className="-mt-3 text-xs text-ink-2">体脂肪率がわからないときは <Link href="/tools/taishibou-ritsu" className="underline underline-offset-4">体脂肪率計算</Link> で推定できます。</p>
      <Result
        label="除脂肪体重（推定）"
        value={lbm === null ? "-" : fmt(lbm)}
        unit="kg"
        sub={lbm === null ? "年齢・身長・体重・体脂肪率を入力すると計算します。" : <>体重から体脂肪量（{fmt(b.wk - lbm)}kg）を引いた重さです。筋肉のほか、骨や内臓、水分も含みます。</>}
      />
      {valid && (
        <Stats
          items={[
            {
              label: "骨格筋量（推定）",
              value: fmt(sm!),
              unit: "kg",
              note: <>体重の約{fmt((sm! / b.wk) * 100, 0)}%。Lee式{bmi! >= 30 && "（BMI30以上は式の対象外のため参考値）"}</>,
            },
            { label: "FFMI（除脂肪量指数）", value: fmt(ffmi!), note: "除脂肪体重 ÷ 身長(m)の2乗" },
            {
              label: "補正FFMI（身長1.8m換算）",
              value: fmt(normalizedFfmi(ffmi!, b.hc)),
              note: b.sex === "m"
                ? "もとの研究（男性の運動選手のデータ）では、多くの人が25前後までに収まっていました。個人差が大きく、上限を示す値ではありません。"
                : "もとの研究は男性のデータで、女性向けの目安はありません。",
            },
            ...(cf !== null && cf > 0
              ? [{
                  label: "ふくらはぎ周囲長",
                  value: fmt(cf),
                  unit: "cm",
                  note: cf < CALF[b.sex] ? `AWGS 2019のスクリーニング基準（${CALF[b.sex]}cm未満）にあてはまります。気になるときは医療機関へ。` : `スクリーニング基準（${CALF[b.sex]}cm未満）にはあてはまりません。`,
                }]
              : []),
          ]}
        />
      )}
      <div className="rounded-[var(--radius-card)] bg-band p-4 text-sm leading-relaxed">
        <p className="font-bold">SMI（骨格筋指数）を表示しない理由</p>
        <p className="mt-1">サルコペニアの診断に使うSMIは、腕と脚の筋肉量をDXAや体組成計（BIA）で測り、身長の2乗で割った値です。身長・体重・体脂肪率だけでこの「腕と脚の筋肉量」を十分な精度で推定できる式は確認できなかったため、計算していません。代わりに、アジアの基準（AWGS 2019）が最初のチェックに使う、ふくらはぎ周囲長を比べられるようにしています。</p>
      </div>
    </div>
  );
}
