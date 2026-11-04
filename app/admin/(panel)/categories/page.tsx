import type { Metadata } from "next";
import { requireUser } from "@/lib/cms/auth";
import { categoryTree } from "@/lib/cms/categories";
import { getL } from "@/lib/cms/lang";
import type { L as Tr } from "@/lib/admin-i18n";
import { StateForm } from "@/components/admin/state-form";
import { Submit, btnGhost, card, input, label } from "@/components/admin/ui";
import { removeCategory, saveCategory } from "../manage-actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("カテゴリ", "Categories") };
}

export default async function CategoriesPage() {
  await requireUser("categories");
  const L = await getL();
  const tree = categoryTree();
  return (
    <div className="grid max-w-[1000px] gap-6">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("カテゴリ", "Categories")}</h1>
        <p className="mt-1 text-sm text-ink-2">{L("カテゴリ → サブカテゴリの2階層です。スラッグはURLとAPIで使います（例：/blog/category/guide/gomi）。記事やサブカテゴリがあるカテゴリは削除できません。", "Two levels: category → subcategory. Slugs are used in URLs and the API (e.g. /blog/category/guide/gomi). Categories that have posts or subcategories can’t be deleted.")}</p>
      </div>

      <section className={`${card} p-5`}>
        <h2 className="font-maru font-bold">{L("追加", "Add category")}</h2>
        <StateForm action={saveCategory} resetOnOk className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div><label className={label} htmlFor="c-name">{L("名前", "Name")}</label><input id="c-name" name="name" required maxLength={40} className={input} placeholder="子育て" /></div>
          <div><label className={label} htmlFor="c-slug">{L("スラッグ", "Slug")}</label><input id="c-slug" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={40} className={`${input} font-mono`} placeholder="kosodate" /></div>
          <div>
            <label className={label} htmlFor="c-parent">{L("親カテゴリ", "Parent category")}</label>
            <select id="c-parent" name="parent_id" className={input}>
              <option value="">{L("なし（トップレベル）", "None (top level)")}</option>
              {tree.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Submit>{L("追加", "Add")}</Submit>
          <div className="md:col-span-4"><label className={label} htmlFor="c-desc">{L("説明（カテゴリページに表示・任意）", "Description (shown on the category page, optional)")}</label><input id="c-desc" name="description" maxLength={300} className={input} /></div>
        </StateForm>
      </section>

      <ul className="grid gap-4">
        {tree.map((c) => (
          <li key={c.id} className={`${card} p-5`}>
            <CategoryRow c={c} count={c.postCount} L={L} />
            <ul className="mt-3 grid gap-2 border-l-2 border-line pl-4">
              {c.children.map((k) => <li key={k.id}><CategoryRow c={k} L={L} /></li>)}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({ c, count, L }: { c: { id: number; name: string; slug: string; description: string; sort: number; parent_id: number | null }; count?: number; L: Tr }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3">
        <span className={c.parent_id ? "font-bold" : "font-maru text-lg font-bold"}>{c.name}</span>
        <code className="text-xs text-ink-2">{c.slug}</code>
        {count !== undefined && <span className="text-xs text-ink-2">{L(`公開記事 ${count}`, `${count} published`)}</span>}
        <span className="ml-auto text-xs text-shu-ink group-open:hidden">{L("編集", "Edit")}</span>
      </summary>
      <div className="mt-3 grid gap-3">
        <StateForm action={saveCategory} className="grid gap-3 md:grid-cols-[1fr_1fr_100px_auto] md:items-end">
          <input type="hidden" name="id" value={c.id} />
          <div><label className={label} htmlFor={`n${c.id}`}>{L("名前", "Name")}</label><input id={`n${c.id}`} name="name" defaultValue={c.name} required className={input} /></div>
          <div><label className={label} htmlFor={`s${c.id}`}>{L("スラッグ", "Slug")}</label><input id={`s${c.id}`} name="slug" defaultValue={c.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={`${input} font-mono`} /></div>
          <div><label className={label} htmlFor={`o${c.id}`}>{L("並び順", "Order")}</label><input id={`o${c.id}`} name="sort" type="number" defaultValue={c.sort} className={input} /></div>
          <Submit>{L("保存", "Save")}</Submit>
          <div className="md:col-span-4"><label className={label} htmlFor={`d${c.id}`}>{L("説明", "Description")}</label><input id={`d${c.id}`} name="description" defaultValue={c.description} maxLength={300} className={input} /></div>
        </StateForm>
        <StateForm action={removeCategory}>
          <input type="hidden" name="id" value={c.id} />
          <Submit className={`${btnGhost} text-xs`} pending={L("削除中…", "Deleting…")}>{L("このカテゴリを削除", "Delete this category")}</Submit>
        </StateForm>
      </div>
    </details>
  );
}
