# Round 1 critique: jp-market (native Kansai editor / brand strategist)

Reviewed: http://localhost:5178/ at 390px and 1280px, in light mode and in dark mode (`--blink-settings=preferredColorScheme=0`; `--force-dark-mode` has no effect on prefers-color-scheme in headless-shell). I also read the full `index.html` source, `03-photos.md` and `04-copy-ja.md`.
I checked the typography fixes in T1 below by rendering a scratch copy of the page with that CSS added. The results: "04" stays on one line, Latin text keeps its normal letter spacing, `#7119` is legible, and station names and `24時間・365日` no longer break mid-word.

Pending items, not scored: 運営者/連絡先【要記入】, and the Unsplash hotlinks.

## Scores

| Parameter | Score | Justification (evidence) |
|---|---|---|
| jp_copy_naturalness | **7** | Clean, grammatical, polite editorial Japanese with no obvious 翻訳調. Cover lines such as 「キレイの話を、等身大で」 and 「ごみの日、覚えてる？」 read like a real magazine. The problems are bland, repetitive phrasing and a few stiff spots. The same 「商店街／川」 triad appears three times: cover 「駅と商店街と、川のある毎日」, note 「通勤の電車、商店街の夕方、川沿いの散歩道」, theme 01 「通勤路、商店街、川沿いの公園」. Stiff spots: 「劇場や食の店も多い街」 (食の店 is unnatural), 「服装で調節しやすくし」, 「平年値で1年でいちばん…」, 「公的機関の情報で確認し」, and 「気になる項目から、どこからでも読めます」 (から…から). Footer 「大阪で暮らす人のための、暮らし・…」 repeats 暮らす／暮らし. 「隣り合います」 is used twice in the area cards. The 編集部より reads like 利用規約: two of its four paragraphs are disclaimers, and there is no editorial voice. |
| osaka_authenticity | **6** | The practical layer is genuinely local, better than most Tokyo-made "Osaka" sites: さんあ～る, the 24区 hazard maps, the 大阪市国保 特定健診 being free, 救急安心センターおおさか, the separate だんじり 9月/10月祭礼 (岸和田・春木/山手), and 造幣局 通り抜け 事前予約制. The editorial and visual layer is a tourist guidebook. The hero is the inbound-tourist shot of 道頓堀 neon with a 遊覧船, and 道頓堀 appears again on the ミナミ card. 大阪城 appears twice (note photo and 京橋 card), alongside 梅田スカイビル and 通天閣. Every place name carries romaji ("Kita / Umeda, Osaka"). The area guide promises 「キタとミナミだけやない」 and then lists the six areas every guidebook covers. Half the calendar months are weather fillers (「春の気配」「初夏の陽気」「暑さの盛り」) where real local events belong. |
| jp_reader_resonance | **5** | The bookmark-worthy content (#7119 list, checklist, 季節カレンダー) is buried 9,000px down on mobile, after five theme blocks carrying **15 grey 「準備中」 tags**. To a Japanese reader that reads as 工事中 rather than 創刊準備号. 創刊準備号 itself is a familiar term, but nothing says when or how the real issue arrives, so the framing feels like a shell. The name "OSAKA LIVE" reads as ライブ (live music or streaming), and on mobile the clarifying 「大阪の暮らしマガジン」 is hidden (`.logo small{display:none}` under 959px). The tourist hero tells a resident "this isn't for me" before the first scroll. The 相談先 block is the one part people would forward on LINE. |
| jp_design_conventions | **7** | The magazine grammar is right: a masthead, 号数 (創刊準備号), cover lines 01–05, a 目次 with dotted leaders (リーダー罫), a vertical h1 and vertical 編集部より, EN+JP section heads, and 朱 numbering. Against it: the desktop theme number "04" is visibly broken onto two lines ("0" above "4"); only one photo has a caption, while Japanese city magazines caption everything with place and 区; the 目次 appears three times back-to-back (cover lines, 目次 section, header nav and dialog); the ベイエリア card uses a 青海波 placeholder that reads as a missing image; and the photo treatment is inconsistent (oversaturated HDR neon, postcard blue sky, beige stock cosmetics). |
| jp_typography | **6** | Good foundations: Mincho headings and Gothic body text, `line-break:strict`, `auto-phrase` on headings, `vert`/`vrt2` on the vertical h1, and 2.05 leading in the note. The rendering has many 組版 faults. Single-character and short last lines: 「…届けていきま／す。」 (note, mobile), 「…ご相談くださ／い。」 (02 notice, mobile), 「方。」「の話。」「横顔。」「一覧。」 (目次 descriptions, mobile), and 「ます。」「ました。」「です。」 at the end of the ledes on desktop. `text-justify:inter-character` letter-spaces Latin ("C h e w、M i n g e o n"). Justified 15-character card text leaves wide gaps (「北 の 玄 関 口。高 層 ビ ル と 地 下」). Words break mid-way: 「西／梅田」, 「24時間・365／日」, 「キタ（梅田・／大阪）」. The `#` in `#7119` is a hairline Bodoni glyph that is nearly invisible. On Windows, body text falls back to thin Yu Gothic Regular, and the grey ledes become hard to read for readers in their 40s and 50s. |
| trust_anshin | **7** | Above the Japanese web average. There is a 編集方針 that commits to 一次情報, 出典 links to 大阪市消防局/大阪府, 最終確認日, a policy on PR labelling, and a 外部送信 statement. The health tone is calm, and 「命に関わる緊急時は、迷わず 119」 is handled well. Against it: the disclaimers repeat four times (note, 02 notice, 相談先, policy), which reads as defensive. The note states flatly 「商品の販売や広告の掲載を行っていません」 without 「現在」. With a sister store planned, that sentence will later look like a broken promise, and it contradicts the careful 「現在…今後…PR」 wording in the policy. Emergency numbers are set in a decorative Didone. The photo credits, a list of eleven foreign names, confirm the "made from tourist photos" impression. |
| overall_jp_appeal | **6** | The structure would earn an Osaka editor's respect, and so would the practical section, which is more locally correct than most sites. The cover and photos read as inbound tourism, the 15 準備中 tags read as 工事中, and the typesetting has visible orphans. A Japanese reader would notice. |

## Prioritized fixes (all parameters are below 8)

### jp_typography: 6 → 8 (T1 checked in a scratch render)

**T1. CSS (layout, orphans, Latin spacing, emergency numbers).** Replace line 53:
```css
.note-body p,.theme-txt>p,.area p,.policy p,.lede{text-align:justify;text-justify:inter-character}
```
with:
```css
.note-body p,.theme-txt>p,.policy p{text-align:justify}
p,.contents .d,.coverlines small,.area dd,.ev dd{text-wrap:pretty}
.lede,.contents .d,.coverlines small,.notice,.area dd,.res .meta,.disclaimer,.ev dd small{word-break:auto-phrase}
.theme-no{white-space:nowrap}
.res .num,.u-alert a{font-family:var(--gothic);font-weight:700;letter-spacing:.02em}
```
Effects:
- Desktop "04" stays on one line. The root cause is the 140px column combined with `overflow-wrap:anywhere` on body.
- Latin names lose the inter-character spacing.
- Cards and ledes become ragged-right with no gaps.
- 目次 descriptions break by phrase, e.g. 「街の日常、住まい、移動、／季節の過ごし方。」.
- 「西梅田」 and 「24時間・365日」 stay intact.
- `#7119`, `#8000` and `06-6693-1199` become bold Gothic, the way Japanese public signage sets phone numbers.

**T2. Windows body face.** On line 23, append `&family=Noto+Sans+JP:wght@400;700` to the Google Fonts URL. `--gothic` already lists "Noto Sans JP" after Hiragino, so iOS and macOS keep Hiragino while Windows gets Noto instead of thin Yu Gothic Regular. The privacy note already declares Google Fonts.

**T3. Area card headings.** Drop the romaji (it reads as made for inbound tourists) and stop 「キタ（梅田・／大阪）」 from breaking. Change the CSS to `.area h3 small{font-family:var(--gothic);font-weight:400;font-size:12px;letter-spacing:.06em}`, then use this markup:
- `<h3>キタ<small>梅田・大阪駅周辺／北区</small></h3>`
- `<h3>ミナミ<small>なんば・心斎橋／中央区・浪速区</small></h3>`
- `<h3>中之島・北浜<small>北区・中央区</small></h3>`
- `<h3>天王寺・阿倍野<small>天王寺区・阿倍野区・浪速区</small></h3>`
- `<h3>京橋・大阪城<small>都島区・中央区</small></h3>`
- `<h3>ベイエリア<small>港区・此花区・住之江区</small></h3>`

The 区名 are something residents actually use, and they add local texture (this also lifts osaka_authenticity).

**T4. Kicker spacing.** At mobile width, 「編 集 部 よ り」 at `.3em` looks amateur. Use `@media (max-width:959px){.note .kicker{letter-spacing:.12em}}`.

### jp_reader_resonance: 5 → 7

**R1. Remove the 工事中 signal.**
- Delete all 15 instances of `<span class="tag">準備中</span>`.
- Change the 5 instances of 「準備中の連載」 to 「これから始まる連載」.
- Change the 目次 lede to: 「創刊準備号の目次です。連載は、準備が整ったものから順次公開していきます。気になるところから、どうぞ。」 This is informational and is not a CTA.

**R2. Label the useful pages 保存版**, the classic Japanese magazine trigger for bookmarking. Make `<span class="tag" style="border-color:var(--shu);color:var(--shu)">保存版</span>` the first child of `.sec-head` in both `#unwell` and `#checklist`. This is an editorial label, not a superlative and not a CTA.

**R3. Make the name readable as 暮らし, not ライブ, on mobile.** Change `.issue` to `<p class="issue">大阪の暮らしマガジン　創刊準備号<span class="en">Autumn 2026</span></p>`, or stop hiding `.logo small` under 959px.

**R4. Change the hero photo.** This is the single biggest lever, covered under A1. With R1–R3 alone the score rises to 6. With A1 as well it rises to 7.

### osaka_authenticity: 6 → 8

**A1. Photos: resident-first, with no duplicate landmarks.**
- Hero: replace the 道頓堀 neon. My first choice is new sourcing of 「御堂筋のイチョウ並木（秋）」. It suits an "Autumn 2026" issue, and every Osaka resident recognises it as theirs. 天神橋筋商店街のアーケード would also work. Verify the location the same way `03-photos.md` does.
- Fallback from photos already verified in `03-photos.md`: the hero backup 「夕暮れの大阪スカイライン」 (Sir. Simo), or the guides best 「西九条駅の静かなホーム」 (Rachel T).
- Note photo: swap the second 大阪城 for the already-verified season-autumn backup 「箕面・龍安寺の赤い橋と紅葉」 (Ryo Harianto, portrait), captioned 「紅葉の箕面」. 箕面 is where Osaka residents actually go for 紅葉.
- At deploy, consider `filter:saturate(.85)` on `.cover-photo img,.theme figure img,.area-ph img,.note-ph img` to tame the HDR tourist look and unify the treatment.

**A2. Calendar: replace the weather fillers with the events Osaka people actually mark.** Verify each date against the primary source per `01-research.md` before shipping.
- 3月: `<dd>大相撲三月場所<br><small class="muted">例年3月、大阪府立体育会館で15日間</small></dd>`
- 5月: `<dd>中之島公園ばら園の見頃<br><small class="muted">例年5月中旬〜下旬</small></dd>`. This ties in with the 02 photo.
- 6月: `<dd>愛染まつり（愛染堂勝鬘院）<br><small class="muted">例年6月30日〜7月2日。大阪の夏祭りの幕開け</small></dd>`
- 8月: `<dd>住吉祭（住吉大社）<br><small class="muted">例年8月1日に神輿渡御。大阪の夏祭りの締めくくり</small></dd>`. 「愛染さんで始まり、住吉さんで終わる」 is a real Osaka saying, and it is exactly the texture this page lacks.
- 1月: `<dd>えべっさん（今宮戎神社の十日戎）<br><small class="muted">例年1月9〜11日の3日間</small></dd>`. Residents say えべっさん.
- Move the climate normals into the 体調メモ (e.g. summer: 「8月の平年の日最高気温は33.7℃。」), so the 気象庁 footnote stays valid.

**A3. Area copy with local knowledge:**
- キタ: 「JR大阪駅と梅田の各駅が集まる北の玄関口。高層ビルと迷路のような地下街、お初天神や阪急東通の飲み屋街が混ざり合う街です。」
- ミナミ: 「道頓堀の川沿いに看板が並び、心斎橋筋の商店街がなんばへと続く繁華街。劇場や飲食店も多く、夜遅くまでにぎわいます。」
- 中之島・北浜 (second sentence): 「対岸の北浜は、大阪取引所とレトロビルの並ぶ街。川沿いにはテラス席のある店も並びます。」
- 天王寺・阿倍野 (append): 「通天閣の新世界へも歩いてすぐです。」 The photo shows 新世界, but the copy never mentions it.

**A4. Checklist: swap an item a resident doesn't need for one a resident does.** Use id `c3-5` so stored state doesn't carry over. Replace the ICカード item with:
`<label><input type="checkbox" id="c3-5"><span>自転車保険に入っているか確かめた<small>大阪府では、自転車に乗る人の保険加入が条例で義務になっています</small></span></label>`
Add the 大阪府 source link after verification, and do not invent the URL.

**A5. A light Kansai touch on the cover lines, used no more than this:**
- 02 「近所のお医者さん、どう探す？」
- 05 「ごみの日、いつやったっけ？」

### jp_copy_naturalness: 7 → 8

**C1. Rewrite 編集部より to give it a voice; disclaimers belong in the policy section:**
- 「OSAKA LIVEは、大阪に住む人のためのWebマガジンです。朝の御堂筋線、夕方の商店街、休日の大川沿い。観光ガイドには載らない、毎日の大阪の話を届けます。」
- 「扱うテーマは5つ。街の暮らし、健康・医療、美容・ウェルネス、ひと・カルチャー、そして生活の実用ガイドです。創刊準備号では、これから始まる連載の予告と、大阪で暮らすうえで手元に置いておきたい基本情報をまとめました。」
- 「健康や美容の記事で扱うのは、病院の探し方や制度の使い方などの一般的な情報です。気になる症状があるときは、医療機関に相談してください。」
- 「記事は、国や大阪府・大阪市などの一次情報を確かめてから書き、出典を示します。制度や連絡先は変わることがあるため、見直した日付も記します。」

**C2. Line fixes:**
- 01 desc opener 「通勤路、商店街、川沿いの公園。」 → 「駅前の喫茶店、自転車で通うスーパー、近所の公園。」 This breaks the triple repetition, and 喫茶店 and 自転車 are real Osaka habits.
- Autumn memo → 「朝晩の寒暖差が大きくなる季節です。脱ぎ着しやすい服で調節し、不調が続くときは医療機関に相談を。」
- 6月 small → 「平年では、1年でいちばん雨の多い月」
- 02 desc 「公的機関の情報で確認し」 → 「公的機関の情報をもとに確認し」
- Footer → 「大阪に住む人のための、暮らし・健康・カルチャーのWebマガジン。」
- Series 「水都大阪の水辺を歩く」 → 「水都大阪の川べりを歩く」
- Checklist 「#7119と#8000を電話帳に入れた」 → 「#7119と#8000をスマホの連絡先に登録した」
- 「この項目のリンクをコピー」 → 「相談先のリンクをコピー」 / 「チェックリストのリンクをコピー」
- Make the EN labels consistent: 目次 "Help Lines" against section "When You Feel Unwell", and 目次 "People & Culture" against section "People, Trends & Culture". Pick one of each.

### jp_design_conventions: 7 → 8

- **D1.** Apply T1, which fixes the broken "04".
- **D2. Caption every photo, magazine style.** Add `figure figcaption{font-size:12px;color:var(--ink-2);margin-top:8px}` and give each figure a place and 区 caption, e.g. 02 「中之島公園ばら園の橋（北区）」, 04 「天神祭の夜（北区）」, 01 「大阪の路地で」, and the hero's new location. This adds local proof and trust at almost no cost.
- **D3. ベイエリア card:** replace the 青海波 placeholder with a verified photo (天保山 / 大阪港). As it stands it reads as 画像なし. Keeping 青海波 to the two thin strips is enough "和"; more of it starts to look like a Japan-for-export signifier rather than Osaka.

### trust_anshin: 7 → 8

- **S1.** Remove the unqualified 「商品の販売や広告の掲載を行っていません」 from the note (done in the C1 rewrite). Keep only the policy's 「現在…今後…PR表示」 wording, which stays true once the sister store exists.
- **S2.** Cut the disclaimers to three placements: the 02 notice, the 相談先 footnote, and the policy section.
- **S3.** T1's Gothic phone numbers make `#` legible, so readers are less likely to misdial "7119" without the hash.
- **S4** (pending item, one line): when 運営者 is filled in, state the company and its business, including the planned sister store, from day one. For Japanese readers of health content, a relationship disclosed early builds anshin; one discovered later reads as ステマ.

### overall_jp_appeal: 6 → 8, if A1 (photos) plus T1, R1 and C1 land. Without new photos the ceiling is 7.

## Verdict
The structure and the practical information are well made and correctly local. The cover and photos still look like a tourist's Osaka, and the 準備中 tags and orphaned characters make it feel unfinished. Change the photos, remove the 準備中 tags and fix the typesetting, and it will read as a real Osaka magazine.
