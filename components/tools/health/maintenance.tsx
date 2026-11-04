"use client";

import { useState } from "react";
import { Result } from "../fields";
import { BMR_REF, PAL_LABEL, fmt, ganpule, ganpuleInRange, palFor, rowFor, type PalLevel } from "./data";
import { BodyFields, PalChoice, Stats, useBody } from "./parts";

export function MaintenanceTool() {
  const b = useBody();
  const [level, setLevel] = useState<PalLevel>("mid");
  const valid = b.ok.age && b.ok.h && b.ok.w;
  const age = b.ok.age ? b.a : 35;
  const bmr = valid ? ganpule(b.sex, b.wk, b.hc, b.a) : null;
  const all = palFor(age);
  const eff: PalLevel = all[level] === null ? "mid" : level; // 75歳以上に「高い」はない
  const pal = all[eff]!;
  const ref = rowFor(BMR_REF[b.sex], age)!;

  return (
    <div className="grid gap-6">
      <BodyFields b={b} />
      <PalChoice value={level} onChange={setLevel} age={age} />
      <Result
        label={bmr !== null && !ganpuleInRange(b.a) ? "メンテナンスカロリー（推定・参考値）" : "メンテナンスカロリー（推定）"}
        value={bmr === null ? "-" : fmt(bmr * pal, 0)}
        unit="kcal/日"
        sub={bmr === null ? "年齢・身長・体重を入力すると計算します。" : <>
          基礎代謝量 {fmt(bmr, 0)}kcal × 身体活動レベル {pal.toFixed(2)}。今の体重を保つためのおおよその量です。
          {!ganpuleInRange(b.a) && " 基礎代謝量の式の対象は20〜74歳のため、この年齢では参考値です。"}
        </>}
      />
      {bmr !== null && (
        <Stats
          items={[
            ...(Object.keys(PAL_LABEL) as PalLevel[]).map((k) => ({
              label: `活動量「${PAL_LABEL[k]}」の場合`,
              value: all[k] === null ? "-" : fmt(bmr * all[k]!, 0),
              unit: all[k] === null ? undefined : "kcal/日",
              note: all[k] === null ? "75歳以上は基準値がありません。" : `× ${all[k]!.toFixed(2)}`,
            })),
            { label: `参照体位の人の場合（${ref.ages}）`, value: fmt(ref.bmr * pal, 0), unit: "kcal/日", note: <>参照体重{fmt(ref.refW)}kg・活動量「{PAL_LABEL[eff]}」で計算</> },
          ]}
        />
      )}
    </div>
  );
}
