import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { SupeTool } from "@/components/tools/health/supe";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("supe-keisan");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`スペは体格を言い表すための俗語で、健康状態を表すものではありません。数字を大きくするための減量はしないでください。18歳未満の方には、大人のBMIの区分はあてはまりません。${CAUTION_BASE}`}
      sources={[S.bmiCheck, S.obesity, S.edPortal, S.edConsult]}
      about={
        <>
          <p>「スペ」は、身長（cm）から体重（kg）を引いた数を指す、インターネット上の俗語です。たとえば身長160cm・体重50kgなら110になります。医学的な指標ではありません。</p>
          <p>同じスペ値でも、身長によってBMIは変わります。このツールはスペ値をBMIと日本肥満学会の区分に置きかえ、あなたの身長で普通体重（BMI18.5以上25未満）にあたるスペ値の範囲を示します。目標体重の計算はしません。</p>
          <p>体格を見るときは、スペの数字よりも、BMIや標準体重（BMI22）を目安にしてください。</p>
        </>
      }
    >
      <SupeTool />
    </ToolShell>
  );
}
