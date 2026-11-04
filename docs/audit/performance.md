# Performance audit — オオサカ堂 (osakadou.live)

Production build on `http://localhost:3200` (`next start`, build `wS-EbCEP1ea8IlSJagy8A`, built 2026-11-04 10:49).
Pages: `/`, `/blog`, `/blog/osaka-sento`, `/blog/category/health`, `/tools`, `/tools/bmi`, `/tools/osaka-map`.

**Method**
- Headers and TTFB: curl and node `fetch`. HTML split into markup and inline RSC (`self.__next_f.push`) with a parser script.
- Every `/_next/static/chunks/*` file a page references, read from `.next/static`, sized raw, gzip and brotli, and grepped for module markers.
- Lab runs: headless Chromium over CDP. Each run uses a fresh browser context with the cache off, observers injected before load (`largest-contentful-paint`, `layout-shift`, `longtask`, all `buffered`), then `performance.getEntriesByType` plus a `Network.*` log, read 3–6 s after `load`.
  - **Mobile:** 375×812, DPR 3, 4× CPU (`Emulation.setCPUThrottlingRate`), 1.6 Mbps down / 150 ms RTT.
  - **Desktop:** 1440×900, DPR 1, no throttling.
- A/B experiments: `Network.setBlockedURLs`, plus `Fetch` interception that rewrites the HTML in flight.
- Image re-encode estimates: the project's own `sharp`, output written to the scratchpad only.

**Caveats**
- localhost has no network RTT, and `next start` speaks HTTP/1.1 (6 connections per host).
- DevTools throttling shares bandwidth evenly between requests and ignores priority.
- So treat the mobile numbers as relative (before/after), not as field data.
- Some source files were edited by others after the build (SEO work on `listing.tsx`, `article-view.tsx`, `tool-shell.tsx`, `layout.tsx`). Line numbers below are from the current source; the performance-relevant code (fonts, images, carousel, map) is unchanged.

## 1. Findings

Ranked by impact. No P0. **7 × P1**, 11 × P2.

| ID | Sev | Location | Problem (measured) | Concrete fix |
|----|-----|----------|--------------------|--------------|
| PF-01 | **P1** | `app/layout.tsx:8-9`, `components/home/areas.tsx:23`, `components/home/weather-live.tsx:196` | **About 92% of the render-blocking CSS is `@font-face` declarations.** Every page blocks on 4 stylesheets: 542 KB raw / **178.6 KB gzip**. Only 14.3 KB gzip of that is the app's own CSS; the rest is 628 `@font-face` rules with long `unicode-range` lists (`2h2qp4t0lj2mf.css` Noto Sans JP 66 KB gzip, `28bcsim8-lp91.css` Zen Maru 63 KB, `1vljift5090zj.css` Noto Serif + Bodoni 34 KB). Two parts are pure waste: (a) the Noto Sans JP 400 and 700 rule sets point to **the same 124 variable woff2 files** (verified: 124/124 URLs shared), so one full set of 124 rules does nothing; (b) Zen Maru **500** adds 122 rules and 18 files (232 KB) on `/`, but only 110 characters use it: three `font-normal` spans inside `font-maru` headings. Every other page loads no 500. Lab effect: with the font CSS blocked, mobile FCP fell from 3.1 → 1.7 s (article), 2.7 → 1.5 s (bmi) and 3.6–4.0 → 2.0 s (home). | Change nothing visible. In `app/layout.tsx`, request Noto Sans JP as variable (omit `weight`) and Zen Maru at 700 only: <br>`const notoSans = Noto_Sans_JP({ preload: false, display: "swap", variable: "--font-noto-sans" });`<br>`const zenMaru = Zen_Maru_Gothic({ weight: "700", preload: false, display: "swap", variable: "--font-zen-maru" });`<br>Keep the three small notes non-bold by moving them to the body face. Add `font-sans` to `areas.tsx:23` (`className="mt-1 block font-sans text-xs font-normal …"`) and to `weather-live.tsx:196` (`` `font-sans text-xs font-normal ${sub}` ``). Simulated on the built CSS, render-blocking CSS drops **178.6 → 114.1 KB gzip (−36%)**, and 232 KB of font files go from `/`. |
| PF-02 | **P1** (needs design sign-off) | `app/layout.tsx:8`, `app/globals.css:53-54` | **Japanese web fonts are 44–70% of the bytes on every page.** Font downloads per page (mobile lab): `/` 121 files / **2,011 KB**, `/blog` 1,364 KB, article 1,329 KB, `/tools` 1,275 KB, bmi 988 KB, osaka-map 1,016 KB, category 783 KB. The body face alone (Noto Sans JP) is 515–953 KB per page, because body text touches 24–45 unicode-range slices of about 21 KB each. Measured: blocking only the Noto Sans files cut article font bytes from 1,329 to 451 KB and `load` from 9.5 to 5.0 s; bmi `load` went from 7.8 to 4.2 s. | Use the OS Japanese gothic for body text, and keep the brand faces (Zen Maru for headings, Noto Serif/Bodoni for the wordmark). Android's system CJK font *is* Noto Sans CJK JP, and iOS/macOS have Hiragino Sans, so phones look the same. Only Windows desktop changes, to Yu Gothic/Meiryo. Remove `notoSans` from `layout.tsx` and its class from `<html>`. Then set `--font-sans: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", "Yu Gothic Medium", Meiryo, sans-serif;` and `--font-maru: var(--font-zen-maru), var(--font-sans);`. **You must remove `var(--font-noto-sans)` from `--font-maru` too**: an undefined custom property invalidates the whole `font-family` declaration, and Zen Maru would silently stop rendering (observed in the A/B run). Saves 515–953 KB per page plus another 33 KB gzip of blocking CSS (114 → 81 KB gzip on top of PF-01). |
| PF-03 | **P1** | `public/photos/hero.jpg` (2400×4299 portrait), `components/home/hero-carousel.tsx:43,56` | **The home LCP image is 542 KB.** The hero source is portrait (aspect 0.56) but is shown in a 16:10 box on desktop and a 3:4 box on mobile. `w=1080` therefore delivers 1080×1934 px, of which **65% is cropped away** on desktop (displayed 972×607). Mobile lab LCP was **12.9 s** (13.2 s on a rerun), FCP 3.6 s. Desktop LCP was 572 ms. AVIF would save only 14% (467 KB). | Crop the asset to the shape it is shown at. One-off: `node -e "require('sharp')('public/photos/hero.jpg').resize(2400,1800,{fit:'cover',position:'bottom'}).jpeg({quality:82,mozjpeg:true}).toFile('public/photos/heroWide.jpg')"`, add `heroWide: { …photos.hero, w: 2400, h: 1800 }` to `lib/photos.ts`, and point slide 1 at `/photos/heroWide.jpg` (CMS home page, or `HERO_SLIDES` default). Measured on the real file: **4:3 crop 1080w = 225 KB (−58%)**, 16:10 crop = 178 KB (−67%). Also tell the truth about mobile width: `sizes="(min-width:1280px) 1050px, (min-width:768px) 80vw, calc(100vw - 100px)"` (displayed 261 px, the `80vw` claim makes DPR-3 phones pick 1080w instead of 828w). Do the same check for the other portrait sources shown in landscape boxes: `castleAutumn` 2400×3624 (features tile, 268 KB at 1200w) and `tenmaArcade` 2400×3200. |
| PF-04 | **P1** | `components/home/hero-carousel.tsx:44-59,24-28` | **The four hidden slides download at page load and compete with the LCP image.** The slides are stacked `absolute inset-0` with `opacity-0`, so they count as *in viewport*, and `loading="lazy"` does nothing. Measured extra transfer at load: **437 KB on mobile, 439 KB on desktop** (tenmaArcade 187 + roseBridge 88 + tenjinNight 56 + market 108), plus 70 KB of DPR-3 thumbnails. Autoplay also starts at hydration even if slide 1 has not loaded. In the throttled A/B runs the carousel advanced first, slide 1 painted while invisible, and LCP moved to a later image (tenmaArcade at 9.5–10.4 s, castleAutumn at 17.9 s). | Render the other slides only after slide 1 has loaded, and gate autoplay on it: <br>`const [ready, setReady] = useState(false);`<br>autoplay effect: `if (!playing \|\| hold \|\| !ready) return;` (add `ready` to the deps)<br>`const go = (n: number) => { setReady(true); setI((n + slides.length) % slides.length); };`<br>`{slides.map((s, n) => (n === 0 \|\| ready) && (<figure …><Image … loading={n === 0 ? "eager" : "lazy"} fetchPriority={n === 0 ? "high" : undefined} onLoad={n === 0 ? () => setReady(true) : undefined} … /></figure>))}`<br>next/image calls `onLoad` for an image that already finished before hydration (`img.complete` check in `image-component.js`), so this is hydration-safe. In the A/B run, image bytes at load fell from 2,114 to 1,603 KB. |
| PF-05 | **P1** | `hero-carousel.tsx:54`, `components/blog/article-view.tsx:92`, `components/tools/tool-shell.tsx:46`, `app/(site)/tools/page.tsx:19`, `components/blog/listing.tsx:64` | **Every LCP image is requested at `Low` priority.** These use `priority`, which Next 16 deprecates (docs: `image.md` §priority). It now only adds a preload `<link>` and sets no `fetchpriority`. CDP shows the LCP image of all 7 pages at initialPriority `Low`, queued behind 41–121 font requests at `High`/`VeryHigh`. `/blog` also preloads **two** cards (`priority={i < 2}`). On mobile the second card is below the fold, yet its 213 KB still competes. | Replace `priority` with the Next 16 pattern `loading="eager" fetchPriority="high"` on the hero slide 1, the article cover (`article-view.tsx:92`), the tool header `Photo` (pass it through `components/ui.tsx:37-47` and `Pic`), and the `/tools` header. In `listing.tsx:64` mark only the first card: `fetchPriority={i === 0 ? "high" : undefined}` and `loading={i === 0 ? "eager" : undefined}` (change the `PostCard` prop accordingly). Note: under DevTools throttling, priority alone did not move LCP, because that throttling ignores priority. Real HTTP/2 does respect it, so ship it together with PF-03/04/06. |
| PF-06 | **P1** (deploy) | `README.md:44-45` (VPS + `next start`) | **Production serves gzip only over HTTP/1.1.** `Accept-Encoding: br` returns no `Content-Encoding`. Brotli would shrink the 4 render-blocking CSS files from **177.9 KB gzip to 75.0 KB brotli** (the duplicated unicode-range lists compress about 3× better with brotli's large window), the home HTML from 63 to 33 KB, and home JS from 171 to 146 KB. Over HTTP/1.1 only 6 connections per origin are available, while pages fire 41–121 font requests plus images, so they queue. | Put the TLS terminator in front of `next start` with brotli and HTTP/2 or 3: Caddy (`encode zstd br gzip`, h2/h3 by default), nginx (`brotli on; brotli_types text/css application/javascript text/html; http2 on;`), or Cloudflare. Leave Next's `compress` on as the gzip fallback. A no-code fix that pays off on every page. |
| PF-07 | **P1** | `app/(site)/blog/[slug]/page.tsx:9-10,43`, `blog/category/[cat]/page.tsx:8-9,21`, `[sub]/page.tsx` | **Every unknown slug is cached to disk forever, an unbounded ISR cache.** `generateStaticParams` returns `[]` with `dynamicParams` on by default, so any `/blog/<anything>` or `/blog/category/<anything>` renders a 404 and **writes a cache entry** of about 51 KB (`.html` + `.rsc` + `.meta` + `.segments`) under `.next/server/route-cache/…`. Verified: first request `x-nextjs-cache: MISS`, second `HIT` (404), files created. The cache already holds 404 entries for probe slugs from today's audit traffic alone (`no-such-post`, `nope`, `..%2Fadmin`, `audit-test-post`, …). Scanners and typo crawls will keep filling the disk. | Filter in a Node-runtime proxy (Next 16 `proxy.ts`, Node.js by default per `proxy.md` §Runtime). Unknown slugs get rewritten to **one** fixed sentinel, so the styled `(site)/not-found.tsx` still renders with status 404 but only one cache entry ever exists: <br>`// proxy.ts`<br>`import { NextResponse, type NextRequest } from "next/server";`<br>`import { publicPost } from "@/lib/cms/posts";`<br>`import { categoryByPath } from "@/lib/cms/categories";`<br>`export function proxy(req: NextRequest) {`<br>`  const [, , a, b, c] = req.nextUrl.pathname.split("/");`<br>`  if (!a \|\| a === "feed.xml" \|\| a !== a.toLowerCase()) return; // page handles the case redirect`<br>`  const ok = a === "category" ? !!(b && categoryByPath(b, c ?? null)) : !!publicPost(a);`<br>`  if (!ok) return NextResponse.rewrite(new URL("/blog/__none__", req.url));`<br>`}`<br>`export const config = { matcher: ["/blog/:slug", "/blog/category/:path*"] };`<br>Side benefit: scheduled posts appear the moment they go live, with no cached 404 from earlier. |
| PF-08 | P2 | `app/(site)/page.tsx`, `components/home/*` | **Why the home HTML is 380 KB (371 KB raw, 63.2 KB gzip, 33.2 KB brotli).** Visible markup is 208 KB, of which `class` attributes are 64 KB, **95 inline SVG icons 54 KB** and 45 `<img>` tags 53.5 KB (srcset alone 37 KB). The inline RSC payload is **157 KB** (146 KB decoded: classNames 44 KB, SVG path data 14.7 KB, Japanese text 21 KB). Nearly the whole page is a Server Component tree, so it ships twice: once as HTML, once as Flight data. Hidden tab panels (3 seasons + 4 tool categories) are 38 KB of markup and 231 of the 1,428 DOM nodes, which is above Lighthouse's 1,400-node threshold. The calendar section alone is 65 KB / 480 nodes. Cost: mobile 4× CPU TBT of 112–255 ms on `/` versus 30–50 ms elsewhere. | In order of payoff: (1) **SVG sprite** for the repeated phosphor icons, which are inlined twice (HTML plus RSC path data): header nav (6 duotone icons on every page), tool cards (22 on `/tools` and 6 per panel), help lines. Render one `<svg hidden><symbol id="i-toolbox" …>` per icon in the layout, or a static `/icons.svg`, and use `<svg><use href="#i-toolbox"/></svg>`. That removes about 50 KB raw from `/`, 21 KB from `/tools` and 14.7 KB of RSC. (2) PF-09 srcset trim (−15.5 KB). (3) Optional: in the hidden calendar season panels, render only text and load the panel photo when its tab activates. Keep the text server-rendered for SEO. |
| PF-09 | P2 | `next.config.ts:6` | **Every px-only `sizes` image lists all 15 srcset widths, 32 to 3840.** next/image's `getWidths()` returns every width when `sizes` has no `vw` (`sizes="80px"`, `"340px"`, `"400px"` …). That makes 1.2 KB per thumbnail. The sources are 2400 px wide at q55, so 2048 and 3840 are never useful. | `images: { qualities: [55], deviceSizes: [640, 828, 1080, 1200, 1920], imageSizes: [96, 256, 384], minimumCacheTTL: 2678400 }`. This keeps every width the code builds by hand (`lib/cms/render.ts:3` WIDTHS, `thumb()` 256/384/1200, admin 256/384/640). Measured on `/`: −15.5 KB raw HTML. `minimumCacheTTL` 31 days instead of the default 4 h (`Cache-Control: max-age=14400` today) is safe because `/media` names are content hashes and `/photos` are fixed assets. |
| PF-10 | P2 | `components/home/weather-live.tsx:6-9`, `hero-carousel.tsx:5` | **Phosphor client icons ship all 6 weights.** Home chunk `0j7_wfuzadr38.js` is 70 KB raw / **20.7 KB gzip**; **46 KB of it is icon weight maps** (18 icons × thin/light/regular/bold/fill/duotone), although each icon uses one weight. `optimizePackageImports` cannot strip unused weights. | Render the icons on the server and pass them to the client component as props. `WeatherCalendar` (server) builds `const icons = { sun: <Sun size="100%" weight="duotone" />, moon: …, cloud: …, … }` from `@phosphor-icons/react/dist/ssr`, and `<WeatherLive initial={weather} icons={icons} />` then picks `icons[key]` in place of `iconFor()`. Size each icon with a wrapper (`<span className="size-6">`). Do the same for Play/Pause/Caret in `HeroCarousel` (passed from `hero.tsx`). Saves about 15 KB gzip of JS on `/`. |
| PF-11 | P2 | `hero-carousel.tsx:6`, `weather-live.tsx:11` → `lib/photos.ts` | **Server data leaks into the home client chunk.** Importing `srcPos` and `photoSrc` bundles the whole `photos` table (38 entries with alt text, captions and Unsplash credits, 4.4 KB raw, about 3 KB gzip) into `3ua4fy9hycb_x.js`. | Compute object positions on the server. In `hero.tsx`, map `c.slides` to `{ …s, pos: srcPos(s.image.src)?.objectPosition }` and use `style={{ objectPosition: s.pos }}` in the carousel. In `weather-live.tsx`, replace `photoSrc(...)` with the literal ``(`/photos/${slot}.jpg`)`` and type `slot` as a string union. Drop the `@/lib/photos` imports from both client files. |
| PF-12 | P2 | `components/tools/life/osaka-map.tsx:9-12,137` | **The map loads eagerly although it is below the fold.** Leaflet (chunk `32j9jhpjn6aka.js` **44.3 KB gzip** plus 3 KB CSS) and **6 OSM tiles (~245 KB, third-party `tile.openstreetmap.org`)** start at hydration, about 250–310 ms after load, while the map sits at y = 1229 px on a 812 px mobile viewport. It also adds traffic to the volunteer OSM tile servers. | Mount the map when it nears the viewport: <br>`const box = useRef<HTMLDivElement>(null); const [show, setShow] = useState(false);`<br>`useEffect(() => { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: "300px" }); if (box.current) io.observe(box.current); return () => io.disconnect(); }, []);`<br>`<div ref={box} className="h-[320px] md:h-[440px]">{show && <LeafletMap … />}</div>` (same height as the current skeleton, so CLS stays 0). |
| PF-13 | P2 | `components/tools/tool-shell.tsx:46`, `app/(site)/tools/page.tsx:19` | **The tool header photo is the LCP element and is served at 1920w on desktop** (bmi 238 KB, `/tools` 187 KB, osaka-map 113 KB), yet it is shown at `opacity-55`/`opacity-50` under a 75–95% dark gradient. `ar="3:1"` is ignored when `fill` is set (dead prop). | `sizes="(min-width: 768px) 50vw, 100vw"` serves 750/828w (about 50–60 KB) on desktop, a softness the overlay hides. Remove `ar="3:1"`. Check visually once. |
| PF-14 | P2 | `components/blog/post-card.tsx:15`, `components/home/features.tsx:20` | **`sizes` over-declared.** The big post card says `600px` but displays at 406 px on desktop, so it picks 640w (1.48×). The big features tile says `50vw` (720 px) but displays at 552 px, so it picks 750w (1.36×). | Big card: `"(min-width: 768px) 420px, 100vw"`. Features tile 0: `"(min-width:1280px) 560px, (min-width:1024px) 45vw, 100vw"`. |
| PF-15 | P2 | `app/layout.tsx:10`, `components/site-header.tsx:14`, `components/site-footer.tsx:14` | **Noto Serif JP loads on every page just for the fixed wordmark 「オオサカ堂」.** On non-home pages its 101 KB raw / 34 KB gzip of blocking CSS and 2 font slices (70 KB) exist only for the header and footer logo text. | Make the wordmark an inline SVG (`<svg role="img" aria-label="オオサカ堂">`, about 3 KB, outlined from Noto Serif JP 700). Move `Noto_Serif_JP(...)` into a small `lib/fonts/mincho.ts` imported only by the components that set mincho text (`components/home/*`, `app/(site)/about/page.tsx`). next/font emits the CSS only on routes that import it. Simulated: blocking CSS on non-home pages falls to about 48 KB gzip (Bodoni rules kept) once PF-01 and PF-02 are also applied. |
| PF-16 | P2 | `next.config.ts`; ISR responses | **`Cache-Control: s-maxage=300, stale-while-revalidate=31535700`** (the default `expireTime` of 1 year). `/tools*` uses `s-maxage=31536000`. This is fine with no CDN. Behind a CDN, though, `revalidatePath("/", "layout")` (`lib/cms/api.ts:69`) purges only Next's cache, and edge copies could stay stale for up to a year. `X-Powered-By: Next.js` costs bytes on every response. | Add `expireTime: 86400` and `poweredByHeader: false` to `next.config.ts`. If a CDN is added, either bypass it for HTML or purge it from `revalidateSite()`. |
| PF-17 | P2 | Link prefetch (all pages) | Viewport `<Link>` prefetch fetches RSC and route JS after load. `/tools` makes 25 requests (115 KB, desktop), the category page 15–22, and every page also pulls the home chunks (31 KB gzip) through the logo link. | Acceptable, because it runs at idle. Only if mobile data use is a concern, set `prefetch={false}` on the 22-card tool grid in `app/(site)/tools/page.tsx:47`. |
| PF-18 | P2 | `next.config.ts` images | AVIF is not enabled. | **Do not enable it.** Measured at q55 on the real photos, AVIF is only 2–14% smaller than WebP (hero 542 → 467 KB, sento 144 → 142 KB). That does not pay for a second cached copy per format and slower first encodes. WebP at q55 is the right setting. |

### Verified OK (no action)
- **TTFB / cache:** every audited page is served from the full-route cache (`x-nextjs-cache: HIT`, `x-nextjs-prerender: 1`). TTFB is 2–4 ms (curl) and 3–12 ms (CDP). The home is 35 ms on a cold node fetch of the uncompressed 380 KB. Cache times: `/` s-maxage 600, blog pages 300, `/tools*` static. CMS writes purge everything (`revalidatePath("/", "layout")`). `/blog/osaka-sento` and `/blog/category/health` are cached (HIT). The revalidate values make sense: home 600 s matches the weather cache and `WeatherLive` re-fetches `/api/weather` when stale; 300 s on blog pages covers scheduled posts. Static assets are `max-age=31536000, immutable`; `/media/*` is immutable with content-hash names.
- **No render-blocking JS:** all chunks are `async`. The 110 KB `noModule` polyfill chunk (`0cz1d0mv5g_q7.js`) is skipped by modern browsers and excluded below.
- **Heavy libraries are split correctly:** TipTap/ProseMirror (`3av_rcuc0wu4g.js`, 484 KB / 150 KB gzip) is referenced by no public page. Leaflet loads only through `next/dynamic({ ssr:false })` on osaka-map. `motion` is installed but never imported. No `sanitize-html`, `node:sqlite` or `scrypt` code appears in public chunks.
- **Third parties:** Open-Meteo, JMA and Overpass are called only on the server (cached 600 s / 600 s / 1 day). The browser talks only to same-origin `/api/weather` and `/api/places`. Google Fonts are self-hosted by next/font, with zero requests to `fonts.googleapis.com`/`gstatic`. The only third-party host seen is `tile.openstreetmap.org` (osaka-map).
- **Fonts config:** `display: "swap"` everywhere; the Japanese faces use `preload: false`, which is correct, since preloading CJK slices would waste bytes. The only preload is Bodoni latin (25 KB, used above the fold). Metric-adjusted fallbacks are present, and **CLS = 0.000 on all 14 runs**.
- **Image format/quality:** all images are WebP via `Accept` (`Vary: Accept`) at q55 (`images.qualities: [55]`), and are lazy below the fold. Images inside hidden tab panels (`display:none`) are not fetched. Article body images get a srcset in `lib/cms/render.ts`.

## 2. Measurements

### 2.1 HTML (production, cached)

| Page | Raw | gzip | br | Visible markup | Inline RSC (gzip) | `<img>` | Inline SVG |
|---|---|---|---|---|---|---|---|
| `/` | **371.2 KB** | 63.2 | 33.2 | 207.9 KB | **156.6 KB** (29.2) | 45 | 95 / 53.9 KB |
| `/blog` | 105.2 KB | 21.3 | 12.4 | 46.6 KB | 52.7 KB (11.2) | 15 | 9 / 5.5 KB |
| `/blog/osaka-sento` | 120.1 KB | 29.3 | 17.3 | 46.2 KB | 66.9 KB (15.9) | 5 | 16 / 8.0 KB |
| `/blog/category/health` | 61.2 KB | 12.4 | 9.2 | 22.1 KB | 33.3 KB (7.9) | 3 | 9 / 5.5 KB |
| `/tools` | 115.8 KB | 26.1 | 14.6 | 45.7 KB | 65.0 KB (14.2) | 1 | 31 / 21.1 KB |
| `/tools/bmi` | 80.5 KB | 20.0 | 12.5 | 34.5 KB | 40.9 KB (10.3) | 1 | 19 / 11.5 KB |
| `/tools/osaka-map` | 69.1 KB | 16.5 | 10.9 | 29.2 KB | 34.6 KB (9.0) | 1 | 14 / 7.6 KB |

### 2.2 JavaScript per route (excluding the `noModule` polyfill)

| Route | Files | Raw | gzip | Route-specific part |
|---|---|---|---|---|
| shared by all | 8 | 466 KB | 139.8 KB | React/ReactDOM + Next router + Turbopack runtime 132.7 KB gzip; layout client (`MenuSheet`, `ShareButton`, `AdminBar` + phosphor base) 7.1 KB |
| `/` | 10 | 560 KB | **170.7 KB** | `3ua4fy9hycb_x.js` 10.2 KB (next/image + carousel + photos table) and `0j7_wfuzadr38.js` 20.7 KB (WeatherLive + 18 phosphor icons) |
| `/blog`, article, category, `/tools` | 9 | 480 KB | 145.4 KB | next/image client 5.5 KB |
| `/tools/bmi` | 10 | 499 KB | 153.2 KB | tool 12.1 + 1.2 KB |
| `/tools/osaka-map` | 10 | 504 KB | 153.7 KB | tool 13.6 KB, plus lazy **leaflet 44.3 KB gzip + 3.0 KB CSS** |

### 2.3 CSS (identical on every page, all render-blocking)

| File | Content | Raw | gzip | br |
|---|---|---|---|---|
| `2h2qp4t0lj2mf.css` | Noto Sans JP 400+700, 248 rules (124 duplicated) | 185 KB | 66.1 | 20.4 |
| `28bcsim8-lp91.css` | Zen Maru 500+700, 244 rules | 178 KB | 63.3 | 21.9 |
| `1vljift5090zj.css` | Noto Serif JP 700 + Bodoni, 133 rules | 99 KB | 34.2 | 21.0 |
| `2lsx-d0zd4348.css` | Tailwind + globals + article | 80 KB | 14.3 | 11.7 |
| **total** | | **542 KB** | **177.9** | **75.0** |

After PF-01: 114.1 KB gzip. After PF-01 + PF-02: 80.9 KB gzip. After PF-01 + PF-02 + PF-15: about 48 KB gzip.

### 2.4 Lab runs (CDP, `PerformanceObserver` + `getEntriesByType`)

| Page | Desktop FCP / LCP | Mobile FCP / LCP | Mobile TBT | LCP element | Mobile page weight (fonts / images) |
|---|---|---|---|---|---|
| `/` | 364 / 572 ms | 3,620 / **12,856 ms** | 112 ms | hero slide 1 `hero.jpg` w=1080 (542 KB, `Low`) | **4,574 KB** (2,011 / 2,114) |
| `/blog` | 208 / 272 | 2,808 / 3,200 | 31 | first card `roseBridge` (m 1200w 106 KB, d 640w 34 KB) | 2,836 (1,364 / 1,036) |
| `/blog/osaka-sento` | 268 / 364 | 3,124 / 4,036 | 44 | cover `sento` (m 1200w 144 KB, d 1080w 122 KB) | 1,912 (1,329 / 144) |
| `/blog/category/health` | 160 / 160 | 2,612 / 2,744 | 44 | first card `skyline` | 1,526 (783 / 305) |
| `/tools` | 188 / 264 | 2,708 / 2,764 | 47 | header bg `skyline` (d 1920w 187 KB) | 1,830 (1,275 / 90) |
| `/tools/bmi` | 184 / 184 | 2,780 / 3,084 | 39 | header bg `roseBridge` (d 1920w 238 KB) | 1,532 (988 / 107) |
| `/tools/osaka-map` | 188 / 232 | 2,748 / 2,748 | 50 | header bg `alleyCat` (d 1920w 113 KB) | 1,801 (1,016 / 299) |

CLS was 0.000–0.001 everywhere. Desktop TBT was 0 ms. A rerun of `/` on mobile gave FCP 3,988 ms / LCP 13,160 ms.

**A/B experiments (mobile):**

| Variant | Page | FCP | LCP | Fonts | `load` |
|---|---|---|---|---|---|
| baseline | article | 3,124 | 4,036 | 1,329 KB | 9.5 s |
| no font CSS at all | article | **1,736** | **2,056** | 26 KB | 2.0 s |
| Noto Sans files blocked | article | 3,036 | 3,728 | 451 KB | 5.0 s |
| baseline | bmi | 2,780 | 3,084 | 988 KB | 7.8 s |
| no font CSS at all | bmi | **1,496** | **1,928** | 26 KB | 1.9 s |
| baseline | `/` | 3,620 | 12,856 | 2,011 KB | 23.1 s |
| no font CSS at all | `/` | 2,040 | 9,548* | 25 KB | 12.1 s |

\* LCP moved to slide 2 once the carousel auto-advanced (see PF-04).

### 2.5 Images: served vs displayed (mobile DPR 3)
- Hero: displayed 261×348 px, `sizes` claims 300 px, so 1080w of a portrait 1080×1934 is served.
- Features: 343 px wide, served 1200w.
- Areas, themes: about right.
- Thumbnails: displayed 64 px, `sizes="80px"`, served 256w.
- Weather backdrop: lazy, served 1200w.
- On desktop, sizes are within 1.0–1.1× of displayed except PF-13/14.
- No image lacks dimensions; all are `fill` inside sized boxes, hence CLS 0.

## 3. Scores (1–10)

| Parameter | Score | Why |
|---|---|---|
| Server response, TTFB, HTTP caching | 8 | Full-route cache HIT, TTFB under 15 ms, immutable statics. Minus: no brotli/HTTP2 (PF-06), 1-year SWR (PF-16). |
| ISR / revalidation | 6 | Sensible values, purge on write, verified HITs. Unbounded 404 cache (PF-07). |
| HTML / RSC weight | 6 | Pages other than home are 61–120 KB raw, which is fine. The home is 371 KB raw / 1,428 nodes because of double-shipped server trees, inline SVG and hidden panels (PF-08/09). |
| JavaScript | 7 | 145–171 KB gzip, with TipTap and leaflet properly isolated. Phosphor weights (PF-10), photos leak (PF-11), eager map (PF-12). |
| CSS / render-blocking | 3 | 178 KB gzip of blocking CSS, 92% of it `@font-face`, including 124 duplicate rules (PF-01). |
| Fonts | 3 | 0.8–2.0 MB per page, 44–70% of page weight. Unused Zen Maru 500. `swap` + fallback metrics are good (PF-01/02/15). |
| Images | 5 | WebP q55, correct lazy loading, CLS 0. Portrait hero at 542 KB, 4 hidden slides loaded eagerly, all LCP images at `Low` (PF-03/04/05/13/14). |
| Third-party | 8 | Everything is server-side or self-hosted except the OSM tiles, which load eagerly (PF-12). |
| Core Web Vitals (lab) | Desktop 9 / mobile 4 | Desktop LCP under 0.6 s. Mobile: FCP 2.6–4.0 s on every page; home LCP about 13 s. |

## 4. Summary

The server side is already fast: every audited page is a cache HIT with a TTFB in single-digit milliseconds, the JS bundles are lean, TipTap and Leaflet are correctly split, and CLS is zero. The slow part is what the browser has to download.

1. **Japanese web fonts.** Fonts make up 44–70% of every page's weight (0.8–2.0 MB), and their `@font-face` CSS is 92% of the 178 KB gzip that blocks first paint. PF-01 changes nothing on screen and cuts that CSS by 36%: request Noto Sans JP as variable, drop Zen Maru 500, and add `font-sans` to three small notes. With PF-02 (OS gothic for body text, brand faces kept) and brotli (PF-06), the blocking CSS falls to about a quarter of today's size. Pages also stop loading 0.5–1 MB of body-font slices. In the lab this pulls mobile FCP from about 3 s toward 1.5–2 s.
2. **The home hero.** It is a 542 KB portrait image squeezed into a landscape box, and it is downloaded alongside four invisible slides. Cropping the asset (−58 to −67%), gating the other slides behind slide 1's `onLoad`, and adding `fetchPriority="high"` together fix the 13 s mobile LCP.
3. **The 404 disk cache.** ISR currently writes a cache entry for every unknown blog URL. A small `proxy.ts` caps that (PF-07).

Japanese typography stays intact throughout. Zen Maru Gothic and Noto Serif JP/Bodoni remain the display faces. PF-02 is the only change that is visible at all, and only on Windows desktop, so it needs design sign-off.

**Artifacts created during the audit:** no CMS data. My 404 probes left two cache entries, `.next/server/route-cache/…/$/blog/perfaudit23638.*` and `…/$/blog/category/perfcat7565.*` (about 51 KB each). They were left in place because the project is read-only for this audit, they are harmless, and they disappear on the next build. Scripts and lab JSON are in the session scratchpad under `perf/`.
