import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { PfcTool } from "@/components/tools/health/pfc";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("pfc-balance");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`減量中も、たんぱく質の推奨量（成人女性50g、男性65g、65歳以上の男性60g）を下回らないようにしましょう。持病のある方、妊娠中・授乳中の方は、医師や管理栄養士の指示を優先してください。${CAUTION_BASE}`}
      sources={[S.driBalance, S.driProtein, S.driEnergy, S.guide2023, S.ganpule]}
      about={
        <>
          <p>PFCバランスは、エネルギーをたんぱく質（P）・脂質（F）・炭水化物（C）からどんな割合でとるかを表します。日本人の食事摂取基準（2025年版）の目標量は、たんぱく質13〜20%（50〜64歳は14〜20%、65歳以上は15〜20%）、脂質20〜30%、炭水化物50〜65%です。</p>
          <p>目標エネルギーは「基礎代謝量（国立健康・栄養研究所の式）× 身体活動レベル」を維持の目安とし（この式の対象は20〜74歳）、減量・増量では1日あたり約233kcalを減らす・増やすとしています。今のBMIが18.5未満のときは、「減量」は選べません。体脂肪1kgを減らすのに約7,000kcalが必要という目安（身体活動・運動ガイド2023）を、月1kgのペースにあてはめた数字です。</p>
          <p>配分は目標量の範囲内で、維持はたんぱく質15%・脂質25%・炭水化物60%、減量と増量はたんぱく質を20%に寄せて脂質25%・炭水化物55%にしています。グラム数は、たんぱく質と炭水化物を1gあたり4kcal、脂質を9kcalとして計算します。</p>
        </>
      }
    >
      <PfcTool />
    </ToolShell>
  );
}
