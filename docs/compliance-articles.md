# Launch articles: compliance review (薬機法・医療広告GL・景表法・特商法・YMYL)

- **Scope:** the 15 files in `content/posts/*.html`.
- **Reviewed:** 2026-10-31.
- **Rules applied:**
  - the article constraints: no オオサカ堂, no personal import, store or buying, no named drug, supplement, cosmetic, brand or clinic, no efficacy claims;
  - `docs/cms/HTML-STYLE-GUIDE.md` §4.
- **Validation:** after editing, every `<!--meta … -->` block parses with `JSON.parse`. `slug` and `category` match the originals, `reviewed` is `2026-10-31` in all 15 files, and every health and beauty article ends with an `ol-box--caution`.

## Results

**Totals:** 6 OK · 9 fixed · 0 needs a human (a few optional follow-ups are listed further down).

| File | Verdict | Issues found | Changes made |
|---|---|---|---|
| biyou-iryou-keiyaku-soudan | fixed | 「承認された使い方かも…確かめておくと安心です」 suggests that an approved drug used as approved is "safe". The 特商法 content is accurate: the 2017 addition, the 1か月超・5万円超 conditions, the five methods in the 省令, cooling-off within 8 days of the 書面 (paper or electronic), 関連商品, the 中途解約 caps (2万円, or 5万円 / 20% of 契約残額, whichever is lower) and the 取消権. The 医療広告GL points are also accurate: no 体験談, conditions on B/A photos, retouched photos count as 虚偽広告. The article does not promote treatments. The PIO-NET counts (6,281 / 10,744 / 7,944) match kokusen.go.jp, updated 2026-07-31. The 「安全」 hits are only the name 「医療安全支援センター」. | 「…確かめておくと安心です」 → 「…確かめておきましょう」. |
| keshouhin-seibun-hyouji | fixed | The lead frames label reading as a way to 「自分の肌に合うものを選ぶ」, which reads like product choice or buying. 「お試しのつもりが定期購入だった」 mentions buying. 「とっておくと安心です」 sits next to a cosmetics-safety context. The other 「安全」 hits are the law's name or negations (「お墨付きではありません」). The 56 効能 and the 1% rule are accurate. | Lead: removed 「自分の肌に合うものを選ぶ手がかりになります」. Consumer-trouble sentence → 「契約や解約をめぐる相談も目立ちます」. FAQ: 「安心です」 → 「とっておきましょう」. |
| osaka-kikou-skincare | fixed | The heat-illness paragraph gives 119 but not #7119. The FAQ 「日焼け止めはどう選べばいいですか」 is product-selection framing. 「用意しておくと安心です」 is a mild efficacy implication. The JMA claims (UV peaks around 夏至; 曇り about 6割) and the MOE claims were spot-checked and are correct. | Added the #7119 sentence. FAQ → 「どう使い分ければいいですか」 / 「使い分ける」. 「安心です」 → 「用意しておきましょう」. |
| osaka-kakaritsukei | fixed | 「市販薬を選ぶときに迷ったら」 is OTC-purchase framing. Otherwise accurate: 選定療養 amounts, #7119 and #8000, 119. | → 「市販薬について迷ったときも、…薬剤師に相談してください」. |
| osaka-kyujitsu-yakan-iryo-soudan | fixed | The poisoning FAQ pointed only to 大阪中毒110番, with no 119 cue for severe symptoms. Everything else defers correctly to #7119, #8000 and 119 and to the 消防庁 leaflet. | Added 「意識がおかしい、けいれんしている、呼吸が苦しいなどのときは、すぐに119番に電話してください」. |
| osaka-gan-kenshin-tokutei-kenshin | OK | 「必ず精密検査を受けてください」 is an instruction attributed to the city, not a guarantee. The caution box states that 検診 does not guarantee the absence of disease. Fasting guidance defers to the 主治医. | None. |
| osaka-nankai-trough-bousai | OK | 「なるべく安全な場所で」 and 「必ず起きる…予知ではなく」 are fine. NTT's 171 is a designated disaster service, kept on purpose. | None. |
| osaka-hikkoshi-tetsuzuki | OK | The flagged 「安全」 is only the ordinance name and 「生活安全課」. 日本郵便 e転居 is a postal public service, kept. | None. |
| osaka-hitorigurashi-junbi | fixed | Three mentions of **「OSAKA LIVE」**, the retired working name, which must not be reintroduced. Brand names PiTaPa and ICOCA. 「App Store / Google Play」 names online stores. 「購入前に」. The flagged 「安全」 is only the ordinance name. | 「OSAKA LIVE」 → 「当サイト」 (×3). IC cards made generic (「後払い式のカードを除き…チャージが必要」). → 「iPhone用とAndroid用があり」. 「購入前に」 → 「事前に」. |
| osaka-sento | fixed | 「泉州タオル」 is a regional collective brand. 「伝え合っておくと安心です」 sits inside the bathing-risk section. There is no 「安全」 in the body. The 入浴 cautions match 消費者庁 caution_084 word for word, checked: 「食後すぐの入浴や、飲酒後、医薬品服用後の入浴は避けましょう」 and 「交通事故で亡くなる方より非常に多く」. No individual sento is named. | → 「地元のタオル産地と組んだ催し」. 「安心です」 → 「伝え合っておきましょう」. |
| osaka-gomi-bunbetsu | OK | Industry bodies (パソコン3R推進協会, 日本エアゾール協会 and others) are named only as contacts that the city designates. | None. |
| osaka-dashi-konamon | OK | No shop names; the 発祥 claims are hedged. Umami chemistry is taste, not a health claim. | None. |
| nakanoshima-museum | OK | Museums and landmarks only. Company names (朝日新聞社, 住友) and the カールツァイスⅡ型 appear as history. 「必ず確認」 is an instruction. | None. |
| suito-osaka-kawabe | fixed | Date error: the table attached the whole 光の饗宴 period (to 2027-01-31) to the 中之島 illumination. The city press release gives 中之島イルミネーションストリート 11/3–12/31 (checked). | The table cell now gives the event period and adds 「中之島イルミネーションストリートは2026年12月31日まで」. |
| osaka-shotengai-sanpo | OK | 「日本一長い」 is always hedged (「といわれる」) and attributed to 大阪観光局 and the street's own site. The article covers streets, not individual shops. | None. |

## Needs a human or lawyer

Nothing blocks publication. Before launch or soon after, one person should decide the following:

1. **Biyou article and the brand context.** The article accurately notes that unapproved drugs or devices may be used in 自由診療, and that misuse falls outside 医薬品副作用被害救済制度. These statements discourage unapproved drugs, which runs against the sister store's interest, so they are low-risk under §68. Still, any future link from this site to the store must never sit near this article. The policy in memory already requires a lawyer to review the store link.
2. **Interpretation of "no buying".** I read the rule as covering health, beauty and drug products, plus store or import pathways. Everyday shopping is kept: 商店街, groceries, 粗大ごみ手数料券, ローリングストック. Legal descriptions of contracts are also kept: 特商法 関連商品 and the 188 consumer-trouble guidance. If the rule is meant literally for every article, the shotengai article would need rework.

## Optional follow-ups (source hygiene, not compliance)

- suito-osaka-kawabe and osaka-shotengai-sanpo cite **京阪電車** for 天神祭 and 千林, and shotengai also cites the **商店街's own site**. These are primary but commercial. Where possible, swap them for 大阪天満宮 or 大阪観光局 pages.
- I did not verify the following against sources, because the writers did: the 医療広告等ガイドライン 「令和8年3月30日最終改正」 date, the 2026-09-25 ナビイ かかりつけ医機能 search launch, and the 八軒家浜 water show running to 2027-02-28.
