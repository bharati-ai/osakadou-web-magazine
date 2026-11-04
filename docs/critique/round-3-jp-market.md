# Round 3 critique: jp-market (native Kansai editor / brand strategist)

## What I reviewed
- **Captures:** fresh screenshots of http://localhost:5178/ (`index.html` built 2026-10-31 12:41) at 390px and 1280px, light and dark, plus a first-screen capture at 390×844 and 1280×800. I used `--run-all-compositor-stages-before-draw`. Without it, headless-shell sometimes captures the masthead and photo mid-fade, which is not a page bug.
- **Copy:** re-read in `src/body.html`, `src/app.js` and `src/build.py`, against `round-2-changelog.md`.
- **Checks:**
  - No console errors; the P0 is fixed, and the `<head>` failsafe is in place.
  - My glyph-coverage check finds every mincho-700 string covered by the Noto Serif JP subset: deck, H1, headings, cover lines, 目次, series and kanji marks.
  - The proposed fixes below were confirmed by rendering scratch copies; no project files were edited.

## Scores
| Parameter | R2 (after P0) | **R3** | Evidence |
|---|---|---|---|
| jp_copy_naturalness | 7 | **8** | Every string now reads as native editorial Japanese. The deck 「大阪で、暮らす。　住む人の目線で、出典を明記して書くWebマガジン。」 reads as a statement of editorial stance rather than a coined compound. Theme 04 「だしや粉もん、銭湯、ミュージアム。」 now matches its series. The round-2 copy fixes landed: 「6月は平年では、1年でいちばん雨の多い月。」, the dropped 「で」 after 体育会館, 「日々の買い物客でにぎわいます」, a single 「つながらないとき」 wording, and every # caveat collected in one quick-note. The dated cover line 「11月は大阪・光の饗宴ほか。季節の体調メモも」 reads like a monthly magazine. Minor nits: 「住む人のための…Webマガジン」 appears three times (deck, note, footer), and the 目次 says 「…ガイドの15連載。」 where the cover says 「15の連載」. |
| osaka_authenticity | 8 | **8** | The reorder puts エリアガイド straight after 編集部より, so the local texture now comes first: 区名, お初天神 and 阪急東通, 大阪取引所, the 天満 card's 「商店街で晩ごはんの買い物をする日」, えべっさん, 愛染まつり and 住吉祭, 自転車保険, and 「まず大阪市のものから扱います」. What still holds it below 9: the キタ card (梅田スカイビル shot looking up) and 京橋 card (大阪城) are postcard landmarks, and 03 is still generic cosmetics stock, though it is now honestly captioned 「（イメージ）」. |
| jp_reader_resonance | 7 | **8** | The page now delivers on the cover's promises in order: cover → エリア → 相談先 → 季節 → チェックリスト → 連載. On mobile the 保存版 相談先 starts at about 2,900px, against about 9,000px in round 1. The copy buttons send exactly what a Japanese user pastes into LINE: 「大阪の休日・夜間の医療相談先（#7119・#8000ほか）｜OSAKA LIVE」 plus the URL. The calendar's 「今月」 and 「もうすぐ」 tags and the dated cover line 03 give a reason to come back. The remaining ceiling is that a 創刊準備号 has no 読みもの yet. |
| jp_design_conventions | 8 | **8** | Masthead plus deck, cover lines that match the 目次 (01–06, in page order, with leaders), captions with 区 on every photo, the 朱 保存版, and alternating section grounds. It reads as a magazine. One new nit from the reorder: the desktop header nav still numbers the *themes*, so 「01 暮らし / 02 健康・医療」 sits beside a 目次 button whose list says 「01 大阪エリアガイド / 02 体調がすぐれないときの相談先」 (see Regressions). |
| jp_typography | 7 | **7** | Fixed: deck and H1 in a single typeface; 保存版 in 朱; 「体調がすぐれないときの／相談先」; 区名 in Gothic; the footer 「暮らし・健康・美容・／カルチャーの」; dates kept together with `.nw`; header wordmark back to 22px; credits ragged. Still wrong in the render: desktop ledes break mid-word and leave short last lines, including 「主な駅とあわせて紹／介します。」, 「大阪府・大阪／市の公的な相談窓口です。」, 「順次公開してい／きます。」, 「月ごとにまとめ／ました。」 and 「大阪の毎日を取り上げ／ます。」. On mobile, 「…公的な相談窓口／です。」. The checklist item splits 「スマホの連絡先に登／録した」 at both widths. On mobile, the #7119 card's hours line starts with a stray full-width space, 「　24時間・365日」. |
| trust_anshin | 8 | **8** | 編集方針, early disclosure of the operator's other business, a time-bound PR policy, 「記事のテーマ選びや内容は…編集部が判断します」, a source and 最終確認日 on every block, emergency numbers in bold Gothic with 06 fallbacks, and the #-dialling caveat stated once, clearly. The health tone is calm and never alarmist. The 【要記入】 fields are pending and not scored. |
| overall_jp_appeal | 7 | **8** | A credible, locally fluent 創刊準備号 that an Osaka reader would bookmark and forward on LINE. What remains are 組版 nits on the desktop ledes and one numbering clash in the header. A top Japanese media company would ship this with minor nits only. |

## Regressions
1. **Desktop ledes break mid-word (from the round-2 change that took `.lede` out of `auto-phrase`).** This was my recommendation in round 2, and it was wrong for desktop. Without phrase breaking, the 34em ledes leave 「紹／介します。」, 「大阪／市」, 「してい／きます。」 and other orphans. Fix T1 below corrects it at both widths.
2. **The header nav numbers clash with the 目次 after the reorder (≥960px only).** The header nav says 「01 暮らし / 02 健康・医療…」 (themes), while the cover lines and 目次 say 01 エリア, 02 相談先 and so on. Fix D1 below.
3. **Mobile: the #7119 hours line starts with a stray full-width space.** The 「　」 before `<span class="nw">24時間・365日</span>` wraps to the start of the next line. Fix T3 below.

## Fixes for parameters below 8

### jp_typography: 7 → 8 (all three checked in scratch renders)
- **T1. Ledes: phrase breaks plus balanced lines.** In `src/components.css`, add:
  ```css
  .lede{word-break:auto-phrase;text-wrap:balance}
  ```
  Rendered at 1280px:
  - 「創刊準備号の目次です。連載は、準備が整ったものから／順次公開していきます。気になるところから、どうぞ。」
  - 「救急車を呼ぶか迷うときや、休日・夜間に困った／ときの、大阪府・大阪市の公的な相談窓口です。」
  - 「キタとミナミだけやない。6つのエリアの／横顔を、主な駅とあわせて紹介します。」

  Rendered at 390px:
  - 「救急車を呼ぶか迷うときや、休日・／夜間に困ったときの、大阪府・／大阪市の公的な相談窓口です。」 There is no orphan and no word split.

  I tried `text-wrap:balance` without `auto-phrase` on mobile and rejected it, because it splits 「休／日」.
- **T2. Checklist labels.** Add `.check-grp label>span{word-break:auto-phrase}`. It renders 「#7119と#8000をスマホの連絡先に／登録した」.
- **T3. `.res` meta lines.** In `src/body.html`, replace `</a>　<span class="nw">` with `</a><br><span class="nw">`. There are two occurrences, in #7119 and #8000. The hours then sit on their own line at every width with no stray indent, consistent with the #8000 card.

## Regression fix for a parameter at 8 (design conventions)
- **D1. Make the header nav follow the 目次.** In `src/body.html`:
  ```html
  <nav aria-label="この号の特集">
    <a href="#areas"><span>01</span>エリア</a>
    <a href="#unwell"><span>02</span>相談先</a>
    <a href="#calendar"><span>03</span>季節</a>
    <a href="#checklist"><span>04</span>チェックリスト</a>
    <a href="#themes"><span>05</span>連載</a>
  </nav>
  ```
  It is 17 characters against 18 today, so it fits the same width. The numbers 01–05 then mean the same thing in the header, the cover lines and the 目次. The theme numbers 01–05 stay inside 「5つのテーマ」, where they act as the 連載 numbering, as magazines do.

## Optional improvements for parameters at 8 (no more than two each)
- **jp_copy_naturalness:** change the 目次 05 description to 「暮らし・健康・美容・カルチャー・ガイドの、15の連載。」 so it matches the cover. Change the footer to 「大阪の暮らし・健康・美容・カルチャーを伝えるWebマガジン。」 so 「住む人のための」 isn't said a third time.
- **osaka_authenticity:** when a verified photo becomes available, swap キタ (スカイビル looking up) for お初天神 or 阪急東通, which the copy already names. Replace the 03 cosmetics stock with an everyday scene, such as a 洗面台 or a 銭湯の脱衣所, with no product textures.
- **jp_reader_resonance:** once the first real article exists, list it under 「これから始まる連載」 with a date, e.g. 「11月公開」. Readers return when there is a date to come back for.
- **jp_design_conventions:** on desktop, theme 05 has no photo, which leaves a blank band before 編集方針. Add a verified photo in the 4:3 slot (for example the 西九条駅 platform already vetted in `03-photos.md`), or tighten that `.theme`'s bottom padding.
- **trust_anshin:** when the operator fields are filled in, name the other business's category in the disclosure line, subject to client and legal sign-off.

## Verdict
Yes: this now appeals to Japanese readers in Osaka as a real, locally fluent web magazine's 創刊準備号. It leads with useful, sourced local information in Kansai-natural Japanese. What remains is a 組版 polish on the desktop ledes plus the header numbering. Fixes T1–T3 and D1 would take typography to 8 and close every open item.
