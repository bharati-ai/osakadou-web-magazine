import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { HikkoshiTetsuzukiTool } from "@/components/tools/wellness/hikkoshi-tetsuzuki";
import { getTool } from "@/lib/tools";

const tool = getTool("hikkoshi-tetsuzuki");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="2026年10月31日時点で、大阪市や国などの公式ページを確認してまとめています。受付の窓口や時間、必要な書類は区や時期によって変わることがあるため、手続きの前に各リンク先で最新の情報を確認してください。"
      sources={[
        { label: "大阪市：転入届", href: "https://www.city.osaka.lg.jp/shimin/page/0000369822.html" },
        { label: "大阪市：転居届", href: "https://www.city.osaka.lg.jp/shimin/page/0000369826.html" },
        { label: "大阪市：オンラインによる転出届・転入（転居）予約", href: "https://www.city.osaka.lg.jp/shimin/page/0000590730.html" },
        { label: "大阪市：大阪市への引越し", href: "https://www.city.osaka.lg.jp/seisakukikakushitsu/page/0000554897.html" },
        { label: "大阪市：引越しに伴う国民健康保険の手続き", href: "https://www.city.osaka.lg.jp/fukushi/page/0000369734.html" },
        { label: "大阪市：児童手当", href: "https://www.city.osaka.lg.jp/kodomo/page/0000370608.html" },
        { label: "大阪府警察：運転免許の記載事項変更", href: "https://www.police.pref.osaka.lg.jp/tetsuduki/untenmenkyo/3700.html" },
        { label: "大阪市：引越しに伴う飼い犬登録の手続き", href: "https://www.city.osaka.lg.jp/kenko/page/0000371482.html" },
      ]}
      about={
        <>
          <p>引っ越し元や家族の状況などの質問に答えると、大阪市で必要になる手続きを、期限・窓口・公式ページへのリンクつきで一覧にします。引っ越し日を入れると、期限の目安日も表示します。</p>
          <p>大阪市に引っ越してきたときは「転入届」、同じ区の中での引っ越しは「転居届」を、どちらも引っ越した日から14日以内に区役所へ出します。大阪市内の別の区への引っ越しは、新しい区の区役所で転出と転入の届出をします（転出証明書はいりません）。</p>
          <p>国民健康保険は14日以内、児童手当は転入した日の翌日から15日以内、普通車の車検証の住所変更は15日以内、市外から来た場合の犬の登録は30日以内など、手続きごとに期限が決まっています。期限の目安日は、引っ越した日を1日目として数えた余裕のある日付です。</p>
          <p>電気・ガス・インターネットなど民間の契約は、ここには入れていません。契約している会社に早めに連絡しましょう。</p>
        </>
      }
    >
      <HikkoshiTetsuzukiTool />
    </ToolShell>
  );
}
