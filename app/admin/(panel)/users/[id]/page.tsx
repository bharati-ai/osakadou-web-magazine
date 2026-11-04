import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeSessions, requireUser, userById } from "@/lib/cms/auth";
import { auditLog } from "@/lib/cms/audit";
import { db } from "@/lib/cms/db";
import { adminLang, getL } from "@/lib/cms/lang";
import { ROLE_INFO, permsOf } from "@/lib/cms/perms";
import { jaDate } from "@/lib/cms/render";
import { AuditList } from "@/components/admin/audit-list";
import { StateForm } from "@/components/admin/state-form";
import { AccessFields, PasswordField } from "@/components/admin/user-forms";
import { BackLink, ConfirmSubmit, Notice, StickyBar, Submit, btnDanger, btnGhost, card, input, label } from "@/components/admin/ui";
import { deleteUserAction, resetPasswordAction, revokeSessionsAction, setActiveAction, updateAccessAction, updateProfileAction } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const L = await getL();
  return { title: `${userById(Number((await params).id))?.name ?? ""} | ${L("ユーザー", "Users")}` };
}

export default async function UserPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ n?: string; created?: string }> }) {
  const me = await requireUser("users");
  const L = await getL();
  const en = (await adminLang()) === "en";
  const u = userById(Number((await params).id));
  if (!u) notFound();
  const sp = await searchParams;
  const self = u.id === me.id;
  const sessions = activeSessions(u.id);
  const posts = (db().prepare("SELECT count(*) n FROM posts WHERE created_by = ?").get(u.id) as { n: number }).n;
  const notices: Record<string, ["ok" | "warn", string, string]> = {
    self: ["warn", "自分自身にはこの操作はできません。", "You can’t do that to your own account."],
    last: ["warn", "最後の管理者にはこの操作はできません。先に別の管理者を追加してください。", "Not possible for the last admin. Add another admin first."],
    confirm: ["warn", "確認のメールアドレスが一致しなかったため、削除しませんでした。", "The confirmation email didn’t match, so nothing was deleted."],
    activated: ["ok", "有効にしました。", "Reactivated."],
    deactivated: ["ok", "無効にしました。ログイン中のセッションも終了しました。", "Deactivated, and their sessions were signed out."],
    signedout: ["ok", "すべての端末からログアウトさせました。", "Signed out of every device."],
  };
  const n = sp.n ? notices[sp.n] : undefined;
  const fid = (k: string) => `u${u.id}-${k}`;

  return (
    <div className="grid max-w-[1000px] gap-6">
      <StickyBar>
        <BackLink href="/admin/users">{L("ユーザー一覧", "All users")}</BackLink>
        <h1 className="font-maru text-xl font-bold">{u.name}</h1>
        <span className="rounded-md border border-line px-2 py-0.5 text-xs">{ROLE_INFO[u.role][en ? 1 : 0]}{u.perms ? L("（カスタム）", " (custom)") : ""}</span>
        {!u.active && <span className="rounded-md bg-ink px-2 py-0.5 text-xs text-paper">{L("無効", "Inactive")}</span>}
        <span className="ml-auto text-xs text-ink-2">{L(`登録 ${jaDate(u.created_at)}・最終ログイン ${jaDate(u.last_login_at) || "なし"}`, `Joined ${jaDate(u.created_at)} · last sign-in ${jaDate(u.last_login_at) || "never"}`)}</span>
      </StickyBar>
      {sp.created && <Notice kind="ok">{L("ユーザーを追加しました。メールアドレスと初期パスワードを本人に伝えてください。", "User added. Pass the email and initial password on to them.")}</Notice>}
      {n && <Notice kind={n[0]}>{L(n[1], n[2])}</Notice>}

      <section className={`${card} p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("プロフィール", "Profile")}</h2>
        <StateForm action={updateProfileAction} className="mt-3 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={u.id} />
          <div><label className={label} htmlFor={fid("name")}>{L("表示名", "Display name")}</label><input id={fid("name")} name="name" defaultValue={u.name} required maxLength={40} className={input} /></div>
          <div><label className={label} htmlFor={fid("email")}>{L("メールアドレス（ログインID）", "Email (sign-in ID)")}</label><input id={fid("email")} name="email" type="email" defaultValue={u.email} required className={input} /></div>
          <div className="md:col-span-2"><label className={label} htmlFor={fid("note")}>{L("メモ（管理者だけに表示）", "Note (admins only)")}</label><input id={fid("note")} name="note" defaultValue={u.note} maxLength={200} className={input} /></div>
          <div><Submit>{L("保存", "Save")}</Submit></div>
        </StateForm>
      </section>

      <section className={`${card} p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("役割と権限", "Role & permissions")}</h2>
        <p className="mt-1 text-xs text-ink-2">{L(`いま使える機能：${[...permsOf(u)].length}項目`, `Currently has ${[...permsOf(u)].length} permission(s)`)}</p>
        <StateForm action={updateAccessAction} className="mt-3 grid gap-4">
          <input type="hidden" name="id" value={u.id} />
          <AccessFields role={u.role} perms={u.perms ? JSON.parse(u.perms) : null} locked={self ? L("自分自身の役割は変更できません（ほかの管理者に依頼してください）。", "You can’t change your own role (ask another admin).") : undefined} />
          {!self && <div><Submit>{L("役割と権限を保存", "Save role & permissions")}</Submit></div>}
        </StateForm>
      </section>

      <section className={`${card} grid gap-4 p-5`}>
        <h2 className="font-maru text-lg font-bold">{L("セキュリティ", "Security")}</h2>
        <StateForm action={resetPasswordAction} resetOnOk className="grid gap-3">
          <input type="hidden" name="id" value={u.id} />
          <PasswordField id={fid("pw")} labelText={L("新しいパスワードを設定", "Set a new password")} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="must" defaultChecked={!self} className="size-4 accent-shu" />{L("次回ログイン時にパスワードを変更してもらう", "Require a new password at next sign-in")}</label>
          <div><Submit className={btnGhost}>{L("パスワードを再設定", "Reset password")}</Submit></div>
        </StateForm>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4 text-sm">
          <span>{L(`ログイン中のセッション：${sessions}`, `Active sessions: ${sessions}`)}{u.must_change_password ? L("・パスワード変更待ち", " · must change password") : ""}{u.password_changed_at ? L(`・最終変更 ${jaDate(u.password_changed_at)}`, ` · changed ${jaDate(u.password_changed_at)}`) : ""}</span>
          {sessions > 0 && (
            <form action={revokeSessionsAction} className="ml-auto">
              <input type="hidden" name="id" value={u.id} />
              <ConfirmSubmit message={self ? L("この端末以外からログアウトしますか？", "Sign out of your other devices?") : L(`${u.name} さんをすべての端末からログアウトさせますか？`, `Sign ${u.name} out of every device?`)} className={`${btnGhost} min-h-9`}>{self ? L("ほかの端末からログアウト", "Sign out other devices") : L("すべての端末からログアウト", "Sign out everywhere")}</ConfirmSubmit>
            </form>
          )}
        </div>
      </section>

      {!self && (
        <section className={`${card} grid gap-4 border-[#b3261e]/40 p-5`}>
          <h2 className="font-maru text-lg font-bold">{L("アカウントの停止・削除", "Deactivate or delete")}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="min-w-0 flex-1 text-ink-2">{u.active ? L("無効にすると、すぐにログインできなくなります。記事や履歴はそのまま残り、あとで有効に戻せます（退職・休止のときはこちら）。", "Deactivating blocks sign-in right away. Posts and history stay, and you can reactivate later (use this when someone leaves).") : L("このユーザーは無効です。", "This user is inactive.")}</p>
            <form action={setActiveAction}>
              <input type="hidden" name="id" value={u.id} />
              <input type="hidden" name="active" value={u.active ? "0" : "1"} />
              <ConfirmSubmit message={u.active ? L(`${u.name} さんを無効にします。ログインできなくなります。`, `Deactivate ${u.name}? They will no longer be able to sign in.`) : L(`${u.name} さんを有効に戻します。`, `Reactivate ${u.name}?`)} className={u.active ? btnDanger : btnGhost}>{u.active ? L("無効にする", "Deactivate") : L("有効に戻す", "Reactivate")}</ConfirmSubmit>
            </form>
          </div>
          <form action={deleteUserAction} className="grid gap-2 border-t border-line pt-4 text-sm">
            <input type="hidden" name="id" value={u.id} />
            <p className="text-ink-2">{L(`完全に削除します。元に戻せません。作成した記事（${posts}件）は残り、著者名も変わりません。確認のため、メールアドレスを入力してください。`, `Permanently deletes the account; this can’t be undone. Their posts (${posts}) remain with the same author name. Type the email address to confirm.`)}</p>
            <div className="flex flex-wrap gap-2">
              <input name="confirm" aria-label={L("確認用のメールアドレス", "Email to confirm")} placeholder={u.email} autoComplete="off" className={`${input} max-w-[320px]`} />
              <ConfirmSubmit message={L(`${u.name} さんを完全に削除しますか？`, `Permanently delete ${u.name}?`)}>{L("完全に削除", "Delete permanently")}</ConfirmSubmit>
            </div>
          </form>
        </section>
      )}

      <section className={card}>
        <h2 className="border-b border-line px-4 py-3 font-maru font-bold">{L("このユーザーの記録", "Activity for this user")}</h2>
        <AuditList rows={auditLog({ userId: u.id, limit: 40 })} />
      </section>
    </div>
  );
}
