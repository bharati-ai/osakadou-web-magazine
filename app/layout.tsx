import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Noto_Serif_JP, Zen_Maru_Gothic } from "next/font/google";
import { SITE } from "@/lib/site";
import { defaultOgImages, getSeo } from "@/lib/cms/seo";
import "./globals.css";

// next/font self-hosts the brand faces as unicode-range slices (only used glyphs load).
// Body text uses the OS Japanese gothic: phones already ship Hiragino / Noto Sans CJK, and it saves 0.5–1 MB per page.
const zenMaru = Zen_Maru_Gothic({ weight: "700", preload: false, display: "swap", variable: "--font-zen-maru" });
const notoSerif = Noto_Serif_JP({ weight: ["700"], preload: false, display: "swap", variable: "--font-noto-serif" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["500", "700"], display: "swap", variable: "--font-bodoni" });

/** Site-wide defaults from the SEO center (/admin/seo). Pages refine them with seoMeta(). */
export function generateMetadata(): Metadata {
  const s = getSeo();
  return {
    metadataBase: new URL(SITE.url),
    title: { default: s.siteTitle, template: s.titleTemplate },
    description: s.siteDescription,
    // no canonical here: it would leak into 404s and admin pages. Pages set their own.
    alternates: { types: { "application/rss+xml": [{ url: "/blog/feed.xml", title: `${SITE.name}｜読みもの` }] } },
    openGraph: { type: "website", locale: "ja_JP", siteName: SITE.name, title: s.siteTitle, description: s.ogDescription, images: defaultOgImages() },
    twitter: { card: "summary_large_image", ...(s.twitterSite ? { site: s.twitterSite } : {}) },
    verification: {
      ...(s.verification.google ? { google: s.verification.google } : {}),
      ...(s.verification.yandex ? { yandex: s.verification.yandex } : {}),
      ...(s.verification.bing ? { other: { "msvalidate.01": s.verification.bing } } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14181f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${zenMaru.variable} ${notoSerif.variable} ${bodoni.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
          本文へ移動
        </a>
        {children}
      </body>
    </html>
  );
}
