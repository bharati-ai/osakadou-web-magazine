import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { BichikuKeisanTool } from "@/components/tools/wellness/bichiku-keisan";
import { getTool } from "@/lib/tools";

const tool = getTool("bichiku-keisan");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="公的機関が示す1人あたりの目安をもとにした計算です。持病や食物アレルギーがある人、乳幼児や高齢の家族がいる家庭は、ふだん使っているものの量に合わせて多めに備えてください。"
      sources={[
        { label: "農林水産省「家庭備蓄ポータル」", href: "https://www.maff.go.jp/j/zyukyu/foodstock/" },
        { label: "農林水産省「災害時に備えた食品ストックガイド」（PDF）", href: "https://www.maff.go.jp/j/zyukyu/foodstock/guidebook/pdf/guidebook-3.pdf" },
        { label: "農林水産省「要配慮者のための災害時に備えた食品ストックガイド」（PDF）", href: "https://www.maff.go.jp/j/zyukyu/foodstock/attach/pdf/guidebook-15.pdf" },
        { label: "首相官邸：災害に対するご家庭での備え", href: "https://www.kantei.go.jp/jp/headline/bousai/sonae.html" },
        { label: "内閣府 防災情報：防災の動き（トイレの備え）", href: "https://www.bousai.go.jp/kohou/kouhoubousai/r06/111/news_08.html" },
        { label: "大阪市：災害への備え（大阪市の備蓄体制）", href: "https://www.city.osaka.lg.jp/kikikanrishitsu/page/0000388272.html" },
        { label: "大阪市水道局：飲料水を備蓄しましょう", href: "https://www.city.osaka.lg.jp/suido/page/0000476065.html" },
        { label: "環境省「ペットも守ろう！防災対策」（PDF）", href: "https://www.env.go.jp/nature/dobutsu/aigo/2_data/pamph/h2909a/pdf/full.pdf" },
        { label: "大阪市：大阪防災アプリ", href: "https://www.city.osaka.lg.jp/kikikanrishitsu/page/0000345020.html" },
      ]}
      about={
        <>
          <p>家族の人数と日数を入れると、飲料水・主食・おかず・カセットボンベ・携帯トイレの量を計算し、チェックリストにします。チェックはこの端末に保存され、印刷もできます。</p>
          <ul className="grid gap-1 pl-4 [list-style:disc]">
            <li>飲料水：1人1日3L（飲み水と調理用の水。農林水産省・首相官邸・大阪市水道局）</li>
            <li>主食とおかず：1日3食で計算。農林水産省のガイドにある「大人2人・1週間」の例（主食とおかずが1食1品ずつ）にならい、お米は1食75g程度で換算</li>
            <li>カセットボンベ：1人1週間でおよそ6本（農林水産省）</li>
            <li>携帯トイレ：1人1日5回（内閣府・経済産業省）</li>
            <li>ペット：フードと水を少なくとも5日分、できれば7日分以上（環境省）</li>
          </ul>
          <p>備蓄の日数は「最低3日分、できれば1週間分」が国の目安です。大阪市も、大規模な災害に備えて家族が1週間程度自足できる備蓄をすすめています。</p>
          <p>ふだん食べている食品を少し多めに買い置きし、使った分を買い足していけば、特別な準備をしなくても備蓄を続けやすくなります。</p>
        </>
      }
    >
      <BichikuKeisanTool />
    </ToolShell>
  );
}
