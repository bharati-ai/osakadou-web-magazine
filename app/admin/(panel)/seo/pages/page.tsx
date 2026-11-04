import type { Metadata } from "next";
import Link from "next/link";
import { getL } from "@/lib/cms/lang";
import { getOverride, getSeo, listOverrides } from "@/lib/cms/seo";
import { seoPaths, type SeoPath } from "@/lib/cms/seo-paths";
import { SeoOverrideForm } from "@/components/admin/seo-override-form";
import { card } from "@/components/admin/ui";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("ページ別のSEO", "Per-page SEO") };
}

export default async function SeoPagesPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const L = await getL();
  const paths = seoPaths();
  const set = new Set(listOverrides().map((o) => o.path));
  const want = (await searchParams).path ?? "/";
  const current = paths.find((p) => p.path === want) ?? paths[0];
  const groups: [SeoPath["group"], string][] = [["page", L("固定ページ", "Pages")], ["category", L("カテゴリ", "Categories")], ["tool", L("無料ツール", "Free tools")]];
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <nav aria-label={L("ページ一覧", "Pages")} className={`${card} max-h-[75dvh] overflow-y-auto p-2 text-sm lg:sticky lg:top-4`}>
        {groups.map(([g, name]) => (
          <div key={g} className="mb-2">
            <p className="px-2 py-1 text-xs font-bold text-ink-2">{name}</p>
            <ul>
              {paths.filter((p) => p.group === g).map((p) => (
                <li key={p.path}>
                  <Link href={`/admin/seo/pages?path=${encodeURIComponent(p.path)}`} aria-current={p.path === current.path ? "page" : undefined} className={`flex items-center gap-2 rounded px-2 py-1.5 hover:bg-paper-2 ${p.path === current.path ? "bg-shu/10 font-bold text-shu-ink" : ""}`}>
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    {set.has(p.path) && <span className="rounded bg-shu px-1.5 text-[10px] font-bold text-on-shu">{L("設定あり", "Set")}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="px-2 pt-1 text-xs text-ink-2">{L("記事のSEOは、記事の編集画面の「SEO」で設定します。", "Article SEO is set in the post editor’s SEO panel.")}</p>
      </nav>
      <SeoOverrideForm key={current.path} path={current.path} initial={{ ...getOverride(current.path) }} defaults={{ title: current.title, description: current.description }} template={getSeo().titleTemplate} />
    </div>
  );
}
