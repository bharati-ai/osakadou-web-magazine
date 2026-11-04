import { Pic, SectionTitle } from "@/components/ui";
import type { HomeContent } from "@/lib/cms/pages";
import { SEASONS, seasonOf } from "@/lib/content";
import { getWeather } from "@/lib/weather";
import { Tabs } from "./tabs";
import { WeatherLive } from "./weather-live";

function nowJst() {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", month: "numeric" }).format(new Date());
  return Number(s);
}

/** Event status inside the current season: 今月 / もうすぐ (next month) / 終了 (earlier this season). */
function status(eventMonth: string, month: number): "今月" | "もうすぐ" | "終了" | null {
  if (eventMonth.includes("〜")) return null;
  const m = parseInt(eventMonth, 10);
  const d = (month - m + 12) % 12;
  if (d === 0) return "今月";
  if (d === 11) return "もうすぐ";
  if (d < 3) return "終了";
  return null;
}

/** 大阪の天気と季節カレンダー: live weather (server-rendered, refreshed on the client) + seasonal events. */
export async function WeatherCalendar({ c }: { c: HomeContent["calendar"] }) {
  const weather = await getWeather();
  const month = nowJst();
  const current = seasonOf(month);
  const initial = SEASONS.findIndex((s) => s.id === current);

  return (
    <section id="calendar" aria-labelledby="h-calendar" className="py-16 md:py-24">
      <div className="wrap">
        <SectionTitle id="h-calendar" cms="home:calendar.title" ja={c.title} en="Live Weather & Seasonal Calendar" />
        <WeatherLive initial={weather} />

        <div className="mt-14">
          <h3 data-cms="home:calendar.subhead" className="mb-2 text-center font-maru text-xl font-bold">{c.subhead}</h3>
          <Tabs labels={SEASONS.map((s) => s.label)} initial={initial}>
            {SEASONS.map((s, si) => {
              const x = c.seasons[si];
              return (
              <div key={s.id} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                <div className="relative isolate flex min-h-[220px] overflow-hidden rounded-[var(--radius-card)] bg-night text-on-night">
                  <Pic cms={`home:calendar.seasons.${si}.image`} img={x.image} sizes="(min-width:1024px) 460px, 100vw" className="-z-10" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-night/85 to-transparent" aria-hidden />
                  <div className="mt-auto p-5">
                    <p className="font-mincho text-6xl font-bold">{s.label}</p>
                    <p className="mt-1 text-sm"><span data-cms={`home:calendar.seasons.${si}.months`}>{x.months}</span>{s.id === current && <span className="ml-2 rounded-[var(--radius-chip)] bg-shu px-2 py-0.5 text-xs font-bold text-on-shu">いまの季節</span>}</p>
                  </div>
                </div>
                <div className="grid content-start gap-3">
                  <ol className="grid gap-3">
                    {x.events.map((e, ei) => {
                      const st = s.id === current ? status(e.month, month) : null;
                      return (
                        <li key={ei} className={`card-hard flex items-start gap-4 p-4 ${st === "終了" ? "opacity-80" : ""}`}>
                          <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-band text-center">
                            <Pic cms={`home:calendar.seasons.${si}.events.${ei}.image`} img={e.image} sizes="80px" />
                            <span className={`relative rounded-md px-1.5 py-1 ${e.image.src ? "bg-paper/90" : ""}`}>
                              <span data-cms={`home:calendar.seasons.${si}.events.${ei}.month`} data-cms-strip="月" className="block font-latin text-xl font-bold leading-none text-shu-ink">{e.month.replace("月", "")}</span>
                              <span className="text-[11px]">月</span>
                            </span>
                          </span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2 font-maru text-[17px] font-bold">
                              <span data-cms={`home:calendar.seasons.${si}.events.${ei}.title`}>{e.title}</span>
                              {st && (
                                <span className={`rounded-[var(--radius-chip)] px-1.5 py-0.5 font-sans text-[11px] ${st === "終了" ? "border border-line text-ink-2" : "bg-shu text-on-shu"}`}>{st}</span>
                              )}
                            </span>
                            <span data-cms={`home:calendar.seasons.${si}.events.${ei}.note`} className="mt-1 block text-[13.5px] text-ink-2">{e.note}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="rounded-[var(--radius-card)] bg-band p-4 text-[14px] leading-[1.8]"><b className="font-maru">体調メモ</b>　<span data-cms={`home:calendar.seasons.${si}.memo`}>{x.memo}</span></p>
                </div>
              </div>
              );
            })}
          </Tabs>
          <p data-cms="home:calendar.footnote" className="mt-4 text-xs text-ink-2">{c.footnote}</p>
        </div>
      </div>
    </section>
  );
}
