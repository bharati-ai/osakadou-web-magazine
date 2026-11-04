import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { TargetWeightTool } from "@/components/tools/health/target-weight";
import { S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("cinderella-taijuu");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="BMI18は低体重にあたるため、健康の目標にはしないでください。食事や体重のことで悩んでいるとき、体調に変化があるときは、ひとりで抱えずに医療機関に相談してください。計算結果は目安で、診断ではありません。"
      sources={[S.bmiCheck, S.obesity, S.driEnergy, S.edPortal, S.edConsult]}
      about={
        <>
          <p>シンデレラ体重は、BMI18にあたる体重（身長(m) × 身長(m) × 18）を指して、インターネットなどで使われる言葉です。医学的な基準ではありません。</p>
          <p>日本肥満学会の区分では、BMI18.5未満は「低体重」です。BMI18はこの範囲に入り、日本人の食事摂取基準（2025年版）が示す「目標とするBMI」の下限（18〜49歳で18.5、50〜64歳で20.0、65歳以上で21.5）を、どの年代でも下回ります。</p>
          <p>このページでは、いちばん大きく低体重の境目（BMI18.5）の体重を示し、標準体重（BMI22）や年代別の目標とするBMIの体重も表示します。体重の目安には、こちらの数字を参考にしてください。18歳未満の方には、大人のBMIの区分はあてはまりません。</p>
        </>
      }
    >
      <TargetWeightTool bmi={18} name="シンデレラ体重" />
    </ToolShell>
  );
}
