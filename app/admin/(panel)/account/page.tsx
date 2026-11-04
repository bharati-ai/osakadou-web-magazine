import type { Metadata } from "next";
import { activeSessions, requireUser } from "@/lib/cms/auth";
import { PERM_INFO, ROLE_INFO, permsOf } from "@/lib/cms/perms";
import { adminLang, getL } from "@/lib/cms/lang";
import { StateForm } from "@/components/admin/state-form";
import { Submit, btnGhost, card, input, label } from "@/components/admin/ui";
import { logoutAction } from "../../actions";
import { changeOwnName, changeOwnPassword, signOutOthers } from "../manage-actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("アカウント", "Account") };
}

export default async function AccountPage() {
  const me = await requireUser();
  const L = await getL();
  const en = (await adminLang()) === "en";
  const sessions = activeSessions(me.id);
  return (
    <div className="grid max-w-[640px] gap-6">
      <h1 className="font-maru text-2xl font-bold">{L("アカウント", "Account")}</h1>
      <section className={`${card} p-5 text-sm`}>
        <h2 className="font-maru font-bold">{L("あなたの役割", "Your role")}</h2>
        <p className="mt-2"><span className="font-bold">{ROLE_INFO[me.role][en ? 1 : 0]}</span>{me.perms ? L("（カスタム）", " (custom)") : ""}　<span className="text-ink-2">{me.email}</span></p>
        <ul className="mt-2 flex flex-wrap gap-1.5">{[...permsOf(me)].map((p) => <li key={p} className="rounded-md border border-line px-2 py-0.5 text-xs">{PERM_INFO[p][en ? 1 : 0]}</li>)}</ul>
        <p className="mt-2 text-xs text-ink-2">{L("権限を変えたいときは管理者に依頼してください。", "Ask an admin if you need different access.")}</p>
      </section>
      <section className={`${card} p-5`}>
        <h2 className="font-maru font-bold">{L("表示名", "Display name")}</h2>
        <StateForm action={changeOwnName} className="mt-3 grid gap-3">
          <div><label className={label} htmlFor="a-name">{L("表示名（版の履歴に残ります）", "Display name (shown in version history)")}</label><input id="a-name" name="name" defaultValue={me.name} required maxLength={40} className={input} /></div>
          <div><Submit>{L("保存", "Save")}</Submit></div>
        </StateForm>
      </section>
      <section className={`${card} p-5`}>
        <h2 className="font-maru font-bold">{L("パスワードを変更", "Change password")}</h2>
        <StateForm action={changeOwnPassword} resetOnOk className="mt-3 grid gap-3">
          <div><label className={label} htmlFor="a-cur">{L("現在のパスワード", "Current password")}</label><input id="a-cur" name="current" type="password" required autoComplete="current-password" className={input} /></div>
          <div><label className={label} htmlFor="a-new">{L("新しいパスワード（12文字以上）", "New password (12+ characters)")}</label><input id="a-new" name="password" type="password" required minLength={12} autoComplete="new-password" className={input} /></div>
          <div><label className={label} htmlFor="a-cf">{L("新しいパスワード（確認）", "Confirm new password")}</label><input id="a-cf" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></div>
          <div><Submit>{L("変更する", "Change password")}</Submit></div>
        </StateForm>
      </section>
      <section className={`${card} p-5`}>
        <h2 className="font-maru font-bold">{L("ログイン中の端末", "Signed-in devices")}</h2>
        <p className="mt-1 text-sm text-ink-2">{L(`有効なセッション：${sessions}（この端末を含む）`, `Active sessions: ${sessions} (including this one)`)}</p>
        {sessions > 1 && <StateForm action={signOutOthers} className="mt-3"><Submit className={btnGhost}>{L("ほかの端末からログアウト", "Sign out other devices")}</Submit></StateForm>}
      </section>
      <form action={logoutAction}><button className="text-sm underline">{L("ログアウト", "Log out")}</button></form>
    </div>
  );
}
