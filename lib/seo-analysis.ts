// Yoast-style content checks for Japanese articles. Client-safe (the editor runs it live; the SEO audit reuses it).
export type Check = { id: string; status: "good" | "ok" | "bad"; ja: string; en: string };
export type AnalysisInput = {
  title: string; seoTitle: string; seoDescription: string; excerpt: string; slug: string; html: string;
  keyphrase: string; coverSrc: string | null; coverAlt: string; sourcesCount: number; ymyl: boolean; brand: string;
};

const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;/g, " ").replace(/\s+/g, " ").trim();
/** All space-separated words of the keyphrase appear (any order), case-insensitive. */
const has = (text: string, kp: string) => {
  const words = kp.toLowerCase().split(/[\s　]+/).filter(Boolean);
  const t = text.toLowerCase();
  return words.length > 0 && words.every((w) => t.includes(w));
};
const count = (text: string, w: string) => (w ? text.toLowerCase().split(w.toLowerCase()).length - 1 : 0);

export function analyze(i: AnalysisInput): { checks: Check[]; score: number } {
  const c: Check[] = [];
  const add = (id: string, status: Check["status"], ja: string, en: string) => c.push({ id, status, ja, en });
  const text = strip(i.html);
  const len = text.length;
  const shownTitle = `${i.seoTitle || i.title}｜${i.brand}`;
  const desc = i.seoDescription || i.excerpt;
  const firstP = strip(/<p[^>]*>([\s\S]*?)<\/p>/.exec(i.html)?.[1] ?? "");
  const headings = [...i.html.matchAll(/<h([234])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => strip(m[2]));
  const h2 = (i.html.match(/<h2[\s>]/g) ?? []).length;
  const links = [...i.html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const internal = links.filter((h) => h.startsWith("/") || h.startsWith("https://osakadou.live")).length;
  const external = links.length - internal;
  const imgs = [...i.html.matchAll(/<img\s[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/alt="[^"]+"/.test(t)).length;
  const kp = i.keyphrase.trim();

  if (!kp) add("kp", "bad", "フォーカスキーフレーズが未設定です", "No focus keyphrase set");
  else {
    const inTitle = has(i.seoTitle || i.title, kp);
    const atStart = (i.seoTitle || i.title).toLowerCase().indexOf(kp.split(/[\s　]+/)[0].toLowerCase()) <= 2;
    add("kp-title", inTitle ? (atStart ? "good" : "ok") : "bad",
      inTitle ? (atStart ? "キーフレーズがタイトルの冒頭にあります" : "キーフレーズはタイトルにありますが、冒頭に近いほど有利です") : "SEOタイトルにキーフレーズがありません",
      inTitle ? (atStart ? "Keyphrase starts the title" : "Keyphrase is in the title; closer to the start is better") : "Keyphrase missing from the SEO title");
    add("kp-desc", has(desc, kp) ? "good" : "bad", has(desc, kp) ? "メタディスクリプションにキーフレーズがあります" : "メタディスクリプションにキーフレーズがありません", has(desc, kp) ? "Keyphrase in meta description" : "Keyphrase missing from the meta description");
    add("kp-intro", has(firstP, kp) ? "good" : "ok", has(firstP, kp) ? "冒頭の段落にキーフレーズがあります" : "冒頭の段落（リード）にキーフレーズを入れましょう", has(firstP, kp) ? "Keyphrase in the first paragraph" : "Use the keyphrase in the first paragraph");
    const inHead = headings.some((h) => has(h, kp));
    add("kp-heading", inHead ? "good" : "ok", inHead ? "見出しにキーフレーズがあります" : "見出し（h2/h3）のどれかにキーフレーズを使いましょう", inHead ? "Keyphrase used in a heading" : "Use the keyphrase in at least one subheading");
    const main = kp.split(/[\s　]+/)[0];
    const n = count(text, main);
    const density = len ? (n * main.length) / len : 0;
    add("kp-density", n >= 3 && density <= 0.03 ? "good" : n >= 1 && density <= 0.05 ? "ok" : "bad",
      density > 0.05 ? `キーフレーズの使いすぎです（${n}回）` : `本文中のキーフレーズ：${n}回`,
      density > 0.05 ? `Keyphrase overused (${n} times)` : `Keyphrase appears ${n} times in the body`);
  }
  const tl = [...shownTitle].length;
  add("title-len", tl <= 34 ? "good" : tl <= 42 ? "ok" : "bad", `検索結果のタイトル：${tl}文字（目安34文字以内）`, `SERP title: ${tl} characters (aim for ≤34)`);
  const dl = [...desc].length;
  add("desc-len", !i.seoDescription ? "ok" : dl >= 80 && dl <= 125 ? "good" : dl >= 50 && dl <= 150 ? "ok" : "bad",
    !i.seoDescription ? "メタディスクリプションが未設定です（概要を使います）" : `メタディスクリプション：${dl}文字（目安80〜120文字）`,
    !i.seoDescription ? "No meta description (the excerpt is used)" : `Meta description: ${dl} characters (aim for 80–120)`);
  add("length", len >= 2500 ? "good" : len >= 1200 ? "ok" : "bad", `本文：${len.toLocaleString()}文字（目安2,500文字以上）`, `Body: ${len.toLocaleString()} characters (aim for 2,500+)`);
  add("headings", h2 >= 2 ? "good" : h2 === 1 ? "ok" : "bad", h2 >= 2 ? `見出し2が${h2}個あります` : "見出し2で内容を区切りましょう", h2 >= 2 ? `${h2} H2 headings` : "Break the text up with H2 headings");
  add("internal", internal >= 2 ? "good" : internal === 1 ? "ok" : "bad", `サイト内リンク：${internal}件（目安2件以上）`, `Internal links: ${internal} (aim for 2+)`);
  const refs = i.sourcesCount + external;
  add("sources", refs >= 2 ? "good" : refs === 1 ? "ok" : i.ymyl ? "bad" : "ok", `参考・出典と外部リンク：${refs}件${i.ymyl ? "（健康・美容の記事は公的な出典が必須です）" : ""}`, `Sources and outbound links: ${refs}${i.ymyl ? " (health/beauty posts need official sources)" : ""}`);
  add("images", !i.coverSrc ? "bad" : noAlt || !i.coverAlt ? "ok" : "good",
    !i.coverSrc ? "アイキャッチ画像がありません" : noAlt || !i.coverAlt ? `代替テキストのない画像があります（${noAlt + (i.coverAlt ? 0 : 1)}枚）` : "画像はすべて代替テキストがあります",
    !i.coverSrc ? "No featured image" : noAlt || !i.coverAlt ? `${noAlt + (i.coverAlt ? 0 : 1)} image(s) without alt text` : "All images have alt text");
  add("slug", /^[a-z0-9-]{3,60}$/.test(i.slug) ? "good" : i.slug ? "ok" : "bad", /^[a-z0-9-]{3,60}$/.test(i.slug) ? "スラッグは短く読みやすい形です" : "スラッグは60文字以内の英小文字・数字・ハイフンに", /^[a-z0-9-]{3,60}$/.test(i.slug) ? "Slug is short and readable" : "Keep the slug ≤60 lowercase letters, digits, hyphens");
  const sentences = text.split(/[。！？!?]/).map((x) => x.trim()).filter(Boolean);
  const avg = sentences.length ? Math.round(sentences.reduce((n, x) => n + x.length, 0) / sentences.length) : 0;
  add("readability", avg <= 55 ? "good" : avg <= 75 ? "ok" : "bad", `1文の平均：${avg}文字（目安55文字以内）`, `Average sentence: ${avg} characters (aim for ≤55)`);
  const score = Math.round((c.reduce((n, x) => n + (x.status === "good" ? 1 : x.status === "ok" ? 0.5 : 0), 0) / c.length) * 100);
  return { checks: c, score };
}
