import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { findPost } from "@/lib/cms/posts";

/** /admin/posts/by-slug/<slug> → the editor (used by the admin bar on public article pages). */
export default async function BySlug({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const p = findPost((await params).slug, "slug");
  if (!p) notFound();
  redirect(`/admin/posts/${p.id}`);
}
