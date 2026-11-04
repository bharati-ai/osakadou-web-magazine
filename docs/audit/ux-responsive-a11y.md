# UX, responsive and accessibility audit (WCAG 2.2 AA)

**Auditor:** UX/UI and accessibility (Japanese market). **Date:** 2026-11-04.
**Target:** production build at `http://localhost:3200`. Nothing in the project was changed except this file. I created no posts, media or categories.

## Method

- chrome-headless-shell 1234, driven over CDP from node scripts. The scripts are in the scratchpad `ux` folder (listed at the end).
- **Viewports:** 375×812 (mobile emulation with touch), 768×1024 and 1280×800.
- **Themes:** light and dark, set with `Emulation.setEmulatedMedia` (`prefers-color-scheme`). `prefers-reduced-motion: reduce` was tested separately.
- **Pages:** 8 public pages × 3 viewports × 2 themes, which makes 48 runs. 4 admin pages × 375/1280 × 2 themes, which makes 16 runs (admin cookie set over CDP).
- **Checks run on every page:**
  - `scrollWidth` against the viewport width, plus the offending elements;
  - tap-target sizes;
  - heading outline and landmarks;
  - `img` alt text;
  - form labels;
  - ARIA references, duplicate ids, `aria-hidden` on focusable elements, and `aria-label` on elements that cannot take one;
  - computed text contrast (alpha and opacity composited);
  - Japanese line breaks, measured per character with `Range.getClientRects` to find kinsoku violations and orphan lines in headings;
  - article metrics.
- **Text over photos:** a second screenshot was taken with all text set to `color: transparent`. The background was then sampled under each text box, and the 95th percentile of its luminance (the worst case) was compared with the text colour.
- **Keyboard:** real `Tab`/`Shift+Tab`/`Enter`/`Escape`/arrow-key events. At each stop I recorded the focused element, its outline and whether it was obscured (`elementFromPoint`) or hidden under the sticky header. Where a fix seemed obvious, I tested it live by injecting CSS and measuring again.
- **Limitations:**
  - Only Chromium was used. **Safari and Firefox line breaking was simulated** by forcing the fallback value that those browsers get, because they do not support `word-break: auto-phrase`.
  - No real screen reader was used.
  - Text shadows were ignored in the pixel contrast test.

> **Build vs source.** The production build predates source edits made on 2026‑11‑04 between 10:53 and 11:12 (`app/article.css`, `components/blog/*.tsx`, `app/(site)/tools/page.tsx`, `components/tools/tool-shell.tsx`, `components/admin/post-form.tsx`, `lib/cms/html.ts` and others). Some live issues are already fixed in source: the listing heading skip h1→h3 (`listing.tsx:61` now has an sr-only `<h2>`), the tool breadcrumb text and label, `.phrase` on TOC links, and the hidden duplicate same-day 最終確認日. I **re-checked every finding below against the current source**. All line numbers are current.

## Findings

Severity: **P0** blocker · **P1** fix before launch · **P2** nice to have. The screenshot ids [S#] are listed in the index at the end.

| ID | Sev | Location | Problem (evidence) | Concrete fix |
|---|---|---|---|---|
| UX-01 | **P1** | `components/admin/post-form.tsx:151-152`, `app/admin/(panel)/page.tsx:51` | **The admin editor overflows horizontally.** `scrollWidth` is **603 px at 375** and **1495 px at 1280**. The admin dashboard is **499 px at 375**. On phones the title, toolbar and body are cut off and mobile Chrome zooms out [S6][S8]. At 1280 the right column runs about 215 px off-screen [S7]. Root cause: `truncate` (`white-space:nowrap`) on the SEO-preview lines and on the recent-post links, inside CSS grids with `auto` tracks. The grid track grows to the full title length. The overflow grows with title length, so long titles break laptops wider than 1280 too. | Replace `truncate` with `line-clamp-1` in all 3 places. **Verified live:** 603→375, 1495→1280, 499→375. As a belt-and-braces measure, also set `post-form.tsx:38` to `"grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"` and `:68` to `"grid min-w-0 grid-cols-1 content-start gap-4"`. |
| UX-02 | **P1** | `components/admin/post-form.tsx:69-95` (公開 card), `:38` (form) | **The writer cannot find 保存する, and unsaved work can be lost.** Below 1280 the form is a single column. The save button sits at **y = 10,271 px of a 14,011 px page**, after the 9,355 px editor. At 1280 and above it is not sticky, so it scrolls away while you write. There is no `beforeunload` guard (`window.onbeforeunload === null`, and no listener in the code). `PageForm` shows 未保存 but `PostForm` does not. | Add an action bar for small screens after `<RichEditor>` (line 65): `<div className="sticky bottom-0 z-20 -mx-4 flex gap-2 border-t border-line bg-card/95 px-4 py-3 backdrop-blur xl:hidden"><Submit>保存する</Submit>{values.id && <a href={…preview} target="_blank" className={btnGhost}>プレビュー ↗</a>}</div>`. On wide screens make the 公開 card `xl:sticky xl:top-4`. Track changes with `<form onInput={() => setDirty(true)}>`; `input` events also bubble from the contenteditable. Reset `dirty` when `state.ok` is set. Add `useEffect(() => { if (!dirty) return; const h = (e: BeforeUnloadEvent) => e.preventDefault(); addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [dirty])` and show 「未保存の変更があります」 next to the button. |
| UX-03 | **P1** | `app/(site)/tools/page.tsx:28` | **The header photo covers the /tools category pills** in every viewport and theme. The nav uses `-mt-6` but is not positioned, so the `relative isolate` header paints over the top half of each pill. Pixel contrast of the pill labels is 1.04–1.16:1 [S1][S2]. | `className="wrap relative z-10 -mt-6 flex snap-x scroll-px-[clamp(16px,4vw,40px)] gap-2 overflow-x-auto pb-2"`. The scroll padding also fixes UX-12. |
| UX-04 | **P1** | `components/home/features.tsx:21,23-24` | **Text over photos on the home feature tiles fails contrast** in both themes. Titles (18 px bold, so 4.5:1 is required) measured a **median of 3.6–3.8:1 and a worst case of 2.4–3.0:1 at 1280** for 「大阪の『ふだん』を歩く」, 「使える、無料ツール」 and 「近所のお医者さん」. The pink ordinals `#ffb7a6` measured **1.2–2.4:1**; 「04」 almost disappears on the cosmetics photo [S3]. The scrim `via-night/35` is too thin where the text sits. | Line 21: `bg-gradient-to-t from-night/90 via-night/70 via-45% to-night/10`. At 70 % night over a pure-white pixel, white text is 5.95:1 and `#ffb7a6` is 3.96:1 (computed). Keep the ordinal inside the scrimmed area, or drop it to `text-on-night/90`. |
| UX-05 | **P1** | `app/globals.css:91-94`; `components/tools/life/osaka-map.tsx:11,150`; `components/tools/wellness/shared.tsx:43`; `components/home/weather-live.tsx:85` | **`prefers-reduced-motion` does not freeze infinite animations.** The comment says the weather layers are frozen, but the 0.01 ms override keeps `iteration-count: infinite`. Under `reduce`, `document.getAnimations()` shows `wx-glow` (the sun on today's clear-day home page) **running, 0.01 ms × ∞**. A test `.wx-rain` layer jumped between background positions frame by frame, which shows as flicker. `animate-pulse` skeletons behave the same way. The carousel itself is fine: autoplay stays off under `reduce`, and the pause button works. | `@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important } .wx-rain,.wx-snow,.wx-sun,.wx-stars { animation:none!important } }`, plus `motion-reduce:animate-none` on each `animate-pulse`. |
| UX-06 | **P1** | `app/article.css:92-97` | **Article tables are hard to read at 375.** `min-width:480px` squeezes 4 columns into a 341 px scroller. The first column wraps one character per line (「プラ/ス/チック資/源」, 「古/紙・/衣類」), and column 4 is hidden with no scroll hint (scrollbars are hidden on mobile) [S4]. | `.ol-article table{min-width:0}` · `.ol-article table:has(tr>:nth-child(3)){min-width:520px}` · `.ol-article table:has(tr>:nth-child(4)){min-width:640px}` · `.ol-article tr>:first-child{min-width:7em}`. For the scroll hint, give `.ol-article .ol-table` a background of `linear-gradient(to right,var(--card) 30%,transparent) left/40px 100% no-repeat local, linear-gradient(to left,var(--card) 30%,transparent) right/40px 100% no-repeat local, radial-gradient(farthest-side at 100% 50%,rgb(0 0 0/.18),transparent) right/14px 100% no-repeat scroll, var(--card)`. A live preview is in [S5]. |
| UX-07 | **P1** | `app/globals.css:80-88` | **Heading line breaking in Safari and Firefox (simulated).** These browsers do not support `auto-phrase`, so they fall back to `word-break:keep-all` plus `overflow-wrap:anywhere`. Because Japanese text has no spaces, keep-all leaves only emergency breaks, and those ignore kinsoku. Forcing the fallback at 375 gave: home h2 「大阪の天気と季節カレンダ｜ー」 (a lone ー on its own line), 「体調がすぐれないときの相｜談先」, article h3 「引っ越しや大掃除のときは早｜めに」 and h1 「中之島のミュージアムめぐ｜り」. iPhone is the main device in Japan. Chrome, with `auto-phrase`, renders these well. | **Option A (no new dependency):** drop `word-break:keep-all` and use `overflow-wrap:break-word` (not `anywhere`) on h1–h4, keeping the `@supports (word-break:auto-phrase)` block. Simulated with `normal`, this removed every kinsoku violation and orphan line; ordinary mid-word wraps remain. **Option B:** insert `<wbr>` at phrase boundaries on the server with BudouX (the same model as Chrome's `auto-phrase`), then keep `keep-all`. This adds the `budoux` dependency, which needs approval. |
| UX-08 | **P1** | `components/tools/fields.tsx:17`; `components/tools/wellness/hikkoshi-tetsuzuki.tsx:142`; `components/tools/wellness/suimin-cycle.tsx:63`; `components/tools/culture/osaka-ben.tsx:48`; `components/admin/ui.tsx:5-6` | **Form fields fail the non-text contrast rule (WCAG 1.4.11).** The field border is `--line`, which is **1.31–1.38:1** against paper or card in light mode and 1.26–1.44:1 in dark mode. The field fill is `bg-paper` on `bg-card` (1.04:1). The BMI, map and other tool inputs barely read as boxes. | Add a token: `:root{--line-strong:#8a8f98}` (3.19:1 on card) and in dark mode `--line-strong:#6b7383` (3.26:1). Use `border-[var(--line-strong)]` on form controls only, and keep `--line` for decorative rules. |
| UX-09 | P2 | `components/blog/article-view.tsx:99` | **The mobile TOC is open by default** and 547 px tall (12 items), so the article body starts at **y = 1,210 px** at 375×812, about 1.5 screens down [S11][S12]. | Remove `open` and keep the summary 「この記事の目次（12）」. Optionally add a floating 「目次」 button after the first h2. |
| UX-10 | P2 | `components/blog/article-view.tsx:130,156` | The sticky desktop TOC is 662 px tall in an 800 px viewport and has no `max-height`. Longer articles will cut it off. There is no current-section highlight. | `className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto …"`. Add an IntersectionObserver that sets `aria-current="location"` and `text-shu-ink` on the active link. |
| UX-11 | P2 | `lib/cms/render.ts:14-29`; `components/tools/health/parts.tsx:127-129` | The `.ol-table` scrollers have no `tabindex`, role or name. Chrome auto-focuses scrollers, but Safari does not, so keyboard users there cannot scroll the table. In the BMI average table, part of the `<caption>` scrolls out of view [S21]. | In `renderArticle`: `out = out.replace(/<div class="ol-table">/g, '<div class="ol-table" role="region" tabindex="0" aria-label="表（横にスクロールできます）">')`. In `parts.tsx`, move the caption outside the scroller as a `<p>` and add `role="region" tabIndex={0} aria-label={caption}` to the wrapper. |
| UX-12 | P2 | `components/blog/listing.tsx:42`; `app/(site)/tools/page.tsx:28` | `snap-start` pills without scroll padding: on load, the nav is scrolled 16 px (`scrollLeft:16`) and the first pill sits on the screen edge with its left border clipped [S14]. | Add `scroll-px-[clamp(16px,4vw,40px)]`, the same approach `themes.tsx` already uses. |
| UX-13 | P2 | `components/home/features.tsx:24`; `app/article.css:146` (`.ol-linkcard__title`); `components/home/themes.tsx` card titles | Titles that are not headings get no phrase wrapping. Examples: tile 「ごみの日、いつやったっ｜け？」 and sub 「相談｜先の一覧」 at 1280 [S3]; link card 「大阪で引っ越したときの手｜続き一覧」 [S15]. | Add `phrase [text-wrap:balance]` to these spans, and add `word-break:auto-phrase; text-wrap:balance` to `.ol-linkcard__title`. |
| UX-14 | P2 | `components/home/weather-live.tsx:149,188`; `components/home/areas.tsx:30`; `components/admin/post-form.tsx:150`; `components/tools/wellness/shared.tsx:43` | **ARIA misuse:** `aria-label` on `<p>` and `<div>` (generic roles), which screen readers ignore, so the 「5段階中N」 levels are lost. Phosphor SVGs have `aria-label` but no `role="img"`, so the 7-day forecast reads temperatures without the weather. | `<p role="img" aria-label=…>`; `<DIcon role="img" aria-label=… />`; for the Train icon use `aria-hidden` plus `<span className="sr-only">主な駅：</span>`; the SEO preview gets `role="group"`; `shared.tsx` uses `role="status"`. |
| UX-15 | P2 | `components/admin/media-picker.tsx:75-77,89` | **Incomplete tab pattern:** `role=tablist`/`tab` with no `tabpanel`, no `aria-controls` and no arrow keys. The library search field is labelled only by its placeholder. | Either use a segmented control (`<button aria-pressed>`, no tab roles) or complete the APG tabs pattern. Add `aria-label="画像を検索"` to the search field. |
| UX-16 | P2 | `components/admin/editor.tsx:122,153,181,207,223-226,322,335` | **Editor toolbar for non-technical writers:** 22 buttons and 2 selects, each a separate Tab stop (no `role="toolbar"`, no roving tabindex). Buttons are 32 px. Labels are symbols, emoji or English (`B I U S M </> 🔗 🖼 ≡ ⇥ HTML`) and are explained only by `title`, which does not show on touch. 「HTML」 and 「コード」 are always exposed. The body has `outline-none` and the wrapper does not react to focus. The contenteditable inherits Chrome's UA `line-break:after-white-space`, so lines start with 「ー」/「っ」 in the editor but not on the public page. | `role="toolbar" aria-label="書式"` with roving tabindex; `h-10 min-w-10`. Show text labels next to icons for 見出し / 太字 / リンク / 画像 / 表 / 囲み, and move HTML and コード into a 「詳細」 menu. Wrapper: `focus-within:border-shu focus-within:ring-2 focus-within:ring-shu/25`. Editor class: add `[line-break:strict]`. |
| UX-17 | P2 | `components/admin/status-badge.tsx:7,9`; `components/admin/ui.tsx:11`; `app/admin/(panel)/posts/page.tsx:48` | **Admin contrast.** 公開中 is **4.28:1** in light mode and **2.72–2.89:1** in dark mode. The 完全に削除 button text is **2.53:1** in dark mode [S18]. In the posts table, badges wrap to 「公開｜中」 and 「下書｜き」 [S10]. | Badge: `text-[#1b5e20] dark:text-[#81c995]` (6.56 and 7.58:1) plus `whitespace-nowrap`. `btnDanger`: add `dark:border-[#ff8a80] dark:text-[#ff8a80]` (6.81:1). |
| UX-18 | P2 | `app/admin/(panel)/layout.tsx:19`; `components/admin/nav.tsx:23`; `app/admin/(panel)/posts/page.tsx:47-48`; `components/admin/page-form.tsx:105` | **Mobile admin.** Logout and the user block are `hidden … lg:block`; on phones the only way out is the アカウント page. 6 of the 10 nav items scroll out of view with no hint. The posts table has `min-w-[720px]`, so status and date need a horizontal scroll. The 変更メモ field in the sticky bar shrinks to **34 px** at 375 (`flex-1` with basis 0) [S9]. | Show a small ログアウト link in the mobile header row and add an edge fade on the nav. Below `md`, render posts as cards (title, badge, date). Note field: `className={`${input} min-w-0 basis-full sm:basis-auto sm:max-w-[360px] sm:flex-1`}`. |
| UX-19 | P2 | `components/admin/page-form.tsx:106-107` | 「保存して公開」 publishes immediately. 「ページを見る」 opens the live page, not the unsaved draft, so a writer cannot preview the change first. | Add a 「プレビュー」 that renders the unsaved data, or at least use `ConfirmSubmit` with 「公開ページにすぐ反映されます。よろしいですか？」. |
| UX-20 | P2 | Several locations | **Tap targets under 44 px** (they all pass WCAG 2.5.8's 24 px minimum or its spacing exception): carousel buttons 40 px (`hero-carousel.tsx:64,70,88`), weather chips 32 px (`weather-live.tsx:201-203`), footer links 32 px, tel 「つながらないとき」 links 32 px, theme series links 38 px, sub-category pills ~34 px (`listing.tsx:52-54`), category pills 40 px, breadcrumbs 16–17 px, Leaflet zoom 30 px. | `size-11` for carousel buttons; `min-h-11` (or `py-2.5`) on chips and pills; `py-3` on footer links; breadcrumb links `inline-block py-2`. |
| UX-21 | P2 | `components/site-footer.tsx:41` | Photo credits are 10 px at `text-on-night/40`, which is **3.54:1**. | `text-[11px] text-on-night/70` (8.29:1). |
| UX-22 | P2 | `components/home/themes.tsx:25-27` | Each theme card has two links to the same URL: an image link whose name is only 「01」 plus the alt text, and a title link. That is an extra Tab stop per card. The white ordinals measure 1.3–1.8:1 on bright photos (decorative). | Give the image link `tabIndex={-1} aria-hidden="true"`, or stretch the title link over the card. Put the ordinal on a small `bg-night/70` chip. |
| UX-23 | P2 | `components/blog/article-view.tsx:80` | Even in Chrome, the 375 px h1 breaks mid-word: 「中之島のミュージ｜アムめぐり」. At 26 px with 0.06 em tracking, the phrase is longer than the line. | `text-[clamp(23px,6.2vw,38px)] tracking-[0.03em] md:tracking-[0.06em]`. Long titles still benefit from UX-07 option B. |
| UX-24 | P2 | `components/tools/life/leaflet-map.tsx:14` | `flyTo` animates even under reduced motion. | `const animate = !matchMedia("(prefers-reduced-motion: reduce)").matches; map.flyTo([...], 17, { animate, duration: 0.6 })` |
| UX-25 | P2 | `components/menu-sheet.tsx:17`; `components/home/tabs.tsx:30-31`; `components/share-button.tsx:23` | MENU has `aria-haspopup` but no `aria-expanded` or `aria-controls`. The tabs have no Home/End keys. `aria-live` sits on the focusable share button itself. | Add `aria-controls="menu-sheet"` and `aria-expanded` from the dialog's open state; handle `Home`/`End` in `onKeyDown`; announce through a separate `<span role="status" className="sr-only">`. |
| UX-26 | P2 | `components/tools/life/osaka-map.tsx:177-184`; `components/tools/tool-shell.tsx:87` | Every result repeats the link text 「地図アプリで開く」. The map tool also gets the generic heading 「使い方・計算のしくみ」 although it calculates nothing. | `<span className="sr-only">{p.name ?? label}を</span>地図アプリで開く`. Add a `aboutTitle` prop (for the map, 「使い方・データについて」). |
| UX-27 | P2 | `components/blog/listing.tsx:38,52`; `app/(site)/blog/category/[cat]/page.tsx` (`en="Category"`) | **Consistency with the magazine design.** Category pages all use the generic subtitle 「Category」 (the home page has a descriptive Latin subtitle per section). The listing header is a plain band, while /tools and every tool page have photo headers. The sub-category 「すべて」 has no `aria-current`. | Store an English subtitle per category (for example 「Health & Medical」). Add the existing `.wagara-strip` under the listing band, or a photo band like /tools. Add `aria-current={!sub ? "page" : undefined}` at line 52. |
| UX-28 | P2 | `components/admin-bar.tsx:21` | For signed-in editors only: the fixed pill (32 px tall) covers the bottom-left of content and the footer meta at 375 [S17]. | `bottom-[max(12px,env(safe-area-inset-bottom))]`, make it collapsible, and use `py-2.5` for 44 px. |
| UX-29 | P2 | `components/home/weather-live.tsx:96` | In dark mode the live-weather block stays a bright sky photo with white/70 panels, a large glare area on a dark page [S16]. Contrast passes. | Optional: in dark mode use the existing `dark` panel styling (`bg-night/45`) together with a dimmed photo (`opacity-60`). |

**Passed checks (no action):**
- **Keyboard:**
  - The skip link 「本文へ移動」 is the first Tab stop and becomes visible.
  - The global `:focus-visible` ring (2 px 朱, 5.4:1 on paper) was present on all 60 stops of the home Tab walk, including Shift+Tab.
  - Focus is never hidden under the sticky header; `scroll-padding-top:76px` works (WCAG 2.4.11).
  - The MENU dialog is modal, moves focus to 「メニューを閉じる」, keeps focus inside, closes on Esc and returns focus to MENU [S19].
  - The tabs use a roving tabindex with arrow keys.
  - A TOC jump lands the heading at 198 px, below the 65 px header.
- **Semantics and forms:**
  - One `<main>` and labelled sections.
  - Exactly one h1 per page, and no heading skips in current source.
  - Every `<img>` has alt; alt text is descriptive Japanese, and decorative thumbnails use `alt=""`.
  - Every public form control is labelled, and tool results use `aria-live`.
- **Layout and typography:**
  - No public page overflows horizontally at 375, 768 or 1280.
  - Kinsoku in body text is correct (`line-break:strict`): 0 violations across all public pages.
  - Desktop reading measure is 40 characters per line at 17 px / 2.0; mobile is 20 characters at 16 px.
- **Colour:**
  - The light and dark token pairs pass: `ink-2` on band 6.97:1 light and 7.88:1 dark; `on-shu` on shu 5.76:1 light and 6.37:1 dark.

## Scores (1–10)

| Parameter | Score | Why |
|---|---|---|
| Responsive layout, public | 7 | No overflow anywhere. Docked by the /tools pill overlap (UX-03) and the mobile tables (UX-06). |
| Responsive layout, admin | 3 | The editor overflows at 375 and 1280, the dashboard at 375, and the note field is crushed. |
| Japanese typography and line breaking | 6 | Excellent in Chrome (`auto-phrase`, strict kinsoku). Weak in the Safari fallback, in tables and in non-heading titles. |
| Colour contrast, both themes | 6 | Strong tokens, but text over photo tiles, form-field borders and admin dark mode fail. |
| Keyboard and focus visibility | 8 | Global ring, skip link, correct dialog behaviour, no focus obscured. The editor toolbar and body are weak spots. |
| Landmarks and heading order | 8 | Clean outline. The listing h1→h3 skip is already fixed in source. |
| ARIA usage | 7 | Good carousel, tabs and dialog. Misused labels on generic elements and SVGs; incomplete media-picker tabs. |
| Images and alt text | 9 | All present and descriptive. |
| Forms and labels | 7 | Public forms are well labelled. Field boundaries fail 1.4.11, and some admin fields are placeholder-only. |
| Tap targets | 6 | WCAG 2.2 AA (24 px) passes, but many targets are 32–40 px against the 44 px goal. |
| Reduced motion | 5 | Carousel and smooth scroll are handled; the infinite animations are not frozen. |
| Article reading experience | 7 | Good type, measure and link cards. Mobile TOC and tables hurt. |
| Consistency with the magazine design | 8 | Same tokens, pills, hard shadows and maru headings. Category and listing headers are plainer. |
| Admin usability for a non-technical writer | 4 | Hidden save button, no unsaved-changes guard, symbol-only toolbar, overflow on tablets and phones. |

## Summary

The public magazine is in good shape for accessibility. Focus handling, the dialog, tabs, landmarks, alt text and Japanese kinsoku in Chromium are all better than typical Japanese media sites, and the blog matches the home page's OSAKA-INFO style.

**Before launch, fix the 8 P1s:**
- Two visible layout and contrast defects on key public pages: the /tools pills covered by the header (UX-03) and the photo-tile text (UX-04).
- Mobile tables (UX-06).
- The reduced-motion override that does not stop infinite animations (UX-05).
- Form-field boundaries (UX-08).
- The Safari/Firefox heading fallback (UX-07). This one is simulated, so check it on a real iPhone after the fix.
- On the admin side, the editor overflow (UX-01) is a one-class change per element, verified live. The hidden save button with no unsaved-changes guard (UX-02) is the change that most protects a non-technical writer's work.

P0: 0 · P1: 8 · P2: 21.

## Screenshot index

All files are in `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\`. The full path of each file:

- S1 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\tools-1280-light.png`: /tools pills covered by the header
- S2 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\tools-375-dark.png`: the same at 375, dark
- S3 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\el-features-1280-light.png`: feature tiles (contrast, line breaks)
- S4 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\el-art-table-375-light.png`: table at 375, before
- S5 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\fixprobe-table-375.png`: table with the proposed CSS (live injection)
- S6 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\admin_posts_1-375-light.png`: editor overflowing at 375
- S7 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\editor-focus-1280.png`: editor at 1280, scrolled sideways by the overflow
- S8 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\admin-375-light.png`: dashboard overflowing at 375
- S9 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\admin_pages_home-375-light.png`: crushed 変更メモ field
- S10 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\admin_posts-1280-light.png`: badges wrapping
- S11 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\blog_osaka-gomi-bunbetsu-375-light.png`: article above the fold
- S12 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\el-art-toc-375-dark.png`: open mobile TOC
- S13 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\art-1280-scrolled.png`: desktop reading view with the sticky TOC
- S14 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\blog-375-dark.png`: category pill flush with the screen edge
- S15 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\el-art-linkcard-375-light.png`: link card
- S16 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\el-weather-375-dark.png`: weather block in dark mode
- S17 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\adminbar-375.png`: editor bar overlap
- S18 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\admin_posts_1-1280-dark.png`: dark admin editor
- S19 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\menu-375-dark.png`: menu dialog
- S20 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\home-375-light.png`: home above the fold
- S21 `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\shots\el-tool-form-375-dark.png`: BMI tool, dark (caption cut, field borders)

The folder also holds a viewport screenshot for every page × viewport × theme (`<page>-<w>-<theme>.png`), full-page shots for the blog and admin pages, and element crops (`el-*.png`).

**Raw data:** `C:\Users\ADMINI~1\AppData\Local\Temp\claude\b00d740e3749566b\1a7f90c8-7bcc-46d8-938c-5564c2a1cf5f\scratchpad\ux\data\` contains:
- `pub-home.json`, `pub-rest.json`, `pub-rest2.json` and `pub-rest3.json`: the public runs;
- `admin.json`: the admin runs;
- `keys.json` and `keys2.json`: the keyboard walks;
- `probe-admin.json`, `probe-lines.json` and `probe-fix.json`: the targeted probes.

The scripts (`audit.js`, `cdp.mjs`, `run-*.mjs` and `probe-*.mjs`) are in the parent `ux` folder.
