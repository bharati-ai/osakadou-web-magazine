# Round 3 critique: marketing

**What I reviewed.** I took fresh renders at 390px (page about 16,800px tall) and 1280px with headless Chromium on 2026-10-31. I also looked at the updated `og-cover.jpg`, the `<head>` meta, the full visible copy and `src/app.js`, and read everything against `round-2-changelog.md`. The H1 swap is treated as a client decision and is not scored down.

**Capture note: not a defect, so others don't misreport it.** In some headless captures the masthead, cover photo and reveal blocks look washed out. That is the `rise` animation and the `.rv` transition caught mid-way under virtual time. With `--force-prefers-reduced-motion`, or with `--run-all-compositor-stages-before-draw`, the masthead renders at full ink (`rgb(28,36,51)`) and the photo at full contrast.

**Not scored:** the 【要記入】 operator, 編集責任者 and contact fields; hotlinked Unsplash images; cookieless analytics (a deploy item).

## 1. Scores

| Parameter | R1 | R2 | R3 | Justification (evidence) |
|---|---|---|---|---|
| `concept_positioning` | 5 | 7 | **8** | The cover now leads with 「**大阪で、暮らす。**」 in larger 朱 type, followed by 「住む人の目線で、出典を明記して書くWebマガジン。」, visible on the 390px first screen and on the share image. 編集部より contrasts it with tourism (「観光ガイドには載らない、毎日の大阪の話」) and now scopes the coverage (「制度や手続きの情報は、まず大阪市のものから扱います」). The checklist adds 「（制度は大阪市の場合）」. A reader can say who it is for and why it isn't Lmaga, OSAKA-INFO or a ward page. Nit: the generic H1 「…もっと身近に。」 is still the largest type, but that is a client decision. |
| `traffic_acquisition` | 5 | 7 | **8** | The title and description are query-first and use concrete nouns. The share image is branded, with the deck in 朱. Both copy buttons now paste a labelled link into LINE (`data-text` 「大阪の休日・夜間の医療相談先（#7119・#8000ほか）｜OSAKA LIVE」 plus the URL), and `navigator.share` sends the deck text. The quick card is self-contained: the 06 fallbacks sit in the rows, and one note covers the iPhone, ダイヤル回線 and IP電話 cases. The reorder lifts `#unwell` from about 61% to about 22% of the mobile scroll. Cover line 03 updates by date and reads 「11月は大阪・光の饗宴ほか。季節の体調メモも」 on 10/31, a timely hook. |
| `engagement_retention` | 6 | 8 | **8** | The page order now matches the cover lines: 編集部より, エリア, 相談先, カレンダー, チェックリスト, then the 5 themes. Utility content comes before promises, and the 目次 has 6 entries in page order. The calendar tags 「今月」 and 「もうすぐ」 and dims past months. The checklist persists. Nits are under §4. |
| `brand_distinctiveness` | 5 | 7 | **7** | Better: 「大阪で、暮らす。」 now reads as the brand line on the cover and the share image. The series lists are back in the Mincho webfont (desktop_b_06). The 保存版 tag is 朱. The kanji marks and the Kansai cover lines (「ごみの日、いつやったっけ？」) carry the voice. **Holding it at 7 is a new numbering clash on the first desktop screen** (desktop_b_00): the header nav still reads 「01 暮らし 02 健康・医療 03 美容 04 カルチャー 05 ガイド」 directly above cover lines that read 「01 大阪の『ふだん』を歩く 02 近所のお医者さん…」. On a design that uses numbers as its masthead device, two different 「01」s in one viewport look unedited. |
| `content_strategy` | 6 | 7 | **8** | The theme 04 copy now matches its series (「だしや粉もん、銭湯、ミュージアム…店を営む人やつくる人の話とあわせて」). The riskiest beauty title is reframed toward the reader: 「美容医療の前に確かめたい、契約と相談先」. The 15 titles now balance civic authority (検診, 休日・夜間, ごみ, 引っ越し, 南海トラフ), Osaka-specific culture and food (だし・粉もん, 銭湯), and a beauty pillar with an Osaka angle (気候). The path from the LP to the hubs is clear. |
| `future_bridge_readiness` | 6 | 8 | **8** | Unchanged and sound: there is no unqualified "no ads" claim; the 広告・PR statement is time-scoped; the operator's other businesses are disclosed; there is a 編集責任者 field, a commitment to label PR and state the relationship, and a per-article reviewer pledge; `correctionsPolicy` and `ethicsPolicy` are in JSON-LD. The reframed 美容医療 title removes the last funnel-shaped item. |
| `overall_marketing_effectiveness` | 5 | 7 | **8** | A top Japanese media team would ship this pre-launch issue with minor nits. It has a clear resident positioning, branded and labelled sharing, utility first, and trust groundwork. The one visible flaw is the nav numbering. |

## 2. Regressions

1. **The header nav no longer matches the page (caused by the reorder).** Its numbers 01–05 now collide with the cover lines and the 目次 01–05/06. All five header links also jump to the 5つのテーマ block, now the last content section before the policy. The utility sections the page leads with are not in the header at all.
2. **Latent calendar bug in June.** `parseInt('7〜8月')` returns 7, so in June both 「7月」 and 「7〜8月」 get 「もうすぐ」. It is harmless in other months, but it will show up next June.

## 3. Fixes for parameters below 8

### brand_distinctiveness (7 → 8)

**B1. Make the header nav match the cover lines and the 目次.** This fixes regression 1. In `src/body.html`, replace `<nav aria-label="テーマ">…</nav>` with:
```html
<nav aria-label="セクション">
  <a href="#areas"><span>01</span>エリア</a>
  <a href="#unwell"><span>02</span>相談先</a>
  <a href="#calendar"><span>03</span>カレンダー</a>
  <a href="#checklist"><span>04</span>チェックリスト</a>
  <a href="#themes"><span>05</span>連載</a>
</nav>
```
One numbering system then runs through the header, the cover and the 目次, and the header points to the sections that hold content. The theme blocks keep their own 01–05 inside section 05, which reads as nested and is fine.

**B2 (client decision, optional).** The H1 swap to 「大阪で、暮らす。」 is still the single biggest brand lever, but B1 alone reaches 8.

## 4. Optional improvements (parameters at 8 or above, at most 2 each)

**concept_positioning**
- If the client keeps the H1, consider one more ownable word in it at the next copy review. For example, 「大阪の暮らし・健康・美容を、出典つきで、もっと身近に。」 keeps the tagline and adds the differentiator.

**traffic_acquisition**
1. The desktop share fallback copies a bare URL. Label it like the section buttons: `copy(btn, 'OSAKA LIVE｜大阪で、暮らす。\n' + pageUrl)`.
2. Update `og:image:alt` to match the new image: `OSAKA LIVE 創刊準備号　大阪で、暮らす。住む人の目線で、出典を明記して書くWebマガジン。`

**engagement_retention**
1. Fix the June double tag (regression 2). In the dt loop in `src/app.js`, add `if (dt.textContent.includes('〜')) return;` before computing `d`, or give each `dt` an explicit `data-m`.
2. When the cookieless analytics go in at deploy, add the `scroll_depth`, `section_read` and `return_visit` events from 02-ux-ia §5. They confirm whether the reorder actually lifted depth on #unwell and #checklist.

**content_strategy**
- Editorial sequencing, not a page change: publish the civic health and guide pieces (休日・夜間, 検診, ごみ, 引っ越し) first. The beauty pillar should follow once authorship and reviewers are named.

**future_bridge_readiness**
- Before the first PR box ships, upgrade the generic disclosure to name the business category (「健康関連商品のオンラインストアも運営しています」), after client and legal review. Make sure that update reaches the page first, before the PR box.

## 5. Verdict
Yes, this now appeals to a Japanese audience. It reads like a resident's magazine with Kansai warmth, 保存版 utilities you would forward to family on LINE, and a trust layer most local media don't have. Fix the nav numbering and it is ready to launch as a pre-launch issue.
