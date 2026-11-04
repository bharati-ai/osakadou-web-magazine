"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useL } from "./lang";
import { btnDanger, btnPrimary } from "./styles";

/** While `dirty`, ask before leaving: full unloads (beforeunload) and in-app links (capture-phase click). */
export function useLeaveGuard(dirty: boolean) {
  const msg = useL()("保存していない変更があります。このページを離れますか？", "You have unsaved changes. Leave this page?");
  useEffect(() => {
    if (!dirty) return;
    const unload = (e: BeforeUnloadEvent) => e.preventDefault();
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (a.origin !== location.origin || a.pathname === location.pathname) return;
      if (!confirm(msg)) { e.preventDefault(); e.stopPropagation(); }
    };
    addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => { removeEventListener("beforeunload", unload); document.removeEventListener("click", click, true); };
  }, [dirty, msg]);
}

export function Submit({ children, className = btnPrimary, pending }: { children: React.ReactNode; className?: string; pending?: string }) {
  const s = useFormStatus();
  const L = useL();
  return (
    <button type="submit" className={className} disabled={s.pending}>
      {s.pending ? (pending ?? L("保存中…", "Saving…")) : children}
    </button>
  );
}

/** A submit button that asks first (for restore, delete, revoke). */
export function ConfirmSubmit({ children, message, className = btnDanger }: { children: React.ReactNode; message: string; className?: string }) {
  const s = useFormStatus();
  const L = useL();
  return (
    <button type="submit" className={className} disabled={s.pending} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {s.pending ? L("処理中…", "Working…") : children}
    </button>
  );
}
