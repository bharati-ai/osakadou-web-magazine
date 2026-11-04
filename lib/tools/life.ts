import { MapTrifold } from "@phosphor-icons/react/dist/ssr";
import type { ToolMeta } from "./types";

export const LIFE_TOOLS: ToolMeta[] = [
  {
    slug: "osaka-map",
    title: "大阪 近くの施設マップ",
    short: "梅田・なんばなどの周辺1kmにある病院、公園、銭湯、交番、AED、トイレを地図で探せます。",
    seoTitle: "大阪 近くの施設マップ｜病院・AED・トイレ・銭湯",
    description: "梅田・なんば・天王寺など大阪市内の主な駅や現在地の周辺1kmにある病院、AED、公衆トイレ、交番、公園、銭湯を地図で探せます。データはOpenStreetMapです。",
    category: "life",
    icon: MapTrifold,
    photo: "alleyCat",
    keywords: ["大阪 近くの病院 地図", "大阪 AED 場所", "大阪 銭湯 近く", "大阪 公衆トイレ", "梅田 交番", "なんば 公園"],
  },
];
