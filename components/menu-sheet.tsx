"use client";

import Link from "next/link";
import { useRef } from "react";
import { List, X } from "@phosphor-icons/react";
import { SECTIONS } from "@/lib/site";
import { TOOL_CATEGORIES } from "@/lib/tools/categories";

export function MenuSheet() {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-haspopup="dialog"
        className="ml-auto flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 bg-shu text-on-shu active:translate-y-px md:w-[76px] lg:ml-0"
      >
        <List size={26} weight="bold" aria-hidden />
        <span lang="en" className="font-latin text-[11px] font-bold tracking-[0.12em]">MENU</span>
      </button>
      <dialog
        ref={ref}
        aria-label="メニュー"
        onClick={(e) => e.target === ref.current && close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(420px,100vw)] max-w-none bg-paper p-0 text-ink backdrop:bg-ink/50"
      >
        <div className="flex min-h-full flex-col px-6 pb-10 pt-4">
          <div className="flex items-center justify-between">
            <span lang="en" className="font-latin text-2xl font-bold">MENU</span>
            <button type="button" onClick={close} aria-label="メニューを閉じる" className="grid size-11 place-items-center rounded-full border border-line">
              <X size={20} aria-hidden />
            </button>
          </div>
          <p className="mt-6 font-maru text-sm font-bold text-ink-2">この号の特集</p>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <Link href={s.href} onClick={close} className="flex min-h-12 items-center rounded-[var(--radius-card)] border border-line bg-card px-4 font-maru font-bold hover:border-shu">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-maru text-sm font-bold text-ink-2">無料ツール</p>
          <ul className="mt-2 grid gap-2">
            {TOOL_CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/tools#${c.id}`} onClick={close} className="flex min-h-12 items-center justify-between rounded-[var(--radius-card)] bg-band px-4 font-maru font-bold">
                  {c.label}
                  <span className="text-xs font-normal text-ink-2">{c.short}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/#policy" onClick={close} className="mt-8 text-sm underline underline-offset-4">
            編集方針
          </Link>
        </div>
      </dialog>
    </>
  );
}
