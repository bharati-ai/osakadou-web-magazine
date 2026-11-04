# Round 4: senior web developer (`webdev`)

**Build measured.** `index.html` md5 `e28d13c5…` (13:00:54, 2026-10-31). The hash was stable through every run.

**Method.** chrome-headless-shell 1234 driven over CDP, with the same profiles as before:
- **Lab profile:** 412×823 at DPR 1.75, 150 ms RTT, 1.44 Mbps, 4× CPU, cache off. 7 runs, reported as the median.
- **Fast-4G iPhone profile:** 390×844 at DPR 3, 40 ms, 9 Mbps, 1× CPU.
- **Fonts-blocked A/B.**
- **Two request-rewrite experiments** that test the fixes proposed below.

Also checked:
- overflow sweep at 13 widths from 320 to 1920;
- accessibility tree and keyboard;
- **automated contrast scan** of every visible text node, in light and dark;
- Safari simulation: every `auto-phrase` declaration is removed from the CSSOM so the cascade falls back exactly as in Safari. This is more accurate than the round-3 simulation;
- no-JS, including the `<noscript>` fonts;
- print;
- **failsafe tests:** our own inline script corrupted with a syntax error, versus a foreign `data:` script error plus a late runtime error;
- console errors.

Caveat: DevTools throttling shares bandwidth evenly and ignores HTTP/2 priority, so lazy images compete with the hero more than they would on a real H2 connection.

## Scores

| Parameter | R1 | R3 | R4 | Evidence |
|---|---|---|---|---|
| performance | 5 | 4 | **7** | **Lab profile (7 runs):** FCP median **0.54 s**, LCP median **4.70 s** (range 2.42–5.60), CLS max **0.0009**. First view is **787 KB in 14 requests**, down from 1.54 MB, and full scroll is 991 KB.<br><br>**Fast iPhone profile:** FCP 0.19 s, LCP **1.62 s**.<br><br>**What is fixed:**<br>- Hero is 154 KB at `w=540&h=810` (was 546 KB) and is preloaded at `fetchpriority=high`.<br>- Fonts no longer block rendering: the async insert works, and fonts-blocked FCP is 0.56 s against a median of 0.54 s.<br>- **Font-swap CLS is 0.0008**, from `#text` shifts at 2.5–4.6 s. That is negligible.<br><br>**What still holds LCP back:**<br>- **Lab LCP is set by bandwidth contention:** 7 lazy images (440 KB, including the 116 KB note photo and 6 area cards inside Chrome's lazy-load distance) plus 126 KB of fonts.<br>- In the two runs where those requests started late, LCP was 2.4 s. |
| accessibility | 7 | 7.5 | **9** | **Contrast:** the scan finds **0 text failures in either theme**. The only hit is the header logo while it is intentionally `opacity:0` on the cover. Past months are now ink-2: 7.7:1 light, 7.1:1 dark, plus a screen-reader-only 「（終了）」.<br><br>**Language:** no Japanese text carries `lang="en"` (0 found).<br><br>**Accessibility tree:** 「OSAKA LIVE」 (the masthead, `lang="en"`) is present at load, and no interactive element is unnamed.<br><br>**Focus and keyboard:**<br>- The 119 focus ring is white on 朱.<br>- The TOC opens with focus on its close button. A link inside it lands on the target, and the next Tab goes into that section.<br>- **Tapping blank space no longer closes the sheet.** |
| responsive_mobile | 7 | 8 | **8** | **Good:**<br>- No overflow at any of 13 widths.<br>- In the Safari simulation the deck, cover lines and series now phrase-break: 「住む人の／目線で、」「近所のお医者さん、／どう探す？」「美容医療の前に確かめたい、／契約と相談先」.<br>- The hours are kept together, for example 「（19時〜翌8時）」.<br><br>**The short-screen fix is dead code** (see regressions). At 390×560 and 320×568 the computed values are still H1 `24px`, photo `440px` and deck `15px`, and the H1 is cut. In landscape only the masthead rule takes effect. |
| technical_seo | 7 | 9 | **9** | **Unchanged and still valid:** all assets return 200, and the JSON-LD parses.<br><br>**New:** build-stamped dates now agree. `dateModified`, the footer `<time>` and the sitemap `<lastmod>` all read 2026-10-31. |
| code_quality | 7 | 8.5 | **8** | **Good:**<br>- Build asserts now include the lang check.<br>- The failsafe is narrowed and correct.<br>- The copy fallback shows the URL only.<br>- Font weights match the face that is loaded.<br>- 0 inline styles and 0 inline handlers.<br><br>**Problem:** two `@media` overrides sit *before* the base rules they override, at equal specificity, so neither takes effect (detail in the regressions). The build verifies JS but not whether its CSS rules apply. |
| robustness_compat | 6 | 7.5 | **8.5** | **Failsafe verified both ways:**<br>- Our own syntax error makes `.js` drop, all 11 `.rv` blocks show and 目次 hides.<br>- A foreign or late error leaves `.js` in place, so 目次 and the copy/share buttons still work.<br><br>**No-JS:** the `<noscript>` fonts load (Bodoni 500/700 and Noto Serif JP 700), and the content is visible.<br><br>**Also:** 0 console errors, Safari phrase-wrapping holds, and the older-browser fallbacks are intact. The `tel:#` test on a real iPhone is still pending. |
| overall_tech_quality | 6 | 7 | **7.5** | Everything except image contention and one CSS cascade bug is now at or near ship quality. It is fast on a modern iPhone, but a mid-tier Android on 4G still waits about 4.7 s for the cover. |

## Regressions and ineffective fixes
- **The short-screen and landscape overrides are dead (cascade order).** In `src/components.css`:
  - line 10, `@media (max-width:599px) and (max-height:700px){.cover h1…;.cover-photo .ph…;.deck…}`, and
  - line 83, `@media (max-height:500px) and (orientation:landscape){… .cover h1{font-size:20px} .cover-photo .ph{min-height:300px}}`

  both come before `.deck` (line 90), `.cover-photo .ph` (line 93) and `.cover h1` (line 96). Specificity is equal, so the later base rules win. Measured at 390×560 and 320×568: `h1 24px`, `ph 440px`, `deck 15px`. The landscape H1 and photo rules have been dead since round 1; only its masthead rule works, because it follows `.masthead`.
- No other regressions: 0 console errors and 0 contrast failures, and the overflow, Safari, no-JS, print and failsafe checks all pass.

---

## Fixes

### 1. performance: 7 → 8

**P1. Keep the mobile area carousel out of the initial load.** One CSS rule, tested in this build by injecting it into the response:
```css
@media (max-width:959px){.areas{content-visibility:auto;contain-intrinsic-size:auto 562px}}
```
- **Measured over 3 runs:** first view went from **787 KB / 14 requests to 479 KB / 8**, and **LCP median from 4.70 s to 3.64 s** (2.93–3.88). CLS stays at 0.0002–0.0008.
- **Anchor jumps still land:** #unwell, #calendar, #themes and #policy at 72 px, and #checklist at 94 px. 562 px is the measured carousel height, which removes that 22 px offset.
- **Don't** put `content-visibility` on whole sections. I tested `.cover~section`: the jump to #checklist landed **1121 px off target** because smooth scrolling ran across sections that had not been laid out yet.

**P2. Lighten the editor's-note photo.** It is the next-largest file to compete with the hero: 116 KB at `q=55&w=600`. Change its srcset to `q=45` and keep `sizes="(min-width:960px) 300px, 340px"`. That should be about 85 KB.

**P3 (optional, a trade-off).** Insert the webfont CSS after the hero has loaded, so the 126 KB of fonts stop competing with it. In the head script, replace the immediate `forEach(...)` with:
```js
addEventListener('load', () => [/* same two URLs */].forEach((h) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; document.head.append(l); }));
```
In the fonts-blocked A/B, LCP was 4.0 s against 4.7 s. The cost is a later swap of the mincho headings on slow links. CLS stays negligible, because CJK advances are fixed.

**Deploy readiness is good.** `images.json` and `FONT_TEXT` drive the build, so self-hosting the photos and a `pyftsubset` woff2 on one H2 origin (with brotli and immutable caching) is a pipeline change, not a page rewrite. H2 priority will then favour the preloaded hero.

### 2. responsive_mobile: 8 → 8.5 (and code_quality 8 → 8.5)

**R1. Make the short-screen and landscape overrides actually apply.** In `src/components.css`:
- **delete** line 10 and line 83;
- **add** these two blocks directly after the `.cover h1{…}` rule (line 96), so they come after all three base rules:
```css
@media (max-height:500px) and (orientation:landscape){.masthead{font-size:clamp(40px,12svh,150px)}.cover h1{font-size:20px}.cover-photo .ph{min-height:300px}}
@media (max-width:599px) and (max-height:700px){.cover h1{font-size:21px}.cover-photo .ph{min-height:340px}.deck{font-size:14px}}
```
Expected result: at 375×667 the whole cover column fits. At 390×560 the H1 ends about 25 px below the fold, down from 74 px.

**R2. Guard the cascade in `build.py`.** Assert that the overrides follow their base rules:
```python
css = (T / "components.css").read_text(encoding="utf-8")
for q in ("(max-width:599px) and (max-height:700px)", "(max-height:500px) and (orientation:landscape)"):
    assert css.index(q) > css.index(".cover h1{"), f"media override {q} precedes its base rule"
```

### 3. Optional (parameters at 8 or above)
- **accessibility (9):** the headings that contain `<wbr>` (5 `<h2>`s and 4 `<h3>`s) pick up a space at each break in their accessible names. Have `build.py` add a `<wbr>`-free `aria-label` to each of them, for example `aria-label="大阪エリアガイド"` on `#h-areas`. Today the names read 「大阪 エリアガイド」「体調がすぐれないときの 相談先」, which causes small pauses in Japanese TTS.
- **technical_seo (9):** none needed before launch. Self-hosting at deploy also moves `og:image` and the photos onto the canonical host.
- **robustness_compat (8.5):** run the real-device test of `tel:%237119` and `tel:%238000` on iPhone in Safari and in LINE.

---

## Verdict
For a Japanese audience this is now a technically sound, accessible and well-typeset page that loads quickly on the iPhone majority (LCP 1.6 s). Two small CSS changes, P1 and R1, close most of the remaining gap for mid-tier Android and LINE users on short screens.
