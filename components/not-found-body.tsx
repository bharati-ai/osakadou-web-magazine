import Link from "next/link";

/** Shared 404 content (root not-found adds the header and footer itself). */
export function NotFoundBody() {
  return (
    <section className="wrap grid min-h-[50vh] place-content-center py-20 text-center">
      <p lang="en" className="font-latin text-6xl font-bold text-shu-ink">404</p>
      <h1 className="mt-3 font-maru text-2xl font-bold md:text-3xl">ページが見つかりません</h1>
      <p className="mx-auto mt-4 max-w-[32em] text-ink-2">お探しのページは、移動または削除された可能性があります。URLをご確認のうえ、トップページや記事一覧からお探しください。</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-bold">
        <li><Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-shu px-6 text-on-shu">トップページへ</Link></li>
        <li><Link href="/blog" className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-6">読みもの一覧</Link></li>
        <li><Link href="/tools" className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-6">無料ツール</Link></li>
      </ul>
    </section>
  );
}
