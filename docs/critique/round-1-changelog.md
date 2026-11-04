# Round 1 → Round 2 changelog

All round-1 critiques were read together and applied to `index.html`, rebuilt on 2026-10-30.

## Applied

### Concept, positioning and brand (marketing, jp-market)
- **Cover:** added a one-line deck under the masthead, 「大阪で、暮らす。住む人のための、出典つきWebマガジン。」.
- **Title:** now query-first, 「大阪の暮らし・健康・美容のWebマガジン｜OSAKA LIVE」.
- **Description:** rewritten around concrete nouns: #7119・#8000, 季節カレンダー, 12項目チェックリスト, 出典つき, and the reading オオサカライブ.
- **Share image:** a branded 1200×630 `og-cover.jpg` (masthead, tategaki H1, deck, 創刊準備号, the cover photo), with og:image width, height and alt.
- **Cover photo:** the 道頓堀 neon cover is gone. The new cover is a resident-first autumn shot of a parent and child walking under ginkgo in 大阪城公園, with the caption 「黄葉の大阪城公園（中央区）」.
- **編集部より photo:** swapped from 大阪城 to 箕面の紅葉, with a caption. No landmark appears twice any more.
- **Captions:** every editorial photo now has a place caption (theme 01, 02 and 04).
- **Area cards:** the romaji is replaced with 区名, and the copy is rewritten with local knowledge (お初天神, 阪急東通, 大阪取引所, 新世界).
- **ベイエリア card:** replaced by 天満・天神橋筋 (kanji 宮), with a verified photo of the 天神橋1丁目 arcade.
- **Header:** the wordmark is hidden while the cover masthead is on screen.
- **Footer:** the line now reads 「大阪に住む人のための、暮らし・健康・美容・カルチャーのWebマガジン。」.
- **English labels:** made consistent: "People & Culture" in both places and "Help Lines" in both places.

### Engagement (marketing, jp-market)
- **Cover lines:** they now jump to sections that have content: #areas, #unwell, #calendar, #checklist and #themes. The copy is new, with a light Kansai touch: 「近所のお医者さん、どう探す？」「ごみの日、いつやったっけ？」.
- **準備中 tags:** all 15 are removed. 「準備中の連載」 is now 「これから始まる連載」, and the 目次 lede says the series will publish in order.
- **保存版 tags:** added on #unwell and #checklist.
- **Quick-number card:** sits under the 119 bar (#7119, #8000, 06-6693-1199) in bold Gothic, with a note for iPhone users.
- **Calendar:**
  - Months already past in the current season are dimmed, and the current month carries a 「今月」 tag.
  - The weather fillers are replaced with verified events: 大相撲三月場所, 中之島公園ばら園, 愛染まつり, 住吉祭 and 十日えびす（えべっさん）. Sources are in research §2.7.
  - The climate normals now sit in the 体調メモ, and the autumn memo carries the JMA figures.
- **Mobile:** the #contents section is hidden on phones, where the cover lines and the 目次 button cover it.

### Content strategy (marketing)
- **Series swaps:**
  - 皮膚科 → 「大阪市のがん検診・特定健診ガイド」
  - 季節のスキンケア → 「大阪の気候に合わせた、季節のスキンケア」
  - つくり手 → 「大阪のだしと粉もんの話」
- **Wording:** 「水辺」 → 「川べり」.
- **Ledes:** the #unwell and #checklist ledes now include place names and a 新生活 hook.

### Trust and the bridge to the store (marketing, jp-market)
- **編集部より rewrite:**
  - It now has an editorial voice: 「朝の御堂筋線、夕方の商店街、休日の大川沿い。観光ガイドには載らない…」.
  - The unqualified 「商品の販売や広告の掲載を行っていません」 is removed. That commitment now appears, time-scoped, only in the policy section.
- **運営者情報:**
  - Added a line disclosing that the operator runs other businesses.
  - Added an 編集責任者 field (【要記入】, waiting on the client).
- **広告・PR policy:** now states that 「記事のテーマ選びや内容は、編集方針にもとづいて編集部が判断します。」.

### Typesetting (組版) (jp-market, webdev)
- **Justification:** only the note, the theme descriptions and the policy are justified, and `inter-character` is removed so Latin text gets normal spacing. The health notice box is ragged.
- **Line breaks:**
  - `text-wrap:pretty` on paragraphs.
  - `auto-phrase` on ledes, captions and meta text.
  - Headings use `keep-all` with `<wbr>` at phrase points, upgraded to `auto-phrase` where the browser supports it, so iPhone and Safari also break by phrase.
  - `.nw` keeps 「24時間・365日」 together.
- **Theme numerals:** `white-space:nowrap`, so "04" no longer breaks.
- **Phone numbers:** #7119, #8000, 06-… and 119 are now bold Gothic, not Bodoni hairlines.
- **Typefaces:**
  - Long-form mincho (the note and the series lists) uses the system mincho.
  - The Windows Gothic stack now prefers Yu Gothic Medium.
  - The kicker's letter-spacing is reduced on mobile.

### Performance (webdev)
- **Noto Serif JP:** loaded as a single Google Fonts `text=` subset of the heading glyphs at weight 700. **61 KB in one file with 2 KB of CSS**, against about 977 KB across 33 files before. The 900 weight is dropped.
- **Render order:** the `js`-class script is now above the stylesheet links, and the H1 no longer has an entrance animation.
- **Hero art direction:** the new cover photo is portrait, so the mobile crop is native rather than upscaled.

### Accessibility, robustness, SEO and code (webdev)
- **119 link:** focus ring is now visible (`--on-shu` outline).
- **English labels:** `lang="en"` on all 36.
- **Removed:** the logo `aria-label` and the area "scroll" label.
- **Tap targets:** inline `tel:` links get padded targets.
- **Contents list:** one list in the page, cloned into the dialog, which is wrapped in `<nav aria-label="目次">`. The dialog hides the descriptions so it fits one screen.
- **No JS:** the 目次, copy and share buttons are hidden.
- **Print:** reveals are forced visible.
- **Inline styles:** all 15 `style=""` attributes moved into CSS.
- **Copy and share:** feedback resets after 2.5 s, and a share error that is not an abort falls back to copy.
- **Older browsers:**
  - `color-mix` fallback via `@supports not`
  - `dialog:not([open]){display:none}` and a `showModal` guard
  - a `100vh` fallback for `dvh`
  - an IntersectionObserver fallback
  - a short-landscape media query
  - masthead overflow handling at 320px
- **Anchors:** now descriptive: #living, #health, #beauty, #culture, #guide.
- **Icons:** real `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` and `logo-512.png`.
- **JSON-LD:**
  - `NewsMediaOrganization` with a logo, `correctionsPolicy` and `ethicsPolicy`
  - `City` with `sameAs` Wikidata Q35765
  - `primaryImageOfPage`
- **Checklist:** the IC-card item is swapped for the verified 自転車保険 obligation (大阪府, since 2016-07-01), with the source added.

## Declined or deferred, with reasons
- **Noto Sans JP webfont for body text (jp T2):** declined because it conflicts with the webdev font budget. Windows now gets Yu Gothic Medium through the font stack.
- **御堂筋 ginkgo cover (jp A1):** no compliant photo exists, so the cover uses ginkgo in 大阪城公園.
- **「愛染さんで始まり住吉さんで終わる」 (jp A2):** could not be verified, so it's left out. The fixed 8/1 渡御 date is wrong, so the calendar uses the verified period instead.
- **Bay photo (jp D3):** the bay card was replaced with 天満 (marketing A5), the resident-first choice.
- **Naming the store category in the operator disclosure (marketing F2, strong version):** that is a client and legal decision, so the generic disclosure is used.
- **「関与させません」 independence clause (marketing F3):** an earlier compliance review called this an unkeepable promise, because the operator is the publisher. It was replaced with the process statement above.
- **更新の記録 (marketing C5):** skipped, because there are no real updates yet.
- **Self-hosting fonts and images, brotli and cache headers, a CSP hash for the inline script and style (webdev P1c, P6, C4):** deferred to deploy. This single-file page keeps an inline `<style>` and `<script>`.
- **`tel:#` on iPhone (webdev A5):** fallback labels and a note are in place. A test on a real device is still pending.
