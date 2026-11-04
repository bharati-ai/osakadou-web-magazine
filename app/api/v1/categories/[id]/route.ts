import { ApiError, apiRoute, categoryOut, readJson, revalidateSite } from "@/lib/cms/api";
import { categoryById, deleteCategory, updateCategory, validateCategory } from "@/lib/cms/categories";
import { db } from "@/lib/cms/db";

function load(id: string) {
  const c = /^\d+$/.test(id) ? categoryById(Number(id)) : undefined;
  if (!c) throw new ApiError(404, "not_found", "カテゴリが見つかりません");
  return c;
}

/** PATCH /api/v1/categories/{id} — { name?, slug?, description?, sort? } */
export const PATCH = apiRoute<{ id: string }>(async (req, _key, { id }) => {
  const c = load(id);
  const b = await readJson(req, 64 * 1024);
  const input = {
    name: typeof b.name === "string" ? b.name : c.name,
    slug: typeof b.slug === "string" ? b.slug : c.slug,
    description: typeof b.description === "string" ? b.description : c.description,
    sort: typeof b.sort === "number" ? b.sort : undefined,
    parent_id: c.parent_id,
  };
  const errs = validateCategory(input);
  const dup = db().prepare("SELECT id FROM categories WHERE ifnull(parent_id,0) = ifnull(?,0) AND slug = ? AND id != ?").get(c.parent_id, input.slug, c.id);
  if (dup) errs.push(`slug: 「${input.slug}」はすでにあります`);
  if (errs.length) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", errs);
  updateCategory(c.id, input);
  revalidateSite();
  return Response.json({ data: categoryOut(categoryById(c.id)) });
});

/** DELETE /api/v1/categories/{id} — only when it has no posts and no sub-categories. */
export const DELETE = apiRoute<{ id: string }>(async (_req, _key, { id }) => {
  const c = load(id);
  const problem = deleteCategory(c.id);
  if (problem) throw new ApiError(409, "conflict", problem);
  revalidateSite();
  return new Response(null, { status: 204 });
});
