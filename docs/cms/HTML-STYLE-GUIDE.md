# オオサカ堂 — Article HTML & CSS class guide

This is the contract for article bodies (`content_html`). The same rules apply to:
- posts written in the admin editor (`/admin/posts`);
- posts sent through the API (`POST /api/v1/posts`, see [API.md](./API.md));
- the seed articles in `content/posts/*.html`.

The site renders every body inside `<div class="ol-article">…</div>`, so the classes below only take effect there. Anything outside this list is removed when the post is saved, and the API response lists what was removed under `warnings`.

The live preview of every component is at `/admin/style-guide`.

---

## 1. Rules in short

1. Write **semantic HTML only**: headings, paragraphs, lists, tables, figures. No `style` attributes except `text-align`, no `<script>`, `<style>`, `<iframe>`, forms or inline event handlers.
2. **Do not include the title (`<h1>`) in the body.** The page renders the title from the `title` field. Any `<h1>` in the body becomes `<h2>`.
3. Use **`<h2>` for sections and `<h3>` for sub-sections** (`<h4>` at most). Headings get `id`s automatically, and the table of contents is built from `<h2>`/`<h3>`.
4. **Images**: put them in `<figure class="ol-figure">` with an `alt` and, ideally, a `<figcaption>`. Images from other servers and `data:` URIs are downloaded, converted to WebP, saved on our server, and the `src` is rewritten to `/media/…`.
5. **Links**: internal links use site paths (`/blog/slug`, `/tools/bmi`). External links get `target="_blank" rel="noopener noreferrer"` automatically. Allowed schemes: `https`, `http`, `mailto`, `tel`.
6. Only the classes listed below are kept. Unknown classes are dropped and reported in `warnings`.

## 2. Allowed tags

| Tag | Allowed attributes | Notes |
|---|---|---|
| `h2` `h3` `h4` | `style="text-align:…"` | `h1`→`h2`, `h5`/`h6`→`h4` |
| `p` | `class`, `style="text-align:…"` | classes: `ol-lead`, `ol-box__title` |
| `br` | – | line break inside a paragraph |
| `strong` `em` `u` `s` `mark` `code` | – | `b`→`strong`, `i`→`em`, `del`/`strike`→`s` |
| `a` | `href`, `title`, `class` | class: `ol-linkcard` |
| `ul` `ol` `li` | `ol[start]`, `class` | classes: `ol-steps`, `ol-check`, `ol-sources` |
| `blockquote` | – | quotations; contains `<p>` |
| `figure` `figcaption` `img` | `img[src alt width height]`, `figure[class]` | classes: `ol-figure`, `ol-figure--narrow` |
| `table` `thead` `tbody` `tr` `th` `td` | `th[scope colspan rowspan]`, `td[colspan rowspan]`, `style="text-align:…"` on cells | wrapped in a scroll container automatically |
| `hr` | – | section break |
| `div` / `aside` | `class` | only `ol-box` + a modifier (saved as `<aside>`); any other `div` is unwrapped, its content kept |
| `details` `summary` | `class` | class: `ol-faq` |
| `pre` | – | code block, contains `<code>` |

## 3. Component classes

### `p.ol-lead` — lead paragraph
The summary paragraph at the top of the article, shown larger.
```html
<p class="ol-lead">大阪市で一人暮らしを始める前に、住む場所の選び方から転入の手続きまでを順に確認します。</p>
```

### `div.ol-box` — callout box
Always combine `ol-box` with **one** modifier (the default is `ol-box--note`). An optional first paragraph `p.ol-box__title` becomes the box title. You may write `<div class="ol-box …">` or `<aside class="ol-box …">`; it is stored and returned as `<aside>`.

| Modifier | Use for | Default title |
|---|---|---|
| `ol-box--point` | key takeaways | ポイント |
| `ol-box--note` | supplementary notes | メモ |
| `ol-box--caution` | warnings, "consult a doctor" notes | 注意 |
| `ol-box--info` | official contact / where to check | 確認先 |

```html
<div class="ol-box ol-box--point">
  <p class="ol-box__title">この記事のポイント</p>
  <ul>
    <li>転入届は、住み始めてから14日以内に出します。</li>
    <li>ごみの収集日は地域ごとに違います。</li>
  </ul>
</div>
```
Boxes may contain `p`, `ul`, `ol`, `table`, `h3`/`h4`. Do not nest boxes.

### `figure.ol-figure` — image with caption
```html
<figure class="ol-figure">
  <img src="https://example.com/photo.jpg" alt="天神橋筋商店街のアーケード" width="1600" height="1067">
  <figcaption>天神橋筋商店街（北区）</figcaption>
</figure>
```
- Add `ol-figure--narrow` for portrait or small images (max 480px, centred).
- `alt` is required for meaningful images. An `alt=""` is allowed only for decoration. A missing `alt` is reported in `warnings`.
- `width`/`height` are filled in automatically from the saved file.
- A bare `<img>` outside a figure is also accepted and shown as a block image.

### `ol.ol-steps` — numbered steps
```html
<ol class="ol-steps">
  <li><strong>住む区を決める</strong>：通勤・通学の路線から候補を絞ります。</li>
  <li><strong>転入届を出す</strong>：区役所の窓口で、14日以内に。</li>
</ol>
```

### `ul.ol-check` — checklist
```html
<ul class="ol-check">
  <li>マイナンバーカード</li>
  <li>転出証明書（他の市区町村から来た場合）</li>
</ul>
```

### `ul.ol-sources` / `ol.ol-sources` — references inside the body
Prefer the structured `sources` field, which renders an 「参考・出典」 block at the end of the article. Use this class only for a mid-article reference list.
```html
<ul class="ol-sources">
  <li><a href="https://www.city.osaka.lg.jp/">大阪市「転入の手続き」</a>（2026年10月31日確認）</li>
</ul>
```

### `a.ol-linkcard` — internal link card (「あわせて読みたい」)
Use it for interlinking. Put the link **alone in its own paragraph**.
```html
<p><a class="ol-linkcard" href="/blog/osaka-gomi-bunbetsu">大阪市のごみ分別と出し方</a></p>
```

### `details.ol-faq` — question and answer
```html
<details class="ol-faq">
  <summary>転入届は代理人でも出せますか？</summary>
  <p>委任状があれば代理人でも届け出られます。必要な書類は区役所で確認してください。</p>
</details>
```

### Tables
Use `<thead>` with `<th scope="col">` for the header row. A table never needs a class: the site adds a horizontal-scroll wrapper on narrow screens.
```html
<table>
  <thead><tr><th scope="col">ごみの種類</th><th scope="col">出す日</th></tr></thead>
  <tbody><tr><td>普通ごみ</td><td>週2回</td></tr></tbody>
</table>
```

### Text
- `<mark>` — marker highlight for one key phrase. Use it sparingly.
- `<strong>` — emphasis. `<u>` is allowed, but avoid it because it looks like a link.
- `style="text-align:center|right|justify|left"` — only on `p`, `h2`–`h4`, `th`, `td`.

## 4. Editorial rules (YMYL, 薬機法, 景表法)

The API reports likely violations under `warnings`, and the admin editor shows them before publishing.

- No guaranteed or exaggerated effects: 「治る」「必ず効く」「副作用はない」「日本一」「最安」.
- No product, drug or clinic recommendations, and no drug names, in health or beauty articles.
- Health information must point to official sources and end with a note to consult a doctor or pharmacist when needed.
- Cite primary sources (国・大阪府・大阪市, academic societies) in `sources`, with the date you checked them.

## 5. Minimal complete example

```html
<p class="ol-lead">リード文。</p>
<div class="ol-box ol-box--point"><p class="ol-box__title">この記事のポイント</p><ul><li>…</li></ul></div>
<h2>見出し</h2>
<p>本文。<a href="/tools/bmi">BMI計算ツール</a>も使えます。</p>
<figure class="ol-figure"><img src="https://example.com/a.jpg" alt="説明"><figcaption>キャプション</figcaption></figure>
<h3>小見出し</h3>
<ol class="ol-steps"><li>…</li></ol>
<table><thead><tr><th scope="col">項目</th><th scope="col">内容</th></tr></thead><tbody><tr><td>…</td><td>…</td></tr></tbody></table>
<details class="ol-faq"><summary>質問？</summary><p>答え。</p></details>
<p><a class="ol-linkcard" href="/blog/another-post">関連記事のタイトル</a></p>
<div class="ol-box ol-box--caution"><p>体調に不安があるときは、医療機関に相談してください。</p></div>
```
