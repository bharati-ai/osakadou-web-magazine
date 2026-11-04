import { ApiError, abs, actorOf, apiRoute, readJson } from "@/lib/cms/api";
import { ingestImage, listMedia, MAX_IMAGE_BYTES, mediaUrl, storeImage, type Media } from "@/lib/cms/media";

const out = (m: Media) => ({ id: m.id, src: mediaUrl(m.path), url: abs(mediaUrl(m.path)), width: m.width, height: m.height, bytes: m.bytes, alt: m.alt, created_at: m.created_at });

/** GET /api/v1/media?q=&page= */
export const GET = apiRoute(async (req) => {
  const u = new URL(req.url).searchParams;
  const page = Math.max(1, Number(u.get("page") ?? 1) || 1);
  return Response.json({ data: listMedia({ q: u.get("q") ?? "", limit: 50, offset: (page - 1) * 50 }).map(out), meta: { page, per_page: 50 } });
});

/**
 * POST /api/v1/media — upload one image.
 * multipart/form-data: file=<binary>, alt=<text>   or   JSON: { "url": "https://…" | "data": "data:image/…;base64,…", "alt": "…" }
 */
export const POST = apiRoute(async (req, key) => {
  const by = actorOf(key);
  let m: Media;
  if ((req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
    if (Number(req.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES + 64 * 1024) throw new ApiError(413, "payload_too_large", "画像は10MBまでです");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(422, "validation_failed", "file フィールドに画像を添付してください");
    if (file.size > MAX_IMAGE_BYTES) throw new ApiError(413, "payload_too_large", "画像は10MBまでです");
    m = await storeImage(Buffer.from(await file.arrayBuffer()), { alt: String(form.get("alt") ?? ""), originalName: file.name, by });
  } else {
    const b = await readJson(req, 15 * 1024 * 1024);
    const src = typeof b.url === "string" ? b.url : typeof b.data === "string" ? b.data : null;
    if (!src) throw new ApiError(422, "validation_failed", "url（https）または data（data URI）が必要です");
    m = await ingestImage(src, { alt: typeof b.alt === "string" ? b.alt : "", by });
  }
  return Response.json({ data: out(m) }, { status: 201 });
});
