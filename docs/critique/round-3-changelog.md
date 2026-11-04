# Round 3 → Round 4 changelog (2026-10-31)

## Marketing (brand 7) and jp-market (D1)
- **Header nav:** now numbered in the same order as the cover lines and the 目次: 01 エリア→#areas, 02 相談先→#unwell, 03 カレンダー→#calendar, 04 チェックリスト→#checklist, 05 連載→#themes. The `aria-label` is 「セクション」.
- **Fit at 960px:** the 目次 button and the logo no longer shrink, and the logo's small subtitle is hidden from 960 to 1199px, so the header stays on one line. Verified at 960px: no overflow, and the button is a single 44px line.
- **Month ranges:** rows like 「7〜8月」 are skipped by the 今月/もうすぐ tagging and by the cover-line 03 lookup, which fixes the June double-tag bug.
- **Share and copy fallback:** copies 「OSAKA LIVE｜大阪で、暮らす。」 plus the URL. `og:image:alt` uses the new deck.

## jp-market (typography 7)
- **T1:** `.lede{word-break:auto-phrase;text-wrap:balance}` at every width.
- **T2:** `.check-grp label>span{word-break:auto-phrase}`.
- **T3:** the 06 fallback lines now put the hours on their own line (`<br><span class="nw">…</span>`), so there is no stray full-width space.
- **目次 05:** the description now says 「…ガイドの、15の連載。」.
- **Footer:** 「大阪の暮らし・健康・美容・カルチャーを届けるWebマガジン。」, which removes the third 「住む人のため」.

## Webdev
- **P1, cover photo:** a `<picture>` with art-directed CDN crops.
  - Phones get 2:3, `crop=bottom`, q45, at 400w (89 KB AVIF) or 540w (about 150 KB).
  - Desktop gets a square at q50, 600w (136 KB) or 900w.
  - Widths are capped (no 800/1200), because the ginkgo texture compresses badly and pixel count is the lever.
  - The photo is preloaded from `<head>` with media-scoped `imagesrcset`/`imagesizes` and `fetchpriority="high"`.
- **P2, other photos:** q55, 400/600/800w candidates (beauty also gets 1200w), and real `sizes`:
  - area cards `(min-width:960px) 360px, 280px` (400w is 23 KB);
  - the note photo `300px / 340px` (400w is 60 KB);
  - theme photos `400px / calc(100vw - 32px)`.
- **Fonts:** the Google Fonts CSS is now inserted from the head script, so it never blocks first paint (`display=swap`). There is a `<noscript>` `<link>` fallback. *This is new, beyond your list: it targets the bimodal FCP you measured, 0.61 s with fonts blocked.*
- **A1, past months:** shown in `color:var(--ink-2)` with `font-weight:500` instead of `opacity:.45`, plus a screen-reader-only 「（終了）」.
- **A2, month ranges:** `lang="en"` is removed from the four ranges. `build.py` now asserts that no Japanese text carries `lang="en"`.
- **A3, brand in the accessibility tree:** the masthead is no longer `aria-hidden` (it is `lang="en"`), so 「OSAKA LIVE」 is in the tree at load.
- **A4, TOC sheet:** `.toc-in{min-height:100%}`.
- **B1, error failsafe:** narrowed to errors from our own inline script, before `window.__ol` is set at the end of `app.js`.
- **B2, Safari line breaks:**
  - `keep-all` on `.deck`, `.coverlines b` and `.series li`, upgraded to `auto-phrase` where supported;
  - `<wbr>` in the deck;
  - `.nw` on 「（19時〜翌8時）」 and 「（24時間）」 in the quick list.
- **Responsive, short phone screens:** `@media (max-width:599px) and (max-height:700px)` gives a smaller H1 and deck and a shorter photo box.
- **SEO, dates:** `build.py` stamps the build date into `dateModified`, the footer `<time>` and the `sitemap.xml` `lastmod`.
- **Code quality:**
  - the copy fallback shows only the URL;
  - `.cover h1` and `.area .kanji` are `font-weight:700`, matching the single loaded face.
- **Not done:**
  - P3: the series lists stay in the webfont. Marketing and jp-market want them in mincho on Android, which has no system mincho. The subset is about 80 KB but no longer render-blocking.
  - Deploy items: self-hosting fonts and photos, brotli and caching, a CSP hash, and a real-device `tel:#` test.
