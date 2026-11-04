import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { KinnikuTool } from "@/components/tools/health/kinniku";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("kinniku-ryou");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`結果はすべて推定値で、体組成計やDXAでの測定値とは異なります。体脂肪率の測り方によっても大きく変わります。筋力の衰えが気になるときは、医療機関に相談してください。${CAUTION_BASE}`}
      sources={[S.lee, S.kouri, S.awgs, S.sarcopenia, S.bodyFat]}
      about={
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>除脂肪体重：体重 × (1 − 体脂肪率 ÷ 100)。筋肉だけでなく、骨や内臓、水分も含みます。</li>
            <li>骨格筋量：Leeらが2000年に発表した、体重・身長・年齢・性別から推定する式を使います（アジア系の補正を含む）。BMI30未満の成人のMRIデータから作られた式です。</li>
            <li>FFMI：除脂肪体重 ÷ 身長(m)の2乗。補正FFMIは、Kouriらの方法で身長1.8mにそろえた値です。</li>
          </ul>
          <p>サルコペニア（加齢などで筋肉量と筋力が落ちた状態）の診断に使うSMIは、腕と脚の筋肉量を機器で測る必要があるため、このツールでは計算していません。アジアの基準（AWGS 2019）では、最初のチェックとして、ふくらはぎ周囲長が男性34cm未満、女性33cm未満かどうかを使います。</p>
        </>
      }
    >
      <KinnikuTool />
    </ToolShell>
  );
}
