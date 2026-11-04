import type { Metadata } from "next";
import Link from "next/link";
import { categoryChain } from "@/lib/cms/categories";
import { adminLang, getL } from "@/lib/cms/lang";
import { listPosts } from "@/lib/cms/posts";
import { getSeo, listOverrides, listRedirects } from "@/lib/cms/seo";
import { analyze } from "@/lib/seo-analysis";
import { card } from "@/components/admin/ui";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("SEO診断", "SEO audit") };
}

const YMYL_TOP = new Set(["health", "beauty"]);
const dot = { good: "bg-[#2e7d32]", ok: "bg-[var(--caution)]", bad: "bg-[#b3261e]" } as const;

/** Read-only report: site-level checks, then every post scored with the same analysis as the editor. */
export default async function SeoAuditPage() {
  const L = await getL();
  const en = (await adminLang()) === "en";
  const s = getSeo();
  const posts = listPosts({ limit: 1000 }).posts.filter((p) => p.status === "published");
  const rows = posts
    .map((p) => {
      const r = analyze({
        title: p.title, seoTitle: p.seo_title || p.title, seoDescription: p.seo_description, excerpt: p.excerpt, slug: p.slug, html: p.content_html,
        keyphrase: p.seo.focusKeyphrase ?? "", coverSrc: p.cover_src, coverAlt: p.cover_alt, sourcesCount: p.sources.filter((x) => x.url).length,
        ymyl: YMYL_TOP.has(categoryChain(p.category_id)?.parent.slug ?? ""), brand: "オオサカ堂",
      });
      return { p, ...r, bad: r.checks.filter((c) => c.status === "bad") };
    })
    .sort((a, b) => a.score - b.score);

  const dupes = (key: (p: (typeof posts)[number]) => string) => {
    const m = new Map<string, string[]>();
    for (const p of posts) { const k = key(p).trim(); if (k) m.set(k, [...(m.get(k) ?? []), p.title]); }
    return [...m].filter(([, v]) => v.length > 1);
  };
  const dupTitles = dupes((p) => p.seo_title || p.title);
  const dupDescs = dupes((p) => p.seo_description || p.excerpt);
  const noindexed = [...posts.filter((p) => p.noindex).map((p) => `/blog/${p.slug}`), ...listOverrides().filter((o) => JSON.parse(o.data).noindex).map((o) => o.path)];
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.score, 0) / rows.length) : 0;

  const site: [keyof typeof dot, string][] = [
    [s.verification.google ? "good" : "bad", s.verification.google ? L("Google Search Console の確認コードが設定されています", "Google Search Console verification is set") : L("Google Search Console の確認コードが未設定です（サイト全体の設定）", "Google Search Console verification is missing (Site settings)")],
    [s.verification.bing ? "good" : "ok", s.verification.bing ? L("Bing の確認コードが設定されています", "Bing verification is set") : L("Bing Webmaster Tools も登録すると、Copilot などの検索にも届きやすくなります", "Adding Bing Webmaster Tools also helps Copilot-style search")],
    [s.sameAs.length ? "good" : "ok", s.sameAs.length ? L(`sameAs に ${s.sameAs.length} 件のURL`, `${s.sameAs.length} sameAs URL(s)`) : L("公式SNSなどの sameAs が未設定です", "No sameAs profile URLs yet")],
    [s.aiCrawlers === "allow" ? "good" : "ok", s.aiCrawlers === "allow" ? L("AIクローラーを許可しています（AI検索で引用されやすい）", "AI crawlers allowed (good for AI-search citations)") : s.aiCrawlers === "block-training" ? L("AIの学習用クローラーだけ拒否しています", "Only AI training crawlers are blocked") : L("AIクローラーをすべて拒否しています（AI検索に出にくくなります）", "All AI crawlers are blocked (less AI-search visibility)")],
    [s.llms.enabled ? "good" : "ok", s.llms.enabled ? L("llms.txt を公開しています", "llms.txt is published") : L("llms.txt は非公開です", "llms.txt is off")],
    [s.schema.faq && s.schema.breadcrumbs ? "good" : "ok", L("構造化データ：", "Structured data: ") + [s.schema.faq && "FAQPage", s.schema.breadcrumbs && "BreadcrumbList"].filter(Boolean).join(" / ")],
    [dupTitles.length ? "bad" : "good", dupTitles.length ? L(`タイトルの重複が ${dupTitles.length} 組あります`, `${dupTitles.length} duplicate title(s)`) : L("記事タイトルの重複はありません", "No duplicate article titles")],
    [dupDescs.length ? "bad" : "good", dupDescs.length ? L(`説明文の重複が ${dupDescs.length} 組あります`, `${dupDescs.length} duplicate description(s)`) : L("説明文の重複はありません", "No duplicate descriptions")],
  ];

  return (
    <div className="grid gap-5">
      <section className={`${card} grid gap-3 p-5`}>
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="font-maru text-lg font-bold">{L("サイト全体", "Site")}</h2>
          <span className="text-sm text-ink-2">{L(`公開記事 ${posts.length}本・平均スコア ${avg}・リダイレクト ${listRedirects().length}件`, `${posts.length} live posts · average score ${avg} · ${listRedirects().length} redirects`)}</span>
        </div>
        <ul className="grid gap-1.5 text-sm">
          {site.map(([st, t], i) => <li key={i} className="flex items-start gap-2"><span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${dot[st]}`} aria-hidden />{t}</li>)}
        </ul>
        {[...dupTitles, ...dupDescs].length > 0 && (
          <details className="text-xs text-ink-2">
            <summary className="cursor-pointer">{L("重複の内訳", "Duplicates")}</summary>
            <ul className="mt-1 list-disc pl-5">{[...dupTitles, ...dupDescs].map(([k, v]) => <li key={k}>「{k.slice(0, 50)}」: {v.join(" / ")}</li>)}</ul>
          </details>
        )}
        {noindexed.length > 0 && <p className="text-xs text-ink-2">noindex: {noindexed.map((p) => <code key={p} className="mr-2">{p}</code>)}</p>}
      </section>

      <section className={card}>
        <h2 className="border-b border-line px-5 py-3 font-maru text-lg font-bold">{L("記事ごとのスコア（低い順）", "Article scores (lowest first)")}</h2>
        <ul className="divide-y divide-line">
          {rows.map(({ p, score, bad, checks }) => (
            <li key={p.id} className="px-5 py-3 text-sm">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${score >= 80 ? "bg-[#2e7d32]" : score >= 55 ? "bg-[var(--caution)]" : "bg-[#b3261e]"}`}>{score}</span>
                  <span className="min-w-0 flex-1 font-bold">{p.title}</span>
                  <span className="text-xs text-ink-2">{p.seo.focusKeyphrase ? `🔑 ${p.seo.focusKeyphrase}` : L("キーフレーズ未設定", "No keyphrase")}{bad.length ? L(`・要改善 ${bad.length}`, ` · ${bad.length} to fix`) : ""}</span>
                  <Link href={`/admin/posts/${p.id}`} className="text-xs underline">{L("編集", "Edit")}</Link>
                </summary>
                <ul className="mt-2 grid gap-1 pl-12 text-[13px]">
                  {checks.map((c) => <li key={c.id} className="flex items-start gap-2"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${dot[c.status]}`} aria-hidden />{en ? c.en : c.ja}</li>)}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
