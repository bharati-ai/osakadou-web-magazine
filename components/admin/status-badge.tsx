import { getL } from "@/lib/cms/lang";
import { isLive, type Post } from "@/lib/cms/posts";

/** Server component only (reads the admin language cookie). */
export async function StatusBadge({ post }: { post: Pick<Post, "status" | "published_at"> }) {
  const L = await getL();
  const [text, cls] =
    post.status === "draft" ? [L("下書き", "Draft"), "bg-paper-2 text-ink-2 border-line"]
    : post.status === "archived" ? [L("非公開", "Unpublished"), "bg-paper-2 text-ink-2 border-line"]
    : isLive(post) ? [L("公開中", "Published"), "bg-[#2e7d32]/12 text-[#1b5e20] dark:text-[#81c995] border-[#2e7d32]/40"]
    : [L("予約投稿", "Scheduled"), "bg-[var(--info-bg)] text-[var(--info)] border-[var(--info)]/40"];
  return <span className={`inline-block shrink-0 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-bold ${cls}`}>{text}</span>;
}
