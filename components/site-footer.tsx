import Link from "next/link";
import { photoCredits } from "@/lib/photos";
import { SECTIONS } from "@/lib/site";
import { getSiteCopy } from "@/lib/cms/pages";
import { TOOL_CATEGORIES } from "@/lib/tools/categories";
import { ShareButton } from "./share-button";

export function SiteFooter() {
  return (
    <footer className="bg-night text-on-night">
      <div className="h-7 bg-[image:var(--wagara)] bg-[length:40px_20px] bg-repeat-x opacity-90" aria-hidden />
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-mincho text-3xl font-bold tracking-[0.1em]">オオサカ堂</p>
          <p lang="en" className="mt-1 font-latin text-xs tracking-[0.42em] text-on-night/70">OSAKADOU</p>
          <p data-cms="site:footerTagline" className="mt-3 max-w-[26em] text-sm text-on-night/80">{getSiteCopy().footerTagline}</p>
          <div className="mt-6"><ShareButton /></div>
        </div>
        <nav aria-label="フッター：特集">
          <p className="font-maru text-sm font-bold text-on-night/70">特集</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.href}><Link href={s.href} className="inline-block py-1.5 hover:underline">{s.label}</Link></li>
            ))}
            <li><Link href="/#policy" className="inline-block py-1.5 hover:underline">編集方針</Link></li>
          </ul>
        </nav>
        <nav aria-label="フッター：無料ツール">
          <p className="font-maru text-sm font-bold text-on-night/70">無料ツール</p>
          <ul className="mt-3 grid gap-y-1 text-sm">
            {TOOL_CATEGORIES.map((c) => (
              <li key={c.id}><Link href={`/tools#${c.id}`} className="inline-block py-1.5 hover:underline">{c.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-2 border-t border-on-night/15 py-5 text-xs text-on-night/70">
        <p><Link href="/about" className="hover:underline">オオサカ堂について</Link></p>
        <p>© 2026 オオサカ堂</p>
      </div>
      <details className="wrap pb-4 text-[10px] leading-relaxed text-on-night/40">
        <summary className="w-fit cursor-pointer">Photo credits</summary>
        <p lang="en" className="mt-1">Photos: Unsplash — {photoCredits().join(", ")}</p>
      </details>
    </footer>
  );
}
