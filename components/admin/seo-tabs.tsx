"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useL } from "./lang";

const TABS = [
  ["/admin/seo", "サイト全体の設定", "Site settings"],
  ["/admin/seo/pages", "ページ別の設定", "Per-page settings"],
  ["/admin/seo/redirects", "リダイレクト", "Redirects"],
  ["/admin/seo/audit", "SEO診断", "SEO audit"],
] as const;

export function SeoTabs() {
  const path = usePathname();
  const L = useL();
  return (
    <nav aria-label="SEO" className="flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map(([href, ja, en]) => {
        const on = path === href;
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-2 text-sm font-bold ${on ? "border-shu text-shu-ink" : "border-transparent text-ink-2 hover:text-ink"}`}>
            {L(ja, en)}
          </Link>
        );
      })}
    </nav>
  );
}
