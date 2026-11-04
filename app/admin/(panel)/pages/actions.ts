"use server";

import { redirect } from "next/navigation";
import { revalidateSite } from "@/lib/cms/api";
import { requireUser } from "@/lib/cms/auth";
import { json } from "@/lib/cms/db";
import { adminLang } from "@/lib/cms/lang";
import { pick } from "@/lib/admin-i18n";
import { dropPageDraft, isPageId, pageVersion, savePage, savePageDraft, validatePage } from "@/lib/cms/pages";
import { crumbs } from "@/components/admin/page-labels";

export type PageSaveState = { ok?: boolean; version?: number; error?: string } | null;

export async function savePageAction(_p: PageSaveState, f: FormData): Promise<PageSaveState> {
  const user = await requireUser("pages");
  const lang = await adminLang();
  const L = pick(lang);
  const page = String(f.get("page"));
  if (!isPageId(page)) return { error: L("ページが見つかりません", "Page not found") };
  const { merged, errs } = validatePage(page, json(String(f.get("data") ?? "{}"), {}), L);
  if (errs.length) {
    // "areas.items[3].image: …" → "エリアガイド › エリア 3 › 写真: …"
    const named = errs.map((e) => e.replace(/^([\w.[\]]+): /, (_m, p: string) => `${crumbs(page, p.replace(/\[(\d+)\]/g, (_x, n) => `.${Number(n) - 1}`), lang === "en").join(" › ")}: `));
    return { error: named.slice(0, 8).join(" / ") };
  }
  const version = savePage(page, merged, user.name, String(f.get("note") ?? "").trim().slice(0, 120) || L("更新", "Update"));
  dropPageDraft(user.id, page);
  revalidateSite();
  return { ok: true, version };
}

/** Store the editor's unsaved content so the canvas (/cms-preview/…?draft=1) can render it. Nothing goes live. */
export async function previewPageAction(page: string, data: string) {
  const user = await requireUser("pages");
  if (!isPageId(page)) return false;
  savePageDraft(user.id, page, validatePage(page, json(data, {})).merged);
  return true;
}

export async function restorePageVersion(f: FormData) {
  const user = await requireUser("pages");
  const L = pick(await adminLang());
  const page = String(f.get("page"));
  const v = Number(f.get("version"));
  if (!isPageId(page)) return;
  // version 0 = the initial (designed) content
  const row = v === 0 ? { data: "{}" } : pageVersion(page, v);
  if (!row) return;
  const { merged } = validatePage(page, json(row.data, {}));
  const n = savePage(page, merged, user.name, v === 0 ? L("初期状態に戻す", "Reset to initial content") : L(`版 ${v} に戻す`, `Restore version ${v}`));
  revalidateSite();
  redirect(`/admin/pages/${page}?restored=${v}&v=${n}`);
}
