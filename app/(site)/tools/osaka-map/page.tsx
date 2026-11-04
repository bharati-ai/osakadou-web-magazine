import type { Metadata } from "next";
import { seoMeta } from "@/lib/cms/seo";
import { ToolShell } from "@/components/tools/tool-shell";
import { OsakaMapTool } from "@/components/tools/life/osaka-map";
import { getTool } from "@/lib/tools";

const tool = getTool("osaka-map");

export function generateMetadata(): Metadata {
  return seoMeta(`/tools/${tool.slug}`, tool.seoTitle ?? tool.title, "梅田・なんば・天王寺・京橋・天満・中之島、または現在地から半径1kmの病院・診療所、薬局、公園、銭湯、交番、AED、公衆トイレを地図と一覧で探せる無料ツールです。", { keywords: tool.keywords });
}

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      caution="地図のデータはボランティアが登録したもので、古い情報や未登録の施設があります。急な病気やけがで迷ったら#7119、命に関わるときは迷わず119番へ。診療時間は医療情報ネット（ナビイ）で確認してください。"
      sources={[
        { label: "OpenStreetMap（地図・施設データ、ODbL）", href: "https://www.openstreetmap.org/copyright" },
        { label: "Overpass API（OpenStreetMapのデータ検索）", href: "https://wiki.openstreetmap.org/wiki/Overpass_API" },
        { label: "医療情報ネット（ナビイ）大阪府（厚生労働省）", href: "https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2310/initialize?pref=27" },
        { label: "救急安心センターおおさか #7119（大阪市消防局）", href: "https://www.city.osaka.lg.jp/shobo/page/0000052526.html" },
      ]}
      about={
        <>
          <p>エリアか現在地を選び、探したいものを選ぶと、中心から半径1km以内の施設を地図と一覧で表示します。一覧は近い順で、距離は直線距離の目安です。「地図アプリで開く」から、その地点までの道順を調べられます。</p>
          <p>データは、誰でも編集できる地図「OpenStreetMap」から取得しています。病院・診療所（amenity=hospital / clinic / doctors）、薬局（amenity=pharmacy）、公園（leisure=park）、銭湯（amenity=public_bath）、交番・警察署（amenity=police）、AED（emergency=defibrillator）、公衆トイレ（amenity=toilets）のタグがついた場所です。</p>
          <p>銭湯には、同じタグで登録された温浴施設も含まれます。トイレとAEDは、関係者専用と登録されたものを除いています。</p>
          <p>同じ場所の検索結果は1日ごとに更新します。お出かけ前の下調べや、引っ越し先の周辺チェックにどうぞ。</p>
        </>
      }
    >
      <OsakaMapTool />
    </ToolShell>
  );
}
