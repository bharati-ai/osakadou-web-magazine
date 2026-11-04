"use client";

import type { Hour, Weather } from "@/lib/weather";
import { Result } from "../fields";
import { LevelCard, WeatherGate, clamp5, hourLabel, updatedLabel, useWeather } from "./shared";

// 環境省「紫外線環境保健マニュアル2020」のUVインデックス区分（WHO基準）と、区分ごとの対策の考え方。
export function uvCategory(uv: number) {
  const r = Math.round(uv);
  if (r <= 2) return { level: 1, label: "弱い", act: "安心して外で過ごせる程度です。" };
  if (r <= 5) return { level: 2, label: "中程度", act: "日中はなるべく日陰を選び、長袖・日焼け止め・帽子を。" };
  if (r <= 7) return { level: 3, label: "強い", act: "日中はなるべく日陰を選び、長袖・日焼け止め・帽子を。" };
  if (r <= 10) return { level: 4, label: "非常に強い", act: "日中の外出はできるだけ控えめに。長袖・日焼け止め・帽子は必ず。" };
  return { level: 5, label: "極端に強い", act: "日中の外出はできるだけ控えめに。長袖・日焼け止め・帽子は必ず。" };
}

/** Hours left today (falls back to the next 12 hours late at night). */
export function todayHours(w: Weather): Hour[] {
  const t = w.hourly.filter((h) => h.t.startsWith(w.daily[0].date));
  return t.length >= 3 ? t : w.hourly.slice(0, 12);
}

export function skinOutlook(w: Weather) {
  const d = w.daily[0];
  const hours = todayHours(w);
  const rhMin = Math.min(w.current.rh, ...hours.map((h) => h.rh));
  const rhAvg = hours.reduce((s, h) => s + h.rh, 0) / hours.length;
  const windMs = w.current.wind / 3.6; // Open-Meteo: km/h
  const gap = d.max - d.min;
  const uv = uvCategory(d.uv);

  // ponytail: transparent thresholds over the forecast, not a dermatological model.
  const dry = clamp5((rhMin < 35 ? 5 : rhMin < 45 ? 4 : rhMin < 55 ? 3 : rhMin < 65 ? 2 : 1) + (windMs >= 5 ? 1 : 0));
  const sweat = d.max >= 30 && rhAvg >= 65 ? 5 : d.max >= 28 ? 4 : d.max >= 25 ? 3 : d.max >= 20 ? 2 : 1;
  const swing = clamp5(gap / 3);

  const cards = [
    { title: "乾燥しやすさ", level: dry, value: ["うるおいやすい", "ふつう", "やや乾燥", "乾燥しやすい", "とても乾燥しやすい"][dry - 1], note: `最小湿度 ${Math.round(rhMin)}%・風 約${windMs.toFixed(1)}m/s${windMs >= 5 ? "（風があると乾きやすくなります）" : ""}` },
    { title: "日差しの強さ", level: uv.level, value: uv.label, note: `UVインデックス 最大${d.uv.toFixed(1)}。${uv.act}` },
    { title: "汗ばみやすさ", level: sweat, value: ["さらり", "おだやか", "ときどき汗ばむ", "汗ばみやすい", "蒸し暑い"][sweat - 1], note: `最高${d.max.toFixed(0)}℃・平均湿度 ${Math.round(rhAvg)}%` },
    { title: "寒暖差", level: swing, value: gap >= 10 ? "大きい" : gap >= 7 ? "やや大きい" : "小さい", note: `最高${d.max.toFixed(0)}℃・最低${d.min.toFixed(0)}℃（差${gap.toFixed(0)}℃）` },
  ];

  const headline =
    uv.level >= 3 ? "日差し注意" : dry >= 4 ? "乾燥注意" : sweat >= 4 ? "汗ばみ注意" : swing >= 4 ? "寒暖差注意" : dry >= 3 ? "やや乾燥" : "おだやか";

  const habits: string[] = [];
  if (dry >= 3) habits.push("洗顔やお風呂のあとは、時間をあけずに保湿を。乾燥が気になる部屋では加湿も。");
  if (uv.level >= 2) habits.push("出かけるときは日焼け止めと帽子や日傘を。日差しの強い昼前後は日陰を選んで歩きましょう。");
  else habits.push("紫外線は弱めでも、長く外にいる日は帽子があると安心です。");
  if (sweat >= 3) habits.push("汗をかいたらこまめに拭いて、肌を清潔に保ちましょう。");
  if (swing >= 3) habits.push("朝晩と日中の気温差に合わせて、脱ぎ着しやすい服で。");
  habits.push("のどが渇く前に、こまめな水分補給を。");

  return { cards, headline, habits, hours };
}

export function HadaYohouTool() {
  const w = useWeather();
  return (
    <WeatherGate w={w}>
      {(data) => {
        const o = skinOutlook(data);
        return (
          <div className="grid gap-6">
            <Result
              label="今日の大阪の肌予報"
              value={o.headline}
              sub={<>{o.cards.filter((c) => c.level >= 3).map((c) => `${c.title}：${c.value}`).join("　") || "肌にとっておだやかな天気です。"}</>}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {o.cards.map((c) => <LevelCard key={c.title} {...c} />)}
            </div>

            <section aria-labelledby="hada-habits">
              <h2 id="hada-habits" className="font-maru text-lg font-bold">今日のセルフケア習慣</h2>
              <ul className="mt-3 grid gap-2 text-[15px]">
                {o.habits.map((h) => (
                  <li key={h} className="flex gap-2"><span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-shu" />{h}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="hada-strip">
              <h2 id="hada-strip" className="font-maru text-lg font-bold">時間ごとの紫外線と湿度</h2>
              <div className="mt-3 overflow-x-auto pb-2">
                <table className="w-max min-w-full border-separate border-spacing-x-1 text-center text-sm tabular-nums">
                  <caption className="sr-only">今日の時間ごとのUVインデックスと湿度</caption>
                  <thead>
                    <tr>
                      <th scope="row" className="sticky left-0 bg-card pr-2 text-left text-xs font-bold text-ink-2">時刻</th>
                      {o.hours.map((h) => <th key={h.t} scope="col" className="min-w-11 text-xs font-bold">{hourLabel(h.t)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" className="sticky left-0 bg-card pr-2 text-left text-xs font-bold text-ink-2">UV</th>
                      {o.hours.map((h) => {
                        const c = uvCategory(h.uv);
                        return (
                          <td key={h.t} className="h-20 align-bottom">
                            <div className="mx-auto flex h-14 w-6 items-end rounded-full bg-paper-2" aria-hidden>
                              <span className="w-full rounded-full bg-shu" style={{ height: `${Math.min(100, (h.uv / 11) * 100)}%`, opacity: 0.35 + c.level * 0.13 }} />
                            </div>
                            <span className="mt-1 block font-bold">{h.uv.toFixed(0)}</span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <th scope="row" className="sticky left-0 bg-card pr-2 text-left text-xs font-bold text-ink-2">湿度</th>
                      {o.hours.map((h) => <td key={h.t} className="pt-1">{Math.round(h.rh)}%</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-ink-2">
                UVインデックスの目安：1〜2 弱い／3〜5 中程度／6〜7 強い／8〜10 非常に強い／11以上 極端に強い。{updatedLabel(data)}
              </p>
            </section>
          </div>
        );
      }}
    </WeatherGate>
  );
}
