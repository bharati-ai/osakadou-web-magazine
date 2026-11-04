import type { Metadata } from "next";
import { adminLang, getL } from "@/lib/cms/lang";
import { LangProvider } from "@/components/admin/lang";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return {
    title: { default: L("管理画面", "Admin"), template: L("%s｜オオサカ堂 管理画面", "%s | Osakadou Admin") },
    robots: { index: false, follow: false },
  };
}

export default async function AdminRoot({ children }: { children: React.ReactNode }) {
  const lang = await adminLang();
  return (
    <LangProvider lang={lang}>
      <div lang={lang} className="min-h-dvh bg-paper-2">{children}</div>
    </LangProvider>
  );
}
