"use client";

import { BandScale, Result } from "../fields";
import { AVERAGES, JASSO, NHNS, bmiOf, fmt, jasso, rowFor, signed, targetBmi, weightAt } from "./data";
import { BodyFields, More, Stats, Table, useBody } from "./parts";

export function BmiTool() {
  const b = useBody();
  const valid = b.ok.h && b.ok.w;
  const bmi = valid ? bmiOf(b.hc, b.wk) : null;
  const rows = AVERAGES[b.sex];
  const avg = b.ok.age ? rowFor(rows, b.a) : undefined;
  const [lo, hi] = targetBmi(b.ok.age ? b.a : 30);
  const who = b.sex === "f" ? "女性" : "男性";
  const std = valid ? weightAt(22, b.hc) : null;

  // one tree (no early return): swapping roots would remount the inputs and drop focus mid-typing
  return (
    <div className="grid gap-6">
      <BodyFields b={b} />
      {!b.minor && (<>
      <Result
        label="あなたのBMI"
        value={bmi === null ? "-" : fmt(bmi)}
        sub={bmi === null ? "身長と体重を入力すると計算します。" : <>判定：<b>{jasso(bmi)}</b>（日本肥満学会の区分）</>}
      />
      <BandScale min={15} max={45} value={bmi} bands={JASSO} />
      {std !== null && (
        <Stats
          items={[
            { label: "標準体重（BMI22）", value: fmt(std), unit: "kg", note: <>今の体重との差 {signed(b.wk - std)}kg</> },
            {
              label: b.ok.age ? `目標とするBMIの体重（${b.a}歳）` : "目標とするBMIの体重",
              value: `${fmt(weightAt(lo, b.hc))}〜${fmt(weightAt(hi, b.hc))}`,
              unit: "kg",
              note: <>BMI {fmt(lo)}〜{fmt(hi)}（食事摂取基準2025年版）</>,
            },
            avg
              ? {
                  label: `${who}${avg.ages}の平均体重`,
                  value: fmt(avg.w),
                  unit: "kg",
                  note: <>平均身長{fmt(avg.h)}cm・平均BMI{fmt(avg.bmi)}。あなたのBMIとの差 {signed(bmi! - avg.bmi)}</>,
                }
              : { label: "同年代の平均体重", value: "-", note: "20歳以上の平均を掲載しています。" },
          ]}
        />
      )}
      <More title={`${who}の年代別の平均（${NHNS}）`} open>
        <Table
          caption={`${NHNS}報告 第14表・第15表（全国補正値）より`}
          head={["年齢", "平均身長", "平均体重", "平均BMI"]}
          rows={rows.map((r) => [r.ages, `${fmt(r.h)}cm`, `${fmt(r.w)}kg`, fmt(r.bmi, 2)])}
          mark={avg ? rows.indexOf(avg) : undefined}
        />
        <p className="text-xs text-ink-2">平均は身長も年代で違うため、体重どうしより、BMIどうしで比べるほうが参考になります。</p>
      </More>
      </>)}
    </div>
  );
}
