import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { SuibunMeyasuTool } from "@/components/tools/wellness/suibun-meyasu";
import { getTool } from "@/lib/tools";

const tool = getTool("suibun-meyasu");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="大人向けの推定値で、必要な水分量は体格や体調、汗のかき方で変わります。心臓や腎臓の病気などで医師から水分のとり方について指示を受けている人は、その指示に従ってください。一度に大量に飲むのではなく、こまめに飲みましょう。体調に不安があるときは医療機関に相談してください。"
      sources={[
        { label: "環境省「健康のため水を飲もう」推進運動（2024年3月までは厚生労働省）", href: "https://www.env.go.jp/water/water_supply/nomou/index.html" },
        { label: "厚生労働省「日本人の食事摂取基準（2025年版）」（参考）水（PDF）", href: "https://www.mhlw.go.jp/content/10904750/001316470.pdf" },
        { label: "厚生労働省「日本人の食事摂取基準（2020年版）」（参考）水（PDF）", href: "https://www.mhlw.go.jp/content/10904750/000586571.pdf" },
        { label: "Open-Meteo（気象データ、CC BY 4.0）", href: "https://open-meteo.com/" },
      ]}
      about={
        <>
          <p>「健康のため水を飲もう」推進運動の図では、大人（成人男性の例）は1日におよそ2.5Lの水分が出入りし、そのうち食事から約1.0L、体内でつくられる水が約0.3L、飲み水で約1.2Lをとるとされています。このツールはこの1.2Lを基本に、体重に比例させた推定値を出しています（体重60kgを基準にするのは当サイトの仮定です）。極端な値にならないよう、体重は40〜90kgの範囲で計算し、それより軽い場合は40kg、重い場合は90kgとして扱います。</p>
          <p>「日本人の食事摂取基準（2020年版）」では、水の必要量は活動量が低い集団で1日2.3〜2.5L程度、高い集団で3.3〜3.5L程度と推定されています。この差をもとに、活動量が「ふつう」で0.5L、「高い」で1.0Lを上乗せしています。最新の2025年版では、日本人の水の摂取量は男性で1日約2,600〜2,750mL、女性で約2,200〜2,350mLと推定されていますが、活動量別の値は示されておらず、目安量も定められていません。そのため活動量の上乗せは2020年版の記載をもとにしています。</p>
          <p>暑い日は汗で失う水分が増えます。最高気温25℃以上で0.25L、30℃以上で0.5Lを上乗せしています（当サイトが設定した目安です）。今日の大阪の予想最高気温を自動で入れますが、自分で変えることもできます。</p>
          <p>結果は食事とは別に「飲み物でとる量」の目安です。一度にたくさん飲むより、起きたとき、寝る前、運動や入浴の前後、のどが渇く前に、こまめに飲むのがすすめられています。</p>
        </>
      }
    >
      <SuibunMeyasuTool />
    </ToolShell>
  );
}
