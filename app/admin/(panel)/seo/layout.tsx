import { requireUser } from "@/lib/cms/auth";
import { getL } from "@/lib/cms/lang";
import { SeoTabs } from "@/components/admin/seo-tabs";

/** SEO center: anyone with the "seo" permission (admins, SEO specialists, or a custom grant on the Users page). */
export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  await requireUser("seo");
  const L = await getL();
  return (
    <div className="grid max-w-[1100px] gap-5">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("SEO", "SEO")}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {L(
            "検索結果・SNS・AI検索に関わる設定をまとめています。保存するとすぐ公開ページに反映され、サイト全体の設定は版ごとに残るので元に戻せます。記事ごとのSEOは記事の編集画面にあります。",
            "Everything that shapes how the site appears in search, social and AI answers. Saving updates the live site at once; site settings keep every version so you can roll back. Per-article SEO lives in the post editor.",
          )}
        </p>
      </div>
      <SeoTabs />
      {children}
    </div>
  );
}
