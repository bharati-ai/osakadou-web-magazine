# Critique loop: complete (2026-10-31)

**Goal met:** all 21 parameters from the three critics are at 8 or above on the final build.
Five rounds ran. Each round has a critique file per critic, `round-N-<role>.md`, and a `round-N-changelog.md`.

## Source of truth and rebuild
- **Source:** edit the files in `src/` (`body.html`, `components.css`, `base.css`, `app.js`, `images.json`, `build.py`), not `index.html`.
- **Rebuild:** run `python -I build.py` from `src/`. It writes `../index.html` and `../sitemap.xml` and stamps today's date.
- **Build checks (asserts):**
  - `node --check` on the JS;
  - the font subset covers the deck and the H1;
  - no Japanese text carries `lang="en"`;
  - no em/en dashes;
  - no unfilled tokens;
  - the `@media` overrides come after their base rule.
- **Preview:** `.claude/launch.json` → `osakalive` on :5178.
- **Share image:** `src/og.html`, rendered to `../og-cover.jpg` (1200×630).

## Final scoreboard

| Critic | Parameter | R1 | R2 | R3 | R4 | R5 (final) |
|---|---|---|---|---|---|---|
| jp-market | jp_copy_naturalness | 7 | 7 | 8 | 8 | **8** |
| | osaka_authenticity | 6 | 8 | 8 | 8 | **8** |
| | jp_reader_resonance | 5 | 7 | 8 | 8 | **8** |
| | jp_design_conventions | 7 | 8 | 8 | 8 | **8** |
| | jp_typography | 6 | 7 | 7 | 8 | **8** |
| | trust_anshin | 7 | 8 | 8 | 8 | **8** |
| | overall_jp_appeal | 6 | 7 | 8 | 8 | **8** |
| marketing | concept_positioning | 5 | 7 | 8 | 8 | **8** |
| | traffic_acquisition | 5 | 7 | 8 | 8 | **8** |
| | engagement_retention | 6 | 8 | 8 | 8 | **8** |
| | brand_distinctiveness | 5 | 7 | 7 | 8 | **8** |
| | content_strategy | 6 | 7 | 8 | 8 | **8** |
| | future_bridge_readiness | 6 | 8 | 8 | 8 | **8** |
| | overall_marketing_effectiveness | 5 | 7 | 8 | 8 | **8** |
| webdev | performance | 5 | not scored | 4 | 7 | **8** |
| | accessibility | 7 | not scored | 7.5 | 9 | **8** (9 expected after A1, now applied) |
| | responsive_mobile | 7 | not scored | 8 | 8 | **8.5** |
| | technical_seo | 7 | not scored | 9 | 9 | **9** |
| | code_quality | 7 | not scored | 8.5 | 8 | **8.5** |
| | robustness_compat | 6 | not scored | 7.5 | 8.5 | **8.5** |
| | overall_tech_quality | 6 | not scored | 7 | 7.5 | **8** |

- **jp-market R2:** the critic's "after P0" scores. That P0, a JS syntax error that blanked the page, was fixed before R3.
- **webdev R2:** never scored. Its run was stopped at the pause and voided, because it began on the broken build.
- **webdev A1 (final):** `.area-ph{content-visibility:auto}` replaces the `.areas` version, applied after the R5 scoring. The critic tested it by injecting it into the page. I verified it at 375px: all 6 area headings render, every anchor jump lands exactly at 72px, there is no overflow and the console is clean.

## Measured performance (webdev lab profile, mobile 4G with 4× CPU slowdown)

| | R1 | R3 | R4 | R5 |
|---|---|---|---|---|
| LCP (median) | 3.0 s | 9.1 s | 4.7 s | **2.99 s** (fast iPhone: 1.38 s) |
| FCP (median) | 2.9 s | 1.66 s | 0.54 s | 0.71 s |
| First-view transfer | 1.46 MB | 1.54 MB | 787 KB | **455 KB** in 8 requests |
| Fonts | 977 KB in 33 files | 126 KB in 2 files | non-blocking | non-blocking |
| CLS | 0 | 0.0003 | 0.0009 | 0.0009 |

## Decisions waiting on the client
- **Operator details:** 運営者, 編集責任者 and 連絡先 are still 【要記入】. **This blocks launch.**
- **H1:** the marketing critic suggests 「大阪で、暮らす。」 as the H1, with the current tagline moved to the deck. The tagline came from the concept doc, so this is your call.
- **Operator's other business:** whether to name its category in the operator disclosure, before the first PR box. Needs legal review, because of 薬機法 §68 (see research §4.3).

## At deploy
- ~~Self-host the photos~~ Done 2026-10-31: `public/photos/<slot>.jpg`, credits in a collapsed footer note.
- Self-host the fonts: a pyftsubset of Noto Serif JP that keeps `vert`/`vrt2`, plus Bodoni Moda.
- Turn on brotli/gzip (the HTML goes from 81 KB to about 19 KB) and immutable cache headers.
- Set a CSP hash for the inline `<script>` and `<style>`.
- Add the cookieless analytics events from 02-ux-ia §5, and update the privacy text to match.
- Test `tel:#7119` and `tel:#8000` on a real iPhone, in Safari and inside LINE.
- Test the share card in LINE (iOS and Android) and in X.
