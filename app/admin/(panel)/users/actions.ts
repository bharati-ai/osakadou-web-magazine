"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/cms/audit";
import { createUser, hashPassword, otherAdmins, passwordProblem, requireUser, revokeSessions, userById, type User } from "@/lib/cms/auth";
import { db } from "@/lib/cms/db";
import { getL } from "@/lib/cms/lang";
import { isRole, permsOf, storedPerms, type Role } from "@/lib/cms/perms";
import type { FormState } from "../manage-actions";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// audit details stay language-neutral ("editor* → author | +seo −pages"); the users screen renders them in the admin language
const accessText = (u: { role: string; perms: string | null }) => `${u.role}${u.perms ? "*" : ""}`;

/** Role + permission checkboxes from the access form. Custom permissions only when the "custom" switch is on. */
function access(f: FormData): { role: Role; perms: string | null } | null {
  const role = s(f, "role");
  if (!isRole(role)) return null;
  return { role, perms: f.get("custom") === "1" ? storedPerms(role, f.getAll("perm").map(String)) : null };
}

export async function createUserAction(_p: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser("users");
  const L = await getL();
  const email = s(f, "email");
  const name = s(f, "name");
  const pw = String(f.get("password") ?? "");
  const a = access(f);
  if (!EMAIL.test(email)) return { error: L("メールアドレスの形式が正しくありません", "Enter a valid email address") };
  if (!name || name.length > 40) return { error: L("表示名を1〜40文字で入力してください", "Enter a display name of 1–40 characters") };
  if (!a) return { error: L("役割を選んでください", "Choose a role") };
  const problem = passwordProblem(pw, L);
  if (problem) return { error: problem };
  if (db().prepare("SELECT 1 FROM users WHERE email = ?").get(email)) return { error: L("このメールアドレスはすでに登録されています", "This email address is already registered") };
  const id = createUser({ email, name, role: a.role, perms: a.perms, note: s(f, "note").slice(0, 200), password: pw, mustChange: f.get("must") === "on" });
  audit(me, "user_created", { id, name: email }, accessText(a));
  redirect(`/admin/users/${id}?created=1`);
}

/** The user being changed, refusing changes that would lock the site out. */
async function target(f: FormData) {
  const me = await requireUser("users");
  const L = await getL();
  const u = userById(Number(f.get("id")));
  return { me, L, u };
}

export async function updateProfileAction(_p: FormState, f: FormData): Promise<FormState> {
  const { me, L, u } = await target(f);
  if (!u) return { error: L("ユーザーが見つかりません", "User not found") };
  const email = s(f, "email");
  const name = s(f, "name");
  if (!EMAIL.test(email)) return { error: L("メールアドレスの形式が正しくありません", "Enter a valid email address") };
  if (!name || name.length > 40) return { error: L("表示名を1〜40文字で入力してください", "Enter a display name of 1–40 characters") };
  if (db().prepare("SELECT 1 FROM users WHERE email = ? AND id != ?").get(email, u.id)) return { error: L("このメールアドレスはほかのユーザーが使っています", "Another user already has this email address") };
  db().prepare("UPDATE users SET email = ?, name = ?, note = ? WHERE id = ?").run(email, name, s(f, "note").slice(0, 200), u.id);
  const changed = [u.email !== email && `${u.email} → ${email}`, u.name !== name && `${u.name} → ${name}`].filter(Boolean).join(" / ");
  audit(me, "profile_changed", { id: u.id, name: email }, changed);
  return { ok: L("プロフィールを保存しました", "Profile saved") };
}

export async function updateAccessAction(_p: FormState, f: FormData): Promise<FormState> {
  const { me, L, u } = await target(f);
  if (!u) return { error: L("ユーザーが見つかりません", "User not found") };
  const a = access(f);
  if (!a) return { error: L("役割を選んでください", "Choose a role") };
  if (u.id === me.id) return { error: L("自分自身の役割は変更できません（ほかの管理者に依頼してください）", "You can’t change your own role (ask another admin)") };
  if (u.role === "admin" && a.role !== "admin" && u.active && !otherAdmins(u.id)) return { error: L("最後の管理者は役割を変更できません。先に別の管理者を追加してください。", "This is the last admin. Add another admin before changing this role.") };
  db().prepare("UPDATE users SET role = ?, perms = ? WHERE id = ?").run(a.role, a.perms, u.id);
  const before = accessText(u), after = accessText(a);
  const permDiff = [...permsOf(a)].filter((p) => !permsOf(u).has(p)).map((p) => `+${p}`).concat([...permsOf(u)].filter((p) => !permsOf(a).has(p)).map((p) => `-${p}`));
  audit(me, "access_changed", { id: u.id, name: u.email }, `${before} → ${after}${permDiff.length ? ` | ${permDiff.join(" ")}` : ""}`);
  return { ok: L("役割と権限を保存しました（次の操作から反映されます）", "Role and permissions saved (they apply from the user’s next action)") };
}

export async function resetPasswordAction(_p: FormState, f: FormData): Promise<FormState> {
  const { me, L, u } = await target(f);
  if (!u) return { error: L("ユーザーが見つかりません", "User not found") };
  const pw = String(f.get("password") ?? "");
  const problem = passwordProblem(pw, L);
  if (problem) return { error: problem };
  const must = f.get("must") === "on";
  db().prepare("UPDATE users SET password_hash = ?, must_change_password = ? WHERE id = ?").run(hashPassword(pw), must ? 1 : 0, u.id);
  await revokeSessions(u.id, u.id === me.id);
  audit(me, "password_reset", { id: u.id, name: u.email }, must ? "must" : "");
  return { ok: L("パスワードを再設定しました（その人のログイン中のセッションは終了しました）", "Password reset. Their active sessions have been signed out.") };
}

const back = (u: User, notice: string): never => redirect(`/admin/users/${u.id}?n=${notice}`);

export async function setActiveAction(f: FormData) {
  const { me, u } = await target(f);
  if (!u) redirect("/admin/users");
  const active = f.get("active") === "1";
  if (u.id === me.id) back(u, "self");
  if (!active && u.role === "admin" && !otherAdmins(u.id)) back(u, "last");
  db().prepare("UPDATE users SET active = ? WHERE id = ?").run(active ? 1 : 0, u.id);
  if (!active) await revokeSessions(u.id);
  audit(me, active ? "user_activated" : "user_deactivated", { id: u.id, name: u.email });
  back(u, active ? "activated" : "deactivated");
}

export async function revokeSessionsAction(f: FormData) {
  const { me, u } = await target(f);
  if (!u) redirect("/admin/users");
  await revokeSessions(u.id, u.id === me.id);
  audit(me, "sessions_revoked", { id: u.id, name: u.email });
  back(u, "signedout");
}

export async function deleteUserAction(f: FormData) {
  const { me, u } = await target(f);
  if (!u) redirect("/admin/users");
  if (u.id === me.id) back(u, "self");
  if (u.role === "admin" && !otherAdmins(u.id)) back(u, "last");
  if (s(f, "confirm").toLowerCase() !== u.email.toLowerCase()) back(u, "confirm");
  // posts keep their author name; created_by becomes NULL, sessions and drafts go with the user
  db().prepare("DELETE FROM users WHERE id = ?").run(u.id);
  audit(me, "user_deleted", { id: u.id, name: u.email }, accessText(u));
  redirect("/admin/users?deleted=1");
}
