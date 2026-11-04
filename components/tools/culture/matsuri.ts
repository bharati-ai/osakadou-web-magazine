import type { PhotoSlot } from "@/lib/photos";

// Dates verified in docs/01-research.md §2.3 / §2.7 and re-checked on the linked pages (2026-10-31).
// annual: [startMonth, startDay, endMonth, endDay] repeats every year; start/end: one announced edition only.
export type Matsuri = {
  name: string;
  when: string;
  place: string;
  note: string;
  photo: PhotoSlot;
  href: string;
  src: string;
} & ({ annual: [number, number, number, number] } | { start: string; end: string });

export const MATSURI: Matsuri[] = [
  {
    name: "十日えびす（えべっさん）",
    when: "毎年1月9日〜11日",
    place: "今宮戎神社（浪速区）",
    note: "商売繁盛を願って福笹を受ける、新年の大阪の恒例行事。9日は宵戎です。",
    photo: "tsutenkaku",
    annual: [1, 9, 1, 11],
    href: "https://www.imamiya-ebisu.jp/tokaebisu",
    src: "今宮戎神社「十日戎」",
  },
  {
    name: "大阪マラソン",
    when: "2027年2月28日（日）",
    place: "大阪市内",
    note: "第15回大会。コースや交通規制は大会の発表で確認できます。",
    photo: "runRiver",
    start: "2027-02-28",
    end: "2027-02-28",
    href: "https://www.pref.osaka.lg.jp/hodo/fumin/o070110/prs_51176.html",
    src: "大阪府 報道発表資料",
  },
  {
    name: "大相撲三月場所（大阪場所）",
    when: "2027年3月14日（日）〜28日（日）",
    place: "エディオンアリーナ大阪（大阪府立体育会館）",
    note: "毎年3月に大阪で開かれる本場所。前売り券の発売日も日本相撲協会が発表しています。",
    photo: "sumo",
    start: "2027-03-14",
    end: "2027-03-28",
    href: "https://www.sumo.or.jp/Admission/schedule/",
    src: "日本相撲協会「本場所日程」",
  },
  {
    name: "愛染まつり",
    when: "毎年6月30日〜7月2日",
    place: "愛染堂勝鬘院（天王寺区）",
    note: "大阪の夏祭りのさきがけとされるお祭り。初日には宝恵駕籠の行列が出ます。",
    photo: "tsutenkaku",
    annual: [6, 30, 7, 2],
    href: "https://www.aizendo.com/whatsnew.htm",
    src: "愛染堂勝鬘院 お知らせ",
  },
  {
    name: "天神祭",
    when: "毎年7月24日（宵宮）・25日（本宮）",
    place: "大阪天満宮（北区）ほか",
    note: "25日は陸渡御と、大川をゆく船渡御、夜には奉納花火が上がります。",
    photo: "tenjinNight",
    annual: [7, 24, 7, 25],
    href: "https://osaka-info.jp/event/osakatenmangu-tenjinsai/",
    src: "OSAKA-INFO（大阪観光局）「天神祭」",
  },
  {
    name: "大阪・光の饗宴2026",
    when: "2026年11月3日（火・祝）〜2027年1月31日（日）",
    place: "御堂筋、中之島ほか",
    note: "御堂筋イルミネーションは11月3日〜12月31日。エリアごとに期間や時間が異なります。",
    photo: "seasonWinter",
    start: "2026-11-03",
    end: "2027-01-31",
    href: "https://www.hikari-kyoen.com/",
    src: "大阪・光の饗宴 公式サイト",
  },
];

const day = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 86400000;
const parse = (iso: string) => day(+iso.slice(0, 4), +iso.slice(5, 7), +iso.slice(8, 10));
const iso = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10);

/** Today's date in Japan as YYYY-MM-DD, whatever the visitor's own time zone. */
export const jstToday = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);

export type Status =
  | { s: "soon"; days: number; start: string }
  | { s: "now"; left: number }
  | { s: "tba" };

export function statusOf(ev: Matsuri, today: string): Status {
  const t = parse(today);
  let a: number, b: number;
  if ("annual" in ev) {
    const [m1, d1, m2, d2] = ev.annual;
    const y = +today.slice(0, 4);
    [a, b] = [day(y, m1, d1), day(y, m2, d2)];
    if (t > b) [a, b] = [day(y + 1, m1, d1), day(y + 1, m2, d2)];
  } else {
    [a, b] = [parse(ev.start), parse(ev.end)];
    if (t > b) return { s: "tba" };
  }
  return t < a ? { s: "soon", days: a - t, start: iso(a) } : { s: "now", left: b - t };
}
