// Server-safe: importable from server and client components alike. Hooks and form buttons live in ui-client.
export { btn, btnDanger, btnGhost, btnPrimary, card, input, label } from "./styles";
export { ConfirmSubmit, Submit, useLeaveGuard } from "./ui-client";

/** A screen's header row that stays on top while scrolling (back link, title, primary actions). */
export function StickyBar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`sticky top-0 z-30 -mx-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-paper-2/95 px-4 py-2.5 backdrop-blur md:-mx-8 md:px-8 ${className}`}>{children}</div>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-bold hover:border-ink"><span aria-hidden>←</span>{children}</a>;
}

export function Notice({ kind = "info", children }: { kind?: "info" | "ok" | "warn" | "error"; children: React.ReactNode }) {
  const tone = {
    info: "border-line bg-paper-2",
    ok: "border-[#2e7d32] bg-[#2e7d32]/10",
    warn: "border-[var(--caution)] bg-[var(--caution-bg)]",
    error: "border-[#b3261e] bg-[#b3261e]/10",
  }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`rounded-lg border-l-4 px-4 py-3 text-sm leading-relaxed ${tone}`}>{children}</div>;
}
