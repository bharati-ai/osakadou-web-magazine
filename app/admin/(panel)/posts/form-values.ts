import type { PostFormValues } from "@/components/admin/post-form";
import { isLive, postUrl, type Post } from "@/lib/cms/posts";

/** ISO → "YYYY-MM-DDTHH:mm" in Japan time for <input type="datetime-local">. */
export function jstLocal(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 16);
}

export function formValues(p: Post | undefined, defaults: { author: string }): PostFormValues {
  if (!p)
    return {
      id: null, title: "", slug: "", excerpt: "", content_html: "", cover_src: null, cover_alt: "", category_id: 0, tags: [], sources: [],
      status: "draft", author_name: defaults.author, seo_title: "", seo_description: "", noindex: false, published_at: "",
      reviewed_at: jstLocal(new Date().toISOString()).slice(0, 10), live: false, url: null, seo: {}, review: false,
    };
  return {
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, content_html: p.content_html, cover_src: p.cover_src, cover_alt: p.cover_alt,
    category_id: p.category_id, tags: p.tags, sources: p.sources, status: p.status, author_name: p.author_name, seo_title: p.seo_title,
    seo_description: p.seo_description, noindex: !!p.noindex, published_at: jstLocal(p.published_at), reviewed_at: jstLocal(p.reviewed_at).slice(0, 10),
    live: isLive(p), url: postUrl(p), seo: p.seo, review: !!p.review_requested_at,
  };
}
