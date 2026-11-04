// [日本語, English] labels for page-content paths, per page ("*" = any list index). Unlisted keys fall back to the key name.
type Labels = Record<string, [string, string]>;

const HOME: Labels = {
  hero: ["ヒーロー（ページ最上部）", "Hero (top of page)"], "hero.issue": ["号の表記", "Issue label"], "hero.issueEn": ["号の表記（英字）", "Issue label (Latin)"],
  "hero.catch": ["キャッチ（朱色）", "Catchphrase (red)"], "hero.deck": ["サブコピー", "Deck"], "hero.h1a": ["縦書きコピー（1行目）", "Vertical copy (line 1)"],
  "hero.h1b": ["縦書きコピー（2行目・朱色）", "Vertical copy (line 2, red)"], "hero.slides": ["スライド（カルーセル）", "Slides (carousel)"], "hero.slides.*": ["スライド", "Slide"],
  "hero.autoplay": ["自動再生する", "Autoplay"], "hero.interval": ["1枚あたりの表示秒数", "Seconds per slide"], "hero.slides.*.pos": ["写真の見せる位置（切り抜き）", "Crop focus"],
  "hero.slides.*.image": ["写真", "Photo"], "hero.slides.*.caption": ["キャプション", "Caption"],
  features: ["この号の特集（写真タイル5枚・並べ替え可）", "Features (5 photo tiles, reorderable)"], "features.*": ["タイル", "Tile"], "features.*.href": ["リンク先（/パス・#見出し・https://）", "Link (/path, #section or https://)"], "features.*.title": ["タイトル", "Title"], "features.*.sub": ["サブタイトル", "Subtitle"], "features.*.image": ["写真", "Photo"],
  note: ["編集部より", "Editor's note"], "note.heading": ["見出し", "Heading"], "note.paragraphs": ["本文の段落", "Paragraphs"], "note.paragraphs.*": ["段落", "Paragraph"],
  "note.signature": ["署名", "Signature"], "note.photo1": ["写真（大）", "Large photo"], "note.caption1": ["写真（大）のキャプション", "Large photo caption"], "note.photo2": ["写真（小）", "Small photo"],
  calendar: ["天気と季節カレンダー", "Weather & seasonal calendar"], "calendar.title": ["見出し", "Heading"], "calendar.subhead": ["小見出し", "Subheading"], "calendar.footnote": ["注記", "Footnote"],
  "calendar.seasons": ["季節（春・夏・秋・冬）", "Seasons"], "calendar.seasons.*": ["季節", "Season"], "calendar.seasons.*.months": ["月の範囲", "Months"], "calendar.seasons.*.image": ["季節の写真", "Season photo"],
  "calendar.seasons.*.memo": ["体調メモ", "Health memo"], "calendar.seasons.*.events": ["行事", "Events"], "calendar.seasons.*.events.*": ["行事", "Event"],
  "calendar.seasons.*.events.*.month": ["月（例：7月）", "Month (e.g. 7月)"], "calendar.seasons.*.events.*.title": ["行事名", "Event name"], "calendar.seasons.*.events.*.note": ["補足", "Note"],
  "calendar.seasons.*.events.*.image": ["写真（任意）", "Photo (optional)"],
  areas: ["エリアガイド", "Area guide"], "areas.title": ["見出し", "Heading"], "areas.lead": ["リード文", "Lead"], "areas.items": ["エリア", "Areas"], "areas.items.*": ["エリア", "Area"],
  "areas.items.*.kanji": ["漢字1文字", "Kanji badge"], "areas.items.*.name": ["エリア名", "Area name"], "areas.items.*.ward": ["区・地域", "Ward"], "areas.items.*.image": ["写真", "Photo"],
  "areas.items.*.desc": ["説明", "Description"], "areas.items.*.day": ["こんな日に", "Good for…"], "areas.items.*.stations": ["主な駅", "Main stations"],
  help: ["体調がすぐれないときの相談先", "Help lines"], "help.tag": ["ラベル", "Badge"], "help.title": ["見出し", "Heading"], "help.lead": ["リード文", "Lead"],
  "help.hashNote": ["#番号の注意書き", "Note on # numbers"], "help.disclaimer": ["注意書き", "Disclaimer"], "help.checked": ["最終確認日", "Last checked"],
  "help.resources": ["相談窓口カード（電話番号・リンクは固定）", "Help cards (numbers and links are fixed)"], "help.resources.*": ["窓口", "Help card"],
  "help.resources.*.title": ["名称", "Name"], "help.resources.*.meta": ["補足（つながらないとき等）", "Detail line"], "help.resources.*.when": ["こんなときに", "When to use"],
  tools: ["無料ツールの紹介", "Free tools section"], "tools.title": ["見出し", "Heading"], "tools.lead": ["リード文（{n} はツールの数）", "Lead ({n} = number of tools)"],
  checklist: ["スタンプカード", "Stamp card"], "checklist.tag": ["ラベル", "Badge"], "checklist.title": ["見出し", "Heading"], "checklist.lead": ["リード文（{n} は項目数）", "Lead ({n} = number of items)"],
  "checklist.done": ["全部そろったときのメッセージ（{n} は項目数）", "All-done message ({n} = number of items)"], "checklist.checked": ["最終確認日", "Last checked"], "checklist.groups": ["グループ", "Groups"], "checklist.groups.*": ["グループ", "Group"],
  "checklist.groups.*.group": ["グループ名", "Group name"], "checklist.groups.*.items": ["項目", "Items"], "checklist.groups.*.items.*": ["項目", "Item"],
  "checklist.groups.*.items.*.label": ["項目", "Item"], "checklist.groups.*.items.*.note": ["補足", "Note"],
  themes: ["5つのテーマと主な記事", "Five themes"], "themes.title": ["見出し", "Heading"], "themes.lead": ["リード文", "Lead"], "themes.seriesLabel": ["記事リストのラベル", "Article list label"],
  "themes.items": ["テーマ", "Themes"], "themes.items.*": ["テーマ", "Theme"], "themes.items.*.title": ["テーマ名", "Theme name"], "themes.items.*.en": ["英語名", "English name"],
  "themes.items.*.image": ["写真", "Photo"], "themes.items.*.desc": ["説明", "Description"], "themes.items.*.series": ["このテーマの記事", "Articles"], "themes.items.*.series.*": ["記事", "Article link"],
  "themes.items.*.series.*.title": ["記事タイトル（表示名）", "Link text"], "themes.items.*.series.*.href": ["リンク先（/blog/スラッグ）", "Link (/blog/slug)"],
  policy: ["編集方針", "Editorial policy"], "policy.title": ["見出し", "Heading"], "policy.blocks": ["ブロック", "Blocks"], "policy.blocks.*": ["ブロック", "Block"],
  "policy.blocks.*.title": ["小見出し", "Heading"], "policy.blocks.*.body": ["本文", "Text"], "policy.dataTitle": ["データの出典（見出し）", "Data sources (heading)"], "policy.dataBody": ["データの出典（本文）", "Data sources (text)"],
};

const LABELS: Record<string, Labels> = {
  home: HOME,
  site: { headerSub: ["ヘッダーのロゴ下の文字", "Header tagline under the logo"], footerTagline: ["フッターの紹介文", "Footer tagline"] },
  tools: { title: ["見出し（H1）", "Heading (H1)"], lead: ["リード文", "Lead"], image: ["ヘッダー写真", "Header photo"], metaDescription: ["検索結果の説明文", "Meta description"] },
  about: {
    title: ["見出し（H1）", "Heading (H1)"], lead: ["リード文", "Lead"], metaDescription: ["検索結果の説明文", "Meta description"], introTitle: ["見出し（紹介）", "Intro heading"],
    paragraphs: ["紹介文の段落", "Intro paragraphs"], "paragraphs.*": ["段落", "Paragraph"], themesTitle: ["見出し（テーマ）", "Themes heading"],
    correctionsTitle: ["見出し（訂正の方針）", "Corrections heading"], corrections: ["訂正の方針", "Corrections policy"],
  },
};

/** Label for "areas.items.2.desc" on page "home", in the admin language. */
export function fieldLabel(page: string, path: string, en: boolean) {
  const key = path.replace(/\.\d+(?=\.|$)/g, ".*");
  const l = LABELS[page]?.[key];
  const idx = /\.(\d+)$/.exec(path)?.[1];
  const base = l ? l[en ? 1 : 0] : (path.split(".").pop() ?? path);
  return idx !== undefined && !l?.[0].includes("（") && /\.\d+$/.test(path) ? `${base} ${Number(idx) + 1}` : base;
}

/** Long-form fields get a textarea. */
export const isLong = (path: string, value: string) =>
  value.length > 46 || /(desc|lead|memo|body|paragraphs\.\d+|description|when|disclaimer|hashNote|footnote|note|corrections|Description)$/.test(path);

/** Breadcrumb labels for a path, skipping list containers: "areas.items.2.desc" → [エリアガイド, エリア 3, 説明]. */
export function crumbs(page: string, path: string, en: boolean) {
  const s = path.split(".");
  return s.flatMap((_, i) => (/^\d+$/.test(s[i + 1] ?? "") ? [] : [fieldLabel(page, s.slice(0, i + 1).join("."), en)]));
}
