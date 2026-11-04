# Free tools: builder brief (OSAKA LIVE, Next.js 16)

OSAKA LIVE is a Japanese web magazine for people who live in Osaka. It has no CTA and no store links. Free tools exist to attract and keep search and social traffic. Readers are aged 25–55 and mostly on mobile.

## Stack (already installed; do NOT run npm install or start another dev server)
- Next.js 16.4 App Router with Turbopack, React 19.3, TypeScript 5.9, Tailwind v4.
- Icons: `@phosphor-icons/react`, plus `leaflet`/`react-leaflet` for maps.
- **Dev server:** already running at **http://localhost:3100** with hot reload.
- **Typecheck:** `npx tsc --noEmit` from `D:\Projects\Osakadou.live`.
- **Headless screenshots:** use `"$LOCALAPPDATA/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe" --hide-scrollbars --virtual-time-budget=8000 --window-size=390,2400 --screenshot=out.png "http://localhost:3100/tools/<slug>"`. Use a relative output filename, then view it with the Read tool.

## Pattern to copy (read these first)
- **Pages:** `app/tools/bmi/page.tsx` shows the server page, its `metadata`, and how it wraps `<ToolShell>`.
- **Tools:** `components/tools/health/bmi.tsx` is a client tool built from the shared fields.
- **Shared fields:** `components/tools/fields.tsx` provides `NumberField`, `Choice`, `Result`, `BandScale` and `num()`. Reuse them.
- **Frame:** `components/tools/tool-shell.tsx` is the page frame, with props `tool`, `about`, `sources`, `caution` and `children`.
- **Registry:** `lib/tools/types.ts` defines `ToolMeta`. Icons are imported from `@phosphor-icons/react/dist/ssr` in registry files.
- **Photo slots:** `lib/photos.ts` (set `photo` in `ToolMeta`, or the category photo is used).
- **Weather:** `/api/weather` returns `Weather` (see `lib/weather.ts`). Helpers live in `lib/weather-indices.ts`.

## File ownership (strict; parallel builders work in the same repo)
- You may **only** create or edit files inside your own group:
  - `app/tools/<your-slug>/page.tsx`
  - `components/tools/<your-group>/…`
  - your registry file under `lib/tools/`
  - for the map: `app/api/places/route.ts`
- Do NOT edit shared files: `fields.tsx`, `tool-shell.tsx`, `components/ui.tsx`, `globals.css`, `lib/tools/index.ts`, `categories.ts`, `lib/photos.ts`, `lib/weather*.ts`, `app/layout.tsx`.
  If you need a shared change, build it locally in your group folder and mention it in your final report.

## Quality bar
- **Japanese copy:** native and natural (です・ます), friendly but not hype. No em or en dashes, and no `―`. No emoji.
- **YMYL and 薬機法/景表法:**
  - No efficacy claims for any product or ingredient, and no product or brand names.
  - Never name or link a medicine (including GLP-1).
  - Every health-adjacent tool has a `caution` line (it's a guide, not a diagnosis; see a doctor if concerned) and `sources` that link to Japanese official or academic pages you verified (厚生労働省, e-ヘルスネット, 国立健康・栄養研究所, 日本肥満学会, 農林水産省, 内閣府, 大阪市, 大阪府…).
  - Don't invent numbers. When a formula is an estimate, say so (「推定」「目安」).
- **Originality:** you may study a reference site's features, but write original copy and UI. Never copy its text.
- **UX:**
  - Results update live as you type, with sensible defaults so a result shows on first load.
  - Input validation is gentle, with a hint instead of an error wall.
  - Mobile-first at 375px; desktop at 1280px.
  - Labels sit above inputs, and tap targets are at least 44px.
  - Results are announced via the `Result` component's `aria-live`.
- **Design:** use the existing tokens (`bg-band`, `text-shu`, `card-hard`, `font-maru` for headings, `rounded-[var(--radius-card)]`; pill buttons and tabs are `rounded-full`). One 朱 accent only, and no new colours.
- **Performance:** client components only where needed. Import heavy libraries (Leaflet) through `next/dynamic` with `ssr:false` inside your tool component.
- **SEO:** every page exports `metadata` with `title`, `description`, `keywords` and `alternates.canonical = /tools/<slug>`. `about` should be 2–5 short paragraphs or a short list that explains the method; it is useful for search.

## Done means
- `npx tsc --noEmit` passes, and every one of your pages returns 200 on the dev server with no console errors.
- You checked at least the main tools in a 390px and a 1280px screenshot.
- Your final report lists the slugs, sources used, any shared-file change you need, and anything you could not verify.
