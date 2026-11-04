import Link from "next/link";
import type { AuditRow } from "@/lib/cms/audit";
import { adminLang } from "@/lib/cms/lang";
import { pick } from "@/lib/admin-i18n";
import { PERM_INFO, ROLE_INFO, isRole, type Perm } from "@/lib/cms/perms";

const ACTIONS: Record<string, [string, string]> = {
  login: ["ログイン", "Signed in"], login_failed: ["ログイン失敗", "Failed sign-in"], user_created: ["ユーザーを追加", "User added"],
  profile_changed: ["プロフィールを変更", "Profile changed"], access_changed: ["役割・権限を変更", "Access changed"], password_reset: ["パスワードを再設定", "Password reset"],
  password_changed: ["パスワードを変更", "Password changed"], sessions_revoked: ["ログアウトさせた", "Signed out sessions"], user_activated: ["有効にした", "Reactivated"],
  user_deactivated: ["無効にした", "Deactivated"], user_deleted: ["ユーザーを削除", "User deleted"],
};

/** Security log rows, newest first. Details are stored language-neutral and rendered here. */
export async function AuditList({ rows, showTarget = true }: { rows: AuditRow[]; showTarget?: boolean }) {
  const lang = await adminLang();
  const L = pick(lang);
  const en = lang === "en";
  const role = (t: string) => t.replace(/\b(admin|editor|seo|author|contributor|viewer)(\*?)(?=\s|$)/g, (_m, r: string, c: string) => (isRole(r) ? ROLE_INFO[r][en ? 1 : 0] : r) + (c ? L("（カスタム）", " (custom)") : ""));
  const detail = (r: AuditRow) => {
    if (r.action === "password_reset") return r.detail === "must" ? L("次回ログイン時に変更が必要", "must change at next sign-in") : "";
    if (r.action === "sessions_revoked" && r.detail === "others") return L("ほかの端末", "other devices");
    if (r.action === "access_changed" || r.action === "user_created" || r.action === "user_deleted") {
      const [roles, perms] = r.detail.split(" | ");
      const p = perms?.split(" ").map((x) => `${x[0] === "-" ? "−" : "+"}${PERM_INFO[x.slice(1) as Perm]?.[en ? 1 : 0] ?? x.slice(1)}`).join(" ");
      return [role(roles), p].filter(Boolean).join(L("　", " · "));
    }
    return r.detail;
  };
  if (!rows.length) return <p className="px-4 py-6 text-sm text-ink-2">{L("まだ記録はありません。", "Nothing recorded yet.")}</p>;
  return (
    <ol className="divide-y divide-line text-sm">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-2">
          <time className="whitespace-nowrap font-mono text-xs text-ink-2">{new Date(r.at).toLocaleString(en ? "en-GB" : "ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "short", timeStyle: "short" })}</time>
          <span className={`font-bold ${r.action === "login_failed" ? "text-[#b3261e]" : ""}`}>{ACTIONS[r.action] ? L(...ACTIONS[r.action]) : r.action}</span>
          {showTarget && r.target && (r.target_id ? <Link href={`/admin/users/${r.target_id}`} className="underline">{r.target}</Link> : <span>{r.target}</span>)}
          {detail(r) && <span className="text-ink-2">{detail(r)}</span>}
          <span className="ml-auto text-xs text-ink-2">{r.actor ? L(`操作：${r.actor}`, `by ${r.actor}`) : ""}</span>
        </li>
      ))}
    </ol>
  );
}
