# オオサカ堂 (osakadou.live)

**オオサカ堂** (OSAKADOU) is a Japanese city web magazine for people who live in Osaka. It has a built-in CMS, an admin panel and a blog API.

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, TypeScript, SQLite through Node's built-in `node:sqlite`, and TipTap for the editor.

## Run
```bash
npm install
cp .env.example .env.local   # set ADMIN_EMAIL / ADMIN_PASSWORD (12+ chars) for the first admin
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
npm run typecheck
```
In the Claude desktop app, the preview config is `.claude/launch.json` → `osakalive-next` (port 3100).

On first start the app:
- creates `DATA_DIR` (default `./data`) with `osakadou.db` and `uploads/`;
- seeds the categories;
- creates the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, only while there are no users;
- imports the articles in `content/posts/*.html`, each file once.

## Structure
- **Public site (`app/(site)/`)**
  - `page.tsx`: the magazine landing page. Its sections are in `components/home/*`, and their text and images come from the CMS (`lib/cms/pages.ts`). It revalidates every 10 minutes and whenever an editor saves.
  - `tools/<slug>`: the 22 free tools. They register in `lib/tools/*.ts`. Self-checks: `node components/tools/health/data.check.mts` and `node components/tools/culture/*.check.mjs`.
  - `blog/`: `/blog`, `/blog/<slug>`, `/blog/category/<cat>[/<sub>]` and `/blog/feed.xml`. Pages use ISR (5 minutes) and are purged whenever the CMS writes.
- **CMS (`lib/cms/`)**
  - `db.ts`: migrations and seeds.
  - `auth.ts`: scrypt passwords, hashed session cookie, `requireUser(permission)`, forced password change, session revocation.
  - `perms.ts`: the six roles (admin, editor, SEO specialist, author, contributor, viewer), their permissions and per-user overrides. `audit.ts`: the sign-in and user-change log.
  - `html.ts`: the article-HTML sanitizer and image ingest. It enforces `docs/cms/HTML-STYLE-GUIDE.md`.
  - `media.ts`: SSRF-guarded downloads, then sharp → WebP, served by `app/media/[...path]`.
  - `posts.ts` / `categories.ts`: content with revisions.
  - `pages.ts`: editable page content with version history. `RULES` says which lists editors may grow, shrink or reorder (carousel slides, areas, paragraphs…), plus number bounds and choice fields; drafts for the builder canvas live in `page_drafts`.
  - `seo.ts` / `seo-paths.ts`: SEO settings (versioned), per-page overrides, redirects, robots.txt. `seoMeta()` builds every page's metadata.
  - `api.ts`: API helpers.
- **Admin (`app/admin/`)**: JA/EN switch, login, posts (TipTap editor, revisions, preview, SEO panel, ownership and review requests), categories, media, the visual page builder (add/remove/reorder list items, carousel settings, versions and restore), the SEO center (`/admin/seo`), users (roles, custom permissions, activity log), API keys, account, and a live style guide.
- **Builder canvas (`app/(site)/cms-preview/[page]`)**: renders the home and about pages from the editor’s unsaved draft for signed-in page editors (noindex, never linked publicly).
- **SEO routes**: `app/robots.txt/route.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts`; redirects and lowercase URLs in `proxy.ts`.
- **API (`app/api/v1/`)**: the blog API for automations. See **[docs/cms/API.md](docs/cms/API.md)**.
- **`app/api/weather`**: Open-Meteo plus JMA (大阪管区気象台), cached for 10 minutes.
- **`app/api/places`**: OSM Overpass lookups for the facility map, with a 1-day cache.
- **`content/posts/`**: the 15 launch articles, used as seeds. Compliance review: `docs/compliance-articles.md`.
- **`lib/photos.ts`**: the Unsplash-License photos, self-hosted in `public/photos/`. Credits are in the footer.
- **`legacy/`**: the previous static build, kept for reference.

## Deploy
- **Needs a persistent disk.** Run `next start` on a VPS or a container with a volume mounted at `DATA_DIR`. The database and uploaded images live there, so serverless or ephemeral hosts (for example Vercel functions) will lose them.
- **One instance.** The login throttle and the API rate limit are kept in memory. If you scale out, move them to a shared store.
- **Environment:** `DATA_DIR`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optionally `ADMIN_NAME` (see `.env.example`). Put HTTPS in front: session cookies are `Secure` in production.
- **Reverse proxy (recommended):** put a TLS terminator with **brotli and HTTP/2** in front of `next start`. Examples: Caddy (`encode zstd br gzip`), nginx (`brotli on; http2 on;`) or Cloudflare. This cuts the blocking CSS and HTML transfer by about half; see `docs/audit/performance.md` PF-06.
  - Set `TRUST_PROXY=1` **only** when that proxy overwrites `X-Real-IP` / `X-Forwarded-For` / `X-Forwarded-Host`. Otherwise those headers are client-controlled. The app then uses them for the per-IP login throttle and the upload Origin check.
- **Backups:** back up `DATA_DIR` (`osakadou.db` together with `uploads/`) every night, for example with `sqlite3 data/osakadou.db ".backup backup.db"` plus an rsync of `uploads/`.
- **After the first login,** change the admin password in 管理画面 → アカウント.

## Before launch
- **Facility map:** OSM tiles and the public Overpass API are fine for low traffic. As traffic grows, switch to a commercial or self-hosted tile source, and pre-warm or self-host Overpass.
- **Dates:** re-check the calendar and countdown dates every year (`lib/cms/pages.ts` defaults, or edit them in the admin; `components/tools/culture/matsuri.ts`).
- **`tel:#7119` / `tel:#8000`:** test them on a real iPhone, in Safari and in LINE.
- **Content:** any future store link must follow the rules in the project memory: PR label, `rel="sponsored"`, never on product pages, reviewed by a lawyer.
