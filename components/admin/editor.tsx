"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, Extension, Node, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { searchLinks, type LinkHit } from "@/app/admin/(panel)/posts/actions";
import { useL } from "./lang";
import { MediaPicker } from "./media-picker";
import { btnGhost, btnPrimary, input, label } from "./ui";

// --- Schema: mirrors lib/cms/html.ts ALLOWED_TAGS / ALLOWED_CLASSES so editor output round-trips through the sanitizer.

/** class="" on paragraphs (ol-lead) and lists (ol-steps / ol-check / ol-sources). Link has its own class attribute (ol-linkcard). */
const ClassAttr = Extension.create({
  name: "olClass",
  addGlobalAttributes() {
    return [{
      types: ["paragraph", "bulletList", "orderedList"],
      attributes: { class: { default: null, parseHTML: (el) => el.getAttribute("class"), renderHTML: (a) => (a.class ? { class: a.class } : {}) } },
    }];
  },
});

const Box = Node.create({
  name: "olBox",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "note",
        parseHTML: (el) => /ol-box--(point|note|caution|info)/.exec(el.className)?.[1] ?? "note",
        renderHTML: (a) => ({ class: `ol-box ol-box--${a.variant}` }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "aside.ol-box" }, { tag: "div.ol-box" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", HTMLAttributes, 0];
  },
});

const Figure = Node.create({
  name: "olFigure",
  group: "block",
  content: "inline*",
  draggable: true,
  isolating: true,
  addAttributes() {
    return { src: { default: null }, alt: { default: "" }, narrow: { default: false } };
  },
  parseHTML() {
    return [{
      tag: "figure",
      contentElement: (dom: HTMLElement) => dom.querySelector("figcaption") ?? document.createElement("figcaption"),
      getAttrs: (el: HTMLElement) => {
        const img = el.querySelector("img");
        return img ? { src: img.getAttribute("src"), alt: img.getAttribute("alt") ?? "", narrow: el.classList.contains("ol-figure--narrow") } : false;
      },
    }];
  },
  renderHTML({ node }) {
    return ["figure", { class: node.attrs.narrow ? "ol-figure ol-figure--narrow" : "ol-figure" }, ["img", { src: node.attrs.src, alt: node.attrs.alt }], ["figcaption", 0]];
  },
});

const FaqQ = Node.create({
  name: "olFaqQ",
  content: "inline*",
  defining: true,
  parseHTML() { return [{ tag: "summary" }]; },
  renderHTML() { return ["summary", 0]; },
});

const Faq = Node.create({
  name: "olFaq",
  group: "block",
  content: "olFaqQ block+",
  defining: true,
  parseHTML() { return [{ tag: "details" }]; },
  // always open while editing; the sanitizer drops `open` on save
  renderHTML() { return ["details", { class: "ol-faq", open: "open" }, 0]; },
});

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: { openOnClick: false, autolink: true, HTMLAttributes: { target: null, rel: null } },
  }),
  ClassAttr,
  Box,
  Figure,
  FaqQ,
  Faq,
  Image.configure({ inline: false, allowBase64: true }),
  TableKit.configure({ table: { resizable: false } }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight,
  CharacterCount,
]; // + Placeholder, added per language in RichEditor

// --- Toolbar

function Btn({ on, label: l, title, active, disabled }: { on: () => void; label: React.ReactNode; title: string; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      className={`grid h-10 min-w-10 place-items-center rounded-md px-1.5 text-[13px] font-bold transition disabled:opacity-40 ${active ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
    >
      {l}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px bg-line" aria-hidden />;

function listClass(ed: Editor, kind: "orderedList" | "bulletList", cls: string | null) {
  const c = ed.chain().focus();
  if (!ed.isActive(kind)) (kind === "orderedList" ? c.toggleOrderedList() : c.toggleBulletList());
  c.updateAttributes(kind, { class: cls }).run();
}

function Toolbar({ editor, onImage, onLink, html, toggleHtml }: { editor: Editor; onImage: () => void; onLink: () => void; html: boolean; toggleHtml: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : e.isActive("heading", { level: 4 }) ? "h4" : "p",
      bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"), strike: e.isActive("strike"), mark: e.isActive("highlight"), code: e.isActive("code"),
      link: e.isActive("link"), lead: e.isActive("paragraph", { class: "ol-lead" }),
      ul: e.isActive("bulletList") && !e.isActive("bulletList", { class: "ol-check" }), check: e.isActive("bulletList", { class: "ol-check" }),
      ol: e.isActive("orderedList") && !e.isActive("orderedList", { class: "ol-steps" }), steps: e.isActive("orderedList", { class: "ol-steps" }),
      quote: e.isActive("blockquote"), box: e.isActive("olBox"), table: e.isActive("table"),
      center: e.isActive({ textAlign: "center" }), right: e.isActive({ textAlign: "right" }),
      undo: e.can().undo(), redo: e.can().redo(),
    }),
  });
  const ch = () => editor.chain().focus();
  const L = useL();
  return (
    <div role="toolbar" aria-label={L("書式", "Formatting")} className="sticky top-[var(--sticky-top,0px)] z-10 flex flex-wrap items-center gap-0.5 rounded-t-[var(--radius-card)] border-b border-line bg-card/95 px-2 py-1.5 backdrop-blur">
      <Btn title={L("元に戻す", "Undo")} label="↶" on={() => ch().undo().run()} disabled={!s.undo || html} />
      <Btn title={L("やり直す", "Redo")} label="↷" on={() => ch().redo().run()} disabled={!s.redo || html} />
      <Sep />
      <select
        aria-label={L("段落の種類", "Block type")}
        disabled={html}
        value={s.block}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") ch().setParagraph().run();
          else ch().toggleHeading({ level: Number(v[1]) as 2 | 3 | 4 }).run();
        }}
        className="h-8 rounded-md border border-line bg-card px-2 text-[13px]"
      >
        <option value="p">{L("本文", "Paragraph")}</option>
        <option value="h2">{L("見出し2（大）", "Heading 2 (large)")}</option>
        <option value="h3">{L("見出し3（中）", "Heading 3 (medium)")}</option>
        <option value="h4">{L("見出し4（小）", "Heading 4 (small)")}</option>
      </select>
      <Btn title={L("リード文（記事冒頭の要約）", "Lead (summary at the top of the post)")} label={L("リード", "Lead")} active={s.lead} disabled={html} on={() => ch().setParagraph().updateAttributes("paragraph", { class: s.lead ? null : "ol-lead" }).run()} />
      <Sep />
      <Btn title={L("太字", "Bold")} label={<b>B</b>} active={s.bold} disabled={html} on={() => ch().toggleBold().run()} />
      <Btn title={L("斜体", "Italic")} label={<i>I</i>} active={s.italic} disabled={html} on={() => ch().toggleItalic().run()} />
      <Btn title={L("下線", "Underline")} label={<u>U</u>} active={s.underline} disabled={html} on={() => ch().toggleUnderline().run()} />
      <Btn title={L("取り消し線", "Strikethrough")} label={<s>S</s>} active={s.strike} disabled={html} on={() => ch().toggleStrike().run()} />
      <Btn title={L("マーカー", "Highlight")} label={<span className="bg-[linear-gradient(transparent_55%,rgb(184_57_31/0.35)_55%)] px-0.5">M</span>} active={s.mark} disabled={html} on={() => ch().toggleHighlight().run()} />
      <Btn title={L("コード", "Code")} label="</>" active={s.code} disabled={html} on={() => ch().toggleCode().run()} />
      <Btn title={L("リンク（記事・ツールを検索）", "Link (search posts and tools)")} label="🔗" active={s.link} disabled={html} on={onLink} />
      <Sep />
      <Btn title={L("箇条書き", "Bulleted list")} label="・" active={s.ul} disabled={html} on={() => (s.ul ? ch().toggleBulletList().run() : listClass(editor, "bulletList", null))} />
      <Btn title={L("番号付きリスト", "Numbered list")} label="1." active={s.ol} disabled={html} on={() => (s.ol ? ch().toggleOrderedList().run() : listClass(editor, "orderedList", null))} />
      <Btn title={L("手順（ステップ）", "Steps")} label={L("手順", "Steps")} active={s.steps} disabled={html} on={() => (s.steps ? ch().toggleOrderedList().run() : listClass(editor, "orderedList", "ol-steps"))} />
      <Btn title={L("チェックリスト", "Checklist")} label="✓" active={s.check} disabled={html} on={() => (s.check ? ch().toggleBulletList().run() : listClass(editor, "bulletList", "ol-check"))} />
      <Btn title={L("引用", "Quote")} label="❝" active={s.quote} disabled={html} on={() => ch().toggleBlockquote().run()} />
      <Sep />
      <select
        aria-label={L("囲みボックス", "Callout box")}
        disabled={html}
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (v === "remove") ch().lift("olBox").run();
          else if (v) (s.box ? ch().updateAttributes("olBox", { variant: v }) : ch().wrapIn("olBox", { variant: v })).run();
        }}
        className="h-8 rounded-md border border-line bg-card px-2 text-[13px]"
      >
        <option value="">{L("囲み…", "Box…")}</option>
        <option value="point">{L("ポイント", "Key points")}</option>
        <option value="note">{L("メモ", "Note")}</option>
        <option value="caution">{L("注意", "Caution")}</option>
        <option value="info">{L("確認先", "Contact info")}</option>
        {s.box && <option value="remove">{L("囲みを外す", "Remove box")}</option>}
      </select>
      <Btn title={L("画像を挿入", "Insert image")} label="🖼" disabled={html} on={onImage} />
      <Btn
        title={L("表を挿入", "Insert table")}
        label={L("表", "Table")}
        active={s.table}
        disabled={html}
        on={() => ch().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      />
      <Btn
        title={L("Q&A（よくある質問）を挿入", "Insert Q&A (FAQ)")}
        label="Q&A"
        disabled={html}
        on={() => ch().insertContent({ type: "olFaq", content: [{ type: "olFaqQ", content: [{ type: "text", text: "質問を入力" }] }, { type: "paragraph", content: [{ type: "text", text: "答えを入力" }] }] }).run()}
      />
      <Btn title={L("区切り線", "Divider")} label="―" disabled={html} on={() => ch().setHorizontalRule().run()} />
      <Sep />
      <Btn title={L("中央ぞろえ", "Align center")} label="≡" active={s.center} disabled={html} on={() => (s.center ? ch().unsetTextAlign() : ch().setTextAlign("center")).run()} />
      <Btn title={L("右ぞろえ", "Align right")} label="⇥" active={s.right} disabled={html} on={() => (s.right ? ch().unsetTextAlign() : ch().setTextAlign("right")).run()} />
      <Sep />
      <Btn title={L("HTML を直接編集", "Edit HTML directly")} label="HTML" active={html} on={toggleHtml} />
      {s.table && !html && (
        <div className="flex w-full flex-wrap gap-1 border-t border-line pt-1.5 text-xs">
          <span className="self-center px-1 text-ink-2">{L("表：", "Table:")}</span>
          {([[L("行を下に追加", "Add row below"), () => ch().addRowAfter().run()], [L("列を右に追加", "Add column right"), () => ch().addColumnAfter().run()], [L("行を削除", "Delete row"), () => ch().deleteRow().run()], [L("列を削除", "Delete column"), () => ch().deleteColumn().run()], [L("見出し行の切替", "Toggle header row"), () => ch().toggleHeaderRow().run()], [L("セル結合/分割", "Merge/split cells"), () => ch().mergeOrSplit().run()], [L("表を削除", "Delete table"), () => ch().deleteTable().run()]] as const).map(([t, f]) => (
            <button key={t} type="button" onMouseDown={(e) => e.preventDefault()} onClick={f} className="rounded border border-line px-2 py-1 hover:bg-paper-2">{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Link dialog with internal search (interlinking)

function LinkDialog({ editor, open, onClose }: { editor: Editor; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [href, setHref] = useState("");
  const [card, setCard] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<LinkHit[]>([]);
  const L = useL();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      const a = editor.getAttributes("link");
      setHref(a.href ?? "");
      setCard(a.class === "ol-linkcard");
      setQ(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to).slice(0, 30));
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open, editor]);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchLinks(q).then(setHits).catch(() => setHits([])), 200);
    return () => clearTimeout(t);
  }, [q, open]);

  function apply(url = href, title?: string) {
    const ch = editor.chain().focus().extendMarkRange("link");
    if (!url) ch.unsetLink().run();
    else if (editor.state.selection.empty) ch.insertContent({ type: "text", text: title ?? url, marks: [{ type: "link", attrs: { href: url, class: card ? "ol-linkcard" : null } }] }).run();
    else ch.setLink({ href: url, class: card ? "ol-linkcard" : null } as never).run();
    onClose();
  }

  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(640px,calc(100vw-24px))] rounded-[var(--radius-card)] border border-line bg-card p-5 text-ink backdrop:bg-black/50">
      <h2 className="font-maru text-lg font-bold">{L("リンク", "Link")}</h2>
      <div className="mt-3 grid gap-3">
        <div>
          <label className={label} htmlFor="ln-href">URL</label>
          <input id="ln-href" value={href} onChange={(e) => setHref(e.target.value)} placeholder={L("/blog/slug や https://… ", "/blog/slug or https://…")} className={input} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={card} onChange={(e) => setCard(e.target.checked)} />
          {L("「あわせて読みたい」カードで表示する（記事へのリンクを段落に単独で置くとき）", "Show as a “Related reading” card (when the post link sits alone in a paragraph)")}
        </label>
        <div>
          <label className={label} htmlFor="ln-q">{L("サイト内を検索（記事・ツール・ページ）", "Search this site (posts, tools, pages)")}</label>
          <input id="ln-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L("キーワード", "Keyword")} className={input} />
          <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {hits.map((h) => (
              <li key={h.href}>
                <button type="button" onClick={() => (editor.state.selection.empty ? apply(h.href, h.title) : setHref(h.href))} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-paper-2">
                  <span className="shrink-0 rounded bg-paper-2 px-1.5 text-[11px] text-ink-2">{h.kind}</span>
                  <span className="min-w-0 flex-1 truncate">{h.title}</span>
                  <span className="shrink-0 text-xs text-ink-2">{h.href}</span>
                </button>
              </li>
            ))}
            {!hits.length && <li className="px-3 py-4 text-center text-sm text-ink-2">{L("見つかりません", "No results")}</li>}
          </ul>
        </div>
        <div className="flex justify-end gap-2">
          {editor.isActive("link") && <button type="button" className={btnGhost} onClick={() => apply("")}>{L("リンクを外す", "Remove link")}</button>}
          <button type="button" className={btnGhost} onClick={onClose}>{L("キャンセル", "Cancel")}</button>
          <button type="button" className={btnPrimary} onClick={() => apply()}>{L("適用", "Apply")}</button>
        </div>
      </div>
    </dialog>
  );
}

// --- Editor

export function RichEditor({ name, initial, onChange }: { name: string; initial: string; onChange?: (html: string) => void }) {
  const [html, setHtml] = useState(initial);
  const [source, setSource] = useState(false);
  const [picker, setPicker] = useState(false);
  const [link, setLink] = useState(false);
  const L = useL();
  const ph = L("本文を書きはじめましょう。見出しは「見出し2」から使います。", "Start writing. Use “Heading 2” for your main headings.");
  // ponytail: the placeholder language is fixed when the editor mounts; a language switch shows on the next page load.
  const exts = useMemo(() => [...extensions, Placeholder.configure({ placeholder: ph })], [ph]);
  const editor = useEditor({
    extensions: exts,
    content: initial,
    immediatelyRender: false,
    editorProps: { attributes: { class: "ol-article min-h-[520px] px-5 py-6 outline-none [line-break:strict] md:px-8", "aria-label": L("本文", "Body"), role: "textbox", "aria-multiline": "true" } },
    onUpdate: ({ editor: e }) => { const h = e.getHTML(); setHtml(h); onChange?.(h); },
  });
  const chars = useEditorState({ editor, selector: ({ editor: e }) => e?.storage.characterCount.characters() ?? 0 }) ?? 0;

  function toggleSource() {
    if (!editor) return;
    if (source) editor.commands.setContent(html, { emitUpdate: true });
    else setHtml(editor.getHTML());
    setSource(!source);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-line-strong bg-card focus-within:border-shu focus-within:ring-2 focus-within:ring-shu/25">
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} onImage={() => setPicker(true)} onLink={() => setLink(true)} html={source} toggleHtml={toggleSource} />}
      {source ? (
        <textarea
          aria-label={L("本文（HTML）", "Body (HTML)")}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          className="block min-h-[520px] w-full resize-y bg-paper-2 p-4 font-mono text-[13px] leading-relaxed text-ink outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      <div className="flex flex-wrap justify-between gap-2 border-t border-line px-4 py-2 text-xs text-ink-2">
        <span>{L(`${chars.toLocaleString()}文字・約${Math.max(1, Math.round(chars / 500))}分で読めます`, `${chars.toLocaleString()} characters · about ${Math.max(1, Math.round(chars / 500))} min read`)}</span>
        <span>{L("保存すると、使えないタグやクラスは自動で取り除かれます（スタイルガイド参照）", "Unsupported tags and classes are removed when you save (see the style guide).")}</span>
      </div>
      {editor && (
        <>
          <MediaPicker
            open={picker}
            withCaption
            onClose={() => setPicker(false)}
            onPick={(p) => editor.chain().focus().insertContent({ type: "olFigure", attrs: { src: p.src, alt: p.alt }, content: p.caption ? [{ type: "text", text: p.caption }] : [] }).run()}
          />
          <LinkDialog editor={editor} open={link} onClose={() => setLink(false)} />
        </>
      )}
    </div>
  );
}
