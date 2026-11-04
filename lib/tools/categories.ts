import type { PhotoSlot } from "@/lib/photos";

export const TOOL_CATEGORIES = [
  { id: "health", label: "からだ・健康", short: "BMI・体脂肪・カロリー", photo: "runRiver" },
  { id: "beauty", label: "美容・ウェルネス", short: "肌予報・睡眠・水分", photo: "skincare" },
  { id: "life", label: "くらし・地図", short: "近くの施設マップ・手続き", photo: "mapAerial" },
  { id: "guide", label: "防災・ガイド", short: "備蓄の目安", photo: "platform" },
  { id: "culture", label: "カルチャー", short: "大阪弁・祭りまで何日", photo: "market" },
] as const satisfies readonly { id: string; label: string; short: string; photo: PhotoSlot }[];

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]["id"];
