import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/cms/db";

/** Serves uploaded images from DATA_DIR/uploads (files added after build are not served from /public). */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const parts = (await ctx.params).path;
  if (!parts.every((p) => /^[a-z0-9][a-z0-9._-]*$/i.test(p) && !p.includes(".."))) return new Response("Not found", { status: 404 });
  const rel = parts.join("/");
  if (!/\.webp$/.test(rel)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, rel));
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable", // file names are content hashes
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
