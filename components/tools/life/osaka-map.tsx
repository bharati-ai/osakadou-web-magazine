"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowClockwise, ArrowSquareOut, Warning } from "@phosphor-icons/react";
import { Choice, Result } from "../fields";
import { LIST_LIMIT, PLACE_CATS, RADIUS_M, inOsaka, round3, type PlaceCat, type PlacesResponse } from "./places";

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse motion-reduce:animate-none bg-paper-2 md:h-[440px]" aria-hidden />,
});

// Station-area centres, already rounded to 3 decimals (what the API would do anyway).
const AREAS = {
  umeda: { label: "梅田", near: "大阪駅・梅田駅付近", lat: 34.702, lon: 135.496 },
  namba: { label: "なんば", near: "なんば駅付近", lat: 34.666, lon: 135.501 },
  tennoji: { label: "天王寺", near: "天王寺駅付近", lat: 34.647, lon: 135.514 },
  kyobashi: { label: "京橋", near: "京橋駅付近", lat: 34.697, lon: 135.534 },
  tenma: { label: "天満", near: "天満駅付近", lat: 34.705, lon: 135.512 },
  nakanoshima: { label: "中之島", near: "大阪市役所付近", lat: 34.693, lon: 135.5 },
} as const;
type AreaId = keyof typeof AREAS;
type Where = AreaId | "here";

const FIRST = 10; // rows shown before 「残りを表示」
const NAVII ="https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2310/initialize?pref=27";
const mapsUrl = (lat: number, lon: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
const fmtDist = (m: number) => (m < 1000 ? `約${Math.max(10, Math.round(m / 10) * 10)}m` : `約${(m / 1000).toFixed(1)}km`);
const fmtDate = (iso: string) => new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));

type State =
  | { s: "loading"; slow: boolean }
  | { s: "ok"; data: PlacesResponse }
  | { s: "error" };

export function OsakaMapTool() {
  const [where, setWhere] = useState<Where>("umeda");
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [cat, setCat] = useState<PlaceCat>("medical");
  const [state, setState] = useState<State>({ s: "loading", slow: false });
  const [selected, setSelected] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const center = where === "here" && here ? here : AREAS[where === "here" ? "umeda" : where];
  const { lat, lon } = center;

  useEffect(() => {
    const ac = new AbortController();
    setState({ s: "loading", slow: false });
    setSelected(null);
    setShowAll(false);
    const t = setTimeout(() => setState((st) => (st.s === "loading" ? { s: "loading", slow: true } : st)), 4000);
    fetch(`/api/places?lat=${lat}&lon=${lon}&cat=${cat}`, { signal: ac.signal })
      .then((r) => (r.ok ? (r.json() as Promise<PlacesResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => setState({ s: "ok", data }))
      .catch(() => { if (!ac.signal.aborted) setState({ s: "error" }); })
      .finally(() => clearTimeout(t));
    return () => { ac.abort(); clearTimeout(t); };
  }, [lat, lon, cat, retry]);

  function pick(v: Where) {
    setGeoMsg(null);
    if (v !== "here") return setWhere(v);
    if (!("geolocation" in navigator)) return setGeoMsg("この端末では現在地を取得できません。エリアを選んでください。");
    setGeoMsg("現在地を確認しています…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: round3(pos.coords.latitude), lon: round3(pos.coords.longitude) };
        if (!inOsaka(p.lat, p.lon)) return setGeoMsg("現在地が大阪府の外のようです。このマップは大阪府内で使えます。エリアを選んでください。");
        setHere(p);
        setWhere("here");
        setGeoMsg(null);
      },
      () => setGeoMsg("現在地を取得できませんでした。位置情報の許可を確認するか、エリアを選んでください。"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const label = PLACE_CATS[cat].label;
  const from = where === "here" ? "現在地" : AREAS[where].label;
  const data = state.s === "ok" ? state.data : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Choice<Where>
          label="場所"
          value={where}
          onChange={pick}
          options={[...Object.entries(AREAS).map(([k, a]) => ({ value: k as AreaId, label: a.label })), { value: "here", label: "現在地" }]}
        />
        <p className="text-xs leading-relaxed text-ink-2">
          「現在地」を選ぶと、ブラウザが位置情報の利用許可を求めます。緯度・経度は約100m単位に丸めてから当サイトのサーバーへ送り、OpenStreetMapのデータ検索だけに使います。
        </p>
        {geoMsg && <p role="status" className="text-sm font-bold text-shu-ink">{geoMsg}</p>}
      </div>

      <Choice<PlaceCat>
        label="探すもの"
        value={cat}
        onChange={setCat}
        options={Object.entries(PLACE_CATS).map(([k, c]) => ({ value: k as PlaceCat, label: c.label }))}
      />

      <Result
        label={`${from}から半径1km以内の${label}`}
        value={data ? String(data.total) : "-"}
        unit="件"
        sub={
          state.s === "loading" ? (state.slow ? "OpenStreetMapのデータを探しています。初めての場所は数十秒かかることがあります。" : "探しています…")
          : state.s === "error" ? "データを読み込めませんでした。"
          : data && data.total > 0 ? `近い順に${data.total > LIST_LIMIT ? `${LIST_LIMIT}件まで` : "すべて"}表示しています。距離は${where === "here" ? "現在地" : AREAS[where].near}からの直線距離の目安です。`
          : "OpenStreetMapには登録がありませんでした。実際には施設がある場合もあります。"
        }
      />

      {cat === "medical" && (
        <p className="rounded-[10px] border border-line bg-paper p-3 text-[13.5px] leading-relaxed">
          診療時間や休診日は、厚生労働省の
          <a href={NAVII} target="_blank" rel="noopener" className="font-bold text-shu-ink underline underline-offset-4">医療情報ネット（ナビイ）</a>
          で確認してください。急な病気やけがで受診に迷ったら#7119、命に関わるときは迷わず119番へ。
        </p>
      )}
      {cat === "pharmacy" && (
        <p className="rounded-[10px] border border-line bg-paper p-3 text-[13.5px] leading-relaxed">
          OpenStreetMapに登録された場所をそのまま表示しています。特定の薬局をおすすめするものではありません。営業時間は
          <a href={NAVII} target="_blank" rel="noopener" className="font-bold text-shu-ink underline underline-offset-4">医療情報ネット（ナビイ）</a>
          で確認できます。
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div role="region" aria-label={`${from}周辺の${label}の地図`} className="relative isolate z-0 overflow-hidden rounded-[var(--radius-card)] border border-line">
          <LeafletMap
            center={[lat, lon]}
            radius={RADIUS_M}
            places={data?.items ?? []}
            selected={selected}
            fallbackName={label}
            onSelect={setSelected}
          />
        </div>

        <div className="xl:max-h-[440px] xl:overflow-y-auto">
          {state.s === "loading" && (
            <ul className="grid gap-2" aria-hidden>
              {[0, 1, 2, 3].map((i) => <li key={i} className="h-[76px] animate-pulse motion-reduce:animate-none rounded-[10px] bg-paper-2" />)}
            </ul>
          )}
          {state.s === "error" && (
            <div role="alert" className="grid gap-3 rounded-[10px] border border-line bg-paper p-4 text-sm">
              <p className="flex gap-2"><Warning size={18} className="mt-1 shrink-0 text-shu" aria-hidden />地図データの提供元が混み合っているようです。少し待ってからもう一度お試しください。</p>
              <button type="button" onClick={() => setRetry((n) => n + 1)} className="inline-flex min-h-11 items-center justify-center gap-2 justify-self-start rounded-full border-2 border-line px-5 font-bold hover:border-shu">
                <ArrowClockwise size={16} aria-hidden />もう一度読み込む
              </button>
            </div>
          )}
          {data && data.items.length === 0 && (
            <p className="rounded-[10px] border border-dashed border-line p-4 text-sm text-ink-2">
              {from}の半径1km以内に、{label}は見つかりませんでした。ほかのエリアや種類も試してみてください。
            </p>
          )}
          {data && data.items.length > 0 && (
            <>
              <ol className="grid gap-2">
                {(showAll ? data.items : data.items.slice(0, FIRST)).map((p) => {
                  const on = p.id === selected;
                  return (
                    <li key={p.id} className={`flex items-center gap-2 rounded-[10px] border-2 bg-card py-1.5 pl-3 pr-2 ${on ? "border-shu" : "border-line"}`}>
                      <button type="button" onClick={() => setSelected(p.id)} aria-pressed={on} className="min-h-11 min-w-0 flex-1 text-left">
                        <span className="block font-bold leading-snug">{p.name ?? `${label}（名称の登録なし）`}</span>
                        <span className="block text-xs text-ink-2">{fmtDist(p.dist)}{p.note ? `・${p.note}` : ""}</span>
                      </button>
                      <a
                        href={mapsUrl(p.lat, p.lon)}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-shu-ink underline underline-offset-4"
                      >
                        地図アプリで開く<ArrowSquareOut size={13} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ol>
              {!showAll && data.items.length > FIRST && (
                <button type="button" onClick={() => setShowAll(true)} className="mt-3 min-h-11 w-full rounded-full border-2 border-line text-sm font-bold hover:border-shu">
                  残り{data.items.length - FIRST}件を表示
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-2">
        地図・施設データ：
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="underline underline-offset-4">© OpenStreetMap contributors</a>
        （ODbL）。ボランティアが登録したデータのため、閉店・移転などが反映されていないことがあります。
        {data?.dataAt && <>データは{fmtDate(data.dataAt)}時点のものです。</>}
      </p>
    </div>
  );
}
