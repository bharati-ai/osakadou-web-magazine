# Tools and features QA: オオサカ堂 (production build)

- **Target:** http://localhost:3200 (`next start`, build `TAxIWaXEBdXOa8d56C1Ul`, built 2026-11-04 11:45 IST, which includes the other auditors' fixes).
- **Method:** headless Chromium over CDP. Values were typed with real key events (`Input.insertText` and key-by-key `dispatchKeyEvent`), and clicks were real mouse events. Pages were read through the DOM.
  - A `securitypolicyviolation` listener, together with the `Log` domain, records every CSP violation.
  - API checks use `fetch` with the auditor key.
- **Scripts:** the scratchpad `tools-qa/` folder (`test-tools.mjs`, `test-home.mjs`, `test-blog.mjs`, `test-api.mjs`, `test-admin.mjs`, `test-sweep.mjs`, `crawl.mjs`, plus probes). Logs: `run5.log`, `home2.log`, `blog4.log`, `api2.log`, `admin5.log`, `sweep1.log`.

**Totals on the current build:** 1,149 automated checks passed and 29 failed. 21 of the failures map to the 14 findings below. The other 8 were expectation errors in my tests and are not findings: the list order (1), the expected 404 line in the console of the 404 pages (5), and the 308 hop for percent-encoded slugs (2).

---

## 1. Findings

| ID | Sev | Location | Problem | Concrete fix |
|---|---|---|---|---|
| TF-01 | **P1** | `components/tools/health/bmi.tsx:17` | **BMI tool loses focus while typing the age.** When the age passes through a value under 18 (for example, the "4" of "42", or the "3" left after deleting a digit of "35"), `if (b.minor) return <BodyFields b={b} />;` swaps the root element from `<div>` to `BodyFields`. React then remounts every input. Focus drops to `<body>` and the next keystroke is lost. Typing "42" key by key leaves **"4"** in the field with focus on BODY. The other body tools keep focus ("42" works in 標準体重 and 基礎代謝). The mobile keyboard also closes. This is the most-used tool. | Keep one tree: `return <div className="grid gap-6"><BodyFields b={b} />{!b.minor && <>…Result, BandScale, Stats, More…</>}</div>`. This is the same pattern `target-weight.tsx` already uses. |
| TF-02 | **P1** | `components/tools/tool-shell.tsx:70-71` (shows on `/tools/hada-yohou`) | **Horizontal page scroll at 375px on 肌予報.** The hourly UV/湿度 table is `w-max` inside `overflow-x-auto`, but the grid tracks above it are `auto` with `min-width:auto`, so they grow to the table's width. Measured: `scrollWidth` 531 against a 375 viewport, and `div.grid.content-start.gap-4` is 515px wide. The whole page pans sideways on phones. All other 21 tools, `/`, `/tools`, `/blog` and `/about` are clean. | In ToolShell: `className="wrap mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:…"` and `<div className="grid min-w-0 content-start gap-4">`. This fixes every tool at the root cause; `min-w-0` on the `<section aria-labelledby="hada-strip">` would only patch this one. |
| TF-03 | **P1** | `lib/cms/api.ts:116` (default `author_name: actor`), shown at `components/blog/article-view.tsx:38,86` | **API-created posts show the internal actor string as the public byline.** A post created without `author` stores `author: "api:auditor"`. The article prints 「文 api:auditor」, and the JSON-LD has `author.name: "api:auditor"`. An n8n key named "n8n" would publish 「文 api:n8n」. This also contradicts `docs/cms/API.md:20` ("defaults to the key name"). Verified on prod and dev. | Default to an empty string so `SITE.editors` is used: `author_name: ""` in the create defaults. Keep `api:<key>` only as the revision `author`, as it is today. Update API.md §1 and §5 to say "default: 編集部 (SITE.editors)". |
| TF-04 | **P1** | `components/admin/post-form.tsx:36-47`, `components/admin/nav.tsx:3` | **The unsaved-changes guard misses the most common way out.** `beforeunload` fires only on full unloads; the guard works there (a typed title followed by a full navigation gives a prompt). The admin sidebar uses `next/link`, so clicking 「記事」 with unsaved edits navigated to `/admin/posts` with **no prompt**, and the edits were lost. The test confirmed the title was not saved. | While dirty, add a capture-phase click guard in PostForm: `useEffect(() => { if (!dirty) return; const h = (e: MouseEvent) => { const a = (e.target as Element).closest("a[href]"); if (a && !a.hasAttribute("target") && !confirm("保存していない変更があります。移動しますか？")) { e.preventDefault(); e.stopPropagation(); } }; document.addEventListener("click", h, true); return () => document.removeEventListener("click", h, true); }, [dirty]);` |
| TF-05 | P2 | `components/admin/post-form.tsx:47`, `components/admin/editor.tsx:323` | **Format-only edits are not marked dirty.** Dirty is set only by the form's `onInput`. Applying 太字 to existing text from the toolbar, inserting a box, image, table or Q&A, picking or removing a cover (`setCover`), or editing sources (button clicks) fires no `input` event. The badge 「未保存の変更があります」 stays hidden and leaving gives no prompt. Measured: bold applied, `dirtyBadge=false`, no dialog. | Pass `onChange` to `RichEditor` and call it in `onUpdate` (`onUpdate: ({editor:e}) => { setHtml(e.getHTML()); onChange?.(); }`). In PostForm, wrap `setCover` and `setSources` so they also call `setDirty(true)`. |
| TF-06 | P2 | `components/home/checklist.tsx:23` | **The stamp-card counter counts ids that are no longer in the list.** `count = Object.values(done).filter(Boolean).length` counts everything in localStorage. When `{ghost1,ghost2,ghost3}` was seeded, the page showed 「12個中3個 達成」 with 0 stamps. After an editorial change to CHECKLIST ids, returning visitors see wrong counts, and the 「全部達成」 message could appear early or the count could exceed the total. Persistence itself works: the stamps survive a reload, and corrupt JSON is handled. | `const ids = new Set(CHECKLIST.flatMap(g => g.items.map(i => i.id))); const count = Object.entries(done).filter(([k, v]) => v && ids.has(k)).length;` |
| TF-07 | P2 | `components/tools/health/parts.tsx:22, 34` | **A zero or negative age is treated as a child.** `minor = a !== null && a < 18`, so age "-5" or "0" shows 「18歳未満の方は…」, and the range hint is hidden by `b.ok.age \|\| b.minor`. This affects all 10 `useBody` tools with an age field: bmi, taishibou, hyoujun, biyou, cinderella, kinniku, kiso-taisha, maintenance, pfc (supe has no age field). | `const minor = a !== null && a >= 1 && a < 18;`. Values ≤ 0 then fall through to the existing 「18〜100歳で入力してください。」 hint. |
| TF-08 | P2 | `components/tools/health/mets-calorie.tsx:31-33` | **ウォーキング and ランニングのカロリー give no hint for out-of-range input.** For 0, negative, empty, 601 minutes or 999kg, the result just shows "-". Unlike every other tool, the fields have no `hint`. | Add `hint={!wOk ? "25〜250kgで入力してください。" : undefined}` and similar hints for 距離 (0.1〜100km) and 時間 (1〜600分), reusing the `valid` sub-conditions. |
| TF-09 | P2 | `components/tools/wellness/bichiku-keisan.tsx:39` | **Household counts are clamped to 20 silently.** With 大人 = 999, the field still shows 999 while the result uses 20 (420 L). Decimals are also floored silently (2.7 becomes 2). | Add `hint` on each field when the input is over 20 or not an integer (「20人までで計算しています」), or clamp the field value on blur. |
| TF-10 | P2 | `app/api/v1/posts/route.ts:32` and `lib/cms/api.ts:125` | **Idempotency breaks on normalised `external_id`.** The lookup uses the raw value, but the stored value is `trim().slice(0,100)`. (a) `" qa-x "` after `"qa-x"` returns **422** 「すでに使われています」 instead of 409, and `?upsert=true` fails the same way. (b) A 120-character id is accepted (201, silently truncated), and every retry with `?upsert=true` then fails with **422**. | Normalise once, before the lookup: `const extId = typeof body.external_id === "string" ? body.external_id.trim() : ""; if (extId.length > 100) throw new ApiError(422, "validation_failed", …, ["external_id: 100文字までです"]); const existing = extId ? findPost(extId, "external_id") : undefined;`. Drop the silent `.slice(0,100)`. |
| TF-11 | P2 | `app/api/v1/posts/[ref]/route.ts:6` | **Refs containing `%` return 500.** Next has already decoded `params.ref`; `decodeURIComponent` runs a second time and throws `URIError`. `GET /api/v1/posts/100%25` returns 500 `internal`. A post whose external_id is `…50%off` cannot be read or PATCHed with `?by=external_id` (500). Reproduced on prod and dev. | Use `findPost(ref, …)` without decoding again. Alternatively, wrap the decode in try/catch and fall back to the raw `ref`. |
| TF-12 | P2 | `lib/cms/html.ts:79, 84-85` | **`on_image_error:"drop"` leaves an empty `<img />` in the body.** The marker attribute `data-ol-drop` is not in `allowedAttributes.img`, so sanitize-html strips it before `exclusiveFilter` runs, and the image is never dropped. The response is `"content_html":"<p>x</p><img /><p>y</p>"`. This affects the editor path (`processLocalHtml`) the same way, for unresolvable `src`. | Add `DROP_ATTR` to `allowedAttributes.img`, because `exclusiveFilter` sees the filtered attribs. Alternatively, filter on `frame.tag === "img" && !frame.attribs.src`. |
| TF-13 | P2 | `proxy.ts:12` (with the Windows file cache) | **On this Windows host, mixed-case URLs of cached articles return 200 instead of 308.** `/blog/OSAKA-SENTO` returns 200 with `x-nextjs-cache: HIT`, because NTFS matches `route-cache/…/blog/osaka-sento.html` without regard to case. The page's `permanentRedirect` never runs. The canonical tag points to the lowercase URL, so the SEO impact is limited. Uncached and unknown slugs redirect correctly. This is probably Windows-only. | Redirect in the proxy, which runs before the cache: `if (a !== a.toLowerCase()) return NextResponse.redirect(new URL(req.nextUrl.pathname.toLowerCase(), req.url), 308);`. Optionally rewrite slugs that do not match `^[a-z0-9-]+$` straight to `/blog/__none__`, which saves the 308 hop that `/blog/%E3%81%82` and `/blog/..%2Fadmin` take now. |
| TF-14 | P2 | `docs/cms/API.md:20` | The doc says the author defaults to the key name. The actual default is `api:<key>` (see TF-03). | Update the doc together with the TF-03 fix. |

**CSP and console:** **0 CSP violations** across 81 page loads. These covered `/`, `/tools`, `/about`, `/blog`, all 22 tools, all 20 category and sub-category pages, all 15 live articles, 5 Japanese 404 pages and 15 admin screens. The pages were also exercised: map tiles from `tile.openstreetmap.org` (allowed by `img-src`), the share stubs, the editor, version restore, and the media delete. There were **0 console errors or exceptions** apart from the expected `404 (Not Found)` of the 404 documents themselves.

---

## 2. Reproduction details for the failures

**TF-01 (BMI focus loss)**
- Steps: open `/tools/bmi`, click the 年齢 field, select all, then type `4` and `2` as separate keystrokes.
- Expected: 42 is entered.
- Actual: the field shows `4`, `document.activeElement` is BODY, and the under-18 note is shown.
- Repro script: `probe-keys.mjs`.
- File to fix: `components/tools/health/bmi.tsx`.

**TF-02 (肌予報 overflow at 375px)**
- Steps: set the viewport to 375×812 (mobile), open `/tools/hada-yohou`, and wait for the weather.
- Expected: `scrollWidth` equals 375.
- Actual: 531. The widest elements are `div.grid.content-start.gap-4` at 515px, `section.card-hard` at 515px and `div.grid.gap-6` at 473px.
- Repro script: `probe-hada.mjs`. Screenshot: `hada-375-3200.png`.
- File to fix: `tool-shell.tsx`.

**TF-03 (API author string as byline)**
- Steps: `POST /api/v1/posts` without `author`, publish the post, then open it.
- Expected: 「文 オオサカ堂編集部」.
- Actual: `author: "api:auditor"`, shown publicly and in the JSON-LD.
- File to fix: `lib/cms/api.ts:116`.

**TF-04 (sidebar link bypasses the guard)**
- Steps: open `/admin/posts/{id}`, change the title, then click 「記事」 in the sidebar.
- Expected: a confirmation prompt, or the navigation is blocked.
- Actual: the page goes to `/admin/posts` immediately and the change is lost. A full navigation does prompt.
- File to fix: `post-form.tsx`.

**TF-05 (format-only edits not dirty)**
- Steps: open the editor, select an existing paragraph, click 太字, then reload or leave.
- Expected: 「未保存の変更があります」 and a prompt.
- Actual: no badge and no prompt.
- Files to fix: `post-form.tsx` and `editor.tsx`.

**TF-06 (checklist counts stale ids)**
- Steps: run `localStorage.setItem('osakalive:checklist', '{"ghost1":true,"ghost2":true,"ghost3":true}')`, then reload `/`.
- Expected: 0個.
- Actual: 「12個中3個 達成」.

**TF-07 (zero or negative age)**
- Steps: on any adult body tool, enter 年齢 `-5`.
- Expected: the range hint 「18〜100歳で入力してください。」.
- Actual: the children's note 「18歳未満の方は…」.

**TF-08 (calorie tools give no hint)**
- Steps: on `/tools/walking-calorie`, enter 時間 `601` or 距離 `0`.
- Expected: a hint explaining the allowed range.
- Actual: only "-".

**TF-09 (silent clamp in 備蓄計算)**
- Steps: enter 大人 `999`.
- Expected: a hint, or the field corrected.
- Actual: the field shows 999 and the result is 420 L (20 people).

**TF-10 (external_id normalisation)**
- Step (a): POST `external_id:"X"`, then POST `external_id:" X "`. Expected 409. Actual 422.
- Step (b): POST a 120-character `external_id` (201), then POST it again with `?upsert=true`. Expected 200, updating the post. Actual 422.

**TF-11 (`%` in the ref)**
- Steps: `GET /api/v1/posts/100%25`.
- Expected: 404.
- Actual: 500 `internal`.

**TF-12 (empty `<img />` with drop)**
- Steps: POST `{"on_image_error":"drop","content_html":"<p>x</p><img src=\"http://10.0.0.1/a.png\" alt=\"x\"><p>y</p>",…}`.
- Expected: `<p>x</p><p>y</p>`.
- Actual: `<p>x</p><img /><p>y</p>`. The warning is emitted correctly.

**TF-13 (mixed-case article URLs)**
- Steps: `curl -I http://localhost:3200/blog/OSAKA-SENTO`.
- Expected: 308 to `/blog/osaka-sento`.
- Actual: 200 with `x-nextjs-cache: HIT`.

---

## 3. What was verified and passed

### Self-checks
- `node components/tools/health/data.check.mts`: all checks passed.
- `osaka-ben.check.mjs`: 57 sentences OK.
- `matsuri.check.mjs`: OK.

### The 22 tools (541 checks)

Every tool page loads and shows no NaN, Infinity or undefined in any state. There were no console errors, no CSP violations and no same-origin 4xx/5xx.

Expected values were computed by hand, independently of `data.ts`:

| Tool | Input | Result |
|---|---|---|
| BMI | 170/65/35/女性 | **22.5** 普通体重; 標準 63.6kg (+1.4); 目標 53.5〜72.0kg; 女性30代平均 53.4kg |
| BMI | 170/100 | 34.6 肥満2度 |
| BMI | 170/50 | 17.3 低体重 |
| BMI | 19歳 | graceful "-" for the average |
| 体脂肪率 | 170/65/35/女性 | **30〜31%** (Deurenberg 29.6, CUN-BAE 31.0) |
| 体脂肪率 | 米海軍式, 女性 75/32/95 | 26.1% |
| 体脂肪率 | 米海軍式, 男性 85/38 | 17.8% (the ヒップ field is hidden for men) |
| 体脂肪率 | neck > waist | the 米海軍式 row is omitted |
| 標準体重 | 170cm | 63.6kg |
| 美容体重 | 170cm | 57.8kg, with no "kg to lose" shown to a 普通体重 user; at 70歳 a note that BMI20 is below the target band |
| シンデレラ体重 | 170cm | the headline is the 18.5 boundary (53.5kg), plus the low-weight alert and the eating-disorder help links |
| スペ | 170/65 | 105.0, BMI 22.5 |
| カウプ | defaults | 15.5, 肥満度 +1.0% ふつう |
| ローレル | 10歳, 140/35 | 127.6, +2.6% |
| カウプ | 0歳 | 発育曲線 note |
| カウプ | 18歳 | link to BMI |
| カウプ | 3.5歳 | rejected |
| カウプ | 5歳, 125cm | school formula |
| 筋肉量 | 28% body fat | LBM 46.8kg, Lee 21.2kg, FFMI 16.2 / 16.8; the AWGS calf note works |
| 基礎代謝 | 170/65/35/女性 | **1,350** kcal (HB 1,428); 80歳 is labelled 参考値 |
| メンテナンス | ふつう | 2,362 |
| メンテナンス | 低い | 2,025 |
| メンテナンス | 80歳 with 高い selected | falls back to 1.70 |
| ウォーキング | 65kg, 3km, 40分 | **152** kcal @ 3.5 METs |
| ランニング | 65kg, 5km, 30分 | **319** kcal @ 9.8 METs |
| ウォーキング/ランニング | absurd speed | warning shown |
| PFC | 維持 | 2,362 kcal, P 89g / F 66g / C 354g |
| PFC | 減量 | 2,129 |
| PFC | BMI 17.3 | 減量 removed |
| 睡眠サイクル | 7:00 wake | bed **23:15** (5 cycles); candidates 21:45 / 0:45 / 2:15 |
| 睡眠サイクル | bed 23:00 | wake 6:45 |
| 睡眠サイクル | 小学生 | wake 9:45 |
| 睡眠サイクル | empty time | prompt shown |
| 水分 | forecast | max temperature auto-filled (20℃): 1.2 L / 6杯 |
| 水分 | 32℃ + 高い | 2.7 L |
| 水分 | 150kg | clamps to 3.3 L, with a hint |
| 備蓄 | 2 adults, 7 days | 42 L / 21 bottles, rice 3.2kg, gas 12, toilet 70 |
| 備蓄 | + 1 infant | 63 L, toilet unchanged, baby items added |
| 引っ越し | 市外 + マイナ | 5 steps; move-in 11/10 gives 転入届 due 11月23日（月） and water 11月5日（木） |
| 引っ越し | kids, car, dog | the expected steps are added |
| 引っ越し | 同じ区 | 転居届 |

Edge cases: empty, 0, negative, 99999 and 1e9 were tried on every numeric field of the body tools; each gives "-" plus a range hint (except TF-07 and TF-08). At age 15, the under-18 note is shown and the adult results are hidden.

**Checklists** in 備蓄 and 引っ越し are stored in localStorage, survive a reload, and the reset clears them.

**Weather tools.** 肌予報 and 髪のうねり predict from live data; the UV card matches `daily[0].uv`, and 12 hourly rows are shown. A 503 from `/api/weather` (intercepted) shows the 「読み込めませんでした」 box with a 再読み込み button, and the button recovers.

**osaka-map:**
- 48 results for 梅田/病院 (40 listed), and switching to AED works.
- OSM tiles load under the CSP.
- A 503 from `/api/places` shows an error box, and もう一度読み込む recovers.
- 現在地:
  - when permission is denied, a message is shown;
  - for Tokyo, 「大阪府の外」;
  - for 心斎橋, 24 results, sent as `lat=34.675&lon=135.501` (rounded to 3 decimals as promised).
- `/api/places` returns 400 for a bad cat, `__proto__`, missing params, NaN, 1e400 and outside Osaka.

**osaka-ben:** conversion works, the empty state is shown, `maxLength` 300 is enforced, HTML input is rendered as text, and copy/share work.

**matsuri:** shows 2026年11月4日, and every card has a status.

### Home (45 checks)
- `/api/weather` has the right JSON shape (24 hourly, 7 daily) with plausible values, and the server-rendered time matches the API.
- Season tabs: 秋 is preselected, there is one visible panel, the tabindex is roving, ArrowRight and ArrowLeft wrap, and every panel has events. The tools tabs work.
- Carousel:
  - slides 2–5 render after slide 1 has loaded, including on a cached reload where autoplay still advances;
  - next, previous (wrapping) and thumbnails work;
  - pause stops autoplay;
  - the live region is off during autoplay;
  - prefers-reduced-motion turns autoplay off.
- Stamp card: stamps show with opacity 1, the counter and localStorage update, the state persists after a reload, and corrupt storage is handled (stale ids are TF-06).
- Share buttons (3: 相談先, チェックリスト, フッター):
  - each calls `navigator.share` with the right URL (`/#unwell`, `/#checklist`, `/`);
  - without the Web Share API, the button copies and shows 「リンクをコピーしました」, then restores its label;
  - if the clipboard is denied, the URL is shown instead.
- Links: all **73 links on `/`** return 200, including **21 `/blog/*` links** and every `#anchor` (each id exists on its target page). All 300+ image URLs return 200. Externally, only `jma.go.jp` answers 302, which is a redirect to its own index and fine.
- `/tools`, `/about`, `/blog` and all 22 tool pages, including the new 「この話題の読みもの」 boxes, have no broken internal links or images.

### Blog (179 checks)
- The index lists all 15 live posts.
- 5 categories and 15 sub-categories all return 200; each shows exactly its own posts, and `aria-current` is set. Unknown categories and wrong-parent paths return 404.
- Every TOC `href` (18–24 per article) matches an `id`, and there are no duplicate heading ids.
- Related posts are live and never the article itself.
- 27 link cards are enriched with title and excerpt.
- All **124** srcset, cover and card image URLs return 200 `image/*`.
- `/blog/feed.xml` is valid RSS 2.0 (parsed with Python ElementTree): 15 items, guid equals link, RFC-822 dates, `atom:link` and `lastBuildDate`.
- Unknown slugs return 404 through `proxy.ts`. The Japanese 404 pages work for `/nope-page`, `/tools/nope`, `/blog/nope-slug` and the category paths.
- Draft, scheduled and archived posts return 404 and are absent from `/blog`, the feed, the sitemap and the category pages. The admin preview needs a login.

### CMS API (122 checks)

Authentication: 401 for no key, a wrong key, a malformed key and Basic auth.

Draft creation (201, not live):
- `guide/gomi` resolved;
- `sec-1` and `sec-2` ids added;
- `<script>`, `onclick` and `javascript:` removed, each with a warning;
- `div.ol-box--point` becomes `aside`;
- external links get target and rel;
- local photo sized;
- 表現チェック warning raised;
- cover and excerpt defaulted.

Idempotency and updates:
- a duplicate `external_id` gets 409 with `details.id` and `slug`;
- `?upsert=true` returns 200, same id, and the content is kept;
- PATCH by id and by `?by=external_id` works, and `content_html` is reprocessed;
- GET by id, slug and external_id works, and unknown refs get 404.

List filters: status, q, category, subcategory and tag work. Pagination meta is correct, `per_page` is capped at 100, a bad status gets 400, an unknown category gets 404, and `include=content` works.

Visibility and cache purge:
- publish: live at once and listed;
- a future `published_at`: scheduled and **404 at once** (the cache is purged);
- DELETE: archived, then 404 and removed from the feed;
- `?permanent=true`: 204, then 404.

Validation: 19 field errors return 422 `validation_failed`. Invalid JSON and a JSON array get 400, `text/plain` gets 415, loopback and link-local images get 422 `image_error`.

Media:
- multipart PNG becomes WebP (201) and is served as `image/webp`;
- a data URI and an https URL are accepted;
- 422 for localhost, 192.168.x, `file:`, SVG, non-image data, a missing file and a text file;
- search by alt works, and the `/media` src is kept in a post.

Categories:
- creating a child and a top-level category works;
- duplicates, a third level, a missing `parent_id`, an empty name and a bad slug get 422;
- PATCH renames, and a bad or colliding slug gets 422;
- deleting a category with a post or with children gets 409;
- delete gets 204, and deleting again gets 404.

### Admin (72 checks)
- 15 screens load with no console errors and no CSP violations: dashboard, posts, drafts, new, edit, preview, by-slug, pages, the page editor, categories, media, api-keys, users, account and style-guide.
- Anonymous requests are redirected to the login page.

Editor round trip on a test post:
1. Typed 「追加テキスト。」, then a new paragraph; Shift+Home and toolbar 太字 gave `<strong>`.
2. 囲みボックス → ポイント gave `aside.ol-box--point`.
3. Saved with the visible sidebar button (the sticky bar's button is hidden at ≥1280px, as designed), and 「保存しました」 appeared.
4. The saved HTML is exactly:
   ```html
   <p>元の本文です。追加テキスト。</p><p><strong>太字にする文</strong></p><aside class="ol-box ol-box--point"><p>ボックスの中身</p></aside><p>二段落目です。</p>
   ```
5. The preview renders it, a reload of the editor parses it back, and the version history has 2 entries.
6. 「この版に戻す」 restored the original HTML exactly, and the form remounted with the original content.

The guard works for typed edits on a full navigation (gaps are TF-04 and TF-05).

---

## 4. Scores (1–10)

| Parameter | Score | Notes |
|---|---|---|
| Calculation correctness (tools) | 10 | Every checked value matches hand calculations, and the self-checks pass. |
| Input validation and edge cases (tools) | 7 | TF-07, TF-08, TF-09. |
| Interaction robustness (tools) | 6 | TF-01 (BMI focus), TF-02 (mobile overflow). |
| Network-dependent tools (weather, map) | 9 | Graceful 503 handling with working retries; geolocation is privacy-rounded. |
| Home features | 9 | TF-06 only. |
| Links and anchors (home, tools, blog) | 10 | 0 broken internal links or images. |
| Blog (TOC, related, cards, srcset, feed, 404, drafts) | 9 | TF-13 only (Windows cache casing). |
| CMS API conformance to API.md | 7 | TF-03, TF-10, TF-11, TF-12, TF-14. |
| Admin and editor | 8 | The round trip and restore are solid; the guard gaps are TF-04 and TF-05. |
| CSP and console hygiene | 10 | 0 violations and 0 errors on 81 pages plus interactions. |

---

## 5. Summary

- **P0: 0. P1: 4** (TF-01 to TF-04). **P2: 10.**
- All 22 tools calculate correctly, and the new build is clean under the CSP everywhere. Blog delivery is solid: TOC anchors, link cards, srcset, feed, drafts and cache purging all work.
- The P1s are small, contained fixes:
  - a remount in `bmi.tsx` that drops typed age digits;
  - a missing `minmax(0,1fr)` in ToolShell that makes 肌予報 scroll sideways on phones;
  - API posts that publish the byline 「文 api:<key>」;
  - an unsaved-changes guard that a sidebar `<Link>` silently bypasses.
- The API's idempotency path should normalise `external_id` before the lookup (TF-10), and it should not decode the ref twice (TF-11).

### Test data created and cleaned up
Everything I created was removed. A final check found 0 `qa-*` posts, 0 `qa-tools-*` categories, and only the 2 pre-existing media items (ids 1 and 2, which are not mine).
- **Posts** (all deleted with `DELETE …?permanent=true`; a 404 was confirmed for each):
  - API runs `mw1p1zst` and `mw1qditx`: ids 17–22;
  - one drop probe on prod and one on dev (id 17 each time);
  - editor test posts `qa-tools-ed-*`, including two left behind by crashed runs.
- **Categories** (deleted with DELETE, 204): `qa-tools-cat-*` (child of living) and `qa-tools-top-*`.
- **Media** (deleted in `/admin/media`; the library entry is gone and the file returns 404): ids 3, 4 and 5 from each API run, which were a unique generated PNG, a data URI and the gstatic `1.jpg` import. Each was created after the run's start time, so none was pre-existing.

### Not tested
- The rate limit (120/min): the key is shared with other auditors.
- Writer-role permissions: `writer-session.txt` has expired (it redirects to the login page).

### Test-side notes (not findings)
- The list order is `coalesce(published_at, updated_at) DESC`, which is "newest first" by publish or update date, not by `created_at`.
- `/blog/..%2Fadmin` and `/blog/%E3%81%82` end at 404 after one 308 hop (see TF-13 for the shortcut).
