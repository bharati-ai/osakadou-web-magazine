import type { Metadata } from "next";
import Link from "next/link";
import { USER_COLS, requireUser, type User } from "@/lib/cms/auth";
import { auditLog } from "@/lib/cms/audit";
import { db, nowIso } from "@/lib/cms/db";
import { adminLang, getL } from "@/lib/cms/lang";
import { PERMS, PERM_INFO, ROLES, ROLE_INFO, ROLE_PERMS, permsOf } from "@/lib/cms/perms";
import { jaDate } from "@/lib/cms/render";
import { AuditList } from "@/components/admin/audit-list";
import { StateForm } from "@/components/admin/state-form";
import { AccessFields, PasswordField } from "@/components/admin/user-forms";
import { Notice, Submit, card, input, label } from "@/components/admin/ui";
import { createUserAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("ユーザー", "Users") };
}

type Row = User & { sessions: number; posts: number };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ deleted?: string; role?: string; q?: string; status?: string }> }) {
  const me = await requireUser("users");
  const L = await getL();
  const en = (await adminLang()) === "en";
  const sp = await searchParams;
  const where: string[] = [];
  const args: string[] = [nowIso()];
  if (sp.role && (ROLES as readonly string[]).includes(sp.role)) { where.push("role = ?"); args.push(sp.role); }
  if (sp.status === "inactive") where.push("active = 0");
  else if (sp.status === "active") where.push("active = 1");
  if (sp.q) { where.push("(name LIKE ? OR email LIKE ? OR note LIKE ?)"); args.push(`%${sp.q}%`, `%${sp.q}%`, `%${sp.q}%`); }
  const users = db()
    .prepare(`SELECT ${USER_COLS}, (SELECT count(*) FROM sessions s WHERE s.user_id = users.id AND s.expires_at > ?) sessions,
      (SELECT count(*) FROM posts p WHERE p.created_by = users.id) posts FROM users ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY active DESC, CASE role WHEN 'admin' THEN 0 ELSE 1 END, name`)
    .all(...args) as Row[];
  const counts = Object.fromEntries((db().prepare("SELECT role, count(*) n FROM users GROUP BY role").all() as { role: string; n: number }[]).map((r) => [r.role, r.n]));
  const roleName = (r: User["role"]) => ROLE_INFO[r][en ? 1 : 0];
  const filterLink = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ role: sp.role, status: sp.status, q: sp.q, ...o })) if (v) u.set(k, v);
    return `/admin/users${u.size ? `?${u}` : ""}`;
  };

  return (
    <div className="grid max-w-[1100px] gap-6">
      <div>
        <h1 className="font-maru text-2xl font-bold">{L("ユーザー", "Users")}</h1>
        <p className="mt-1 text-sm text-ink-2">{L("役割ごとに使える機能が決まっています。必要なら、人ごとに権限を足したり外したりできます（カスタム）。変更や操作はすべて下の記録に残ります。", "Each role comes with a set of permissions; you can add or remove permissions per person (custom). Every change is kept in the log below.")}</p>
      </div>
      {sp.deleted && <Notice kind="ok">{L("ユーザーを削除しました。書いた記事は残り、著者名もそのままです。", "User deleted. Their posts remain, with the author name unchanged.")}</Notice>}

      <details className={`${card} group`}>
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-maru font-bold marker:content-none">
          {L("ユーザーを追加", "Add a user")}
          <span className="text-sm text-shu-ink group-open:hidden">＋ {L("開く", "Open")}</span>
        </summary>
        <StateForm action={createUserAction} resetOnOk className="grid gap-4 border-t border-line p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div><label className={label} htmlFor="u-email">{L("メールアドレス（ログインID）", "Email (sign-in ID)")}</label><input id="u-email" name="email" type="email" required className={input} /></div>
            <div><label className={label} htmlFor="u-name">{L("表示名（版の履歴に残ります）", "Display name (shown in version history)")}</label><input id="u-name" name="name" required maxLength={40} className={input} /></div>
            <PasswordField id="u-pw" labelText={L("初期パスワード", "Initial password")} />
            <div><label className={label} htmlFor="u-note">{L("メモ（所属・担当など、管理者だけに表示）", "Note (team, duties… admins only)")}</label><input id="u-note" name="note" maxLength={200} className={input} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="must" defaultChecked className="size-4 accent-shu" />{L("初回ログイン時にパスワードを変更してもらう", "Require a new password at first sign-in")}</label>
          <AccessFields role="author" perms={null} />
          <div><Submit>{L("追加する", "Add user")}</Submit></div>
        </StateForm>
      </details>

      <section className={card}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 text-sm">
          <Link href={filterLink({ role: undefined })} aria-current={!sp.role ? "page" : undefined} className="rounded-full border border-line px-3 py-1 aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper">{L("すべて", "All")}</Link>
          {ROLES.map((r) => (
            <Link key={r} href={filterLink({ role: r })} aria-current={sp.role === r ? "page" : undefined} className="rounded-full border border-line px-3 py-1 aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper">
              {roleName(r)} <span className="text-xs opacity-70">{counts[r] ?? 0}</span>
            </Link>
          ))}
          <form action="/admin/users" className="ml-auto flex gap-2">
            {sp.role && <input type="hidden" name="role" value={sp.role} />}
            <select name="status" defaultValue={sp.status ?? ""} aria-label={L("状態", "Status")} className="rounded-lg border border-line bg-card px-2 py-1">
              <option value="">{L("有効・無効", "Any status")}</option><option value="active">{L("有効", "Active")}</option><option value="inactive">{L("無効", "Inactive")}</option>
            </select>
            <input name="q" defaultValue={sp.q} placeholder={L("名前・メール・メモ", "Name, email, note")} aria-label={L("検索", "Search")} className="w-40 rounded-lg border border-line bg-card px-2 py-1" />
            <button className="rounded-lg border border-line px-3 py-1 font-bold">{L("絞り込む", "Filter")}</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-paper-2 text-left text-xs text-ink-2">
              <tr>
                <th className="px-4 py-2">{L("ユーザー", "User")}</th><th className="px-4 py-2">{L("役割", "Role")}</th><th className="px-4 py-2">{L("状態", "Status")}</th>
                <th className="px-4 py-2">{L("最終ログイン", "Last sign-in")}</th><th className="px-4 py-2 text-right">{L("記事", "Posts")}</th><th className="px-4 py-2"><span className="sr-only">{L("操作", "Actions")}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className={u.active ? "" : "opacity-60"}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="font-bold hover:underline">{u.name}</Link>{u.id === me.id && <span className="ml-2 text-xs text-ink-2">{L("（自分）", "(you)")}</span>}
                    <p className="text-xs text-ink-2">{u.email}{u.note ? `・${u.note}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md border px-2 py-0.5 text-xs ${u.role === "admin" ? "border-shu text-shu-ink" : "border-line"}`}>{roleName(u.role)}</span>
                    {u.perms && <span className="ml-1 text-xs text-ink-2" title={[...permsOf(u)].map((p) => PERM_INFO[p][en ? 1 : 0]).join(", ")}>{L("カスタム", "custom")}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.active ? <span className="text-[#2e7d32]">{L("有効", "Active")}</span> : <span>{L("無効", "Inactive")}</span>}
                    {!!u.must_change_password && <span className="block text-[var(--caution)]">{L("パスワード変更待ち", "Must change password")}</span>}
                    {u.sessions > 0 && <span className="block text-ink-2">{L(`ログイン中 ${u.sessions}`, `${u.sessions} active session${u.sessions > 1 ? "s" : ""}`)}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-2">{jaDate(u.last_login_at) || L("なし", "never")}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{u.posts}</td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/users/${u.id}`} className="text-sm font-bold text-shu-ink hover:underline">{L("編集", "Edit")}</Link></td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-2">{L("該当するユーザーはいません", "No matching users")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <details className={card}>
        <summary className="cursor-pointer px-5 py-4 font-maru font-bold">{L("役割ごとの権限一覧", "What each role can do")}</summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="bg-paper-2 text-ink-2">
              <tr><th className="px-3 py-2 text-left">{L("権限", "Permission")}</th>{ROLES.map((r) => <th key={r} className="px-2 py-2">{roleName(r)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...PERMS, "users" as const, "api_keys" as const].map((p) => (
                <tr key={p}>
                  <td className="px-3 py-2"><span className="font-bold">{PERM_INFO[p][en ? 1 : 0]}</span><span className="block text-ink-2">{PERM_INFO[p][en ? 3 : 2]}</span></td>
                  {ROLES.map((r) => <td key={r} className="px-2 py-2 text-center">{ROLE_PERMS[r].includes(p) ? <span aria-label={L("あり", "yes")} className="text-[#2e7d32]">●</span> : <span aria-label={L("なし", "no")} className="text-line-strong">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-xs text-ink-2">{L("どの役割でも、管理画面の閲覧・記事のプレビュー・自分のアカウント設定はできます。", "Every role can browse the admin, preview posts and manage their own account.")}</p>
        </div>
      </details>

      <section className={card}>
        <h2 className="border-b border-line px-4 py-3 font-maru font-bold">{L("最近の記録（ログイン・ユーザーの変更）", "Recent activity (sign-ins and user changes)")}</h2>
        <AuditList rows={auditLog({ limit: 40 })} />
      </section>
    </div>
  );
}
