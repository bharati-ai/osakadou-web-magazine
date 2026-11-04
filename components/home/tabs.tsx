"use client";

import { Children, useEffect, useId, useRef, useState } from "react";

/** Accessible tabs (roving tabindex, arrow keys). Panels are server-rendered children, one per tab. */
export function Tabs({ labels, children, initial = 0 }: { labels: string[]; children: React.ReactNode; initial?: number }) {
  const [active, setActive] = useState(initial);
  const id = useId();
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = Children.toArray(children);
  // visual editor: open the tab that holds the element being edited
  useEffect(() => {
    const f = (e: Event) => {
      const panel = (e as CustomEvent<Element>).detail.closest('[role="tabpanel"]');
      const n = panel?.id.startsWith(`${id}-p`) ? Number(panel.id.slice(id.length + 2)) : -1;
      if (n >= 0) setActive(n);
    };
    addEventListener("cms:focus", f);
    return () => removeEventListener("cms:focus", f);
  }, [id]);
  const move = (n: number) => {
    const next = (n + labels.length) % labels.length;
    setActive(next);
    btns.current[next]?.focus();
  };
  return (
    <div>
      <div role="tablist" className="flex snap-x gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
        {labels.map((l, n) => (
          <button
            key={l}
            ref={(el) => { btns.current[n] = el; }}
            role="tab"
            id={`${id}-t${n}`}
            aria-selected={n === active}
            aria-controls={`${id}-p${n}`}
            tabIndex={n === active ? 0 : -1}
            onClick={() => setActive(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(active + 1);
              if (e.key === "ArrowLeft") move(active - 1);
            }}
            className={`min-h-11 shrink-0 snap-start rounded-full px-5 font-maru text-sm font-bold transition-colors ${n === active ? "bg-shu text-on-shu" : "bg-paper-2 text-ink hover:bg-band"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {panels.map((p, n) => (
        <div key={n} role="tabpanel" id={`${id}-p${n}`} aria-labelledby={`${id}-t${n}`} hidden={n !== active} className="mt-6">
          {p}
        </div>
      ))}
    </div>
  );
}
