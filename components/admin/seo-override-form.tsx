"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveOverrideAction, type SeoSaveState } from "@/app/admin/(panel)/seo/actions";
import type { SeoOverride } from "@/lib/cms/seo";
import { Count, ImageField, SerpPreview } from "./image-field";
import { useL } from "./lang";
import { Submit, btnGhost, card, input, label, useLeaveGuard } from "./ui";

type Str = "title" | "description" | "ogTitle" | "ogDescription" | "canonical";

/** Overrides for one page. Empty fields fall back to the page’s own title and description. */
export function SeoOverrideForm({ path, initial, defaults, template }: { path: string; initial: SeoOverride; defaults: { title: string; description: string }; template: string }) {
  const L = useL();
  const [o, setO] = useState(initial);
  const [base, setBase] = useState(() => JSON.stringify(initial));
  const [state, action] = useActionState<SeoSaveState, FormData>(saveOverrideAction, null);
  const sent = useRef(base);
  const json = JSON.stringify(o);
  const dirty = json !== base;
  useLeaveGuard(dirty);
  useEffect(() => { if (state?.ok) setBase(sent.current); }, [state]);

  // opened once from the saved values, then left to the user (clearing fields must not collapse it)
  const [advOpen] = useState(() => !!(initial.ogTitle || initial.ogDescription || initial.ogImage || initial.canonical || initial.noindex || initial.nofollow));
  const set = (k: keyof SeoOverride, v: string | boolean) => setO((x) => ({ ...x, [k]: v }));
  const text = (k: Str, name: string, ph: string, max: number, min = 0, long = false) => (
    <div>
      <div className="flex justify-between gap-2"><label className={label} htmlFor={`o-${k}`}>{name}</label>{max > 0 && <Count n={(o[k] ?? "").length} min={min} max={max} />}</div>
      {long
        ? <textarea id={`o-${k}`} rows={3} value={o[k] ?? ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} className={input} />
        : <input id={`o-${k}`} value={o[k] ?? ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} className={`${input} ${k === "canonical" ? "font-mono text-sm" : ""}`} />}
    </div>
  );
  const title = o.title || defaults.title;
  const description = o.description || defaults.description;

  return (
    <form action={action} onSubmit={() => { sent.current = json; }} className={`${card} grid gap-4 p-5`}>
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="data" value={json} />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-maru text-lg font-bold"><code className="font-mono text-base">{path}</code></h2>
        <a href={path} target="_blank" className="text-xs underline">{L("ページを見る ↗", "View page ↗")}</a>
      </div>
      <p className="text-xs text-ink-2">{L("空欄の項目は、ページ本来のタイトル・説明文を使います（プレースホルダーが現在の値です）。", "Empty fields use the page’s own title and description (shown as placeholders).")}</p>
      <SerpPreview title={path === "/" ? title : template.replace("%s", title)} description={description} url={`osakadou.live${path === "/" ? "" : path}`} />
      {text("title", L("SEOタイトル", "SEO title"), defaults.title, 34)}
      {text("description", L("メタディスクリプション", "Meta description"), defaults.description, 125, 80, true)}
      <details className="rounded-lg border border-line p-3" open={advOpen}>
        <summary className="cursor-pointer text-sm font-bold">{L("SNS・インデックスの詳細設定", "Social & indexing (advanced)")}</summary>
        <div className="mt-3 grid gap-4">
          {text("ogTitle", L("SNS用タイトル（og:title）", "Social title (og:title)"), template.replace("%s", title), 60)}
          {text("ogDescription", L("SNS用説明文（og:description）", "Social description (og:description)"), description, 110, 0, true)}
          <div>
            <p className={label}>{L("SNS用画像（og:image）", "Social image (og:image)")}</p>
            <ImageField value={o.ogImage ?? ""} onChange={(v) => set("ogImage", v)} empty={L("既定の画像", "Default image")} />
          </div>
          {text("canonical", L("canonical URL（別のURLを正規にするときだけ）", "Canonical URL (only to point at another URL)"), path, 0)}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 size-4 accent-shu" checked={!!o.noindex} onChange={(e) => set("noindex", e.target.checked)} />
            <span>noindex<span className="block text-xs text-ink-2">{L("検索結果に出さない（サイトマップからも外れます）", "Keep out of search results (also removed from the sitemap)")}</span></span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 size-4 accent-shu" checked={!!o.nofollow} onChange={(e) => set("nofollow", e.target.checked)} />
            <span>nofollow<span className="block text-xs text-ink-2">{L("このページのリンクをたどらせない（通常は不要）", "Ask crawlers not to follow links on this page (rarely needed)")}</span></span>
          </label>
        </div>
      </details>
      {state?.error && <p role="alert" className="rounded-lg border border-[#b3261e] bg-[#b3261e]/10 px-3 py-2 text-sm">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Submit>{L("保存して公開", "Save & publish")}</Submit>
        <button type="button" onClick={() => setO({})} className={btnGhost}>{L("すべて空欄にする", "Clear all")}</button>
        <span className="text-xs" aria-live="polite">
          {dirty ? <span className="text-[var(--caution)]">{L("未保存の変更があります", "Unsaved changes")}</span> : state?.ok ? <span className="text-[#2e7d32]">{L("保存しました", "Saved")}</span> : null}
        </span>
      </div>
    </form>
  );
}
