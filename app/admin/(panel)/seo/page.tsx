import type { Metadata } from "next";
import { adminLang, getL } from "@/lib/cms/lang";
import { AI_SEARCH, AI_TRAINING, getSeo, seoVersions } from "@/lib/cms/seo";
import { SeoSettingsForm } from "@/components/admin/seo-settings-form";
import { ConfirmSubmit, Notice, btnGhost, card } from "@/components/admin/ui";
import { restoreSeoVersion } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("SEO設定", "SEO settings") };
}

export default async function SeoSettingsPage({ searchParams }: { searchParams: Promise<{ restored?: string; v?: string }> }) {
  const L = await getL();
  const en = (await adminLang()) === "en";
  const sp = await searchParams;
  const versions = seoVersions();
  const restore = (v: number, msg: string, text: string) => (
    <form action={restoreSeoVersion}>
      <input type="hidden" name="version" value={v} />
      <ConfirmSubmit message={msg} className={`${btnGhost} min-h-8 px-3 text-xs`}>{text}</ConfirmSubmit>
    </form>
  );
  return (
    <>
      {sp.restored && <Notice kind="ok">{sp.restored === "0" ? L("既定値に戻しました。", "Reset to the defaults.") : L(`版 ${sp.restored} の内容に戻しました（新しい版 ${sp.v}）。`, `Restored version ${sp.restored} (now version ${sp.v}).`)}</Notice>}
      <SeoSettingsForm key={sp.v ?? "seo"} initial={JSON.parse(JSON.stringify(getSeo()))} aiTraining={AI_TRAINING} aiSearch={AI_SEARCH} />
      <section className={card} aria-labelledby="h-seo-ver">
        <h2 id="h-seo-ver" className="border-b border-line px-5 py-3 font-maru text-lg font-bold">{L(`版の履歴（${versions.length}）`, `Version history (${versions.length})`)}</h2>
        <ol className="divide-y divide-line text-sm">
          {versions.map((v, i) => (
            <li key={v.version} className="flex flex-wrap items-center gap-3 px-5 py-2.5">
              <span className="font-bold">{L(`版 ${v.version}`, `v${v.version}`)}</span>
              <span className="text-xs text-ink-2">{new Date(v.created_at).toLocaleString(en ? "en-GB" : "ja-JP", { timeZone: "Asia/Tokyo" })}・{v.author}</span>
              <span className="min-w-0 flex-1 truncate text-xs">{v.note}</span>
              {i > 0 ? restore(v.version, L(`版 ${v.version} に戻して公開しますか？`, `Restore version ${v.version} and publish it?`), L("この版に戻す", "Restore"))
                : <span className="text-xs font-bold text-[#2e7d32]">{L("公開中", "Live")}</span>}
            </li>
          ))}
          <li className="flex flex-wrap items-center gap-3 px-5 py-2.5">
            <span className="font-bold">{L("既定値", "Defaults")}</span>
            <span className="min-w-0 flex-1 text-xs text-ink-2">{L("サイト公開時の設定", "The settings at launch")}</span>
            {restore(0, L("既定値に戻して公開しますか？", "Reset to the defaults and publish?"), L("既定値に戻す", "Reset"))}
          </li>
        </ol>
      </section>
    </>
  );
}
