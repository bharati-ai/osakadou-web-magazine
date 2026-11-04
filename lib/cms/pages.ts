import { cache } from "react";
import { AREAS, CHECKLIST, FEATURES, HELP_RESOURCES, HERO_SLIDES, SEASONS, THEMES } from "@/lib/content";
import { photos, type PhotoSlot } from "@/lib/photos";
import { SITE } from "@/lib/site";
import { db, json, tx } from "./db";
import { resolveLocal } from "./html";
import { pick, type L } from "@/lib/admin-i18n";

/**
 * Editable page content.
 * Each page's defaults below define the shape (fields, their order and types). Lists named in RULES can grow,
 * shrink and be reordered within their bounds; every other list keeps the designed length. Every save stores a
 * full snapshot in page_versions; restoring writes a new version.
 */
export type Img = { src: string; alt: string };
const img = (slot: PhotoSlot): Img => ({ src: `/photos/${slot}.jpg`, alt: photos[slot].alt });
const NO_IMG: Img = { src: "", alt: "" };

const SERIES_SLUGS: Record<string, string> = {
  "大阪で一人暮らしを始める前に": "osaka-hitorigurashi-junbi", "大阪の商店街さんぽ": "osaka-shotengai-sanpo", "水都大阪の川べりを歩く": "suito-osaka-kawabe",
  "大阪でかかりつけ医を見つけるには": "osaka-kakaritsukei", "大阪市のがん検診・特定健診ガイド": "osaka-gan-kenshin-tokutei-kenshin", "大阪の休日・夜間の医療相談ガイド": "osaka-kyujitsu-yakan-iryo-soudan",
  "化粧品の成分表示の読み方": "keshouhin-seibun-hyouji", "美容医療の前に確かめたい、契約と相談先": "biyou-iryou-keiyaku-soudan", "大阪の気候に合わせた、季節のスキンケア": "osaka-kikou-skincare",
  "大阪のだしと粉もんの話": "osaka-dashi-konamon", "大阪の銭湯をめぐる": "osaka-sento", "中之島のミュージアムめぐり": "nakanoshima-museum",
  "大阪市のごみ分別と出し方": "osaka-gomi-bunbetsu", "大阪で引っ越したときの手続き一覧": "osaka-hikkoshi-tetsuzuki", "南海トラフ地震に備える大阪の防災": "osaka-nankai-trough-bousai",
};

const HOME = {
  hero: {
    issue: "創刊号", issueEn: "Autumn 2026", catch: "大阪で、暮らす。", deck: "住む人の目線で、出典を明記して書くWebマガジン。",
    h1a: "大阪の暮らし・健康・美容を、", h1b: "もっと身近に。",
    slides: HERO_SLIDES.map((s) => ({ image: img(s.photo), caption: s.caption, pos: "" })),
    autoplay: true, interval: 6.5,
  },
  features: FEATURES.map((f) => ({ title: f.title, sub: f.sub, href: f.href as string, image: img(f.photo) })),
  note: {
    heading: "編集部より",
    paragraphs: [
      "オオサカ堂は、大阪に住む人のためのWebマガジンです。朝の御堂筋線、夕方の商店街、休日の大川沿い。観光ガイドには載らない、毎日の大阪の話を届けます。",
      "扱うテーマは5つ。街の暮らし、健康・医療、美容・ウェルネス、ひと・カルチャー、そして生活の実用ガイドです。制度や手続きの情報は、まず大阪市のものから扱います。",
      "健康や美容の記事で扱うのは、病院の探し方や制度の使い方などの一般的な情報です。気になる症状があるときは、医療機関に相談してください。",
      "記事は、国や大阪府・大阪市などの一次情報を確かめてから書き、出典を示します。制度や連絡先は変わることがあるため、見直した日付も記します。",
    ],
    signature: "2026年10月　オオサカ堂編集部",
    photo1: img("minoo"), caption1: "紅葉の箕面（箕面市）", photo2: img("alleyCat"),
  },
  calendar: {
    title: "大阪の天気と季節カレンダー", subhead: "季節の行事と、体調メモ",
    footnote: "日程は年ごとに変わるため、主催者の公式情報をご確認ください。気温・降水の平年値は気象庁（大阪）によります。",
    seasons: SEASONS.map((s) => ({ months: s.months, image: img(s.photo), memo: s.memo, events: s.events.map((e) => ({ month: e.month, title: e.title, note: e.note, image: e.photo ? img(e.photo) : NO_IMG })) })),
  },
  areas: {
    title: "大阪エリアガイド", lead: "キタとミナミだけやない。オオサカ堂編集部が、6つのエリアの横顔を主な駅とあわせて紹介します。",
    items: AREAS.map((a) => ({ kanji: a.kanji, name: a.name, ward: a.ward, image: img(a.photo), desc: a.desc, day: a.day, stations: a.stations })),
  },
  help: {
    tag: "保存版", title: "体調がすぐれないときの相談先", lead: "救急車を呼ぶか迷うときや、休日・夜間に困ったときの、大阪府・大阪市の公的な相談窓口です。",
    hashNote: "「#」から始まる番号は、iPhoneやダイヤル回線・IP電話などからかけられないことがあります。そのときは06から始まる番号へ。",
    disclaimer: "この一覧は一般的な情報で、医療上の助言ではありません。内容が変わることがあるため、受診の前に各機関の公式情報をご確認ください。", checked: "2026年10月30日",
    resources: HELP_RESOURCES.map((r) => ({ title: r.title, meta: r.meta, when: r.when })),
  },
  tools: { title: "大阪の暮らしに、無料ツール", lead: "からだの計算から、今日の大阪の肌予報、近くの施設マップまで。全{n}種類、登録なしで使えます。" },
  checklist: {
    tag: "保存版", title: "大阪暮らしスタンプカード",
    lead: "大阪に引っ越してきた人も、長く住んでいる人も。防災・医療・手続きの{n}項目です（制度は大阪市の場合）。チェックの記録はこの端末の中にだけ保存されます。",
    done: "{n}個すべて、そろいました。おつかれさまでした。", checked: "2026年10月30日",
    groups: CHECKLIST.map((g) => ({ group: g.group, items: g.items.map((i) => ({ id: i.id as string, label: i.label, note: i.note })) })),
  },
  themes: {
    title: "5つのテーマと、主な記事", lead: "5つのテーマで、大阪の暮らしに役立つ読みものを公開しています。", seriesLabel: "このテーマの記事",
    items: THEMES.map((t) => ({ title: t.title, en: t.en, image: img(t.photo), desc: t.desc, series: t.series.map((s) => ({ title: s, href: `/blog/${SERIES_SLUGS[s] ?? ""}` })) })),
  },
  policy: {
    title: "編集方針",
    blocks: [
      { title: "記事のつくり方", body: "記事は、国・大阪府・大阪市などの公的機関や専門団体が公開する一次情報を確認して作成し、参照した情報源を明記します。掲載後も定期的に内容を見直し、誤りがあれば訂正して更新日を記録します。" },
      { title: "健康・医療情報の取り扱い", body: "健康・医療・美容に関する記事やツールは一般的な情報の提供を目的としており、診断や治療に代わるものではなく、特定の商品やサービスをすすめるものでもありません。症状や治療については、医療機関や医師・薬剤師にご相談ください。" },
      { title: "広告・PR表記について", body: "当サイトでは現在、広告や広告を目的とした記事を掲載していません。今後、商品・サービスに触れる場合は、その記事やリンクのすぐ近くに「PR」と分かりやすく表示します。健康・医療・美容の記事の本文中で、特定の商品をすすめたり、商品ページへ案内したりすることはありません。" },
      { title: "プライバシー・外部送信について", body: "アクセス解析ツールは使用していません。天気は当サイトのサーバーが Open-Meteo と気象庁から取得しており、閲覧者の情報は送りません。施設マップの地図画像は OpenStreetMap財団（英国）のサーバーから読みこむため、閲覧者のIPアドレスやブラウザの情報、表示している地図の範囲がそのサーバーに送られます。「現在地」を選んだときだけ、約110m単位に丸めた位置が当サイトのサーバーに送られ（サーバーのアクセス記録に一時的に残ることがあります）、当サイトのサーバーはその位置と施設の種類だけを OpenStreetMap のデータ検索サービス（Overpass API、ドイツ）に送ります。チェックリストなどの記録は、この端末の中にだけ保存されます。" },
    ],
    dataTitle: "データの出典", dataBody: "気象データ：Open-Meteo（CC BY 4.0）、気象庁。地図データ：© OpenStreetMap contributors。",
  },
};

const SITE_COPY = {
  headerSub: "大阪の暮らしマガジン", footerTagline: "大阪で暮らす人のためのWebマガジン。",
};

const TOOLS_PAGE = {
  title: "無料ツール", lead: "からだの計算から、大阪の天気に合わせた肌予報、近くの施設マップまで。登録なしで、すぐに使えます。", image: img("skyline"),
  metaDescription: "BMIや基礎代謝、消費カロリーの計算から、大阪の肌予報、近くの施設マップ、大阪弁変換まで。大阪の暮らしに役立つ無料ツール集です。",
};

const ABOUT_PAGE = {
  title: "オオサカ堂について",
  lead: "大阪で暮らす人のための、出典を明記して書くWebマガジンです。",
  metaDescription: "オオサカ堂は、大阪で暮らす人のためのWebマガジンです。扱うテーマ、記事のつくり方、訂正の方針、プライバシーについてご紹介します。",
  introTitle: "オオサカ堂とは",
  paragraphs: [
    "オオサカ堂は、大阪に住む人の毎日に役立つ情報を届けるWebマガジンです。朝の通勤、近所の商店街、休日の川べり。観光ガイドには載らない、暮らしの大阪を取り上げます。",
    "記事は、国・大阪府・大阪市などの公的機関や専門団体が公開している一次情報を確かめてから書き、参照した情報源を記事の終わりに示します。制度や連絡先は変わることがあるため、確認した日付も記しています。",
    "天気と季節のカレンダー、からだの計算や暮らしの手続きに使える無料ツールも、登録なしで使えるようにしています。",
  ],
  themesTitle: "扱うテーマ",
  correctionsTitle: "訂正の方針",
  corrections: "記事やツールの内容に誤りが見つかった場合は、確認のうえ速やかに訂正し、更新した日付を記事に記します。制度の変更などで内容が古くなった記事も、順次見直します。",
};

/**
 * Editor rules, keyed by path with "*" for list indexes. On a list: min/max length (it can then be added to,
 * removed from and reordered; min = max allows reordering only). On a number: bounds and step. On a string:
 * `options` makes it a choice ([value, 日本語, English]). Keys named "id" are hidden and generated for new items.
 */
export type FieldRule = { min?: number; max?: number; step?: number; options?: [string, string, string][] };
export type Rules = Record<string, FieldRule>;

const RULES: Record<string, Rules> = {
  home: {
    "hero.slides": { min: 1, max: 12 },
    "hero.slides.*.pos": { options: [["", "自動（写真ごとの設定）", "Auto (per photo)"], ["top", "上を優先", "Keep the top"], ["center", "中央", "Center"], ["bottom", "下を優先", "Keep the bottom"], ["left", "左を優先", "Keep the left"], ["right", "右を優先", "Keep the right"]] },
    "hero.interval": { min: 3, max: 20, step: 0.5 },
    features: { min: 5, max: 5 },
    "note.paragraphs": { min: 1, max: 10 },
    "calendar.seasons.*.events": { min: 0, max: 8 },
    "areas.items": { min: 1, max: 12 },
    "checklist.groups": { min: 1, max: 6 },
    "checklist.groups.*.items": { min: 1, max: 12 },
    "themes.items.*.series": { min: 0, max: 8 },
    "policy.blocks": { min: 1, max: 12 },
  },
  about: { paragraphs: { min: 1, max: 10 } },
};

export const patternOf = (path: string) => path.replace(/\.\d+(?=\.|$)/g, ".*").replace(/^\d+(?=\.|$)/, "*");

/** An empty copy of a list item: blank text and images, same numbers/booleans, nested lists with `min` blank items. */
export function blank(v: unknown): unknown {
  if (typeof v === "string") return "";
  if (isImg(v)) return { src: "", alt: "" };
  if (Array.isArray(v)) return v.length && typeof v[0] !== "string" ? [blank(v[0])] : [];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  return v;
}

/** Rules plus a blank template for each editable list, for the editor (serializable). */
export function pageSchema(page: PageId) {
  const rules = RULES[page] ?? {};
  const templates: Record<string, unknown> = {};
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) {
      const pat = patternOf(path);
      if (rules[pat] && !(pat in templates) && v.length) templates[pat] = blank(v[0]);
      v.forEach((x, i) => walk(x, `${path}.${i}`));
    } else if (v && typeof v === "object" && !isImg(v)) for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(PAGES[page].defaults, "");
  return { rules, templates };
}

export const PAGES = {
  home: { label: "トップページ", en: "Home page", path: "/", defaults: HOME },
  site: { label: "サイト共通（ヘッダー・フッター）", en: "Site-wide (header & footer)", path: "/", defaults: SITE_COPY },
  tools: { label: "無料ツール一覧", en: "Free tools page", path: "/tools", defaults: TOOLS_PAGE },
  about: { label: "オオサカ堂について", en: "About page", path: "/about", defaults: ABOUT_PAGE },
};
export type PageId = keyof typeof PAGES;
export type HomeContent = typeof HOME;
export type SiteContent = typeof SITE_COPY;
export type ToolsPageContent = typeof TOOLS_PAGE;
export type AboutContent = typeof ABOUT_PAGE;
type ContentOf<P extends PageId> = (typeof PAGES)[P]["defaults"];

export const isPageId = (s: string): s is PageId => s in PAGES;
const isImg = (v: unknown): v is Img => !!v && typeof v === "object" && "src" in v && "alt" in v && Object.keys(v).length === 2;

/**
 * Stored values over defaults, keeping the defaults' shape: unknown keys are ignored, choices and numbers are
 * checked, lists with a rule take the stored length (clamped to min/max), other lists keep the designed length.
 */
export function mergeShape<T>(def: T, val: unknown, rules: Rules = {}, path = ""): T {
  const r = rules[patternOf(path)];
  const at = (k: string | number) => (path ? `${path}.${k}` : String(k));
  if (typeof def === "string") return (typeof val === "string" && (!r?.options || r.options.some(([o]) => o === val)) ? val : def) as T;
  if (typeof def === "number") return (typeof val === "number" && Number.isFinite(val) ? Math.min(r?.max ?? Infinity, Math.max(r?.min ?? -Infinity, val)) : def) as T;
  if (typeof def === "boolean") return (typeof val === "boolean" ? val : def) as T;
  if (isImg(def)) return (isImg(val) && typeof val.src === "string" && typeof val.alt === "string" ? { src: val.src, alt: val.alt } : def) as T;
  if (Array.isArray(def)) {
    if (!r || !Array.isArray(val) || !def.length) return def.map((d, i) => mergeShape(d, Array.isArray(val) ? val[i] : undefined, rules, at(i))) as T;
    const n = Math.min(r.max ?? val.length, Math.max(r.min ?? 0, val.length));
    // missing fields fall back to the designed item at the same place (older saves), or to a blank item
    const tpl = blank(def[0]);
    return Array.from({ length: n }, (_, i) => mergeShape(def[i] ?? tpl, val[i], rules, at(i))) as T;
  }
  if (def && typeof def === "object") {
    const v = (val && typeof val === "object" ? val : {}) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(def).map(([k, d]) => [k, mergeShape(d, v[k], rules, at(k))])) as T;
  }
  return def;
}

type Version = { page: string; version: number; data: string; author: string; note: string; created_at: string };

function latest(page: PageId) {
  return db().prepare("SELECT * FROM page_versions WHERE page = ? ORDER BY version DESC LIMIT 1").get(page) as Version | undefined;
}

/** Current content of a page (defaults until someone edits it). Cached per request. */
export const getPage = cache(<P extends PageId>(page: P): ContentOf<P> => {
  const row = latest(page);
  return mergeShape(PAGES[page].defaults, row ? json(row.data, {}) : {}, RULES[page]) as ContentOf<P>;
});

/** Unsaved editor content for the page-builder canvas (one draft per user and page). */
export function savePageDraft(userId: number, page: PageId, data: unknown) {
  db().prepare("INSERT INTO page_drafts (user_id, page, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, page) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
    .run(userId, page, JSON.stringify(data), new Date().toISOString());
}
export function pageDraft<P extends PageId>(userId: number, page: P): ContentOf<P> | undefined {
  const row = db().prepare("SELECT data FROM page_drafts WHERE user_id = ? AND page = ?").get(userId, page) as { data: string } | undefined;
  return row ? (mergeShape(PAGES[page].defaults, json(row.data, {}), RULES[page]) as ContentOf<P>) : undefined;
}
export const dropPageDraft = (userId: number, page: PageId) => db().prepare("DELETE FROM page_drafts WHERE user_id = ? AND page = ?").run(userId, page);

/** Validate a submitted page: every string ≤ 2000 chars, images must exist on this server, links internal or https. */
export function validatePage(page: PageId, data: unknown, L: L = pick("ja")) {
  const merged = mergeShape(PAGES[page].defaults, data, RULES[page]);
  const errs: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === "string") {
      if (v.length > 2000) errs.push(`${path}: ${L("2000文字までです", "max 2,000 characters")}`);
      if (path.endsWith(".href") && v && !/^(\/(?!\/)|#[\w-]+$|https:\/\/)/.test(v)) errs.push(`${path}: ${L("/ から始まるサイト内のパス、#見出し、または https:// のURLにしてください", "use a site path starting with /, a #section, or an https:// URL")}`);
    } else if (isImg(v)) {
      if (v.src && !resolveLocal(v.src)) errs.push(`${path}: ${L("画像が見つかりません（メディアから選び直してください）", "image not found (pick it again from Media)")}`);
      if (v.alt.length > 200) errs.push(`${path}: ${L("代替テキストは200文字までです", "alt text max 200 characters")}`);
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i + 1}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(merged, "");
  return { merged, errs };
}

export function savePage(page: PageId, data: unknown, author: string, note: string) {
  const d = db();
  return tx(d, () => {
    const n = (latest(page)?.version ?? 0) + 1;
    d.prepare("INSERT INTO page_versions (page, version, data, author, note) VALUES (?, ?, ?, ?, ?)").run(page, n, JSON.stringify(data), author, note);
    return n;
  });
}

export function pageVersions(page: PageId) {
  return db().prepare("SELECT * FROM page_versions WHERE page = ? ORDER BY version DESC LIMIT 100").all(page) as Version[];
}

export function pageVersion(page: PageId, version: number) {
  return db().prepare("SELECT * FROM page_versions WHERE page = ? AND version = ?").get(page, version) as Version | undefined;
}

/** "path: value" pairs, used to list what changed between two versions. */
export function flatten(v: unknown, path = "", out: Record<string, string> = {}) {
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[path] = String(v);
  else if (isImg(v)) out[path] = `${v.src}｜${v.alt}`;
  else if (Array.isArray(v)) v.forEach((x, i) => flatten(x, `${path}[${i + 1}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) flatten(x, path ? `${path}.${k}` : k, out);
  return out;
}

export function diffPaths(page: PageId, a: string, b: string | undefined) {
  const A = flatten(mergeShape(PAGES[page].defaults, json(a, {}), RULES[page]));
  const B = flatten(mergeShape(PAGES[page].defaults, json(b ?? "{}", {}), RULES[page]));
  // a whole list item added or removed shows once, not field by field
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].filter((k) => A[k] !== B[k]);
  return [...new Set(keys.map((k) => (k in A && k in B ? k : k.replace(/(\[\d+\])[^[]*$/, "$1"))))];
}

export { fill } from "./fill";

export const getHome = () => getPage("home") as HomeContent;
export const getSiteCopy = () => getPage("site") as SiteContent;
export const getToolsPage = () => getPage("tools") as ToolsPageContent;
export const getAboutPage = () => getPage("about") as AboutContent;
