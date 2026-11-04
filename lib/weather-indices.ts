import type { Weather } from "./weather";

// 「くらし指数」: simple, transparent rules over the forecast. General guidance only, never medical advice.
export type Index = { key: string; label: string; level: 1 | 2 | 3 | 4 | 5; value: string; note: string };

const clamp = (n: number): Index["level"] => Math.max(1, Math.min(5, Math.round(n))) as Index["level"];

export function lifeIndices(w: Weather): Index[] {
  const today = w.daily[0];
  const day = w.hourly.slice(0, 12);
  // only the hours still ahead: the daily maximum also counts hours already past
  const maxPop = Math.max(0, ...day.map((h) => h.pop));
  const avgRh = day.reduce((s, h) => s + h.rh, 0) / Math.max(day.length, 1);
  const gap = today.max - today.min;

  // 洗濯: dry, rain-free, warm days score high.
  const laundry = clamp(5 - maxPop / 25 - Math.max(0, avgRh - 60) / 15 + (today.max >= 20 ? 0.5 : 0));
  const umbrella = maxPop >= 50 ? "持っていこう" : maxPop >= 30 ? "折りたたみを" : "なくても大丈夫";
  // 環境省「紫外線環境保健マニュアル」の区分: 1-2 弱い / 3-5 中程度 / 6-7 強い / 8-10 非常に強い / 11+ 極端に強い
  const uvLevel = today.uv >= 11 ? 5 : today.uv >= 8 ? 4 : today.uv >= 6 ? 3 : today.uv >= 3 ? 2 : 1;

  return [
    {
      key: "laundry", label: "洗濯", level: laundry, value: ["室内干しに", "室内干しが安心", "乾くけど時間がかかる", "よく乾く", "大チャンス"][laundry - 1],
      note: `降水確率 最大${Math.round(maxPop)}%・湿度 平均${Math.round(avgRh)}%`,
    },
    {
      key: "umbrella", label: "傘", level: clamp(maxPop / 20), value: umbrella,
      note: `これから12時間の降水確率 最大${Math.round(maxPop)}%`,
    },
    {
      key: "uv", label: "紫外線", level: uvLevel as Index["level"], value: ["弱い", "中程度", "強い", "非常に強い", "極端に強い"][uvLevel - 1],
      note: `UVインデックス 最大${today.uv.toFixed(1)}${uvLevel >= 2 ? "。日中の外出は日差し対策を" : ""}`,
    },
    {
      key: "gap", label: "寒暖差", level: clamp(gap / 3), value: gap >= 10 ? "大きい" : gap >= 7 ? "やや大きい" : "小さい",
      note: `最高${today.max.toFixed(0)}℃・最低${today.min.toFixed(0)}℃（差${gap.toFixed(0)}℃）${gap >= 7 ? "。脱ぎ着しやすい服で" : ""}`,
    },
    {
      key: "pressure", label: "気圧", level: clamp(1 + Math.abs(w.pressureDelta6h) / 1.5),
      value: w.pressureDelta6h <= -3 ? "下がる" : w.pressureDelta6h >= 3 ? "上がる" : "安定",
      note: `この先6時間で${w.pressureDelta6h >= 0 ? "+" : ""}${w.pressureDelta6h.toFixed(1)}hPa`,
    },
    {
      key: "dry", label: "乾燥", level: clamp((70 - w.current.rh) / 8), value: w.current.rh < 40 ? "乾燥している" : w.current.rh < 55 ? "やや乾燥" : "うるおいあり",
      note: `いまの湿度 ${Math.round(w.current.rh)}%${w.current.rh < 40 ? "。保湿とこまめな水分補給を" : ""}`,
    },
  ];
}

/** Notes for the 体調メモ, chosen from today's forecast. Plain, general, non-medical. */
export function healthNotes(w: Weather): string[] {
  const t = w.daily[0];
  const notes: string[] = [];
  if (t.max >= 31) notes.push(`最高気温は${t.max.toFixed(0)}℃の予想。こまめに水分をとり、暑さを避けて過ごしましょう。`);
  if (t.max - t.min >= 8) notes.push("朝晩と日中の気温差が大きい一日。重ね着で調節を。");
  if (w.current.rh < 40) notes.push("空気が乾燥しています。保湿と水分補給を意識して。");
  if (w.pressureDelta6h <= -3) notes.push("このあと気圧が下がる見込み。無理のない予定で過ごしましょう。");
  if (t.uv >= 6) notes.push("紫外線が強い日。帽子や日焼け止めで日差し対策を。");
  if (!notes.length) notes.push("おだやかな一日になりそうです。");
  return notes;
}
