"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateSite } from "@/lib/cms/api";
import { requireUser } from "@/lib/cms/auth";
import { json } from "@/lib/cms/db";
import { getL } from "@/lib/cms/lang";
import {
  cleanOverride, deleteRedirect, saveRedirect, saveSeo, seoVersion, setOverride, validateOverride, validateRedirect, validateSeo,
} from "@/lib/cms/seo";
import { seoPaths } from "@/lib/cms/seo-paths";
import type { FormState } from "../manage-actions";

export type SeoSaveState = { ok?: boolean; version?: number; error?: string } | null;

/** Titles, OG and robots show on every page: purge the cached pages and the sitemap. */
const purge = () => {
  revalidateSite();
  revalidatePath("/sitemap.xml");
};

export async function saveSeoAction(_p: SeoSaveState, f: FormData): Promise<SeoSaveState> {
  const user = await requireUser("seo");
  const L = await getL();
  const { settings, errs } = validateSeo(json(String(f.get("data") ?? "{}"), {}), L);
  if (errs.length) return { error: errs.slice(0, 8).join(" / ") };
  const version = saveSeo(settings, user.name, String(f.get("note") ?? "").trim().slice(0, 120) || L("SEO設定を更新", "Updated SEO settings"));
  purge();
  return { ok: true, version };
}

export async function restoreSeoVersion(f: FormData) {
  const user = await requireUser("seo");
  const L = await getL();
  const v = Number(f.get("version"));
  const row = v === 0 ? { data: "{}" } : seoVersion(v);
  if (!row) return;
  const n = saveSeo(validateSeo(json(row.data, {})).settings, user.name, v === 0 ? L("既定値に戻す", "Reset to defaults") : L(`版 ${v} に戻す`, `Restore version ${v}`));
  purge();
  redirect(`/admin/seo?restored=${v}&v=${n}`);
}

export async function saveOverrideAction(_p: SeoSaveState, f: FormData): Promise<SeoSaveState> {
  const user = await requireUser("seo");
  const L = await getL();
  const path = String(f.get("path") ?? "");
  if (!seoPaths().some((p) => p.path === path)) return { error: L("このページは設定できません", "This page can’t be configured here") };
  const o = cleanOverride(json(String(f.get("data") ?? "{}"), {}));
  const errs = validateOverride(o, L);
  if (errs.length) return { error: errs.join(" / ") };
  setOverride(path, o, user.name);
  purge();
  return { ok: true };
}

export async function saveRedirectAction(_p: FormState, f: FormData): Promise<FormState> {
  await requireUser("seo");
  const L = await getL();
  const id = Number(f.get("id")) || null;
  const code = Number(f.get("code"));
  const { errs, source, dest } = validateRedirect({ source: String(f.get("source") ?? ""), destination: String(f.get("destination") ?? ""), code }, id, L);
  if (errs.length) return { error: errs.join(" / ") };
  saveRedirect(id, source, dest, code, String(f.get("note") ?? "").trim().slice(0, 200));
  revalidatePath("/admin/seo/redirects");
  return { ok: L(`保存しました：${source} → ${dest}`, `Saved: ${source} → ${dest}`) };
}

export async function deleteRedirectAction(f: FormData) {
  await requireUser("seo");
  deleteRedirect(Number(f.get("id")));
  revalidatePath("/admin/seo/redirects");
}
