import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { getAboutPage, getHome, pageDraft } from "@/lib/cms/pages";
import { HomeSections } from "@/components/home/home-sections";
import { AboutView } from "@/components/about-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/**
 * Page-builder canvas: the real page body rendered from the editor's unsaved draft (?draft=1), so added,
 * removed and reordered items show up before saving. Signed-in page editors only; never linked publicly.
 */
export default async function CmsPreview({ params, searchParams }: { params: Promise<{ page: string }>; searchParams: Promise<{ draft?: string }> }) {
  const me = await requireUser("pages");
  const { page } = await params;
  const draft = !!(await searchParams).draft;
  if (page === "home") return <HomeSections c={(draft && pageDraft(me.id, "home")) || getHome()} />;
  if (page === "about") return <AboutView a={(draft && pageDraft(me.id, "about")) || getAboutPage()} policy={getHome().policy} />;
  notFound();
}
