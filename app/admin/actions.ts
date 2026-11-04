"use server";

import { redirect } from "next/navigation";
import { clientIp, endSession, login, loginLocked, startSession } from "@/lib/cms/auth";
import { getL } from "@/lib/cms/lang";

export async function loginAction(_prev: { error?: string } | null, form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const ip = await clientIp();
  const L = await getL();
  if (loginLocked(email, ip)) return { error: L("ログインの失敗が続いたため、15分間ロックしています。時間をおいて再度お試しください。", "Too many failed attempts. Login is locked for 15 minutes; please try again later.") };
  const user = await login(email, password, ip);
  if (!user) return { error: L("メールアドレスまたはパスワードが正しくありません。", "Incorrect email or password.") };
  await startSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}
