import { crumbs } from "@/components/admin/page-labels";

type Box = { d: HTMLDivElement; tag: HTMLSpanElement; els: HTMLElement[] };
const PATH = /^[\w.]*$/;

/**
 * Canvas side of the visual editor (runs inside the admin's iframe only).
 * Hover/click picks a [data-cms="page:path"] element and tells the editor; the editor sends back
 * live text/image patches and selection. It never saves anything: saving is the admin form's job.
 */
export function start(page: string) {
  const prefix = `${page}:`;
  const en = document.cookie.split("; ").includes("ol_admin_lang=en");
  const post = (m: Record<string, unknown>) => window.parent.postMessage({ ...m, cms: 1 }, location.origin);
  const pathOf = (el: Element) => el.getAttribute("data-cms")!.slice(prefix.length);
  const all = () => [...document.querySelectorAll<HTMLElement>("[data-cms]")].filter((e) => e.getAttribute("data-cms")!.startsWith(prefix));
  // exact match, or every element inside a block ("areas.items.2" → its fields)
  const find = (p: string) => {
    const els = all();
    const exact = els.filter((e) => pathOf(e) === p);
    return exact.length || !p ? exact : els.filter((e) => pathOf(e).startsWith(`${p}.`));
  };
  const label = (p: string) => crumbs(page, p, en).slice(-2).join(" › ");
  const invisible = (el: Element | null) => {
    for (; el && el !== document.body; el = el.parentElement) if (getComputedStyle(el).opacity === "0") return true;
    return false;
  };
  const hit = (x: number, y: number) => {
    for (const el of document.elementsFromPoint(x, y)) {
      const t = el.closest("[data-cms]") as HTMLElement | null;
      if (t && t.getAttribute("data-cms")!.startsWith(prefix) && !invisible(t)) return t;
    }
    return null;
  };

  const style = document.createElement("style");
  style.textContent = `[data-cms^="${prefix}"]{cursor:pointer}`;
  document.head.append(style);
  const mk = (color: string, dashed: boolean): Box => {
    const d = document.createElement("div");
    d.style.cssText = `position:fixed;z-index:2147483646;pointer-events:none;display:none;box-sizing:border-box;border:2px ${dashed ? "dashed" : "solid"} ${color};border-radius:4px`;
    const tag = document.createElement("span");
    tag.style.cssText = `position:absolute;left:-2px;background:${color};color:#fff;font:600 11px/18px system-ui,sans-serif;padding:0 6px;white-space:nowrap;max-width:320px;overflow:hidden;text-overflow:ellipsis`;
    d.append(tag);
    document.body.append(d);
    return { d, tag, els: [] };
  };
  const hover = mk("#1e88e5", true);
  const picked = mk("#c8402f", false);
  const place = (b: Box) => {
    const rs = b.els.filter((e) => e.isConnected).map((e) => e.getBoundingClientRect()).filter((r) => r.width || r.height);
    if (!rs.length) return void (b.d.style.display = "none");
    const l = Math.min(...rs.map((r) => r.left)) - 3, t = Math.min(...rs.map((r) => r.top)) - 3;
    const w = Math.max(...rs.map((r) => r.right)) + 3 - l, h = Math.max(...rs.map((r) => r.bottom)) + 3 - t;
    Object.assign(b.d.style, { display: "block", left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
    Object.assign(b.tag.style, t < 20 ? { top: "0", bottom: "auto" } : { top: "auto", bottom: "100%" });
  };
  let raf = 0;
  const loop = () => { place(hover); place(picked); raf = requestAnimationFrame(loop); };
  loop();

  const show = (b: Box, p: string | null, scroll = false) => {
    b.els = p === null ? [] : find(p);
    b.tag.textContent = p ? label(p) : "";
    if (!b.els[0]) return;
    // let tabs / the carousel reveal the element first
    dispatchEvent(new CustomEvent("cms:focus", { detail: b.els[0] }));
    if (scroll) setTimeout(() => b.els.find((e) => e.getBoundingClientRect().height)?.scrollIntoView({ block: "center", behavior: "smooth" }), 60);
  };

  const patch = (el: HTMLElement, v: unknown) => {
    if (el instanceof HTMLImageElement) {
      if (!v || typeof v !== "object") return;
      const { src, alt } = v as { src?: unknown; alt?: unknown };
      if (typeof src === "string" && src.startsWith("/") && !src.startsWith("//")) {
        el.removeAttribute("srcset");
        el.src = src;
      }
      if (typeof alt === "string") el.alt = alt;
      return;
    }
    if (typeof v !== "string") return;
    let s = v;
    if (el.dataset.cmsVars) {
      const vars = JSON.parse(el.dataset.cmsVars) as Record<string, unknown>;
      s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    }
    if (el.dataset.cmsStrip) s = s.replace(el.dataset.cmsStrip, "");
    el.textContent = s;
  };

  const onMove = (e: PointerEvent) => {
    const t = hit(e.clientX, e.clientY);
    if (t !== hover.els[0]) show(hover, t ? pathOf(t) : null);
  };
  // picks win over links and buttons; plain links never navigate inside the canvas
  const onClick = (e: MouseEvent) => {
    const t = hit(e.clientX, e.clientY);
    const link = (e.target as Element | null)?.closest?.("a[href]");
    if (!t && !link) return;
    e.preventDefault();
    e.stopPropagation();
    if (t) {
      const p = pathOf(t);
      show(picked, p);
      post({ type: "select", path: p });
    }
  };
  const onSubmit = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
  const onLeave = () => show(hover, null);
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== location.origin || e.source !== window.parent || !e.data?.cms) return;
    const { type, path, value, scroll } = e.data as { type: string; path?: unknown; value?: unknown; scroll?: boolean };
    if (typeof path !== "string" || !PATH.test(path)) return;
    if (type === "select") show(picked, path || null, scroll !== false);
    else if (type === "hover") show(hover, path || null);
    else if (type === "patch") for (const el of find(path).filter((x) => pathOf(x) === path)) patch(el, value);
  };

  addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  addEventListener("click", onClick, true);
  addEventListener("submit", onSubmit, true);
  addEventListener("message", onMessage);
  post({ type: "ready", paths: [...new Set(all().map(pathOf))] });

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    removeEventListener("click", onClick, true);
    removeEventListener("submit", onSubmit, true);
    removeEventListener("message", onMessage);
    style.remove();
    hover.d.remove();
    picked.d.remove();
  };
}
