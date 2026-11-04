"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Cloud, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Drop, Gauge, Moon, Sun, Thermometer, Warning, Wind,
  type Icon,
} from "@phosphor-icons/react";
import { describe, type Weather } from "@/lib/weather";
import { photoSrc, type PhotoSlot } from "@/lib/photos";
import { healthNotes, lifeIndices } from "@/lib/weather-indices";

const REFRESH = 10 * 60 * 1000;
const tz = "Asia/Tokyo";
const hourFmt = new Intl.DateTimeFormat("ja-JP", { hour: "numeric", timeZone: tz });
const dateFmt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", timeZone: tz });
const wdFmt = new Intl.DateTimeFormat("ja-JP", { weekday: "short", timeZone: tz });
const timeFmt = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", timeZone: tz });
// Open-Meteo returns local wall-clock times without an offset.
const jst = (s: string) => new Date(s.length === 16 ? `${s}:00+09:00` : s);

function iconFor(code: number, isDay = true): Icon {
  const { mood } = describe(code);
  if (mood === "clear") return isDay ? Sun : Moon;
  if (mood === "partly") return isDay ? CloudSun : CloudMoon;
  if (mood === "rain") return CloudRain;
  if (mood === "snow") return CloudSnow;
  if (mood === "storm") return CloudLightning;
  if (mood === "fog") return CloudFog;
  return Cloud;
}

const SKY: Record<string, string> = {
  "clear-day": "from-[#4f9fd6] via-[#8cc6ea] to-[#d8edf8]",
  "clear-night": "from-[#0b1430] via-[#1d2b55] to-[#3a4a78]",
  "partly-day": "from-[#6aa6cf] via-[#a9cde3] to-[#e3eef4]",
  "partly-night": "from-[#141c33] via-[#2a3554] to-[#4a5470]",
  "cloudy-day": "from-[#7d8894] via-[#a6aeb7] to-[#d3d8dd]",
  "cloudy-night": "from-[#1c2129] via-[#323944] to-[#4b525d]",
  "rain-day": "from-[#4d5a68] via-[#6f7c89] to-[#a0aab4]",
  "rain-night": "from-[#141a22] via-[#263040] to-[#3b4656]",
  "storm-day": "from-[#2f3743] via-[#4b5563] to-[#707a88]",
  "storm-night": "from-[#0f131a] via-[#1f2631] to-[#333c4a]",
  "snow-day": "from-[#a9b8c8] via-[#cfd9e3] to-[#eef2f6]",
  "snow-night": "from-[#2b3647] via-[#46536a] to-[#6b7890]",
  "fog-day": "from-[#aab1b8] via-[#c9ced3] to-[#e6e8ea]",
  "fog-night": "from-[#262b31] via-[#3a4048] to-[#545b64]",
};

function moodPhoto(mood: string, isDay: boolean): PhotoSlot {
  if (mood === "rain" || mood === "storm") return "wxRain";
  if (mood === "snow") return "seasonWinter";
  if (!isDay) return "skyline";
  return mood === "clear" || mood === "partly" ? "wxClear" : "wxCloudy";
}

export function WeatherLive({ initial }: { initial: Weather | null }) {
  const [w, setW] = useState(initial);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await fetch("/api/weather");
        if (!r.ok) throw new Error(String(r.status));
        const data = (await r.json()) as Weather;
        if (alive) { setW(data); setError(false); }
      } catch { if (alive) setError(true); }
    };
    const stale = () => !w || Date.now() - new Date(w.fetchedAt).getTime() > REFRESH;
    const onVis = () => { if (stale()) load(); };
    const t = setInterval(load, REFRESH);
    document.addEventListener("visibilitychange", onVis);
    if (!initial) load();
    return () => { alive = false; clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!w) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[var(--radius-card)] bg-paper-2 p-8 text-center text-ink-2" aria-busy={!error}>
        {error ? "天気情報を取得できませんでした。しばらくしてから、もう一度お試しください。" : <span className="animate-pulse motion-reduce:animate-none">大阪の空を読みこみ中…</span>}
      </div>
    );
  }

  const { label, mood } = describe(w.current.code);
  const key = `${mood}-${w.current.isDay ? "day" : "night"}`;
  const dark = !w.current.isDay || mood === "rain" || mood === "storm";
  const NowIcon = iconFor(w.current.code, w.current.isDay);
  const indices = lifeIndices(w);
  const notes = healthNotes(w);
  const panel = dark ? "bg-night/45 text-on-night ring-1 ring-white/10" : "bg-white/70 text-[#1c2433] ring-1 ring-white/60";
  const sub = dark ? "text-on-night/80" : "text-[#3b4454]";

  return (
    <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] p-4 md:p-8">
      <Image src={photoSrc(moodPhoto(mood, w.current.isDay))} alt="" fill sizes="(min-width:1280px) 1120px, 100vw" className="-z-30 object-cover" />
      <div className={`absolute inset-0 -z-20 bg-gradient-to-b opacity-[0.86] ${SKY[key] ?? SKY["cloudy-day"]}`} aria-hidden />
      {(mood === "rain" || mood === "storm") && <div className="wx-rain pointer-events-none absolute inset-0 -z-10" aria-hidden />}
      {mood === "snow" && <div className="wx-snow pointer-events-none absolute inset-0 -z-10" aria-hidden />}
      {mood === "clear" && w.current.isDay && <div className="wx-sun pointer-events-none absolute -right-24 -top-24 -z-10 size-80 rounded-full" aria-hidden />}
      {!w.current.isDay && mood === "clear" && <div className="wx-stars pointer-events-none absolute inset-0 -z-10" aria-hidden />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* now */}
        <div className={`rounded-[var(--radius-card)] p-5 backdrop-blur-md md:p-6 ${panel}`}>
          <p className={`text-sm font-bold ${sub}`}>いまの大阪市　<span className="font-normal">{timeFmt.format(jst(w.current.time))} 現在</span></p>
          <div className="mt-2 flex items-center gap-4">
            <NowIcon size={72} weight="duotone" aria-hidden className="shrink-0" />
            <p className="font-latin text-[64px] font-bold leading-none tabular-nums md:text-[80px]">
              {Math.round(w.current.temp)}<span className="align-top font-sans text-2xl">℃</span>
            </p>
            <p className="font-maru text-2xl font-bold">{label}</p>
          </div>
          <dl className={`mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4 ${sub}`}>
            <div className="flex items-center gap-1.5"><Thermometer size={18} aria-hidden /><dt className="sr-only">体感</dt><dd>体感 {Math.round(w.current.feels)}℃</dd></div>
            <div className="flex items-center gap-1.5"><Drop size={18} aria-hidden /><dt className="sr-only">湿度</dt><dd>湿度 {Math.round(w.current.rh)}%</dd></div>
            <div className="flex items-center gap-1.5"><Wind size={18} aria-hidden /><dt className="sr-only">風速</dt><dd>風 {(w.current.wind / 3.6).toFixed(1)}m/s</dd></div>
            <div className="flex items-center gap-1.5"><Gauge size={18} aria-hidden /><dt className="sr-only">気圧</dt><dd>{Math.round(w.current.pressure)}hPa</dd></div>
          </dl>
          {w.jma && (
            <div className="mt-5 border-t border-current/15 pt-4">
              {w.jma.warnings.length > 0 && (
                <p className="mb-3 flex flex-wrap items-center gap-2">
                  <Warning size={18} weight="fill" className="text-[#ffcf5c]" aria-hidden />
                  {w.jma.warnings.map((x) => (
                    <a key={x} href="https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=2710000" target="_blank" rel="noopener" className="rounded-[var(--radius-chip)] bg-[#ffcf5c] px-2 py-1 text-xs font-bold text-[#1c2433]">{x}</a>
                  ))}
                </p>
              )}
              <p className="line-clamp-4 text-[13.5px] leading-[1.8]">{w.jma.text.split("\n\n").slice(0, 2).join(" ")}</p>
              <p className={`mt-1 text-xs ${sub}`}>{w.jma.office}　{timeFmt.format(new Date(w.jma.reportDatetime))}発表</p>
            </div>
          )}
        </div>

        {/* indices */}
        <div className={`rounded-[var(--radius-card)] p-5 backdrop-blur-md md:p-6 ${panel}`}>
          <h3 className="font-maru text-lg font-bold">今日のくらし指数</h3>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {indices.map((x) => (
              <li key={x.key} className="rounded-[10px] bg-current/[0.06] p-3">
                <p className={`text-xs font-bold ${sub}`}>{x.label}</p>
                <p className="mt-0.5 font-maru text-[15px] font-bold leading-snug">{x.value}</p>
                <p className="mt-1 flex gap-1" aria-label={`5段階中${x.level}`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`h-1.5 w-4 rounded-full ${n <= x.level ? "bg-[#e0583c]" : "bg-current/20"}`} />
                  ))}
                </p>
                <p className={`mt-1 text-[11px] leading-[1.5] ${sub}`}>{x.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* hourly */}
      <div className={`mt-4 rounded-[var(--radius-card)] p-4 backdrop-blur-md ${panel}`}>
        <h3 className="sr-only">これから24時間</h3>
        <ol className="flex snap-x gap-1 overflow-x-auto pb-1" tabIndex={0} aria-label="これから24時間の天気">
          {w.hourly.map((h) => {
            const hr = Number(h.t.slice(11, 13)); // JST wall clock from Open-Meteo
            const HIcon = iconFor(h.code, hr >= 6 && hr < 18);
            return (
              <li key={h.t} className="flex w-14 shrink-0 snap-start flex-col items-center gap-1 text-center">
                <span className={`text-xs ${sub}`}>{hourFmt.format(jst(h.t))}</span>
                <HIcon size={24} aria-hidden />
                <span className="text-sm font-bold tabular-nums">{Math.round(h.temp)}°</span>
                <span className={`text-[11px] tabular-nums ${sub}`}>{h.pop}%</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 7 days + notes */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ol className={`grid grid-cols-7 gap-1 rounded-[var(--radius-card)] p-3 text-center backdrop-blur-md ${panel}`} aria-label="7日間の天気">
          {w.daily.map((d, n) => {
            const DIcon = iconFor(d.code);
            return (
              <li key={d.date} className="flex flex-col items-center gap-1 py-1">
                <span className={`text-[11px] leading-tight ${sub}`}>{n === 0 ? <>今日<br />&nbsp;</> : <>{dateFmt.format(jst(`${d.date}T12:00`))}<br />（{wdFmt.format(jst(`${d.date}T12:00`))}）</>}</span>
                <DIcon size={26} aria-label={describe(d.code).label} />
                <span className="text-sm font-bold tabular-nums">{Math.round(d.max)}°</span>
                <span className={`text-xs tabular-nums ${sub}`}>{Math.round(d.min)}°</span>
              </li>
            );
          })}
        </ol>
        <div className={`rounded-[var(--radius-card)] p-5 backdrop-blur-md ${panel}`}>
          <h3 className="font-maru text-lg font-bold">今日の体調メモ <span className={`font-sans text-xs font-normal ${sub}`}>一般的な目安です</span></h3>
          <ul className="mt-2 grid gap-1.5 text-[14px] leading-[1.75]">
            {notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
          <p className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/tools/hada-yohou" className="rounded-full bg-current/10 px-3 py-1.5 font-bold hover:bg-current/20">肌予報を見る</Link>
            <Link href="/tools/kami-uneri-yohou" className="rounded-full bg-current/10 px-3 py-1.5 font-bold hover:bg-current/20">髪のうねり予報</Link>
            <Link href="/tools/suibun-meyasu" className="rounded-full bg-current/10 px-3 py-1.5 font-bold hover:bg-current/20">水分補給の目安</Link>
          </p>
        </div>
      </div>

      <p className={`mt-4 text-[11px] ${sub}`}>
        {timeFmt.format(new Date(w.fetchedAt))} 取得・10分ごとに更新　気象データ：<a href="https://open-meteo.com/" target="_blank" rel="noopener" className="underline">Open-Meteo</a>（CC BY 4.0）・<a href="https://www.jma.go.jp/" target="_blank" rel="noopener" className="underline">気象庁</a>
        {error && "　※最新の取得に失敗したため、前回の情報を表示しています"}
      </p>
    </div>
  );
}
