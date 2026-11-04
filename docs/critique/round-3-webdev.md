# Round 3: senior web developer (`webdev`)

**Build measured.** `index.html` md5 `2d46eb3b…` (12:48:55, 2026-10-31). The file changed once while I was measuring (from `5781e871…` at 12:41). I re-ran perf, the sweep, the line-break checks, accessibility, no-JS and print on the final hash; the results match. The broken round-2 intermediate is not scored.

**Method.** chrome-headless-shell 1234 driven over CDP, with the same profile as round 1:
- 412×823 at DPR 1.75, 150 ms RTT, 1.44 Mbps down, 4× CPU, cache off;
- 7 runs, plus a fonts-blocked A/B, a "fast 4G iPhone" profile (390×844 at DPR 3, 40 ms, 9 Mbps, 1× CPU), and a request-rewrite simulation of the image fixes below.

Also checked:
- overflow sweep at 13 widths from 320 to 1920;
- accessibility tree, keyboard and focus;
- no-JS (scripts disabled) and print (emulated media);
- Safari simulation: every `auto-phrase` declaration dropped, so headings fall back to `keep-all` and other text to `normal`;
- dark mode (emulated `prefers-color-scheme`);
- console errors via `Runtime.exceptionThrown`.

Caveat: DevTools throttling splits bandwidth evenly across requests and ignores HTTP/2 priority, which exaggerates image contention. The hero-only figures below remove that effect.

## Scores

| Parameter | R1 | R3 | Evidence |
|---|---|---|---|
| performance | 5 | **4** | **What improved:**<br>- **Fonts are solved:** 2 files, 126 KB (Bodoni 46 + Noto Serif JP subset 80), against 33 files and 977 KB before. The CSS is 3 KB.<br>- **FCP median is 1.66 s** (0.90–2.79, bimodal on the third-party font connection), down from about 2.9 s. With fonts blocked it is 0.61 s.<br>- CLS is ≤ 0.0003 and there are no console errors.<br><br>**Regression: LCP is now the hero IMG at 8.6–9.8 s** (median 9.1 s), up from 3.0 s.<br>- **The new portrait hero downloads at full height:** `q=70&w=800` with no `h`, so 800×1433 and **546 KB AVIF**. On the iPhone-class profile it picks `w=1200` at **1.12 MB**, and LCP is 2.84 s even at 9 Mbps.<br>- **The page reorder put the area guide inside Chrome's lazy-load distance:** 9 images and **1.33 MB** load during the initial load.<br>- **First view is 1.54 MB in 14 requests.**<br><br>Simulating the image fixes below cut first view to 839 KB and LCP to 4.8 s. With the hero alone (208 KB), LCP is 3.2 s. |
| accessibility | 7 | **7.5** | **Round-1 items fixed and verified:**<br>- 119 focus ring is white on 朱, i.e. `rgb(255,255,255)` on `rgb(184,57,31)`.<br>- Phone numbers are bold Gothic, with no hairline `#`.<br>- Fallback tel links have padded targets and no longer show up in the under-44px tap-target scan.<br>- `lang="en"` is on the English labels.<br>- The dialog has `<nav aria-label="目次">`, 6 items, and focus goes to the close button. After a link, the next Tab lands inside the target section.<br>- Contrast holds in both themes.<br><br>**New defects:**<br>- **Dimmed past months fail 1.4.3.** `.ev .past{opacity:.45}` gives 9月 rows **2.07:1** (朱) and 2.74:1 (ink) in light mode, and **2.15 / 3.82:1** in dark.<br>- **Japanese text marked English.** `lang="en"` sits on 「3〜5月」「6〜8月」「9〜11月」「12〜2月」, so an English voice reads them.<br>- **No brand in the accessibility tree at load.** The masthead is `aria-hidden` and the header logo is `visibility:hidden` while it is on the cover. |
| responsive_mobile | 7 | **8** | **Good:**<br>- No overflow at any width from 320 to 1920. The masthead is 250 px at 320.<br>- The 04 numeral stays on one line.<br>- In the Safari simulation the headings phrase-break: 「体調がすぐれないときの／相談先」「大阪暮らし／チェックリスト」「中之島・／北浜」.<br>- The TOC sheet fits one screen (483 px of content).<br>- The landscape query works.<br><br>**Nits:**<br>- In Safari the non-heading display text still breaks mid-word: deck 「住む人の目／線で」「出典／を明記」, cover line 「どう探／す？」, series 「契約と相／談先」 (in Chrome too), and 「（19／時〜翌8時）」.<br>- At 390×560 (LINE) and 320×568 the H1 is cut and the cover lines start at y≈740–765. |
| technical_seo | 7 | **9** | All round-1 items are shipped and verified:<br>- `favicon.ico` (16/32/48), `favicon.svg`, `apple-touch-icon` at 180², `logo-512` and `og-cover.jpg` at 1200×630 (160 KB) all return 200 with the correct MIME type.<br>- `og:image:width/height/alt` are present.<br>- JSON-LD parses: `["Organization","NewsMediaOrganization"]` with logo, `correctionsPolicy` and `ethicsPolicy`, `City` with `sameAs` Q35765, and `primaryImageOfPage`.<br>- Title is 31 characters and the description 116.<br>- Descriptive anchors; one h1, and the h2 order matches the page. |
| code_quality | 7 | **8.5** | **Good:**<br>- A real build (`src/` → `build.py`) with asserts for `node --check`, subset glyph coverage (207/207 glyphs covered) and unfilled tokens.<br>- 0 `style=""` attributes, 0 inline handlers, 14/14 `noopener`.<br>- The contents list is cloned, not duplicated.<br>- Copy and share have reset and fallback paths.<br>- No-JS hides dead controls, and print shows all `.rv` blocks.<br><br>**Nits:**<br>- `lang="en"` is hand-applied, which is how the four Japanese spans slipped through.<br>- `font-weight:900` is declared with only a 700 face loaded.<br>- `.sr` is still unused. |
| robustness_compat | 6 | **7.5** | **Good:**<br>- `color-mix` `@supports` fallback, `dialog:not([open])` plus a `showModal` guard, and `100vh` before `100dvh`.<br>- IntersectionObserver fallback, phrase-wrapping via `keep-all` + `<wbr>`, and an error failsafe.<br><br>**Remaining:**<br>- **The failsafe is too broad.** Any later script error, such as an in-app-browser injection or an extension, removes `.js` and so hides the working 目次, copy and share buttons via `html:not(.js) …`.<br>- **Safari mid-word breaks in the deck and cover lines.**<br>- **`tel:%237119` on iPhone is still unverified on a device.** The copy fallback is in place. |
| overall_tech_quality | 6 | **7** | Typography, accessibility, SEO and the build are now at or near ship quality, and the font problem is solved. But the new hero and the reorder trade it for an image-bound LCP of about 9 s in the lab and 2.8 s on a fast iPhone. |

## Regressions (flagged)
Ranked by impact; items 1–3 are the ones that move scores.
1. **LCP** went from 3.0 s to 9.1 s, caused by the full-height 546 KB / 1.12 MB portrait hero and 6 area images entering the initial load after the reorder.
2. **Past-month dimming** at `opacity:.45` is a new 1.4.3 contrast failure.
3. **`lang="en"` on the four Japanese month-range spans** was introduced by the round-1 `lang` fix.
4. **The brand is missing from the accessibility tree at load.** The logo is hidden on the cover while the masthead is `aria-hidden`.
5. **The Noto Serif JP subset grew from 60 to 80 KB,** over the IA's 60 KB budget, because the series lists moved back to the webfont. This one is minor.
6. **Clicking blank space in the TOC sheet closes it,** now that its content no longer fills the panel. Its `e.target === d` branch closes the sheet.

---

## Fixes

### 1. performance: 4 → 7 now, 8 at deploy

**P1. Crop the hero at the CDN and set its quality to match its box.** On mobile the box is about 290×440 (2:3, `object-position:50% 100%`); on desktop it is 405–602 px wide and close to square.

Replace the `<img>` in `.cover-photo .ph`, with `BASE` = `https://images.unsplash.com/photo-1772249491195-e95a8a5ed845?auto=format&fit=crop&crop=bottom`:
```html
<picture>
  <source media="(min-width:960px)" sizes="(min-width:1280px) 600px, 47vw"
    srcset="BASE&q=50&w=600&h=600 600w, BASE&q=50&w=900&h=900 900w, BASE&q=50&w=1200&h=1200 1200w">
  <img src="BASE&q=45&w=600&h=900"
    srcset="BASE&q=45&w=400&h=600 400w, BASE&q=45&w=600&h=900 600w, BASE&q=45&w=800&h=1200 800w"
    sizes="calc(100vw - 121px)" width="800" height="1200" fetchpriority="high"
    alt="黄葉したイチョウの下を歩く親子の後ろ姿">
</picture>
```
Measured AVIF sizes:
- 400×600 at q50: 99 KB.
- 600×900 at q50: 212 KB.
- Today's file: 546 KB at 800w, 1.12 MB at 1200w.

The ginkgo texture compresses badly. If LCP must reach "good" on the lab profile, the art director should consider a calmer frame.

**P2. Lighten the images that load during the initial load.** Add 400/600w candidates, use `q=55`, and give `sizes` the real slot widths:
- area cards: `sizes="(min-width:960px) 360px, 280px"`, srcset `…&q=55&w=400 400w, …&w=600 600w, …&w=800 800w`;
- note photo: `sizes="(min-width:960px) 300px, 340px"`, with the same candidates.

Simulated together with P1, first view drops from 1.54 MB to **0.84 MB** and LCP from 9.1 s to **4.8 s**. With the hero alone at 208 KB, LCP is **3.2 s**. In the field, on a fast iPhone, expect under 1.5 s.

**P3 (optional).** Put the series lists back on the system mincho (`.series li{font-family:var(--mincho-sys)}`). That takes the subset back to about 60 KB.

**P4 (deploy readiness, already good).** `build.py` already computes `FONT_TEXT`, and `images.json` lists every photo. At deploy:
- swap `text=` for `pyftsubset … --layout-features+=vert,vrt2`;
- put the `@font-face` inline and preload the woff2;
- generate the srcset crops from `images.json`;
- serve brotli and `immutable` cache headers.

That removes the third-party font chain, which is the source of the bimodal FCP: 0.61 s with fonts blocked against 0.9–2.8 s now.

### 2. accessibility: 7.5 → 9

**A1. De-emphasise past months without breaking contrast,** and say so in words. In `components.css`:
```css
.ev .past{opacity:1;color:var(--ink-2)}
.ev dt.past{font-weight:500}
```
That gives ink-2 on card at 7.7:1 (light) and 7.13:1 (dark). In `app.js`, inside the `d < 3` branch, add:
```js
dt.insertAdjacentHTML('beforeend', '<span class="sr">（終了）</span>');
```

**A2. Remove `lang="en"` from the month ranges,** and guard against it in the build.
- In `src/body.html`, lines 159, 168, 177 and 186: `<span class="en" lang="en">3〜5月</span>` → `<span class="en">3〜5月</span>`, and the same for the other three seasons.
- In `build.py`, add:
```python
assert not re.search(r'lang="en">[^<]*[぀-ヿ一-鿿]', html), "Japanese text marked lang=en"
```

**A3. Brand in the accessibility tree at load.** Remove `aria-hidden="true"` from `<p class="masthead">`. The visible "OSAKA LIVE" is then read once while the header logo is hidden.

**A4. Keep the TOC sheet open when its blank area is tapped:**
```css
.toc-in{min-height:100%}
```

### 3. robustness_compat: 7.5 → 8.5

**B1. Narrow the failsafe** so that only a failure of our own script reverts to no-JS. In `<head>`:
```html
<script>document.documentElement.classList.add('js');addEventListener('error',(e)=>{if(!window.__ol&&(!e.filename||e.filename===location.href))document.documentElement.classList.remove('js')})</script>
```
Make the last line inside the `app.js` IIFE `window.__ol = 1;`.

**B2. Phrase-safe display text in Safari.** Add the selectors below to the `keep-all` base:
```css
.deck,.coverlines b,.series li{word-break:keep-all;overflow-wrap:anywhere}
@supports (word-break:auto-phrase){.deck,.series li{word-break:auto-phrase}}
```
Then adjust the markup:
- deck: `住む人の<wbr>目線で、<wbr>出典を<wbr>明記して<wbr>書く<wbr>Webマガジン。`;
- quick list: `<span class="nw">（19時〜翌8時）</span>` and `<span class="nw">（24時間）</span>`.

This also lifts responsive_mobile to about 8.5.

**B3. Test `tel:%237119` and `tel:%238000` on a real iPhone.** This is still the only unverified emergency path.

### 4. responsive_mobile: 8 (optional)
- **Short screens** (LINE on SE-class phones): `@media (max-width:599px) and (max-height:700px){.cover h1{font-size:21px}.cover-photo .ph{min-height:340px}.deck{font-size:14px}}`.
- B2 above covers the remaining Safari mid-word breaks.

### 5. technical_seo: 9 (optional)
- **Build-stamped dates.** Have `build.py` write the build date into `dateModified`, `<time datetime>` and the sitemap `<lastmod>`. They all still read 2026-10-30, although the content changed on 10-31.

### 6. code_quality: 8.5 (optional)
- **Copy fallback.** When copy fails, show only the URL: `catch { btn.textContent = url.split('\n').pop(); return; }`. Today it puts the label text and the URL into the button.
- **Font weight.** Set `.cover h1` and `.area .kanji` to `font-weight:700`, so the CSS matches the single face that is loaded. Or add a test that asserts every weight used is requested.

---

## Verdict
For a Japanese reader the page is now technically trustworthy: correct type, accessible emergency numbers, clean SEO and a guarded build. Fix the hero and image payload (P1, P2) and the two new accessibility regressions (A1, A2) before launch. Otherwise the 25–55 mobile audience on LINE and slower Android will meet a 9-second cover.
