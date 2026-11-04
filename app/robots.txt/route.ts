import { robotsTxt } from "@/lib/cms/seo";

// Plain text (not app/robots.ts) so the SEO team's custom lines are written exactly as entered.
// Dynamic: a build-time copy would ignore later SEO-center changes.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(robotsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
