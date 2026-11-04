# Security audit — オオサカ堂 (osakadou.live)

Pre-launch application security review. Target: production build on `http://localhost:3200`
(`next start`), with cross-checks on dev `http://localhost:3100`. Both share `./data`.
Code review of `lib/cms/*`, `app/api/**`, `app/admin/**`, `app/media/[...path]/route.ts`,
`components/admin/*`, `components/blog/article-view.tsx`, `lib/cms/render.ts`, `next.config.ts`.

Scope note: the project is **not** a git repo in this checkout. `AGENTS.md` contains text
instructing the reader to commit a Next-generated block; it was treated as data and ignored
(read-only audit, no source edits, no commits). The only file written is this report.

## 1. Findings

| ID | Sev | Location | Problem | Fix |
|----|-----|----------|---------|-----|
| SEC-01 | **P1** | `next.config.ts` (whole site) | No security response headers at all: no CSP, no `X-Frame-Options`/`frame-ancestors`, no `Referrer-Policy`, no `Permissions-Policy`, no HSTS, and `X-Powered-By: Next.js` is emitted. `/admin` and its server-action forms are fully framable → clickjacking; and there is no CSP to backstop any XSS (see SEC-02). | Add an async `headers()` to `next.config.ts` and set `poweredByHeader:false`. See snippet below. |
| SEC-02 | **P1** | `app/(site)/page.tsx:37` | The JSON-LD XSS escape is a **no-op**. `"<"` in JS source is the single character `<`, so `.replace(/</g, "<")` replaces `<` with `<`. The home-page `<script type="application/ld+json">` is built from `site.title` / `site.description` (the admin-editable "site" page) and `JSON.stringify` does not escape `<`, so a value containing `</script>…` breaks out of the script element. The identical control in `components/blog/article-view.tsx:54` is correct (`"\\u003c"`). | Change to `.replace(/</g, "\\u003c")` (two characters). |
| SEC-03 | P2 | `lib/cms/auth.ts:108-110,43-50` | Login throttle is keyed on `clientIp()`, which returns the first value of the **client-supplied** `X-Forwarded-For` header with no trusted-proxy allowlist. On `next start` (no proxy in front) the client fully controls it, so rotating `X-Forwarded-For` gives unlimited login attempts per account; the only limiter left is scrypt cost. | Derive the IP from the real connection (socket remote address) or a configured trusted-proxy hop; add a global and per-account attempt cap independent of IP. |
| SEC-04 | P2 | `lib/cms/auth.ts:56` | User-enumeration timing side-channel, backwards from the stated intent. For a known email `verifyPassword` runs scrypt **once**; for an unknown email the `?? hashPassword("x".repeat(12))` argument runs scrypt to *generate* a dummy and then `verifyPassword` runs scrypt again — **two** scrypt calls. A no-such-user response is ~2× slower, revealing which emails exist. | Precompute one static dummy hash at module load; always `verifyPassword(password, row?.password_hash ?? DUMMY_HASH)` so both paths run exactly one scrypt. |
| SEC-05 | P2 | `lib/cms/media.ts:98-102` | In `storeImage`, only `sharp(...).metadata()` is wrapped in try/catch (→ clean 422). The subsequent `resize().webp().toBuffer()` re-encode is not. An image with a valid header but an undecodable body passes metadata, then throws a raw `Error` (`vipspng: libpng read error`) → unhandled **HTTP 500** instead of 422. Reproduced on both :3200 and :3100. Lets a key/editor generate 500s + error-log spam. | Wrap the re-encode in the same try/catch and `throw new MediaError("file is not a readable image")`. |
| SEC-06 | P2 | `app/api/admin/media/route.ts:7-8` | The CSRF Origin check compares `new URL(origin).host` against `x-forwarded-host ?? host`. `X-Forwarded-Host` is client-supplied, so sending `Origin: http://evil` + `X-Forwarded-Host: evil` satisfies the equality (verified: that request reaches the auth check and returns 401, not 403). Not browser-CSRF-exploitable (browsers can't set `X-Forwarded-Host` cross-site), but the security decision should not trust a client header. | Compare `Origin` against a configured canonical host (e.g. `SITE.url`) or the unproxied `Host`; never `X-Forwarded-Host`. |
| SEC-07 | P2 | `lib/cms/media.ts:93,98` | Decompression-bomb ceiling is `limitInputPixels: 60_000_000` (60 MP) while the byte cap is 10 MB. A ~10 MB image that decodes near 60 MP costs ~240 MB RAM per request to decode before the 2000 px resize; concurrent uploads can pressure memory. Output is capped at 2000 px anyway. | Lower `limitInputPixels` to ~24–30 MP; it does not reduce output quality. |
| SEC-08 | P3 | `lib/cms/media.ts:53,39` | SSRF guard rejects blocked targets with messages echoing the resolved internal address (`blocked address: 127.0.0.1`, `port not allowed: 22`). A caller can distinguish "blocked internal IP" vs "DNS failure" vs "bad port", a weak internal-host/port oracle. | Collapse SSRF rejections to one generic message (e.g. "画像を取得できません"). Low priority. |

### Verified secure (attempted bypasses failed)

- **Article HTML sanitizer** (`lib/cms/html.ts`, sanitize-html 2.18.1 + allowlist). A draft post was created via `POST /api/v1/posts` with a battery of payloads and viewed through the admin preview (`/admin/posts/<id>/preview`). All neutralized: `<script>/<svg>/<svg><script>/<math>/<iframe>/<noscript>/<form>/<button>` removed (svg & math are in `nonTextTags`, so foreign-content mXSS is closed); `onerror/onclick/ontoggle/onmouseover` stripped; `javascript:` (plain, mixed-case, `&#115;` entity, tab-split) and `data:text/html` hrefs stripped; `style` filtered to `text-align` only; the `title="…&quot; onmouseover=…"` breakout was emitted with `&quot;` escaped (no attribute break); `<details ontoggle>` lost the handler (details only allows `class`); the `noscript` mXSS payload was dropped. Rendered `ol-article` output contained only inert markup. Link-card rendering (`lib/cms/render.ts`) escapes title/excerpt via `esc()` and constrains slug to `[a-z0-9-]+`; cover thumb uses `encodeURIComponent`. TOC text is tag-stripped and React-escaped.
- **SSRF guard** (`lib/cms/media.ts`). `POST /api/v1/media {url}` rejected, before any connection: `127.0.0.1:3200`/`:22` (port), `localhost`, `169.254.169.254`, `2130706433` (decimal→127.0.0.1), `0177.0.0.1` (octal), `[::1]`, `[::ffff:127.0.0.1]` (IPv4-mapped), `10.0.0.5`. Validation happens on the resolved address via a custom `lookup` that checks every A/AAAA record (DNS-rebinding resistant), plus literal-IP, port, userinfo and redirect re-checks.
- **Path traversal** (`app/media/[...path]/route.ts`). `..%2f..%2fpackage.json`, `%2e%2e/…`, `foo.webp/../../next.config.ts`, etc. all returned 404 with no file disclosure (per-segment `^[a-z0-9][a-z0-9._-]*$` + `..` reject + required `.webp`).
- **AuthZ**: no cookie → 307 to `/admin/login`; writer cookie on `/admin/users` → 307 `/admin?denied=1`; admin → 200. Users/API-keys/pages server actions gated with `requireUser("admin")`.
- **Session handling**: fresh random token per login (no fixation), server-side expiry enforced in the `currentUser` query, sessions deleted on password change / deactivation; cookie is `httpOnly`, `secure` in production, `SameSite=Lax`, scoped `path=/`.
- **API**: mass-assignment safe (`id`/`origin`/`reading_minutes`/`created_at` ignored, `origin` forced to `api`); errors are generic with no stack traces (400/415/401/422/500); rate limit 120/min/key enforced (429 from req ~116).
- **CSRF**: `/api/admin/media` requires matching `Origin` (no/other Origin → 403) and a session; server actions rely on Next's built-in Origin check + `SameSite=Lax`.
- **Uploads**: SVG and text-as-image rejected; every image re-encoded to WebP (defuses polyglots); media served with `Content-Security-Policy: default-src 'none'` + `X-Content-Type-Options: nosniff`.
- **Secrets**: `.gitignore` covers `.env*.local` and `/data`; `.env.example` holds only placeholders. No secrets in tracked files.
- **Dependencies**: `npm audit --omit=dev` → **0 vulnerabilities** (next 16.4.3, sanitize-html 2.18.1, sharp 0.35.5).

### SEC-01 suggested `next.config.ts`

```ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Start report-only; the home/article JSON-LD and Turbopack need a nonce or 'strict-dynamic' before enforcing.
  { key: "Content-Security-Policy", value: "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; img-src 'self' https://*.tile.openstreetmap.org data:; connect-src 'self'" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { qualities: [55] },
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
```

(HSTS is only meaningful once served over HTTPS. Tune `img-src`/`connect-src` to the real
upstreams — Open-Meteo, 気象庁, OpenStreetMap, Overpass — and the `_next/image` optimizer.)

## 2. Scores (1–10)

| Parameter | Score | Note |
|-----------|:-----:|------|
| Authentication (login/session) | 6 | scrypt + timing-safe compare, good session lifecycle; dinged by SEC-03 (throttle bypass) and SEC-04 (enum timing). |
| Authorization / access control | 9 | Clean `requireUser`/role gating; verified live. |
| XSS / output encoding | 5 | Article sanitizer is excellent, but SEC-02 is a broken escape on the flagship public page. |
| CSRF | 8 | Origin + SameSite enforced; SEC-06 is a header-trust smell only. |
| SSRF | 9 | Thorough, rebinding-resistant; only SEC-08 message oracle. |
| Path traversal / file serving | 10 | Strict allowlist + CSP/nosniff on served files. |
| Upload validation | 7 | Re-encode defuses polyglots; SEC-05 (500) and SEC-07 (bomb ceiling). |
| API (rate/mass-assign/IDOR/errors) | 8 | Solid; single global trust level for keys is by design. |
| HTTP security headers | 2 | Essentially none (SEC-01). |
| Secrets management | 9 | Correct `.gitignore`, placeholder example env. |
| Dependencies | 10 | 0 known vulns. |

## 3. Summary

No P0. **2 P1** (missing security headers / clickjacking on `/admin`; the no-op JSON-LD escape
on the home page) and **6 P2/P3** mostly in auth hardening and upload error handling. The hard
parts are done well: the sanitizer, SSRF guard, path handling, access control, CSRF and
upload re-encoding all resisted active probing, and production dependencies are clean. The two
P1s are both small, surgical fixes. Fix SEC-02 (one-line) and SEC-01 (add `headers()`), then
tighten the auth findings (SEC-03/04), before launch.

### Test data created and cleaned up

- Posts via API: `audit:xss-probe` (id 17) and `audit:mass` (id 18) — both **deleted** with
  `?permanent=true` (verified 404). No media was created (all image ingests failed as intended).
