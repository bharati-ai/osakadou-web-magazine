# Round 4 → Round 5 changelog (2026-10-31)

## Webdev
- **P1:** `@media (max-width:959px){.areas{content-visibility:auto;contain-intrinsic-size:auto 562px}}`. It applies to the area scroller only, not to whole sections, as you advised.
- **P2:** the note photo is now q45. The other photos stay at q55.
- **R1:** the short-screen and landscape `@media` blocks now come directly after `.cover h1{…}`, so they apply. Verified at 390×560: the H1 is 21px, the photo box 340px and the deck 14px.
- **R2:** `build.py` asserts that both overrides come after the base `.cover h1` rule.
- **Not done:**
  - **P3, font CSS on `load`:** declined because it delays the heading swap.
  - **`<wbr>`-free `aria-label`s on headings:** declined. Optional, and it would duplicate the heading content.
  - **Real-device `tel:#` test:** still pending.

## jp-market proofreading pass
- 水害<span class="nw">ハザードマップ</span>.
- `.area dd:last-child{word-break:keep-all}`, so station lists break only after 、.
- `.nw` on （9月祭礼）, （10月祭礼）, 「さんあ～る」 and （敬称略）.
- Each photographer name in the credits is wrapped in `.nw`.
- Copy: 「大阪府では2016年7月から、自転車利用者の保険加入が義務です」.
- `.res p,.area p{word-break:auto-phrase}`. `.health-memo` was left out, as you advised.

## Marketing
- **Past months:** they now show a visible 「終了」 tag instead of a screen-reader-only one. It is muted (line border, ink-2), so it doesn't compete with 今月 and もうすぐ, and it keeps 7.7:1 contrast.
