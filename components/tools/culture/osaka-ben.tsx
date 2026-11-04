"use client";

import { useId, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { ShareButton } from "@/components/share-button";
import { toOsakaBen } from "./osaka-ben-rules";

const SAMPLES = [
  "本当にありがとう。とても助かったよ。",
  "早く行かないと、電車に間に合わないよ。",
  "どこにいるの？もうすぐ着くんだけど。",
  "昨日、梅田でたこ焼きを買ったんだ。おいしかったよ。",
  "そんなことはないよ、気にしないで。",
  "これ、いくら？ちょっと高くない？",
  "だから言ったじゃない。",
  "そうだね、じゃあまた明日。",
];
const MAX = 300;

export function OsakaBenTool() {
  const id = useId();
  const [src, setSrc] = useState(SAMPLES[0]);
  const [copied, setCopied] = useState(false);
  const out = toOsakaBen(src.trim());
  const changed = out !== src.trim();

  async function copy() {
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the text stays selectable */ }
  }

  const shareText = `大阪弁にしてみたで：「${out.length > 80 ? out.slice(0, 80) + "…" : out}」`;

  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <label htmlFor={id} className="text-sm font-bold">標準語の文章</label>
        <textarea
          id={id}
          value={src}
          maxLength={MAX}
          rows={4}
          onChange={(e) => setSrc(e.target.value)}
          aria-describedby={`${id}-h`}
          className="w-full resize-y rounded-[10px] border-2 border-line-strong bg-paper px-3 py-2.5 text-base leading-relaxed outline-none focus:border-shu"
        />
        <p id={`${id}-h`} className="text-xs text-ink-2">ふだんの話し言葉で入れると、大阪弁らしくなりやすいです（{src.length}/{MAX}文字）。</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-bold">例文を入れてみる</legend>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSrc(s)}
              aria-pressed={s === src}
              className="min-h-11 rounded-full border-2 border-line-strong px-4 text-left text-[13px] font-bold aria-pressed:border-shu aria-pressed:text-shu-ink"
            >
              {s.length > 16 ? s.slice(0, 16) + "…" : s}
            </button>
          ))}
        </div>
      </fieldset>

      <section aria-live="polite" className="rounded-[var(--radius-card)] bg-band p-5">
        <h2 className="text-sm font-bold text-ink-2">大阪弁にすると</h2>
        <p className="mt-2 min-h-[2em] whitespace-pre-wrap font-maru text-[22px] font-bold leading-relaxed md:text-[26px]">
          {out || <span className="text-base font-normal text-ink-2">上の欄に文章を入れてみてください。</span>}
        </p>
        {out && !changed && <p className="mt-2 text-sm text-ink-2">この文は、変換できる言い回しが見つかりませんでした。「〜だよ」「〜しない」「ありがとう」などを含む文で試してみてください。</p>}
      </section>

      {out && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-shu bg-shu px-5 text-sm font-bold text-on-shu active:translate-y-px"
          >
            {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
            <span aria-live="polite">{copied ? "コピーしました" : "変換結果をコピー"}</span>
          </button>
          <ShareButton text={shareText} label="変換結果を共有" />
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-2">
        決まったルールで言い回しを置きかえる、遊びの変換です。大阪弁は地域や世代、場面によって言い方が変わるので、ちょっと違うなと思ったら笑って流してください。
      </p>
    </div>
  );
}
