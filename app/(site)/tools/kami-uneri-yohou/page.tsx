import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { KamiUneriTool } from "@/components/tools/wellness/kami-uneri";
import { getTool } from "@/lib/tools";

const tool = getTool("kami-uneri-yohou");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="湿度をもとにした目安です。髪の太さやくせ、その日のスタイリングによって感じ方は大きく変わります。"
      sources={[
        { label: "気象庁：予報用語「気温、湿度」（湿度・露点温度の定義）", href: "https://www.jma.go.jp/jma/kishou/know/yougo_hp/kion.html" },
        { label: "Open-Meteo（気象データ、CC BY 4.0）", href: "https://open-meteo.com/" },
      ]}
      about={
        <>
          <p>大阪市のこれから12時間の湿度と気温の予報から、1時間ごとの「髪のうねりやすさ」を5段階の目安で表示します。データは10分ごとに自動で更新されます。</p>
          <p>判定は湿度が中心です。湿度50%未満を1、50%台を2、60%台を3、70%台を4、80%以上を5とし、露点温度が20℃以上のとき（空気中の水蒸気がとくに多いとき）は1段階上げています。この基準は当サイトが決めたもので、科学的な測定値ではありません。</p>
          <p>露点温度は、気温と湿度から計算しています（Magnusの近似式）。気象庁の定義では、空気を冷やしたときに湿度が100%になる温度のことで、高いほど空気が多くの水分を含んでいます。</p>
          <p>大阪は6月の梅雨から夏にかけて湿度が高くなります。出かける時間帯の段階を見て、まとめ髪にする、帽子をかぶるなど、その日のスタイルを決める参考にしてください。</p>
        </>
      }
    >
      <KamiUneriTool />
    </ToolShell>
  );
}
