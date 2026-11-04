import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { MaintenanceTool } from "@/components/tools/health/maintenance";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("maintenance-calorie");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`持病のある方、妊娠中・授乳中の方は必要な量が変わるため、医師や管理栄養士に相談してください。${CAUTION_BASE}`}
      sources={[S.driEnergy, S.dri, S.ganpule]}
      about={
        <>
          <p>メンテナンスカロリーは、今の体重を保つのに必要な1日のエネルギー量の目安です。日本人の食事摂取基準（2025年版）の推定エネルギー必要量と同じく、「基礎代謝量 × 身体活動レベル」で推定します。</p>
          <p>基礎代謝量は国立健康・栄養研究所の式で計算します（対象は20〜74歳のため、それ以外の年齢では参考値です）。身体活動レベルは食事摂取基準の基準値で、18〜64歳は低い1.50・ふつう1.75・高い2.00、65〜74歳は1.50・1.70・1.90、75歳以上は1.40・1.70です。</p>
          <p>どのレベルか迷ったら「ふつう」から試し、体重の増減を見ながら調整するのが現実的です。</p>
        </>
      }
    >
      <MaintenanceTool />
    </ToolShell>
  );
}
