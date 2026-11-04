import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { KaupTool } from "@/components/tools/health/kaup";
import { S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("kaup-shisuu");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="子どもの体格は成長とともに変わるため、1回の計算だけで判断せず、母子健康手帳の発育曲線や学校の健康診断の記録で推移を見てください。気になるときは、乳幼児はかかりつけの小児科や自治体の乳幼児健診で、6歳以上は学校の健康診断の結果もあわせて、養護の先生や学校医、かかりつけの小児科に相談してください。計算結果は目安で、診断ではありません。"
      sources={[S.niphGuide, S.niphManual, S.mext, S.obesity]}
      about={
        <>
          <p>カウプ指数は「体重(g) ÷ 身長(cm)の2乗 × 10」で求める乳幼児の体格の指数で、計算の中身は大人のBMIと同じです。学童期に使われてきたローレル指数は「体重(kg) ÷ 身長(cm)の3乗 × 10⁷」で求めます。</p>
          <p>子どもの標準的なカウプ指数は年齢で大きく変わるため、国立保健医療科学院の手引きでは、発育曲線と「肥満度」で体格を見るとしています。このツールも、判定には肥満度（(実測体重 − 身長別標準体重) ÷ 身長別標準体重 × 100）を使います。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>幼児（1〜5歳、身長70〜120cm）：乳幼児身体発育評価マニュアルの身長別標準体重の式を使い、±15%以内を「ふつう」とします。30%以上は医療機関に相談する目安です。</li>
            <li>学童・生徒（6〜17歳）：文部科学省の学校保健統計と同じ式で、+20%以上を肥満傾向、-20%以下を痩身傾向とします。</li>
            <li>1歳未満：母子健康手帳の発育曲線で、体重と身長の伸びを見るのが基本です。</li>
          </ul>
        </>
      }
    >
      <KaupTool />
    </ToolShell>
  );
}
