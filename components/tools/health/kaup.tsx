"use client";

import { useState } from "react";
import Link from "next/link";
import { BandScale, NumberField, Result, num } from "../fields";
import { fmt, himando, judgeHimando, kaup, rohrer, schoolStdWeight, signed, toddlerStdWeight, type Sex } from "./data";
import { More, SexChoice, Stats, Table } from "./parts";

// Bands for the scale only; the judgement itself is judgeHimando() (thin-side boundary inclusive).
const TODDLER = [
  { to: -15, label: "やせ傾向" },
  { to: 15, label: "ふつう" },
  { to: 30, label: "肥満傾向" },
  { to: Infinity, label: "30%以上" },
];
const SCHOOL = [
  { to: -20, label: "痩身傾向" },
  { to: 20, label: "ふつう" },
  { to: Infinity, label: "肥満傾向" },
];

export function KaupTool() {
  const [sex, setSex] = useState<Sex>("f");
  const [age, setAge] = useState("3");
  const [h, setH] = useState("95");
  const [w, setW] = useState("14");
  const a = num(age), hc = num(h), wk = num(w);
  const ageOk = a !== null && Number.isInteger(a) && a >= 0 && a <= 17;
  const valid = ageOk && hc !== null && wk !== null && hc >= 45 && hc <= 200 && wk >= 2 && wk <= 150;

  const young = valid && a! < 6;
  const index = !valid ? null : young ? kaup(hc!, wk!) : rohrer(hc!, wk!);
  // Which 肥満度 standard applies (and only inside each formula's range).
  const std = !valid || a! < 1 ? null
    : young && hc! >= 70 && hc! <= 120 ? { kind: "toddler" as const, w: toddlerStdWeight(sex, hc!) }
    : a! >= 5 ? { kind: "school" as const, w: schoolStdWeight(sex, a!, hc!) }
    : null;
  const pct = std ? himando(wk!, std.w) : null;
  const bands = std?.kind === "school" ? SCHOOL : TODDLER;
  const judge = pct === null ? null : judgeHimando(std!.kind, pct);
  const thin = judge === "やせ傾向" || judge === "痩身傾向";
  const advice = !valid ? null
    : thin ? "やせの傾向があります。体重が急に減った、食べる量が減ったなどの変化があるときは、早めに小児科に相談してください。"
    : judge === "肥満傾向（30%以上）" ? "肥満度30%以上は、国立保健医療科学院の実践ガイドで医療機関に相談する目安とされています。かかりつけの小児科で相談してください。"
    : a! < 6 ? "気になるときは、発育曲線とあわせて、かかりつけの小児科や自治体の乳幼児健診で相談しましょう。"
    : "気になるときは、学校の健康診断の結果もあわせて、養護の先生や学校医、かかりつけの小児科に相談してください。";

  return (
    <div className="grid gap-6">
      <SexChoice value={sex} onChange={setSex} />
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="年齢（満）" unit="歳" value={age} onChange={setAge} min={0} max={17} step={1}
          hint={ageOk ? "1歳未満は0と入力してください。" : "0〜17歳で入力してください。18歳以上はBMIで見ます。"} />
        <NumberField label="身長" unit="cm" value={h} onChange={setH} min={45} max={200} />
        <NumberField label="体重" unit="kg" value={w} onChange={setW} min={2} max={150} hint="小数点まで入力できます（例：9.6）。" />
      </div>
      {a !== null && a >= 18 && (
        <p className="text-sm">18歳以上の方は <Link href="/tools/bmi" className="font-bold text-shu-ink underline underline-offset-4">BMI計算</Link> をご利用ください。</p>
      )}
      <Result
        label={young || !valid ? "カウプ指数" : "ローレル指数"}
        value={index === null ? "-" : fmt(index)}
        sub={
          !valid ? "年齢・身長・体重を入力すると計算します。"
          : judge !== null ? <>肥満度 <b>{signed(pct!)}%</b>：<b>{judge}</b>（{std!.kind === "school" ? "学校保健の基準" : "幼児の基準"}）</>
          : a! < 1 ? "1歳未満は、母子健康手帳の発育曲線で体重と身長の伸びを見るのが基本です。"
          : "この身長は幼児の肥満度の式の範囲（70〜120cm）外のため、判定は表示しません。"
        }
      />
      {pct !== null && <BandScale min={std!.kind === "school" ? -40 : -30} max={std!.kind === "school" ? 40 : 45} value={pct} bands={bands} />}
      {advice && <p className="rounded-[var(--radius-card)] bg-band p-4 text-sm leading-relaxed">{advice}</p>}
      {valid && (
        <Stats
          items={[
            { label: "身長別の標準体重", value: std ? fmt(std.w) : "-", unit: std ? "kg" : undefined, note: std ? (std.kind === "school" ? "学校保健の式" : "幼児の式") : "この年齢・身長は対象外です。" },
            ...(young ? [] : [{ label: "BMI（カウプ指数と同じ式）", value: fmt(kaup(hc!, wk!)), note: "子どものBMIは年齢で標準が変わります。" }]),
          ]}
        />
      )}
      <More title="判定のしくみ">
        <Table
          caption="このツールで使う肥満度の区分"
          head={["対象", "やせ側", "ふつう", "太り側"]}
          rows={[
            ["幼児（1〜5歳）", "-15%以下", "±15%以内", "+15%以上（30%以上は受診の目安）"],
            ["学童・生徒（6〜17歳）", "-20%以下", "±20%以内", "+20%以上"],
          ]}
        />
        <p className="text-xs leading-relaxed text-ink-2">5歳で身長が120cmを超える場合は、学童の式を使います。やせ側の境目ちょうど（-15%、-20%）は、やせ側に入ります。</p>
        <p className="text-xs leading-relaxed text-ink-2">カウプ指数は年齢によって標準が大きく変わるため、国の手引きでは固定の数値で区切らず、発育曲線と肥満度で判断します。インターネットでよく見る年齢別の判定表は出典によって数値が違うため、このツールでは使っていません。</p>
      </More>
    </div>
  );
}
