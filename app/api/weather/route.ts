import { getWeather } from "@/lib/weather";

// Cached proxy: clients poll this instead of the upstream APIs (10-minute cache).
export const revalidate = 600;

export async function GET() {
  const w = await getWeather();
  if (!w) return Response.json({ error: "weather unavailable" }, { status: 503 });
  return Response.json(w, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } });
}
