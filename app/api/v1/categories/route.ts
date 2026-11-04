import { ApiError, apiRoute, categoryOut, readJson, revalidateSite } from "@/lib/cms/api";
import { categoryById, categoryByPath, categoryTree, createCategory, validateCategory } from "@/lib/cms/categories";

/** GET /api/v1/categories — the category tree with post counts. */
export const GET = apiRoute(async () =>
  Response.json({
    data: categoryTree().map((c) => ({
      id: c.id, slug: c.slug, name: c.name, description: c.description, post_count: c.postCount,
      children: c.children.map((k) => ({ id: k.id, slug: k.slug, name: k.name, description: k.description, path: `${c.slug}/${k.slug}` })),
    })),
  }),
);

/** POST /api/v1/categories — { name, slug, parent?: "slug" | parent_id?: number, description? } */
export const POST = apiRoute(async (req) => {
  const b = await readJson(req, 64 * 1024);
  let parentId: number | null = null;
  if (typeof b.parent_id === "number") parentId = b.parent_id;
  else if (typeof b.parent === "string" && b.parent) {
    const p = categoryByPath(b.parent);
    if (!p) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", [`parent: 「${b.parent}」が見つかりません`]);
    parentId = p.id;
  }
  const input = { name: String(b.name ?? ""), slug: String(b.slug ?? ""), parent_id: parentId, description: typeof b.description === "string" ? b.description : "" };
  const errs = validateCategory(input);
  if (!errs.length && categoryByPath(parentId ? categoryById(parentId)!.slug : input.slug, parentId ? input.slug : null)) errs.push(`slug: 「${input.slug}」はすでにあります`);
  if (errs.length) throw new ApiError(422, "validation_failed", "入力内容に誤りがあります", errs);
  const id = createCategory(input);
  revalidateSite();
  return Response.json({ data: categoryOut(categoryById(id)) }, { status: 201 });
});
