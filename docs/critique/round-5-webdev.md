# Round 5: senior web developer (`webdev`)

**Build measured.** `index.html` md5 `015025ad…` (13:19:42, 2026-10-31). The hash was stable through every run.

**Method.** chrome-headless-shell 1234 driven over CDP, with the same profiles as before:
- **Lab profile:** 412×823 at DPR 1.75, 150 ms RTT, 1.44 Mbps, 4× CPU, cache off. 7 runs, reported as the median.
- **Fast-4G iPhone profile:** 390×844 at DPR 3, 40 ms, 9 Mbps.

Also checked:
- short screens (390×560, 320×568, 375×667) and 844×390 landscape, by computed style and screenshot;
- anchor jumps to #areas, #unwell, #calendar, #checklist, #themes and #policy, both from a fresh load and in sequence, at 390 and 320 px;
- overflow sweep at 13 widths from 320 to 1920;
- automated contrast scan in light and dark;
- accessibility tree, including the headings inside the `content-visibility` region;
- Safari simulation (the CSSOM with `auto-phrase` stripped);
- no-JS, print, failsafe and console;
- one alternative fix, tested by injecting it into the response.

## Scores

| Parameter | R1 | R3 | R4 | R5 | Evidence |
|---|---|---|---|---|---|
| performance | 5 | 4 | 7 | **8** | **Lab profile (7 runs):** LCP median **2.99 s** (2.55–4.67), FCP median **0.71 s**, CLS max **0.0009**. **First view is 455 KB in 8 requests**, down from 787 KB in 14 in R4 and 1.54 MB in R1. Full scroll is 966 KB.<br><br>**Fast iPhone profile:** LCP **1.38 s**, FCP 0.11 s.<br><br>**Remaining contention:** the hero (154 KB) still competes with the note photo (91 KB at q45) and 126 KB of fonts. |
| accessibility | 7 | 7.5 | 9 | **8** | **Still good:**<br>- The contrast scan finds **0 failures** in light or dark; past months show 「終了」 in ink-2 at 7.7:1.<br>- No unnamed controls, and the 119 focus ring is visible.<br>- The TOC focuses its close button and stays open on a blank tap.<br>- No Japanese text carries `lang="en"`.<br><br>**New regression, caused by my round-4 P1:** on phones, while `.areas` is off-screen, `content-visibility:auto` removes the **6 area headings and all their card text from the accessibility tree**. At 390 px: **0 of 6** area headings at load, 6 of 6 only after the carousel is scrolled into view. At 1280 px, where the rule doesn't apply, 6 of 6. Find-in-page still works. |
| responsive_mobile | 7 | 8 | 8 | **8.5** | **Short-screen overrides now apply:**<br>- 390×560, 320×568 and 375×667 all compute H1 `21px`, photo box `340px` and deck `14px`.<br>- The H1 bottom moves from 634 to 583 at 390×560, and from 660 to 607 at 320×568. At 375×667 it fits.<br>- Landscape computes H1 `20px` and photo `300px`, and the people in the photo are now visible on short screens.<br>- No overflow at any of 13 widths, and the Safari phrase breaks hold.<br><br>**But first-jump anchors land low:** the hard-coded `contain-intrinsic-size:auto 562px` underestimates the real carousel height. Measured: 594 px at 414, **603 at 390, 689 at 320**.<br>- On a fresh load, jumps past the carousel land **17–18 px low at 390 and 102–103 px low at 320**.<br>- Once the carousel has rendered, they are exact (72 px). |
| technical_seo | 7 | 9 | 9 | **9** | **No change:** the assets, JSON-LD and stamped dates are valid. Googlebot still gets every area card in the DOM. |
| code_quality | 7 | 8.5 | 8 | **8.5** | **Good:** R2's cascade assert is in place and the overrides now take effect.<br><br>**Weak point:** `562px` is a magic number that copy changes have already invalidated. The real height is 579–665 px depending on width. |
| robustness_compat | 6 | 7.5 | 8.5 | **8.5** | **Verified:**<br>- Failsafe: our own syntax error makes `.js` drop with all `.rv` visible; a foreign or late error leaves `.js` in place.<br>- No-JS loads the `<noscript>` fonts (Bodoni 500/700 and Noto Serif JP 700).<br>- Print shows every `.rv`.<br>- 0 console errors.<br>- Browsers without `content-visibility` ignore it harmlessly.<br><br>**Still pending:** the real-iPhone test of `tel:#`. |
| overall_tech_quality | 6 | 7 | 7.5 | **8** | The page is fast on both profiles, stable, accessible and correctly typeset across browsers. One trade-off, introduced by my own round-4 advice, still needs a one-line correction. |

## Regressions
1. **The area cards drop out of the accessibility tree on mobile, caused by P1.** `content-visibility:auto` on `.areas` skips the 6 card headings and texts until the carousel nears the viewport. Heading navigation (TalkBack's heading list, for example) misses the whole area guide at load. I recommended P1 in round 4, and I am correcting it here.
2. **First anchor jumps land low** at 390 px (17 px) and 320 px (about 103 px), because the 562 px placeholder is smaller than the real carousel.

No other regressions: 0 contrast failures, no overflow, no console errors, and the Safari, no-JS, print and failsafe checks all pass.

---

## Fixes

### 1. accessibility: 8 → 9 (also responsive 8.5 → 9, code_quality 8.5 → 9)

**A1. Move `content-visibility` from the scroller to each card's photo box.** `.area-ph` already has `aspect-ratio:3/2`, so its size is exact and no `contain-intrinsic-size` is needed. In `src/components.css`, replace line 186:
```css
@media (max-width:959px){.areas{content-visibility:auto;contain-intrinsic-size:auto 562px}}
```
with:
```css
@media (max-width:959px){.area-ph{content-visibility:auto}}
```
I tested this on this build by injecting it into the response (with `.areas` reset to `visible`):
- **Accessibility tree:** 6 of 6 area headings are present at load, at both 390 and 1280.
- **Anchor jumps:** **exactly 72 px** for all 6 targets, at both 320 and 390, from a fresh load.
- **Weight:** first view is unchanged at **455 KB in 8 requests, 3 images**, so the area photos are still deferred.
- **LCP:** 2.86–3.35 s on 2 of 3 runs, the same band as now. The third run was a 5.75 s outlier, in line with this harness's usual variance.

The only remaining skip is each off-screen card's `<img alt>`. That is acceptable for illustrative photos. Check print preview once after the change.

### 2. performance (8): optional
- **Deploy (the build is ready for it):** serve brotli or gzip. The HTML drops from 81 KB to about 19 KB, which saves about 0.35 s of lab LCP. Self-hosting the fonts and photos on one H2 origin then lets the preloaded hero win the connection.
- **Optional:** set the note photo's mobile `sizes` to `(min-width:960px) 300px, min(340px, 100vw - 32px)`, and add a 480w candidate so DPR 1.75 picks 480w rather than 600w.

### 3. robustness_compat (8.5): optional
- Test `tel:%237119` and `tel:%238000` on a real iPhone, in Safari and inside LINE, before launch.

---

## Verdict
This is now a launch-quality Japanese web magazine page on the technical side. The cover paints in 0.7 s and the LCP is about 3 s on a mid-tier Android in the lab and 1.4 s on an iPhone, with no layout shift, clean contrast in both themes and phrase-correct line breaks on Safari. Swap the one `content-visibility` line (A1) so screen-reader users get the area guide too.
