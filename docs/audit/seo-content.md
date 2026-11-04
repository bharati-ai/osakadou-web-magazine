# SEO and content audit: オオサカ堂 (osakadou.live)

- **Date:** 2026-11-04
- **Target:** production build at http://localhost:3200, checked against the source.
- **Method:**
  - Crawled all 61 sitemap URLs plus 404, trailing-slash, uppercase and query variants.
  - For each page, parsed `<title>`, description, canonical, robots, OG/Twitter, headings and JSON-LD.
  - Built the internal link graph.
  - Validated the RSS feed and sitemap with an XML parser.
  - Took mobile screenshots (375px) of an article, a sub-category page and the 404 page.
  - Grepped the repo, the DB and the rendered HTML for the old brand names.
- **Read-only:** no data was created or changed. Scratch files are in the scratchpad under `seo/`.

---

## 1. Findings

Severity: **P0** blocks launch · **P1** fix before launch · **P2** nice to have.

### P1: fix before launch

| ID | Sev | Location | Problem | Concrete fix |
|---|---|---|---|---|
| S-01 | **P1** | `app/layout.tsx:20-27`; every non-article page (`app/(site)/blog/page.tsx`, `blog/category/**`, `tools/page.tsx`, the 22 `tools/*/page.tsx`) | **OG/Twitter titles and descriptions are duplicated site-wide.** In Next.js, a child `openGraph` replaces the parent's instead of merging with it, and only articles define one. Result: **44 of the 45 non-article pages** (/blog, all 20 categories, /tools, all 22 tools) output the home page's og:title, og:description, twitter:title and twitter:description (「オオサカ堂｜大阪の暮らし・健康・美容のWebマガジン」). So a shared `/tools/bmi` or `/tools/osaka-ben` (which has its own share button) shows the home-page card. Articles have the opposite problem: they lose `og:site_name` and `og:locale`. No page has `og:url` (0/60). | Add one helper and use it on every page that has its own title:<br>`// lib/site.ts`<br>`export const pageMeta = (title: string, description: string, path: string): Metadata => ({ title, description, alternates: { canonical: path }, openGraph: { type: "website", locale: "ja_JP", siteName: SITE.name, url: path, title: \`${title}｜${SITE.name}\`, description } });`<br>Then:<br>• Blog, categories and /tools return `pageMeta(...)`.<br>• Each tool page uses `export const metadata = { ...pageMeta(tool.title, tool.short, \`/tools/${tool.slug}\`), keywords: tool.keywords }`.<br>• Articles (`blog/[slug]/page.tsx:22`) add `siteName: SITE.name, locale: "ja_JP", url: \`/blog/${p.slug}\`` to their `openGraph`.<br>Twitter already mirrors OG. After the change, check that `og:image` (the `app/opengraph-image.jpg` file) still appears on pages that set no images. |
| S-02 | **P1** | `app/layout.tsx:19`; there is no `app/not-found.tsx` | **The 404 page is broken for SEO and UX.**<br>• Unmatched URLs (`/no-such-page`) show a blank English page, "404 This page could not be found.", with no header, footer or links.<br>• `notFound()` routes (`/blog/nope`, `/tools/nope`) show the same English text.<br>• Every 404 has `<title>` = the home title and **`<link rel="canonical" href="https://osakadou.live">`**. The root layout's `alternates.canonical: "/"` is inherited by any page that doesn't override it, including the 404 page and `/admin/login`. (The page is `noindex`, so the canonical sends a mixed signal.) | 1. Move the canonical out of the root layout. Delete `alternates` in `app/layout.tsx` and add `export const metadata: Metadata = { alternates: { canonical: "/" } };` to `app/(site)/page.tsx`.<br>2. Create `app/not-found.tsx` (root not-found supports `metadata`; see `node_modules/next/dist/docs/.../not-found.md` §Metadata). It should export `metadata = { title: "ページが見つかりません" }` and render `<SiteHeader/>` + `<main>` + `<SiteFooter/>` with:<br>h1 「ページが見つかりません」<br>p 「お探しのページは、移動または削除された可能性があります。URLをご確認のうえ、トップページや記事一覧からお探しください。」<br>links 「トップページへ」「読みもの一覧」「無料ツール」.<br>3. Check `/blog/nope` afterwards. If the header renders twice, put the header-less `<main>` in `app/(site)/not-found.tsx` as well. |
| S-03 | **P1** | `components/blog/article-view.tsx:19,31`; `app/(site)/blog/[slug]/page.tsx:28`; `app/sitemap.ts:22` | **The modified date shown to users contradicts the machine-readable date.** All 15 posts show 公開日 2026年10月31日 and 最終確認日 2026年10月31日, but JSON-LD `dateModified`, `article:modified_time` and sitemap `<lastmod>` all say **2026-11-04T05:15Z**: a bulk `updated_at` bump on seed posts, which the visible "更新日" deliberately hides (`origin !== "seed"`). Google cross-checks visible dates against structured dates, so this mismatch weakens trust in all dates on a YMYL site. | Use one rule everywhere:<br>`// lib/cms/posts.ts`<br>`export const modifiedAt = (p: Post) => { const u = p.origin !== "seed" && p.updated_at > (p.published_at ?? "") ? p.updated_at : p.published_at!; return p.reviewed_at && p.reviewed_at > u ? p.reviewed_at : u; };`<br>Use it for the visible 更新日 (show it when it is later than `published_at`), for `dateModified`, for OG `modifiedTime` and for sitemap `lastModified`. |
| S-04 | **P1** | `components/blog/article-view.tsx:33` | **The BlogPosting `publisher` cannot be resolved.** It is only `{"@id":"https://osakadou.live/#org"}`, and that node exists only on the home page. Google resolves `@id` within one page, so article pages have a publisher with no name and no logo. That loses the brand-entity signal on every article. | Inline the publisher: `publisher: { "@type": "Organization", "@id": \`${SITE.url}/#org\`, name: SITE.name, alternateName: SITE.nameEn, logo: { "@type": "ImageObject", url: \`${SITE.url}/logo-512.png\`, width: 512, height: 512 } }`. Also give `image` a fallback, `post.cover_src ? … : \`${SITE.url}/opengraph-image.jpg\``, so every post has one. |
| S-05 | **P1** | `app/(site)/blog/category/[cat]/[sub]/page.tsx:20-27`; `app/sitemap.ts:16-19`; `lib/cms/categories.ts:14` | **15 thin, near-duplicate sub-category pages are indexed and listed in the sitemap.**<br>• Every sub-category has exactly **1 post** (verified on all 15).<br>• Each repeats the parent's lead text (the sub-category description is empty, so `r.parent.description` is used).<br>• Each gets a boilerplate description such as 「健康・医療・救急・相談窓口に関するオオサカ堂の記事一覧です。」 (24–39 characters). The chained 中黒 there reads as four separate topics.<br>• Note: `categoryTree({ publishedOnly })` only filters the counts, not the categories, so empty categories would also be listed and linked. | `noindex` sub-categories that have fewer than 3 live posts, and drop them from the sitemap:<br>`const n = livePosts({ categoryId: r.s.id, limit: 1 }).total;`<br>`robots: n < 3 ? { index: false, follow: true } : undefined`<br>In `sitemap.ts`, filter children the same way, and skip parents whose `postCount === 0`. Replace the fallback with 「${parent.name}のなかから、「${sub.name}」の記事をまとめています。」 (no brand; see S-06). |
| S-06 | **P1** (薬機法 caution) | `lib/site.ts:7-8` (SITE.description, which also feeds the home meta, the home WebPage JSON-LD and the RSS `<channel><description>`); `app/(site)/blog/category/[cat]/page.tsx:16`; `[sub]/page.tsx:24` | **The brand is in the same sentence as 医療, which breaks the project's own rule.** The rule (project memory and CHECKPOINT) is that オオサカ堂 stays out of sentences about medicine. The name is shared with the sister 個人輸入 store, and §68 risk grows when the editorial brand sits next to medical topics. Two violations:<br>• 「**オオサカ堂は**、…BMIなどの無料ツール、…**休日・夜間の医療相談先**（#7119・#8000）を、公的な出典つきでまとめています。」<br>• The category fallbacks render 「健康・医療・かかりつけ医・受診に**関するオオサカ堂の記事**一覧です。」 and 「美容・ウェルネス・美容医療と契約に関するオオサカ堂の記事一覧です。」 | Split the sentence so the brand has its own sentence. `lib/site.ts` description (and the stored `/admin/pages/site` value, if one was saved):<br>「オオサカ堂は、大阪で暮らす人のためのWebマガジンです。天気と季節のカレンダー、ごみや引っ越しの手続き、休日・夜間の相談窓口（#7119・#8000）、BMIなどの無料ツールを、公的な出典つきでまとめています。」<br>Category fallbacks: parent 「${c.name}の記事一覧です。」; sub as in S-05. Give the 5 parent categories real descriptions through `/admin/categories` (§4.2). |
| S-07 | **P1** | `components/site-footer.tsx:8,44` | **The footer's 「最終更新日」 is the server process start time** (`const BUILT = new Date()`), shown on every page. It changes on each restart and never reflects content. On tool pages it conflicts with 「内容の最終確認日：2026年10月31日」 (Google may show either date in results). It misrepresents freshness on YMYL pages. This was already flagged in `docs/compliance-tools.md` #10 and is still present. | Delete the `<p>最終更新日…</p>` line and the `BUILT` constant. If a site-level date is wanted, use `jaDate(livePosts({ limit: 1 }).posts[0]?.updated_at)` with the label 「サイト更新日」. |
| S-08 | **P1** (security-adjacent; tell the security reviewer) | `app/(site)/page.tsx:37` | **The JSON-LD escape on the home page does nothing.** `.replace(/</g, "<")`: inside a TS string literal, `"<"` *is* `<`, so nothing is escaped. `site.title` and `site.description` can be edited in `/admin/pages/site`, so a value containing `</script>` breaks the home page and is a stored-XSS vector for an admin account. `article-view.tsx:54` does it correctly (`"\\u003c"`). | Change it to `.replace(/</g, "\\u003c")`. |
| S-09 | **P1** (E-E-A-T / YMYL) | `components/site-footer.tsx`; `app/(site)/page.tsx:24` (JSON-LD `publishingPrinciples` etc. → `/#policy`); `article-view.tsx:32` (`author.url` = top page) | **There is no 運営者情報 or お問い合わせ page.** The editorial policy, the health-information policy, the PR policy and privacy exist only as a fragment of the home page (`/#policy`). There is no responsible party, no contact route and no corrections page. For health, beauty and emergency-contact content, Google's quality guidelines weigh "who is responsible and how to reach them" heavily, and brand-search users expect a 「オオサカ堂について」 page in the sitelinks. | Create `app/(site)/about/page.tsx` 「オオサカ堂について」, indexable, with:<br>• 媒体名・URL<br>• 編集・運営：オオサカ堂編集部<br>• お問い合わせ (email or form)<br>• 編集方針, 健康・医療情報の取り扱い, 訂正の方針, 広告・PR表記, プライバシー (move or duplicate the policy blocks)<br>Then link 「オオサカ堂について」「お問い合わせ」 in the footer, point `publishingPrinciples`, `correctionsPolicy` and `ethicsPolicy` at `/about#…`, set `author.url` to `/about`, and add Organization `contactPoint`. Do **not** mention the sister store, import or medicines on this page; have the planned 薬機法 lawyer review the 運営者 wording. |

### P2: nice to have

| ID | Sev | Location | Problem | Concrete fix |
|---|---|---|---|---|
| S-10 | P2 | `components/blog/article-view.tsx:114`; `app/admin/(panel)/posts/actions.ts:43` | Tags are rendered as `#{t}`. The tags `#7119` and `#8000` therefore show as **「##7119」「##8000」** (verified on `/blog/osaka-kyujitsu-yakan-iryo-soudan`). | Display: `{t.startsWith("#") ? t : \`#${t}\`}`. |
| S-11 | P2 | `lib/tools/*.ts` (`short` is reused as the meta description); `app/(site)/tools/*/page.tsx` | Tool titles carry only the bare keyword (「BMI計算｜オオサカ堂」, 11 characters). Meta descriptions are 34–56 characters, the one-line card blurb. Tools are the most competitive entry pages (calculator SERPs). | Add `seoTitle` and `description` fields to `ToolMeta` and use them in `pageMeta`. Examples:<br>• bmi: title 「BMI計算｜肥満度の判定と標準体重、年代別の平均と比較」; description 「身長と体重を入れるだけで、BMIと肥満度（日本肥満学会の区分）、標準体重を計算します。厚生労働省の国民健康・栄養調査をもとに、同じ年代・性別の平均とも比べられます。」<br>• hyoujun-taijuu: 「標準体重計算｜身長からBMI22の体重と年代別の目標BMI」<br>Keep the same rules: no efficacy wording, no product names. |
| S-12 | P2 | `components/tools/tool-shell.tsx` | **Tools never link to articles** (0 tool→post links in the crawl), although 11 articles link to tools. Pairs that are missing:<br>• hikkoshi-tetsuzuki ↔ osaka-hikkoshi-tetsuzuki<br>• bichiku-keisan ↔ osaka-nankai-trough-bousai<br>• osaka-map ↔ osaka-kakaritsukei / osaka-sento<br>• hada-yohou / kami-uneri-yohou / suibun-meyasu ↔ osaka-kikou-skincare | Find the articles by reverse lookup; no new editorial field is needed:<br>`// lib/cms/posts.ts`<br>`export const postsLinkingTo = (path: string) => (db().prepare("SELECT slug, title FROM posts WHERE status='published' AND published_at <= ? AND content_html LIKE ? LIMIT 3").all(nowIso(), \`%href="${path}"%\`) as {slug:string;title:string}[]);`<br>Render them as 「この話題の読みもの」 in ToolShell, and add `export const revalidate = 3600` to the tool pages. |
| S-13 | P2 | `components/tools/tool-shell.tsx:33-41`; `components/blog/listing.tsx`; `components/blog/article-view.tsx:41-47` | **Breadcrumbs are incomplete:**<br>• Tools have visible crumbs only (no BreadcrumbList), labelled 「トップ」 and `aria-label="パンくず"` (articles use 「ホーム」 and 「パンくずリスト」). Their last crumb is the category, not the tool.<br>• Category and listing pages have no breadcrumbs.<br>• The article BreadcrumbList stops at the sub-category. | • Use 「ホーム」 and `aria-label="パンくずリスト"` everywhere.<br>• Add a BreadcrumbList to ToolShell: ホーム › 無料ツール › {tool.title}. Skip the `/tools#cat` fragment level, because fragments are not separate URLs.<br>• Add crumbs and JSON-LD to `Listing`: ホーム › 読みもの › {parent} › {sub}.<br>• Append the current article as the last ListItem: `{ position: n, name: post.title }`. |
| S-14 | P2 | `components/blog/listing.tsx:39-42`, `post-card.tsx:70`; `components/tools/culture/osaka-ben*`; `lib/cms/pages.ts:72` | **The heading hierarchy skips levels:**<br>• Listing pages go from h1 straight to the card h3s (/blog and every category).<br>• `/tools/osaka-ben` has an h3 「大阪弁にすると」 before its first h2.<br>• Home has h2 「編集方針」 followed by an h3 「編集方針」. One h1 per page holds everywhere. | • Add `<h2 className="sr-only">記事一覧</h2>` before the grid in Listing.<br>• Make the osaka-ben result heading a `<p>` or an h2.<br>• Rename the first policy block title to 「記事のつくり方」. |
| S-15 | P2 | 15 articles (`seo_title`); `components/admin/post-form.tsx:143` | Article `<title>`s are **36–41 characters** including 「｜オオサカ堂」, so the brand suffix is cut off on desktop SERPs (about 30–32 full-width characters). The admin counter's ideal is 28–36 *excluding* the 6-character suffix, which encourages titles that are too long. | Change the counter to `ideal={[20, 26]}` and the label to 「SEOタイトル（末尾に「｜オオサカ堂」が付きます）」. Example rewrites:<br>• 「休日・夜間の医療相談先｜大阪の#7119・#8000」<br>• 「大阪市のごみ分別と出し方｜収集日・粗大ごみ・電池」<br>• 「大阪の気候と季節のスキンケア｜湿度・紫外線・乾燥」 |
| S-16 | P2 | `app/(site)/blog/category/[cat]/page.tsx:16`, `[sub]/page.tsx:23`; `blog/page.tsx:9` | Title wording:<br>• 「読みもの・連載」: there are no real 連載 (multi-part series; every "連載" title is a single article).<br>• 「一人暮らし（大阪の暮らし）の記事」 is awkward. | • Blog: 「読みもの（記事一覧）」.<br>• Parent category: 「${name}の記事一覧」.<br>• Sub-category: 「${sub}の記事一覧（${parent}）」. |
| S-17 | P2 | `app/sitemap.ts:12,13,23` | `lastModified: now` for home and every tool, so the date changes on each regeneration. Google learns to ignore unreliable lastmod values. | Home: use the newest post's `modifiedAt`. Tools: use a constant `TOOLS_REVIEWED = "2026-10-31"` (the same date ToolShell shows) or omit it. Categories: omit (already omitted). |
| S-18 | P2 | `app/(site)/blog/feed.xml/route.ts:14` | The feed is valid RSS 2.0 (15 items, correct MIME type), but:<br>• no `atom:link rel="self"` (the W3C validator warns about this);<br>• no `lastBuildDate`;<br>• the channel description reuses the brand+医療 sentence (S-06);<br>• autodiscovery (`alternates.types`) exists only on `/blog`. | • `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">` plus `<atom:link href="${SITE.url}/blog/feed.xml" rel="self" type="application/rss+xml"/><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`.<br>• Use the /blog description for the channel description.<br>• Move `types: { "application/rss+xml": "/blog/feed.xml" }` into the root layout. |
| S-19 | P2 | `app/(site)/blog/[slug]/page.tsx:30` | The article og:image is `/_next/image?…&w=1200&q=55`, with no `og:image:height` and quality 55 for share cards. It is served as JPEG to `Accept: */*` crawlers (checked), so it works. | For `/photos/*` covers, use the original URL. Otherwise pass `w=1200` and add `height: 675` only when the source is 16:9. |
| S-20 | P2 | `components/blog/listing.tsx:17`; `[sub]/page.tsx:33` | The sub-category header marks the Japanese parent name as English (`<p lang="en">健康・医療</p>`). | Pass `en="Category"` for sub-categories and show the parent in the breadcrumb (S-13). |
| S-21 | P2 | `app/(site)/blog/[slug]/page.tsx` | `/blog/OSAKA-SENTO` returns 200 with the same content (its canonical points to the lowercase URL, so the risk is low). Trailing slashes already redirect with 308. | `const slug = (await params).slug; if (slug !== slug.toLowerCase()) permanentRedirect(\`/blog/${slug.toLowerCase()}\`);` |
| S-22 | P2 (brand) | `components/home/hero.tsx:9,25` | The home h1 is the tagline 「大阪の暮らし・健康・美容を、もっと身近に。」. The large visible brand masthead 「オオサカ堂 / OSAKADOU」 is a `<p>`. For the brand query, the page's main heading should be the brand. | Make the masthead the `<h1>` (keep `id="h1"` for `aria-labelledby`) and the vertical tagline a `<p>`. This also moves 「健康・美容」 out of the heading next to the brand. |
| S-23 | P2 (薬機法 strategy; give to the lawyer review) | `lib/site.ts:6`; `app/opengraph-image.jpg`; title template on health and beauty pages | The brand sits next to health words even where the sentence rule is kept:<br>• the site `<title>` 「オオサカ堂｜大阪の暮らし・健康・美容のWebマガジン」 (inherited as og:title on 44 pages until S-01 is fixed);<br>• the OG image tagline;<br>• titles such as 「美容医療の契約とクーリング・オフ…｜オオサカ堂」 and 「化粧品の成分表示の読み方…医薬部外品の違い｜オオサカ堂」.<br>No product or drug names appear anywhere, so the risk is low today. It rises sharply once any link to the store exists. | Decide this before launch with the reviewer: (a) keep the brand suffix on YMYL pages and accept the risk, or (b) use `title: { absolute: … }` on health and beauty articles and tools. Never add 薬, 通販, 個人輸入 or the store to any page. Optionally soften the site title to 「オオサカ堂｜大阪で暮らす人のWebマガジン」. |
| S-24 | P2 (YMYL wording) | `components/blog/article-view.tsx:12,107-111` | The same disclaimer is used for health and beauty. For 化粧品表示 and 美容医療契約 articles, 「診断や治療」「医師・薬剤師」 miss the right referral (consumer affairs, 188). | Use a map instead of the `YMYL` Set:<br>health (unchanged): 「この記事は一般的な情報の提供を目的としており、診断や治療に代わるものではありません。特定の商品やサービスをすすめるものでもありません。症状や治療については、医療機関や医師・薬剤師にご相談ください。」<br>beauty: 「この記事は一般的な情報の提供を目的としたもので、特定の化粧品や施術、医療機関をすすめるものではありません。肌の不調が続くときは皮膚科などの医療機関に、契約のトラブルは消費者ホットライン（188）にご相談ください。」 |
| S-25 | P2 (YMYL wording) | `lib/cms/pages.ts:55,74`; `components/tools/tool-shell.tsx:84` | • The help-lines disclaimer ends abruptly: 「…受診前に各機関へ確認を。」<br>• The PR policy promises "no product links" only for 健康・医療, not 美容.<br>• ToolShell prints 「結果は一般的な目安で、診断ではありません。」 on every tool, including 大阪弁変換 and 祭りカウントダウン. | • help.disclaimer → 「この一覧は一般的な情報で、医療上の助言ではありません。内容が変わることがあるため、受診の前に各機関の公式情報をご確認ください。」<br>• Policy: 「健康・医療・美容の記事の本文中で、特定の商品をすすめたり、商品ページへ案内したりすることはありません。」<br>• ToolShell: add the diagnosis sentence only when `tool.category` is `health` or `wellness`. |
| S-26 | P2 (old name) | `app/api/places/route.ts:29` | The outbound User-Agent is still **`OSAKA-LIVE/1.0`**. It is sent to the third-party Overpass API. No rendered page, DB row, feed or sitemap contains "OSAKA LIVE" or 「オオサカライブ」 (all checked), and the OG image now shows オオサカ堂. | `"OSAKADOU/1.0 (+https://osakadou.live/tools/osaka-map)"`. Keep the localStorage keys `osakalive:checklist`, `osaka-live:bichiku` and `osaka-live:hikkoshi` (`components/home/checklist.tsx:8`, `tools/wellness/*.tsx`): users never see them, and renaming them would erase saved checklists. The old name also remains in `docs/01-research.md`, `02-ux-ia.md`, `04-copy-ja.md`, `tools-brief.md`, `compliance-tools.md` and `seo-oosakadou.md`; add a "superseded: brand is オオサカ堂" note or refresh `seo-oosakadou.md` as CHECKPOINT says. |
| S-27 | P2 (content) | `content/posts/osaka-kyujitsu-yakan-iryo-soudan.html` and the DB copy | The in-article link text 「トップページの『**体調が悪いとき**の相談先』」 doesn't match the real heading, 「**体調がすぐれないとき**の相談先」. | Change it to 「体調がすぐれないときの相談先」 (in the admin editor). |
| S-28 | P2 (JP copy) | `components/blog/article-view.tsx:104`; `tool-shell.tsx:94`; `listing.tsx:45` | • 「リンク先の内容は **␣2026年10月31日␣** に確認しました。」 has half-width spaces inside Japanese text.<br>• 「参考・出典」 (articles) vs 「出典・参考」 (tools).<br>• The empty state 「このカテゴリの記事は準備中です。」 also appears on `/blog`, which is not a category. | • 「リンク先の内容は{jaDate(...)}に確認しました。」<br>• Use 「参考・出典」 everywhere.<br>• Empty state: `current ? "このカテゴリの記事は準備中です。" : "記事はまだありません。公開まで、しばらくお待ちください。"` |
| S-29 | P2 (JP copy) | `components/home/themes.tsx:33` and `lib/cms/pages.ts:66` (「5つのテーマと、連載記事」, `seriesLabel: "連載記事"`); `blog/page.tsx` | The terms are inconsistent: 記事, 読みもの and 連載 are used interchangeably. 連載 implies an ongoing multi-part series. | • Section name: 「読みもの」 (nav, /blog h1).<br>• Unit: 「記事」.<br>• Retire 連載 until a real series exists: themes.title 「5つのテーマと、主な記事」, seriesLabel 「このテーマの記事」. |
| S-30 | P2 (admin copy) | `app/admin/(panel)/posts/[id]/page.tsx:17-19` (FIELD_JA); `components/admin/post-form.tsx`; `app/admin/(panel)/media/page.tsx:24,43`; `page.tsx:20`; `account/page.tsx:25` | **Admin terms are inconsistent:**<br>• 「説明文」 means both alt text (media) and meta description (revision diff, SERP placeholder).<br>• cover_src is 「アイキャッチ画像」 in the form but 「画像」 in the diff.<br>• slug is 「スラッグ」 but 「URL」 in the diff.<br>• 「最終確認日」 vs 「確認日」.<br>• 「予約投稿」 (dashboard) vs 「予約」 (tabs, badge).<br>• 「版 #12」 (posts) vs 「版 3」 (pages).<br>• 「いまのパスワード」. | Unify:<br>• alt → 「代替テキスト（alt）」<br>• seo_description → 「メタディスクリプション」<br>• cover_src → 「アイキャッチ画像」<br>• slug → 「スラッグ（URL）」<br>• reviewed_at → 「最終確認日」<br>• scheduled → 「予約投稿」<br>• one revision format, 「版 12」<br>• 「現在のパスワード」 |
| S-31 | P2 (admin copy) | `app/admin/(panel)/posts/actions.ts:55`; `lib/cms/posts.ts:31-51` | Validation errors reach editors with English field keys: 「title: 1〜120文字で指定してください」, 「cover alt: 200文字までです」. Some messages use an English-style em dash: 「画像を取り込めませんでした — …」 (`lib/cms/html.ts:167`, `media-uploader.tsx:23`). | Map the keys in the admin action only; the API keeps English keys:<br>`errors.map((e) => e.replace(/^([\w ]+):\s*/, (_, k) => \`${JA[k] ?? k}：\`))`<br>with `JA = { title: "タイトル", slug: "スラッグ", excerpt: "概要", content_html: "本文", seo_title: "SEOタイトル", seo_description: "メタディスクリプション", author: "著者", "cover alt": "代替テキスト", category: "カテゴリ", tags: "タグ", sources: "参考・出典", status: "状態" }`. Replace 「 — 」 with 「：」. |
| S-32 | P2 (kinsoku) | `components/blog/article-view.tsx:143-152` | In the mobile TOC, 「大阪府救急医療情報センター（06-6693-1199）」 breaks the phone number at the hyphen ("06-6693-" / "1199"). Headings use `auto-phrase`, but the TOC links do not. | Add `word-break: auto-phrase` to the TOC `<a>` (same `@supports` block as `globals.css:86`), or replace `-` with U+2011 inside digit runs in `toc()`. |
| S-33 | P2 | `components/blog/article-view.tsx:72-74` | 公開日 and 最終確認日 are both shown when they are the same date (all 15 posts). | Show 最終確認日 only when its date differs from 公開日. |

No P0 findings.

---

## 2. What is already right (verified)

- **Titles:** unique on all 61 URLs. The `%s｜オオサカ堂` template works. The home title is 26 characters.
- **Canonicals:** every indexable page has a correct self-canonical. The only canonical problem is the leak in S-02.
- **robots.txt:**
  - Disallows `/api/` and `/admin` and points to the sitemap.
  - Admin pages send `noindex, nofollow`, and `/admin` → 307 → `/admin/login`.
  - Noindex posts are excluded from the sitemap.
- **Sitemap:** well-formed. Contains home, /blog, 20 categories, 15 posts, /tools and 22 tools. No 404s, no admin URLs.
- **hreflang:** correctly absent. `<html lang="ja">` is set.
- **JSON-LD:** all blocks parse.
  - **Home:** WebSite plus Organization/NewsMediaOrganization. `alternateName` is [OSAKADOU, Osakadou, osakadou.live]. The logo `/logo-512.png` (512×512) returns 200. `about` → 大阪市 (Wikidata Q35765).
  - **Articles:** BlogPosting has the author 「オオサカ堂編集部」, the image (the cover), datePublished and a BreadcrumbList.
- **OG image:** `app/opengraph-image.jpg` (1200×630) shows the オオサカ堂 masthead and has alt text. Articles use their cover.
- **Brand placement is consistent:**
  - header logo text and hero masthead (オオサカ堂 / OSAKADOU);
  - footer wordmark and 「© 2026 オオサカ堂」;
  - byline 「文 オオサカ堂編集部」 and the JSON-LD author;
  - share texts and the SERP preview in the admin.
- **Article bodies:** use 「当サイト」, never the brand.
- **Internal linking is strong:**
  - home → all 15 posts and 15 tools;
  - articles → tools (11 posts);
  - related posts, link cards and category pills.
  - No orphan URLs. Only 4 tools are linked from /tools alone: cinderella and supe by design, and maintenance-calorie and running-calorie because of the six-item related cap.
- **Tags are display-only**, so there are no thin tag archives.
- **URLs:** the URL structure is flat and readable. Trailing slashes redirect with 308.

---

## 3. Content spot-check (E-E-A-T and readability)

| Article | Sources | Reviewed date | Author | Disclaimer | Notes |
|---|---|---|---|---|---|
| **Health:** `/blog/osaka-kyujitsu-yakan-iryo-soudan` | 9 official (大阪市消防局, 大阪府, 大阪市健康局, 消防庁, ナビイ) | 2026-10-31, shown in the header and under the sources | Organization byline only | In-body 「ご注意」 plus the YMYL footer | Excellent practical structure: points box, number table, 「相談できないこと」, the 119 red-flag list quoted from 消防庁, FAQ. **Gaps:**<br>• no named editor or reviewer, and no about page to explain who checks (S-09);<br>• link-text mismatch (S-27);<br>• the cover is a generic skyline;<br>• double-hash tags (S-10). |
| **Beauty:** `/blog/osaka-kikou-skincare` | 10 official (気象庁 normals, 環境省 紫外線マニュアル, 厚労省 睡眠ガイド, water leaflet, 建築物衛生基準) | 2026-10-31 | Organization | YMYL footer | No product names and no efficacy claims (「日焼け止め」 and 「保湿」 are generic). The habits are framed as 「続けやすい習慣」. Uses climate data with a table. Links to 3 tools. The beauty disclaimer could be more specific (S-24). |
| **Guide:** `/blog/osaka-gomi-bunbetsu` | 10+ 大阪市 pages | 2026-10-31, also in the lead | Organization | None (not YMYL) | Tables, dated changes (2025年4月 プラスチック資源), FAQ. Very scannable. |

- **Readability:** natural, polite Japanese of good quality. Paragraphs are short, the TOC appears when there are more than 2 headings, and the reading time is shown.
- **Line breaking:** the CSS sets `line-break: strict` and `word-break: auto-phrase` on headings, so titles wrap at phrase boundaries on 375px (checked in a screenshot). The one exception is S-32.

---

## 4. Proposed copy

### 4.1 Meta descriptions for site-level pages
- **Home:** see S-06.
- **/blog:** 「大阪の暮らし、健康・医療、美容・ウェルネス、カルチャー、暮らしのガイド。国や大阪府・大阪市の公式情報を確かめて書いた記事の一覧です。」 This drops the brand from the 医療 sentence. The title template still carries the brand.

### 4.2 Parent category descriptions (set in `/admin/categories`; 80–110 characters; no brand)
- **living:** 「大阪で毎日を過ごす人のための読みもの。一人暮らしの始め方、商店街や水辺のまち歩きなど、住む人の目線で大阪の街を紹介します。」
- **health:** 「休日・夜間の相談窓口、かかりつけ医の探し方、がん検診や特定健診の受け方など、大阪で医療を利用するときの基本を、国や大阪府・大阪市の公式情報をもとにまとめています。」
- **beauty:** 「季節に合わせたスキンケアの習慣、化粧品の成分表示の読み方、美容医療を契約する前の確認点と相談先など、毎日のセルフケアに役立つ基本情報をまとめています。」
- **culture:** 「だしと粉もんの歴史、銭湯、中之島のミュージアムなど、大阪の暮らしに根づく文化を、住む人の目線で紹介します。」
- **guide:** 「大阪市のごみの分け方と出し方、引っ越しの手続き、南海トラフ地震への備えなど、大阪で暮らすための実用情報を、公式ページへのリンクとともにまとめています。」

---

## 5. Scores (1–10)

| Parameter | Score | Note |
|---|---|---|
| `<title>` (length and uniqueness) | 7 | Unique everywhere. Tool titles are too thin; article titles are too long for the brand suffix. |
| Meta description | 6 | Articles are good. Tools and categories are thin, and some category descriptions are boilerplate. |
| Canonical | 7 | All pages are right, apart from the root-layout leak to 404 and admin pages. |
| OG / Twitter | 4 | 44 pages duplicate the home card. Articles lack site_name and locale. No og:url. |
| Robots / noindex / admin | 9 | Admin is noindex and disallowed. Post-level noindex works. |
| `/sitemap.xml` | 6 | Complete and valid. Includes thin sub-categories. Unreliable lastmod. |
| `/robots.txt` | 9 | Correct. |
| `/blog/feed.xml` | 7 | Valid RSS 2.0. Missing atom:self and lastBuildDate. |
| Heading hierarchy | 7 | One h1 everywhere. Skipped levels on listings and osaka-ben. |
| Breadcrumbs + BreadcrumbList | 5 | Articles only. Tools have visible crumbs only. Listings have none. |
| JSON-LD validity and fit | 6 | Valid. The publisher doesn't resolve on articles. dateModified mismatch. The home escape bug. |
| Internal linking | 7 | Strong home↔blog↔tools in one direction. Tool→article links are missing. |
| URL structure | 8 | Clean and flat. Romaji style is mixed (`kyukyu` vs `hyoujun`); not worth changing. |
| 404 behaviour | 3 | Status is correct (404 + noindex). The page is English, blank, carries the home title and a home canonical. |
| Duplicate / thin content | 5 | 15 one-post sub-category pages. Tags handled well. |
| Brand placement | 8 | Consistent title, masthead, footer, byline and alternateName. The home h1 is not the brand. |
| Old-name cleanup | 8 | Only the Overpass User-Agent (plus invisible localStorage keys and old docs) remains. |
| 薬機法 / YMYL disclaimers | 7 | Good policy and disclaimers. Two brand+医療 sentences. Wording is generic for beauty. |
| Japanese copy: public chrome | 7 | Natural. Double-hash tags. Terminology drift (連載). Small spacing and order issues. |
| Japanese copy: admin | 7 | Polite and clear. Term collisions. English keys in errors. |
| Content E-E-A-T (articles) | 8 | Strong sourcing and dates. No named people or reviewer. |
| Site-level E-E-A-T | 5 | No about, operator or contact page. Footer date is fake. |

---

## 6. Summary

The technical base is solid:
- unique titles and self-canonicals on every indexable page;
- a clean sitemap, robots.txt and RSS feed;
- valid JSON-LD;
- admin pages correctly hidden;
- well-sourced articles with dates and YMYL disclaimers;
- brand placement that is consistent and natural.

The launch blockers for SEO are metadata inheritance bugs and trust signals:
1. **OG cards:** 44 pages share the home page's OG card (S-01).
2. **404 page:** it is English, carries the home title, and has a home canonical leaked from the root layout (S-02).
3. **Dates:** structured modified dates contradict the visible ones (S-03), and the footer shows a fake 「最終更新日」 (S-07).
4. **Article publisher:** the BlogPosting publisher is an unresolved `@id`, so articles carry no brand entity (S-04).
5. **Thin pages:** 15 one-post sub-category pages are indexed (S-05).
6. **About page:** there is no 運営者 or お問い合わせ page for a YMYL site (S-09).

**Compliance:** two places put オオサカ堂 in the same sentence as 医療 (S-06), which breaks the project's own §68 rule. Both are one-line copy fixes. The broader question of how close the brand should sit to health topics in titles and the OG image (S-23) should go to the planned 薬機法 review.

**Security:** the home JSON-LD escape is a no-op (S-08). It is a one-character fix and also affects security.

**Old name:** "OSAKA LIVE" survives only in an outbound User-Agent, in invisible storage keys and in old docs.

**Created data:** none.
