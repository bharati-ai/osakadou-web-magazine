# Round 5 regression check: jp-market

## What I checked
- **Captures:** fresh screenshots of http://localhost:5178/ (`index.html` built 13:19), at 390px and 1280px in light and dark, plus 390×560 and 375×667. No console errors.
- **Line-break audit:** re-ran the round-4 script at 375px, 390px and 1280px.

## Audit result
All round-4 proofreading fixes render correctly at every width.

| Fix | 375 | 390 | 1280 |
|---|---|---|---|
| 水害ハザードマップ | 「…それぞれの／水害ハザードマップを…」 | same | same |
| Station lists break only after 「、」 | 「天王寺、／大阪阿部野橋、／…」 | 「淀屋橋、北浜、／なにわ橋、…」 | OK |
| （10月祭礼） | 「岸和田だんじり祭／（10月祭礼）」 | one line | one line |
| 「さんあ～る」 kept whole | OK | OK | OK |
| 「自転車利用者の」 | OK | 「…自転車利用者の／保険加入が義務です」 | OK |
| Credit names kept whole | OK | OK | OK |
| Card short last lines (「街／です。」, 「とき。」, 「ます。」) | gone | gone | gone |

What the audit still flags:
- Intentional breaks: `<br>` lines, 「体調がすぐれないときの／相談先」, and the 「今月」 and 「終了」 tags under the month.
- Character-level breaks inside long justified body text. These are normal Japanese typesetting.
- 「インフルエンザ」 split in the 体調メモ. This was deliberately left alone, because auto-phrase would split 「日最高気温」.

## New changes
- **「終了」 tag:** muted and readable in both modes, and it doesn't compete with 「今月」 or 「もうすぐ」.
- **Area cards with `content-visibility` on mobile:** they render normally, and the audit could still measure them.
- **Short-screen cover (390×560):** a smaller H1 and deck. The deck breaks at a phrase boundary, 「出典を／明記して書く…」, which reads acceptably.

## Scores
| Parameter | R4 | **R5** | Note |
|---|---|---|---|
| jp_copy_naturalness | 8 | **8** | One copy change, 自転車利用者, which is natural and matches the 府's own term. |
| osaka_authenticity | 8 | **8** | No change. |
| jp_reader_resonance | 8 | **8** | No change. The 「終了」 tag makes the calendar easier to scan. |
| jp_design_conventions | 8 | **8** | The tag is muted correctly. Theme 05 still has no photo (optional). |
| jp_typography | 8 | **8** | Now a solid 8: every round-4 nit is closed, including the ハザードマップ regression. |
| trust_anshin | 8 | **8** | No change. |
| overall_jp_appeal | 8 | **8** | No change. |

## Regressions
None.

## Verdict
All seven parameters hold at 8 with no regressions, and the page reads as an authentic, carefully set Osaka web magazine for Japanese readers.
