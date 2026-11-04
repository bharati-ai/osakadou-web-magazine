"use client";

import { Result } from "../fields";
import { bmiOf, fmt, jasso, weightAt } from "./data";
import { Alert, BodyFields, EdHelp, Stats, Under18, useBody } from "./parts";

/** スペ (height cm − weight kg), converted to BMI. No target weights by design. */
export function SupeTool() {
  const b = useBody();
  const valid = b.ok.h && b.ok.w;
  const spe = valid ? b.hc - b.wk : null;
  const bmi = valid ? bmiOf(b.hc, b.wk) : null;
  const speAt = (x: number) => b.hc - weightAt(x, b.hc);

  return (
    <div className="grid gap-6">
      <BodyFields b={b} sex={false} age={false} />
      <Result
        label="あなたのスペ値"
        value={spe === null ? "-" : fmt(spe)}
        sub={spe === null ? "身長と体重を入力すると計算します。" : <>身長（cm）から体重（kg）を引いた数です。BMIに換算すると<b>{fmt(bmi!)}</b>で、日本肥満学会の区分では<b>{jasso(bmi!)}</b>です。</>}
      />
      <Alert title="スペの数字を大きくすることを目標にしないでください。">
        スペはインターネット上の俗語で、数字が大きいほど体重が軽いことを表します。多くの身長で、スペ120前後は「低体重」（BMI18.5未満）にあたります。体格を見るときは、BMIを目安にしてください。
      </Alert>
      {b.ok.h && (
        <Stats
          items={[
            {
              label: `普通体重にあたるスペ値（身長${fmt(b.hc)}cm）`,
              value: `${fmt(speAt(25))}〜${fmt(speAt(18.5))}`,
              note: <>BMI18.5以上25未満。{fmt(speAt(18.5))}を超えると低体重です。</>,
            },
            { label: "標準体重（BMI22）", value: fmt(weightAt(22, b.hc)), unit: "kg", note: <>スペ値では{fmt(speAt(22))}</> },
          ]}
        />
      )}
      <Under18 />
      <EdHelp />
    </div>
  );
}
