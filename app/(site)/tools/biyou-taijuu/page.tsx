import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { TargetWeightTool } from "@/components/tools/health/target-weight";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("biyou-taijuu");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`美容体重は見た目の目安として広まった言葉で、医学的な基準や健康の目標ではありません。急な減量や、食事を極端に減らすことは避けてください。${CAUTION_BASE}`}
      sources={[S.bmiCheck, S.obesity, S.driEnergy, S.edPortal]}
      about={
        <>
          <p>美容体重は、BMI20にあたる体重（身長(m) × 身長(m) × 20）を指して使われることが多い言葉です。雑誌やインターネットで広まった呼び方で、医学的な基準ではありません。</p>
          <p>BMI20は、日本肥満学会の区分では「普通体重」（18.5以上25未満）の範囲です。ただし日本人の食事摂取基準（2025年版）の「目標とするBMI」は、50〜64歳で20.0以上、65歳以上で21.5以上です。年代によっては、BMI20が目標の下限にあたるか、下限を下回ることを知っておきましょう。</p>
          <p>このツールでは、美容体重とあわせて、標準体重（BMI22）や普通体重の範囲、年代別の目標とするBMIの体重も表示します。</p>
        </>
      }
    >
      <TargetWeightTool bmi={20} name="美容体重" />
    </ToolShell>
  );
}
