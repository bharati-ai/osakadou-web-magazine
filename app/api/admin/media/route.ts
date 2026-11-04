import { currentUser } from "@/lib/cms/auth";
import { can } from "@/lib/cms/perms";
import { getL } from "@/lib/cms/lang";
import { MAX_IMAGE_BYTES, MediaError, mediaUrl, storeImage } from "@/lib/cms/media";

/** Editor uploads (session cookie). Same-origin only: the cookie is SameSite=Lax, and we also check Origin. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = (process.env.TRUST_PROXY === "1" && req.headers.get("x-forwarded-host")) || req.headers.get("host");
  if (!origin || new URL(origin).host !== host) return Response.json({ error: "bad origin" }, { status: 403 });
  const user = await currentUser();
  const L = await getL();
  if (!user) return Response.json({ error: L("ログインしてください", "Please sign in") }, { status: 401 });
  if (!can(user, "media.upload") || user.must_change_password) return Response.json({ error: L("画像をアップロードする権限がありません", "You don’t have permission to upload images") }, { status: 403 });
  const tooBig = L("画像は10MBまでです", "Images are limited to 10 MB");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES + 64 * 1024) return Response.json({ error: tooBig }, { status: 413 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: L("画像を選んでください", "Choose an image") }, { status: 422 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: tooBig }, { status: 413 });
  try {
    const m = await storeImage(Buffer.from(await file.arrayBuffer()), { alt: String(form.get("alt") ?? ""), originalName: file.name, by: user.email });
    return Response.json({ src: mediaUrl(m.path), alt: m.alt, width: m.width, height: m.height });
  } catch (e) {
    if (e instanceof MediaError) return Response.json({ error: e.message }, { status: 422 });
    throw e;
  }
}
