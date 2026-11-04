import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { TaishibouTool } from "@/components/tools/health/taishibou-ritsu";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("taishibou-ritsu");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`推定式の結果は、実際の体脂肪率と数%以上ずれることがあります。妊娠中の方、むくみのある方、筋肉量がとても多い方は特にずれやすくなります。${CAUTION_BASE}`}
      sources={[S.bodyFat, S.obesity, S.cunBae, S.deurenberg, S.bmiCheck]}
      about={
        <>
          <p>体脂肪率は、体重のうち脂肪が占める割合です。このツールでは、測定機器がなくても使える3つの推定式で計算し、結果を幅で示します。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>CUN-BAE式：BMI・年齢・性別から推定します（Gómez-Ambrosiら、2012年）。</li>
            <li>Deurenberg式：1.2×BMI＋0.23×年齢−10.8×性別（男性1、女性0）−5.4（Deurenbergら、1991年）。</li>
            <li>米海軍式：ウエスト・首まわり（女性はヒップも）と身長から推定します（Hodgdon・Beckett、1984年の米海軍の報告）。</li>
          </ul>
          <p>どの式も欧米の成人のデータから作られていて、日本人にあてはめると数%ずれることがあります。e-ヘルスネットによると、成人の体脂肪率の基準値はまだ決まっておらず、肥満の判定にはBMIが使われます。比較には、メタボリックシンドロームの腹囲の基準（男性85cm以上、女性90cm以上）を表示します。</p>
        </>
      }
    >
      <TaishibouTool />
    </ToolShell>
  );
}
