"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSeoAction, type SeoSaveState } from "@/app/admin/(panel)/seo/actions";
import type { SeoSettings } from "@/lib/cms/seo";
import { Count, ImageField, SerpPreview } from "./image-field";
import { useL } from "./lang";
import { Submit, card, input, label, useLeaveGuard } from "./ui";

type Nested = "verification" | "sitemap" | "indexing" | "schema" | "llms";
const lines = (a: string[]) => a.join("\n");
const unlines = (s: string) => s.split("\n");

/** Site-wide SEO settings (controlled, so a validation error never wipes what was typed). */
export function SeoSettingsForm({ initial, aiTraining, aiSearch }: { initial: SeoSettings; aiTraining: string[]; aiSearch: string[] }) {
  const L = useL();
  const [s, setS] = useState(initial);
  const [base, setBase] = useState(() => JSON.stringify(initial));
  const [state, action] = useActionState<SeoSaveState, FormData>(saveSeoAction, null);
  const sent = useRef(base);
  const json = JSON.stringify(s);
  const dirty = json !== base;
  useLeaveGuard(dirty);
  useEffect(() => { if (state?.ok) setBase(sent.current); }, [state]);

  const set = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const setIn = <K extends Nested>(k: K, v: Partial<SeoSettings[K]>) => setS((x) => ({ ...x, [k]: { ...x[k], ...v } }));
  const check = <K extends Nested>(k: K, key: keyof SeoSettings[K] & string, text: string, help?: string) => (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" className="mt-1 size-4 accent-[var(--color-shu)]" checked={!!s[k][key]} onChange={(e) => setIn(k, { [key]: e.target.checked } as Partial<SeoSettings[K]>)} />
      <span>{text}{help && <span className="block text-xs text-ink-2">{help}</span>}</span>
    </label>
  );
  const home = s.siteTitle;

  return (
    <form action={action} onSubmit={() => { sent.current = json; }} className="grid gap-5">
      <input type="hidden" name="data" value={json} />
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-card/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <input name="note" placeholder={L("変更メモ（任意）", "Change note (optional)")} maxLength={120} aria-label={L("変更メモ", "Change note")} className={`${input} max-w-[320px] py-1.5 text-sm`} />
        <Submit>{L("保存して公開", "Save & publish")}</Submit>
        <span className="text-xs" aria-live="polite">
          {dirty ? <span className="text-[var(--caution)]">{L("未保存の変更があります", "Unsaved changes")}</span>
            : state?.ok ? <span className="text-[#2e7d32]">{L(`保存しました（版 ${state.version}）`, `Saved (version ${state.version})`)}</span> : null}
        </span>
      </div>
      {state?.error && <p role="alert" className="rounded-lg border border-[#b3261e] bg-[#b3261e]/10 px-3 py-2 text-sm">{state.error}</p>}

      <section className={`${card} grid gap-4 p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("検索結果とSNSの基本", "Search & social basics")}</h2>
        <div>
          <div className="flex justify-between"><label className={label} htmlFor="s-title">{L("サイトのタイトル（トップページの title）", "Site title (home page <title>)")}</label><Count n={s.siteTitle.length} max={34} /></div>
          <input id="s-title" value={s.siteTitle} onChange={(e) => set("siteTitle", e.target.value)} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="s-tpl">{L("ページタイトルのテンプレート（%s がページ名）", "Page title template (%s = page name)")}</label>
          <input id="s-tpl" value={s.titleTemplate} onChange={(e) => set("titleTemplate", e.target.value)} className={`${input} font-mono text-sm`} />
          <p className="mt-1 text-xs text-ink-2">{L("例：", "Example: ")}{s.titleTemplate.replace("%s", L("BMI計算", "BMI calculator"))}</p>
        </div>
        <div>
          <div className="flex justify-between"><label className={label} htmlFor="s-desc">{L("サイトの説明（トップページの meta description）", "Site description (home meta description)")}</label><Count n={s.siteDescription.length} min={80} max={125} /></div>
          <textarea id="s-desc" rows={3} value={s.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} className={input} />
        </div>
        <SerpPreview title={home} description={s.siteDescription} url="osakadou.live" />
        <div>
          <div className="flex justify-between"><label className={label} htmlFor="s-og">{L("SNSでシェアされたときの説明（og:description）", "Social share description (og:description)")}</label><Count n={s.ogDescription.length} max={110} /></div>
          <textarea id="s-og" rows={2} value={s.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} className={input} />
        </div>
        <div>
          <p className={label}>{L("既定のOGP画像（画像のないページで使う・1200×630推奨）", "Default OG image (pages without their own; 1200×630 recommended)")}</p>
          <ImageField value={s.defaultOgImage} onChange={(v) => set("defaultOgImage", v)} empty={L("標準の画像（/og-default.jpg）", "Built-in image (/og-default.jpg)")} />
        </div>
        <div>
          <label className={label} htmlFor="s-tw">{L("X（旧Twitter）のアカウント", "X (Twitter) handle")}</label>
          <input id="s-tw" value={s.twitterSite} onChange={(e) => set("twitterSite", e.target.value)} placeholder="@osakadou" className={`${input} max-w-[240px] font-mono text-sm`} />
        </div>
      </section>

      <section className={`${card} grid gap-4 p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("組織情報（構造化データ sameAs）", "Organization (structured data sameAs)")}</h2>
        <div>
          <label className={label} htmlFor="s-same">{L("公式SNS・プロフィールのURL（1行に1つ・https://）", "Official social / profile URLs (one per line, https://)")}</label>
          <textarea id="s-same" rows={3} value={lines(s.sameAs)} onChange={(e) => set("sameAs", unlines(e.target.value))} placeholder="https://x.com/…" className={`${input} font-mono text-sm`} />
          <p className="mt-1 text-xs text-ink-2">{L("トップページ・記事・「オオサカ堂について」の Organization に出力し、ブランドとして認識されやすくします。", "Added to the Organization on the home page, articles and About, to strengthen the brand entity.")}</p>
        </div>
      </section>

      <section className={`${card} grid gap-4 p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("所有権の確認（Search Console など）", "Ownership verification (Search Console etc.)")}</h2>
        <p className="text-xs text-ink-2">{L("「HTMLタグ」方式の content=\"…\" の値だけを貼り付けます。", "Paste only the content=\"…\" value of the HTML-tag method.")}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {([["google", "Google Search Console"], ["bing", "Bing Webmaster Tools"], ["yandex", "Yandex"]] as const).map(([k, n]) => (
            <div key={k}>
              <label className={label} htmlFor={`s-v-${k}`}>{n}</label>
              <input id={`s-v-${k}`} value={s.verification[k]} onChange={(e) => setIn("verification", { [k]: e.target.value.trim() })} className={`${input} font-mono text-xs`} />
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} grid gap-4 p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-maru text-lg font-bold">{L("クローラーと robots.txt", "Crawlers & robots.txt")}</h2>
          <a href="/robots.txt" target="_blank" className="text-xs underline">{L("いまの robots.txt を見る ↗", "View current robots.txt ↗")}</a>
        </div>
        <fieldset className="grid gap-2">
          <legend className={label}>{L("AIクローラー", "AI crawlers")}</legend>
          {([
            ["allow", L("すべて許可（AI検索・AIの回答で引用されやすくなります）", "Allow all (more likely to be cited in AI search and answers)")],
            ["block-training", L("学習用だけ拒否（AI検索の引用は許可）", "Block training only (AI search citations still allowed)")],
            ["block-all", L("すべて拒否（AI検索にも表示されにくくなります）", "Block all (also reduces visibility in AI search)")],
          ] as const).map(([v, t]) => (
            <label key={v} className="flex items-start gap-2 text-sm">
              <input type="radio" name="ai" className="mt-1 accent-[var(--color-shu)]" checked={s.aiCrawlers === v} onChange={() => set("aiCrawlers", v)} />
              <span>{t}</span>
            </label>
          ))}
          <details className="text-xs text-ink-2">
            <summary className="cursor-pointer">{L("対象のボット", "Which bots")}</summary>
            <p className="mt-1">{L("学習用：", "Training: ")}<code>{aiTraining.join(", ")}</code></p>
            <p className="mt-1">{L("AI検索：", "AI search: ")}<code>{aiSearch.join(", ")}</code></p>
          </details>
        </fieldset>
        <div>
          <label className={label} htmlFor="s-dis">{L("クロールさせないパス（1行に1つ・/ から）", "Disallowed paths (one per line, starting with /)")}</label>
          <textarea id="s-dis" rows={3} value={lines(s.robotsDisallow)} onChange={(e) => set("robotsDisallow", unlines(e.target.value))} placeholder="/blog/__none__" className={`${input} font-mono text-sm`} />
          <p className="mt-1 text-xs text-ink-2">{L("/api/ と /admin は常に除外されます。", "/api/ and /admin are always disallowed.")}</p>
        </div>
        <div>
          <label className={label} htmlFor="s-custom">{L("追加のルール（そのまま末尾に書き出します）", "Extra rules (written verbatim at the end)")}</label>
          <textarea id="s-custom" rows={4} value={s.robotsCustom} onChange={(e) => set("robotsCustom", e.target.value)} placeholder={"User-agent: Baiduspider\nDisallow: /"} className={`${input} font-mono text-sm`} />
        </div>
      </section>

      <section className={`${card} grid gap-4 p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-maru text-lg font-bold">{L("サイトマップとインデックス", "Sitemap & indexing")}</h2>
          <a href="/sitemap.xml" target="_blank" className="text-xs underline">{L("sitemap.xml を見る ↗", "View sitemap.xml ↗")}</a>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {check("sitemap", "blog", L("記事と記事一覧を載せる", "Include articles and the article index"))}
          {check("sitemap", "categories", L("カテゴリページを載せる", "Include category pages"))}
          {check("sitemap", "tools", L("無料ツールを載せる", "Include free tools"))}
          {check("sitemap", "about", L("「オオサカ堂について」を載せる", "Include the About page"))}
        </div>
        {check("indexing", "noindexCategories", L("カテゴリページをすべて noindex にする", "Set every category page to noindex"), L("記事が少ないうちは、薄いページとして評価されるのを防げます。", "Useful while categories are thin."))}
        <div>
          <label className={label} htmlFor="s-min">{L("サブカテゴリをインデックスする最小記事数", "Minimum posts before a sub-category is indexed")}</label>
          <input id="s-min" type="number" min={0} max={50} value={s.indexing.subCategoryMinPosts} onChange={(e) => setIn("indexing", { subCategoryMinPosts: Number(e.target.value) })} className={`${input} w-28`} />
          <p className="mt-1 text-xs text-ink-2">{L("これより少ないサブカテゴリは noindex（リンクはたどれる）になり、サイトマップからも外れます。", "Below this, sub-categories are noindex (links still followed) and left out of the sitemap.")}</p>
        </div>
      </section>

      <section className={`${card} grid gap-3 p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("構造化データ", "Structured data")}</h2>
        {check("schema", "faq", L("記事のQ&Aブロックを FAQPage として出力する", "Output article Q&A blocks as FAQPage"), L("記事ごとに止めることもできます（記事の編集画面 › SEO › 詳細）。", "Can be turned off per article (post editor › SEO › Advanced)."))}
        {check("schema", "breadcrumbs", L("記事にパンくず（BreadcrumbList）を出力する", "Output BreadcrumbList on articles"))}
      </section>

      <section className={`${card} grid gap-4 p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-maru text-lg font-bold">llms.txt</h2>
          <a href="/llms.txt" target="_blank" className="text-xs underline">{L("llms.txt を見る ↗", "View llms.txt ↗")}</a>
        </div>
        {check("llms", "enabled", L("/llms.txt を公開する（AIアシスタント向けのサイト案内）", "Publish /llms.txt (a site guide for AI assistants)"))}
        <div>
          <div className="flex justify-between"><label className={label} htmlFor="s-llms">{L("冒頭の紹介文", "Intro paragraph")}</label><Count n={s.llms.intro.length} max={400} /></div>
          <textarea id="s-llms" rows={3} value={s.llms.intro} onChange={(e) => setIn("llms", { intro: e.target.value })} className={input} />
        </div>
      </section>
    </form>
  );
}
