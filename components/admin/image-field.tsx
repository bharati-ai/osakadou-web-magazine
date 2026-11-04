"use client";

import { useState } from "react";
import { MediaPicker } from "./media-picker";
import { useL } from "./lang";
import { btnGhost } from "./ui";

const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=384&q=55`;

/** One image path (e.g. an OG image) chosen from the media library; "" = none. */
export function ImageField({ value, onChange, empty }: { value: string; onChange: (src: string) => void; empty: string }) {
  const L = useL();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-start gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb(value)} alt="" className="h-[84px] w-40 rounded-md bg-paper-2 object-cover" />
      ) : (
        <span className="grid h-[84px] w-40 place-items-center rounded-md border border-dashed border-line px-2 text-center text-xs text-ink-2">{empty}</span>
      )}
      <div className="grid gap-2">
        <button type="button" onClick={() => setOpen(true)} className={`${btnGhost} min-h-8 px-3 text-xs`}>{L("画像を選ぶ", "Choose image")}</button>
        {value && <button type="button" onClick={() => onChange("")} className={`${btnGhost} min-h-8 px-3 text-xs`}>{L("外す", "Remove")}</button>}
        {value && <code className="max-w-[260px] truncate text-[11px] text-ink-2">{value}</code>}
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(p) => onChange(p.src)} />
    </div>
  );
}

/** Google-style result preview. */
export function SerpPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3 text-left font-sans dark:bg-[#1f1f1f]">
      <p className="truncate text-xs text-[#4d5156] dark:text-[#bdc1c6]">{url}</p>
      <p className="mt-0.5 line-clamp-1 text-[18px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{title}</p>
      <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6]">{description}</p>
    </div>
  );
}

/** "12 / 34" with a colour when outside the recommended range. */
export function Count({ n, min = 0, max }: { n: number; min?: number; max: number }) {
  const tone = n === 0 ? "text-ink-2" : n < min || n > max ? "text-[var(--caution)]" : "text-[#2e7d32]";
  return <span className={`text-[11px] tabular-nums ${tone}`}>{n} / {min ? `${min}–` : ""}{max}</span>;
}
