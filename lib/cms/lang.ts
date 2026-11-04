import { cookies } from "next/headers";
import { LANG_COOKIE, pick, type Lang } from "@/lib/admin-i18n";

/** Admin language from the toggle cookie (server components and server actions). */
export async function adminLang(): Promise<Lang> {
  return (await cookies()).get(LANG_COOKIE)?.value === "en" ? "en" : "ja";
}

/** `const L = await getL(); L("保存しました", "Saved")` */
export async function getL() {
  return pick(await adminLang());
}
