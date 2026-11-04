import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { OsakaBenTool } from "@/components/tools/culture/osaka-ben";
import { getTool } from "@/lib/tools";

const tool = getTool("osaka-ben");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, "標準語の文章を入れると、「〜やで」「〜ねん」「せえへん」「おおきに」など大阪弁らしい言い回しに変換します。例文つき、コピーと共有もできる無料の遊びツールです。", { keywords: tool.keywords });
}

const EXAMPLES: [string, string][] = [
  ["〜だ／〜だよ", "〜や／〜やで"],
  ["〜ではない／〜じゃない", "〜やない／〜ちゃう"],
  ["〜なんだ／〜んだ", "〜やねん／〜ねん"],
  ["〜たんだ", "〜てん（買うてん、行ってん）"],
  ["しない／行かない／知らない", "せえへん／行かへん／知らん"],
  ["〜しないで", "〜せんといて"],
  ["〜しなければならない", "〜せなあかん"],
  ["ありがとう", "おおきに"],
  ["とても／本当に", "めっちゃ／ほんまに"],
  ["いい／いくら／捨てる", "ええ／なんぼ／ほかす"],
];

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="決まったルールで言い回しを置きかえる遊びの変換で、正確な方言の翻訳ではありません。大阪府内でも地域や世代、場面によって言い方は変わります。"
      about={
        <>
          <p>入力した文章を、よく使われる大阪弁の言い回しに置きかえます。辞書で単語を引くのではなく、語尾や決まった言い方のパターンを順番に当てはめるしくみです。</p>
          <p>たとえば「〜だよ」は「〜やで」、「〜なんだ」は「〜やねん」、「行かない」は「行かへん」になります。「捨てる」が「ほかす」、「いくら」が「なんぼ」になるような、単語の言いかえも少し入っています。</p>
          <ul className="grid gap-1 text-[13.5px]">
            {EXAMPLES.map(([a, b]) => (
              <li key={a}>
                <span className="text-ink-2">{a}</span>
                <span aria-hidden> → </span>
                <span className="sr-only">は</span>
                <b>{b}</b>
              </li>
            ))}
          </ul>
          <p>ていねい語（です・ます）はなるべくそのまま残します。ふだんの話し言葉で入れると、大阪弁らしい結果になりやすいです。LINEのひとことや、SNSの投稿にどうぞ。</p>
        </>
      }
    >
      <OsakaBenTool />
    </ToolShell>
  );
}
