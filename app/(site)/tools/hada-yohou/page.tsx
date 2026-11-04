import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { HadaYohouTool } from "@/components/tools/wellness/hada-yohou";
import { getTool } from "@/lib/tools";

const tool = getTool("hada-yohou");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="肌の状態には個人差があります。ここに出るのは天気予報から見た一般的な目安で、肌トラブルの診断や治療に代わるものではありません。赤みやかゆみなど気になる症状が続くときは、皮膚科などの医療機関に相談してください。"
      sources={[
        { label: "環境省「紫外線環境保健マニュアル2020」（PDF）", href: "https://www.env.go.jp/content/900410651.pdf" },
        { label: "気象庁：UVインデックスとは", href: "https://www.jma.go.jp/jma/kishou/know/env/uvhp/3-50uvindex_manual.html" },
        { label: "気象庁：予報用語「気温、湿度」", href: "https://www.jma.go.jp/jma/kishou/know/yougo_hp/kion.html" },
        { label: "Open-Meteo（気象データ、CC BY 4.0）", href: "https://open-meteo.com/" },
      ]}
      about={
        <>
          <p>大阪市の天気予報（紫外線・湿度・気温・風）をもとに、今日の「乾燥しやすさ」「日差しの強さ」「汗ばみやすさ」「寒暖差」を5段階で表示します。データは10分ごとに自動で更新されます。</p>
          <p>日差しの強さは、環境省「紫外線環境保健マニュアル」のUVインデックスの区分（1〜2 弱い、3〜5 中程度、6〜7 強い、8〜10 非常に強い、11以上 極端に強い）に合わせています。UVインデックス3以上では、日陰を選ぶ、長袖や帽子、日焼け止めを使うといった対策がすすめられています。</p>
          <p>乾燥しやすさは今日これからの最小湿度と風の強さ、汗ばみやすさは最高気温と湿度、寒暖差は最高気温と最低気温の差から、当サイトが決めたわかりやすい基準で判定しています。</p>
          <p>大阪は夏に湿度が高く、冬は乾燥しやすい気候です。季節の変わり目は、毎日の予報を見ながら保湿や日差し対策を調整すると、無理なく続けられます。</p>
        </>
      }
    >
      <HadaYohouTool />
    </ToolShell>
  );
}
