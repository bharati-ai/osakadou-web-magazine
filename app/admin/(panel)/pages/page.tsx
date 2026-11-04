import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/cms/auth";
import { adminLang, getL } from "@/lib/cms/lang";
import { PAGES, pageVersions, type PageId } from "@/lib/cms/pages";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("ページ編集", "Page builder") };
}

export default async function PagesIndex() {
  await requireUser("pages");
  const L = await getL();
  const en = (await adminLang()) === "en";
  return (
    <div className="grid max-w-[900px] gap-5">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("ページ編集", "Page builder")}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {L(
            "実際のページを見ながら、文字や写真をクリックして編集できます（ブロックの追加・削除やレイアウトの変更はできません）。保存するとすぐ公開され、すべての版が残るので、いつでも前の版に戻せます。記事は「記事」から編集してください。",
            "Edit on the real page: click any text or photo to change it (blocks cannot be added, removed or rearranged). Saving publishes immediately, and every version is kept so you can roll back anytime. Edit articles under “Posts”.",
          )}
        </p>
      </div>
      <ul className="grid gap-3">
        {(Object.keys(PAGES) as PageId[]).map((id) => {
          const last = pageVersions(id)[0];
          return (
            <li key={id}>
              <Link href={`/admin/pages/${id}`} className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-line bg-card p-5 hover:border-ink">
                <span className="font-maru text-lg font-bold">{L(PAGES[id].label, PAGES[id].en)}</span>
                <code className="text-xs text-ink-2">{PAGES[id].path}</code>
                <span className="ml-auto text-xs text-ink-2">
                  {last
                    ? `${L(`版 ${last.version}`, `v${last.version}`)}・${new Date(last.created_at).toLocaleString(en ? "en-GB" : "ja-JP", { timeZone: "Asia/Tokyo" })}・${last.author}`
                    : L("初期状態（未編集）", "Initial content (not edited)")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
