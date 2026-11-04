import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/cms/auth";
import { getL } from "@/lib/cms/lang";
import { LangToggle } from "@/components/admin/lang";
import { StateForm } from "@/components/admin/state-form";
import { Submit, input, label } from "@/components/admin/ui";
import { logoutAction } from "../actions";
import { changeOwnPassword } from "../(panel)/manage-actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("パスワードの変更", "Change your password") };
}

/** Shown after sign-in while an admin requires a new password; every other admin screen redirects here. */
export default async function ForcedPasswordPage() {
  const me = await currentUser();
  if (!me) redirect("/admin/login");
  if (!me.must_change_password) redirect("/admin");
  const L = await getL();
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[420px] rounded-[var(--radius-card)] border border-line bg-card p-8 shadow-[var(--shadow-hard)]">
        <div className="flex items-start justify-between gap-3">
          <p lang="ja" className="font-mincho text-2xl font-bold tracking-[0.1em]">オオサカ堂</p>
          <LangToggle />
        </div>
        <h1 className="mt-1 font-maru text-lg font-bold">{L("新しいパスワードを決めてください", "Choose a new password")}</h1>
        <p className="mt-1 text-sm text-ink-2">{L(`${me.name} さん、管理者が設定したパスワードのままです。続けるには、自分だけが知っているパスワードに変更してください。`, `${me.name}, you’re still using the password an admin set. Choose one only you know to continue.`)}</p>
        <StateForm action={changeOwnPassword} className="mt-5 grid gap-3">
          <div><label className={label} htmlFor="f-cur">{L("いまのパスワード", "Current password")}</label><input id="f-cur" name="current" type="password" required autoComplete="current-password" className={input} /></div>
          <div><label className={label} htmlFor="f-new">{L("新しいパスワード（12文字以上）", "New password (12+ characters)")}</label><input id="f-new" name="password" type="password" required minLength={12} autoComplete="new-password" className={input} /></div>
          <div><label className={label} htmlFor="f-cf">{L("新しいパスワード（確認）", "Confirm new password")}</label><input id="f-cf" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></div>
          <Submit>{L("変更して続ける", "Change and continue")}</Submit>
        </StateForm>
        <form action={logoutAction} className="mt-4 text-center"><button className="text-xs underline">{L("ログアウト", "Log out")}</button></form>
      </div>
    </main>
  );
}
