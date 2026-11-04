import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { SuiminCycleTool } from "@/components/tools/wellness/suimin-cycle";
import { getTool } from "@/lib/tools";

const tool = getTool("suimin-cycle");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, tool.description ?? tool.short, { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="睡眠のリズムや必要な睡眠時間には個人差があります。この計算は目安で、眠りの質を保証するものではありません。眠れない、日中の強い眠気が続くなど気になることがあれば、医療機関に相談してください。"
      sources={[
        { label: "厚生労働省「健康づくりのための睡眠ガイド2023」", href: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/suimin/index.html" },
        { label: "同ガイド本文（PDF）", href: "https://www.mhlw.go.jp/content/001305530.pdf" },
        { label: "e-ヘルスネット（厚生労働省）：ノンレム睡眠", href: "https://kennet.mhlw.go.jp/information/information/keywords/non-rem-sleep.html" },
      ]}
      about={
        <>
          <p>眠りは、夢を見ることが多い「レム睡眠」と、大脳を休める「ノンレム睡眠」が約90分の周期でくり返すとされています（e-ヘルスネット）。このツールは1サイクルを90分として、起きたい時刻からさかのぼって布団に入る時刻を、または寝る時刻から起きる時刻を計算します。寝つくまでの時間も足しています。</p>
          <p>実際のサイクルの長さは人によって違い、一晩のなかでも変わります。計算結果は「このあたりの時刻」という目安として使ってください。</p>
          <p>厚生労働省「健康づくりのための睡眠ガイド2023」では、睡眠時間の目安を次のように示しています。</p>
          <ul className="grid gap-1 pl-4 [list-style:disc]">
            <li>成人：個人差はあるが、6時間以上を目安に必要な睡眠時間を確保する</li>
            <li>高齢者：床にいる時間（床上時間）が8時間以上にならないことを目安にする</li>
            <li>中学・高校生：8〜10時間、小学生：9〜12時間を参考にする</li>
            <li>1〜2歳児は11〜14時間、3〜5歳児は10〜13時間（米国睡眠医学会の推奨として紹介）</li>
          </ul>
          <p>候補の「目安の範囲」は、これらの推奨にあてはまる睡眠時間かどうかを示しています。高齢者は、健康日本21（第三次）の目標にある60歳以上の睡眠6〜8時間もふまえて判定しています。</p>
        </>
      }
    >
      <SuiminCycleTool />
    </ToolShell>
  );
}
