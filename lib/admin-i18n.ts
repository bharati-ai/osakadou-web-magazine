// Admin UI language (the public site is Japanese only). Strings are written inline as L("日本語", "English").
export type Lang = "ja" | "en";
export const LANG_COOKIE = "ol_admin_lang";
export type L = (ja: string, en: string) => string;
export const pick = (lang: Lang): L => (ja, en) => (lang === "en" ? en : ja);
