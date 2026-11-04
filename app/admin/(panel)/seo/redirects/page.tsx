import type { Metadata } from "next";
import { adminLang, getL } from "@/lib/cms/lang";
import { listRedirects } from "@/lib/cms/seo";
import { StateForm } from "@/components/admin/state-form";
import { ConfirmSubmit, Submit, btnGhost, card, input, label } from "@/components/admin/ui";
import { deleteRedirectAction, saveRedirectAction } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("リダイレクト", "Redirects") };
}

const CODES = [301, 308, 302, 307] as const;

export default async function RedirectsPage() {
  const L = await getL();
  const en = (await adminLang()) === "en";
  const rows = listRedirects();
  const codeName = (c: number) => ({ 301: L("301 恒久的", "301 permanent"), 308: L("308 恒久的（メソッド維持）", "308 permanent (keeps method)"), 302: L("302 一時的", "302 temporary"), 307: L("307 一時的（メソッド維持）", "307 temporary (keeps method)") })[c];
  const fields = (r?: (typeof rows)[number]) => (
    <>
      <input type="hidden" name="id" value={r?.id ?? ""} />
      <div><label className={label} htmlFor={`r-s-${r?.id ?? "new"}`}>{L("転送元のパス", "From (path)")}</label><input id={`r-s-${r?.id ?? "new"}`} name="source" defaultValue={r?.source} required placeholder="/old-page" className={`${input} font-mono text-sm`} /></div>
      <div><label className={label} htmlFor={`r-d-${r?.id ?? "new"}`}>{L("転送先（パスまたは https://）", "To (path or https://)")}</label><input id={`r-d-${r?.id ?? "new"}`} name="destination" defaultValue={r?.destination} required placeholder="/blog/new-page" className={`${input} font-mono text-sm`} /></div>
      <div>
        <label className={label} htmlFor={`r-c-${r?.id ?? "new"}`}>{L("種類", "Type")}</label>
        <select id={`r-c-${r?.id ?? "new"}`} name="code" defaultValue={r?.code ?? 301} className={input}>{CODES.map((c) => <option key={c} value={c}>{codeName(c)}</option>)}</select>
      </div>
      <div><label className={label} htmlFor={`r-n-${r?.id ?? "new"}`}>{L("メモ", "Note")}</label><input id={`r-n-${r?.id ?? "new"}`} name="note" defaultValue={r?.note} maxLength={200} className={input} /></div>
    </>
  );
  return (
    <div className="grid gap-5">
      <p className="text-sm text-ink-2">{L("URLを変えた・記事をまとめたときに、古いURLを新しいURLへ転送します。恒久的な移動は 301、期間限定なら 302 を使います。転送元は完全一致（末尾の / は無視）です。", "Send an old URL to a new one when a page moves or articles are merged. Use 301 for permanent moves and 302 for temporary ones. Sources match exactly (a trailing / is ignored).")}</p>
      <section className={`${card} p-5`}>
        <h2 className="font-maru font-bold">{L("追加", "Add redirect")}</h2>
        <StateForm action={saveRedirectAction} resetOnOk className="mt-3 grid gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_200px] md:items-end">
            {fields()}
            <Submit>{L("追加", "Add")}</Submit>
          </div>
        </StateForm>
      </section>
      <section className={card}>
        <h2 className="border-b border-line px-5 py-3 font-maru font-bold">{L(`登録済み（${rows.length}）`, `Redirects (${rows.length})`)}</h2>
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="px-5 py-3 text-sm">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1">
                    <code className="font-mono">{r.source}</code><span aria-hidden>→</span><code className="font-mono">{r.destination}</code>
                    <span className="rounded border border-line px-1.5 text-xs">{r.code}</span>
                    <span className="ml-auto text-xs text-ink-2">{L(`${r.hits}回`, `${r.hits} hits`)}{r.last_hit_at ? `・${L("最終", "last")} ${new Date(r.last_hit_at).toLocaleDateString(en ? "en-GB" : "ja-JP", { timeZone: "Asia/Tokyo" })}` : ""}</span>
                  </summary>
                  <div className="mt-3 grid gap-3">
                    {r.note && <p className="text-xs text-ink-2">{r.note}</p>}
                    <StateForm action={saveRedirectAction} className="grid gap-3">
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_200px] md:items-end">
                        {fields(r)}
                        <Submit className={btnGhost}>{L("更新", "Update")}</Submit>
                      </div>
                    </StateForm>
                    <form action={deleteRedirectAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmSubmit message={L(`${r.source} のリダイレクトを削除しますか？`, `Delete the redirect from ${r.source}?`)} className={`${btnGhost} min-h-8 px-3 text-xs`}>{L("削除", "Delete")}</ConfirmSubmit>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : <p className="px-5 py-6 text-sm text-ink-2">{L("まだありません。", "None yet.")}</p>}
      </section>
    </div>
  );
}
