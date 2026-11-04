"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/(panel)/manage-actions";
import { useL } from "./lang";
import { Notice } from "./ui";

/** A <form> bound to a server action that returns { ok | error | secret }, with the message shown inline. */
export function StateForm({ action, children, className, resetOnOk }: { action: (p: FormState, f: FormData) => Promise<FormState>; children: React.ReactNode; className?: string; resetOnOk?: boolean }) {
  const [state, run] = useActionState(action, null);
  const L = useL();
  return (
    <form action={run} className={className} key={resetOnOk ? (state?.ok ?? "") : undefined}>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      {state?.ok && <Notice kind="ok">{state.ok}</Notice>}
      {state?.secret && (
        <div className="rounded-lg border-2 border-shu bg-band p-3">
          <p className="text-xs font-bold">{L("APIキー（この1回だけ表示されます）", "API key (shown only once)")}</p>
          <code className="mt-1 block select-all break-all font-mono text-sm">{state.secret}</code>
          <button type="button" className="mt-2 text-xs underline" onClick={() => navigator.clipboard.writeText(state.secret!)}>{L("コピー", "Copy")}</button>
        </div>
      )}
      {children}
    </form>
  );
}
