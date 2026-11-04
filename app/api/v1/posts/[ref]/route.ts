import { ApiError, actorOf, apiRoute, postFieldsFromInput, postOut, readJson, revalidateSite } from "@/lib/cms/api";
import { deletePost, findPost, getPost, toFields, updatePost, validatePost } from "@/lib/cms/posts";

function load(req: Request, ref: string) {
  const by = new URL(req.url).searchParams.get("by");
  // `ref` is already decoded by Next; decoding again turns "%" into a 500
  const p = findPost(ref, by === "slug" || by === "external_id" || by === "id" ? by : undefined);
  if (!p) throw new ApiError(404, "not_found", "記事が見つかりません");
  return p;
}

/** GET /api/v1/posts/{id|slug}?by=id|slug|external_id */
export const GET = apiRoute<{ ref: string }>(async (req, _key, { ref }) => Response.json({ data: postOut(load(req, ref)) }));

/** PATCH /api/v1/posts/{ref} — send only the fields to change. content_html is re-processed when present. */
export const PATCH = apiRoute<{ ref: string }>(async (req, key, { ref }) => {
  const p = load(req, ref);
  const actor = actorOf(key);
  const body = await readJson(req);
  const { fields, errs, warnings } = await postFieldsFromInput(body, toFields(p), actor);
  errs.push(...validatePost(fields, p.id));
  if (errs.length) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", errs);
  updatePost(p.id, fields, actor, "API で更新");
  revalidateSite();
  return Response.json({ data: postOut(getPost(p.id)!), warnings });
});

/** DELETE /api/v1/posts/{ref} — archives (unpublishes) by default; ?permanent=true deletes it with its history. */
export const DELETE = apiRoute<{ ref: string }>(async (req, key, { ref }) => {
  const p = load(req, ref);
  if (new URL(req.url).searchParams.get("permanent") === "true") deletePost(p.id);
  else updatePost(p.id, { ...toFields(p), status: "archived" }, actorOf(key), "API でアーカイブ");
  revalidateSite();
  return new Response(null, { status: 204 });
});
