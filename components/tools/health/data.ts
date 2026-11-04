/**
 * Shared data and formulas for the からだ・健康 tools.
 * Every table below is copied from the source named in its comment (checked 2026-10).
 * Pure TS with no imports, so `node components/tools/health/data.check.mts` can run it.
 */

export type Sex = "m" | "f";

export const bmiOf = (hCm: number, wKg: number) => wKg / (hCm / 100) ** 2;
export const weightAt = (bmi: number, hCm: number) => bmi * (hCm / 100) ** 2;

/** 1 decimal (or d decimals), Japanese digit grouping. */
export const fmt = (n: number, d = 1) =>
  n.toLocaleString("ja-JP", { minimumFractionDigits: d, maximumFractionDigits: d });
/** Signed kg difference, e.g. "+1.2" / "-0.4". */
export const signed = (n: number, d = 1) => (n > 0 ? "+" : n < 0 ? "-" : "±") + fmt(Math.abs(n), d);

/** Last row whose `from` is ≤ age (rows sorted by `from`). */
export const rowFor = <T extends { from: number }>(rows: T[], age: number) => rows.findLast((r) => age >= r.from);

// 日本肥満学会「肥満症診療ガイドライン2022」表1-3（e-ヘルスネット「BMIチェックツール」掲載の区分）
export const JASSO = [
  { to: 18.5, label: "低体重" },
  { to: 25, label: "普通体重" },
  { to: 30, label: "肥満1度" },
  { to: 35, label: "肥満2度" },
  { to: 40, label: "肥満3度" },
  { to: Infinity, label: "肥満4度" },
];
export const jasso = (bmi: number) => JASSO.find((b) => bmi < b.to)!.label;

// 日本人の食事摂取基準（2025年版）エネルギー：目標とするBMIの範囲（18歳以上、男女共通）
export const targetBmi = (age: number): [number, number] =>
  age < 50 ? [18.5, 24.9] : age < 65 ? [20.0, 24.9] : [21.5, 24.9];

// 厚生労働省「令和6年国民健康・栄養調査報告」第14表（身長・体重の平均値）・第15表（BMIの平均値）、全国補正値
export const NHNS = "令和6年国民健康・栄養調査";
export const AVERAGES: Record<Sex, { ages: string; from: number; h: number; w: number; bmi: number }[]> = {
  m: [
    { ages: "20〜29歳", from: 20, h: 171.4, w: 66.1, bmi: 22.48 },
    { ages: "30〜39歳", from: 30, h: 171.6, w: 70.6, bmi: 23.97 },
    { ages: "40〜49歳", from: 40, h: 171.6, w: 71.3, bmi: 24.22 },
    { ages: "50〜59歳", from: 50, h: 170.5, w: 70.9, bmi: 24.37 },
    { ages: "60〜69歳", from: 60, h: 168.9, w: 68.1, bmi: 23.86 },
    { ages: "70歳以上", from: 70, h: 164.2, w: 63.3, bmi: 23.44 },
  ],
  f: [
    { ages: "20〜29歳", from: 20, h: 158.0, w: 52.3, bmi: 20.94 },
    { ages: "30〜39歳", from: 30, h: 158.0, w: 53.4, bmi: 21.36 },
    { ages: "40〜49歳", from: 40, h: 158.2, w: 55.4, bmi: 22.14 },
    { ages: "50〜59歳", from: 50, h: 157.6, w: 55.3, bmi: 22.3 },
    { ages: "60〜69歳", from: 60, h: 155.4, w: 54.2, bmi: 22.45 },
    { ages: "70歳以上", from: 70, h: 150.5, w: 51.1, bmi: 22.57 },
  ],
};

// 日本人の食事摂取基準（2025年版）エネルギー：参照体重における基礎代謝量（18歳以上）
export const BMR_REF: Record<Sex, { ages: string; from: number; perKg: number; refW: number; bmr: number }[]> = {
  m: [
    { ages: "18〜29歳", from: 18, perKg: 23.7, refW: 63.0, bmr: 1490 },
    { ages: "30〜49歳", from: 30, perKg: 22.5, refW: 70.0, bmr: 1570 },
    { ages: "50〜64歳", from: 50, perKg: 21.8, refW: 69.1, bmr: 1510 },
    { ages: "65〜74歳", from: 65, perKg: 21.6, refW: 64.4, bmr: 1390 },
    { ages: "75歳以上", from: 75, perKg: 21.5, refW: 61.0, bmr: 1310 },
  ],
  f: [
    { ages: "18〜29歳", from: 18, perKg: 22.1, refW: 51.0, bmr: 1130 },
    { ages: "30〜49歳", from: 30, perKg: 21.9, refW: 53.3, bmr: 1170 },
    { ages: "50〜64歳", from: 50, perKg: 20.7, refW: 54.0, bmr: 1120 },
    { ages: "65〜74歳", from: 65, perKg: 20.7, refW: 52.6, bmr: 1090 },
    { ages: "75歳以上", from: 75, perKg: 20.7, refW: 49.3, bmr: 1020 },
  ],
};

// 同 表4：身体活動レベル（カテゴリー）別の身体活動レベル基準値（男女共通、18歳以上）。75歳以上に「高い」はない。
export type PalLevel = "low" | "mid" | "high";
export const PAL_LABEL: Record<PalLevel, string> = { low: "低い", mid: "ふつう", high: "高い" };
export const palFor = (age: number): Record<PalLevel, number | null> =>
  age < 65 ? { low: 1.5, mid: 1.75, high: 2.0 } : age < 75 ? { low: 1.5, mid: 1.7, high: 1.9 } : { low: 1.4, mid: 1.7, high: null };

// 基礎代謝量の推定式（日本人の食事摂取基準（2025年版）エネルギーの章に掲載の形）
/** 同表で国立健康・栄養研究所の式の対象とされる年齢（20〜74歳）。範囲外は参考値として扱う */
export const ganpuleInRange = (age: number) => age >= 20 && age <= 74;
/** 国立健康・栄養研究所の式（Ganpule et al. 2007）kcal/日 */
export const ganpule = (sex: Sex, w: number, h: number, age: number) =>
  ((0.0481 * w + 0.0234 * h - 0.0138 * age - (sex === "m" ? 0.4235 : 0.9708)) * 1000) / 4.186;
/** Harris-Benedict の式 kcal/日 */
export const harrisBenedict = (sex: Sex, w: number, h: number, age: number) =>
  sex === "m" ? 66.473 + 13.7516 * w + 5.0033 * h - 6.755 * age : 655.0955 + 9.5634 * w + 1.8496 * h - 4.6756 * age;

// 日本人の食事摂取基準（2025年版）たんぱく質・エネルギー産生栄養素バランス（18歳以上）
export const proteinRda = (sex: Sex, age: number) => (sex === "f" ? 50 : age < 65 ? 65 : 60); // 推奨量 g/日
export const balanceGoal = (age: number) => ({
  p: [age < 50 ? 13 : age < 65 ? 14 : 15, 20] as const, // %エネルギー
  f: [20, 30] as const,
  c: [50, 65] as const,
});
export const KCAL_PER_G = { p: 4, f: 9, c: 4 }; // 同章：Atwater 係数
/** 厚生労働省「健康づくりのための身体活動・運動ガイド2023」：体脂肪1kgを減らすのに必要なエネルギー量は約7,000kcal */
export const KCAL_PER_KG_FAT = 7000;

// 国立健康・栄養研究所「改訂版『身体活動のメッツ（METs）表』」2012年4月11日改訂。歩行は平らで固い地面。
export type MetsRow = { from: number; mets: number; label: string; code: string };
export const WALK_METS: MetsRow[] = [
  { from: 0, mets: 2.0, label: "3.2km/時未満（とてもゆっくり）", code: "17151" },
  { from: 3.2, mets: 2.8, label: "3.2km/時（ゆっくり）", code: "17152" },
  { from: 4.0, mets: 3.0, label: "4.0km/時", code: "17170" },
  { from: 4.5, mets: 3.5, label: "4.5〜5.1km/時（ほどほどの速さ）", code: "17190" },
  { from: 5.6, mets: 4.3, label: "5.6km/時（速い）", code: "17200" },
  { from: 6.4, mets: 5.0, label: "6.4km/時（とても速い）", code: "17220" },
  { from: 7.2, mets: 7.0, label: "7.2km/時（極めて速い）", code: "17230" },
  { from: 8.0, mets: 8.3, label: "8.0km/時", code: "17231" },
];
export const RUN_METS: MetsRow[] = [
  { from: 0, mets: 6.0, label: "6.4km/時", code: "12029" },
  { from: 8.0, mets: 8.3, label: "8.0km/時", code: "12030" },
  { from: 8.4, mets: 9.0, label: "8.4km/時", code: "12040" },
  { from: 9.7, mets: 9.8, label: "9.7km/時", code: "12050" },
  { from: 10.8, mets: 10.5, label: "10.8km/時", code: "12060" },
  { from: 11.3, mets: 11.0, label: "11.3km/時", code: "12070" },
  { from: 12.1, mets: 11.5, label: "12.1km/時", code: "12080" },
  { from: 12.9, mets: 11.8, label: "12.9km/時", code: "12090" },
  { from: 13.8, mets: 12.3, label: "13.8km/時", code: "12100" },
  { from: 14.5, mets: 12.8, label: "14.5km/時", code: "12110" },
  { from: 16.1, mets: 14.5, label: "16.1km/時", code: "12120" },
  { from: 17.7, mets: 16.0, label: "17.7km/時", code: "12130" },
  { from: 19.3, mets: 19.0, label: "19.3km/時", code: "12132" },
  { from: 20.9, mets: 19.8, label: "20.9km/時", code: "12134" },
  { from: 22.5, mets: 23.0, label: "22.5km/時", code: "12135" },
];
/** 厚生労働省「健康づくりのための身体活動・運動ガイド2023」：エネルギー消費量(kcal) ＝ メッツ × 時間(h) × 体重(kg) */
export const metsKcal = (mets: number, wKg: number, hours: number) => mets * hours * wKg;

// ---- 子どもの体格（カウプ指数・ローレル指数・肥満度） ----
export const kaup = (hCm: number, wKg: number) => ((wKg * 1000) / hCm ** 2) * 10; // = BMI
export const rohrer = (hCm: number, wKg: number) => ((wKg * 1000) / hCm ** 3) * 1e4; // = kg/m³ × 10
/** 国立保健医療科学院「乳幼児身体発育評価マニュアル」（2012）：幼児（6歳未満、身長70〜120cm）の身長別標準体重 */
export const toddlerStdWeight = (sex: Sex, hCm: number) =>
  sex === "m" ? 0.00206 * hCm ** 2 - 0.1166 * hCm + 6.5273 : 0.00249 * hCm ** 2 - 0.1858 * hCm + 9.036;
/** 文部科学省「肥満・痩身傾向児の算出方法」（日本学校保健会「児童生徒の健康診断マニュアル」平成27年度改訂版）：身長別標準体重 ＝ a × 身長 − b。index = 年齢 − 5 */
const SCHOOL: Record<Sex, [number, number][]> = {
  m: [[0.386, 23.699], [0.461, 32.382], [0.513, 38.878], [0.592, 48.804], [0.687, 61.39], [0.752, 70.461], [0.782, 75.106], [0.783, 75.642], [0.815, 81.348], [0.832, 83.695], [0.766, 70.989], [0.656, 51.822], [0.672, 53.642]],
  f: [[0.377, 22.75], [0.458, 32.079], [0.508, 38.367], [0.561, 45.006], [0.652, 56.992], [0.73, 68.091], [0.803, 78.846], [0.796, 76.934], [0.655, 54.234], [0.594, 43.264], [0.56, 37.002], [0.578, 39.057], [0.598, 42.339]],
};
export const schoolStdWeight = (sex: Sex, age: number, hCm: number) => {
  const [a, b] = SCHOOL[sex][age - 5];
  return a * hCm - b;
};
/** 肥満度(%) ＝（実測体重 − 標準体重）÷ 標準体重 × 100 */
export const himando = (w: number, std: number) => ((w - std) / std) * 100;
/**
 * 肥満度の判定。やせ側の境目ちょうど（幼児-15%、学童-20%）はやせ側に入る。
 * 幼児：±15%以内がふつう（評価マニュアル）、30%以上は医療機関へ（実践ガイド）。学童：±20%（文部科学省）。
 */
export const judgeHimando = (kind: "toddler" | "school", x: number) =>
  kind === "toddler"
    ? x <= -15 ? "やせ傾向" : x < 15 ? "ふつう" : x < 30 ? "肥満傾向" : "肥満傾向（30%以上）"
    : x <= -20 ? "痩身傾向" : x < 20 ? "ふつう" : "肥満傾向";

// ---- 体脂肪率・筋肉量の推定式 ----
/** Deurenberg et al. 1991（成人）。男性1・女性0 */
export const deurenberg = (sex: Sex, bmi: number, age: number) => 1.2 * bmi + 0.23 * age - 10.8 * (sex === "m" ? 1 : 0) - 5.4;
/** CUN-BAE（Gómez-Ambrosi et al. 2012）。男性0・女性1 */
export const cunBae = (sex: Sex, bmi: number, age: number) => {
  const s = sex === "f" ? 1 : 0;
  return -44.988 + 0.503 * age + 10.689 * s + 3.172 * bmi - 0.026 * bmi ** 2 + 0.181 * bmi * s - 0.02 * bmi * age - 0.005 * bmi ** 2 * s + 0.00021 * bmi ** 2 * age;
};
/** 米海軍式（Hodgdon & Beckett 1984）、cm。女性はヒップが必要 */
export const navy = (sex: Sex, hCm: number, waist: number, neck: number, hip = 0) =>
  sex === "m"
    ? 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(hCm)) - 450
    : 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(hCm)) - 450;
/** 骨格筋量 kg（Lee et al. 2000、体重と身長のモデル。アジア系 −1.2）。BMI30未満の成人で作られた式 */
export const leeSkeletalMuscle = (sex: Sex, w: number, hCm: number, age: number) =>
  0.244 * w + 7.8 * (hCm / 100) + 6.6 * (sex === "m" ? 1 : 0) - 0.098 * age - 1.2 - 3.3;
/** Kouri et al. 1995：身長1.8mに合わせた補正FFMI。係数6.3は原著の抄録（PubMed 7496846）の記載どおり */
export const normalizedFfmi = (ffmi: number, hCm: number) => ffmi + 6.3 * (1.8 - hCm / 100);
