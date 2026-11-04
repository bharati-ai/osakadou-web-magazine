"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { previewPageAction, savePageAction, type PageSaveState } from "@/app/admin/(panel)/pages/actions";
import { MediaPicker } from "./media-picker";
import { crumbs, fieldLabel, isLong } from "./page-labels";
import { useL, useLang } from "./lang";
import { Submit, btnGhost, input, useLeaveGuard } from "./ui";

type Img = { src: string; alt: string };
type Obj = Record<string, unknown>;
type Rule = { min?: number; max?: number; step?: number; options?: [string, string, string][] };
export type PageSchema = { rules: Record<string, Rule>; templates: Record<string, unknown> };

const isImg = (v: unknown): v is Img => !!v && typeof v === "object" && "src" in v && "alt" in v && Object.keys(v).length === 2;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v) && !isImg(v);
const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=384&q=55`;
const fid = (p: string) => `vf-${p.replaceAll(".", "-")}`;
const get = (o: unknown, p: string): unknown => (p ? p.split(".").reduce<unknown>((a, k) => (a as Obj | undefined)?.[k], o) : o);
const patternOf = (p: string) => p.replace(/\.\d+(?=\.|$)/g, ".*");
/** "hero.slides.2" → ["hero.slides", 2]; null when the path is not a list item. */
const itemOf = (p: string): [string, number] | null => { const m = /^(.*)\.(\d+)$/.exec(p); return m ? [m[1], Number(m[2])] : null; };
/** Hidden keys: generated ids (checklist progress is stored by id). */
const HIDDEN = new Set(["id"]);
const newId = () => `x${Math.random().toString(36).slice(2, 9)}`;
/** A deep copy with fresh ids, for added and duplicated items. */
const fresh = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(fresh) : isObj(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "id" ? newId() : fresh(x)])) : v;

function setAt(o: unknown, segs: string[], v: unknown): unknown {
  if (!segs.length) return v;
  const [k, ...rest] = segs;
  if (Array.isArray(o)) return o.map((x, i) => (i === Number(k) ? setAt(x, rest, v) : x));
  return { ...(o as Obj), [k]: setAt((o as Obj)[k], rest, v) };
}

/** The block a field belongs to: its nearest list item or section ("areas.items.2.desc" → "areas.items.2"; flat pages → ""). */
function blockOf(data: unknown, path: string) {
  const s = path.split(".");
  let best = "";
  let cur = data;
  s.forEach((k, i) => {
    cur = (cur as Obj | undefined)?.[k];
    if (isObj(cur) && i < s.length - 1) best = s.slice(0, i + 1).join(".");
  });
  return isObj(get(data, path)) ? path : best;
}

/** [path, value] for every text and image under v (hidden keys skipped). */
function leaves(v: unknown, p = "", out: [string, unknown][] = []) {
  if (typeof v === "string" || isImg(v)) out.push([p, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => leaves(x, p ? `${p}.${i}` : String(i), out));
  else if (isObj(v)) for (const [k, x] of Object.entries(v)) if (!HIDDEN.has(k)) leaves(x, p ? `${p}.${k}` : k, out);
  return out;
}

const summary = (v: unknown) => (leaves(v).find(([, x]) => typeof x === "string" && x)?.[1] as string | undefined)?.slice(0, 40) ?? "";
const firstImg = (v: unknown) => (leaves(v).find(([, x]) => isImg(x) && x.src)?.[1] as Img | undefined)?.src;
const DEVICES = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;

/**
 * Elementor-style editor: the real page renders in an iframe canvas; clicking a text or photo there opens its
 * block's settings on the right. Text and photos are previewed instantly in place; adding, removing or reordering
 * list items (slides, areas, paragraphs…) and switches/numbers re-render the canvas from an unsaved draft.
 * Which lists may change, and within what bounds, comes from the page's rules (lib/cms/pages.ts).
 */
export function VisualEditor({ page, title, pagePath, canvasPath, schema, initial, notice, history }: {
  page: string; title: string; pagePath: string; canvasPath: string; schema: PageSchema; initial: Obj; notice?: string | null; history: React.ReactNode;
}) {
  const L = useL();
  const en = useLang() === "en";
  const flat = !Object.values(initial).some((v) => isObj(v) || (Array.isArray(v) && v.some(isObj)));
  const [data, setData] = useState(initial);
  const [base, setBase] = useState(() => JSON.stringify(initial));
  const saved = useMemo(() => JSON.parse(base) as Obj, [base]);
  const [state, action] = useActionState<PageSaveState, FormData>(savePageAction, null);
  const [block, setBlock] = useState<string | null>(flat ? "" : null);
  const [focus, setFocus] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "nav" | "history">(notice ? "history" : flat ? "edit" : "nav");
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [onCanvas, setOnCanvas] = useState<Set<string> | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  // lists whose items were added, removed or moved: per-field "Revert" would compare against the wrong item there
  const [reshaped, setReshaped] = useState<Set<string>>(new Set());
  const [canvasUrl, setCanvasUrl] = useState(`${canvasPath}?cms-edit=${page}`);
  const [rendering, setRendering] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const sent = useRef(base);
  const live = useRef(data);
  const shown = useRef<Obj>(initial); // what the canvas was last rendered from
  const reveal = useRef<string | null>(null);
  const scrollY = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const renders = useRef(0);
  const json = JSON.stringify(data);
  const dirty = json !== base;
  useLeaveGuard(dirty);

  useEffect(() => { if (state?.ok) { setBase(sent.current); setReshaped(new Set()); } }, [state]);
  // after a pick on the canvas, bring its field into view in the panel
  useEffect(() => {
    const p = reveal.current;
    if (!p) return;
    reveal.current = null;
    const el = document.getElementById(fid(p));
    el?.scrollIntoView({ block: "center" });
    el?.focus({ preventScroll: true });
  });

  const send = (m: Obj) => frame.current?.contentWindow?.postMessage({ ...m, cms: 1 }, location.origin);
  const sel = useRef({ block, focus });
  sel.current = { block, focus };

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow || !e.data?.cms) return;
      if (e.data.type === "ready") {
        setOnCanvas(new Set(e.data.paths as string[]));
        setRendering(false);
        // re-apply edits made since the canvas content was rendered, then restore the reader's place
        const was = new Map(leaves(shown.current).map(([p, v]) => [p, JSON.stringify(v)]));
        for (const [p, v] of leaves(live.current)) if (was.get(p) !== JSON.stringify(v)) send({ type: "patch", path: p, value: v });
        if (scrollY.current !== null) { frame.current?.contentWindow?.scrollTo(0, scrollY.current); scrollY.current = null; }
        const s = sel.current.focus ?? sel.current.block;
        if (s) send({ type: "select", path: s, scroll: false });
      } else if (e.data.type === "select" && typeof e.data.path === "string") {
        const p = e.data.path as string;
        reveal.current = p;
        setFocus(p);
        setBlock(blockOf(live.current, p));
        setTab("edit");
      }
    };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, []);

  /** Re-render the canvas from the current (unsaved) content, debounced so quick clicks render once. */
  const rerender = (d: Obj) => {
    clearTimeout(timer.current);
    setRendering(true);
    timer.current = setTimeout(async () => {
      if (!(await previewPageAction(page, JSON.stringify(d)))) return setRendering(false);
      shown.current = d;
      scrollY.current = frame.current?.contentWindow?.scrollY ?? null;
      setCanvasUrl(`${canvasPath}?cms-edit=${page}&draft=1&r=${++renders.current}`);
    }, 350);
  };
  const commit = (d: Obj) => { live.current = d; setData(d); };
  /** Text and photos patch the canvas in place; switches, numbers and choices need a re-render. */
  const update = (p: string, v: unknown, structural = false) => {
    const d = setAt(live.current, p.split("."), v) as Obj;
    commit(d);
    if (structural) rerender(d);
    else send({ type: "patch", path: p, value: v });
  };
  const focusField = (p: string) => {
    if (p === focus) return;
    setFocus(p);
    send({ type: "select", path: p });
  };
  const selectBlock = (p: string) => {
    setBlock(p);
    setFocus(null);
    setTab("edit");
    send({ type: "select", path: p });
  };
  const hover = (p: string) => send({ type: "hover", path: p });
  const discard = () => {
    if (!confirm(L("保存していない変更をすべて取り消しますか？", "Discard all unsaved changes?"))) return;
    commit(saved);
    setReshaped(new Set());
    setBlock(flat ? "" : null);
    setFocus(null);
    rerender(saved);
  };

  // ---- lists: add, duplicate, remove, move (within the page's rules) ----
  const rule = (p: string) => schema.rules[patternOf(p)];
  const noun = (lp: string) => fieldLabel(page, `${lp}.*`, en);
  function reshape(lp: string, next: unknown[], selectNext?: string | null) {
    const d = setAt(live.current, lp.split("."), next) as Obj;
    commit(d);
    setReshaped((s) => new Set(s).add(lp));
    rerender(d);
    if (selectNext !== undefined) { setBlock(selectNext); setFocus(null); }
  }
  const listOf = (lp: string) => (get(live.current, lp) as unknown[]) ?? [];
  const canAdd = (lp: string) => { const r = rule(lp); return !!r && listOf(lp).length < (r.max ?? Infinity) && (patternOf(lp) in schema.templates || listOf(lp).length > 0); };
  const canRemove = (lp: string) => { const r = rule(lp); return !!r && listOf(lp).length > (r.min ?? 0); };
  const isObjList = (lp: string) => { const a = listOf(lp); return a.length ? isObj(a[0]) : isObj(schema.templates[patternOf(lp)]); };
  const add = (lp: string) => {
    const a = listOf(lp);
    const tpl = schema.templates[patternOf(lp)] ?? (typeof a[0] === "string" ? "" : a[0]);
    reshape(lp, [...a, fresh(structuredClone(tpl))], isObjList(lp) ? `${lp}.${a.length}` : undefined);
  };
  const duplicate = (lp: string, i: number) => {
    const a = listOf(lp);
    reshape(lp, [...a.slice(0, i + 1), fresh(structuredClone(a[i])), ...a.slice(i + 1)], isObjList(lp) ? `${lp}.${i + 1}` : undefined);
  };
  const remove = (lp: string, i: number) => {
    const a = listOf(lp);
    const what = isObjList(lp) ? `${noun(lp)} ${i + 1}${summary(a[i]) ? `「${summary(a[i])}」` : ""}` : `${noun(lp)} ${i + 1}`;
    if (!confirm(L(`${what} を削除しますか？（保存するまでは公開されません）`, `Remove ${what}? (Nothing goes live until you save.)`))) return;
    const inside = block !== null && (block === `${lp}.${i}` || block.startsWith(`${lp}.${i}.`));
    reshape(lp, a.filter((_, j) => j !== i), inside ? (a.length > 1 && isObjList(lp) ? `${lp}.${Math.min(i, a.length - 2)}` : blockOf(live.current, lp)) : undefined);
  };
  const move = (lp: string, i: number, j: number) => {
    const a = [...listOf(lp)];
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    const at = (n: number) => `${lp}.${n}`;
    const follow = block === at(i) || block?.startsWith(`${at(i)}.`) ? block.replace(at(i), at(j)) : undefined;
    reshape(lp, a, follow);
  };
  const tool = "grid size-8 place-items-center rounded-md border border-line text-sm hover:border-ink disabled:opacity-35 disabled:hover:border-line";
  const itemTools = (lp: string, i: number, n: number) => {
    const r = rule(lp);
    if (!r) return null;
    return (
      <span className="flex shrink-0 gap-1">
        <button type="button" className={tool} disabled={i === 0} onClick={() => move(lp, i, i - 1)} aria-label={L(`${noun(lp)} ${i + 1} を上へ`, `Move ${noun(lp)} ${i + 1} up`)} title={L("上へ", "Move up")}>↑</button>
        <button type="button" className={tool} disabled={i === n - 1} onClick={() => move(lp, i, i + 1)} aria-label={L(`${noun(lp)} ${i + 1} を下へ`, `Move ${noun(lp)} ${i + 1} down`)} title={L("下へ", "Move down")}>↓</button>
        {canAdd(lp) && <button type="button" className={tool} onClick={() => duplicate(lp, i)} aria-label={L(`${noun(lp)} ${i + 1} を複製`, `Duplicate ${noun(lp)} ${i + 1}`)} title={L("複製", "Duplicate")}>⧉</button>}
        <button type="button" className={`${tool} hover:border-[#b3261e] hover:text-[#b3261e]`} disabled={!canRemove(lp)} onClick={() => remove(lp, i)} aria-label={L(`${noun(lp)} ${i + 1} を削除`, `Remove ${noun(lp)} ${i + 1}`)} title={L("削除", "Remove")}>✕</button>
      </span>
    );
  };
  const addButton = (lp: string) => {
    const r = rule(lp);
    if (!r || r.min === r.max) return null;
    const n = listOf(lp).length;
    return (
      <button type="button" disabled={!canAdd(lp)} onClick={() => add(lp)} className={`${btnGhost} min-h-9 w-full border-dashed`}>
        ＋ {L(`${noun(lp)}を追加`, `Add ${noun(lp).toLowerCase()}`)}<span className="text-xs font-normal text-ink-2">（{n}/{r.max}）</span>
      </button>
    );
  };

  // ---- fields (plain render functions, so inputs keep focus while typing) ----
  const reshapedAt = (p: string) => [...reshaped].some((lp) => p.startsWith(`${lp}.`));
  const head = (p: string, forId: string | null, changed: boolean, reset: () => void, extra?: React.ReactNode) => (
    <div className="mb-1 flex flex-wrap items-center gap-x-2">
      {forId ? <label htmlFor={forId} className="text-[13px] font-bold">{fieldLabel(page, p, en)}</label> : <p className="text-[13px] font-bold">{fieldLabel(page, p, en)}</p>}
      {onCanvas && !onCanvas.has(p) && (typeof get(data, p) === "string" ? !rule(p)?.options : isImg(get(data, p))) && <span className="text-[11px] text-ink-2">{L("（ページ上には表示されません）", "(not shown on the page)")}</span>}
      <span className="ml-auto flex items-center gap-2">
        {changed && !reshapedAt(p) && <button type="button" onClick={reset} className="text-[11px] text-ink-2 underline hover:text-ink">{L("元に戻す", "Revert")}</button>}
        {extra}
      </span>
    </div>
  );

  function text(p: string, v: string, extra?: React.ReactNode) {
    const was = get(saved, p) as string | undefined;
    const r = rule(p);
    if (r?.options) {
      return (
        <div key={p}>
          {head(p, fid(p), was !== undefined && was !== v, () => update(p, was, true), extra)}
          <select id={fid(p)} value={v} onFocus={() => focusField(p)} onChange={(e) => update(p, e.target.value, true)} className={input}>
            {r.options.map(([o, ja, enl]) => <option key={o} value={o}>{en ? enl : ja}</option>)}
          </select>
        </div>
      );
    }
    const props = {
      id: fid(p),
      value: v,
      onFocus: () => focusField(p),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(p, e.target.value),
      className: `${input} ${focus === p ? "border-shu ring-2 ring-shu/25" : ""} ${p.endsWith("href") ? "font-mono text-sm" : ""}`,
    };
    return (
      <div key={p}>
        {head(p, fid(p), was !== undefined && was !== v, () => update(p, was), extra)}
        {isLong(p, v) ? <textarea rows={Math.min(8, Math.max(2, Math.ceil(v.length / 34)))} {...props} /> : <input {...props} />}
      </div>
    );
  }

  function number(p: string, v: number) {
    const r = rule(p) ?? {};
    const was = get(saved, p) as number | undefined;
    return (
      <div key={p}>
        {head(p, fid(p), was !== undefined && was !== v, () => update(p, was, true))}
        <div className="flex items-center gap-3">
          <input id={fid(p)} type="range" min={r.min} max={r.max} step={r.step ?? 1} value={v} onChange={(e) => update(p, Number(e.target.value), true)} className="min-w-0 flex-1 accent-shu" />
          <output htmlFor={fid(p)} className="w-14 text-right font-mono text-sm">{v}</output>
        </div>
      </div>
    );
  }

  function toggle(p: string, v: boolean) {
    const was = get(saved, p) as boolean | undefined;
    return (
      <div key={p} className="flex items-center gap-2">
        <input id={fid(p)} type="checkbox" checked={v} onChange={(e) => update(p, e.target.checked, true)} className="size-4 accent-shu" />
        <label htmlFor={fid(p)} className="text-[13px] font-bold">{fieldLabel(page, p, en)}</label>
        {was !== undefined && was !== v && <button type="button" onClick={() => update(p, was, true)} className="ml-auto text-[11px] text-ink-2 underline hover:text-ink">{L("元に戻す", "Revert")}</button>}
      </div>
    );
  }

  function image(p: string, v: Img) {
    const was = get(saved, p) as Img | undefined;
    return (
      <div key={p} className={`rounded-lg p-2 ${focus === p ? "bg-shu/5 ring-2 ring-shu/25" : ""}`}>
        {head(p, null, !!was && (was.src !== v.src || was.alt !== v.alt), () => update(p, was))}
        <div className="flex gap-3">
          {v.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(v.src)} alt="" className="h-20 w-28 shrink-0 rounded-md bg-paper-2 object-cover" />
          ) : (
            <button type="button" onClick={() => { focusField(p); setPicking(p); }} className="grid h-20 w-28 shrink-0 place-items-center rounded-md border-2 border-dashed border-shu/60 text-xs text-shu-ink hover:bg-shu/5">{L("画像を選ぶ", "Pick image")}</button>
          )}
          <div className="grid min-w-0 flex-1 content-start gap-2">
            <input id={fid(p)} aria-label={L("代替テキスト", "Alt text")} value={v.alt} onFocus={() => focusField(p)} onChange={(e) => update(p, { ...v, alt: e.target.value })} placeholder={L("代替テキスト（何が写っているか）", "Alt text (what the photo shows)")} className={`${input} text-sm`} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { focusField(p); setPicking(p); }} className={`${btnGhost} min-h-8 px-3 text-xs`}>{v.src ? L("画像を変更", "Change image") : L("画像を選ぶ", "Pick image")}</button>
              {v.src && p.includes("events") && <button type="button" onClick={() => update(p, { src: "", alt: "" })} className={`${btnGhost} min-h-8 px-3 text-xs`}>{L("外す", "Remove")}</button>}
            </div>
            {!v.src && <p className="text-[11px] text-ink-2">{L("写真を選ぶまで、ページには表示されません。", "Not shown on the page until a photo is picked.")}</p>}
          </div>
        </div>
      </div>
    );
  }

  const childButton = (p: string, v: unknown) => (
    <li key={p}>
      <button type="button" onClick={() => selectBlock(p)} onMouseEnter={() => hover(p)} onMouseLeave={() => hover("")} className="flex w-full items-center gap-2 rounded-md border border-line px-3 py-2 text-left text-sm hover:border-ink">
        <span className="font-bold">{fieldLabel(page, p, en)}</span>
        <span className="min-w-0 flex-1 truncate text-ink-2">{summary(v)}</span>
        <span aria-hidden>›</span>
      </button>
    </li>
  );

  /** A list of blocks (slides, areas…): one row per item with its thumbnail, opener and item tools. */
  function objectList(lp: string, items: unknown[]) {
    return (
      <div className="grid grid-cols-1 gap-1.5">
        <ul className="grid grid-cols-1 gap-1.5">
          {items.map((y, i) => {
            const p = `${lp}.${i}`;
            const src = firstImg(y);
            return (
              <li key={p} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${block === p ? "border-shu bg-shu/5" : "border-line"}`} onMouseEnter={() => hover(p)} onMouseLeave={() => hover("")}>
                <button type="button" onClick={() => selectBlock(p)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src ? <img src={thumb(src)} alt="" className="h-9 w-12 shrink-0 rounded bg-paper-2 object-cover" /> : firstImgSlot(y) && <span className="grid h-9 w-12 shrink-0 place-items-center rounded border border-dashed border-line text-[10px] text-ink-2">{L("写真なし", "no photo")}</span>}
                  <span className="shrink-0 font-bold">{fieldLabel(page, p, en)}</span>
                  <span className="min-w-0 flex-1 truncate text-ink-2">{summary(y)}</span>
                </button>
                {itemTools(lp, i, items.length)}
              </li>
            );
          })}
        </ul>
        {addButton(lp)}
      </div>
    );
  }
  const firstImgSlot = (v: unknown) => leaves(v).some(([, x]) => isImg(x));

  function blockView(bp: string) {
    const v = bp ? get(data, bp) : data;
    if (!isObj(v)) return null;
    return Object.entries(v).map(([k, x]) => {
      if (HIDDEN.has(k)) return null;
      const p = bp ? `${bp}.${k}` : k;
      if (typeof x === "string") return text(p, x);
      if (typeof x === "number") return number(p, x);
      if (typeof x === "boolean") return toggle(p, x);
      if (isImg(x)) return image(p, x);
      if (isObj(x)) return <ul key={p}>{childButton(p, x)}</ul>;
      if (Array.isArray(x)) {
        const strings = x.length ? x.every((y) => typeof y === "string") : !isObjList(p);
        return (
          <fieldset key={p} className="grid min-w-0 grid-cols-1 gap-2">
            <legend className="mb-1 flex w-full items-center gap-2 text-[13px] font-bold">
              {fieldLabel(page, p, en)}
              {rule(p) && <span className="text-[11px] font-normal text-ink-2">{rule(p)!.min === rule(p)!.max ? L("並べ替えできます", "can be reordered") : L(`${x.length}件`, `${x.length} item${x.length === 1 ? "" : "s"}`)}</span>}
            </legend>
            {strings ? (
              <>
                {x.map((y, i) => text(`${p}.${i}`, y as string, itemTools(p, i, x.length)))}
                {addButton(p)}
              </>
            ) : rule(p) ? objectList(p, x) : <ul className="grid gap-1.5">{x.map((y, i) => childButton(`${p}.${i}`, y))}</ul>}
          </fieldset>
        );
      }
      return null;
    });
  }

  /** Above a list item's fields: previous / next, the item's tools, and a strip of all its siblings. */
  function itemBar(bp: string) {
    const it = itemOf(bp);
    if (!it || !Array.isArray(get(data, it[0]))) return null;
    const [lp, i] = it;
    const items = get(data, lp) as unknown[];
    return (
      <div className="grid gap-2 rounded-lg border border-line bg-paper-2 p-2">
        <div className="flex items-center gap-1">
          <button type="button" className={tool} disabled={i === 0} onClick={() => selectBlock(`${lp}.${i - 1}`)} aria-label={L("前へ", "Previous")}>‹</button>
          <span className="px-1 text-sm font-bold">{noun(lp)} {i + 1} / {items.length}</span>
          <button type="button" className={tool} disabled={i === items.length - 1} onClick={() => selectBlock(`${lp}.${i + 1}`)} aria-label={L("次へ", "Next")}>›</button>
          <span className="ml-auto">{itemTools(lp, i, items.length)}</span>
        </div>
        {items.length > 1 && (
          <ol className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label={L(`${noun(lp)}の一覧`, `All ${noun(lp).toLowerCase()} items`)}>
            {items.map((y, n) => {
              const src = firstImg(y);
              return (
                <li key={n} className="shrink-0">
                  <button type="button" onClick={() => selectBlock(`${lp}.${n}`)} aria-current={n === i} title={summary(y)} className={`grid h-10 min-w-10 place-items-center overflow-hidden rounded-md border text-xs font-bold ${n === i ? "border-shu ring-2 ring-shu" : "border-line opacity-80 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {src ? <img src={thumb(src)} alt={`${noun(lp)} ${n + 1}`} className="h-10 w-14 object-cover" /> : <span className="px-2">{n + 1}</span>}
                  </button>
                </li>
              );
            })}
            {canAdd(lp) && rule(lp)!.min !== rule(lp)!.max && <li className="shrink-0"><button type="button" onClick={() => add(lp)} className="grid h-10 w-10 place-items-center rounded-md border border-dashed border-line text-lg hover:border-ink" aria-label={L(`${noun(lp)}を追加`, `Add ${noun(lp).toLowerCase()}`)}>＋</button></li>}
          </ol>
        )}
      </div>
    );
  }

  function tree(v: unknown, p: string): React.ReactNode {
    const kids: [string, unknown][] = [];
    if (isObj(v)) {
      for (const [k, x] of Object.entries(v)) {
        const cp = p ? `${p}.${k}` : k;
        if (isObj(x) || (Array.isArray(x) && (x.some(isObj) || (rule(cp) && isObjList(cp))))) kids.push([cp, x]);
      }
    } else if (Array.isArray(v)) v.forEach((y, i) => isObj(y) && kids.push([`${p}.${i}`, y]));
    if (!kids.length) return null;
    return (
      <ul className={p ? "ml-2 border-l border-line pl-2" : "grid gap-0.5"}>
        {kids.map(([cp, x]) => {
          const sub = tree(x, cp);
          // a list (e.g. the five feature tiles) is a labelled group, not a block of its own
          if (Array.isArray(x)) {
            return (
              <li key={cp}>
                <details open={!!block?.startsWith(`${cp}.`) || !p}>
                  <summary className="cursor-pointer px-2 py-1 text-sm text-ink-2 marker:text-ink-2">{fieldLabel(page, cp, en)} <span className="text-xs">({x.length})</span></summary>
                  {sub}
                  {canAdd(cp) && rule(cp)!.min !== rule(cp)!.max && <button type="button" onClick={() => add(cp)} className="ml-4 mt-0.5 rounded px-2 py-1 text-xs text-shu-ink hover:bg-paper-2">＋ {L(`${noun(cp)}を追加`, `Add ${noun(cp).toLowerCase()}`)}</button>}
                </details>
              </li>
            );
          }
          const btn = (
            <button type="button" onClick={() => selectBlock(cp)} onMouseEnter={() => hover(cp)} onMouseLeave={() => hover("")} className={`flex min-w-0 flex-1 gap-2 rounded px-2 py-1 text-left text-sm hover:bg-paper-2 ${block === cp ? "bg-shu/10 font-bold text-shu-ink" : ""}`}>
              <span className="shrink-0">{fieldLabel(page, cp, en)}</span>
              {/\.\d+$/.test(cp) && <span className="min-w-0 truncate text-ink-2">{summary(x)}</span>}
            </button>
          );
          return (
            <li key={cp}>
              {sub ? (
                <details open={!!block && (block === cp || block.startsWith(`${cp}.`))}>
                  <summary className="flex cursor-pointer items-center gap-1 marker:text-ink-2">{btn}</summary>
                  {sub}
                </details>
              ) : <div className="flex pl-4">{btn}</div>}
            </li>
          );
        })}
      </ul>
    );
  }

  const chain = block ? block.split(".").flatMap((_, i, s) => (/^\d+$/.test(s[i + 1] ?? "") ? [] : [s.slice(0, i + 1).join(".")])) : [];
  const tabs = [["edit", L("編集", "Edit")], ["nav", L("ナビゲーター", "Navigator")], ["history", L("履歴", "History")]] as const;

  return (
    <div className="-mx-4 -my-6 flex flex-col md:-mx-8 md:-my-8 lg:h-dvh">
      {/* the only sticky part: one slim bar with navigation and Save */}
      <form action={action} onSubmit={() => { sent.current = json; }} className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-line bg-card px-3 py-2">
        <input type="hidden" name="page" value={page} />
        <input type="hidden" name="data" value={json} />
        <a href="/admin/pages" className="inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-sm font-bold hover:border-ink">← {L("ページ", "Pages")}</a>
        <h1 className="mr-2 font-maru text-base font-bold">{title}</h1>
        <div role="group" aria-label={L("表示幅", "Preview width")} className="flex overflow-hidden rounded-lg border border-line text-xs font-bold">
          {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => (
            <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className={`px-2.5 py-1.5 ${device === d ? "bg-ink text-paper" : "hover:bg-paper-2"}`}>
              {d === "desktop" ? L("PC", "Desktop") : d === "tablet" ? L("タブレット", "Tablet") : L("スマホ", "Phone")}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs" aria-live="polite">
          {rendering ? <span className="text-ink-2">{L("プレビューを更新中…", "Updating preview…")}</span>
            : dirty ? <span className="text-[var(--caution)]">{L("未保存の変更があります", "Unsaved changes")}</span>
            : state?.ok ? <span className="text-[#2e7d32]">{L(`保存しました（版 ${state.version}）`, `Saved (version ${state.version})`)}</span> : null}
        </span>
        {dirty && <button type="button" onClick={discard} className="text-xs text-ink-2 underline hover:text-ink">{L("変更を破棄", "Discard")}</button>}
        <input name="note" placeholder={L("変更メモ（任意）", "Change note (optional)")} maxLength={120} aria-label={L("変更メモ", "Change note")} className={`${input} max-w-44 py-1.5 text-sm`} />
        <a href={pagePath} target="_blank" className={`${btnGhost} min-h-9`}>{L("ページを見る ↗", "View page ↗")}</a>
        <Submit className={`inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-bold ${dirty ? "bg-shu text-on-shu hover:brightness-110" : "bg-paper-2 text-ink-2"}`}>{L("保存して公開", "Save & publish")}</Submit>
      </form>
      {state?.error && <p role="alert" className="border-b border-[#b3261e] bg-[#b3261e]/10 px-4 py-2 text-sm">{state.error}</p>}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)]">
        <div className="relative h-[70dvh] overflow-auto bg-paper-2 p-3 lg:h-full">
          <iframe ref={frame} src={canvasUrl} title={L("ページのプレビュー（クリックで編集）", "Page preview (click to edit)")} style={{ width: DEVICES[device] }} className={`mx-auto block h-full max-w-full rounded-md border border-line bg-paper shadow-sm transition-[width,opacity] ${rendering ? "opacity-60" : ""}`} />
        </div>
        <aside className="flex min-h-0 flex-col border-line bg-card lg:border-l">
          <div role="tablist" className="flex border-b border-line">
            {tabs.map(([k, t]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 border-b-2 px-3 py-2.5 text-sm font-bold ${tab === k ? "border-shu text-shu-ink" : "border-transparent text-ink-2 hover:text-ink"}`}>{t}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "edit" && (block === null ? (
              <div className="grid gap-4 text-sm text-ink-2">
                <p>{L("左のページで文字や写真をクリックすると、その設定がここに表示されます。テキストと写真はすぐプレビューに反映され、「保存して公開」で公開されます。スライドなどの追加・削除・並べ替えもここでできます。", "Click any text or photo on the page to edit its settings here. Text and photos preview instantly; slides and other list items can be added, removed and reordered too. Nothing goes live until you press “Save & publish”.")}</p>
                {tree(data, "")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <nav aria-label={L("階層", "Breadcrumb")} className="flex flex-wrap items-center gap-1 text-xs text-ink-2">
                  <button type="button" onClick={() => (flat ? selectBlock("") : (setBlock(null), setTab("nav")))} className="hover:underline">{L("ページ全体", "Whole page")}</button>
                  {chain.map((c) => <span key={c} className="flex items-center gap-1">›<button type="button" onClick={() => selectBlock(c)} className={`hover:underline ${c === block ? "font-bold text-ink" : ""}`}>{crumbs(page, c, en).at(-1)}</button></span>)}
                </nav>
                {itemBar(block)}
                {blockView(block)}
              </div>
            ))}
            {tab === "nav" && (
              <div className="grid gap-2">
                <button type="button" onClick={() => selectBlock("")} className={`rounded px-2 py-1 text-left text-sm font-bold hover:bg-paper-2 ${block === "" ? "bg-shu/10 text-shu-ink" : ""}`}>{L("ページ全体", "Whole page")}</button>
                {tree(data, "")}
              </div>
            )}
            {tab === "history" && (
              <div className="grid gap-3">
                {notice && <p className="rounded-lg border border-[#2e7d32] bg-[#2e7d32]/10 px-3 py-2 text-sm">{notice}</p>}
                {history}
              </div>
            )}
          </div>
        </aside>
      </div>
      <MediaPicker open={!!picking} onClose={() => setPicking(null)} onPick={(x) => picking && update(picking, { src: x.src, alt: x.alt }, !(get(live.current, picking) as Img | undefined)?.src)} />
    </div>
  );
}
