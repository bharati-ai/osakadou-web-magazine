# Round 4 critique: jp-market (native Kansai editor / brand strategist)

## What I reviewed
- **Captures:** fresh screenshots of http://localhost:5178/ (`index.html` built 2026-10-31 13:00) at 390px and 1280px, light and dark, plus first-screen captures at 390×844, 375×667, 960×700 and 1280×800. I used `--run-all-compositor-stages-before-draw`.
- **Copy:** re-read in `src/body.html`, against `round-3-changelog.md`.
- **Line-break audit (new this round):** I ran a script in a scratch copy of the page that records every rendered line break at 375px, 390px and 1280px. Typography is the open parameter, so I wanted every break checked rather than sampled. I then confirmed the fixes below by re-running that audit and re-rendering. I edited no project files.
- **Console:** no errors.

## Scores
| Parameter | R3 | **R4** | Evidence |
|---|---|---|---|
| jp_copy_naturalness | 8 | **8** | No stiff strings remain. The footer now reads 「大阪の暮らし・健康・美容・カルチャーを届けるWebマガジン。」, so 「住む人のため」 is no longer said a third time. The 目次 05 line 「…ガイドの、15の連載。」 matches the cover. The header labels 「01 エリア　02 相談先　03 カレンダー　04 チェックリスト　05 連載」 are short and natural. Nit: the deck 「住む人の目線で、出典を明記して書くWebマガジン。」 is long for a deck, but it reads clearly. |
| osaka_authenticity | 8 | **8** | Unchanged and solid: 区名, お初天神 and 阪急東通, the 天満 card, えべっさん, 愛染まつり and 住吉祭, 自転車保険, and the 大阪市 scope. The new 2:3 mobile crop of the cover shows the parent and child under 黄葉 more clearly. The ceiling is the same as before: the キタ (スカイビル) and 京橋 (大阪城) cards are still postcard shots, and 03 is still stock imagery. |
| jp_reader_resonance | 8 | **8** | The header, cover lines and 目次 now share one numbering, so a reader on desktop can use any of them. On 10/31 the calendar shows 「10月 今月」 and 「11月 もうすぐ」, and cover line 03 reads 「11月は大阪・光の饗宴ほか」, which feels current. The LINE copy text works. The ceiling is still that there are no 読みもの yet. |
| jp_design_conventions | 8 | **8** | D1 is fixed: the header 01–05 now match the cover and 目次. I verified the header fits on one line at 960px. Past months now show in ink-2 instead of fading; this is quieter but still readable, and it looks better in dark mode. The cover's art-directed crop is better on phones (2:3) and still strong on desktop (square). The remaining nit: theme 05 has no photo, which leaves a blank band on desktop before 編集方針. |
| jp_typography | 7 | **8** | T1–T3 landed, and every prominent string is now set well. The ledes break by phrase and balance their lines: 「キタとミナミだけやない。6つのエリアの／横顔を…」, 「暮らし、健康、美容、ひと、ガイド。／5つの柱で…」, and 「救急車を呼ぶか迷うときや、休日・／夜間に困ったときの、大阪府・／大阪市の…」 on mobile. Other fixes: 「…スマホの連絡先に／登録した」, the #7119 hours on their own line with no stray space, the deck and H1 in one face, and all headings phrase-broken. What keeps this a low 8: the audit found a handful of mid-word breaks in small metadata, including **one regression** (listed below). |
| trust_anshin | 8 | **8** | Unchanged and strong: the editorial policy, early disclosure of the operator's other business, a time-bound PR policy, a source and 最終確認日 on every block, and bold Gothic emergency numbers with 06 fallbacks. One new nit: the build now stamps 最終更新日 with the build date (10/31), while the content blocks say 最終確認日 10/30. Today that is consistent, but the date will now move on every rebuild even when nothing has changed (see Optional). |
| overall_jp_appeal | 8 | **8** | This is a polished, locally fluent 創刊準備号 that an Osaka reader would bookmark and share. Every parameter is now at 8. What remains is proofreading-level line-break polish, plus the photo and article ceilings that the 準備号 format imposes. |

## Regressions and line-break nits (fix before ship; all checked by re-running the audit)
The audit found these breaks. Breaks inside long justified body text (the 編集部より, theme descriptions and policy) are normal Japanese typesetting, so I have not flagged them.

1. **Regression (from round-3 T2): 「水害ハ／ザードマップ」 at every width.** `.check-grp label>span{word-break:auto-phrase}` is inherited by the `<small>`, and Chromium's phrase segmenter mis-splits this katakana word. Fix in `src/body.html`: `水害<span class="nw">ハザードマップ</span>を公開しています`. It renders as 「大阪市は24区それぞれの／水害ハザードマップを公開しています」.
2. **Station names split at 375px and 390px** (iPhone SE and mini, and iPhone 12–15): 「大阪阿部／野橋」 at 375, 「なに／わ橋」 at both widths. Fix in `src/components.css`: `.area dd:last-child{word-break:keep-all}`. The 主な駅 list is the last `dd`, and with `keep-all` it breaks only after 「、」: 「淀屋橋、北浜、／なにわ橋、大江橋、／渡辺橋、中之島」 and 「天王寺、／大阪阿部野橋、／阿倍野、天王寺駅前、／四天王寺前夕陽ケ丘」.
3. **Calendar, 375px: 「岸和田だんじり祭（10月／祭礼）」.** Fix: wrap both festival qualifiers, `岸和田だんじり祭<span class="nw">（10月祭礼）</span>`, and the same for （9月祭礼）. It renders as 「岸和田だんじり祭／（10月祭礼）」.
4. **Checklist, 375px: 「さんあ～／る」, an app name split.** Fix: `<span class="nw">「さんあ～る」</span>`.
5. **Checklist: 「自転車に乗る／人の保険加入」 at every width, a modifier split.** Fix the copy to the 府's own term, 「大阪府では2016年7月から、自転車利用者の保険加入が義務です」. It renders as 「…自転車利用者の／保険加入が義務です」.
6. **Short last lines in cards.** At 1280px: 「…混ざり合う街／です。」, 「…レトロビルの並ぶ街／です。」 and 「…診療科から調べたい／とき。」. At 390px: 「にぎわい／ます。」 and 「相談に応じ／ます。」. Fix: `.res p,.area p{word-break:auto-phrase}`. The cards go ragged-right with phrase breaks, e.g. 「お初天神や阪急東通の飲み屋街が／混ざり合う街です。」, and every one of these short lines disappears. I tried adding `.health-memo` as well and rejected it, because it splits 「平年の日／最高気温」.
7. **Photo credits split names: 「Kent／Chin」 at 1280px, 「Paul／Cuoco」 at 390px, and 「（敬／称略）」 at 375px.** Fix in `src/build.py`: `CREDITS = "、".join(f'<span class="nw">{b}</span>' for b in dict.fromkeys(m["by"] for m in IMG.values()))`, and in `body.html` use `<span class="nw">（敬称略）</span>`.

With fixes 1–7 applied, the audit at all three widths shows only intentional `<br>` breaks, the intended 「体調がすぐれないときの／相談先」, and normal character breaks inside justified body paragraphs.

## Optional improvements (no more than two per parameter)
- **jp_design_conventions:** give theme 05 a verified 4:3 photo (for example the 西九条駅 platform already vetted in `03-photos.md`), or reduce that block's bottom padding on desktop.
- **osaka_authenticity:** when a verified photo becomes available, replace the キタ スカイビル shot with お初天神 or 阪急東通, which the copy already names.
- **trust_anshin:** stamp 最終更新日 only when the content changes, for example from a content hash or a date kept in `src/` and bumped by hand, rather than on every build. A 最終更新日 that changes with no visible change erodes trust for readers who check it, and for Google.
- **jp_reader_resonance:** when the first article publishes, mark it in its series list with a date, e.g. 「11月公開」.

## Verdict
Yes. This appeals to Japanese readers in Osaka as an authentic, carefully made local web magazine; nothing about it reads as 外国人が作った感. All seven parameters are at 8. What remains is a proofreading pass on line breaks in small metadata, one of them a regression from round 3, which fixes 1–7 close completely.
