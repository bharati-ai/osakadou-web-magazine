"use server";

import { redirect } from "next/navigation";
import { newApiKey, revalidateSite } from "@/lib/cms/api";
import { audit } from "@/lib/cms/audit";
import { hashPassword, passwordProblem, requireUser, revokeSessions, verifyPassword } from "@/lib/cms/auth";
import { categoryById, createCategory, deleteCategory, updateCategory, validateCategory } from "@/lib/cms/categories";
import { db, nowIso } from "@/lib/cms/db";
import { getL } from "@/lib/cms/lang";
import { deleteMedia, mediaUsage, type Media } from "@/lib/cms/media";

export type FormState = { ok?: string; error?: string; secret?: string } | null;
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// --- categories
export async function saveCategory(_p: FormState, f: FormData): Promise<FormState> {
  await requireUser("categories");
  const L = await getL();
  const id = Number(f.get("id")) || null;
  const parent_id = Number(f.get("parent_id")) || null;
  const input = { name: s(f, "name"), slug: s(f, "slug").toLowerCase(), description: s(f, "description"), parent_id: id ? (categoryById(id)?.parent_id ?? null) : parent_id, sort: Number(f.get("sort")) || 0 };
  const errs = validateCategory(input, L);
  const dup = db().prepare("SELECT id FROM categories WHERE ifnull(parent_id,0) = ifnull(?,0) AND slug = ? AND id != ?").get(input.parent_id, input.slug, id ?? 0);
  if (dup) errs.push(L(`slug「${input.slug}」は同じ階層ですでに使われています`, `slug: “${input.slug}” is already used at this level`));
  if (errs.length) return { error: errs.join(" / ") };
  if (id) updateCategory(id, input);
  else createCategory(input);
  revalidateSite();
  return { ok: id ? L("カテゴリを更新しました", "Category updated") : L("カテゴリを追加しました", "Category added") };
}

export async function removeCategory(_p: FormState, f: FormData): Promise<FormState> {
  await requireUser("categories");
  const L = await getL();
  const problem = deleteCategory(Number(f.get("id")), L);
  if (problem) return { error: problem };
  revalidateSite();
  return { ok: L("カテゴリを削除しました", "Category deleted") };
}

// --- media
export async function saveMediaAlt(f: FormData) {
  await requireUser("media.manage");
  db().prepare("UPDATE media SET alt = ? WHERE id = ?").run(s(f, "alt").slice(0, 200), Number(f.get("id")));
  redirect(`/admin/media?saved=${Number(f.get("id"))}`);
}

export async function removeMedia(f: FormData) {
  await requireUser("media.manage");
  const m = db().prepare("SELECT * FROM media WHERE id = ?").get(Number(f.get("id"))) as Media | undefined;
  if (!m) redirect("/admin/media");
  const use = mediaUsage(m);
  if (use.posts.length || use.pages.length) redirect(`/admin/media?inuse=${m.id}`);
  deleteMedia(m);
  redirect("/admin/media?deleted=1");
}

// --- API keys (admin only)
export async function createKey(_p: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser("api_keys");
  const L = await getL();
  const name = s(f, "name");
  if (!name || name.length > 60) return { error: L("キーの名前を1〜60文字で入力してください（例：n8n-自動投稿）", "Enter a key name of 1–60 characters (e.g. n8n-autopost)") };
  return { ok: L("APIキーを発行しました。この画面を離れると二度と表示されません。いまコピーして安全な場所に保管してください。", "API key created. It won’t be shown again after you leave this page, so copy it now and store it somewhere safe."), secret: newApiKey(name, me.id) };
}

export async function revokeKey(f: FormData) {
  await requireUser("api_keys");
  db().prepare("UPDATE api_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL").run(nowIso(), Number(f.get("id")));
  redirect("/admin/api-keys");
}

// --- own account
export async function changeOwnPassword(_p: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser(undefined, { pendingOk: true });
  const L = await getL();
  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(me.id) as { password_hash: string };
  if (!verifyPassword(String(f.get("current") ?? ""), row.password_hash)) return { error: L("現在のパスワードが正しくありません", "Current password is incorrect") };
  const pw = String(f.get("password") ?? "");
  const problem = passwordProblem(pw, L);
  if (problem) return { error: problem };
  if (pw !== String(f.get("confirm") ?? "")) return { error: L("確認用のパスワードが一致しません", "Passwords don’t match") };
  if (verifyPassword(pw, row.password_hash)) return { error: L("いまと違うパスワードにしてください", "Choose a password different from the current one") };
  db().prepare("UPDATE users SET password_hash = ?, must_change_password = 0, password_changed_at = ? WHERE id = ?").run(hashPassword(pw), nowIso(), me.id);
  await revokeSessions(me.id, true);
  audit(me, "password_changed", { id: me.id, name: me.email });
  if (me.must_change_password) redirect("/admin?pw=1");
  return { ok: L("パスワードを変更しました（ほかの端末はログアウトしました）", "Password changed (other devices were signed out)") };
}

export async function changeOwnName(_p: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser();
  const L = await getL();
  const name = s(f, "name");
  if (!name || name.length > 40) return { error: L("表示名を1〜40文字で入力してください", "Enter a display name of 1–40 characters") };
  db().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, me.id);
  if (name !== me.name) audit(me, "profile_changed", { id: me.id, name: me.email }, `${me.name} → ${name}`);
  return { ok: L("表示名を変更しました", "Display name changed") };
}

export async function signOutOthers(_p: FormState): Promise<FormState> {
  const me = await requireUser();
  const L = await getL();
  await revokeSessions(me.id, true);
  audit(me, "sessions_revoked", { id: me.id, name: me.email }, "others");
  return { ok: L("ほかの端末からログアウトしました", "Signed out of your other devices") };
}
