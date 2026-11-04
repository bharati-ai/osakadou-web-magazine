# Pre-launch audit: summary and fix log (2026-11-04)

Five specialist audits ran against the production build at :3200. The detailed reports in this folder are the source of truth for each finding:

| Area | Report | P0 | P1 | P2 |
|---|---|---|---|---|
| Performance | [performance.md](performance.md) | 0 | 7 | 11 |
| UX, responsive, a11y | [ux-responsive-a11y.md](ux-responsive-a11y.md) | 0 | 8 | 21 |
| Security | [security.md](security.md) | 0 | 2 | 6 |
| SEO, content, JP market | [seo-content.md](seo-content.md) | 0 | 9 | 24 |
| Tools and features QA | [tools-features.md](tools-features.md) | 0 | 4 | 10 |

No audit found a P0. **Every P1 (30 across five audits) is fixed**, except the two items that need an owner decision (listed at the end).

## Fixed

### Security
- **SEC-02** The home JSON-LD `</script>` escape now works (`"\\u003c"`), so an admin-editable title can no longer inject a script.
- **SEC-01** Security headers in `next.config.ts`:
  - CSP, production only, no nonces so pages stay static: `frame-ancestors 'self'`, `object-src 'none'`, `form-action 'self'`, images limited to self and OSM tiles;
  - `X-Frame-Options`, nosniff, `Referrer-Policy`, `Permissions-Policy` and HSTS;
  - `X-Powered-By` removed.
- **SEC-03** Login throttle: the counters are per IP+email (5) and per email (10). `X-Forwarded-*` is trusted only when `TRUST_PROXY=1`.
- **SEC-04** One static dummy hash, so login timing no longer reveals whether an account exists.
- **SEC-05 / 07** A corrupt image now returns a 422 instead of a 500. The decode cap is 40 MP.
- **SEC-06 / 08** The upload Origin check ignores `X-Forwarded-Host` unless the proxy is trusted. SSRF errors no longer echo the resolved address.

### SEO and content
- **S-01** Every page has its own Open Graph card (`pageMeta`/`og` in `lib/site.ts`, all 22 tool pages, listings, articles with site name, locale and URL).
- **S-02** Japanese 404 pages (`app/not-found.tsx`, `app/(site)/not-found.tsx`). The root layout no longer leaks a canonical.
- **S-03 / S-07** One `modifiedAt()` rule is used for the visible dates, JSON-LD, OG and the sitemap. The fake footer 「最終更新日」 is gone.
- **S-04** BlogPosting carries an inline publisher (name and logo) and an image fallback.
- **S-05** Sub-categories with fewer than 3 posts are noindex and left out of the sitemap. Parent categories have real descriptions (migration 2).
- **S-06** オオサカ堂 no longer shares a sentence with 医療: site description, feed and category fallbacks.
- **S-09** New 「オオサカ堂について」 page `/about`, editable in the admin, with the policies and corrections. It deliberately has **no operator or contact details**, per the owner's instruction. JSON-LD policy URLs point to `/about#policy`.
- **S-10 – S-33 (most):**
  - tag `##` bug;
  - tool SEO titles and descriptions (20 tools);
  - tool → article links (「この話題の読みもの」);
  - breadcrumbs plus BreadcrumbList on listings and tools, and the article item;
  - heading hierarchy;
  - feed `atom:self` and `lastBuildDate`, plus site-wide RSS discovery;
  - redirect of mixed-case slugs;
  - brand as the home `<h1>`;
  - a beauty-specific disclaimer (188);
  - help and PR wording;
  - terminology: 連載 → 主な記事;
  - admin label consistency and Japanese validation messages;
  - the TOC phone-number wrap;
  - same-day dates shown once;
  - the Overpass User-Agent rename;
  - the article link-text fix.

### UX and accessibility
- **UX-01** Admin editor and dashboard overflow (`line-clamp-1`, `min-w-0` grids).
- **UX-02** The editor has a sticky save bar on small screens, a sticky 公開 card on wide screens, an unsaved-changes notice and a `beforeunload` guard.
- **UX-03 / 12** The `/tools` and blog category pills sit above the header photo and have scroll padding.
- **UX-04** Feature tile text contrast: the scrim is now `via-night/70`.
- **UX-05** Reduced motion stops infinite animations, including the weather layers and the skeletons.
- **UX-06** Article tables: per-column-count min widths, a first-column min width, and a scroll-shadow hint.
- **UX-07** Headings no longer use `keep-all`, which removes the bad mid-word breaks in Safari and Firefox (option A, no new dependency).
- **UX-08** A `--line-strong` token (3:1) for form control borders in tools and the admin.
- **P2s:**
  - mobile TOC collapsed by default, with a count;
  - sticky TOC limited to the viewport height;
  - table scrollers have a role, tabindex and label;
  - phrase wrapping on tiles and link cards;
  - ARIA on the area station icon;
  - media picker as a segmented control with a labelled search;
  - editor `role="toolbar"`, 40px buttons, focus ring, strict line breaking;
  - badge contrast and `nowrap`;
  - danger button contrast in dark mode;
  - mobile admin logout;
  - note-field width;
  - 44px carousel buttons;
  - theme cards with one link each in the tab order;
  - admin bar safe area;
  - article h1 size at 375.

### Tools and features QA
The QA run made 1,149 automated checks across 81 page loads, with **no CSP violations and no console errors**. All 22 tools calculate correctly.
- **TF-01** The BMI tool keeps one tree, so typing an age through values under 18 no longer remounts the inputs and drops focus.
- **TF-02** The tool layout grid uses `minmax(0,1fr)` and `min-w-0`, so 肌予報 no longer scrolls sideways at 375px.
- **TF-03 / 14** The API byline defaults to 「オオサカ堂編集部」 (it used to show `api:<key>`). API.md is corrected.
- **TF-04 / 05** A `useLeaveGuard` hook asks before leaving through full unloads and in-app links, in both the post editor and the page editor. Toolbar formatting and the cover and source buttons now mark the post as unsaved.
- **TF-06** The stamp card counts only current item ids.
- **TF-07** An age of 0 or less is no longer treated as a child.
- **TF-08 / 09** The calorie tools have range hints. The stockpile tool says when it clamps or rounds a count.
- **TF-10 / 11 / 12** API `external_id` lookups are trimmed. A `%` in a reference no longer causes a 500. `on_image_error:"drop"` removes the image instead of leaving an empty one.
- **TF-13** `proxy.ts` redirects mixed-case blog URLs with a 308 before the route cache, and sends junk slugs straight to the 404 sentinel.

### Performance
- **PF-01 / 02** Body text uses the OS Japanese gothic: Hiragino on iOS/macOS, Noto Sans CJK on Android, Yu Gothic or Meiryo on Windows. Zen Maru loads at 700 only. This removes about 0.5–1 MB of fonts per page and about half the render-blocking CSS. Brand faces (Zen Maru, Noto Serif, Bodoni) are unchanged.
- **PF-03 / 04** The hero slide 1 uses a landscape crop (`/photos/heroWide.jpg`, −58% bytes). Other slides render, and autoplay starts, only after slide 1 has loaded. The mobile `sizes` is now accurate.
- **PF-05** Next 16 pattern for LCP images: `loading="eager" fetchPriority="high"` in place of the deprecated `priority`.
- **PF-07** `proxy.ts` rewrites unknown blog and category slugs to one sentinel, so arbitrary URLs can no longer fill the route cache.
- **PF-09 / 13 / 14 / 16** Trimmed `deviceSizes`/`imageSizes`, a 31-day image cache TTL, smaller header images under overlays, more accurate `sizes`, and `expireTime`.
- **PF-06** Documented in the README: put brotli + HTTP/2 (Caddy, nginx or Cloudflare) in front of `next start`.

## Deferred (P2, with reasons)
- **PF-08 / 10 / 11 / 12 / 15**:
  - SVG icon sprite, server-rendered icons for the weather widget, and removing `lib/photos` from the weather client bundle: modest gains (about 15–50 KB raw) for real refactors.
  - Map mounting on scroll: also a modest gain for a real refactor.
  - Wordmark as SVG: changes the brand rendering, so it needs a design decision.
- **UX-16 (partial)** Roving tabindex and text labels in the editor toolbar. The basics are done.
- **UX-18 (partial)** Posts shown as cards on phones; the table scrolls today.
- **UX-19** A preview before 「保存して公開」 on page edits. Restore is one click, which limits the risk.
- **UX-21** The audit asked for larger, higher-contrast photo credits. **Not changed:** the owner asked for the credits to be small and hard to read. They stay legally present.
- **UX-27 / 29** English subtitles per category and dark-mode tuning of the weather card: cosmetic.
- **S-19** OG image quality for photo covers: works today.

## Needs an owner or lawyer decision
1. **S-23 (薬機法):** the brand sits next to 健康・美容 in the site title, the OG image and health-article titles. No drug or product names appear anywhere, so the risk is low today, but it rises once the sister store is linked. Have the planned 薬機法 lawyer decide before launch.
2. **S-09 (E-E-A-T):** there is no operator or contact page, by the owner's choice. Search quality for YMYL pages would benefit from one later.
