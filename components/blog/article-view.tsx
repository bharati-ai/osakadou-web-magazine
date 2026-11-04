import Image from "next/image";
import Link from "next/link";
import { CaretRight, ClockCountdown, ListBullets } from "@phosphor-icons/react/dist/ssr";
import { ShareButton } from "@/components/share-button";
import { categoryChain, categoryPath } from "@/lib/cms/categories";
import { toc } from "@/lib/cms/html";
import { modifiedAt, relatedPosts, type Post } from "@/lib/cms/posts";
import { jaDate, renderArticle } from "@/lib/cms/render";
import { SITE } from "@/lib/site";
import { getSeo } from "@/lib/cms/seo";
import { PostCard } from "./post-card";

// YMYL notes per top category (no brand name here: the brand stays out of medical sentences).
const DISCLAIMER: Record<string, string> = {
  health: "この記事は一般的な情報の提供を目的としており、診断や治療に代わるものではありません。特定の商品やサービスをすすめるものでもありません。症状や治療については、医療機関や医師・薬剤師にご相談ください。",
  beauty: "この記事は一般的な情報の提供を目的としたもので、特定の化粧品や施術、医療機関をすすめるものではありません。肌の不調が続くときは皮膚科などの医療機関に、契約のトラブルは消費者ホットライン（188）にご相談ください。",
};
const text = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
/** Q&A blocks (details.ol-faq) as FAQPage entries. */
const faqs = (html: string) =>
  [...html.matchAll(/<details class="ol-faq"[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map((m) => ({ q: text(m[1]), a: text(m[2]) }))
    .filter((x) => x.q && x.a);
const sameDay = (a?: string | null, b?: string | null) => !!a && !!b && jaDate(a) === jaDate(b);

/** The public article layout (also used by the admin preview). */
export function ArticleView({ post, preview }: { post: Post; preview?: boolean }) {
  const ch = categoryChain(post.category_id);
  const items = toc(post.content_html);
  const related = preview ? [] : relatedPosts(post);
  const modified = modifiedAt(post);
  const edited = post.origin !== "seed" && !sameDay(post.updated_at, post.published_at) && post.updated_at > (post.published_at ?? "") ? post.updated_at : null;
  const url = `${SITE.url}/blog/${post.slug}`;
  const seo = getSeo();
  const qa = seo.schema.faq && post.seo.faqSchema !== false ? faqs(post.content_html) : [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": post.seo.schemaType ?? "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.seo_description || post.excerpt,
        image: [post.cover_src ? `${SITE.url}${post.cover_src}` : `${SITE.url}/og-default.jpg`],
        datePublished: post.published_at,
        dateModified: modified,
        author: { "@type": "Organization", name: post.author_name || SITE.editors, url: `${SITE.url}/about` },
        publisher: {
          "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, alternateName: SITE.nameEn, url: SITE.url,
          logo: { "@type": "ImageObject", url: `${SITE.url}/logo-512.png`, width: 512, height: 512 },
          ...(seo.sameAs.length ? { sameAs: seo.sameAs } : {}),
        },
        mainEntityOfPage: url,
        articleSection: ch?.parent.name,
        keywords: post.tags.join(","),
        inLanguage: "ja",
        isPartOf: { "@id": `${SITE.url}/#website` },
      },
      ...(qa.length ? [{ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }] : []),
      ...(seo.schema.breadcrumbs ? [{
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "読みもの", item: `${SITE.url}/blog` },
          ...(ch ? [{ "@type": "ListItem", position: 3, name: ch.parent.name, item: `${SITE.url}/blog/category/${ch.parent.slug}` }] : []),
          ...(ch?.child ? [{ "@type": "ListItem", position: 4, name: ch.child.name, item: `${SITE.url}${categoryPath(ch.child.id)}` }] : []),
          { "@type": "ListItem", position: ch?.child ? 5 : ch ? 4 : 3, name: post.title },
        ],
      }] : []),
    ],
  };

  return (
    <article className="pb-20">
      {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <div className="wrap max-w-[1120px] pt-6">
        <nav aria-label="パンくずリスト" className="text-xs text-ink-2">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:underline">ホーム</Link></li>
            <li className="flex items-center gap-1"><CaretRight size={10} aria-hidden /><Link href="/blog" className="hover:underline">読みもの</Link></li>
            {ch && <li className="flex items-center gap-1"><CaretRight size={10} aria-hidden /><Link href={`/blog/category/${ch.parent.slug}`} className="hover:underline">{ch.parent.name}</Link></li>}
            {ch?.child && <li className="flex items-center gap-1"><CaretRight size={10} aria-hidden /><Link href={categoryPath(ch.child.id)} className="hover:underline">{ch.child.name}</Link></li>}
          </ol>
        </nav>

        <header className="mt-6 max-w-[820px]">
          <div className="flex flex-wrap gap-2">
            {ch && <Link href={`/blog/category/${ch.parent.slug}`} className="rounded-[var(--radius-chip)] bg-shu px-2.5 py-1 text-xs font-bold text-on-shu">{ch.parent.name}</Link>}
            {ch?.child && <Link href={categoryPath(ch.child.id)} className="rounded-[var(--radius-chip)] border border-shu px-2.5 py-1 text-xs font-bold text-shu-ink">{ch.child.name}</Link>}
          </div>
          <h1 className="mt-4 font-maru text-[clamp(23px,6.2vw,38px)] font-bold leading-[1.5] tracking-[0.03em] md:tracking-[0.06em]">{post.title}</h1>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-2">
            <div className="flex gap-1"><dt>公開日</dt><dd><time dateTime={post.published_at ?? undefined}>{jaDate(post.published_at)}</time></dd></div>
            {edited && <div className="flex gap-1"><dt>更新日</dt><dd><time dateTime={edited}>{jaDate(edited)}</time></dd></div>}
            {post.reviewed_at && !sameDay(post.reviewed_at, post.published_at) && <div className="flex gap-1"><dt>最終確認日</dt><dd><time dateTime={post.reviewed_at}>{jaDate(post.reviewed_at)}</time></dd></div>}
            <div className="flex items-center gap-1"><ClockCountdown size={15} aria-hidden /><dt className="sr-only">読了時間</dt><dd>約{post.reading_minutes}分</dd></div>
            <div className="flex gap-1"><dt>文</dt><dd>{post.author_name || SITE.editors}</dd></div>
          </dl>
        </header>

        {post.cover_src && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-paper-2 md:mt-8">
            <Image src={post.cover_src} alt={post.cover_alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1120px) 1080px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            {items.length > 2 && (
              <details className="mb-8 rounded-[var(--radius-card)] border-2 border-ink bg-card lg:hidden">
                <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-5 py-3 font-maru font-bold"><ListBullets size={20} aria-hidden />この記事の目次（{items.length}）</summary>
                <Toc items={items} />
              </details>
            )}
            <div className="ol-article" dangerouslySetInnerHTML={{ __html: renderArticle(post.content_html) }} />

            {post.sources.length > 0 && (
              <section aria-labelledby="h-sources" className="mt-12 rounded-[var(--radius-card)] border border-line bg-card p-5 md:p-6">
                <h2 id="h-sources" className="font-maru text-lg font-bold">参考・出典</h2>
                <ul className="mt-3 grid gap-1.5 text-[14px] leading-[1.8]">
                  {post.sources.map((s) => (
                    <li key={s.url} className="flex gap-2"><span aria-hidden className="text-shu">・</span><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 [overflow-wrap:anywhere]">{s.title}</a></li>
                  ))}
                </ul>
                {post.reviewed_at && <p className="mt-3 text-xs text-ink-2">リンク先の内容は{jaDate(post.reviewed_at)}に確認しました。制度や連絡先は変わることがあるため、最新の情報は各公式ページでご確認ください。</p>}
              </section>
            )}
            {ch && DISCLAIMER[ch.parent.slug] && (
              <p className="mt-6 rounded-[var(--radius-card)] bg-paper-2 p-4 text-xs leading-[1.9] text-ink-2">{DISCLAIMER[ch.parent.slug]}</p>
            )}
            {post.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="タグ">
                {post.tags.map((t) => <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-ink-2">{t.startsWith("#") ? t : `#${t}`}</li>)}
              </ul>
            )}
            {!preview && <div className="mt-8"><ShareButton text={`${post.title}｜${SITE.name}`} path={`/blog/${post.slug}`} /></div>}
          </div>

          {items.length > 2 && (
            <aside className="hidden lg:block" aria-label="目次">
              <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[var(--radius-card)] border-2 border-ink bg-card">
                <p className="flex items-center gap-2 border-b border-line px-5 py-3 font-maru font-bold"><ListBullets size={20} aria-hidden />目次</p>
                <Toc items={items} />
              </div>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="h-related" className="mt-16 border-t-2 border-ink pt-10">
            <h2 id="h-related" className="font-maru text-2xl font-bold">あわせて読みたい</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Toc({ items }: { items: { level: number; id: string; text: string }[] }) {
  return (
    <ol className="grid gap-0.5 px-5 py-3 text-[14px] leading-[1.7]">
      {items.map((t) => (
        <li key={t.id} className={t.level === 3 ? "pl-4 text-[13px] text-ink-2" : "font-bold"}>
          <a href={`#${t.id}`} className="phrase block py-1 hover:text-shu-ink">{t.text}</a>
        </li>
      ))}
    </ol>
  );
}
