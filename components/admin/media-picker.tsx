"use client";

import { useEffect, useRef, useState } from "react";
import { mediaLibrary, type MediaHit } from "@/app/admin/(panel)/posts/actions";
import { photos } from "@/lib/photos";
import { useL } from "./lang";
import { btnGhost, btnPrimary, input, label } from "./ui";

export type Picked = { src: string; alt: string; caption?: string };

const SITE_PHOTOS: MediaHit[] = Object.entries(photos).map(([slot, p]) => ({ src: `/photos/${slot}.jpg`, alt: p.alt, width: p.w, height: p.h }));
const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=256&q=55`;

/** Modal: upload a new image, or choose from the media library or the site's photos. */
export function MediaPicker({ open, onClose, onPick, withCaption }: { open: boolean; onClose: () => void; onPick: (p: Picked) => void; withCaption?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const L = useL();
  const [tab, setTab] = useState<"upload" | "library" | "photos">("library");
  const [items, setItems] = useState<MediaHit[]>([]);
  const [q, setQ] = useState("");
  const [chosen, setChosen] = useState<MediaHit | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open && tab === "library") mediaLibrary(q).then(setItems).catch(() => setErr(L("一覧を読み込めませんでした", "Couldn’t load the library")));
  }, [open, tab, q]);

  function choose(m: MediaHit) {
    setChosen(m);
    setAlt(m.alt);
  }

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", alt);
    try {
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? L("アップロードに失敗しました", "Upload failed"));
      choose(j);
      setTab("library");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    if (!chosen) return;
    onPick({ src: chosen.src, alt: alt.trim(), caption: caption.trim() || undefined });
    setChosen(null);
    setCaption("");
    onClose();
  }

  const list = tab === "photos" ? SITE_PHOTOS : items;
  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(960px,calc(100vw-24px))] rounded-[var(--radius-card)] border border-line bg-card p-0 text-ink backdrop:bg-black/50">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="font-maru text-lg font-bold">{L("画像を選ぶ", "Choose an image")}</h2>
        <button type="button" onClick={onClose} className={btnGhost} aria-label={L("閉じる", "Close")}>{L("閉じる", "Close")}</button>
      </div>
      <div className="flex gap-2 border-b border-line px-5 py-2 text-sm" role="group" aria-label={L("画像の選び方", "Image source")}>
        {([["library", L("メディアライブラリ", "Media library")], ["photos", L("サイトの写真", "Site photos")], ["upload", L("アップロード", "Upload")]] as const).map(([k, l]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} className={`rounded-full px-3 py-1.5 ${tab === k ? "bg-ink text-paper" : "border border-line"}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-h-[300px]">
          {tab === "upload" ? (
            <label className="grid h-[300px] cursor-pointer place-items-center rounded-[var(--radius-card)] border-2 border-dashed border-line text-center text-sm text-ink-2 hover:border-shu">
              <span>{busy ? L("アップロード中…", "Uploading…") : <>{L("クリックして画像を選ぶ", "Click to choose an image")}<br />{L("JPEG / PNG / WebP / AVIF / GIF（10MBまで）", "JPEG / PNG / WebP / AVIF / GIF (up to 10MB)")}<br />{L("WebP に変換して保存します", "Saved as WebP")}</>}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          ) : (
            <>
              {tab === "library" && <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L("代替テキスト・ファイル名で検索", "Search alt text or file name")} aria-label={L("画像を検索", "Search images")} className={`${input} mb-3`} />}
              <ul className="grid max-h-[420px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {list.map((m) => (
                  <li key={m.src}>
                    <button type="button" onClick={() => choose(m)} className={`block aspect-square w-full overflow-hidden rounded-lg border-2 ${chosen?.src === m.src ? "border-shu" : "border-transparent"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb(m.src)} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
                {!list.length && <li className="col-span-full py-10 text-center text-sm text-ink-2">{L("画像がありません。「アップロード」から追加できます。", "No images. Add one from “Upload”.")}</li>}
              </ul>
            </>
          )}
          {err && <p role="alert" className="mt-3 text-sm text-[#b3261e]">{err}</p>}
        </div>
        <div className="grid content-start gap-3">
          {chosen ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(chosen.src)} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
              <p className="text-xs text-ink-2">{chosen.width}×{chosen.height}px</p>
              <div>
                <label className={label} htmlFor="mp-alt">{L("代替テキスト（alt）", "Alt text")}</label>
                <input id="mp-alt" value={alt} onChange={(e) => setAlt(e.target.value)} className={input} placeholder={L("何が写っているかを短く", "Briefly describe what’s shown")} />
              </div>
              {withCaption && (
                <div>
                  <label className={label} htmlFor="mp-cap">{L("キャプション（任意）", "Caption (optional)")}</label>
                  <input id="mp-cap" value={caption} onChange={(e) => setCaption(e.target.value)} className={input} placeholder={L("例：天神橋筋商店街（北区）", "e.g. 天神橋筋商店街（北区）")} />
                </div>
              )}
              <button type="button" onClick={finish} className={btnPrimary}>{L("この画像を使う", "Use this image")}</button>
            </>
          ) : (
            <p className="text-sm text-ink-2">{L("画像を選ぶと、ここで説明文を入力できます。", "Choose an image to add its description here.")}</p>
          )}
        </div>
      </div>
    </dialog>
  );
}
