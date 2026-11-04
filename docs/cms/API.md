# オオサカ堂 CMS — Blog API v1

This REST API publishes blog posts to osakadou.live from an external tool: n8n, Make, Zapier, a script, or an AI pipeline. Everything the admin editor can do to a post, the API can do too. Both paths share the same validation, HTML sanitizer, image pipeline, category tree and revision history.

- **Base URL:** `https://osakadou.live/api/v1` (in development: `http://localhost:3100/api/v1`)
- **Format:** JSON (UTF-8). Send `Content-Type: application/json`, except for file uploads.
- **Body HTML:** see [HTML-STYLE-GUIDE.md](./HTML-STYLE-GUIDE.md) for the tags and CSS classes `content_html` may use. A live preview of every component is at `/admin/style-guide`.

---

## 1. Authentication

1. An admin creates a key in **管理画面 → APIキー** (`/admin/api-keys`). The key looks like `odk_…` and is **shown only once**. Only its hash is stored.
2. Send the key on every request:
   ```
   Authorization: Bearer odk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Revoke a key at any time on the same screen. Each key shows when it was last used.

Posts created with a key record `api:<key name>` as the editor in the revision history (admin only). The public byline (`author`) defaults to 「オオサカ堂編集部」.

`GET /api/v1` returns the key's name and the list of endpoints. Use it as a connection test.

## 2. Limits

| What | Limit |
|---|---|
| Requests | 120 per minute per key (`429 rate_limited` beyond that) |
| JSON body | 25 MB |
| `content_html` | 2 MB before processing, 600 KB after |
| Images per post | 40 |
| One image | 10 MB, JPEG / PNG / WebP / AVIF / GIF (first frame) / HEIF / TIFF. SVG is not accepted. |
| Image download | 15 s timeout, up to 3 redirects, public `http(s)` hosts only (private, loopback and link-local addresses are refused) |

## 3. Quick start

```bash
curl -X POST https://osakadou.live/api/v1/posts \
  -H "Authorization: Bearer $OSAKADOU_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @post.json
```

`post.json`:
```json
{
  "external_id": "sheet-row-128",
  "title": "大阪市の粗大ごみ、申し込みから出すまで",
  "slug": "osaka-sodai-gomi",
  "category": "guide",
  "subcategory": "gomi",
  "excerpt": "大阪市で粗大ごみを出すときの申し込み方法、手数料券、当日の出し方を順番にまとめました。",
  "content_html": "<p class=\"ol-lead\">…</p><h2>申し込み方法</h2><p>…</p><figure class=\"ol-figure\"><img src=\"https://example.com/sodai.jpg\" alt=\"粗大ごみの手数料券\"><figcaption>手数料券（イメージ）</figcaption></figure>",
  "cover_image": { "url": "https://example.com/cover.jpg", "alt": "集積所に出された粗大ごみ" },
  "tags": ["粗大ごみ", "大阪市"],
  "sources": [{ "title": "大阪市「粗大ごみの出し方」", "url": "https://www.city.osaka.lg.jp/kankyo/page/0000009337.html" }],
  "status": "published",
  "published_at": "2026-11-05T09:00:00+09:00",
  "reviewed_at": "2026-11-04"
}
```

Response `201 Created`:
```json
{
  "data": {
    "id": 42,
    "slug": "osaka-sodai-gomi",
    "url": "https://osakadou.live/blog/osaka-sodai-gomi",
    "status": "published",
    "live": false,
    "scheduled": true,
    "content_html": "<p class=\"ol-lead\">…</p><h2 id=\"sec-1\">申し込み方法</h2>…<img src=\"/media/2026/11/3f9c…webp\" alt=\"粗大ごみの手数料券\" width=\"1600\" height=\"1067\" loading=\"lazy\" decoding=\"async\" />…",
    "cover_image": { "src": "/media/2026/11/a81e…webp", "url": "https://osakadou.live/media/2026/11/a81e…webp", "alt": "集積所に出された粗大ごみ" },
    "category": { "id": 18, "slug": "gomi", "name": "ごみ・リサイクル", "parent": { "id": 17, "slug": "guide", "name": "暮らしのガイド" }, "path": "guide/gomi" }
  },
  "warnings": []
}
```
(The response above is shortened; section 6 lists every field.)

**Always read `warnings`.** It lists everything the sanitizer removed and every phrase the compliance check flagged.

## 4. Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/v1` | Key check and endpoint list |
| GET | `/api/v1/categories` | Category tree with post counts |
| POST | `/api/v1/categories` | Create a category or sub-category |
| PATCH | `/api/v1/categories/{id}` | Rename or re-slug a category, edit its description or sort order |
| DELETE | `/api/v1/categories/{id}` | Delete an **empty** category (no posts, no sub-categories) |
| GET | `/api/v1/posts` | List posts (paginated) |
| POST | `/api/v1/posts` | Create a post (`?upsert=true` to update by `external_id`) |
| GET | `/api/v1/posts/{ref}` | Get one post |
| PATCH | `/api/v1/posts/{ref}` | Update the fields you send |
| DELETE | `/api/v1/posts/{ref}` | Archive (unpublish); `?permanent=true` deletes the post |
| GET | `/api/v1/media` | List uploaded images |
| POST | `/api/v1/media` | Upload one image (multipart, or JSON with a URL or data URI) |

`{ref}` is a numeric **id** or a **slug**. To look a post up by your own id, use `?by=external_id`, for example `GET /api/v1/posts/sheet-row-128?by=external_id`.

### GET /api/v1/posts — query parameters

| Param | Values |
|---|---|
| `status` | `draft`, `published`, `archived`, `scheduled` (published with a future date), `live` (published and visible) |
| `category`, `subcategory` | category slugs; a parent category includes its sub-categories |
| `tag` | exact tag |
| `q` | text in the title, slug or excerpt |
| `page`, `per_page` | default 1 and 20; `per_page` is at most 100 |
| `include=content` | also return `content_html` |

Response: `{ "data": [post…], "meta": { "total", "page", "per_page", "pages" } }`, newest first.

## 5. Post fields (input)

| Field | Type | Required | Rules / default |
|---|---|---|---|
| `title` | string | **yes** (create) | 1–120 characters. Rendered as the page `<h1>`; do not repeat it in the body. |
| `content_html` | string | **yes** (create) | Article body following [HTML-STYLE-GUIDE.md](./HTML-STYLE-GUIDE.md). It is sanitised, images are imported, and `<h2>`/`<h3>` get ids for the table of contents. |
| `category` | string | **yes** (create) | Top-level category slug, e.g. `guide` |
| `subcategory` | string | no | Sub-category slug under `category`, e.g. `gomi`. Recommended. |
| `category_path` | string | alternative | `"guide/gomi"`, instead of the two fields above |
| `category_id` | number | alternative | Numeric id from `GET /categories` |
| `slug` | string | recommended | URL part: `^[a-z0-9]+(-[a-z0-9]+)*$`, max 80, unique. Final URL: `/blog/{slug}`. Default: `post-<timestamp>`. |
| `external_id` | string | recommended | Your own id (sheet row, record id), max 100, unique. Makes retries safe (section 8). |
| `excerpt` | string | no | Max 300. Shown on cards and as the fallback meta description. Default: the first 110 characters of the body. |
| `cover_image` | object \| null | no | `{ "url": "https://…" }`, `{ "data": "data:image/png;base64,…" }` or `{ "src": "/media/…" \| "/photos/…" }`, plus `"alt"`. Default: the first image in the body. `null` removes it. |
| `tags` | string[] | no | Up to 10 tags, each 1–30 characters |
| `sources` | `{title,url}[]` | recommended for health / guide posts | Up to 30. Rendered as 「参考・出典」 at the end of the article. |
| `status` | string | no | `draft` (default), `published`, `archived` |
| `published_at` | ISO 8601 | no | Publication date. With `status: "published"`, a future date **schedules** the post: it goes live within about 5 minutes of that time. Default for published posts: now. |
| `reviewed_at` | ISO 8601 / `YYYY-MM-DD` | recommended for YMYL | Shown as 「最終確認日」 |
| `author` | string | no | Max 60. Shown as the byline 「文 …」. Default: 「オオサカ堂編集部」. |
| `seo_title` | string | no | Max 70 (aim for 28–36 Japanese characters). Default: `title`. Rendered as `<title>{seo_title}｜オオサカ堂</title>`. |
| `seo_description` | string | no | Max 200 (aim for 90–120). Default: `excerpt`. |
| `noindex` | boolean | no | `true` adds `noindex` and leaves the post out of the sitemap |
| `seo` | object | no | Advanced SEO, all keys optional (see below). Send `null` for a key to clear it. |
| `on_image_error` | `"fail"` \| `"drop"` | no | `fail` (default): the request returns 422 when any image cannot be imported. `drop`: that image is removed and a warning is returned. |

`seo` object keys:

| Key | Type | Notes |
|---|---|---|
| `focus_keyphrase` | string | Max 60. Used only by the editor's SEO analysis. |
| `canonical` | string | A site path (`/blog/…`) or `https://osakadou.live/…`. Set only when another URL is the original. Posts with a canonical are left out of the sitemap. |
| `og_title` | string | Max 90. Default: the `<title>`. |
| `og_description` | string | Max 200. Default: `seo_description`. |
| `og_image` | string | A `/media/…` path already on this server. Default: the cover image. |
| `nofollow` | boolean | `true` adds `nofollow`. |
| `schema_type` | `"BlogPosting"` \| `"Article"` \| `"NewsArticle"` | JSON-LD type. Default `BlogPosting`. |
| `faq_schema` | boolean | `false` stops Q&A blocks (`details.ol-faq`) from being output as FAQPage. |

`PATCH` accepts the same fields. Only the fields you send change. `content_html` is processed again only when you send it.

## 6. Post object (output)

```json
{
  "id": 42, "slug": "…", "url": "https://osakadou.live/blog/…",
  "status": "published", "live": true, "scheduled": false,
  "title": "…", "excerpt": "…", "content_html": "…",
  "cover_image": { "src": "/media/…webp", "url": "https://osakadou.live/media/…webp", "alt": "…" },
  "category": { "id": 18, "slug": "gomi", "name": "ごみ・リサイクル", "parent": { "id": 17, "slug": "guide", "name": "暮らしのガイド" }, "path": "guide/gomi" },
  "tags": [], "sources": [], "author": "…", "seo_title": "", "seo_description": "", "noindex": false,
  "seo": { "focus_keyphrase": "大阪 ごみ 分別", "canonical": null, "og_title": null, "og_description": null, "og_image": null, "nofollow": false, "schema_type": "BlogPosting", "faq_schema": true },
  "reading_minutes": 6, "external_id": "sheet-row-128", "origin": "api",
  "published_at": "2026-11-05T00:00:00.000Z", "reviewed_at": "2026-11-04T00:00:00.000Z",
  "created_at": "…", "updated_at": "…"
}
```
Dates are returned in UTC (ISO 8601). `content_html` uses root-relative image paths (`/media/…`); prefix `https://osakadou.live` for absolute URLs.

## 7. Images: how they are stored

For every `<img>` in `content_html` and for `cover_image`:

1. **Image on another server** (`https://…`): the server downloads it, checks that it really is an image, and rejects anything over 10 MB.
   **`data:image/…;base64,…`**: the server decodes it.
   **Already on this site** (`/media/…`, `/photos/…`): it is kept as is.
2. The image is converted to **WebP**:
   - at most 2000 px on the long side;
   - EXIF and GPS data are removed;
   - orientation is fixed.
3. It is saved on the server as `/media/YYYY/MM/<content-hash>.webp`. The same image sent twice is stored once.
4. The `src` is rewritten to that public URL, and `width`, `height`, `loading="lazy"` and `decoding="async"` are added.
5. On the public page, body images are served in responsive sizes (640–1600 px) automatically.

To upload an image on its own first and reuse it:
```bash
# multipart
curl -X POST https://osakadou.live/api/v1/media -H "Authorization: Bearer $KEY" -F "file=@photo.jpg" -F "alt=説明文"
# or JSON
curl -X POST https://osakadou.live/api/v1/media -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/photo.jpg","alt":"説明文"}'
```
Response: `{ "data": { "id", "src": "/media/…webp", "url": "https://osakadou.live/media/…webp", "width", "height", "bytes", "alt" } }`. Use `src` in `content_html` or `cover_image.src`.

**Rights:** only send images you are allowed to publish. The `source_url` of every imported image is kept in the media library for auditing.

## 8. Retries and idempotency

Automations retry. To avoid duplicate posts:
- **Always send `external_id`.**
- `POST /posts` with an `external_id` that already exists returns **`409 conflict`**, with `details.id` and `details.slug` of the existing post.
- `POST /posts?upsert=true` **updates** that post instead and returns `200`. This is the simplest pattern: "create or update this row".
- `PATCH /posts/{external_id}?by=external_id` updates explicitly.

Every create and update stores a **revision**. Editors can compare and restore old versions in the admin (記事 → 編集 → 版の履歴), so an automation mistake can always be rolled back.

## 9. Categories

The categories are two levels deep: a top-level category and its sub-categories. Current tree (slugs):

| Category | Sub-categories |
|---|---|
| `living` 大阪の暮らし | `hitorigurashi` 一人暮らし · `machi-aruki` まち歩き · `mizube` 水辺・公園 |
| `health` 健康・医療 | `kakaritsuke` かかりつけ医・受診 · `kenshin` 健診・検診 · `kyukyu` 救急・相談窓口 |
| `beauty` 美容・ウェルネス | `seibun` 成分・表示 · `biyou-iryou` 美容医療と契約 · `skincare` スキンケア |
| `culture` ひと・トレンド・カルチャー | `food` 食 · `sento` 銭湯 · `museum` ミュージアム |
| `guide` 暮らしのガイド | `gomi` ごみ・リサイクル · `tetsuzuki` 手続き · `bousai` 防災 |

Always fetch the live tree with `GET /api/v1/categories`, because editors can add categories. To create one:

```json
POST /api/v1/categories
{ "name": "子育て", "slug": "kosodate", "parent": "living", "description": "大阪市の子育て支援と相談先" }
```
- Omit `parent` to create a top-level category.
- Slugs are unique per parent.
- A category with posts or sub-categories cannot be deleted (`409`).

Public URLs: `/blog/category/{category}` and `/blog/category/{category}/{subcategory}`.

## 10. Warnings and the compliance check

`warnings` (array of strings, in Japanese) reports:
- removed tags, classes, attributes and dangerous links (`<script>`, `onclick`, `javascript:` …);
- images without `alt`;
- images that were dropped (with `on_image_error: "drop"`);
- **表現チェック** — phrases that may break 薬機法 or 景表法: 治る, 効く, 副作用がない, 必ず痩せる, 最安, No.1, 個人輸入, 処方箋不要, and disease-prevention claims.

The check **does not block** publishing. Your automation should still:
1. post with `status: "draft"` whenever `warnings` contains `表現チェック`, or route the post to a human;
2. never publish health or beauty posts that name drugs, products or clinics (see HTML-STYLE-GUIDE §4).

## 11. Errors

```json
{ "error": { "code": "validation_failed", "message": "入力内容に誤りがあります", "details": ["slug: 半角英小文字・数字・ハイフン（80文字まで）で指定してください"] } }
```

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `bad_request` | Not valid JSON, or a bad query parameter |
| 401 | `unauthorized` | Missing, wrong or revoked key |
| 404 | `not_found` | Post or category not found |
| 409 | `conflict` | Duplicate `external_id`, or a category that is not empty |
| 413 | `payload_too_large` | Body or image too large |
| 415 | `unsupported_media_type` | Send `application/json` (or `multipart/form-data` to `/media`) |
| 422 | `validation_failed` | Field errors in `details` |
| 422 | `image_error` | An image could not be downloaded or decoded, or its address is not allowed |
| 429 | `rate_limited` | More than 120 requests per minute |
| 500 | `internal` | Server error; safe to retry with the same `external_id` |

## 12. Automation recipe (n8n / Make / Zapier)

1. **HTTP Request** `GET /api/v1/categories` once a day, and cache the slugs.
2. Generate or collect the article. Map your fields to `title`, `slug`, `category`, `subcategory`, `excerpt`, `content_html`, `cover_image.url`, `tags`, `sources` and `reviewed_at`.
3. **HTTP Request** `POST /api/v1/posts?upsert=true` with `external_id` = your row or record id. Leave `status` out to create a draft, or send `"published"` and an optional `published_at`.
4. If the response's `warnings` contains `表現チェック`, PATCH `status: "draft"` and notify an editor.
5. On `5xx` or a timeout, retry the same request. `upsert` makes the retry safe.

## 13. Operations notes

- Data lives in `DATA_DIR`: `osakadou.db` (SQLite) and `uploads/`. **Back up both together.** Example: a nightly `sqlite3 "$DATA_DIR/osakadou.db" ".backup 'backup.db'"` plus an rsync of `uploads/`.
- Public pages update on the next visit after an API write. Scheduled posts appear within about 5 minutes of `published_at`.
- The API is meant for server-to-server calls. It sends no CORS headers, so do not call it from a browser and never ship a key to the browser.
