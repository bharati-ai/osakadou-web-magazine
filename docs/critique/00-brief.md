# Critique brief: OSAKA LIVE landing page

## What it is
OSAKA LIVE (domain Osakadou.live) is a Japanese local web-magazine, built as one landing page.
- Tagline: 大阪の暮らし・健康・美容を、もっと身近に。
- Positioning: a guide to life, health and culture in Osaka.
- 5 themes: 01 暮らし, 02 健康・医療, 03 美容・ウェルネス, 04 ひと・トレンド・カルチャー, 05 暮らしのガイド.
- No articles exist yet. This page is the 「創刊準備号」 (pre-launch issue).

**Business goal.** Attract and retain large organic and social traffic from Japanese residents of Osaka (mobile-first, ages 25–55). Later, the plan is to send some of that traffic, legitimately and transparently, to a sister personal-import health store.

## Fixed constraints
These are business and compliance decisions. Do not score down for them, and do not propose breaking them.
- **No CTA of any kind:** no sales, no store links, no email or LINE capture, no signup, no follow prompts.
- **Compliance:** 薬機法, 景表法 and ステマ rules apply. No efficacy claims, no superlatives, no fake data (no invented rankings, reviews, view counts or testimonials).
- **One static page,** no framework, at `D:\Projects\Osakadou.live\index.html`.
- **Known pending items, already tracked:**
  - The 「運営者／連絡先：【要記入】」 operator placeholders are waiting on the client.
  - Photos are hotlinked from Unsplash until deploy, when they will be self-hosted.
  
  Mention these in one line if you like, but don't let them drive your scores.

## Inputs
- **Live page:** http://localhost:5178/ (static server already running). Source: `D:\Projects\Osakadou.live\index.html`, with CSS and JS inline.
- **Background docs:** `D:\Projects\Osakadou.live\docs\01-research.md` (verified facts, references, compliance), `02-ux-ia.md` (intended IA) and `04-copy-ja.md` (copy).

## How to see the page (do this; judge what renders, not just the code)
Make your own working folder, for example `C:\Users\ADMINI~1\AppData\Local\Temp\claude\D--Projects-Osakadou-live\acac107b-dde3-4e62-a87c-4ff9f5b14c86\scratchpad\critique\<your-role>`. Then, in Bash:

```bash
B="$LOCALAPPDATA/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe"
cd "<your folder>"
"$B" --hide-scrollbars --virtual-time-budget=9000 --window-size=390,16000 --screenshot=mobile.png "http://localhost:5178/"
"$B" --hide-scrollbars --virtual-time-budget=9000 --window-size=1280,11000 --screenshot=desktop.png "http://localhost:5178/"
# dark mode: add --force-dark-mode
```

- Use relative output filenames; absolute Windows paths fail silently.
- Then slice the tall PNGs into pieces about 1400px high with Python PIL (`python -I`), and look at them with the Read tool.

## Scoring scale (be strict, don't inflate)
- 10: best in class, at the level of Casa BRUTUS, Lmaga.jp or Hanako's best work.
- 8: strong. A top Japanese media company would ship it with minor nits only.
- 6: competent but generic or flawed in ways a Japanese reader would notice.
- 4 or below: harmful or broken.

## Output
Write your critique to `D:\Projects\Osakadou.live\docs\critique\round-<N>-<role>.md`. Include:
1. A score table: parameter, score out of 10, a one-line justification with specific evidence (quote the string, name the section or selector, describe the screenshot).
2. For **every parameter below 8**, prioritized fixes that can be implemented exactly: the HTML, CSS or JS change, or the replacement Japanese copy. Say what each fix would raise the score to.
3. For parameters at 8 or above: at most 2 optional improvements.
4. A one-line verdict on whether this appeals to a Japanese audience.

Do not edit any project file except your own critique file. Your final message must start with one line of the form `SCORES: {"param": n, ...}`, followed by your top fixes, compactly.
