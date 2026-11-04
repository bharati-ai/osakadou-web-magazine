import { NextResponse, type NextRequest } from "next/server";
import { categoryByPath } from "@/lib/cms/categories";
import { publicPost } from "@/lib/cms/posts";
import { findRedirect } from "@/lib/cms/seo";

/**
 * 1. Redirects managed in the SEO center (exact path).
 * 2. Uppercase paths → lowercase (308).
 * 3. Blog pages are ISR, and Next caches a 404 per unknown slug on disk. Rewriting unknown slugs to one sentinel
 *    keeps a single cached 404 (styled by (site)/not-found.tsx). Scheduled posts are not live yet, so their slugs
 *    never get a stale 404 cached before publication.
 */
export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const r = findRedirect(path);
  if (r) {
    const to = new URL(r.destination, req.url);
    if (!to.search && to.origin === req.nextUrl.origin) to.search = req.nextUrl.search;
    return NextResponse.redirect(to, r.code);
  }
  if (path !== path.toLowerCase()) return NextResponse.redirect(new URL(path.toLowerCase() + req.nextUrl.search, req.url), 308);
  if (!path.startsWith("/blog/")) return;
  const [, , a, b, c] = path.split("/");
  if (!a || a === "feed.xml" || a.startsWith("__")) return;
  if (!/^[a-z0-9-]+$/.test(a)) return NextResponse.rewrite(new URL("/blog/__none__", req.url));
  if (a === "category") {
    if (b && !b.startsWith("__") && !categoryByPath(b, c || null)) return NextResponse.rewrite(new URL("/blog/category/__none__", req.url));
    return;
  }
  if (!publicPost(a)) return NextResponse.rewrite(new URL("/blog/__none__", req.url));
}

// every page except Next internals, the admin, APIs and static files
export const config = {
  matcher: ["/((?!_next/|__next|api/|admin|media/|photos/|favicon\\.ico|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|txt|xml|woff2?|webmanifest)$).*)"],
};
