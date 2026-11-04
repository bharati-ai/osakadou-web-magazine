"use client";

import { useActionState } from "react";
import { useL } from "@/components/admin/lang";
import { Notice, Submit, input, label } from "@/components/admin/ui";
import { loginAction } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  const L = useL();
  return (
    <form action={action} className="mt-6 grid gap-4">
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <div>
        <label htmlFor="email" className={label}>{L("メールアドレス", "Email")}</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>{L("パスワード", "Password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <Submit pending={L("確認中…", "Checking…")}>{L("ログイン", "Log in")}</Submit>
    </form>
  );
}
