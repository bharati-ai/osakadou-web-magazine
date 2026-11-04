"use client";

import { useState } from "react";
import { PERMS, PERM_INFO, ROLES, ROLE_INFO, ROLE_PERMS, type Role } from "@/lib/cms/perms";
import { useL, useLang } from "./lang";
import { btnGhost, input, label } from "./styles";

/** Role cards + optional per-user permission overrides. Posts role, custom ("1" when overriding) and perm[]. */
export function AccessFields({ role: r0, perms: p0, locked }: { role: Role; perms: string[] | null; locked?: string }) {
  const L = useL();
  const en = useLang() === "en";
  const [role, setRole] = useState<Role>(r0);
  const [custom, setCustom] = useState(!!p0);
  const [perms, setPerms] = useState<string[]>(p0 ?? [...ROLE_PERMS[r0]]);
  const pickRole = (r: Role) => { setRole(r); if (!custom) setPerms([...ROLE_PERMS[r]]); };
  const shown = role === "admin" ? [...PERMS] : custom ? perms : ROLE_PERMS[role];
  return (
    <fieldset disabled={!!locked} className="grid gap-4">
      <legend className="sr-only">{L("役割", "Role")}</legend>
      {locked && <p className="text-sm text-ink-2">{locked}</p>}
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="custom" value={custom && role !== "admin" ? "1" : "0"} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((k) => (
          <label key={k} className={`flex cursor-pointer gap-2 rounded-lg border p-3 text-sm ${role === k ? "border-shu bg-shu/5 ring-1 ring-shu" : "border-line hover:border-ink"}`}>
            <input type="radio" name="role-pick" checked={role === k} onChange={() => pickRole(k)} className="mt-1 accent-shu" />
            <span>
              <span className="font-bold">{ROLE_INFO[k][en ? 1 : 0]}</span>
              <span className="mt-0.5 block text-xs text-ink-2">{ROLE_INFO[k][en ? 3 : 2]}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="rounded-lg border border-line p-3">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" className="size-4 accent-shu" checked={custom && role !== "admin"} disabled={role === "admin"} onChange={(e) => { setCustom(e.target.checked); if (!e.target.checked) setPerms([...ROLE_PERMS[role]]); }} />
          {L("この人だけ権限を調整する（カスタム）", "Fine-tune permissions for this person (custom)")}
        </label>
        <p className="mt-1 text-xs text-ink-2">
          {role === "admin" ? L("管理者はすべての権限を持ちます。", "Admins always have every permission.") : custom ? L("チェックした権限だけが使えます。", "Only the ticked permissions apply.") : L("役割の標準の権限です。調整するにはチェックを入れてください。", "These are the role’s standard permissions. Tick the box above to adjust them.")}
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {PERMS.map((p) => (
            <li key={p}>
              <label className={`flex gap-2 text-sm ${custom && role !== "admin" ? "cursor-pointer" : "opacity-80"}`}>
                <input type="checkbox" name="perm" value={p} className="mt-0.5 size-4 accent-shu" checked={shown.includes(p)} disabled={!custom || role === "admin"} onChange={(e) => setPerms((x) => (e.target.checked ? [...x, p] : x.filter((y) => y !== p)))} />
                <span>{PERM_INFO[p][en ? 1 : 0]}<span className="block text-xs text-ink-2">{PERM_INFO[p][en ? 3 : 2]}</span></span>
              </label>
            </li>
          ))}
          <li className="text-xs text-ink-2 sm:col-span-2">{L("ユーザー管理とAPIキーは管理者だけが使えます。", "User management and API keys are always admin-only.")}</li>
        </ul>
      </div>
    </fieldset>
  );
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const generate = () => Array.from(crypto.getRandomValues(new Uint32Array(16)), (n) => ALPHABET[n % ALPHABET.length]).join("");

/** Password input with a generator; shown in clear text so the admin can pass it on. */
export function PasswordField({ id, labelText }: { id: string; labelText: string }) {
  const L = useL();
  const [v, setV] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <label className={label} htmlFor={id}>{labelText}</label>
      <div className="flex flex-wrap gap-2">
        <input id={id} name="password" type="text" required minLength={12} maxLength={200} autoComplete="new-password" spellCheck={false} value={v} onChange={(e) => { setV(e.target.value); setCopied(false); }} className={`${input} min-w-0 flex-1 font-mono`} />
        <button type="button" onClick={() => { setV(generate()); setCopied(false); }} className={`${btnGhost} min-h-10`}>{L("自動生成", "Generate")}</button>
        {v && <button type="button" onClick={() => navigator.clipboard.writeText(v).then(() => setCopied(true))} className={`${btnGhost} min-h-10`}>{copied ? L("コピーしました", "Copied") : L("コピー", "Copy")}</button>}
      </div>
      <p className="mt-1 text-xs text-ink-2">{L("12文字以上。本人には安全な方法で伝え、初回ログイン後に変更してもらいます。", "12+ characters. Pass it on securely; they’ll change it after signing in.")}</p>
    </div>
  );
}
