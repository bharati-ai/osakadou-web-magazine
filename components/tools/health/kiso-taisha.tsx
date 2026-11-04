"use client";

import { Result } from "../fields";
import { BMR_REF, fmt, ganpule, ganpuleInRange, harrisBenedict, rowFor, signed } from "./data";
import { BodyFields, More, Stats, Table, useBody } from "./parts";

export function KisoTaishaTool() {
  const b = useBody();
  const valid = b.ok.age && b.ok.h && b.ok.w;
  const g = valid ? ganpule(b.sex, b.wk, b.hc, b.a) : null;
  const rows = BMR_REF[b.sex];
  const ref = b.ok.age ? rowFor(rows, b.a) : undefined;
  const who = b.sex === "f" ? "女性" : "男性";

  return (
    <div className="grid gap-6">
      <BodyFields b={b} />
      <Result
        label={valid && !ganpuleInRange(b.a) ? "基礎代謝量（推定・参考値）" : "基礎代謝量（推定）"}
        value={g === null ? "-" : fmt(g, 0)}
        unit="kcal/日"
        sub={
          g === null ? "年齢・身長・体重を入力すると計算します。"
          : ganpuleInRange(b.a) ? "国立健康・栄養研究所の式（日本人のデータから作られた式）で計算しています。"
          : "国立健康・栄養研究所の式の対象は20〜74歳のため、この年齢では参考値としてご覧ください。"
        }
      />
      {g !== null && ref && (
        <Stats
          items={[
            { label: "ハリス・ベネディクトの式", value: fmt(harrisBenedict(b.sex, b.wk, b.hc, b.a), 0), unit: "kcal/日", note: "欧米人のデータから作られた古い式です。" },
            { label: "基礎代謝基準値 × 体重", value: fmt(ref.perKg * b.wk, 0), unit: "kcal/日", note: <>{ref.perKg}kcal/kg × {fmt(b.wk)}kg。参照体重に近い人向けの目安です。</> },
            { label: `${who}${ref.ages}の参照値`, value: fmt(ref.bmr, 0), unit: "kcal/日", note: <>参照体重{fmt(ref.refW)}kgの場合。あなたとの差 {signed(g - ref.bmr, 0)}kcal</> },
          ]}
        />
      )}
      <More title={`${who}の基礎代謝基準値（食事摂取基準2025年版）`}>
        <Table
          caption="参照体重における基礎代謝量"
          head={["年齢", "基準値（kcal/kg/日）", "参照体重", "基礎代謝量"]}
          rows={rows.map((r) => [r.ages, fmt(r.perKg), `${fmt(r.refW)}kg`, `${fmt(r.bmr, 0)}kcal`])}
          mark={ref ? rows.indexOf(ref) : undefined}
        />
      </More>
    </div>
  );
}
