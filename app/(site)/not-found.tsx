import type { Metadata } from "next";
import { NotFoundBody } from "@/components/not-found-body";

export const metadata: Metadata = { title: "ページが見つかりません", robots: { index: false, follow: true } };

/** notFound() inside the public site: the (site) layout already renders the header and footer. */
export default function NotFound() {
  return <NotFoundBody />;
}
