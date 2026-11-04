"use client";

import type { Weather } from "@/lib/weather";
import { Result } from "../fields";
import { Level, WeatherGate, clamp5, hourLabel, updatedLabel, useWeather } from "./shared";

/** Dew point (℃) from temperature and relative humidity, Magnus formula. */
export function dewPoint(temp: number, rh: number) {
  const g = Math.log(Math.max(rh, 1) / 100) + (17.62 * temp) / (243.12 + temp);
  return (243.12 * g) / (17.62 - g);
}

// ponytail: humidity bands + a dew-point bump. A rule of thumb, not a hair-science model.
export function frizzLevel(temp: number, rh: number) {
  const base = rh < 50 ? 1 : rh < 60 ? 2 : rh < 70 ? 3 : rh < 80 ? 4 : 5;
  return clamp5(base + (dewPoint(temp, rh) >= 20 ? 1 : 0));
}

const WORDS = ["うねりにくい", "ややうねりにくい", "ふつう", "うねりやすい", "とてもうねりやすい"];

function outlook(w: Weather) {
  const hours = w.hourly.slice(0, 12).map((h) => ({ ...h, dew: dewPoint(h.temp, h.rh), level: frizzLevel(h.temp, h.rh) }));
  const peak = hours.reduce((a, b) => (b.level > a.level ? b : a), hours[0]);
  // consecutive hours at level 4+ joined into ranges, e.g. 「23時〜5時」
  const high: string[] = [];
  hours.forEach((h, i) => {
    if (h.level < 4) return;
    if (i > 0 && hours[i - 1].level >= 4) high[high.length - 1] = `${high[high.length - 1].split("〜")[0]}〜${hourLabel(h.t)}`;
    else high.push(hourLabel(h.t));
  });
  const tips: string[] = ["出かける前に、根元から毛先までしっかり乾かしきるのが基本です。"];
  if (peak.level >= 4) tips.push("湿気の多い時間帯は、まとめ髪やアレンジで広がりを目立ちにくく。");
  if (peak.level >= 4) tips.push("外にいる時間が長い日は、帽子があると湿気や風の影響を受けにくくなります。");
  if (Math.max(...hours.map((h) => h.pop)) >= 50) tips.push("雨の予報があります。傘で髪がぬれるのを防ぐだけでも違います。");
  if (peak.level <= 2) tips.push("空気が乾きぎみの日は、静電気で広がることも。乾かしすぎにも気をつけて。");
  const wet = hours.reduce((a, b) => (b.rh > a.rh ? b : a), hours[0]);
  return { hours, peak, high, tips, wet };
}

export function KamiUneriTool() {
  const w = useWeather();
  return (
    <WeatherGate w={w}>
      {(data) => {
        const o = outlook(data);
        return (
          <div className="grid gap-6">
            <Result
              label="これから12時間のうねり予報（目安）"
              value={String(o.peak.level)}
              unit={`/ 5　${WORDS[o.peak.level - 1]}`}
              sub={
                o.high.length
                  ? <>特に気をつけたいのは <b>{o.high.join("、")}</b> ごろ。湿度は{hourLabel(o.wet.t)}ごろに最大{Math.round(o.wet.rh)}%の予報です。</>
                  : <>うねりやすい時間帯は見あたりません。いちばん湿度が高いのは{hourLabel(o.wet.t)}ごろ（{Math.round(o.wet.rh)}%）。</>
              }
            />

            <section aria-labelledby="kami-hours">
              <h2 id="kami-hours" className="font-maru text-lg font-bold">時間ごとのうねりやすさ</h2>
              <ol className="mt-3 grid gap-1.5">
                {o.hours.map((h) => (
                  <li key={h.t} className="grid grid-cols-[3.2em_1fr_auto] items-center gap-3 rounded-[10px] border border-line px-3 py-2 text-sm">
                    <span className="font-bold tabular-nums">{hourLabel(h.t)}</span>
                    <span className="grid gap-1">
                      <Level level={h.level} label={`${hourLabel(h.t)}のうねりやすさ`} />
                      <span className="text-xs text-ink-2">{WORDS[h.level - 1]}</span>
                    </span>
                    <span className="text-right text-xs tabular-nums text-ink-2">湿度 {Math.round(h.rh)}%<br />露点 {h.dew.toFixed(0)}℃</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-xs text-ink-2">{updatedLabel(data)}</p>
            </section>

            <section aria-labelledby="kami-tips">
              <h2 id="kami-tips" className="font-maru text-lg font-bold">今日のヘアケア習慣</h2>
              <ul className="mt-3 grid gap-2 text-[15px]">
                {o.tips.map((t) => (
                  <li key={t} className="flex gap-2"><span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-shu" />{t}</li>
                ))}
              </ul>
            </section>
          </div>
        );
      }}
    </WeatherGate>
  );
}
