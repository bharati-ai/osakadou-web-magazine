import Link from "next/link";
import { requireUser } from "@/lib/cms/auth";
import { ROLE_INFO, permsOf } from "@/lib/cms/perms";
import { adminLang } from "@/lib/cms/lang";
import { pick } from "@/lib/admin-i18n";
import { AdminNav } from "@/components/admin/nav";
import { LangToggle } from "@/components/admin/lang";
import { logoutAction } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const lang = await adminLang();
  const L = pick(lang);
  const role = L(ROLE_INFO[user.role][0], ROLE_INFO[user.role][1]) + (user.perms ? L("（カスタム）", " (custom)") : "");
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-night text-on-night lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 lg:block">
            <Link href="/admin" className="block">
              <span lang="ja" className="font-mincho text-xl font-bold tracking-[0.1em]">オオサカ堂</span>
              <span className="ml-2 text-xs text-on-night/70 lg:ml-0 lg:block">{L("管理画面", "Admin")}</span>
            </Link>
            <span className="flex items-center gap-3 lg:mt-3 lg:flex-col lg:items-start lg:gap-2">
              <LangToggle />
              <Link href="/" target="_blank" className="text-xs text-on-night/80 underline">{L("サイトを見る ↗", "View site ↗")}</Link>
              <form action={logoutAction} className="lg:hidden"><button className="text-xs text-on-night/80 underline">{L("ログアウト", "Log out")}</button></form>
            </span>
          </div>
          <AdminNav perms={[...permsOf(user)]} />
          <div className="hidden border-t border-on-night/15 px-5 py-4 text-xs text-on-night/75 lg:block">
            <p className="truncate font-bold text-on-night">{user.name}</p>
            <p className="truncate">{user.email}</p>
            <p className="truncate">{role}</p>
            <form action={logoutAction} className="mt-2">
              <button className="underline">{L("ログアウト", "Log out")}</button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
