export const SITE = {
  /** The brand. "OSAKADOU" is its Latin wordmark (the domain is osakadou.live). */
  name: "オオサカ堂",
  nameEn: "OSAKADOU",
  url: "https://osakadou.live",
  title: "オオサカ堂｜大阪の暮らし・健康・美容のWebマガジン",
  description:
    "オオサカ堂は、大阪で暮らす人のためのWebマガジンです。天気と季節のカレンダー、ごみや引っ越しの手続き、休日・夜間の相談窓口（#7119・#8000）、BMIなどの無料ツールを、公的な出典つきでまとめています。",
  ogDescription: "大阪で、暮らす。住む人の目線で、出典を明記して書くWebマガジン「オオサカ堂」。天気と季節カレンダー、相談先、無料ツールを掲載。",
  deck: "住む人の目線で、出典を明記して書くWebマガジン。",
  editors: "オオサカ堂編集部",
};

/** Sections of the magazine page, in page order (header nav, menu, footer). */
export const SECTIONS = [
  { href: "/#areas", label: "エリア", icon: "MapPin" },
  { href: "/#calendar", label: "天気と季節", icon: "CloudSun" },
  { href: "/#unwell", label: "相談先", icon: "FirstAid" },
  { href: "/tools", label: "無料ツール", icon: "Toolbox" },
  { href: "/#checklist", label: "チェック", icon: "Stamp" },
  { href: "/blog", label: "読みもの", icon: "BookOpenText" },
] as const;
