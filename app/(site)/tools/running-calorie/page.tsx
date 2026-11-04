import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { MetsCalorieTool } from "@/components/tools/health/mets-calorie";
import { S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("running-calorie");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="計算結果は推定の目安です。体調がすぐれないときは無理に走らず、走っている途中で胸の痛みや強い息苦しさを感じたら、すぐに中止して医療機関に相談してください。"
      sources={[S.guide2023, S.metsTable, S.mets]}
      about={
        <>
          <p>消費カロリーは「メッツ × 時間(h) × 体重(kg)」で推定します（厚生労働省「健康づくりのための身体活動・運動ガイド2023」）。メッツは、座って安静にしているときを1として、その何倍のエネルギーを使うかで表す、運動の強さの単位です。</p>
          <p>メッツの値は、国立健康・栄養研究所の「改訂版 身体活動のメッツ（METs）表」から、入力した距離と時間で求めた平均の速さに合うランニングの区分を選びます。たとえば時速8.0kmは8.3メッツ、時速9.7kmは9.8メッツ、時速12.1kmは11.5メッツです。</p>
          <p>あわせて、1kmあたりのペースや、1kmあたり・1分あたりの消費カロリーも表示します。坂道や信号待ちが多いコースでは、実際の消費量は変わります。</p>
        </>
      }
    >
      <MetsCalorieTool kind="run" />
    </ToolShell>
  );
}
