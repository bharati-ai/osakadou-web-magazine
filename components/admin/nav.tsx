"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Perm } from "@/lib/cms/perms";
import { useL } from "./lang";

type Item = { href: string; ja: string; en: string; exact?: boolean; need?: Perm };

const ITEMS: Item[] = [
  { href: "/admin", ja: "ダッシュボード", en: "Dashboard", exact: true },
  { href: "/admin/posts", ja: "記事", en: "Posts" },
  { href: "/admin/posts/new", ja: "新規記事", en: "New post", exact: true, need: "posts.create" },
  { href: "/admin/categories", ja: "カテゴリ", en: "Categories", need: "categories" },
  { href: "/admin/media", ja: "メディア", en: "Media" },
  { href: "/admin/pages", ja: "ページ編集", en: "Page builder", need: "pages" },
  { href: "/admin/seo", ja: "SEO", en: "SEO", need: "seo" },
  { href: "/admin/style-guide", ja: "スタイルガイド", en: "Style guide" },
  { href: "/admin/users", ja: "ユーザー", en: "Users", need: "users" },
  { href: "/admin/api-keys", ja: "APIキー", en: "API keys", need: "api_keys" },
  { href: "/admin/account", ja: "アカウント", en: "Account" },
];

export function AdminNav({ perms }: { perms: Perm[] }) {
  const path = usePathname();
  const L = useL();
  const active = (h: string, exact?: boolean) => (exact ? path === h : path === h || (path.startsWith(`${h}/`) && !(h === "/admin/posts" && path === "/admin/posts/new")));
  const allowed = (i: Item) => !i.need || perms.includes(i.need);
  return (
    <nav aria-label={L("管理メニュー", "Admin menu")} className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm lg:flex-col lg:overflow-visible lg:pb-0">
      {ITEMS.filter(allowed).map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={active(i.href, i.exact) ? "page" : undefined}
          className="shrink-0 rounded-lg px-3 py-2 text-on-night/85 hover:bg-white/10 aria-[current=page]:bg-shu aria-[current=page]:font-bold aria-[current=page]:text-on-shu"
        >
          {L(i.ja, i.en)}
        </Link>
      ))}
    </nav>
  );
}
