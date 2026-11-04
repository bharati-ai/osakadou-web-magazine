import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { KisoTaishaTool } from "@/components/tools/health/kiso-taisha";
import { CAUTION_BASE, S } from "@/components/tools/health/sources";
import { getTool } from "@/lib/tools";

const tool = getTool("kiso-taisha");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution={`筋肉量がとても多い方や、病気の治療中・妊娠中の方は、推定値が実際とずれやすくなります。${CAUTION_BASE}`}
      sources={[S.driEnergy, S.dri, S.ganpule, S.miyake]}
      about={
        <>
          <p>基礎代謝量は、目が覚めている状態で、体を動かさずに静かにしているときに使われる、生きるために最低限必要なエネルギー量です。</p>
          <p>このツールでは、国立健康・栄養研究所の式（Ganpuleら、2007年）で計算します。日本人のデータから作られた式で、日本人の成人を対象にした検証でも誤差が小さかったと報告されています。式は日本人の食事摂取基準（2025年版）に載っている形を使っています。同基準では、この式の対象は20〜74歳とされているため、18〜19歳と75歳以上の方は参考値としてご覧ください。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>男性：(0.0481×体重 + 0.0234×身長 − 0.0138×年齢 − 0.4235) × 1000 ÷ 4.186</li>
            <li>女性：(0.0481×体重 + 0.0234×身長 − 0.0138×年齢 − 0.9708) × 1000 ÷ 4.186</li>
          </ul>
          <p>くらべる値として、ハリス・ベネディクトの式、食事摂取基準の「基礎代謝基準値（体重1kgあたり）× 体重」、同じ性別・年代の参照体重での基礎代謝量も表示します。</p>
        </>
      }
    >
      <KisoTaishaTool />
    </ToolShell>
  );
}
