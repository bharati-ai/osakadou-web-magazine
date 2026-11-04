"use client";

import { Result } from "../fields";
import { bmiOf, fmt, jasso, signed, targetBmi, weightAt } from "./data";
import { Alert, BodyFields, EdHelp, More, Stats, Table, useBody } from "./parts";

/** Weight at a fixed BMI (標準体重 22 / 美容体重 20 / シンデレラ体重 18) with health context. */
export function TargetWeightTool({ bmi: target, name }: { bmi: number; name: string }) {
  const b = useBody();
  const tw = b.ok.h ? weightAt(target, b.hc) : null;
  const cur = b.ok.h && b.ok.w ? bmiOf(b.hc, b.wk) : null;
  const [lo, hi] = targetBmi(b.ok.age ? b.a : 30);
  const low = target < 18.5; // シンデレラ体重: the headline becomes the 18.5 boundary, never the BMI18 weight
  const ageLabel = b.ok.age ? `${b.a}歳` : "あなたの年代";
  const heights = Array.from({ length: 10 }, (_, i) => 140 + i * 5);
  const cols = low ? [18.5, 22, target] : [target, ...(target !== 22 ? [22] : []), 18.5];

  // 美容体重: no "kg to lose" for people who are already 普通体重 or 低体重
  const diff = cur === null || tw === null ? null
    : target === 20 && cur < 25 ? <>今の体重は{jasso(cur)}の範囲です。</>
    : <>今の体重との差 <b>{signed(b.wk - tw)}kg</b></>;

  return (
    <div className="grid gap-6">
      <BodyFields b={b} sex={false} />
      {low && (
        <Alert title={`BMI${target}は「低体重」にあたります。健康の目標にはしないでください。`}>
          日本肥満学会の区分では、BMI18.5未満は低体重です。また、日本人の食事摂取基準（2025年版）が示す「目標とするBMI」の下限（18〜49歳は18.5、50〜64歳は20.0、65歳以上は21.5）も下回ります。体重や食事のことで悩んでいるときは、ひとりで減量を続けず、医療機関や管理栄養士に相談してください。
        </Alert>
      )}
      {!b.minor && (
        <>
          {low ? (
            <Result
              label="低体重の境目（BMI18.5）"
              value={tw === null ? "-" : fmt(weightAt(18.5, b.hc))}
              unit="kg"
              sub={tw === null ? "身長を入力すると計算します。" : <>この体重を下回ると低体重です。{name}（BMI{target}）は{fmt(tw)}kgで、この境目を下回ります。</>}
            />
          ) : (
            <Result
              label={`${name}（BMI${target}）`}
              value={tw === null ? "-" : fmt(tw)}
              unit="kg"
              sub={tw === null ? "身長を入力すると計算します。" : <>身長{fmt(b.hc)}cmでBMI{target}になる体重です。{diff}</>}
            />
          )}
          {tw !== null && !low && target < lo && (
            <p className="rounded-[var(--radius-card)] bg-band p-4 text-sm leading-relaxed">
              {ageLabel}の「目標とするBMI」は{fmt(lo)}以上です。BMI{target}はその下限を下回るため、この年代では目安にしないほうが安心です。
            </p>
          )}
          {tw !== null && (
            <Stats
              items={[
                ...(target !== 22 ? [{ label: "標準体重（BMI22）", value: fmt(weightAt(22, b.hc)), unit: "kg" }] : []),
                { label: `目標とするBMIの体重（${ageLabel}）`, value: `${fmt(weightAt(lo, b.hc))}〜${fmt(weightAt(hi, b.hc))}`, unit: "kg", note: <>BMI {fmt(lo)}〜{fmt(hi)}</> },
                { label: "普通体重の範囲", value: `${fmt(weightAt(18.5, b.hc))}〜${fmt(weightAt(25, b.hc))}`, unit: "kg", note: "BMI18.5以上25未満" },
                { label: "今のBMI", value: cur === null ? "-" : fmt(cur), note: cur === null ? "体重を入力すると表示します。" : jasso(cur) },
              ]}
            />
          )}
          <More title="身長別の早見表">
            <Table
              caption="各BMIにあたる体重（kg）"
              head={["身長", ...cols.map((c) => `BMI${c}`)]}
              rows={heights.map((h) => [`${h}cm`, ...cols.map((c) => fmt(weightAt(c, h)))])}
            />
          </More>
        </>
      )}
      {target < 22 && <EdHelp />}
    </div>
  );
}
