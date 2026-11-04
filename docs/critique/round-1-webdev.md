# Round 1: senior web developer (`webdev`)

**Method.** I rendered the live page (http://localhost:5178/) in chrome-headless-shell 1234 using the brief's CLI method and a small CDP driver. I captured:
- 390 and 1280 light, plus 390 dark (emulated `prefers-color-scheme`);
- fold shots at 320×568, 390×560 (LINE in-app height), 390×844, 844×390 landscape, 768, and 1280×720;
- an overflow sweep from 320 to 1920px.

For throttled runs I used a Lighthouse-like profile: 412×823 at DPR 1.75, 150 ms RTT, 1.44 Mbps down, 4× CPU, cache off. I made 3 runs, plus an A/B run with Google Fonts blocked. I also pulled the accessibility tree, did keyboard and focus tests, simulated no-JS and print, and simulated Safari line-breaking by forcing `word-break:normal`. Contrast is computed from the CSS tokens.

Caveat: the local server is HTTP/1.0 with no compression (HTML 76 KB raw, 18 KB gzipped). Production gzip removes about 0.35 s of HTML transfer from the numbers below, but it does not change the conclusions.

Pending items (operator 【要記入】, Unsplash hotlinks) are noted and not scored.

## Scores

| Parameter | Score | Evidence |
|---|---|---|
| performance | **5** | **LCP and FCP are slow:**<br>- FCP is 2.80 / 2.96 / 3.12 s and LCP is 3.01 / 3.20 / 5.98 s. The LCP element is the `H1.tate`.<br>- With `fonts.googleapis.com` blocked, FCP drops to **0.42 s** and `domInteractive` falls from about 2.9 s to 0.72 s.<br><br>**Font weight dominates the first view:**<br>- First view is **1.46 MB in 39 requests**, of which **33 are font files totalling about 977 KB**: 32 Noto Serif JP `unicode-range` slices plus Bodoni Moda.<br>- The render-blocking Google Fonts CSS is 91 KB gzipped (353 KB raw, **380 `@font-face` rules**).<br>- This breaks your own budget in `02-ux-ia.md`: under 200 KB first view and 60 KB or less of Noto Serif JP.<br><br>**What is already good:**<br>- CLS is 0.000 in all runs, and INP is trivial.<br>- `fetchpriority="high"`, `loading="lazy"`, width/height attributes and AVIF via `auto=format` are all done. |
| accessibility | **7** | **Strong base:**<br>- Skip link, `aria-labelledby` regions and a clean h1→h2→h3 outline.<br>- Native `<dialog>`, with focus moving to the close button.<br>- After a TOC link, the next Tab lands after `#t2`, which is correct.<br>- Full reduced-motion coverage.<br>- Every text token passes AA in both themes: ink-2 6.74–8.15:1, shu 4.95–6.37:1, on-shu/shu 5.76 and 6.37:1.<br><br>**Defects:**<br>- **Invisible focus ring on the 119 link.** The computed outline is `rgb(184,57,31)` on a parent background of `rgb(184,57,31)`. This fails 2.4.7.<br>- **The `#` of `#7119`/`#8000` and the hyphens of `06-6693-1199` render as near-invisible hairlines** in Bodoni Moda 700 at 28px (zoomed capture), so the emergency number reads as "7119".<br>- None of the 36 `.en` spans has `lang="en"` (3.1.2).<br>- The inline fallback numbers `06-6582-7119` and `06-6765-3650` are 93×17 px tap targets. |
| responsive_mobile | **7** | **Good:**<br>- No horizontal overflow at any of 13 widths from 320 to 1920. The hero is well composed at 390×844.<br><br>**Weak points:**<br>- **Small heights.** At 844×390 landscape, the header plus masthead take about 45% of the screen and the H1 is cut. At 390×560 the cover lines start at y=640, below the fold.<br>- **Masthead at 320px.** It is exactly 288/288 px with `white-space:nowrap`, so any OS or LINE text scaling causes page-level sideways scroll.<br>- **Theme numerals.** In the brief's own 1280px capture, the `04` numeral wraps to "0 / 4". It is 128 px wide in a 140 px column and inherits `overflow-wrap:anywhere`.<br>- **Long TOC sheet.** It is 1067 px tall in an 844 px viewport, so 08 (相談先) and 09 sit below the fold.<br>- **Line breaks on iPhone, the majority of JP mobile.** `auto-phrase` is Chromium-only, so you get 「体調がすぐれないときの相談／先」, 「キタ（梅田・大／阪）」 at 390 and 「中之島・北／浜」 at 320.<br>- At 320, 「大阪暮らしチェックリス／ト」 breaks this way even in Chrome. |
| technical_seo | **7** | **Good:**<br>- Title is 31 characters and the description 116, both well sized for Google JP.<br>- Canonical, `og:*` and `twitter:card` are present.<br>- The JSON-LD `@graph` parses as WebSite, Organization and WebPage.<br>- One h1 and a clean outline. `robots.txt` and `sitemap.xml` are valid.<br><br>**Gaps:**<br>- **The favicon is only a `data:` URI**, so Google Search has no crawlable favicon for the mobile SERP row, and there is no `apple-touch-icon`.<br>- `Organization` has no `logo`, although the IA planned one.<br>- `about: City` has no `sameAs`.<br>- There is no `og:image:width/height/alt`.<br>- The fragment ids `#t1`–`#t5` are opaque. |
| code_quality | **7** | **Good:**<br>- Readable token-based CSS, no inline handlers, and `rel="noopener"` on all 14 `_blank` links.<br>- `localStorage` read and write are both wrapped in try/catch, and the clipboard failure falls back to showing the URL.<br><br>**Debt:**<br>- **Duplicated markup.** The 9-item contents list is copied in two places. Four nearly identical 2.8 KB SVG data URIs make up 15% of the HTML.<br>- **CSP blockers.** There are 15 inline `style=""` attributes, and a CSP would need `'unsafe-inline'` for them.<br>- **Dead controls without JS.** The `目次`, copy and share buttons render but do nothing.<br>- **Print.** Printing hides **11 `.rv` blocks**, including all 5 themes, at `opacity:0`.<br>- **Parser stall.** The `js`-class script sits *after* the blocking font link, so the parser stalls on the font CSS.<br>- **Wrong font weight.** `.note-body` asks for weight 400, but only 600/700/900 are loaded, so the editor's note renders in the 600 face.<br>- **Button feedback.** Copy feedback never resets, and a share error that is not an `AbortError` is swallowed. |
| robustness_compat | **6** | **Good:**<br>- `animation-timeline` is properly behind `@supports` and reduced motion.<br>- `scroll-snap`, `writing-mode`, `text-orientation` and `aspect-ratio` are safe on iOS 15/16.<br><br>**Failure paths:**<br>- **No `color-mix()` fallback.** On iOS 15 to 16.1 the sticky header becomes transparent. A double declaration will not help because the value contains `var()`.<br>- **No `dialog:not([open])` fallback.** On iOS earlier than 15.4 the TOC renders inline at the top of the page, and `showModal` throws.<br>- **No `100dvh` fallback.**<br>- **Reveals depend on IntersectionObserver.**<br>- **Phrase breaking depends on `auto-phrase`.** Both are unsupported or degraded off Chromium.<br>- **`tel:%237119` may not dial on iPhone.** Apple's Phone Links documentation says tel URLs containing `#` or `*` are not dialled. Verify this on a real device. |
| overall_tech_quality | **6** | A careful, well-structured build: semantic, compliant, CLS-free and dark-mode-correct. It is let down by an unsubset Japanese webfont strategy, at 1 MB and about 2.4 s of render blocking on mobile. It also has a handful of failure paths that hit exactly the iPhone and LINE majority it targets. |

---

## Fixes (every parameter is below 8)

### 1. performance: 5 → 8

**P1. Cut Noto Serif JP from 32 slices (about 977 KB) to one subset of about 51 KB, and drop the 91 KB render-blocking CSS.** This is the biggest win. It matches the IA rule "Noto Serif JP for headings only".

The headings use **148 unique Noto Serif JP glyphs**; the whole page uses 258. Measured with Google's `text=` API:
- weight 700 only: **52.6 KB**, one file, 1.8 KB of CSS;
- weights 700 and 900: one 103.6 KB variable file.

(a) Set long-form mincho text in the system mincho. This also fixes the editor's note rendering in the 600 face.
```css
:root{--mincho-sys:"Hiragino Mincho ProN","Yu Mincho",YuMincho,"Noto Serif CJK JP",serif}
.note-body,.series li{font-family:var(--mincho-sys)}
```
(b) Now, before deploy, replace line 23 with two links.
- The first is Bodoni, unchanged.
- The second is a heading-only subset. `TEXT` is the URL-encoded set of heading characters. Regenerate it with a one-line script whenever the heading copy changes.
- Drop weight 900. Set `.cover h1` and `.area .kanji` to `font-weight:700`. To keep 900, request `wght@700;900`; that is one 104 KB file.
```html
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&display=swap&text=TEXT">
```
(c) At deploy, when you self-host the photos, self-host the fonts as well:
- run `pyftsubset NotoSerifJP-Bold.otf --text-file=headchars.txt --layout-features+=vert,vrt2 --flavor=woff2 --output-file=nsj700.woff2`;
- put the `@font-face` inline in `<style>`;
- add `<link rel="preload" as="font" type="font/woff2" href="/fonts/nsj700.woff2" crossorigin>`;
- delete both preconnects.

This removes the third-party connection chain entirely, which about 0.4 s FCP in the A/B run shows is achievable. It also removes Google from the 外部送信 notice.

Check that the 、 and 。 in the vertical H1 still sit top-right after subsetting.

*Expected:* first view goes from about 1.46 MB to about 0.45 MB. FCP drops from about 2.9 s to 1.0–1.4 s now, or to about 0.6 s self-hosted. LCP drops from 3.0 s to under 2.0 s.

**P2. Move the `js`-class script above every stylesheet link,** as shown in P1(b). As it stands, the inline script waits for the font CSS, so `domInteractive` tracks FCP (2.79 / 2.97 / 3.12 s) and falls to 0.72 s once that CSS is gone.

**P3. Take the LCP element out of the entrance animation.** The H1's LCP entry lands about 200 ms after FCP in every run (2804 → 3008 ms), which is the `.15s` delay plus throttled frames.
```css
.cover h1{animation:none}   /* keep rise on masthead/photo if wanted */
```

**P4. Art-direct the mobile hero.** The `<960px` box is about 290×440, portrait, filled with `object-fit:cover` from a 3:2 landscape image. `sizes="75vw"` picks the 800w file, but after the cover-crop the visible part needs about 1155 device px at DPR 1.75, or about 1980 at DPR 3. The hero is therefore upscaled 1.4–1.65× and looks soft.

Add a portrait source. With Unsplash/imgix, use the focal point that matches `object-position:78%`:
```html
<picture>
  <source media="(max-width:959px)" sizes="70vw"
    srcset="https://images.unsplash.com/photo-1584505489290-96eb4e406d08?auto=format&fit=crop&crop=focalpoint&fp-x=.78&fp-y=.5&q=60&w=400&h=620 400w,
            https://images.unsplash.com/photo-1584505489290-96eb4e406d08?auto=format&fit=crop&crop=focalpoint&fp-x=.78&fp-y=.5&q=60&w=640&h=990 640w,
            https://images.unsplash.com/photo-1584505489290-96eb4e406d08?auto=format&fit=crop&crop=focalpoint&fp-x=.78&fp-y=.5&q=60&w=900&h=1390 900w">
  <img …existing img, sizes="55vw"…>
</picture>
```
When you self-host, export the same 400/640/900 portrait crops.

**P5. Lighten the editor's-note photo.** It is 222 KB at 800w, and it loads during the initial load because Chrome's lazy-load threshold is about 1250–2500 px. Use `q=55` and `sizes="(min-width:960px) 300px, min(90vw,340px)"`, which should save about 80 KB.

**P6. Configure the production server.** Serve brotli or gzip (HTML 76 → 18 KB) and add `Cache-Control: public, max-age=31536000, immutable` on fonts and images.

### 2. accessibility: 7 → 9

**A1. Visible focus on the 119 button.** This is a one-line fix:
```css
.u-alert a:focus-visible{outline-color:var(--on-shu)}
```

**A2. Make the emergency numbers legible.** The Bodoni hairlines erase `#` and `-`. Set phone numbers in the system Gothic:
```css
.u-alert a,.res .num{font-family:var(--gothic);font-weight:700;letter-spacing:.02em;font-variant-numeric:tabular-nums}
```

**A3. Language of parts.** Add `lang="en"` to the English labels: a global replace of `class="en"` with `class="en" lang="en"` (36 places), plus the 6 area `<small>` romaji labels, for example `<small lang="en">Kita / Umeda, Osaka</small>`.

**A4. Make the fallback phone numbers proper tap targets without changing the layout:**
```css
.res .meta a[href^="tel:"]{display:inline-block;padding:13px 4px;margin:-13px -4px}
```

**A5. iPhone and `#7119`.** Test `tel:%237119` on a real iPhone. If it does not dial, change the fallback label in `#unwell` to: `つながらないとき・iPhoneでリンクから発信できないとき <a href="tel:0665827119">06-6582-7119</a>`. Do the same for #8000: `ダイヤル回線・IP電話・iPhoneでリンクから発信できないとき`.

**A6. Smaller items:**
- Remove `aria-label="OSAKA LIVE トップ"` from the logo, so the name matches the visible text (2.5.3).
- Wrap the dialog's list in `<nav aria-label="目次">`, so mobile users get a navigation landmark.
- Change the areas label to `aria-label="エリアガイド"`, since the scroll hint is wrong on desktop, where there is a grid.
- Separate the series status for screen readers: `<span class="tag"><span class="sr">：</span>準備中</span>`. This also puts the unused `.sr` class to work.

### 3. responsive_mobile: 7 → 8.5

**R1. Cross-browser Japanese phrase wrapping** (iPhone is the majority):
```css
h1,h2,h3{word-break:keep-all;overflow-wrap:anywhere}
@supports (word-break:auto-phrase){h1,h2,h3{word-break:auto-phrase}}
```
Then add `<wbr>` to the headings that wrap at 320–390. Measured breaks are shown in the score table.
- `体調が<wbr>すぐれない<wbr>ときの<wbr>相談先`
- `大阪暮らし<wbr>チェックリスト`
- `ひと・<wbr>トレンド・<wbr>カルチャー`
- `キタ<wbr>（梅田・<wbr>大阪）`
- `ミナミ<wbr>（なんば・<wbr>心斎橋）`
- `中之島・<wbr>北浜`
- `天王寺・<wbr>阿倍野`
- `京橋・<wbr>大阪城`
- `休日・夜間<wbr>急病診療所<wbr>（大阪市）`
- `大阪府<wbr>救急医療<wbr>情報センター`

**R2. Fragile one-liners.** Stop text scaling from forcing sideways scroll, and stop the `04` numeral from splitting:
```css
.masthead{white-space:normal;overflow-wrap:normal}
.theme-no{white-space:nowrap;overflow-wrap:normal;letter-spacing:0}
@media (max-width:359px){.masthead{font-size:40px}}
```

**R3. Hero at short viewports** (landscape phones, LINE with toolbars):
```css
@media (max-height:500px) and (orientation:landscape){
  .masthead{font-size:clamp(40px,12svh,150px)}
  .cover h1{font-size:20px}
  .cover-photo{min-height:300px}
}
```

**R4. Fit the TOC sheet on one phone screen.** The descriptions repeat what the `#contents` list already says:
```css
.toc .contents .d{display:none}
```

**R5. Keep 「365日」 together.** Wrap it in `<span class="nw">24時間・365日</span>` and add `.nw{white-space:nowrap}`. As it stands it breaks as 「365／日」 at 390.

### 4. technical_seo: 7 → 8.5

**S1. Crawlable favicons.** Ship the files at deploy and keep the SVG as well:
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

**S2. JSON-LD.** Make these changes:
- Type the publisher as a media organisation and give it a logo:
  - `"@type":["Organization","NewsMediaOrganization"]`;
  - `"logo":{"@type":"ImageObject","url":"https://osakadou.live/logo-512.png","width":512,"height":512}`.
- Add policy links to the same `#policy` anchor: `"correctionsPolicy":"https://osakadou.live/#policy"` and `"ethicsPolicy":"https://osakadou.live/#policy"`.
- Change the `about` entity to `{"@type":"City","name":"大阪市","sameAs":"https://www.wikidata.org/wiki/Q35765"}`.
- Add `"primaryImageOfPage"` to the WebPage.
- Add `sameAs` once social accounts exist.

**S3. OGP.** Add these tags:
```html
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="夕暮れの道頓堀川と、川をゆく遊覧船">
```
The IA plan for a dedicated 1200×630 tategaki cover image still stands, and LINE and X reuse it.

**S4. Descriptive anchors (optional).** Replace `#t1`–`#t5` with `#living`, `#health`, `#beauty`, `#culture` and `#guide`, so shared deep links match future category slugs. Update the nav, the cover lines and the contents links.

### 5. code_quality: 7 → 8.5

**C1. Keep one contents list.**
- In the dialog, replace the `<ol>` with `<nav aria-label="目次" id="toc-nav"></nav>`.
- In JS, add `$('#toc-nav').append($('#contents .contents').cloneNode(true));`. The dialog is JS-only anyway.

**C2. Don't render dead controls without JS:**
```css
html:not(.js) .toc-btn,html:not(.js) .copy-link,html:not(.js) #share{display:none}
```

**C3. Make printing safe:**
```css
@media print{.js .rv{opacity:1!important;transform:none!important}.hd,.copy-link,.ft button,.seigaiha{display:none}}
```

**C4. Get ready for CSP.** Move the 15 `style=""` attributes into CSS: a single `.lede{margin-bottom:28px}`, plus `.ft-actions`, `.toc-title` and similar classes. A CSP can then use `style-src 'self' 'sha256-…'` without `'unsafe-inline'`.

**C5. Give copy and share proper feedback and fallbacks:**
```js
const copy = async (btn, url) => {
  const label = btn.dataset.label ??= btn.textContent;
  try { await navigator.clipboard.writeText(url); btn.textContent = 'リンクをコピーしました'; }
  catch { btn.textContent = url; return; }
  setTimeout(() => { btn.textContent = label; }, 2500);
};
$('#share').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  if (!navigator.share) return copy(btn, pageUrl);
  try { await navigator.share({ title: document.title, url: pageUrl }); }
  catch (err) { if (err.name !== 'AbortError') copy(btn, pageUrl); }
});
```
Also add `aria-live="polite"` to the two `.copy-link` buttons and to `#share`.

**C6. Optional.** Shrink each seigaiha data URI from about 2.8 KB to about 0.7 KB by defining the five-ring group once and repeating it with `<use>`. Drop the redundant `font-feature-settings:"vert","vrt2"` on `.tate`; vertical mode already applies `vert`.

### 6. robustness_compat: 6 → 8

**B1. `color-mix` fallback.** The value contains `var()`, so a second plain `background:` declaration will not work. Use `@supports`:
```css
@supports not (background:color-mix(in srgb,red 50%,blue)){.hd{background:var(--paper)}}
```

**B2. `<dialog>` and viewport units on older WebKit:**
```css
dialog:not([open]){display:none}
dialog.toc{height:100vh;height:100dvh;overscroll-behavior:contain}
```
```js
if (typeof d.showModal !== 'function') $('#toc-open').hidden = true;
```

**B3. Fallback when IntersectionObserver is missing.** Replace the reveal block with the version below. Don't use an early `return`, because it would skip the dialog and checklist code that follows.
```js
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el) => io.observe(el));
} else $$('.rv').forEach((el) => el.classList.add('in'));
```

**B4.** R1 (phrase wrapping) and A5 (`tel:#`) are the two items that most affect iPhone and LINE users in Japan.

---

## Verdict
For a Japanese reader this is technically credible and trustworthy: clean semantics, honest sourcing and correct dark mode. But the majority who read on iPhone and in LINE get a slow, font-heavy first paint and awkward heading breaks. P1, R1, A1 and A2 are the four changes that matter most.
