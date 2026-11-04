"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useL } from "./lang";
import { card } from "./ui";

/** Drop or choose images for the media library (several at once). */
export function MediaUploader() {
  const router = useRouter();
  const L = useL();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const errors: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (!r.ok) errors.push(`${f.name}: ${(await r.json().catch(() => ({}))).error ?? r.status}`);
    }
    setBusy(false);
    setMsg(errors.length ? L(`一部アップロードできませんでした：${errors.join(" / ")}`, `Some files couldn’t be uploaded: ${errors.join(" / ")}`) : L(`${files.length}枚アップロードしました`, `Uploaded ${files.length} ${files.length === 1 ? "image" : "images"}`));
    router.refresh();
  }
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
      className={`${card} grid cursor-pointer place-items-center border-2 border-dashed p-8 text-center text-sm text-ink-2 hover:border-shu`}
    >
      <span>{busy ? L("アップロード中…", "Uploading…") : L("ここに画像をドロップ、またはクリックして選択（複数可・1枚10MBまで）", "Drop images here or click to choose (multiple allowed, up to 10MB each)")}</span>
      {msg && <span role="status" className="mt-2 block text-ink">{msg}</span>}
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files)} />
    </label>
  );
}
