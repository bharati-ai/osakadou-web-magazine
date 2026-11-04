import { ApiError, actorOf, apiRoute, postFieldsFromInput, postOut, readJson, revalidateSite } from "@/lib/cms/api";
import { categoryByPath } from "@/lib/cms/categories";
import { createPost, findPost, getPost, listPosts, toFields, updatePost, validatePost, type ListFilter } from "@/lib/cms/posts";

const STATUSES = ["draft", "published", "archived", "scheduled", "live"];

/** GET /api/v1/posts?status=&category=&subcategory=&tag=&q=&page=&per_page=&include=content */
export const GET = apiRoute(async (req) => {
  const u = new URL(req.url).searchParams;
  const status = u.get("status") ?? undefined;
  if (status && !STATUSES.includes(status)) throw new ApiError(400, "bad_request", `status は ${STATUSES.join(" / ")} のいずれかです`);
  let categoryId: number | undefined;
  if (u.get("category")) {
    const c = categoryByPath(u.get("category")!, u.get("subcategory"));
    if (!c) throw new ApiError(404, "not_found", "カテゴリが見つかりません");
    categoryId = c.id;
  }
  const perPage = Math.min(100, Math.max(1, Number(u.get("per_page") ?? 20) || 20));
  const page = Math.max(1, Number(u.get("page") ?? 1) || 1);
  const { total, posts } = listPosts({ status: status as ListFilter["status"], categoryId, tag: u.get("tag") ?? undefined, q: u.get("q") ?? undefined, limit: perPage, offset: (page - 1) * perPage });
  return Response.json({ data: posts.map((p) => postOut(p, u.get("include") === "content")), meta: { total, page, per_page: perPage, pages: Math.ceil(total / perPage) } });
});

/**
 * POST /api/v1/posts — create a post (see docs/cms/API.md).
 * A repeated external_id answers 409 unless ?upsert=true, which updates that post instead (safe retries for automations).
 */
export const POST = apiRoute(async (req, key) => {
  const body = await readJson(req);
  const actor = actorOf(key);
  const upsert = new URL(req.url).searchParams.get("upsert") === "true";
  const extId = typeof body.external_id === "string" ? body.external_id.trim().slice(0, 100) : "";
  const existing = extId ? findPost(extId, "external_id") : undefined;
  if (existing && !upsert) throw new ApiError(409, "conflict", "この external_id の記事はすでにあります（更新するには ?upsert=true か PATCH を使ってください）", { id: existing.id, slug: existing.slug });
  for (const k of ["title", "content_html"]) if (!existing && !(typeof body[k] === "string" && (body[k] as string).trim())) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", [`${k}: 必須です`]);
  if (!existing && body.category === undefined && body.category_path === undefined && body.category_id === undefined) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", ["category: 必須です（category と subcategory のスラッグ、または category_path）"]);

  const { fields, errs, warnings } = await postFieldsFromInput(body, existing ? toFields(existing) : null, actor);
  errs.push(...validatePost(fields, existing?.id));
  if (errs.length) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", errs);
  let id: number;
  if (existing) {
    updatePost(existing.id, fields, actor, "API で更新（upsert）");
    id = existing.id;
  } else id = createPost(fields, "api", actor);
  revalidateSite();
  return Response.json({ data: postOut(getPost(id)!), warnings }, { status: existing ? 200 : 201 });
});
