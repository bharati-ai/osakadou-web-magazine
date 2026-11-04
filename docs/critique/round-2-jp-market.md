# Round 2 critique: jp-market (native Kansai editor / brand strategist)

## Method
- **Fresh captures:** http://localhost:5178/ at 390px and 1280px, light and dark, full-page plus real first-screen views (390×844 and 1280×800). Dark mode was set with `--blink-settings=preferredColorScheme=0`.
- **Copy:** re-read in `index.html` and checked against `round-1-changelog.md`.
- **Version reviewed:** `index.html` changed while I was reviewing, at 19:19:56, after the changelog was written. All findings below are on that version. It was still unchanged when I re-checked at 19:27.
- **Verification:** I confirmed the proposed CSS fixes by rendering scratch copies. I never edited project files.

## P0 regression: the page is currently broken
The live page throws `Uncaught SyntaxError: Invalid or unexpected token` at line 730.

The cause is the new copy-link code. The `'\n'` between `b.dataset.text` and `pageUrl` was saved as a literal CRLF inside a single-quoted string:
```js
copy(b, b.dataset.text + '
' + pageUrl + '#' + b.dataset.copy)
```
The whole main script dies. Because `.js` is added in `<head>`, every `.rv` element stays at `opacity:0`.

What a reader sees now:
- **Hidden content.** 編集部より, all five theme blocks and several ledes are invisible, about 4,000px of blank page on mobile.
- **Calendar.** It is no longer reordered and has no いまの季節/今月 tags.
- **Dead controls.** The 目次 button, the checklist counter, and the copy and share buttons do nothing.
- **Header.** The header wordmark shows on top of the masthead.

**Fix (verified):**
- Write the escape properly: `copy(b, b.dataset.text + '\n' + pageUrl + '#' + b.dataset.copy)`. A scratch copy with only this change renders with no console errors.
- **Failsafe, so a future script error can never blank the page again:** change the head script to `<script>document.documentElement.classList.add('js');addEventListener('error',()=>document.documentElement.classList.remove('js'))</script>`. A window `error` listener catches parse and runtime errors in later scripts, but not image load errors.

## Scores
There are two columns. **Live** is what renders now. **After P0** is the same file with only the one-character fix above. I reviewed that state from a scratch render and from my capture of the pre-19:19 rebuild, which ran without errors. The SCORES line uses Live, because the brief says to judge what renders.

| Parameter | Live | After P0 | Evidence |
|---|---|---|---|
| jp_copy_naturalness | 7 | **7** | Big step up. The 編集部より now has a voice: 「朝の御堂筋線、夕方の商店街、休日の大川沿い。観光ガイドには載らない…」. New cover lines read like a real Kansai magazine: 「近所のお医者さん、どう探す？」「ごみの日、いつやったっけ？」「この季節の大阪、なにがある？」. Quick-list labels are good: 「救急車を呼ぶか迷ったら（24時間）」. Still off: the deck 「大阪で、暮らす。住む人のための、出典つきWebマガジン。」 says 暮らす and 住む back to back, and 「出典つきWebマガジン」 is a clunky coined compound. 「6月は平年で1年でいちばん雨の多い月」 is the で…で I flagged in round 1, still unfixed. 「毎年3月、エディオンアリーナ大阪（大阪府立体育会館）で」 trails off on 「で」. 「日々の買い物の人でにぎわいます」. 「ダイヤル回線・IP電話・iPhoneで発信できないとき」 reads ambiguously. |
| osaka_authenticity | 7 | **8** | This now reads as made by someone who lives here. Evidence: a resident-first cover (親子 under 黄葉, 大阪城公園) and 箕面の紅葉; 区名 on every card; 「お初天神や阪急東通の飲み屋街」 and 「大阪取引所とレトロビル」; the new 天満・天神橋筋 card, whose 「商店街で晩ごはんの買い物をする日」 is the best line on the page. The calendar now has 大相撲三月場所, 愛染まつり, 住吉祭 and 十日えびす（えべっさん）, and the checklist adds the 自転車保険義務. 「まず大阪市のものから扱います」 settles the 市/府 scope. Remaining: three of the six area photos are still postcard landmarks (スカイビル looking up, 通天閣, 大阪城), and the 03 photo is generic cosmetics stock. Live is 7 because the note and themes, which carry half this texture, are invisible. |
| jp_reader_resonance | 4 | **7** | The 15 準備中 tags are gone, and cover lines now jump straight to useful pages. Other gains: 保存版; 06 fallback numbers right in the quick list; calendar 「今月」「もうすぐ」 tags that make the page feel current; and 「大阪に引っ越してきた人も、長く住んでいる人も。」. Still holding it back: there are no actual 読みもの, and on mobile the 保存版 pages sit below 15 future-series titles. Live is 4: scrolling past the cover lands on a blank page and the 目次 button is dead, so a reader would bounce. |
| jp_design_conventions | 4 | **8** | A real magazine grammar: masthead plus deck, coverlines 01–05, 目次 with leaders (now hidden on phones, which removes the triple redundancy), captions with 区, the ベイエリア placeholder gone, "04" fixed, and a unified `saturate(.9)`. Nits: the 保存版 tag renders grey instead of 朱 (see R2), the 03 photo has no caption, and 「天神祭の夜」 lacks (北区). Live is 4 because of the blank sections and dead controls. |
| jp_typography | 6 | **7** | Round-1 faults fixed: "04", the `#7119` glyph, 「24時間・365日」, station names, Latin letter-spacing in the credits (`.ragged`), card gaps and most orphans. New or remaining: **the deck now mixes typefaces** (R1). 「カル／チャー」 splits in the mobile footer. 「体調がすぐれない／ときの相談先」 breaks inside a modifier. `.lede` with auto-phrase gives lopsided rags (「この端末の／中にだけ」). The 区名 in `.area h3 small` is set in Bodoni and falls back to faux-bold serif. The header wordmark grew from 22px to 28px through an unscoped rule. |
| trust_anshin | 6 | **8** | Now strong for Japanese readers. The note's absolute 「販売していません」 is gone. 「運営者は、OSAKA LIVEのほかにも事業を営んでいます…『広告・PR表記について』にしたがって表示します」 discloses early, and 編集責任者 is now a field. 「記事のテーマ選びや内容は…編集部が判断します」. Sources and 最終確認日 throughout. #7119/#8000 have bold Gothic numbers with 06 fallbacks and an iPhone note, and the 美容医療 series is retitled as 「契約と相談先」, a consumer-protection angle. The 【要記入】 placeholders are pending and not scored. Live is 6: blank sections and dead buttons make the site look unmaintained, which is the opposite of anshin. |
| overall_jp_appeal | 4 | **7** | After P0 this is a credible 創刊準備号 from an Osaka magazine. A Japanese reader would still notice the 混植 in the deck, the grey 保存版, the katakana split and a few stiff lines. One polishing pass makes it an 8. Live, it reads as broken. |

## Regressions introduced since round 1
- **R0 (P0).** The script syntax error blanks most of the page (above).
- **R1. Deck typeface mixing.** The Noto Serif JP `text=` subset was regenerated without the deck's 住, む, 典 and `b`. In the deck 「住む人のための、出典つきWebマガジン。」 those glyphs fall back to another face. On iOS that is Hiragino Mincho W6, on Japanese Windows Yu Mincho, and in my capture Yu Gothic Bold. I checked every other mincho-700 string and they are covered. **Fix:** append `%E4%BD%8F%E3%82%80%E5%85%B8b` (住む典b) to the `text=` parameter. Regenerate the subset from the full list of headings, deck and coverlines whenever copy changes, and run a glyph-coverage check before shipping.
- **R2. 保存版 renders grey, not 朱.** `.tag-shu` (line 64) is declared before `.tag`, and `.tag` has the same specificity, so it wins on `border-color` and `color`. **Fix (verified):** `.tag.tag-shu{border-color:var(--shu);color:var(--shu);font-weight:700}`.
- **R3. Header wordmark is now 28px.** Line 296 has `.logo b{font-size:28px}` unscoped. **Fix:** change it to `.ft .logo b{font-size:28px}`, and delete the dead `.ft .hd .logo{…}` and the duplicate `.hd.on-cover .logo{…}` in the footer block.
- **R4. Footer splits 「カル／チャー」 on mobile.** The longer footer line exposed this. **Fix (verified):** `.ft p{word-break:auto-phrase}`.

## Fixes for parameters below 8 (after P0)

### jp_typography: 7 → 8
1. Apply R1 (subset), R2 (保存版), R3 (logo) and R4 (footer).
2. Use this markup: `<h2 id="h-unwell"><span class="nw">体調がすぐれないときの</span>相談先</h2>`. This gives 「体調がすぐれないときの／相談先」. Verified.
3. Take `.lede` out of the `word-break:auto-phrase` list on line 63 and keep `text-wrap:pretty`. The checklist and unwell ledes then wrap evenly. Verified.
4. `.area h3 small{font-family:var(--gothic);font-weight:400;font-size:12px}`, so 区名 renders as clean Gothic. Verified.
5. Keep dates together: `最終確認日：<span class="nw">2026年10月30日</span>`, in both disclaimers.

### jp_copy_naturalness: 7 → 8
- **Deck:** keep the 朱 lead and replace the rest. The new glyphs (目線明記書) must go into the subset, per R1:
  `<p class="deck"><span class="deck-lead">大阪で、暮らす。</span>住む人の目線で、出典を明記して書くWebマガジン。</p>`
  Also update `navigator.share` `text` and `og:description` to match.
- **Calendar and areas:**
  - Summer memo: 「6月は平年では、1年でいちばん雨の多い月。」
  - 3月 small: 「毎年3月、エディオンアリーナ大阪（大阪府立体育会館）」 (drop the trailing で).
  - 天満 card: 「日々の買い物客でにぎわいます。」
- **相談先 fallback numbers:** match the quick list and keep the explanation in one place.
  - `.res` meta: 「つながらないとき 06-6582-7119　24時間・365日」 and 「つながらないとき 06-6765-3650　毎日19:00〜翌8:00」.
  - quick-note: 「「#」から始まる番号は、iPhoneやダイヤル回線・IP電話などからかけられないことがあります。そのときは06から始まる番号へ。」

### jp_reader_resonance: 7 → 8
1. P0 and R2. The 保存版 tag has to read as 朱 to do its job.
2. **Put the live calendar on the cover.** The JS already knows the month. Add this after `const month = …`:
   ```js
   const cur = $$('.season.is-now .ev dt').find((dt) => parseInt(dt.textContent, 10) === month);
   const cl = $('.coverlines a[href="#calendar"] small');
   if (cur && cl) cl.textContent = `${month}月は${cur.nextElementSibling.firstChild.textContent.trim()}ほか。季節の体調メモも`;
   ```
   Today this renders 「10月は岸和田だんじり祭（10月祭礼）ほか。季節の体調メモも」. A dated cover line is how a Japanese 月刊誌 earns the reason to come back. It is not a CTA.
3. **Optional (IA):** move `#unwell` and `#checklist` above `#themes`, and renumber the 目次 so it matches page order. What exists should come before what is coming. On mobile this brings the 保存版 content about 4,000px closer.

### overall_jp_appeal: 7 → 8
This follows from P0 plus the typography and copy fixes above, which are all small, mechanical changes.

## Optional, for the parameters at 8 (no more than two each)
- **osaka_authenticity:** swap the キタ photo (梅田スカイビル looking up, the inbound cliché) for お初天神 or 阪急東通, which the copy already names. Swap the 03 cosmetics stock for an everyday scene with no product textures.
- **jp_design_conventions:** caption the 03 photo, and add (北区) to 「天神祭の夜」.
- **trust_anshin:** once 運営者 is filled in, name the operator's other business category in the disclosure line, if the client and legal approve.

## Verdict
After the one-character P0 fix, this reads as a credible, locally fluent Osaka magazine for Japanese readers. One typography and copy polish pass would make it an 8. As it renders right now, the script error blanks most of the page.
