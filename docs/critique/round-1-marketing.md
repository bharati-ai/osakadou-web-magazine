# Round 1 critique: marketing

I reviewed the page rendered at 390px and 1280px (headless Chromium, 2026-10-30), the source of `index.html`, `01-research.md` §1–4, `02-ux-ia.md` and `04-copy-ja.md`. I ran SERP spot-checks, but the search tool is US-based and not Google Japan, so treat them as directional only:
- 「大阪 かかりつけ医 見つけ方」 and 「大阪 休日 夜間 医療相談 #7119」 return only mhlw.go.jp, pref/city.osaka.lg.jp, 大阪府医師会 and municipal PDFs.
- 「大阪 皮膚科 探し方」 returns only directories and booking sites (iタウンページ, ホットペッパービューティー クリニック).
- 「"OSAKA LIVE" オオサカライブ」 returns Billboard Live OSAKA, live-music tours and live cams.

Pending items (operator 【要記入】, hotlinked Unsplash) are noted and not scored.

## 1. Scores

| Parameter | Score | Justification (evidence) |
|---|---|---|
| `concept_positioning` | **5** | The H1 「大阪の暮らし・健康・美容を、もっと身近に。」 uses a stock phrase you also see on clinic and municipal sites. The page's real differentiator (resident-first, sourced, dated, ad-free) appears only in paragraphs 3–4 of 編集部より and in the policy. Nothing above the fold tells a reader why this beats Lmaga or a ward page. The cover photo is night 道頓堀, the most tourist image of Osaka. The area set (キタ/ミナミ/中之島/天王寺/大阪城/ベイエリア) is OSAKA-INFO's visitor map. 美容 has no Osaka angle, so it reads as bolted on. The positioning line is also inconsistent: the H1 says 暮らし・健康・美容, the footer says 「暮らし・健康・カルチャーのWebマガジン」. |
| `traffic_acquisition` | **5** | The title leads with the brand, and nobody searches the H1. `og:image` is the raw Unsplash 道頓堀 photo with no masthead or text, so a LINE or X preview looks like any travel blog. The most share-worthy and rankable block, `#unwell`, starts about 65% of the way down the mobile page (≈y11,100 of ≈17,200px), after 3.5 screens of 「準備中」 themes. Its four numbers are spread over about 740px with prose in between, and the faint Bodoni 「#」 makes them hard to capture cleanly in one screenshot. The brand name competes with 「Billboard Live OSAKA」 and live-music results. What works: fast static HTML, clean JSON-LD, deep-link copy buttons, the Web Share API. |
| `engagement_retention` | **6** | Strengths: the cover lines (「ごみの日、覚えてる？」「近所の病院、どう探す？」) are the best hooks on the page; the season card auto-promotes; the checklist persists in localStorage. Weaknesses: every cover line jumps to a theme block that contains only three 「準備中」 titles, so the hook has no payoff. The 5 cover lines are followed directly by the 9-row 「この号の目次」 (mobile_00 → mobile_01), about 1.5 screens of navigation in a row. On 10/30 the 「いまの季節」 card leads with two **past** events (だんじり 9/19–20 and 10/10–11), so on launch day it looks unmaintained. The 15 grey 「準備中」 chips repeat the message "nothing here yet". |
| `brand_distinctiveness` | **5** | 「OSAKA LIVE」 is two generic English words. Japanese readers parse 「ライブ」 as concert or livestream, and the domain `osakadou.live` doesn't match the brand name. The Bodoni masthead reads as a generic fashion title. Ownable assets exist but are under-used: the kanji area marks 北/南/中/天/城/港, the tategaki H1 in 朱, and the seigaiha strip. The voice is careful but bland (「等身大で」「落ち着いて読む」「もっと身近に」); only 「おもろい」 and 「やない」 sound like Osaka. On desktop the theme numeral 「04」 breaks onto two lines ("0" above "4", desktop_03), which looks broken on a numbered-masthead design. |
| `content_strategy` | **6** | The 05 guide titles are the right first bets: ごみ分別, 引っ越し手続き and 南海トラフ all have recurring, high-volume demand, and the government pages answering them are hard to read. 「休日・夜間の医療相談」 and 「かかりつけ医」 are realistic as YMYL topics because they are civic, sourced and non-commercial. The weak picks: 「大阪で皮膚科を探すときのポイント」 lands in a directory/booking SERP, sits under 医療広告ガイドライン risk, and is the title closest to a health-store funnel. 03 has no Osaka angle (「化粧品の成分表示の読み方」 competes with @cosme, LIPS and brand sites). 「大阪のつくり手を訪ねて」 has no search demand. Food, Osaka's biggest search and social category, is missing even though MAFF-verified facts are already in §2.2. Theme→hub paths are clear (`#t1`–`#t5` map to future hubs). |
| `future_bridge_readiness` | **6** | Strong groundwork: the 「広告・PR表記について」 pre-commitment (PR label, relationship disclosure, no product links in health article bodies); sources and 「最終確認日」 on every utility block; the per-article reviewer-credential pledge; `publishingPrinciples` in JSON-LD. Risks: 編集部より states 「OSAKA LIVEでは、商品の販売や広告の掲載を行っていません。」 as an unqualified fact in the most-read trust paragraph. That is the exact line someone will screenshot next to the first PR box. The page doesn't disclose that the operator runs other businesses (research §4.3 rule 5 says to do this now). There's no editorial-independence clause, the editors are anonymous, and the shared 「osakadou」 domain stem will let readers find the store relationship themselves before you tell them. |
| `overall_marketing_effectiveness` | **5** | This is a trustworthy, well-crafted pre-launch page whose trust layer is above the Japanese local-media norm. As an acquisition asset it doesn't work yet: the positioning is generic, the brand preview is unbranded, the hooks lead nowhere, and the useful content sits at the bottom. Most fixes are copy, `href` or a few lines of CSS/JS, and they should take it to about 7. |

## 2. Prioritised fixes (every parameter is below 8)

### A. concept_positioning (5 → 7)

**A1. Add a one-line positioning deck that also gives "LIVE" a meaning (highest impact).** In `.cover-top`, after `<p class="issue">…</p>`, add:
```html
<p class="deck">大阪で、暮らす。住む人のための、出典つきWebマガジン。</p>
```
```css
.deck{flex-basis:100%;margin:0;font-size:13px;letter-spacing:.12em;color:var(--ink-2)}
```
Reader takeaway in one breath: *for residents, not tourists, and checked against sources.* That is a slot Lmaga (play and PR), OSAKA-INFO (visitors) and ward pages (accurate but unreadable) don't hold. 「出典つき」 is verifiable on the page itself, so it is not a superlative.

**A2. State the contrast in 編集部より paragraph 1** without naming competitors. Replace `note.p1` with:
> OSAKA LIVEは、大阪で暮らす人のためのWebマガジンです。観光やグルメの情報は、すでにたくさんあります。わたしたちが届けたいのは、通勤の電車、商店街の夕方、川沿いの散歩道、そして病院やごみの日のこと。住む人の毎日の延長にある話題を、読みものとして届けていきます。

**A3. Make the positioning line consistent.** In the footer, change `大阪で暮らす人のための、暮らし・健康・カルチャーのWebマガジン。` to `大阪で暮らす人のための、暮らし・健康・美容・カルチャーのWebマガジン。`

**A4. Make the cover photo say "resident".** Swap the cover `img` (and later the OGP crop) from 道頓堀 (`photo-1584505489290…`) to the theme-01 photo already on the page, 「自転車が並ぶ大阪の路地と、一匹の猫」 (`photo-1646536590706-42fc527f35c9`). It is the only image on the page that shows the 「ふだん」 the copy promises, and it is more memorable than the most-photographed canal in Japan. Keep `object-fit:cover` and tune `object-position` so the cat stays in frame. Move the 道頓堀 photo to the ミナミ card if you want it on the page.

**A5. Swap one tourist area for one resident area.** Replace the ベイエリア card, the only card without a photo, with 天満・天神橋筋. Use no numbers, because 2.6km/600店 are ◐ and the copy rule allows ✅ only:
```html
<article class="area"><div class="area-ph sea" aria-hidden="true"></div><div class="area-in"><span class="kanji" aria-hidden="true">宮</span><h3>天満・天神橋筋<small>Tenma / Tenjinbashisuji</small></h3><p>大阪天満宮の門前町として育った、天神橋筋商店街のある街。アーケードが南北に長く続き、日々の買い物の人でにぎわいます。</p><dl><dt>こんな日に</dt><dd>商店街で晩ごはんの買い物をする日</dd><dt>主な駅</dt><dd>南森町、大阪天満宮、扇町、天満、天神橋筋六丁目</dd></dl></div></article>
```
Then change both contents rows (`#contents` and `dialog.toc`) from 「キタからベイエリアまで、6エリアの横顔。」 to 「キタ・ミナミから天満まで、6エリアの横顔。」

### B. traffic_acquisition (5 → 7)

**B1. Branded OGP image.** This matters most for LINE and X, where most of the 25–55 audience will first meet the brand. Add a self-hosted `/og-cover.png` (1200×630) at deploy: the OSAKA LIVE masthead, the tategaki H1, 「創刊準備号」, a seigaiha strip, and all text inside the centre 1000×530 (this is the spec in 02-ux-ia §4). Then:
```html
<meta property="og:image" content="https://osakadou.live/og-cover.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="OSAKA LIVE 創刊準備号　大阪の暮らし・健康・美容を、もっと身近に。">
```

**B2. Query-first title, plus a description built on concrete nouns.**
```html
<title>大阪の暮らし・健康・美容のWebマガジン｜OSAKA LIVE</title>
<meta name="description" content="大阪で暮らす人のためのWebマガジン「OSAKA LIVE（オオサカライブ）」。休日・夜間の医療相談先（#7119・#8000）、祭りと体調の季節カレンダー、防災・ごみ・転入の12項目チェックリストを、公的な出典つきでまとめました。">
```
Use the same text for `og:description`. The katakana reading helps separate brand searches from the live-music results.

**B3. A screenshot-sized number card at the top of `#unwell`** (in Japan a block like this gets screenshotted and forwarded on LINE). Insert it right after `.u-alert`:
```html
<ul class="quick" aria-label="おもな相談先の番号">
  <li><span>救急車を呼ぶか迷ったら</span><a href="tel:%237119">#7119</a></li>
  <li><span>夜間の子どもの急病（19時〜翌8時）</span><a href="tel:%238000">#8000</a></li>
  <li><span>いま受診できる医療機関（24時間）</span><a href="tel:0666931199">06-6693-1199</a></li>
</ul>
```
```css
.quick{margin:0 0 24px;border-top:1px solid var(--line)}
.quick li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid var(--line)}
.quick span{font-size:13px;color:var(--ink-2)}
.quick a{font-family:var(--gothic);font-weight:700;font-size:22px;color:var(--shu);text-decoration:none;min-height:44px;display:inline-flex;align-items:center;white-space:nowrap}
```
With the existing 119 bar, all four numbers now fit in about 260px on mobile. The card uses Gothic bold because the Bodoni 「#」 in `.res .num` renders as a hairline in the screenshot (mobile_08) and can be misread as 「7119」. Also add `<span class="tag">保存版</span>` after the H2 「体調がすぐれないときの相談先」.

**B4. Put place names into the utility ledes** for long-tail matching. In `#unwell`, use 「救急車を呼ぶか迷うときや、休日・夜間に困ったときの、大阪府・大阪市の公的な相談窓口です。」 In `#checklist`, use 「大阪に引っ越してきた人も、長く住んでいる人も。防災・医療・手続きの12項目です。チェックの記録はこの端末の中にだけ保存されます。」 The second also gives a 新生活-season hook for March–April.

### C. engagement_retention (6 → 8)

**C1. Point the cover lines at sections that actually pay off (an `href` and copy change, highest ROI).** Replace the `ol.coverlines` items with:
```html
<li><a href="#areas"><span class="n">01</span><b>大阪の「ふだん」を歩く</b><small>キタ・ミナミから天満まで、6エリアの横顔</small></a></li>
<li><a href="#unwell"><span class="n">02</span><b>近所の病院、どう探す？</b><small>#7119から休日の診療所まで、相談先の一覧</small></a></li>
<li><a href="#calendar"><span class="n">03</span><b>この季節の大阪、なにがある？</b><small>祭りと行事と、季節の体調メモ</small></a></li>
<li><a href="#checklist"><span class="n">04</span><b>ごみの日、覚えてる？</b><small>防災・医療・手続きを12項目でチェック</small></a></li>
<li><a href="#themes"><span class="n">05</span><b>これから始まる、15の連載</b><small>大阪の「おもろい」ひとから、キレイの話まで</small></a></li>
```
These cover lines now sell what this issue actually contains, as a printed magazine cover would. The `aria-label="この号の特集"` becomes accurate.

**C2. Remove the navigation-on-navigation stretch on mobile.** The header 「目次」 button and the cover lines already cover it:
```css
@media (max-width:599px){#contents{display:none}}
```
This saves about 1,200px before 編集部より on phones. Keep it on desktop, where it is a short two-column block.

**C3. Mark past events in the current season** so the calendar looks maintained on any day. Add this to the season IIFE:
```js
const m = new Date().getMonth() + 1;
$$('.season.is-now .ev dt').forEach((dt) => {
  const k = parseInt(dt.textContent, 10), d = (m - k + 12) % 12;
  if (d === 0) dt.insertAdjacentHTML('beforeend', ' <span class="tag">今月</span>');
  else if (d < 3) { dt.classList.add('past'); dt.nextElementSibling.classList.add('past'); }
});
```
```css
.ev .past{opacity:.5}
```
On 10/30 this dims 9月 and puts 「今月」 on 10月; it wraps correctly through 12→1→2.

**C4. Replace the filler autumn memo with a quotable, verified Osaka fact** (JMA normals ✅, §2.6):
> 体調メモ　大阪の平年の月平均気温は、10月が19.5℃、11月が13.8℃。ひと月で5℃以上下がります。重ね着で調節しやすくし、不調が続くときは医療機関に相談を。

**C5 (optional, client to confirm).** Add a one-line 「更新の記録」 in `#policy`: 「2026年10月30日　創刊準備号を公開」, then append real updates as they happen. It gives readers a visible reason to come back and costs nothing. Do not add a dated 次号予告.

### D. brand_distinctiveness (5 → 7)

**D1.** The A1 deck 「大阪で、暮らす。」 is also the brand fix. It turns "LIVE" from "concert" into "to live", and it gives you a line people can quote.
**D2.** Branded OGP (B1). Today the brand isn't visible anywhere it gets shared.
**D3.** Fix the desktop numeral break: `.theme-no{white-space:nowrap}`. Any overflow lands in the 48px column gap. If it collides, cap the size with `font-size:clamp(64px,8vw,104px)` instead.
**D4 (optional).** Hide the duplicate header wordmark while the cover masthead is on screen (on mobile the two are stacked about 100px apart):
```js
new IntersectionObserver(([e]) => $('.hd').classList.toggle('on-cover', e.isIntersecting)).observe($('.masthead'));
```
```css
.hd .logo{transition:opacity .3s}.hd.on-cover .logo{opacity:0}
```

### E. content_strategy (6 → 8)

Swap three series titles. Each new title is more Osaka-specific, has search demand, and is further from commerce.
| Theme | Replace | With | Why |
|---|---|---|---|
| 02 | 大阪で皮膚科を探すときのポイント | 大阪市のがん検診・特定健診ガイド | The SERP for 皮膚科 is all directories and booking sites, it carries 医療広告ガイドライン risk, and it looks like a store funnel. Screening has annual recurring demand (§3: 「大阪市 がん検診 料金」「大阪市 特定健診 受け方」), the ✅ facts are already on the page, and it has zero commerce adjacency. |
| 03 | 季節ごとのスキンケアの基本 | 大阪の気候に合わせた、季節のスキンケア | Gives 美容 an ownable Osaka angle (JMA humidity and temperature, §2.6; §3 「大阪 夏 湿気 髪」). |
| 04 | 大阪のつくり手を訪ねて | 大阪のだしと粉もんの話 | Food is Osaka's largest search and social category. The facts are MAFF-verified (§2.2), and it reads as 暮らし, not as Lmaga-style gourmet. An alternative is 「大阪のレトロ建築さんぽ」 (§3 query; very strong on Instagram). |

Sequencing note for the editorial plan, not the page: publish the civic health pieces (休日・夜間, 検診, かかりつけ医) before any 美容医療 piece.

### F. future_bridge_readiness (6 → 8)

**F1. Time-scope the ad-free promise** so it can't be screenshotted later as a broken promise. Replace 編集部より paragraph 3 with:
> 創刊準備号の時点で、OSAKA LIVEに広告の掲載や商品の販売はありません。今後、運営者に関わる商品やサービスに触れるときは、そのすぐ近くに「PR」と表示し、運営者との関係も記します。健康や美容の記事は一般的な情報で、医師や専門家の判断に代わるものではありません。気になる症状は、医療機関にご相談ください。

**F2. Disclose now that the operator runs other businesses** (research §4.3 rule 5). In 「運営者情報」, after 連絡先, add:
> 運営者は、OSAKA LIVEのほかにも事業を営んでいます。その事業に関わる内容を扱うときは、下の「広告・PR表記について」にしたがって表示します。

The gold standard is the stronger version, 「運営者は、健康関連商品のオンラインストアも運営しています。」 with no name and no link. Disclosing it now means the later PR box arrives as announced instead of as a reveal, and the shared 「osakadou」 domain stem makes discovery likely anyway. This is a client decision and needs legal review.

**F3. Add an editorial-independence clause** to 「広告・PR表記について」 (02-ux-ia §3.4 asked for this, but it was dropped from the build):
> 運営者の事業は、記事のテーマ選びや内容の判断に関与しません。

**F4.** Before launch, name a 編集責任者 in 運営者情報 (real person and role; never invent one). Anonymous 「編集部」 is the biggest remaining E-E-A-T gap for a YMYL site.

### G. overall (5 → 7)
Apply C1, A1/D1, F1, B1, B3 and C3, in that order. Together they are about 40 lines of change.

## 3. Verdict
Japanese readers will find it tasteful and trustworthy, but right now it reads as a careful municipal pamphlet in magazine clothes. A reader can't yet say why it's *theirs*. Answering 「大阪で、暮らす。」 above the fold and making the cover lines pay off would make it appealing.
