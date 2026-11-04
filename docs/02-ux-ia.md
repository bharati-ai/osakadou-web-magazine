# 02 — UX / Information Architecture: OSAKA LIVE landing page

## 0. Mode decision (japanese-web-design)
**Per-section split.** Editorial surfaces (hero, 編集部より, themes) use **Mode B: premium restraint**: Mincho headlines, generous Ma (white space), one seasonal accent. Utility blocks (resources, checklist, areas) use **Mode A: structured density**, because Japanese readers trust practical info more when it is labelled and complete. Other rules:
- **Tategaki** (vertical text) only for the hero H1 and section kickers. It never goes on nav, numbers, phone numbers or body copy.
- **No italics.**
- **Section dividers**: the only motif is a seigaiha (wave pattern) divider at 8% opacity, a nod to 水都大阪. Generate it with `scripts/wagara.py`.

## 1. Page architecture (mobile heights at 390×844; 1 screen = 1 viewport)

| # | Section (id) | Purpose / content blocks | Height | Layout | Why visitors keep scrolling |
|---|---|---|---|---|---|
| 0 | Header | Wordmark OSAKA LIVE, a 「目次」 button that opens the TOC sheet, and a skip link | 56px sticky | Slim bar | Lets readers jump anywhere at any point |
| 1 | `#cover` | Magazine cover. Masthead, issue label 「創刊準備号 2026 秋」, tategaki H1, five horizontal **cover lines** (one per theme, each an anchor link) and the seasonal colour field. Typographic only, no photo at launch | 100svh | Cover: tategaki right, cover lines left | Cover lines tease what is inside, like the cover of a printed magazine |
| 2 | `#contents` | 「この号の目次」 lists pages 01–05 plus the guides, with page-style numbers | 0.6 | Numbered contents list | Shows the reader how much is on the page |
| 3 | `#editors-note` | 編集部より: 4 short paragraphs on who we are, what we cover, what we never do (sell or give medical advice), then signature and date | 0.8 | Single column, Mincho, 32cpl | Builds trust before the themes |
| 4 | `#themes` | Five feature blocks. Each has a big numeral, a JP title with an EN subtitle, a 2-line description and **3 planned series titles marked 「準備中」**. Theme 02 carries a bordered note: 「一般的な健康情報です。診断・治療は医療機関へ」 | 3.5 | Numbered list, alternating alignment | Series titles create anticipation; the numerals pull the reader to 05 |
| 5 | `#areas` | 大阪エリアガイド: 6 cards (キタ, ミナミ, 中之島・北浜, 天王寺・阿倍野, 京橋・大阪城, ベイエリア). Each card has its character in one line, 「こんな日に」 and main stations | 0.7 | Horizontal scroll-snap cards; the next card peeks in by 15% | Swiping keeps people on the page; readers look for their own area |
| 6 | `#calendar` | 大阪の季節カレンダー: festivals (十日戎, 造幣局桜の通り抜け, 天神祭, 岸和田だんじり祭, 光の饗宴…) plus health notes per season (花粉, 熱中症, 乾燥・感染症). The current season is expanded and each month is a `<details>` | 1.0 | **Bento grid** 2×2; the current season spans 2 columns | Readers jump straight to "what's on now"; the content changes every season, which brings return visits |
| 7 | `#unwell` | 体調がすぐれないとき: 119 / #7119 救急安心センターおおさか / #8000 小児 / 医療情報ネット / 休日・夜間急病診療所 / 大阪中毒110番 / こころの健康相談. Each entry has `tel:` and official links, and the box ends with a not-medical-advice line | 0.9 | Mode A dense card list; 「迷ったら119」 at the top | Highly useful, and the block people forward to family on LINE |
| 8 | `#checklist` | 大阪暮らしチェックリスト, about 12 items in 3 groups: 防災 (南海トラフ, おおさか防災ネット), 医療 (かかりつけ医, マイナ保険証, 検診), 暮らし (ごみ分別, 自転車保険義務). Checkbox state is saved in localStorage | 1.2 | Grouped checkbox list | Progress makes people want to finish, and they come back to it |
| 9 | `#policy` | 編集方針・運営者情報: operator, contact address (plain text), sources policy, health-info policy, ad policy, privacy and external transmission (外部送信) notice | 0.8 | Plain text, small Gothic | E-E-A-T and trust |
| 10 | Footer | 最終更新日, a share button, ページ上部へ, © | 0.4 | — | — |

The whole page runs about 11 screens. Every number and date in sections 6–8 must be verified against official sources before launch, and again every April.

## 2. Engagement without a funnel
- **Navigation like a magazine.** The sticky 「目次」 button opens a native `<dialog>` holding the contents list. A 2px reading-progress hairline uses CSS `animation-timeline: scroll()`, with no JS.
- **Anticipation.** The 15 「準備中」 series titles plus the 「創刊準備号」 issue label signal that more is coming. Don't promise dates.
- **Seasonal freshness.** `data-season` on `<html>` is set from the current month by a 5-line inline script (default `autumn`). It swaps the accent tokens and opens the matching calendar season. A visible 最終更新日 shows the page is maintained.
- **Personal state.** The checklist progress (「12項目中 5項目チェック済み」) gives readers a reason to come back. It is stored per device only.
- **Deep-link sharing.** Each utility section has a small 「この項目のリンクをコピー」 that copies the URL with its `#id`. The footer share uses the Web Share API, with a copy-link fallback. No third-party share widgets.
- **Never:** pop-ups, sticky bottom bars, exit intent, autoplay, follow prompts, carousels that move on their own, or "続きを読む" truncation. Social account links go in the footer as plain text, and only once the accounts exist.

## 3. Future bridge to Osakadou.cool (pattern only; do not build now)
1. **Where.** Store links appear only on individual health *article* pages, never on this LP or on theme overviews. They sit in one fixed box **after** the article body and its sources, never inside text about symptoms or efficacy.
2. **The box.** A bordered block labelled 「PR」 that meets contrast requirements, headed 「関連サービスのご案内（当サイトと同じ運営者が運営）」. It contains one sentence of disclosure, the link with `rel="sponsored noopener"`, and a link to 厚生労働省's 「医薬品等の個人輸入について」 in the same box.
3. **Where it may point.** Only to the store's top page or its pages about individual import (個人輸入) and safety. **Never to product pages, and never naming a drug.** A link from editorial content to unapproved-drug listings risks being treated as advertising of unapproved drugs under 薬機法 Art. 68. **Get legal review before the first link goes live.**
4. **Pre-commit now.** Section 9 states: 「将来、運営者の関連サービスを紹介する場合は必ず『PR』と明記し、記事の内容判断には関与させません」. It does not name or link the store.

## 4. SEO / technical spec
- `<html lang="ja">`, `<link rel="canonical" href="https://osakadou.live/">`
- **title:** `OSAKA LIVE｜大阪の暮らし・健康・美容をもっと身近に` (28 characters)
- **meta description:** `OSAKA LIVEは、大阪で暮らす人のためのWebマガジン。街の暮らし、健康・医療の基礎知識、美容・ウェルネス、ひと・カルチャー、暮らしのガイドの5テーマで、大阪の毎日に役立つ情報をお届けします。`
- **Headings**
  - H1 (one only, tategaki in the cover): 大阪の暮らし・健康・美容を、もっと身近に。
  - H2: この号の目次 / 編集部より / 5つのテーマ / 大阪エリアガイド / 大阪の季節カレンダー / 体調がすぐれないときの相談先 / 大阪暮らしチェックリスト / 編集方針・運営者情報
  - H3: each theme (「01 大阪の暮らし」…), each area, each season, each resource group, each checklist group
- **JSON-LD:** one `@graph` containing:
  - `WebSite` (name, alternateName 「オオサカライブ」, url, inLanguage `ja`, publisher)
  - `Organization` (name, url, logo, `publishingPrinciples` → `#policy`, `sameAs` once social accounts exist)
  - `WebPage` (`about`: `City` Osaka, `dateModified`)
  - **No FAQPage:** Google limits FAQ rich results to government and health-authority sites.
  - **No ItemList:** the themes have no URLs yet. Add `ItemList`/`CollectionPage` when the category pages launch.
  - **No SearchAction:** the site has no search.
- **OGP:** `og:type=website`, `og:locale=ja_JP`, `og:site_name=OSAKA LIVE`, title and description (description about 80 characters), a 1200×630 cover image (tategaki headline, text kept inside the centre 1000×530), `twitter:card=summary_large_image`. LINE and X both read these tags.
- **Performance budget**
  - Under 200KB compressed for the first view.
  - HTML plus inline critical CSS under 60KB; JS under 10KB with no framework.
  - Noto Serif JP for headings only, subset to the glyphs actually used, **keeping the `vert`/`vrt2` features** (vertical-text glyph forms), at or under 60KB woff2 with `font-display: swap`. Body text uses the system Gothic stack.
  - LCP under 2.0s on mobile 4G (the LCP element should be the H1 text), CLS under 0.05, INP under 150ms. Lighthouse mobile score of 95 or more.
- **Accessibility**
  - Contrast at least 4.5:1 for body and 3:1 for large text and UI. Check **every** seasonal token against both backgrounds.
  - Tap targets at least 44×44px with 8px gaps.
  - Body text 16px, line-height 1.7, letter-spacing 0.05em, about 32 characters per line.
  - `prefers-reduced-motion`: turn off the progress bar, smooth scroll and reveals. Content must never depend on an animation to become visible.
  - Scroll cards: the region gets `role="region"` plus `aria-label` and is keyboard-focusable.
  - Digits inside tategaki use `text-combine-upright`.
  - Landmarks and a skip link.

## 5. Analytics plan (privacy-light)
**Tools:** Umami Cloud (cookieless, custom events, under 2KB, no consent banner needed) plus Google Search Console for queries. List both in the 外部送信 notice in `#policy`. Use no IDs and no fingerprinting.

| Event | Trigger | Props |
|---|---|---|
| `scroll_depth` | IntersectionObserver sentinels at 25/50/75/100% | `pct` |
| `section_read` | Section at least 50% visible for 3s or more, once per section | `id` |
| `engaged_time` | 30 / 90 / 180s of visible-tab time | `s` |
| `toc_click` | A contents or cover-line anchor is clicked | `target` |
| `outbound_click` | A link to an official site is clicked | `domain`, `section` |
| `tel_tap` | A resource number is tapped | `resource` only |
| `calendar_open` | A month is expanded | `month` |
| `areas_end` | The last area card is reached | — |
| `checklist_tick` | An item is checked (count only) | `group` |
| `share` | The share button or a copy-link is used | `method`, `section` |
| `return_visit` | A localStorage flag is already present, once per session | — |

**Quality targets (share of sessions):** 75% scroll ≥35%; 90s engaged ≥30%; `section_read` on `#unwell`/`#checklist` ≥25%; `return_visit` ≥10%. Segment by referrer (Google, Instagram, t.co, direct; LINE's in-app browser often lands in direct). Review monthly.
