import type { Metadata } from "next";
import { NotFoundBody } from "@/components/not-found-body";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "ページが見つかりません", robots: { index: false, follow: true } };

/** Unmatched URLs (outside any route group layout). */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main"><NotFoundBody /></main>
      <SiteFooter />
    </>
  );
}
