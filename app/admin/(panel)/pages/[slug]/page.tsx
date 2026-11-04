import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { adminLang, getL } from "@/lib/cms/lang";
import { PAGES, diffPaths, getPage, isPageId, pageSchema, pageVersions, type PageId } from "@/lib/cms/pages";
import { VisualEditor } from "@/components/admin/visual-editor";
import { crumbs } from "@/components/admin/page-labels";
import { ConfirmSubmit, btnGhost } from "@/components/admin/ui";
import { restorePageVersion } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("ページを編集", "Edit page") };
}

export default async function EditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ restored?: string; v?: string }> }) {
  await requireUser("pages");
  const id = (await params).slug;
  if (!isPageId(id)) notFound();
  const sp = await searchParams;
  const L = await getL();
  const def = PAGES[id];
  const which = sp.restored === "0" ? L("初期状態", "the initial content") : L(`版 ${sp.restored}`, `version ${sp.restored}`);
  const schema = pageSchema(id);
  // pages with editable lists render the canvas from drafts (app/(site)/cms-preview); flat pages patch the live page
  const canvasPath = Object.keys(schema.rules).length ? `/cms-preview/${id}` : def.path;
  return (
    <VisualEditor
      key={sp.v ?? "page"}
      page={id}
      title={L(def.label, def.en)}
      pagePath={def.path}
      canvasPath={canvasPath}
      schema={schema}
      initial={JSON.parse(JSON.stringify(getPage(id)))}
      notice={sp.restored ? L(`${which} の内容に戻しました（新しい版 ${sp.v} として保存）。`, `Restored ${which} (saved as new version ${sp.v}).`) : null}
      history={<History id={id} />}
    />
  );
}

const dotted = (p: string) => p.replace(/\[(\d+)\]/g, (_m, n) => `.${Number(n) - 1}`);

async function History({ id }: { id: PageId }) {
  const L = await getL();
  const en = (await adminLang()) === "en";
  const versions = pageVersions(id);
  const restore = (version: number, message: string, label: string) => (
    <form action={restorePageVersion}>
      <input type="hidden" name="page" value={id} />
      <input type="hidden" name="version" value={version} />
      <ConfirmSubmit message={message} className={`${btnGhost} min-h-8 px-3 text-xs`}>{label}</ConfirmSubmit>
    </form>
  );
  return (
    <section aria-label={L("版の履歴", "Version history")} className="grid gap-2 text-sm">
      <p className="text-xs text-ink-2">{L("「この版に戻す」は、その版の内容を新しい版として保存します（いまの内容も履歴に残ります）。", "“Restore” saves that version’s content as a new version (the current content stays in the history).")}</p>
      <ol className="divide-y divide-line rounded-lg border border-line">
        {versions.map((v, i) => {
          const changed = diffPaths(id, v.data, versions[i + 1]?.data);
          return (
            <li key={v.version} className="grid gap-1.5 px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">{L(`版 ${v.version}`, `v${v.version}`)}</span>
                <span className="text-xs text-ink-2">{new Date(v.created_at).toLocaleString(en ? "en-GB" : "ja-JP", { timeZone: "Asia/Tokyo" })}・{v.author}</span>
                <span className="ml-auto">
                  {i > 0
                    ? restore(v.version, L(`版 ${v.version} の内容に戻して公開しますか？`, `Restore version ${v.version} and publish it?`), L("この版に戻す", "Restore"))
                    : <span className="text-xs font-bold text-[#2e7d32]">{L("公開中", "Live")}</span>}
                </span>
              </div>
              {v.note && <p className="text-xs">{v.note}</p>}
              {changed.length > 0 && (
                <details className="text-xs text-ink-2">
                  <summary className="cursor-pointer">{L(`変更 ${changed.length}項目`, `${changed.length} field(s) changed`)}</summary>
                  <ul className="mt-1 list-disc pl-5">
                    {changed.slice(0, 30).map((p) => <li key={p}>{crumbs(id, dotted(p), en).join(" › ")}</li>)}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
        <li className="flex flex-wrap items-center gap-2 px-3 py-2.5">
          <span className="font-bold">{L("初期状態", "Initial content")}</span>
          <span className="text-xs text-ink-2">{L("サイト公開時のデザインどおり", "As designed at launch")}</span>
          <span className="ml-auto">{restore(0, L("初期状態の内容に戻して公開しますか？", "Reset to the initial content and publish it?"), L("初期状態に戻す", "Reset"))}</span>
        </li>
      </ol>
      {!versions.length && <p className="text-xs text-ink-2">{L("まだ編集されていません（初期状態を表示しています）。", "Not edited yet (showing the initial content).")}</p>}
    </section>
  );
}
