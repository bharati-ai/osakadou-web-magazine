import type { Metadata } from "next";
import { requireUser } from "@/lib/cms/auth";
import { ALLOWED_CLASSES, ALLOWED_TAGS, processLocalHtml } from "@/lib/cms/html";
import { getL } from "@/lib/cms/lang";
import { renderArticle } from "@/lib/cms/render";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("スタイルガイド", "Style guide") };
}

// [ja title, en title, sample HTML]: the sample HTML is article content and stays Japanese.
const SAMPLES: [string, string, string][] = [
  ["リード文 p.ol-lead", "Lead p.ol-lead", `<p class="ol-lead">記事の冒頭に置く要約です。読者が「この記事で何がわかるか」を2〜3文で伝えます。</p>`],
  ["見出し h2 / h3 / h4", "Headings h2 / h3 / h4", `<h2>大きな見出し（h2）</h2><p>本文の段落です。<strong>強調</strong>、<mark>マーカー</mark>、<a href="/tools/bmi">サイト内リンク</a>、<a href="https://www.city.osaka.lg.jp/">外部リンク</a>。</p><h3>中見出し（h3）</h3><p>段落。</p><h4>小見出し（h4）</h4><p>段落。</p>`],
  ["囲み aside.ol-box（4種類）", "Boxes aside.ol-box (4 variants)", `<div class="ol-box ol-box--point"><p class="ol-box__title">この記事のポイント</p><ul><li>要点1</li><li>要点2</li></ul></div><div class="ol-box ol-box--note"><p>補足のメモです（タイトルなし＝「メモ」）。</p></div><div class="ol-box ol-box--caution"><p>体調に不安があるときは、医療機関に相談してください。</p></div><div class="ol-box ol-box--info"><p class="ol-box__title">問い合わせ先</p><p>大阪市総合コールセンター（なにわコール）</p></div>`],
  ["手順 ol.ol-steps", "Steps ol.ol-steps", `<ol class="ol-steps"><li><strong>住む区を決める</strong>：通勤の路線から候補を絞ります。</li><li><strong>転入届を出す</strong>：住み始めてから14日以内に。</li><li><strong>ごみの収集日を確かめる</strong></li></ol>`],
  ["チェックリスト ul.ol-check", "Checklist ul.ol-check", `<ul class="ol-check"><li>マイナンバーカード</li><li>転出証明書</li><li>印鑑（必要な手続きのみ）</li></ul>`],
  ["表 table（自動で横スクロール対応）", "Table (scrolls horizontally automatically)", `<table><thead><tr><th scope="col">区分</th><th scope="col">出す日</th><th scope="col">ポイント</th></tr></thead><tbody><tr><td>普通ごみ</td><td>週2回</td><td>中身の見える袋で</td></tr><tr><td>資源ごみ</td><td>週1回</td><td>中身を空にして</td></tr></tbody></table>`],
  ["画像 figure.ol-figure / --narrow", "Image figure.ol-figure / --narrow", `<figure class="ol-figure"><img src="/photos/tenmaArcade.jpg" alt="天神橋筋商店街の入口"><figcaption>天神橋筋商店街（北区）</figcaption></figure><figure class="ol-figure ol-figure--narrow"><img src="/photos/water.jpg" alt="テーブルに置かれた一杯の水"><figcaption>縦長・小さめの画像は --narrow</figcaption></figure>`],
  ["Q&A details.ol-faq", "Q&A details.ol-faq", `<details class="ol-faq"><summary>転入届は代理人でも出せますか？</summary><p>委任状があれば代理人でも届け出られます。必要な書類は区役所で確認してください。</p></details>`],
  ["関連記事カード a.ol-linkcard", "Related post card a.ol-linkcard", `<p><a class="ol-linkcard" href="/blog/osaka-gomi-bunbetsu">大阪市のごみ分別と出し方</a></p>`],
  ["引用・区切り線・コード", "Quote, divider, code", `<blockquote><p>引用文。出典は本文か「参考・出典」に書きます。</p></blockquote><hr><p>コード：<code>ol-box--point</code></p>`],
  ["参考リスト ul.ol-sources", "Sources ul.ol-sources", `<ul class="ol-sources"><li><a href="https://www.city.osaka.lg.jp/">大阪市「転入の手続き」</a>（2026年10月31日確認）</li></ul>`],
];

export default async function StyleGuide() {
  await requireUser();
  const L = await getL();
  return (
    <div className="grid max-w-[1100px] gap-8">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("スタイルガイド", "Style guide")}</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          {L("記事本文で使えるHTMLとクラスの一覧です。エディタのボタンはすべてこの形で保存され、API で投稿するHTMLも同じルールで処理されます（詳しくは ", "The HTML and classes allowed in post bodies. Every editor button saves in this form, and HTML posted through the API follows the same rules (see ")}<code>docs/cms/HTML-STYLE-GUIDE.md</code>{L("）。下の見本は、実際の保存処理を通した結果をそのまま表示しています。", "). The samples below show the output of the real save pipeline.")}
        </p>
      </div>
      <section className="rounded-[var(--radius-card)] border border-line bg-card p-5 text-sm">
        <h2 className="font-maru font-bold">{L("使えるタグとクラス", "Allowed tags and classes")}</h2>
        <p className="mt-2 font-mono text-xs leading-relaxed">{ALLOWED_TAGS.join(" ")}</p>
        <ul className="mt-3 grid gap-1 font-mono text-xs">
          {Object.entries(ALLOWED_CLASSES).map(([tag, cls]) => <li key={tag}><b>{tag === "aside" ? "div / aside" : tag}</b>: {cls.join(" ")}</li>)}
        </ul>
      </section>
      {SAMPLES.map(([ja, en, html]) => {
        const out = processLocalHtml(html).html;
        return (
          <section key={ja} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[var(--radius-card)] border border-line bg-paper p-5">
              <h2 className="mb-3 text-xs font-bold text-ink-2">{L(ja, en)}</h2>
              <div className="ol-article" dangerouslySetInnerHTML={{ __html: renderArticle(out) }} />
            </div>
            <pre className="overflow-x-auto rounded-[var(--radius-card)] bg-night p-4 text-[12px] leading-relaxed text-on-night"><code>{html.replace(/></g, ">\n<")}</code></pre>
          </section>
        );
      })}
    </div>
  );
}
