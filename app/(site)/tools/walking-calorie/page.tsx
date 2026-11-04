import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { MetsCalorieTool } from "@/components/tools/health/mets-calorie";
import { S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("walking-calorie");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="計算結果は推定の目安です。持病のある方や久しぶりに運動する方は、体調に合わせて無理のない範囲で歩きましょう。気になることがあるときは、医療機関に相談してください。"
      sources={[S.guide2023, S.metsTable, S.mets]}
      about={
        <>
          <p>消費カロリーは「メッツ × 時間(h) × 体重(kg)」で推定します（厚生労働省「健康づくりのための身体活動・運動ガイド2023」）。メッツは、座って安静にしているときを1として、その何倍のエネルギーを使うかで表す、運動の強さの単位です。</p>
          <p>メッツの値は、国立健康・栄養研究所の「改訂版 身体活動のメッツ（METs）表」から、入力した距離と時間で求めた平均の速さに合う歩行の区分を選びます。たとえば時速4.5〜5.1kmのほどほどの速さは3.5メッツ、時速5.6kmの速歩きは4.3メッツです。</p>
          <p>この値には、安静にしていても使うエネルギーの分も含まれます。坂道や荷物があるときは、実際の消費量は変わります。</p>
        </>
      }
    >
      <MetsCalorieTool kind="walk" />
    </ToolShell>
  );
}
