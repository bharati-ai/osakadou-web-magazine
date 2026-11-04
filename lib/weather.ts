// Live Osaka weather: Open-Meteo (CC BY 4.0, JMA-based models) + JMA official outlook text and warnings.
// Server-side fetches are cached for 10 minutes, so visitors never hit the upstream APIs directly.

export const OSAKA = { lat: 34.6937, lon: 135.5023, label: "大阪市" };

export type Hour = { t: string; temp: number; pop: number; code: number; rh: number; uv: number };
export type Day = { date: string; code: number; max: number; min: number; pop: number; uv: number; sunrise: string; sunset: string };
export type Weather = {
  fetchedAt: string;
  current: { time: string; temp: number; feels: number; rh: number; code: number; isDay: boolean; pressure: number; wind: number };
  hourly: Hour[]; // next 24 hours
  daily: Day[]; // 7 days, [0] = today
  pressureDelta6h: number; // hPa change over the next 6 hours
  jma: { office: string; reportDatetime: string; text: string; warnings: string[] } | null;
};

const OM =
  "https://api.open-meteo.com/v1/forecast?" +
  new URLSearchParams({
    latitude: String(OSAKA.lat),
    longitude: String(OSAKA.lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,uv_index,surface_pressure",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
    timezone: "Asia/Tokyo",
    forecast_days: "7",
  });

const JMA_OVERVIEW = "https://www.jma.go.jp/bosai/forecast/data/overview_forecast/270000.json";
const JMA_WARNING = "https://www.jma.go.jp/bosai/warning/data/warning/270000.json";

// JMA warning codes → names (大阪市 = area 2710000). Unknown codes are ignored.
const WARNING_NAMES: Record<string, string> = {
  "02": "暴風雪警報", "03": "大雨警報", "04": "洪水警報", "05": "暴風警報", "06": "大雪警報", "07": "波浪警報", "08": "高潮警報",
  "10": "大雨注意報", "12": "大雪注意報", "13": "風雪注意報", "14": "雷注意報", "15": "強風注意報", "16": "波浪注意報",
  "18": "洪水注意報", "19": "高潮注意報", "20": "濃霧注意報", "21": "乾燥注意報", "23": "低温注意報", "24": "霜注意報",
  "32": "暴風雪特別警報", "33": "大雨特別警報", "35": "暴風特別警報", "36": "大雪特別警報", "37": "波浪特別警報", "38": "高潮特別警報",
};

type OMResponse = {
  current: { time: string; temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; is_day: number; weather_code: number; surface_pressure: number; wind_speed_10m: number };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[]; relative_humidity_2m: number[]; uv_index: number[]; surface_pressure: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; uv_index_max: number[]; sunrise: string[]; sunset: string[] };
};

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { next: { revalidate: 600 } });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json() as Promise<T>;
}

async function getJma(): Promise<Weather["jma"]> {
  try {
    const [ov, wa] = await Promise.all([
      getJson<{ publishingOffice: string; reportDatetime: string; text: string }>(JMA_OVERVIEW),
      getJson<{ areaTypes: { areas: { code: string; warnings?: { code: string; status: string }[] }[] }[] }>(JMA_WARNING),
    ]);
    const city = wa.areaTypes.flatMap((t) => t.areas).find((a) => a.code === "2710000");
    const warnings = (city?.warnings ?? [])
      .filter((w) => w.status === "発表" || w.status === "継続")
      .map((w) => WARNING_NAMES[w.code])
      .filter(Boolean);
    // first paragraph of the 府県天気概況 (Osaka part only, before the 近畿地方 block)
    const text = ov.text.split("【")[0].replace(/　/g, "").trim();
    return { office: ov.publishingOffice, reportDatetime: ov.reportDatetime, text, warnings };
  } catch {
    return null;
  }
}

export async function getWeather(): Promise<Weather | null> {
  try {
    const [om, jma] = await Promise.all([getJson<OMResponse>(OM), getJma()]);
    const h = om.hourly;
    const start = Math.max(0, h.time.findIndex((t) => t >= om.current.time.slice(0, 13)));
    const hourly: Hour[] = h.time.slice(start, start + 24).map((t, i) => ({
      t, temp: h.temperature_2m[start + i], pop: h.precipitation_probability[start + i] ?? 0,
      code: h.weather_code[start + i], rh: h.relative_humidity_2m[start + i], uv: h.uv_index[start + i] ?? 0,
    }));
    const d = om.daily;
    return {
      fetchedAt: new Date().toISOString(),
      current: {
        time: om.current.time, temp: om.current.temperature_2m, feels: om.current.apparent_temperature,
        rh: om.current.relative_humidity_2m, code: om.current.weather_code, isDay: om.current.is_day === 1,
        pressure: om.current.surface_pressure, wind: om.current.wind_speed_10m,
      },
      hourly,
      daily: d.time.map((date, i) => ({
        date, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i],
        pop: d.precipitation_probability_max[i] ?? 0, uv: d.uv_index_max[i] ?? 0, sunrise: d.sunrise[i], sunset: d.sunset[i],
      })),
      pressureDelta6h: (h.surface_pressure[start + 6] ?? om.current.surface_pressure) - h.surface_pressure[start],
      jma,
    };
  } catch {
    return null;
  }
}

/** WMO weather code → Japanese label and a sky "mood" used for colours and photos. */
export function describe(code: number): { label: string; mood: "clear" | "partly" | "cloudy" | "rain" | "snow" | "storm" | "fog" } {
  if (code === 0) return { label: "快晴", mood: "clear" };
  if (code === 1) return { label: "晴れ", mood: "clear" };
  if (code === 2) return { label: "晴れ時々くもり", mood: "partly" };
  if (code === 3) return { label: "くもり", mood: "cloudy" };
  if (code === 45 || code === 48) return { label: "霧", mood: "fog" };
  if (code >= 51 && code <= 57) return { label: "霧雨", mood: "rain" };
  if (code === 61 || code === 80) return { label: "小雨", mood: "rain" };
  if (code >= 61 && code <= 67) return { label: code === 65 ? "強い雨" : "雨", mood: "rain" };
  if (code >= 71 && code <= 77) return { label: "雪", mood: "snow" };
  if (code === 81 || code === 82) return { label: "にわか雨", mood: "rain" };
  if (code === 85 || code === 86) return { label: "にわか雪", mood: "snow" };
  if (code >= 95) return { label: "雷雨", mood: "storm" };
  return { label: "くもり", mood: "cloudy" };
}
