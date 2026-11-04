# 01 — Research: OSAKA LIVE landing page

Research date: 2026-10-30. Scope: design references, a verified Osaka fact sheet, keyword themes, and compliance guardrails.

**Verification legend**
- ✅ = checked on an official primary source (national, prefecture, city, or the organiser's own site), URL given.
- ◐ = checked on an official tourism body (大阪観光局 / OSAKA-INFO) or the organiser's own site, but not on a government page.
- ⚠ UNVERIFIED = not confirmed on an authoritative source. Do not publish these as fact.

Rule for copywriters: **use ✅ facts only for numbers, dates and phone numbers.** Every health phone number or hour on the LP must link to its source and carry a 「最終確認日」.

---

## 1. Design references: Japanese web-magazine and local-media patterns

**Method.** For each site I downloaded the homepage HTML and its CSS, then counted `font-family`, colour, `letter-spacing`, `line-height` and `writing-mode` declarations. The counts below are those declaration tallies. I read each page's structure in a browser. I took screenshots of Lmaga.jp only, because the browser pane was hidden for the other sites.

| Ref | Layout grammar | Typography (from the CSS) | Palette (from the CSS) | Recurring motifs |
|---|---|---|---|---|
| **Lmaga.jp** (京阪神エルマガジン社, Osaka) https://www.lmaga.jp/ | Small wordmark at top left. A horizontal category tab bar (イチオシ / 新着 / まとめ / おでかけ / グルメ / PR / エンタメ / くらし / コラム). One large hero photo plus 4 thumbnail headlines. A 3-column card grid with a right sidebar. Dense, news-like. | Lato for Latin text. Body uses the system stack (Hiragino Sans / Meiryo). Line-height 1.2–1.6, which is tight. | Red `#e60012` (most frequent colour, 50 uses), text `#333`, rules `#eee` / `#ddd`. | Every sponsored title starts with **【PR】**, and there is a separate 「コラボPR」 rail. A ranking list uses large red numerals 1–5. Cards show a date and a NEW badge. |
| **Meets Regional** (same publisher, Kansai monthly) https://www.lmagazine.jp/meets/ | Issue-driven. Shows 「2026年12月号」 and 「毎月1日発売」. A **CONTENTS** list. Each issue features **one neighbourhood** (e.g. 京橋), then 「アラウンド京橋」 covers the neighbouring stations. Columns are numbered 「天国コラム❶❷」. A REGULAR block groups columns under genre labels (MUSIC / MOVIE / ART / BOOK). | **Noto Serif JP** is the dominant face (26 declarations). Ryumin / Yu Mincho are used for headlines. Prata is the Latin serif. Gothic is used only for UI. | Red `#cf0021`, ink `#1c1c1c`, rules `#ddd`. | Headlines in Kansai dialect (「京橋は◎◎天国でっせ！」). Body copy is in standard Japanese. Content is organised by neighbourhood, not by genre. |
| **Casa BRUTUS** (Magazine House) https://casabrutus.com/ | Section heads are bilingual: an English label above a Japanese subtitle (「Latest 最新」「Featured 注目コンテンツ」「Regulars 連載」「Select 10 Casa BRUTUSの10選」). A latest-issue block reads 「No.319 / 2026年10月8日」. There are city guides (「金沢シティガイド」) and a numbered "No.1…" ranking. | Garamond Premier Pro (Typekit) for Latin. The serif fallback is YuMincho / Hiragino Mincho. The sans stack is Helvetica Neue → Hiragino Kaku Gothic. Body line-height is **1.8**. `vertical-lr` is used once. | Nearly monochrome: `#000`, `#333`, `#444`, `#c4c4c4`. Colour comes from the photos. | Lots of whitespace and editorial "Select 10" lists. The issue number and date are treated as a design element. |
| **Hanako Web** (Magazine House) https://hanako.tokyo/ | A photo-led carousel. Each card is a title plus a date in `2026.10.28` format. Calm density. | Montserrat (Latin) + Yu Gothic. Letter-spacing **.1em / .08em / .04em**. Line-height 1.75. `writing-mode: vertical-rl` appears twice, for decorative labels. | `#333` / `#000` on white, with soft pink-beige `#f8ddd9` and `#f5f4f3`. | The dot-date format. Tategaki is used only for short labels. |
| **ことりっぷ** (昭文社) https://co-trip.jp/ | Every card carries a **prefecture tag** and a date. Sponsored cards carry a **[PR]** tag. Discovery entries include 「したいことから記事を探す」 and 「エリアから探す」. Issue milestone: 「祝50号」. | Noto Sans JP, with **Zen Maru Gothic** (rounded) for friendly accents. | Warm brown `#6f4d3e` / `#a58d82` on white. | Friendly tone with ♪. Area and "what you want to do" are the two navigation axes. |
| **OZmall** (スターツ出版) https://www.ozmall.co.jp/ | Dense card list. Hashtag chips (「#予約ＯＫ」). A ranking with reader comments. Tagline: 「信じられる、ときめきだけ。」 | Noto Sans JP + Montserrat. A Mincho stack (Hiragino Mincho / HG明朝E) for accents. Letter-spacing .05–.1em. `vertical-lr` is used. | Text `#383838`, pink `#fb9bad` / `#ff7b93`, greys. | "編集部厳選" (editor-picked) framing. Reader voices are shown. |
| **OSAKA-INFO** (大阪観光局, the official tourism body) https://osaka-info.jp/ | Bilingual section heads (「NEWS お知らせ」「EVENT 注目のイベント」「PICK UP」「RECOMMEND SPOT」「MODEL COURSE」「INFORMATION」). **Every card has an area label** (「天王寺・阿倍野エリア」). Event cards show a date range (`2026-10-28 ～ 2026-11-12`). An "大阪まるわかり" basics hub (基本 / 食文化 …). | Noto Sans JP + Noto Serif JP + **Cinzel** (Latin capitals) + FOT-筑紫A丸ゴシック + Zen Maru Gothic. | Orange `#f17210`, green `#99d257`, cream `#f5f2e4` / `#f6f6f5`. | An area taxonomy of 8 areas, an event calendar, and model courses. This is the closest "municipal-style" reference. |

**Observed consensus**
- Mincho or serif is used for **display** text. Gothic is used for **body and UI**.
- Body line-height is **1.75–1.8** on the premium titles. The news titles use about 1.4.
- Letter-spacing is **.04–.1em** on Japanese labels.
- Each site uses **one strong accent colour**. The two Osaka titles both use red.
- English labels sit over Japanese headings.
- Area and date metadata appear on every unit.
- Commercial content is always labelled **[PR]**.
- Tategaki is rare. It appears only on short decorative labels, never in body text.

### Design rules for the OSAKA LIVE LP (buildable)

1. **Masthead.** Set the wordmark `OSAKA LIVE` in a Latin serif (e.g. Cormorant Garamond or Prata). Put the Japanese tagline 「大阪の暮らし・健康・美容をもっと身近に。」 under it in Mincho at 13–14px with .1em tracking. Add a thin issue line, e.g. `ISSUE 00 — 2026.11 創刊準備号`. Keep it honest and don't imply a back catalogue.
2. **Numbered section headers in 3 layers.** First the number `01` in a large Latin serif, then the English kicker `OSAKA CITY LIFE` (11–12px capitals, .15em), then the Japanese title in Mincho at weight 600–700. Add a 1–2 line dek in Gothic below. This follows the Casa BRUTUS and OSAKA-INFO pattern.
3. **Type pairing.** Headings: Noto Serif JP or Shippori Mincho. Body: Noto Sans JP 400 at **16px**, line-height **1.8–1.9**, tracking **.04em**. Meta and labels: 12px Gothic, tracking .1em. Load everything from Google Fonts. Limit weights to 400/700 for Gothic and 500/700 for Mincho.
4. **A CONTENTS block near the top** that lists 01–05 as jump links, styled like a magazine contents page with hairline leaders. This is the Meets / Casa grammar. It also gives the LP anchor links for SEO and accessibility.
5. **Tategaki for decoration only.** Use it for one short vertical label per section of 12 characters or fewer (e.g. 「暮らす」「整える」), with `writing-mode: vertical-rl` and `text-orientation: mixed`. Never use it for body copy. On screens under 768px, switch these labels to horizontal.
6. **Palette.** Paper off-white `#FAF8F4` as the background. Ink `#1C1C1C`. Hairline `#DDD`. **One** accent red (a vermilion, around `#C8332B`). Choose a hue distinct from Lmaga's `#E60012` so the site doesn't read as a copy. The Health section (02) switches to a calm blue-grey or green tint to signal "information, not promotion". Check every colour pair for AA contrast.
7. **Metadata on every unit.** Each theme card carries an area or category chip, a 1px-outline rectangle with 11–12px text at .1em. These are generic theme chips: the LP has no articles yet, so there are no dates.
8. **Hairline rules, not boxes.** Separate content with 1px rules and whitespace. Avoid heavy shadows, gradients and pill-shaped glassy cards. Desktop uses a 12-column grid with up to 3 columns. Mobile is a single column with a 16px gutter.
9. **Photos and captions.** Use one consistent ratio (3:2 for landscape or 4:5 for portrait). Put a caption under each photo in 12px Gothic giving the place and the credit (「写真：編集部」). Don't use AI or stock images of "patients" or "doctors" in the Health section. Use street scenes, objects or illustration there. If there are no photos yet, use typographic panels with area names and line motifs, such as the river grid of 中之島 or the 御堂筋 axis.
10. **Light Kansai voice.** Use at most one dialect phrase per section kicker (Meets grammar). Health and Guides copy stays in standard, neutral Japanese.
11. **An area index strip.** Show chips for キタ / ミナミ / 天王寺・阿倍野 / 中之島・北浜 / 新世界 / 中崎町 / ベイエリア. Area is the main navigation axis on every reference site.
12. **A seasonal calendar strip (12 months).** Show one or two verified events per month (§2.3). This is a retention device and gives readers a reason to come back.
13. **A health info box in a "municipal-portal" style.** For #7119, #8000 and 救急医療情報センター, show the number, hours and who answers. Link to the official source and print 「出典・最終確認日」 in the box. Keep it visually separate from the editorial cards, and never put commerce next to it.
14. **A visible trust layer in the footer.** Link to 編集方針, 情報源・監修の方針, 広告・PRポリシー, 運営者情報 and お問い合わせ. Adopt the **[PR] labelling convention now**, even though there are no ads yet. It shows readers the rule before any links exist.
15. **Leave out "hot" widgets.** No ranking, NEW badges, counters or popups on the LP. There are no articles yet, so a ranking would be fake social proof. Add a ranking only when real data exists.

---

## 2. Verified Osaka fact sheet

### 2.1 Areas (one-line character)

| Area | Character (paraphrased) | Status / source |
|---|---|---|
| キタ (梅田・大阪駅) | Osaka's main gateway and trend centre: department stores, shopping complexes and office towers. Railway terminals (JR大阪, Osaka Metro, private-line 梅田) concentrate here, and the area keeps changing. | ◐ https://osaka-info.jp/osaka/basic/ , https://osaka-info.jp/ (model course text) |
| ミナミ (難波・心斎橋・道頓堀) | A lively entertainment district where tradition meets trend. Major spots include なんばパークス and なんばグランド花月. | ◐ https://osaka-info.jp/osaka/basic/ |
| 天王寺・阿倍野 | High-rise landmark (あべのハルカス) next to nostalgic streets; 四天王寺, 天王寺動物園. | ◐ https://osaka-info.jp/osaka/basic/ |
| 中之島 | A river island between the 堂島川 and 土佐堀川. It has retro architecture (中央公会堂), museums and waterside greenery, and its history goes back to the "天下の台所" era. | ◐ https://osaka-info.jp/spot/nakanoshima/ |
| 北浜・淀屋橋・船場 | The historic merchant and finance core. It has 大阪取引所 (the 1935 façade is preserved), 北浜レトロビルヂング, and 適塾, an Important Cultural Property associated with 緒方洪庵. | ◐ https://osaka-info.jp/spot/osaka-exchange/ , https://osaka-info.jp/spot/tekijuku/ |
| 新世界 | 通天閣, ジャンジャン横丁, kushikatsu, and a Shōwa-era downtown feel. The 2026 events include the 2代目通天閣 70th-anniversary light-up. | ◐ https://osaka-info.jp/spot/shinsekai/ , https://osaka-info.jp/ |
| 中崎町 | An old townscape next to 梅田 that survived wartime damage, with small cafés and shops run in old wooden houses. | ◐ https://osaka-info.jp/modelcourse/course-kimono-walk/ |
| ベイエリア | The leisure hub, with USJ and 海遊館. | ◐ https://osaka-info.jp/osaka/basic/ |
| 天神橋筋商店街 | The shopping street grew as the 門前町 of 大阪天満宮. Its official site gives about **2.6 km and about 600 shops**. Write "日本一長い**とされる**" because there is no official certification. Historically it is linked to the 天満青物市場, which started in 1653 (承応2年). | ◐ https://www.tenjin123.com/ , https://www.tenjin123.com/history |
| 黒門市場 | Self-described as 「浪速の台所」: about **150 shops** on an arcade of about **580 m** in 中央区日本橋2丁目, open for more than 200 years. Note that it calls itself 浪速, **not** 大阪, の台所. | ◐ https://kuromon.com/jp/ |

### 2.2 Food culture

| Fact | Status / source |
|---|---|
| Osaka was called 「天下の台所」 because rice and regional goods were gathered in its warehouses and traded there. | ✅ 農林水産省 https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/area_stories/osaka.html |
| 「食い倒れのまち」: MAFF links the city's food culture to a 始末の精神 (waste-nothing mindset) combined with a passion for eating. | ✅ MAFF (same page) |
| Dashi culture: Osaka favours **kombu-based dashi with katsuobushi added**, where Kantō tends to use bonito alone. Soft water and the shipping route that brought kombu from Hokkaidō supported it. | ✅ MAFF (same page). The 「北前船・昆布ロード」 naming appears in 大阪府's dashi column series: https://www.pref.osaka.lg.jp/o070080/toshimiryoku/osakathemuseum/dashi/oosakanodashi005.html (◐, column) |
| 粉もん: お好み焼き and たこ焼き are everyday staples, also made with dashi. | ✅ MAFF (same page, plus the お好み焼き page https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/39_20_osaka.html) |
| きつねうどん is presented as a dish Osaka people love. Osaka udon has soft noodles that suit kombu and katsuobushi dashi. | ✅ MAFF / ◐ https://osaka-info.jp/osaka/food/gastronomy-dashi/ |
| 船場汁: a thrifty merchant-household soup made from salted mackerel scraps and daikon. | ✅ MAFF (same page) |
| 「京の着倒れ、大阪の食い倒れ」 (the full proverb) | ⚠ UNVERIFIED on an official page. It is a well-known saying, so present it as 「〜と言われる」. |

### 2.3 Annual events

| Month | Event | Recurring date rule | Latest verified dates | Status / source |
|---|---|---|---|---|
| Jan | 十日戎 (今宮戎神社, 浪速区) | **Jan 9, 10 and 11** every year. Common naming: 9日 宵戎 / 10日 本戎 / 11日 残り福. | The shrine site confirms the three days. The day names come from secondary sources. | ✅ dates: https://www.imamiya-ebisu.jp/ ; ⚠ day names are UNVERIFIED on the official page. |
| Feb | 大阪マラソン | Late February, on a Sunday. | **2027年2月28日(日)** is the 15th edition. General entry places: 28,420. | ✅ 大阪府 press release https://www.pref.osaka.lg.jp/hodo/fumin/o070110/prs_51176.html |
| Apr | 造幣局 桜の通り抜け (北区) | Mid-April, about one week. **Advance online reservation required** (first come, first served). | 2026: **Apr 9–15**. Reservations opened **Mar 18**. | ✅ 造幣局 https://www.mint.go.jp/shintyaku/topics/topics_new_20250114.html . Note: confirmed from mint.go.jp search snippets, because the site returned 403 to the fetcher. Re-check before publishing. |
| Jul | 天神祭 (大阪天満宮) | **Jul 24 宵宮** (鉾流神事) / **Jul 25 本宮**, with 陸渡御, 船渡御 on 大川 and 奉納花火 in the evening. | Fixed dates. | ◐ https://osaka-info.jp/event/osakatenmangu-tenjinsai/ . If you call it "日本三大祭", write 「〜のひとつとされる」. |
| Sep / Oct | 岸和田だんじり祭 (岸和田市) | Two festivals: **9月祭礼** (岸和田・春木 districts) and **10月祭礼** (山手 districts). | 2026: 9月 **宵宮 9/19, 本宮 9/20**. 10月 **宵宮 10/10, 本宮 10/11**. | ✅ 岸和田市 https://www.city.kishiwada.lg.jp/site/danjiri/ . Saying the September festival is "always the weekend before 敬老の日" is ⚠ UNVERIFIED. Quote the year's dates instead. |
| Nov–Dec | 御堂筋イルミネーション (part of 大阪・光の饗宴) | Early November to Dec 31. | 2026: **11/3 – 12/31**, about **17:00 to 25:00**, on a **4 km** stretch from 阪神前 to 難波西口. 光の饗宴 as a whole runs **2026/11/3 – 2027/1/31**. | ✅ 大阪市 press release https://www.city.osaka.lg.jp/hodoshiryo/keizaisenryaku/0000687506.html |

### 2.4 Health resources for residents (educational listing only)

| Resource | Verified details | Source |
|---|---|---|
| **救急安心センターおおさか** | **#7119**, or **06-6582-7119** when #7119 can't connect (e.g. during carrier outages). **24 hours, 365 days.** Nurses answer, with doctors supporting them. The service advises whether you need an ambulance or a hospital visit and dispatches an ambulance when urgent. It covers all of 大阪府 (run jointly by all municipalities). Consultation is free; you pay the call charge. It does **not** handle questions about medication use, ongoing treatment, general health, nursing care or childcare. | ✅ 大阪市消防局 https://www.city.osaka.lg.jp/shobo/page/0000052526.html |
| **小児救急電話相談** (子ども医療電話相談) | **#8000**, or **06-6765-3650** from dial-line and IP phones. Open **19:00 to 08:00 the next morning, every day**. Nurse counsellors answer, and they do not examine or treat. ⚠ A 守口市 PDF says "24h". The prefecture page says 19–8h, so **use 19–8h**. | ✅ 大阪府 https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi_02.html |
| **大阪府救急医療情報センター** | **06-6693-1199**, **24 hours, 365 days**. Tells callers by phone which facilities can see them now. Its web counterpart is 「現在診療中の医療機関から探す」. | ✅ 大阪府 https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi_01.html |
| **医療機関検索 (official)** | **「医療情報ネット（ナビイ）」** is run by 厚生労働省 and searches hospitals, clinics, dental clinics, midwifery homes and pharmacies. The 大阪府 entry point is https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2310/initialize?pref=27 . The prefecture's emergency navigation hub is 「大阪救急ナビ」: https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi.html | ✅ 大阪府 (same page as above) |
| **休日・夜間急病診療所 (大阪市)** | Official page title: 「休日・夜間急病診療所（内科、小児科、眼科、耳鼻咽喉科）、休日・夜間緊急歯科診療所」. **中央急病診療所 (西区)** handles internal medicine and paediatrics on Sundays and holidays from 17:00 to 05:30, and on weekday nights from 22:00. Six ward holiday clinics (都島, 西九条, 十三, 今里, 沢之町, 中野) run 10:00–16:30 on Sundays, holidays and the New Year period. There is also a holiday and night emergency dental clinic in 天王寺区. **Call before visiting.** Hours change, so link to the page rather than copying the hours. | ✅ 大阪市健康局 https://www.city.osaka.lg.jp/kenko/page/0000371474.html |
| Related tools | 全国版救急受診ガイド「Q助」 (消防庁) and the 大阪府 小児救急支援アプリ are both linked from the 消防局 page. | ✅ 大阪市消防局 (same page as #7119) |
| **かかりつけ医** | 厚生労働省's public explanation describes a nearby doctor you can consult about anything health-related, who knows current medical information and refers you to specialists when needed. The wording is quoted from the 日本医師会's 2013 proposal. 「かかりつけ医機能報告」 started from April 2025. | ✅ 厚生労働省 https://kakarikata.mhlw.go.jp/kakaritsuke/motou.html |
| **特定健診 (大阪市国保)** | For 大阪市国保 members aged **40–74**, **free**. Bring the 受診券. | ✅ 大阪市 (via ward pages, e.g. https://www.city.osaka.lg.jp/miyakojima/page/0000668537.html ) |
| **大阪市がん検診** | Stomach, lung, colorectal, cervical, breast and prostate screening, eligible by age. **Free to ¥1,500**. Taken at contracted clinics. The 区保健福祉センター offers only colorectal, lung and mammography. Some groups are exempt from fees. Eligibility requires 大阪市 residency and no equivalent screening through work or another insurer. | ✅ 大阪市健康局 https://www.city.osaka.lg.jp/kenko/page/0000008503.html |

**Copy rule:** always pair these with 「命に関わる緊急時は迷わず119番」 and 「受診前に各機関へ確認を」.

### 2.5 Resident guides

| Topic | Verified details | Source |
|---|---|---|
| **転入届 (大阪市)** | File **within 14 days of moving in**, at the 区役所 窓口サービス課 or a branch office. It cannot be filed before the move or by post. Bring the 転出証明書, unless you are moving between wards inside 大阪市 or used マイナポータル for the move-out. Moving within the same ward needs a **転居届**, also within 14 days. 国保 changes must also be made within 14 days. Some wards take online visit reservations. | ✅ https://www.city.osaka.lg.jp/shimin/page/0000369822.html , https://www.city.osaka.lg.jp/shimin/page/0000369826.html , https://www.city.osaka.lg.jp/fukushi/page/0000369734.html |
| **ごみ分別 (大阪市)** | There are 4 categories. 「普通ごみ」 is collected twice a week. 「資源ごみ」 (cans, bottles, PET), 「プラスチック資源」 and 「古紙・衣類」 are each collected once a week. Use **transparent or semi-transparent bags**; opaque bags get a warning sticker and are left. Put out about 3 bags of 45 L per collection. 「粗大ごみ」 means anything over 30 cm (or a stick shape over 1 m). It needs **advance booking and a fee**, made online or through the call centre. Collection days and times vary by area; check the 「大阪市ごみ収集マップ」 or the 「さんあ～る」 app. The fixed "朝9時まで" rule is ⚠ **not stated on the city page**, so don't use it. | ✅ https://www.city.osaka.lg.jp/kankyo/page/0000009337.html |
| **Osaka Metro / ICOCA** | Osaka Metro (大阪市高速電気軌道株式会社) took over the city subway on **2018-04-01**. On the subway and buses you can use **PiTaPa, ICOCA**, Suica, PASMO, Kitaca, manaca, TOICA, はやかけん, nimoca and SUGOCA. Mobile ICOCA and ICOCA on Apple Pay also work. Only PiTaPa gets Osaka Metro's usage-based discount. Regular 回数カード sales ended on 2024-03-22. | ✅ https://www.osakametro.co.jp/company/company_profile/kaisya_gaiyou.php , https://om-faq-zd.osakametro.co.jp/hc/ja/articles/32385370360217 |
| **防災** | Official app name: **「大阪防災アプリ」** (formerly 「大阪市防災アプリ」), provided by 大阪市 危機管理室. It covers **all of 大阪府** and offers offline maps, shelters, ward flood hazard-map PDFs, push alerts, and a supplies checklist. The city also publishes **水害ハザードマップ** for all 24 wards, and the detailed map site is 「マップナビおおさか」. | ✅ https://www.city.osaka.lg.jp/kikikanrishitsu/page/0000345020.html (updated 2026-09-17), https://www.city.osaka.lg.jp/kikikanrishitsu/page/0000299877.html |
| City call centre | 大阪市総合コールセンター: **06-4301-7285**, **8:00–21:00 every day**. | ✅ listed on https://www.city.osaka.lg.jp/shobo/page/0000052526.html |

### 2.6 Climate (useful for beauty and wellness context)

These are JMA normals for 大阪, observation point 47772, period **1991–2020**. ✅ https://www.data.jma.go.jp/obd/stats/etrn/view/nml_sfc_ym.php?prec_no=62&block_no=47772

| | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Year |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mean temp (°C) | 6.2 | 6.6 | 9.9 | 15.2 | 20.1 | 23.6 | 27.7 | **29.0** | 25.2 | 19.5 | 13.8 | 8.7 | 17.1 |
| Mean daily max (°C) | 9.7 | 10.5 | 14.2 | 19.9 | 24.9 | 28.0 | 31.8 | **33.7** | 29.5 | 23.7 | 17.8 | 12.3 | 21.3 |
| Mean daily min (°C) | 3.0 | 3.2 | 6.0 | 10.9 | 16.0 | 20.3 | 24.6 | **25.8** | 21.9 | 16.0 | 10.2 | 5.3 | 13.6 |
| Rel. humidity (%) | 61 | 60 | 59 | 58 | 61 | 68 | **70** | 66 | 67 | 65 | 64 | 62 | 63 |
| Precip (mm) | 47.0 | 60.5 | 103.1 | 101.9 | 136.5 | **185.1** | 174.4 | 113.0 | 152.8 | 136.0 | 72.5 | 55.5 | 1338.3 |

Safe copy angles:
- Summer is humid, peaking in July at 70% RH. June is the rainiest month, during tsuyu.
- August's average daily minimum is 25.8°C. That is close to "nights that don't cool down" (a 熱帯夜 is a night with a minimum of 25°C or more), but this is an average and not a count of such nights.
- Winter humidity is about 58–62%, the driest stretch, which supports dry-skin care themes.
- Don't turn these into health claims.

### 2.7 Round-2 additions (facts proposed by the critic, checked 2026-10-30)

| # | Fact | Status | URL | Safe wording |
|---|---|---|---|---|
| 1 | 大相撲三月場所 venue | ✅ (the schedule page appeared in sumo.or.jp search results, but the direct fetch returned a URL error) | https://www.sumo.or.jp/Admission/schedule/ | 「毎年3月、**エディオンアリーナ大阪（大阪府立体育会館）**で開かれる大相撲三月場所（大阪場所）。」 The 2026 tournament ran 3/8–3/22. The 2027 tournament is scheduled for 3/14–3/28. Write the venue name with the old name in brackets, exactly as above. "15日間" is my count from those dates. The site doesn't state it directly, so keep 「15日間」 out of the copy or treat it as derived. |
| 2 | 中之島公園ばら園: usual peak | ✅ 大阪市建設局 | https://parksgreenery.city.osaka.lg.jp/article/parks-nakanoshima/ | 「例年**5月中旬と10月中旬**に見頃。約310種・3,700株のバラ（大阪市）。」 The park opened in 1891 (明治24年) as 大阪市で初めての都市公園. Note: the city's 開花情報 page gives a wider range (late April–late May and early October–early November): https://parksgreenery.city.osaka.lg.jp/flowering/ |
| 3 | 愛染まつり: dates | ✅ temple site + 大阪市教育委員会 | https://www.aizendo.com/whatsnew.htm ; https://www.city.osaka.lg.jp/kyoiku/cmsfiles/contents/0000673/673855/18.pdf | 「毎年**6月30日〜7月2日**、愛染堂勝鬘院で行われる愛染まつり。大阪の夏祭りのさきがけ（大阪市）とされ、初日には宝恵駕籠の行列が出る。」 The temple calls it 「大阪三大夏祭りのひとつ」. Write 「〜とされる」. |
| 4a | 住吉祭: usual period | ✅ 住吉大社 | https://www.sumiyoshitaisha.net/events/annualevents/07.html | 「**7月の海の日（神輿洗神事）から8月1日まで**行われる住吉大社の夏祭り。」 |
| 4b | 住吉祭 神輿渡御 = 8月1日 | ⚠ **Not fixed.** In **2026 the 神輿渡御 was on 7/26**. **8/1** was the 頓宮祭 and the 飯匙堀祓神事 at 宿院頓宮 (堺). The shrine's August page labels the 神輿渡御 as 7/30–8/1, so the shrine's own pages disagree. | https://www.sumiyoshitaisha.net/news/detail.php?seq=149 ; https://www.sumiyoshitaisha.net/events/annualevents/08.html | 「住吉さんの神輿は大和川を越え、堺の宿院頓宮へ渡御する（日程は年により異なるため住吉大社の発表を確認）。」 **Do not write 「8月1日に神輿渡御」.** |
| 4c | 「愛染さんで始まり住吉さんで終わる」 | ⚠ UNVERIFIED | none found | The phrase is not on the temple site, the 住吉大社 site, the 大阪市 PDF, or JR西日本's Blue Signal. A Kansai University repository paper might contain it, but its PDF wouldn't load. If you use it, frame it as hearsay: 「〜とも言われる」. A safer, sourced line: 「大阪の夏祭りのさきがけとされる愛染まつり」. |
| 5 | 大阪府自転車条例: 保険 | ✅ 大阪府 + 大阪府警 | https://www.pref.osaka.lg.jp/o130080/dorokankyo/osakajitensha/jitensya-hoken.html ; https://www.pref.osaka.lg.jp/o130080/dorokankyo/osakajitensha/index.html ; https://www.police.pref.osaka.lg.jp/ochikakunokeisatsusho/keisatsushobetsujoho/39/2/2/14728.html | 「大阪府では**2016年7月1日から**、自転車に乗る人の**自転車保険（他人へのケガ等を補償する損害賠償保険等）への加入が義務**。子どもが乗る場合は保護者が加入。罰則はなし。」 The ordinance itself took effect in April 2016; the insurance clause took effect on 7/1. Businesses whose staff ride for work, and rental operators, have only a 努力義務 (duty to make efforts). The prefecture page asks riders to wear a helmet but doesn't present it as a legal obligation. |
| 6 | 「えべっさん」 nickname | ✅ 大阪市 (浪速区). ⚠ Not used on the shrine's own 十日戎 page, which says 「えびす様」. | https://www.city.osaka.lg.jp/naniwa/page/0000001062.html ; https://www.imamiya-ebisu.jp/tokaebisu | 「十日えびす（えべっさん）、毎年1月9日〜11日」 (as 大阪市 writes it). The city page puts 福笹 buyers at over 1 million. The shrine page confirms only 「宵戎」 for the 9th; 「本戎」 and 「残り福」 are not on it. |
| 7 | 御堂筋イチョウ並木: 見頃 | ◐ The city says only **"autumn"**. "11月下旬〜12月上旬" is ⚠ UNVERIFIED. | https://www.city.osaka.lg.jp/kensetsu/page/0000239175.html ; https://www.city.osaka.lg.jp/kensetsu/page/0000242811.html | 「見頃は秋。黄葉したイチョウの葉が御堂筋を埋め尽くす（大阪市）。」 There are 928 trees, planted 1933–1937. The city's pages describe the avenue both as 大阪市指定名勝 and as a 大阪市指定文化財 (2000). Write 「大阪市の指定文化財（名勝）」 or simply 「大阪市指定の名勝」. Give no specific weeks. |

---

## 3. SEO / keyword themes (reasoned; no tool data)

Intent tags: **K** = know (informational), **D** = do (how-to), **L** = local / find, **S** = seasonal.

| Section | Queries |
|---|---|
| **01 Osaka City Life** | 大阪 住みやすい エリア 特徴 (K) · 中崎町 カフェ 散策 (L) · 天神橋筋商店街 食べ歩き (L) · 黒門市場 楽しみ方 (D) · 大阪 粉もん 違い (K) · 大阪 だし 文化 (K) · 大阪 11月 イベント (S) · 天神祭 2027 日程 (S) |
| **02 Health & Medical Care** | 大阪 休日診療 今日 (L) · 大阪 夜間 子ども 熱 相談 (D) · #7119 大阪 何を相談できる (K) · 大阪 医療機関 探し方 ナビイ (D) · 大阪 皮膚科 探し方 (D) · かかりつけ医 見つけ方 (K) · 大阪市 がん検診 料金 (K) · 大阪市 特定健診 受け方 (D) |
| **03 Beauty & Wellness** | 大阪 夏 湿気 髪 広がる 対策 (D) · 冬 乾燥 肌 保湿 習慣 (D) · 大阪 美容院 選び方 (D) · 大阪 ヨガ 初心者 (L) · 大阪 銭湯 サウナ (L) · 熱中症 予防 日常 (K/S) · 花粉 時期 大阪 (S) |
| **04 People, Trends & Culture** | 大阪 新店 オープン (S) · 大阪 レトロ建築 巡り (L) · 中之島 美術館 周辺 (L) · 大阪 商店街 歴史 (K) · 大阪 ローカル 人気 店主 (K) · 関西弁 ニュアンス (K) |
| **05 Guides & Useful Resources** | 大阪市 転入届 必要なもの (D) · 大阪 引っ越し 手続き 一覧 (D) · 大阪市 ごみ 分別 早見 (D) · 大阪市 粗大ごみ 申し込み (D) · ICOCA PiTaPa 違い (K) · 大阪 防災アプリ (D) · 大阪市 ハザードマップ 区 (L) |

Notes:
- The LP itself should target the head brand and theme terms (大阪 暮らし 情報 / 大阪 健康 美容 ローカルメディア). Leave the long-tail terms above to future articles.
- Health queries are YMYL. Rank with primary-source links and dated "last checked" stamps, not with volume.

---

## 4. Compliance guardrails (health and beauty copy)

### 4.1 Which laws apply to a general information site

| Law | Why it applies to us | Source |
|---|---|---|
| 薬機法 **第66条** (誇大広告の禁止) | It starts with **「何人も」**, so it binds media, writers and affiliates too, not just manufacturers. It bans false or exaggerated statements on drug, cosmetic or device names, efficacy or performance, and statements implying a doctor's endorsement. | Summary verified via https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/koukokukisei/index.html . ⚠ I did not fetch the article text from e-Gov. |
| 薬機法 **第68条** (承認前の医薬品等の広告禁止) | Bans advertising unapproved drugs. A health food making 医薬品的効能 claims is treated as an unapproved drug. | Same as above. Also https://www.city.saitama.lg.jp/008/016/001/010/p018545.html |
| 広告該当性 3要件 | Something counts as advertising when it has **誘引性** (intent to attract buyers), **特定性** (identifies the product) and **認知性** (visible to the public). Source: 厚生省 notice 医薬監第148号 (1998). | https://www.mhlw.go.jp/bunya/iyakuhin/koukokukisei/dl/index_d.pdf |
| 健康増進法 §65 / 景品表示法 §5 (優良誤認) | False or exaggerated health-effect claims, and cherry-picked testimonials. | https://www.mhlw.go.jp/file/06-Seisakujouhou-11130500-Shokuhinanzenbu/0000189523.pdf |
| 医療法 広告規制 (医療広告ガイドライン) | Covers clinic websites and sites that steer patients to a named clinic, i.e. anything with **誘引性 + 特定性**. Patient testimonials about treatment effects and edited before/after photos are **not allowed**. Matters if we ever feature named clinics. | https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/kokokukisei/index.html |
| ステマ告示 (景表法 §5③, **from 2023-10-01**) | A business's ad disguised so that consumers cannot tell it is an ad. | https://www.caa.go.jp/policies/policy/representation/fair_labeling/stealth_marketing , Q&A https://www.caa.go.jp/policies/policy/representation/fair_labeling/faq/stealth_marketing/ |

### 4.2 Phrases to avoid, with safe alternatives

| Area | Avoid (NG) | Safe pattern |
|---|---|---|
| Disease claims (any product or food) | 「〜に効く」「ガンに効く」「高血圧の改善」「生活習慣病の予防」「治る」「完治」 | Describe the condition, its causes and when to see a doctor: 「気になる症状が続くときは、医療機関へ相談を」 |
| Body-function claims for foods | 「疲労回復」「体力増強」「老化防止」「免疫力を高める」「血液を浄化する」「肝機能向上」 (東京都 NG examples) | 「栄養補給」「健康維持」「美容のために」 (allowed only as general purpose statements) |
| Implied efficacy | 「体質改善」「便秘気味の方に」「心臓の弱い方に」「漢方秘法」 | Talk about habits, not products: 「食物繊維をとる食事の工夫」 |
| Cosmetics beyond the 56 permitted claims | 「シミが消える」「シワがなくなる」「肌が若返る」「毛穴が治る」「アンチエイジング効果」 | Use the permitted wording: 「肌を整える」「肌のキメを整える」「肌荒れを防ぐ」「肌にはりを与える」「乾燥による小ジワを目立たなくする」 (efficacy-tested products only), 「日やけによるシミ・ソバカスを防ぐ」 (sunscreen) |
| Certainty and safety | 「必ず」「絶対」「100%」「副作用なし」「安全」「即効」「誰でも」 | 「個人差があります」「〜とされています（出典）」 |
| Endorsement | 「医師も推薦」「専門家お墨付き」「○○病院で使用」 | Show the author's or reviewer's name, role and the 監修 scope, and nothing implying the product is endorsed |
| Unsupported superlatives (景表法) | 「No.1」「日本一」「最安」「最高」 used without basis | Attribute and date them: 「約2.6km、日本一長い**とされる**商店街（公式サイトより）」 |
| Testimonials | Treatment-effect stories about named clinics; reader stories chosen only because they are positive | Avoid named-clinic testimonials entirely. If reader voices are used, select them without bias and say how they were collected. |
| Personal import | Any wording that encourages buying unapproved drugs, or treats it as easy or safe | Point to 厚生労働省's risk guidance: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/kojinyunyu/index.html |

Sources:
- NG and OK food examples: 東京都保健医療局 https://www.hokeniryo.metro.tokyo.lg.jp/anzen/kenko_shokuhin/ken_syoku/kanshi/kounou
- Cosmetic claim list: 大阪府 https://www.pref.osaka.lg.jp/o100100/yakumu/shinsa/hyou1-4.html . The 21 skin-related items are quoted verbatim there.

### 4.3 Linking to the sister store (Osakadou.cool) later: risks and rules

**⚠ High-risk flag.** 厚生労働省's guidance on personal-import agents (医薬発第0828014号, 2002, https://www.mhlw.go.jp/kinkyu/diet/tuuchi/0828-4.html) treats certain actions as **advertising unapproved drugs**:
- showing unapproved drugs to the public to solicit purchases;
- doing so even with the names masked or only photos shown, if the product can still be identified.

Under 薬機法 §68 that is a violation, and it is punishable (§85).

An editorial health article that names or shows such a product and links to a page where it can be bought could meet all three tests (誘引性, 特定性, 認知性). **Labelling it 「PR」 does not cure a §68 problem.** Disclosure fixes ステマ issues, not 薬機法 issues.

Recommended rules (get them reviewed by a 薬機法 lawyer, and/or consult 大阪府 薬務課, before the first link goes live):
1. **Keep editorial and commerce structurally separate.** No product names, product photos or "where to buy" links inside health or condition articles.
2. If a link exists at all, it goes to the store's **top or about page**, never to a product page, and never next to a condition or symptom discussion.
3. **Disclose the relationship** in the same visible place as the link, e.g. 「PR｜当サイト運営会社が運営するオンラインストアへのリンクです」. Per CAA Q&A Q11–14:
   - 「広告」「宣伝」「PR」「プロモーション」 are examples of acceptable wording, but the display as a whole must make it clear.
   - A label that readers might miss (e.g. tucked away in a reply thread) is not enough.
   - A note at the top of a page must be clear in size and colour.
   - Cherry-picked positive quotes become the business's own display.
4. Mark such links `rel="sponsored"`. Google asks for this on advertisements and paid placements: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
5. Publish a **広告・PRポリシー** and **運営者情報** page now, stating that the operator also runs a store. Disclosing this up front builds E-E-A-T and shows the site is not a disguised funnel.
6. Never write 「医師監修」 near commerce. Never imply 監修 covers a product.
7. ⚠ UNVERIFIED: whether linking from an operator-owned media site to the operator's own store is formally treated as 「事業者の表示」 throughout. The CAA Q&A doesn't address group or sister sites directly. Assume it is, and disclose.

---

### Open items / not verified
- 十日戎 day names (宵戎 / 本戎 / 残り福) on the shrine's own page.
- The "日本三大祭" claim about 天神祭 (◐ OSAKA-INFO only).
- 造幣局 2026 page fetched only via search snippets (the site returned 403).
- The 岸和田 recurring date rule.
- The exact wording of 薬機法 §66 / §68 from e-Gov.
- Lmaga.jp and Meets traffic or circulation numbers (not needed for the LP).
- Round 2: whether the 住吉祭 神輿渡御 date is fixed (it is not), the saying 「愛染さんで始まり住吉さんで終わる」, and the 御堂筋 ginkgo peak weeks. See §2.7.
