import { CalendarStar, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import type { ToolMeta } from "./types";

export const CULTURE_TOOLS: ToolMeta[] = [
  {
    slug: "osaka-ben",
    title: "大阪弁変換",
    short: "標準語の文を、大阪弁らしい言い回しに変換します。コピーや共有もできる、遊びの変換ツールです。",
    seoTitle: "大阪弁変換｜標準語を大阪弁の言い回しに",
    category: "culture",
    icon: ChatCircleText,
    photo: "tenmaArcade",
    keywords: ["大阪弁 変換", "関西弁 変換", "大阪弁 翻訳", "標準語 大阪弁", "大阪弁 例文"],
  },
  {
    slug: "matsuri-countdown",
    title: "大阪の祭り・行事まで、あと何日？",
    short: "十日えびす、愛染まつり、天神祭、大阪マラソン、大相撲三月場所、光の饗宴まで、あと何日かを数えます。",
    seoTitle: "大阪の祭り・行事カウントダウン｜天神祭まであと何日",
    description: "十日えびす、愛染まつり、天神祭、大阪マラソン、大相撲三月場所、光の饗宴まで、あと何日かを数えます。日程は年ごとに変わるため、主催者の公式情報もご確認ください。",
    category: "culture",
    icon: CalendarStar,
    photo: "tenjinNight",
    keywords: ["天神祭 2027 いつ", "十日えびす 日程", "愛染まつり 日程", "大阪マラソン 2027", "大相撲 三月場所 2027", "大阪 光の饗宴 2026"],
  },
];
