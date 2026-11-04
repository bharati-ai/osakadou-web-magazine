import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { BmiTool } from "@/components/tools/health/bmi";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("bmi");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`BMIは体格の目安で、筋肉量や脂肪のつき方までは表しません。妊娠中の方や18歳未満の方には、この判定はあてはまりません。${CAUTION_BASE}`}
      sources={[S.bmiCheck, S.obesity, S.driEnergy, S.nhns]}
      about={
        <>
          <p>BMIは「体重(kg) ÷ 身長(m) ÷ 身長(m)」で求める体格の指数です。日本肥満学会の区分では、18.5未満が低体重、18.5以上25未満が普通体重、25以上が肥満（1度〜4度）です。</p>
          <p>標準体重は、統計上、肥満と関係の深い糖尿病や高血圧などにかかりにくいとされるBMI22にあたる体重です（e-ヘルスネット「肥満と健康」）。18歳未満の方には大人の区分はあてはまらないため、年齢に18未満を入れると判定は表示しません。あわせて、日本人の食事摂取基準（2025年版）が年代別に示す「目標とするBMI」（18〜49歳は18.5〜24.9、50〜64歳は20.0〜24.9、65歳以上は21.5〜24.9）の体重も表示します。</p>
          <p>平均との比較には、厚生労働省「令和6年国民健康・栄養調査報告」の第14表（身長・体重の平均値）と第15表（BMIの平均値）を使っています。2024年の調査で、全国補正値です。</p>
        </>
      }
    >
      <BmiTool />
    </ToolShell>
  );
}
