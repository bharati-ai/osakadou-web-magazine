import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/cms/auth";
import { getL } from "@/lib/cms/lang";
import { LangToggle } from "@/components/admin/lang";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("ログイン", "Log in") };
}

export default async function LoginPage() {
  if (await currentUser()) redirect("/admin");
  const L = await getL();
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[380px] rounded-[var(--radius-card)] border border-line bg-card p-8 shadow-[var(--shadow-hard)]">
        <div className="flex items-start justify-between gap-3">
          <p lang="ja" className="font-mincho text-2xl font-bold tracking-[0.1em]">オオサカ堂</p>
          <LangToggle />
        </div>
        <h1 className="mt-1 text-sm text-ink-2">{L("管理画面にログイン", "Log in to the admin")}</h1>
        <LoginForm />
      </div>
    </main>
  );
}
