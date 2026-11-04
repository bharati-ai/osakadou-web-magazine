import { unstable_cache } from "next/cache";
import {
  LIST_LIMIT, PLACE_CATS, RADIUS_M, distanceM, inOsaka, isPlaceCat, round3,
  type Place, type PlaceCat, type PlacesResponse,
} from "@/components/tools/life/places";

// Cached Overpass proxy for the 近くの施設マップ. Clients never call Overpass directly.
// Coordinates are rounded to 3 decimals, so nearby users share one cache entry per category for a day.
export const revalidate = 86400;

const OVERPASS = "https://overpass-api.de/api/interpreter";

type OsmEl = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
type OsmJson = { elements: OsmEl[]; remark?: string; osm3s?: { timestamp_osm_base?: string } };

function note(cat: PlaceCat, t: Record<string, string>) {
  if (cat === "aed") return t["defibrillator:location:ja"] ?? t["defibrillator:location"] ?? t.description;
  if (cat === "toilet" && t.wheelchair === "yes") return "車いす対応";
  return undefined;
}

// unstable_cache only stores resolved values: upstream errors and Overpass "remark" timeouts throw and are not cached.
const lookup = unstable_cache(
  async (cat: PlaceCat, lat: number, lon: number): Promise<Omit<PlacesResponse, "cat" | "lat" | "lon" | "radius">> => {
    // ponytail: arbitrary first 300 (qt order) if a 1 km circle ever holds more; real Osaka counts are well under 100.
    const q = `[out:json][timeout:25];nwr${PLACE_CATS[cat].filter}(around:${RADIUS_M},${lat},${lon});out center tags qt 300;`;
    const r = await fetch(`${OVERPASS}?data=${encodeURIComponent(q)}`, {
      cache: "no-store",
      headers: { "User-Agent": "OSAKADOU/1.0 (+https://osakadou.live/tools/osaka-map)" },
      signal: AbortSignal.timeout(45000),
    });
    if (!r.ok) throw new Error(`overpass ${r.status}`);
    const j = (await r.json()) as OsmJson;
    if (j.remark) throw new Error(`overpass remark: ${j.remark}`);
    const items: Place[] = j.elements
      .map((e): Place | null => {
        const p = e.center ?? (e.lat != null && e.lon != null ? { lat: e.lat, lon: e.lon } : null);
        if (!p) return null;
        const t = e.tags ?? {};
        return {
          id: `${e.type}/${e.id}`,
          name: t["name:ja"] ?? t.name ?? null,
          lat: p.lat,
          lon: p.lon,
          dist: Math.round(distanceM(lat, lon, p.lat, p.lon)),
          note: note(cat, t),
        };
      })
      .filter((x): x is Place => x !== null && x.dist <= RADIUS_M)
      .sort((a, b) => a.dist - b.dist);
    return { total: items.length, items: items.slice(0, LIST_LIMIT), dataAt: j.osm3s?.timestamp_osm_base ?? null };
  },
  ["places-v1"],
  { revalidate: 86400 },
);

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const cat = sp.get("cat");
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  if (!isPlaceCat(cat) || !sp.get("lat") || !sp.get("lon") || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!inOsaka(lat, lon)) return Response.json({ error: "outside" }, { status: 400 });
  const la = round3(lat), lo = round3(lon);
  try {
    const data = await lookup(cat, la, lo);
    const body: PlacesResponse = { cat, lat: la, lon: lo, radius: RADIUS_M, ...data };
    return Response.json(body, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return Response.json({ error: "upstream" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
