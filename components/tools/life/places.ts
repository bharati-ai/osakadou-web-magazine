// Shared by the map tool (client) and /api/places (server). OSM tags checked against the OSM wiki and live Overpass data.

export const PLACE_CATS = {
  medical: { label: "病院・診療所", filter: '["amenity"~"^(hospital|clinic|doctors)$"]' },
  pharmacy: { label: "薬局", filter: '["amenity"="pharmacy"]' },
  park: { label: "公園", filter: '["leisure"="park"]' },
  sento: { label: "銭湯", filter: '["amenity"="public_bath"]' },
  police: { label: "交番・警察署", filter: '["amenity"="police"]' },
  aed: { label: "AED", filter: '["emergency"="defibrillator"]["access"!~"^(private|no)$"]' },
  toilet: { label: "公衆トイレ", filter: '["amenity"="toilets"]["access"!~"^(private|no|customers)$"]' },
} as const;

export type PlaceCat = keyof typeof PLACE_CATS;
export const isPlaceCat = (s: string | null): s is PlaceCat => !!s && Object.hasOwn(PLACE_CATS, s);

export type Place = { id: string; name: string | null; lat: number; lon: number; dist: number; note?: string };
export type PlacesResponse = { cat: PlaceCat; lat: number; lon: number; radius: number; total: number; items: Place[]; dataAt: string | null };

/** 大阪府 plus a small margin. Requests outside are refused, not clamped (clamped results would be misleading). */
export const OSAKA_BOUNDS = { s: 34.25, n: 35.07, w: 135.08, e: 135.76 };
export const inOsaka = (lat: number, lon: number) =>
  lat >= OSAKA_BOUNDS.s && lat <= OSAKA_BOUNDS.n && lon >= OSAKA_BOUNDS.w && lon <= OSAKA_BOUNDS.e;

export const RADIUS_M = 1000;
export const LIST_LIMIT = 40;

/** 3 decimals ≈ 110 m in Osaka: coarse enough for privacy and cache hits, fine enough for a 1 km search. */
export const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Great-circle distance in metres. */
export function distanceM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}
