// Plain class strings. Kept out of any "use client" module: server components importing a string from a
// client module receive a client reference, and `${input} font-mono` would then print a function.
export const input =
  "w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-[15px] text-ink outline-none transition focus:border-shu focus:ring-2 focus:ring-shu/25 disabled:opacity-60";
export const label = "mb-1 block text-[13px] font-bold text-ink";
export const btn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition active:translate-y-px disabled:opacity-50";
export const btnPrimary = `${btn} bg-shu text-on-shu hover:brightness-110`;
export const btnGhost = `${btn} border border-line bg-card text-ink hover:border-ink`;
export const btnDanger = `${btn} border border-[#b3261e] text-[#b3261e] hover:bg-[#b3261e] hover:text-white dark:border-[#ff8a80] dark:text-[#ff8a80]`;
export const card = "rounded-[var(--radius-card)] border border-line bg-card";
