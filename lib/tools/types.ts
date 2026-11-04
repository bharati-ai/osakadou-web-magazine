import type { Icon } from "@phosphor-icons/react";
import type { PhotoSlot } from "@/lib/photos";
import type { ToolCategory } from "./categories";

export type ToolMeta = {
  /** URL: /tools/<slug> (romaji, kebab-case) */
  slug: string;
  /** H1 and card title, e.g. 「BMI計算」 */
  title: string;
  /** one line for cards (and the meta description when `description` is not set), ≤ 60 chars */
  short: string;
  /** search-result title, keyword first; ≤ ~26 chars before 「｜オオサカ堂」 (falls back to title) */
  seoTitle?: string;
  /** meta description, 90–120 chars, no efficacy claims (falls back to short) */
  description?: string;
  category: ToolCategory;
  /** Phosphor icon imported from "@phosphor-icons/react/dist/ssr" */
  icon: Icon;
  /** optional photo for the tool's header band (falls back to the category photo) */
  photo?: PhotoSlot;
  /** search keywords shown to Google via the page metadata */
  keywords?: string[];
};
