import type { Metadata } from "next";
import { requireUser } from "@/lib/cms/auth";
import type { ApiKey } from "@/lib/cms/api";
import { db } from "@/lib/cms/db";
import { getL } from "@/lib/cms/lang";
import { StateForm } from "@/components/admin/state-form";
import { ConfirmSubmit, Submit, card, input, label } from "@/components/admin/ui";
import { createKey, revokeKey } from "../manage-actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("APIキー", "API keys") };
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—");

export default async function ApiKeysPage() {
  await requireUser("api_keys");
  const L = await getL();
  const keys = db().prepare("SELECT id, name, prefix, created_at, last_used_at, revoked_at FROM api_keys ORDER BY revoked_at IS NOT NULL, id DESC").all() as ApiKey[];
  return (
    <div className="grid max-w-[1000px] gap-6">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("APIキー", "API keys")}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {L("外部の自動化ツール（n8n・Make・Zapier など）から記事を投稿するためのキーです。仕様はリポジトリの ", "Keys for posting articles from automation tools such as n8n, Make, or Zapier. See ")}<code>docs/cms/API.md</code>{L("、本文のHTMLは ", " in the repository for the spec and the ")}<a href="/admin/style-guide" className="underline">{L("スタイルガイド", "style guide")}</a>{L(" を参照してください。キーはサーバー間の通信だけに使い、ブラウザやアプリに埋め込まないでください。", " for body HTML. Use keys only for server-to-server calls; never embed them in a browser or app.")}
        </p>
      </div>
      <section className={`${card} p-5`}>
        <h2 className="font-maru font-bold">{L("キーを発行", "Create a key")}</h2>
        <StateForm action={createKey} className="mt-3 grid gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1"><label className={label} htmlFor="k-name">{L("名前（どこで使うか）", "Name (where it’s used)")}</label><input id="k-name" name="name" required maxLength={60} placeholder="n8n-自動投稿" className={input} /></div>
            <Submit pending={L("発行中…", "Creating…")}>{L("発行する", "Create key")}</Submit>
          </div>
        </StateForm>
      </section>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-paper-2 text-left text-xs text-ink-2"><tr><th className="px-4 py-2">{L("名前", "Name")}</th><th className="px-4 py-2">{L("キー", "Key")}</th><th className="px-4 py-2">{L("発行", "Created")}</th><th className="px-4 py-2">{L("最終利用", "Last used")}</th><th className="px-4 py-2" /></tr></thead>
          <tbody className="divide-y divide-line">
            {keys.map((k) => (
              <tr key={k.id} className={k.revoked_at ? "text-ink-2" : ""}>
                <td className="px-4 py-3 font-bold">{k.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{k.prefix}…</td>
                <td className="px-4 py-3 text-xs">{when(k.created_at)}</td>
                <td className="px-4 py-3 text-xs">{when(k.last_used_at)}</td>
                <td className="px-4 py-3 text-right">
                  {k.revoked_at ? <span className="text-xs">{L("無効化済み", "Revoked")}</span> : (
                    <form action={revokeKey}>
                      <input type="hidden" name="id" value={k.id} />
                      <ConfirmSubmit message={L(`「${k.name}」を無効にします。このキーを使う自動化は止まります。`, `Revoke “${k.name}”? Automations using this key will stop working.`)} className="text-xs text-[#b3261e] underline">{L("無効にする", "Revoke")}</ConfirmSubmit>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!keys.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-2">{L("キーはまだありません", "No keys yet")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
