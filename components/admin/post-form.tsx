"use client";

import { useActionState, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { savePost, type SaveState } from "@/app/admin/(panel)/posts/actions";
import type { CategoryNode } from "@/lib/cms/categories";
import type { Source } from "@/lib/cms/posts";
import type { PostSeo } from "@/lib/cms/seo";
import { analyze } from "@/lib/seo-analysis";
import { RichEditor } from "./editor";
import { useL } from "./lang";
import { MediaPicker } from "./media-picker";
import { Notice, Submit, btnGhost, card, input, label, useLeaveGuard } from "./ui";

export type PostFormValues = {
  id: number | null; title: string; slug: string; excerpt: string; content_html: string; cover_src: string | null; cover_alt: string;
  category_id: number; tags: string[]; sources: Source[]; status: string; author_name: string; seo_title: string; seo_description: string;
  noindex: boolean; published_at: string; reviewed_at: string; live: boolean; url: string | null; seo: PostSeo;
  /** a review has been requested for this draft */
  review: boolean;
};

const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=640&q=55`;
const YMYL_TOP = new Set(["health", "beauty"]);

function Counter({ value, max, ideal }: { value: string; max: number; ideal?: [number, number] }) {
  const L = useL();
  const n = [...value].length;
  const tone = n > max ? "text-[#b3261e]" : ideal && (n < ideal[0] || n > ideal[1]) ? "text-[var(--caution)]" : "text-ink-2";
  return <span className={`text-xs ${tone}`}>{n}/{max}{ideal ? L(`（目安 ${ideal[0]}〜${ideal[1]}）`, ` (aim ${ideal[0]}–${ideal[1]})`) : ""}</span>;
}

const DOT = { good: "bg-[#2e7d32]", ok: "bg-[var(--caution)]", bad: "bg-[#b3261e]" } as const;

/**
 * The post editor. `head` (back link, title, badges) shares the sticky top bar with Save, so navigation stays in reach.
 * Without `canPublish` the status is fixed to draft and the author can ask for review instead.
 */
export function PostForm({ values, categories, head, canPublish = true }: { values: PostFormValues; categories: CategoryNode[]; head?: React.ReactNode; canPublish?: boolean }) {
  const L = useL();
  const bar = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);
  // the editor toolbar sticks just below this bar, whatever its height (it wraps on narrow screens)
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [state, action] = useActionState<SaveState, FormData>(savePost, null);
  const [cover, setCover] = useState({ src: values.cover_src ?? "", alt: values.cover_alt });
  const [picker, setPicker] = useState<"cover" | "og" | null>(null);
  const [sources, setSources] = useState<Source[]>(values.sources.length ? values.sources : []);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [seoTitle, setSeoTitle] = useState(values.seo_title);
  const [seoDesc, setSeoDesc] = useState(values.seo_description);
  const [excerpt, setExcerpt] = useState(values.excerpt);
  const [html, setHtml] = useState(values.content_html);
  const [seo, setSeo] = useState<PostSeo>(values.seo);
  const [categoryId, setCategoryId] = useState(values.category_id);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (state?.ok) setDirty(false); }, [state]);
  useLeaveGuard(dirty);
  // toolbar formatting, image/source buttons and SEO switches fire no input event: mark them explicitly
  const touchCover = (c: { src: string; alt: string }) => { setCover(c); setDirty(true); };
  const touchSources = (s: Source[]) => { setSources(s); setDirty(true); };
  const touchSeo = (patch: Partial<PostSeo>) => { setSeo((x) => ({ ...x, ...patch })); setDirty(true); };
  const lint = state?.warnings?.filter((w) => w.startsWith("表現チェック")) ?? [];
  const other = state?.warnings?.filter((w) => !w.startsWith("表現チェック")) ?? [];

  const topSlug = categories.find((c) => c.id === categoryId || c.children.some((k) => k.id === categoryId))?.slug ?? "";
  const deferredHtml = useDeferredValue(html);
  const report = useMemo(
    () => analyze({ title, seoTitle, seoDescription: seoDesc, excerpt, slug, html: deferredHtml, keyphrase: seo.focusKeyphrase ?? "", coverSrc: cover.src || null, coverAlt: cover.alt, sourcesCount: sources.filter((s) => s.url).length, ymyl: YMYL_TOP.has(topSlug), brand: "オオサカ堂" }),
    [title, seoTitle, seoDesc, excerpt, slug, deferredHtml, seo.focusKeyphrase, cover, sources, topSlug],
  );
  const scoreTone = report.score >= 80 ? "bg-[#2e7d32] text-white" : report.score >= 55 ? "bg-[var(--caution)] text-white" : "bg-[#b3261e] text-white";
  const preview = values.id ? `/admin/posts/${values.id}/preview` : null;

  return (
    <form action={action} onInput={() => setDirty(true)} style={{ "--sticky-top": `${barH}px` } as React.CSSProperties} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={values.id ?? ""} />
      <input type="hidden" name="sources" value={JSON.stringify(sources)} />
      <input type="hidden" name="cover_src" value={cover.src} />
      <input type="hidden" name="cover_alt" value={cover.alt} />
      <input type="hidden" name="seo" value={JSON.stringify(seo)} />

      {/* Only this slim bar sticks (navigation + Save); the settings cards scroll normally. */}
      <div ref={bar} className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-paper-2/95 px-4 py-2.5 backdrop-blur md:-mx-8 md:px-8 xl:col-span-2">
        {head}
        <span className={head ? "ml-auto flex flex-wrap items-center gap-2" : "contents"}>
        <Submit>{canPublish ? L("保存する", "Save") : L("下書きを保存", "Save draft")}</Submit>
        {preview && <a href={preview} target="_blank" className={btnGhost}>{L("プレビュー ↗", "Preview ↗")}</a>}
        {values.live && values.url && <a href={values.url} target="_blank" className="text-sm text-shu-ink underline">{L("公開ページ ↗", "Live page ↗")}</a>}
        <span className={`${head ? "" : "ml-auto "}rounded-full px-2.5 py-1 text-xs font-bold ${scoreTone}`} title={L("SEOスコア", "SEO score")}>SEO {report.score}</span>
        {dirty ? <span className="text-xs text-[var(--caution)]">{L("未保存の変更があります", "Unsaved changes")}</span> : state?.ok ? <span className="text-xs text-[#2e7d32]">{L("保存済み", "Saved")}</span> : null}
        </span>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        {state?.errors && <Notice kind="error"><p className="font-bold">{L("保存できませんでした", "Could not save")}</p><ul className="mt-1 list-disc pl-5">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul></Notice>}
        {state?.ok && <Notice kind="ok">{L("保存しました", "Saved")}（{new Date(state.savedAt!).toLocaleTimeString("ja-JP")}）</Notice>}
        {lint.length > 0 && (
          <Notice kind="warn">
            <p className="font-bold">{L("表現チェック（薬機法・景表法）：公開前に確認してください", "Wording check (Japanese pharma/advertising law): review before publishing")}</p>
            <ul className="mt-1 list-disc pl-5">{lint.map((w) => <li key={w}>{w.replace("表現チェック：", "")}</li>)}</ul>
          </Notice>
        )}
        {other.length > 0 && <Notice kind="info"><ul className="list-disc pl-5">{other.map((w) => <li key={w}>{w}</li>)}</ul></Notice>}

        <div>
          <label htmlFor="title" className="sr-only">{L("タイトル", "Title")}</label>
          <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder={L("記事のタイトル", "Post title")} className="w-full rounded-[var(--radius-card)] border border-line-strong bg-card px-4 py-3 font-maru text-2xl font-bold outline-none focus:border-shu" />
          <div className="mt-1 flex justify-end"><Counter value={title} max={120} ideal={[20, 40]} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="slug" className="shrink-0 text-ink-2">{L("スラッグ（URL）", "Slug (URL)")}：/blog/</label>
          <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="osaka-gomi-bunbetsu" title={L("半角英小文字・数字・ハイフン", "Lowercase letters, digits and hyphens")} className={`${input} max-w-[420px] font-mono text-sm`} />
        </div>
        <RichEditor name="content_html" initial={values.content_html} onChange={(h) => { setHtml(h); setDirty(true); }} />
      </div>

      <div className="grid min-w-0 grid-cols-1 content-start gap-4">
        <section className={`${card} grid gap-3 p-4`}>
          <h2 className="font-maru font-bold">{L("公開", "Publishing")}</h2>
          <div>
            <label htmlFor="status" className={label}>{L("状態", "Status")}</label>
            <select id="status" name="status" defaultValue={canPublish ? values.status : "draft"} className={input}>
              <option value="draft">{L("下書き", "Draft")}</option>
              {canPublish && <option value="published">{L("公開（日時が未来なら予約）", "Published (scheduled if the date is in the future)")}</option>}
              {canPublish && <option value="archived">{L("非公開（アーカイブ）", "Unpublished (archived)")}</option>}
            </select>
            {!canPublish && <p className="mt-1 text-xs text-ink-2">{L("公開は、公開権限のある編集者が行います。", "An editor with the Publish permission will publish it.")}</p>}
          </div>
          <label className="flex items-start gap-2 rounded-lg border border-line p-2.5 text-sm">
            <input type="checkbox" name="review" defaultChecked={values.review} className="mt-0.5 size-4 accent-shu" />
            <span>
              <span className="font-bold">{canPublish ? L("レビュー待ち", "Waiting for review") : L("レビューを依頼する", "Ask for review")}</span>
              <span className="block text-xs text-ink-2">{canPublish ? L("下書きのまま保存すると依頼が残ります。外すか公開すると完了になります。", "Stays requested while saved as a draft. Untick it or publish to close the request.") : L("保存すると、編集者の「レビュー待ち」一覧に表示されます。", "When saved, it appears in the editors’ review queue.")}</span>
            </span>
          </label>
          <div>
            <label htmlFor="published_at" className={label}>{L("公開日時（日本時間）", "Publish date (Japan time)")}</label>
            <input id="published_at" name="published_at" type="datetime-local" defaultValue={values.published_at} className={input} />
          </div>
          <div>
            <label htmlFor="reviewed_at" className={label}>{L("最終確認日（出典を確かめた日）", "Last fact-checked (sources verified)")}</label>
            <input id="reviewed_at" name="reviewed_at" type="date" defaultValue={values.reviewed_at} className={input} />
          </div>
          <div>
            <label htmlFor="note" className={label}>{L("変更メモ（版の履歴に残ります）", "Change note (kept in version history)")}</label>
            <input id="note" name="note" placeholder={L("例：電話番号を更新", "e.g. Updated phone number")} maxLength={120} className={input} />
          </div>
        </section>

        <section className={`${card} grid gap-3 p-4`}>
          <h2 className="font-maru font-bold">{L("カテゴリ", "Category")}</h2>
          <select name="category_id" value={categoryId || ""} onChange={(e) => setCategoryId(Number(e.target.value))} required aria-label={L("カテゴリ", "Category")} className={input}>
            <option value="" disabled>{L("選んでください", "Choose…")}</option>
            {categories.map((c) => (
              <optgroup key={c.id} label={c.name}>
                <option value={c.id}>{c.name}{L("（全体）", " (all)")}</option>
                {c.children.map((k) => <option key={k.id} value={k.id}>{c.name} › {k.name}</option>)}
              </optgroup>
            ))}
          </select>
          <div>
            <label htmlFor="tags" className={label}>{L("タグ（読点・カンマ区切り）", "Tags (comma-separated)")}</label>
            <input id="tags" name="tags" defaultValue={values.tags.join("、")} className={input} placeholder="大阪市、手続き" />
          </div>
        </section>

        <section className={`${card} grid gap-3 p-4`}>
          <h2 className="font-maru font-bold">{L("アイキャッチ画像", "Featured image")}</h2>
          {cover.src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(cover.src)} alt="" className="aspect-[16/9] w-full rounded-lg object-cover" />
              <div>
                <label htmlFor="cover-alt" className={label}>{L("代替テキスト（alt）", "Alt text")}</label>
                <input id="cover-alt" value={cover.alt} onChange={(e) => touchCover({ ...cover, alt: e.target.value })} className={input} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPicker("cover")} className={btnGhost}>{L("変更", "Change")}</button>
                <button type="button" onClick={() => touchCover({ src: "", alt: "" })} className={btnGhost}>{L("外す", "Remove")}</button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => setPicker("cover")} className="grid aspect-[16/9] place-items-center rounded-lg border-2 border-dashed border-line text-sm text-ink-2 hover:border-shu">
              {L("画像を選ぶ（未設定なら本文の最初の画像）", "Choose an image (defaults to the first image in the body)")}
            </button>
          )}
        </section>

        <SeoPanel
          values={values} title={title} seoTitle={seoTitle} setSeoTitle={setSeoTitle} seoDesc={seoDesc} setSeoDesc={setSeoDesc}
          excerpt={excerpt} setExcerpt={setExcerpt} seo={seo} touchSeo={touchSeo} report={report} slug={slug} openOgPicker={() => setPicker("og")} cover={cover.src}
        />

        <section className={`${card} grid gap-3 p-4`}>
          <h2 className="font-maru font-bold">{L("参考・出典", "Sources")}</h2>
          {sources.map((s, i) => (
            <div key={i} className="grid gap-1.5 rounded-lg border border-line p-2">
              <input aria-label={L(`出典${i + 1}の名称`, `Source ${i + 1} title`)} value={s.title} onChange={(e) => touchSources(sources.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="大阪市「転入届」" className={input} />
              <input aria-label={L(`出典${i + 1}のURL`, `Source ${i + 1} URL`)} value={s.url} onChange={(e) => touchSources(sources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} placeholder="https://www.city.osaka.lg.jp/…" className={`${input} font-mono text-xs`} />
              <span className="flex justify-end gap-3 text-xs text-ink-2">
                <button type="button" disabled={i === 0} onClick={() => touchSources(sources.map((x, j) => (j === i - 1 ? sources[i] : j === i ? sources[i - 1] : x)))} className="underline disabled:no-underline disabled:opacity-40" aria-label={L(`出典${i + 1}を上へ`, `Move source ${i + 1} up`)}>↑ {L("上へ", "Up")}</button>
                <button type="button" disabled={i === sources.length - 1} onClick={() => touchSources(sources.map((x, j) => (j === i + 1 ? sources[i] : j === i ? sources[i + 1] : x)))} className="underline disabled:no-underline disabled:opacity-40" aria-label={L(`出典${i + 1}を下へ`, `Move source ${i + 1} down`)}>↓ {L("下へ", "Down")}</button>
                <button type="button" onClick={() => touchSources(sources.filter((_, j) => j !== i))} className="underline">{L("削除", "Remove")}</button>
              </span>
            </div>
          ))}
          <button type="button" onClick={() => touchSources([...sources, { title: "", url: "" }])} className={btnGhost}>{L("出典を追加", "Add source")}</button>
        </section>

        <section className={`${card} grid gap-3 p-4`}>
          <h2 className="font-maru font-bold">{L("著者", "Author")}</h2>
          <input name="author_name" defaultValue={values.author_name} aria-label={L("著者名", "Author name")} className={input} placeholder="オオサカ堂編集部" />
        </section>
      </div>

      <MediaPicker
        open={!!picker}
        onClose={() => setPicker(null)}
        onPick={(p) => (picker === "og" ? touchSeo({ ogImage: p.src }) : touchCover({ src: p.src, alt: p.alt }))}
      />
    </form>
  );
}

function SeoPanel(p: {
  values: PostFormValues; title: string; seoTitle: string; setSeoTitle: (s: string) => void; seoDesc: string; setSeoDesc: (s: string) => void;
  excerpt: string; setExcerpt: (s: string) => void; seo: PostSeo; touchSeo: (x: Partial<PostSeo>) => void; report: ReturnType<typeof analyze>;
  slug: string; openOgPicker: () => void; cover: string;
}) {
  const L = useL();
  const { seo, touchSeo } = p;
  const shownTitle = `${p.seoTitle || p.title || L("タイトル", "Title")}｜オオサカ堂`;
  const desc = p.seoDesc || p.excerpt;
  const ogImg = seo.ogImage || p.cover;
  return (
    <section className={`${card} grid gap-4 p-4`} aria-labelledby="h-seo">
      <div className="flex items-center justify-between">
        <h2 id="h-seo" className="font-maru font-bold">SEO</h2>
        <span className="text-xs text-ink-2">{L("スコア", "Score")} {p.report.score}/100</span>
      </div>

      <div>
        <label htmlFor="kp" className={label}>{L("フォーカスキーフレーズ", "Focus keyphrase")}</label>
        <input id="kp" value={seo.focusKeyphrase ?? ""} onChange={(e) => touchSeo({ focusKeyphrase: e.target.value })} placeholder={L("例：大阪市 粗大ごみ", "e.g. 大阪市 粗大ごみ")} className={input} />
        <p className="mt-1 text-xs text-ink-2">{L("検索してほしい語句。スペース区切りの語はすべて含まれているかを確認します。", "The phrase you want to rank for. Space-separated words are each checked.")}</p>
      </div>

      <ul className="grid gap-1.5 text-[13px] leading-snug" aria-label={L("SEOチェック", "SEO checks")}>
        {p.report.checks.map((c) => (
          <li key={c.id} className="flex gap-2"><span aria-hidden className={`mt-1 size-2.5 shrink-0 rounded-full ${DOT[c.status]}`} /><span><span className="sr-only">{c.status}: </span>{L(c.ja, c.en)}</span></li>
        ))}
      </ul>

      <div>
        <div className="flex items-baseline justify-between"><label htmlFor="excerpt" className={label}>{L("概要（一覧カード用）", "Excerpt (cards)")}</label><Counter value={p.excerpt} max={300} ideal={[80, 120]} /></div>
        <textarea id="excerpt" name="excerpt" rows={3} value={p.excerpt} onChange={(e) => p.setExcerpt(e.target.value)} className={input} placeholder={L("空欄なら本文の冒頭から作ります", "Empty = taken from the start of the body")} />
      </div>
      <div>
        <div className="flex items-baseline justify-between"><label htmlFor="seo_title" className={label}>{L("SEOタイトル（末尾に「｜オオサカ堂」）", "SEO title (「｜オオサカ堂」 is appended)")}</label><Counter value={p.seoTitle} max={70} ideal={[20, 28]} /></div>
        <input id="seo_title" name="seo_title" value={p.seoTitle} onChange={(e) => p.setSeoTitle(e.target.value)} className={input} placeholder={L("空欄ならタイトル", "Empty = post title")} />
      </div>
      <div>
        <div className="flex items-baseline justify-between"><label htmlFor="seo_description" className={label}>{L("メタディスクリプション", "Meta description")}</label><Counter value={p.seoDesc} max={200} ideal={[80, 120]} /></div>
        <textarea id="seo_description" name="seo_description" rows={3} value={p.seoDesc} onChange={(e) => p.setSeoDesc(e.target.value)} className={input} placeholder={L("空欄なら概要", "Empty = excerpt")} />
      </div>

      <div role="group" aria-label={L("検索結果のプレビュー", "Search result preview")} className="rounded-lg border border-line bg-paper p-3 text-sm">
        <p className="text-[11px] text-ink-2">osakadou.live › blog › {p.slug || "…"}</p>
        <p className="line-clamp-1 text-[#1a0dab] dark:text-[#8ab4f8]">{shownTitle}</p>
        <p className="line-clamp-2 text-xs text-ink-2">{desc || L("説明文", "Description")}</p>
      </div>
      <div role="group" aria-label={L("SNSでの表示", "Social preview")} className="overflow-hidden rounded-lg border border-line bg-paper text-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {ogImg ? <img src={thumb(ogImg)} alt="" className="aspect-[1.91/1] w-full object-cover" /> : <div className="grid aspect-[1.91/1] place-items-center bg-paper-2 text-xs text-ink-2">{L("既定のOGP画像", "Default OG image")}</div>}
        <div className="p-2.5">
          <p className="text-[11px] uppercase text-ink-2">osakadou.live</p>
          <p className="line-clamp-1 font-bold">{seo.ogTitle || shownTitle}</p>
          <p className="line-clamp-1 text-xs text-ink-2">{seo.ogDescription || desc}</p>
        </div>
      </div>

      <details className="rounded-lg border border-line">
        <summary className="cursor-pointer px-3 py-2 text-sm font-bold">{L("詳細設定（canonical・OGP・robots・構造化データ）", "Advanced (canonical, OG, robots, schema)")}</summary>
        <div className="grid gap-3 border-t border-line p-3">
          <div>
            <label htmlFor="canon" className={label}>{L("canonical URL（空欄＝この記事のURL）", "Canonical URL (empty = this post)")}</label>
            <input id="canon" value={seo.canonical ?? ""} onChange={(e) => touchSeo({ canonical: e.target.value })} placeholder="/blog/…" className={`${input} font-mono text-xs`} />
          </div>
          <div>
            <label htmlFor="ogt" className={label}>{L("SNS用タイトル（og:title）", "Social title (og:title)")}</label>
            <input id="ogt" value={seo.ogTitle ?? ""} onChange={(e) => touchSeo({ ogTitle: e.target.value })} placeholder={shownTitle} className={input} />
          </div>
          <div>
            <label htmlFor="ogd" className={label}>{L("SNS用の説明（og:description）", "Social description (og:description)")}</label>
            <textarea id="ogd" rows={2} value={seo.ogDescription ?? ""} onChange={(e) => touchSeo({ ogDescription: e.target.value })} placeholder={desc} className={input} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold">{L("SNS用画像", "Social image")}</span>
            <button type="button" onClick={p.openOgPicker} className={`${btnGhost} min-h-8 px-3 text-xs`}>{seo.ogImage ? L("変更", "Change") : L("選ぶ（空欄＝アイキャッチ）", "Choose (empty = featured)")}</button>
            {seo.ogImage && <button type="button" onClick={() => touchSeo({ ogImage: "" })} className="text-xs underline">{L("外す", "Remove")}</button>}
          </div>
          <fieldset className="grid gap-1.5 text-sm">
            <legend className={label}>robots</legend>
            <label className="flex items-center gap-2"><input type="checkbox" name="noindex" defaultChecked={p.values.noindex} />{L("検索結果に表示しない（noindex）", "Hide from search results (noindex)")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!seo.nofollow} onChange={(e) => touchSeo({ nofollow: e.target.checked })} />{L("リンクをたどらせない（nofollow）", "Do not follow links (nofollow)")}</label>
          </fieldset>
          <div>
            <label htmlFor="schema" className={label}>{L("構造化データの種類", "Schema type")}</label>
            <select id="schema" value={seo.schemaType ?? "BlogPosting"} onChange={(e) => touchSeo({ schemaType: e.target.value as PostSeo["schemaType"] })} className={input}>
              <option value="BlogPosting">BlogPosting</option>
              <option value="Article">Article</option>
              <option value="NewsArticle">NewsArticle</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={seo.faqSchema !== false} onChange={(e) => touchSeo({ faqSchema: e.target.checked })} />{L("Q&A ブロックから FAQPage を出力する", "Output FAQPage from Q&A blocks")}</label>
        </div>
      </details>
    </section>
  );
}
