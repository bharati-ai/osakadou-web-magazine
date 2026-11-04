"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { Place } from "./places";

type LatLon = [number, number];

function View({ center, focus }: { center: LatLon; focus: Place | null }) {
  const map = useMap();
  const [lat, lon] = center;
  useEffect(() => { map.setView([lat, lon], 14); }, [map, lat, lon]);
  useEffect(() => { if (focus) map.flyTo([focus.lat, focus.lon], 17, { duration: 0.6 }); }, [map, focus]);
  return null;
}

/** Leaflet + OSM tiles. Loaded only in the browser (next/dynamic, ssr:false) by the map tool. */
export function LeafletMap({
  center, radius, places, selected, fallbackName, onSelect,
}: {
  center: LatLon; radius: number; places: Place[]; selected: string | null; fallbackName: string; onSelect: (id: string) => void;
}) {
  const focus = places.find((p) => p.id === selected) ?? null;
  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="h-[320px] w-full md:h-[440px]">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <View center={center} focus={focus} />
      <Circle center={center} radius={radius} interactive={false} pathOptions={{ className: "fill-shu stroke-shu", weight: 1.5, fillOpacity: 0.05, dashArray: "6 6" }} />
      <CircleMarker center={center} radius={6} pathOptions={{ className: "fill-ink stroke-card", weight: 3, fillOpacity: 1 }}>
        <Tooltip direction="top">検索の中心</Tooltip>
      </CircleMarker>
      {places.map((p) => {
        const on = p.id === selected;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={on ? 12 : 8}
            pathOptions={{ className: "fill-shu stroke-card", weight: on ? 4 : 2, fillOpacity: on ? 1 : 0.85 }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip key={on ? "on" : "off"} direction="top" offset={[0, -8]} permanent={on}>{p.name ?? fallbackName}</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
