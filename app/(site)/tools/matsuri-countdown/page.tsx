import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { MatsuriCountdown } from "@/components/tools/culture/matsuri-countdown";
import { MATSURI } from "@/components/tools/culture/matsuri";
import { getTool } from "@/lib/tools";

const tool = getTool("matsuri-countdown");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, "天神祭（7月24日・25日）、十日えびす（1月9日〜11日）、愛染まつり、大阪マラソン2027、大相撲三月場所2027、大阪・光の饗宴2026まで、あと何日かがひと目でわかります。", { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="日程は主催者の都合で変わることがあります。お出かけ前に、各公式サイトで最新の情報を確認してください。"
      sources={MATSURI.map((e) => ({ label: e.src, href: e.href }))}
      about={
        <>
          <p>日本時間の今日から、各行事の初日までの日数を数えます。開催期間に入ると「開催中」と、終わりまでの日数を表示します。</p>
          <p>十日えびす（1月9日〜11日）、愛染まつり（6月30日〜7月2日）、天神祭（7月24日・25日）は毎年同じ日付なので、終わると次の年の日程で数え直します。</p>
          <p>大阪マラソン、大相撲三月場所、大阪・光の饗宴は年ごとに日程が決まる行事です。主催者が発表した回だけを数え、終わったあとは「日程は主催者の発表を確認」と表示します。</p>
          <p>日付は、それぞれの主催者や公式の発表で確認したものです。休みの予定づくりや、旅行・帰省の計画にどうぞ。</p>
        </>
      }
    >
      <MatsuriCountdown />
    </ToolShell>
  );
}
