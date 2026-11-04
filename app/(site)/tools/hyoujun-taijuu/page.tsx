import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { TargetWeightTool } from "@/components/tools/health/target-weight";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("hyoujun-taijuu");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`標準体重は統計上の目安で、一人ひとりが目指すべき体重を決めるものではありません。筋肉量や持病によって、合う体重は変わります。${CAUTION_BASE}`}
      sources={[S.obesity, S.bmiCheck, S.driEnergy]}
      about={
        <>
          <p>標準体重は「身長(m) × 身長(m) × 22」で計算します。BMI22は、統計上、肥満と関係の深い糖尿病や高血圧、脂質異常症にもっともかかりにくい値とされています（e-ヘルスネット「肥満と健康」）。</p>
          <p>ただし、健康的な体重には幅があります。日本人の食事摂取基準（2025年版）は「目標とするBMI」を、18〜49歳で18.5〜24.9、50〜64歳で20.0〜24.9、65歳以上で21.5〜24.9としています。高齢期は、総死亡率に加えてほかの健康への影響も考えて、下限が高めに設定されています。</p>
          <p>年齢を入れると、その年代の目標とするBMIにあたる体重の範囲も表示します。早見表では、身長140〜185cmの標準体重を一覧にしています。</p>
        </>
      }
    >
      <TargetWeightTool bmi={22} name="標準体重" />
    </ToolShell>
  );
}
