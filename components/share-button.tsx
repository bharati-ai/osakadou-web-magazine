"use client";

import { useState } from "react";
import { ShareNetwork } from "@phosphor-icons/react";

/** Web Share API with a labelled copy fallback (pastes cleanly into LINE). */
export function ShareButton({ text = "オオサカ堂｜大阪で、暮らす。", label = "このページを共有", path }: { text?: string; label?: string; path?: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  async function share() {
    const url = location.origin + (path ?? location.pathname);
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); return; }
      catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); setMsg("リンクをコピーしました"); }
    catch { setMsg(url); }
    setTimeout(() => setMsg(null), 2500);
  }
  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current px-5 text-sm font-bold active:translate-y-px"
    >
      <ShareNetwork size={18} aria-hidden />
      {msg ?? label}
    </button>
  );
}
