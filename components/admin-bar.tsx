"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { inCmsEdit } from "./cms-bridge";

/** Shown on public pages to signed-in editors (hint cookie only; the admin itself re-checks the session). */
export function AdminBar() {
  const path = usePathname();
  const [on, setOn] = useState(false);
  useEffect(() => setOn(document.cookie.split("; ").includes("ol_admin=1") && !inCmsEdit()), []);
  if (!on) return null;
  const post = /^\/blog\/([a-z0-9-]+)$/.exec(path)?.[1];
  const edit =
    path === "/" ? { href: "/admin/pages/home", label: "このページを編集" }
    : path === "/tools" ? { href: "/admin/pages/tools", label: "このページを編集" }
    : path === "/about" ? { href: "/admin/pages/about", label: "このページを編集" }
    : post && post !== "feed.xml" ? { href: `/admin/posts/by-slug/${post}`, label: "この記事を編集" }
    : path.startsWith("/blog") ? { href: "/admin/posts", label: "記事の管理" }
    : null;
  return (
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 z-50 flex overflow-hidden rounded-full bg-night text-xs font-bold text-on-night shadow-lg ring-1 ring-white/15">
      <a href="/admin" className="px-3 py-2.5 hover:bg-white/10">管理画面</a>
      {edit && <a href={edit.href} className="bg-shu px-3 py-2.5 text-on-shu hover:brightness-110">{edit.label}</a>}
    </div>
  );
}
