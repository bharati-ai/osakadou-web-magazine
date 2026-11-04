"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, pick, type Lang } from "@/lib/admin-i18n";

const Ctx = createContext<Lang>("ja");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
/** `const L = useL(); L("保存", "Save")` in client components. */
export const useL = () => pick(useContext(Ctx));

/** 日本語 / English switch; remembered in a cookie for a year, then the page re-renders on the server. */
export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();
  const set = (l: Lang) => {
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div role="group" aria-label="Language / 言語" className={`inline-flex overflow-hidden rounded-full border border-current/30 text-xs font-bold ${className}`}>
      {(["ja", "en"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => set(l)} className={`px-3 py-1.5 ${lang === l ? "bg-shu text-on-shu" : "opacity-80 hover:opacity-100"}`}>
          {l === "ja" ? "日本語" : "EN"}
        </button>
      ))}
    </div>
  );
}
