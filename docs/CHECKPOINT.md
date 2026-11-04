# Checkpoint — 2026-11-04 (launch-ready build)

This checkpoint covers the request "オオサカ堂 keyword, real blog content, admin panel, CMS + API, full audit". It is **complete**. The earlier critique-loop checkpoint is in `docs/critique/CHECKPOINT.md`.

## Verification
- **Static checks:** `npx tsc --noEmit` passes. The tool self-checks pass: `data.check.mts`, `osaka-ben.check.mjs` and `matsuri.check.mjs`.
- **Build:** `next build` passes on a **fresh database**: 73 pages, no warnings, `proxy.ts` active. The seed creates migration v2, 15 posts, 20 categories and the env admin.
- **Production smoke test (`next start`):**
  - All 55 sitemap and core URLs return 200. Unknown URLs return a Japanese 404.
  - `/blog/OSAKA-SENTO` returns a 308 to the lowercase URL. `/admin` returns a 307 to the login page.
  - The security headers and CSP are present, and `X-Powered-By` is gone. The home `<h1>` is オオサカ堂, and "OSAKA LIVE" appears nowhere.
  - API round trip: create a draft (byline オオサカ堂編集部) → the draft returns 404 publicly → permanent delete. Clean-up checked afterwards.
- **Five specialist audits** ran (performance, UX/a11y, security, SEO/content, tools QA). They found **0 P0**, and **all 30 P1s are fixed**. The fix log and deferred items are in `docs/audit/SUMMARY.md`.

## What was built (pointers)
- **Brand:** オオサカ堂 (OSAKADOU) at osakadou.live. The title, logo, masthead (home `<h1>`), footer, JSON-LD and the byline 「オオサカ堂編集部」 all use it. The default OG image is `public/og-default.jpg` (replaceable in the SEO center). The brand is kept out of sentences about medicine or sales.
- **Content:**
  - 15 researched, compliance-reviewed articles (`content/posts`, `docs/compliance-articles.md`). They sit behind every 連載 link on the home page; the theme section is now titled 「主な記事」.
  - Category pages and 「オオサカ堂について」 (`/about`).
- **CMS (`lib/cms`), admin (`/admin`) and API (`/api/v1`):** see the README, `docs/cms/API.md` and `docs/cms/HTML-STYLE-GUIDE.md`. The admin has:
  - a 日本語 / English switch (cookie `ol_admin_lang`; the public site stays Japanese);
  - an Elementor-style **visual page builder** (`/admin/pages/<page>`): the real page in an iframe canvas, click any text or photo to edit its block in the side panel with live preview, a navigator tree, phone/tablet/desktop widths, and version history with restore. Lists listed in `RULES` (`lib/cms/pages.ts`) can be added to, duplicated, removed and reordered within bounds: hero slides (1–12, with autoplay, seconds per slide and per-slide crop focus), feature tiles (reorder, editable links), editor’s-note and about paragraphs, seasonal events, areas, checklist groups and items (progress kept by item id), theme article links and policy blocks. Fixed by design: the four seasons, the six help-line cards (phone numbers and links stay in code) and the five themes. Structural changes re-render the canvas from a draft (`/cms-preview/<page>?draft=1`); text and photos still patch in place. The canvas side is `components/cms-bridge*.ts(x)`, driven by `data-cms="page:path"` attributes;
  - an **SEO center** (`/admin/seo`, anyone with the SEO permission): site titles and template, descriptions, default OG image, X handle, `sameAs`, Search Console / Bing / Yandex verification, AI-crawler policy, robots.txt rules, sitemap and indexing rules, FAQ and breadcrumb schema, llms.txt — versioned with restore; per-page overrides (title, description, OG, canonical, noindex/nofollow) for pages, categories and tools; a redirect manager (applied in `proxy.ts`, with hit counts); and an SEO audit;
  - a TipTap post editor with revisions, preview, a slim sticky bar holding the back link, title, status and Save (the formatting toolbar sticks just below it), a leave guard, and a Yoast-style SEO panel (focus keyphrase checks, SERP/social preview, canonical, OG, nofollow, schema type, FAQ schema);
  - **users and access** (`/admin/users`, admins only): six roles — 管理者 / 編集者 / SEO担当 / 投稿者 / 寄稿者 / 閲覧者 — with per-user custom permissions (`lib/cms/perms.ts`), a per-user page (profile, role, password reset with generator and “change at next sign-in”, sign out everywhere, deactivate, delete with email confirmation), lock-out guards (no self-demotion, last admin protected), and an activity log of sign-ins and every user change. Posts record their creator: authors and contributors edit only their own; without “Publish” a writer saves drafts and asks for review (「レビュー待ち」 tab and dashboard notice);
  - categories, media, API keys, account (role, permissions, sign out other devices), and a live style guide.

## Local dev
- `.env.local` holds the dev admin login. The DB was reset today, and the account is re-created from that file on first start.
- `data/` is gitignored. Delete it to re-seed.

## Before / at launch (owner actions)
0. **SEO center first:** paste the Search Console (and Bing) verification codes, add the official social URLs to `sameAs`, and decide the AI-crawler policy. Then submit `https://osakadou.live/sitemap.xml` in Search Console.
1. **Hosting:** a VPS or container with a **persistent volume** for `DATA_DIR`, running `next start` behind **Caddy, nginx or Cloudflare with brotli + HTTP/2** (README → Deploy). Set `TRUST_PROXY=1` only behind such a proxy. Set a strong `ADMIN_PASSWORD`, then change it after the first login.
2. **Backups:** nightly copies of `osakadou.db` together with `uploads/`.
3. **Legal (薬機法 / 景表法):**
   - the lawyer decides on S-23: whether the brand may sit next to 健康・美容 in titles and the OG image;
   - the lawyer reviews any future link to Osakadou.cool (the rules are in project memory);
   - an operator or contact page is deferred, per the owner.
4. **Facts a human should re-check** (the writers flagged them):
   - 中之島香雪美術館's hours and access (its site refused the fetch);
   - the 大阪府 sento fee limit of 600円;
   - the two commercial sources in the living articles (京阪 and a 商店街 site).
5. **Every year:**
   - review the calendar and event dates (admin → ページ編集 → トップページ, and `components/tools/culture/matsuri.ts`);
   - review the `reviewed` dates on the articles.
6. **Phones:** test the `tel:#7119` / `#8000` links on a real iPhone, in Safari and in LINE.

## Optional next work (P2s deferred in the audit)
- An SVG icon sprite and server-rendered weather icons (about 15–50 KB).
- Mounting the map when it scrolls into view.
- Roving tabindex and text labels in the editor toolbar.
- Card layout for the post list on phones.
- A preview before publishing page edits.
- English subtitles for each category.
- A contact form, if the owner later wants operator or contact details.
