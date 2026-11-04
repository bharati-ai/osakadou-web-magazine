# Round 4 critique: marketing

**What I reviewed.** I took fresh renders on 2026-10-31 at 390px and 1280px with `--force-prefers-reduced-motion`, which avoids the mid-animation capture artifact. I also took a 390×844 fold with motion on and a header check at 960px. I re-read the `<head>` meta, the copy and `src/app.js`, against `round-3-changelog.md`.

**Not scored:** the 【要記入】 operator, 編集責任者 and contact fields; hotlinked Unsplash images; the H1 swap (a client decision); deploy items such as analytics and self-hosting.

## 1. Scores

| Parameter | R1 | R2 | R3 | R4 | Justification (evidence) |
|---|---|---|---|---|---|
| `concept_positioning` | 5 | 7 | 8 | **8** | Unchanged and holding. 「大阪で、暮らす。」 in 朱, then 「住む人の目線で、出典を明記して書くWebマガジン。」, sits above the fold at 390px (fold.png) and on the share image. 編集部より contrasts the site with tourist guides and states the 大阪市 scope. The generic H1 is a client decision. |
| `traffic_acquisition` | 5 | 7 | 8 | **8** | Every share path now carries a label: the section copy buttons (`data-text`), `navigator.share` (deck text), and the fallback (「OSAKA LIVE｜大阪で、暮らす。」 plus the URL). `og:image:alt` now matches the new image: 「OSAKA LIVE 創刊準備号　大阪で、暮らす。住む人の目線で…」. The title, description and branded share image are intact. #unwell is still at about 22% of the mobile scroll. Cover line 03 still reads 「11月は大阪・光の饗宴ほか。季節の体調メモ」 (desktop_00). |
| `engagement_retention` | 6 | 8 | 8 | **8** | The page order runs utility first and matches the cover lines and the 目次. The calendar tags 10月 「今月」 and 11月 「もうすぐ」 (mobile_04). Range rows such as 「7〜8月」 are now excluded from tagging and from the cover-line lookup, which removes the June double tag. The 06 fallback hours now sit on their own line in the resource list (mobile_03), which reads cleaner. One minor visual regression is noted in §2. |
| `brand_distinctiveness` | 5 | 7 | 7 | **8** | **The round-3 blocker is fixed.** The header nav now reads 「01 エリア 02 相談先 03 カレンダー 04 チェックリスト 05 連載」, the same numbering and order as the cover lines and the 目次 directly below it (desktop_00). One numbering system now runs through the page. It holds on one line at 960px with no overflow (w960_head). The brand assets now work together: 「大阪で、暮らす。」 in 朱 on the cover and the share image, the Bodoni masthead (now exposed to assistive technology as 「OSAKA LIVE」), the kanji area marks, Mincho series lists, 朱 保存版 tags, and the Kansai cover lines. The footer no longer repeats 「住む人のため」 a third time. |
| `content_strategy` | 6 | 7 | 8 | **8** | No change, and none needed. The 15 series titles balance civic authority (検診, 休日・夜間, ごみ, 引っ越し, 南海トラフ), Osaka-specific culture and food, and a beauty pillar with a local angle and a reader-protective framing. The 目次 05 line reads 「…ガイドの、15の連載。」. |
| `future_bridge_readiness` | 6 | 8 | 8 | **8** | Unchanged and sound. The ad claim is time-scoped. The page discloses that the operator runs other businesses, says how PR and the relationship will be labelled, and gives the editorial-judgement process and the per-article reviewer pledge. `correctionsPolicy` and `ethicsPolicy` are in JSON-LD. |
| `overall_marketing_effectiveness` | 5 | 7 | 8 | **8** | All six parameters are at 8. This is a launch-ready pre-launch issue: clear resident positioning, a coherent identity, labelled sharing, utility first, and trust groundwork above the local-media norm. |

## 2. Regressions

- **Minor: the "past month" cue in the calendar is now too quiet.** Changelog A1 replaced `opacity:.45` with `color:var(--ink-2)` plus a screen-reader-only 「（終了）」. In the render, the 9月 event text measures `rgb(74,82,99)` against `rgb(28,36,51)` for the live rows (mobile_04). A reader skimming on a phone will read 「岸和田だんじり祭（9月祭礼）」 as current. The contrast gain is right, but sighted users lost the signal. See the optional fix in §4.
- Nothing else regressed. I checked the header at 960px and 1280px, the cover lines, the quick card, the calendar tags, the footer, the share image and the meta.

## 3. Fixes for parameters below 8
None. All parameters are at 8 or above.

## 4. Optional improvements (at most 2 per parameter)

**engagement_retention**
1. **Make 「終了」 visible.** It is clearer for everyone, and screen readers still read it. In `src/app.js` change
   ```js
   dt.insertAdjacentHTML('beforeend', '<span class="sr">（終了）</span>');
   ```
   to
   ```js
   dt.insertAdjacentHTML('beforeend', '<span class="tag">終了</span>');
   ```
   This reuses the existing `.tag` style that 「今月」 and 「もうすぐ」 use, so the three states read as one system.
2. At deploy, wire the `scroll_depth`, `section_read` and `return_visit` events from 02-ux-ia §5. They confirm whether the utility-first order actually lifted depth on #unwell and #checklist.

**brand_distinctiveness**
1. The H1 swap to 「大阪で、暮らす。」 is still the strongest remaining lever, but it is the client's decision. If the tagline stays, 「大阪の暮らし・健康・美容を、出典つきで、もっと身近に。」 keeps it and adds the differentiator.

**traffic_acquisition**
1. After deploy, test each share path in LINE (iOS and Android) and X, to confirm that the labelled text and the `og-cover.jpg` card render as intended. The LINE in-app browser sometimes caches OGP, so use LINE's own OGP refresh when the image changes.

**future_bridge_readiness**
1. Before the first PR box ships, upgrade the operator disclosure to name the business category, after client and legal review, so the disclosure is on the page first.

## 5. Verdict
Yes. This appeals to a Japanese audience: a calm, trustworthy magazine for Osaka residents, with Kansai warmth and 保存版 utilities people will forward on LINE. It is ready to ship as the 創刊準備号.
