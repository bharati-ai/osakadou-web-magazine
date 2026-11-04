# Round 2 critique: marketing

I reviewed fresh renders at 390px (page about 16,700px tall) and 1280px, taken with headless Chromium on 2026-10-30, along with the `og-cover.jpg` share image, the `<head>` meta and the full visible copy. I read them against `round-1-changelog.md`.

Not scored: the 【要記入】 placeholders (now also 編集責任者) and the hotlinked Unsplash images.

## 1. Scores

| Parameter | R1 | R2 | Justification (evidence) |
|---|---|---|---|
| `concept_positioning` | 5 | **7** | **Better:**<br>• Above the fold, the deck 「大阪で、暮らす。住む人のための、出典つきWebマガジン。」 now says in one breath who the site is for and why to trust it.<br>• 編集部より backs this up: 「観光ガイドには載らない、毎日の大阪の話を届けます」.<br>• The cover is now a parent and child under ginkgo in 大阪城公園 (resident, not tourist).<br>• 天満・天神橋筋 replaces ベイエリア.<br><br>**Still short of 8:**<br>• The largest copy on the cover and the share image is still the generic H1 「…もっと身近に。」.<br>• 「大阪」 is never scoped. The checklist (転入届, 粗大ごみ, がん検診) and the guide series are 大阪市-only, but the calendar includes 岸和田 and the note photo is 箕面市. A reader in 堺 or 豊中 can't tell which rules apply to them. |
| `traffic_acquisition` | 5 | **7** | **Better:**<br>• The title is query-first: 「大阪の暮らし・健康・美容のWebマガジン｜OSAKA LIVE」.<br>• The description is built on concrete nouns (#7119・#8000, 12項目, 出典つき) and includes the reading オオサカライブ.<br>• `og-cover.jpg` is branded: masthead, tategaki H1, deck, 創刊準備号, `osakadou.live`, and the ginkgo photo, with width, height and alt.<br>• The quick-number card puts 119, #7119, #8000 and 06-6693-1199 in one screen, which makes a clean screenshot (mobile_07).<br>• 「保存版」 tags are on #unwell and #checklist.<br><br>**Still short of 8:**<br>• The two copy buttons copy a bare URL (`pageUrl + '#unwell'`), so a link pasted into LINE previews as the generic page card with no hint of what it is.<br>• The quick card's iPhone note points 「下の06から始まる番号へ」, which is outside the screenshot, so the shared screenshot is incomplete for iPhone users. |
| `engagement_retention` | 6 | **8** | • The cover lines now pay off (#areas, #unwell, #calendar, #checklist, #themes), with better voice: 「ごみの日、いつやったっけ？」.<br>• #contents is hidden on mobile, so the editor's note starts on screen 2 (mobile_00).<br>• The season card dims 9月 and tags 10月 「今月」 (mobile_05).<br>• The 15 grey chips became one honest 「これから始まる連載」 caption.<br>• The checklist persists across visits.<br>• Remaining nits are listed under optional improvements. |
| `brand_distinctiveness` | 5 | **7** | **Better:**<br>• 「大阪で、暮らす。」 gives "LIVE" a meaning.<br>• The branded share image.<br>• Kansai voice is now in the cover lines (「だけやない」「いつやったっけ？」).<br>• The kanji area marks now include 宮.<br>• The 「04」 numeral no longer breaks, and the duplicate header wordmark is hidden on the cover.<br><br>**Still short of 8:**<br>• The ownable line sits in 15px deck type, while the generic H1 gets the 30px tategaki and the biggest share-image type.<br>• In this render the series lists and 編集部より fall back from Mincho to Gothic, because `--mincho-sys` has no system Mincho here (desktop_03 and mobile_01). Android phones without Noto Serif CJK will see the same, so the magazine voice is lost exactly where it matters. |
| `content_strategy` | 6 | **7** | **Better:**<br>• The three swaps landed: 「大阪市のがん検診・特定健診ガイド」「大阪の気候に合わせた、季節のスキンケア」「大阪のだしと粉もんの話」.<br>• Health and guide are now all civic, sourced, high-demand bets.<br><br>**Still short of 8:**<br>• The theme 04 copy no longer matches its series (a regression from my round-1 swap). The description promises people (「店を営む人、ものをつくる人…話を聞き」), and cover line 05 promises 「大阪の『おもろい』ひと」. None of the three series is about people any more: だし・粉もん, 銭湯, ミュージアム.<br>• 「美容医療を検討する前に知りたいこと」 is still the most funnel-adjacent and 医療広告-exposed title on the page. |
| `future_bridge_readiness` | 6 | **8** | • The unqualified ad-free claim is gone from 編集部より. The commitment survives only time-scoped, in the policy (「当サイトでは現在…」).<br>• The 運営者情報 now discloses 「運営者は、OSAKA LIVEのほかにも事業を営んでいます。」.<br>• An 編集責任者 field is in place.<br>• There is a process statement on editorial judgement and a 「PR」 plus relationship-disclosure pre-commitment.<br>• The per-article reviewer pledge stays, and JSON-LD carries `correctionsPolicy` and `ethicsPolicy`.<br>• The 皮膚科 title is gone.<br>• Shippable groundwork. |
| `overall_marketing_effectiveness` | 5 | **7** | It now reads as a resident's magazine with a reason to share and return. To reach 8 it needs: positioning scope and hero line; shares that carry their own label; and one fixed theme-copy mismatch. |

## 2. Regressions

1. **Theme 04 copy and series mismatch** (see content_strategy). The cover line 05 sub-line 「大阪の「おもろい」ひとから」 points at nothing.
2. **The Mincho voice is lost where no system Mincho exists.** `.note-body` and `.series li` now use `--mincho-sys`. In this render both fall back to Gothic. In round 1 they rendered in Noto Serif JP.
3. **Gappy justification in the photo credits.** 「写真について」 justifies a run of Latin names, which produces spaced-out 「撮 影 ： Ryo Harianto 、」 (mobile_11).
4. **Minor:**
   - 「キタ・ミナミだけやない」 (cover line 01) is repeated as 「キタとミナミだけやない。」 in the #areas lede, so the joke lands twice.
   - The calendar lists 住吉祭 under 8月 even though it runs 「7月の海の日から8月1日まで」.

## 3. Fixes for parameters below 8

### A. concept_positioning (7 → 8)

**A1. Scope 「大阪」 in one line, where the rules bite.**

Checklist lede (`#checklist .lede`):
> 大阪に引っ越してきた人も、長く住んでいる人も。防災・医療・手続きの12項目です。手続きと検診は大阪市の制度をもとにしています。チェックの記録はこの端末の中にだけ保存されます。

Add at the end of 編集部より paragraph 2:
> 暮らしのガイドは、おもに大阪市の制度をもとにしています。

**A2 (client decision; also lifts brand to 8). Promote the ownable line to the hero.**

Swap the tategaki H1 and the deck, keeping the keywords in the H1:
```html
<h1 class="tate">大阪で、<br><span class="shu">暮らす。</span><span class="sr">大阪の暮らし・健康・美容のWebマガジン</span></h1>
```
```html
<p class="deck">大阪の暮らし・健康・美容を、もっと身近に。住む人のための、出典つきWebマガジン。</p>
```
Update the share image to match: the tategaki becomes 「大阪で、暮らす。」 and the deck carries the client tagline.

The `.sr` text is the same message as the visible deck, not hidden keyword-stuffing. If the client wants the tagline to stay the H1, skip A2. A1 alone gets positioning to about 7.5.

### B. traffic_acquisition (7 → 8)

**B1. Make copied and shared links carry their own label.** In LINE, the text pasted above the link is what gets read. Change the copy handler:
```js
$$('[data-copy]').forEach((b) => b.addEventListener('click', () =>
  copy(b, (b.dataset.label ? b.dataset.label + '\n' : '') + pageUrl + '#' + b.dataset.copy)));
```
Then add the labels to the buttons:
```html
<button class="copy-link" type="button" data-copy="unwell" data-label="大阪の休日・夜間の医療相談先（#7119・#8000ほか）｜OSAKA LIVE">相談先のリンクをコピー</button>
<button class="copy-link" type="button" data-copy="checklist" data-label="大阪暮らしチェックリスト（防災・医療・手続きの12項目）｜OSAKA LIVE">チェックリストのリンクをコピー</button>
```
In the `#share` handler, use `navigator.share({ title: document.title, text: '大阪で、暮らす。住む人のための、出典つきWebマガジン。', url: pageUrl })`.

**B2. Make the screenshot unit self-contained.** Put each fallback number inside its `.quick` row:
```html
<li><span>救急車を呼ぶか迷ったら（24時間）<small>つながらないとき 06-6582-7119</small></span><a href="tel:%237119">#7119</a></li>
<li><span>夜間の子どもの急病（19時〜翌8時）<small>つながらないとき 06-6765-3650</small></span><a href="tel:%238000">#8000</a></li>
```
```css
.quick span small{display:block;font-size:12px}
```
Change the note to: 「iPhoneで「#」から始まる番号に発信できないときは、各行の06から始まる番号へ。」

### C. brand_distinctiveness (7 → 8)

**C1.** Apply A2. The ownable line becomes the biggest type on the cover and in shares.

**C2. Restore Mincho on the series lists cheaply.** Add the 15 series titles' glyphs to the existing Noto Serif JP `text=` subset (about 60 extra glyphs, a few KB), and set `.series li{font-family:var(--mincho)}`. For `.note-body`, extend `--mincho-sys` with `"Noto Serif JP"` as the last named family before `serif`. It costs nothing where a system Mincho exists and keeps the subset path everywhere else.

**C3.** Stop justifying the credits: add `class="ragged"` to the 写真について `<p>` and the rule `.policy p.ragged{text-align:start}`.

### D. content_strategy (7 → 8)

**D1. Realign theme 04 with its series** (fixes regression 1). Replace the `#culture` description with:
> だしや粉もん、銭湯、ミュージアム。大阪の暮らしに根づく文化を、店を営む人やつくる人の話とあわせて紹介します。

**D2. Reframe the riskiest beauty title toward the reader's side.** Change 「美容医療を検討する前に知りたいこと」 to 「美容医療の前に確かめたい、契約と相談先」. The consumer-protection angle points to 消費者庁 and 国民生活センター sources, keeps the article away from clinic and treatment efficacy (less 医療広告 exposure), and reads as protective rather than a funnel.

## 4. Optional improvements (parameters at 8 or above)

**engagement_retention**
1. Highlight the next upcoming event, not only the current month. On 10/30 the 「今月」 event (だんじり 10/10–11) is already over, and the real hook, 光の饗宴 on 11/3, gets no mark. Give each `dd` a `data-start="2026-11-03"`, then:
   ```js
   const t = Date.now();
   const nx = $$('.ev dd[data-start]').find((d) => Date.parse(d.dataset.start) > t);
   nx?.previousElementSibling.insertAdjacentHTML('beforeend', ' <span class="tag">もうすぐ</span>');
   ```
2. Remove the repeated joke: change the #areas lede to 「6つのエリアの横顔を、住む人の目線と主な駅で紹介します。」

**future_bridge_readiness**
1. When the store link is ready, replace the generic disclosure with the category-level one 「健康関連商品のオンラインストアも運営しています」 **before** the first PR box ships, not with it. This needs client and legal review.
2. Launch-readiness: the policy says 「アクセス解析ツールは使用していません」. Without the cookieless Umami plan in 02-ux-ia §5, nobody can measure dwell, return visits or LINE referrals. Add it before launch and update the 外部送信 text.

## 5. Verdict
It now appeals to Japanese readers: it reads like a resident's magazine with Kansai warmth and 保存版 utility you would send to your family. Making 「大阪で、暮らす。」 the hero and having shares carry their own label would take it from good to memorable.
