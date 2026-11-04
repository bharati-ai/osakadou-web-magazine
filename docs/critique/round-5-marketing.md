# Round 5 regression check: marketing

I took fresh renders on 2026-10-31 at 390px and 1280px with reduced motion forced, and a 390×844 fold with motion on. I read them against `round-4-changelog.md` and checked the build for the title, the share labels (`data-text`), the 「セクション」 nav and the 「終了」 tag.

| Parameter | R4 | R5 | Evidence |
|---|---|---|---|
| `concept_positioning` | 8 | **8** | The cover still leads with 「大阪で、暮らす。」 in 朱 and the deck sits above the fold (fold.png). 編集部より keeps the line 「まず大阪市のものから扱います」. |
| `traffic_acquisition` | 8 | **8** | The title, description, `og:image` and `og:image:alt` are unchanged. Both `data-text` share labels are present. The quick card still screenshots as one unit (mobile_02/03). |
| `engagement_retention` | 8 | **8** | **The round-4 nit is fixed.** 9月 now shows a muted 「終了」 tag next to the red 「今月」 (10月) and 「もうすぐ」 (11月) tags, so the three states read as one system without competing (mobile_04). The area scroller still renders and snaps with `content-visibility:auto` (mobile_02). Cover line 03 still reads 「11月は大阪・光の饗宴ほか」. |
| `brand_distinctiveness` | 8 | **8** | The header still reads 01 エリア … 05 連載, matching the cover lines and the 目次 (desktop_00). The masthead, 朱 deck, kanji marks and 保存版 tags are intact. The jp-market line-break polish reads cleaner, for example the area card copy and the checklist sublines (mobile_02, mobile_06). |
| `content_strategy` | 8 | **8** | No change to the series or the theme copy. The checklist rewording 「自転車利用者の保険加入が義務です」 is clearer. |
| `future_bridge_readiness` | 8 | **8** | The policy, disclosure and PR pre-commitment are unchanged. |
| `overall_marketing_effectiveness` | 8 | **8** | Every score holds. |

**Regressions:** none found. I checked the cover at 390px and 1280px, the header nav, the area scroller, the quick card, the calendar tags, the checklist and the meta.

**Verdict:** a launch-ready 創刊準備号 that will appeal to Japanese readers in Osaka. It is trustworthy, written from a resident's point of view, and has 保存版 sections people will share on LINE.
