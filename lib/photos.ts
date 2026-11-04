// Verified Unsplash-License photos (see docs/03-photos.md), self-hosted in public/photos/<slot>.jpg (2400px wide).
export type Photo = {
  id: string;
  w: number;
  h: number;
  alt: string;
  caption?: string;
  by: string;
  /** CSS object-position for cover crops, e.g. "bottom" or "40% 35%" (default: center) */
  pos?: string;
};

export const photos = {
  hero: { id: "1772249491195-e95a8a5ed845", w: 3193, h: 5720, alt: "黄葉したイチョウの下を歩く親子の後ろ姿", caption: "黄葉の大阪城公園（中央区）", by: "Ryo Harianto", pos: "bottom" },
  // hero cropped to the landscape box it is shown in (bottom-anchored; see docs/audit/performance.md PF-03)
  heroWide: { id: "1772249491195-e95a8a5ed845", w: 2400, h: 1800, alt: "黄葉したイチョウの下を歩く親子の後ろ姿", caption: "黄葉の大阪城公園（中央区）", by: "Ryo Harianto", pos: "bottom" },
  minoo: { id: "1772249491247-f84f243612ab", w: 3376, h: 6000, alt: "紅葉に包まれた箕面の赤い橋", caption: "紅葉の箕面（箕面市）", by: "Ryo Harianto" },
  castleAutumn: { id: "1770284212085-20ef07376ffa", w: 3208, h: 4844, alt: "紅葉に色づく大阪城と、池に映る天守", caption: "紅葉の大阪城公園（中央区）", by: "Esaias Tan" },
  alleyCat: { id: "1646536590706-42fc527f35c9", w: 5736, h: 3226, alt: "自転車が並ぶ大阪の路地と、一匹の猫", caption: "大阪の路地で", by: "Karen Chew" },
  roseBridge: { id: "1686540576457-e73427913263", w: 5917, h: 3945, alt: "中之島公園の橋と、川沿いの緑", caption: "中之島公園ばら園の橋（北区）", by: "Mingeon Go" },
  skincare: { id: "1748543668676-ea8241cb3886", w: 5376, h: 3072, alt: "スキンケアのテクスチャーと緑の葉", caption: "スキンケアのテクスチャー（イメージ）", by: "ibnu ihza" },
  tenjinNight: { id: "1690210684306-521cdb9990a9", w: 6000, h: 4000, alt: "夜の天神祭、天神橋周辺のにぎわい", caption: "天神祭の夜（北区）", by: "Steven Marcellino" },
  skyBuilding: { id: "1598559411608-e6dddb68e5f4", w: 5763, h: 3842, alt: "見上げた梅田スカイビル", caption: "梅田スカイビル（北区）", by: "Paul Cuoco" },
  dotonboriDay: { id: "1591115280721-38563b267cf5", w: 6000, h: 4000, alt: "昼の道頓堀川と川沿いの街並み", caption: "道頓堀川（中央区）", by: "Alec Brunelle" },
  publicHall: { id: "1706861744486-dda76a322221", w: 5712, h: 4284, alt: "中之島の大阪市中央公会堂", caption: "大阪市中央公会堂（北区）", by: "explorecortex" },
  tsutenkaku: { id: "1775986351635-85d61169ed17", w: 6192, h: 4128, alt: "新世界の商店街と通天閣", caption: "新世界と通天閣（浪速区）", by: "Kent Chin" },
  castleBoat: { id: "1562118501-7b229c3dfcfb", w: 3827, h: 5741, alt: "大阪城と、堀をゆく御座船", caption: "大阪城の堀（中央区）", by: "Sebastian Kurpiel" },
  tenmaArcade: { id: "1585609332144-069e8576d9ca", w: 3456, h: 4608, alt: "天神橋筋商店街「天神橋1丁目」の入口と買い物客", caption: "天神橋筋商店街（北区）", by: "D Konishi", pos: "40% 35%" },
  okonomiyaki: { id: "1764520406362-b1673b2213bf", w: 6000, h: 4000, alt: "鉄板で焼けるお好み焼き", caption: "お好み焼き（イメージ）", by: "Yosuke Ota" },
  takoyakiPlate: { id: "1742633882704-41ec3a57dbb7", w: 6240, h: 4160, alt: "皿に盛られたたこ焼き", caption: "たこ焼き（イメージ）", by: "Allen Y" },
  matcha: { id: "1786828026440-ff6de650ed00", w: 6000, h: 4000, alt: "抹茶の器を両手で持つ様子", caption: "抹茶（イメージ）", by: "Spencer Liao" },
  platform: { id: "1746849199935-2302c71c458c", w: 6192, h: 4128, alt: "静かな駅のホーム", caption: "西九条駅（此花区）", by: "Rachel T" },
  tempozan: { id: "1636590877238-76fa57e1806a", w: 3091, h: 2048, alt: "天保山のクルーズ船と大観覧車", caption: "天保山（港区）", by: "Dong In Ham" },
  ginkgoAvenue: { id: "1765267388281-5394d21adcdc", w: 5765, h: 3924, alt: "イチョウ並木の通りを走る車", caption: "上町筋のイチョウ並木（中央区）", by: "Huy Phan" },
  skyline: { id: "1761165308046-174a56e73525", w: 6683, h: 4458, alt: "夕暮れの大阪の街並み", caption: "夕暮れの大阪", by: "Sir. Simo" },
  railroad: { id: "1769921595428-75efab3fb2bb", w: 4928, h: 3264, alt: "踏切と住宅の並ぶ街角", caption: "北区の踏切", by: "PJH" },
  // round 3 (docs/photos-r3.json)
  seasonSpring: { id: "1648945740653-b0074db98bff", w: 5472, h: 3648, alt: "川沿いの桜並木の下を歩く人々の後ろ姿", caption: "大阪市内の川沿いの桜並木（大阪市）", by: "Yasuto Takeuchi" },
  seasonSummer: { id: "1692546699056-d4c6c7c1829e", w: 3888, h: 5184, alt: "夜空に開く花火と見物客のシルエット", caption: "夏の花火（大阪）", by: "YANGHONG YU" },
  seasonWinter: { id: "1761292421196-362ca7eeee66", w: 3089, h: 2048, alt: "イルミネーションが灯る並木道を歩く人々の後ろ姿", caption: "大阪市内の冬のイルミネーション（大阪市）", by: "Margarita B" },
  wxRain: { id: "1791777831346-c140a0d33aba", w: 3361, h: 2241, alt: "雨の街角を傘をさして歩く人の後ろ姿", caption: "雨の日の大阪の街角（大阪市）", by: "Wenhao Ruan" },
  wxClear: { id: "1765434565396-ee7b5a7abc4a", w: 9504, h: 6336, alt: "晴れた空の下に広がる大阪の街並みと生駒の山並み", caption: "晴天の大阪市街（大阪市）", by: "Hat Trick" },
  wxCloudy: { id: "1588293595084-46d6e5347982", w: 5000, h: 2814, alt: "曇り空の下の川とビル群", caption: "曇天の大阪の川辺（大阪市）", by: "Ryo Harianto" },
  sento: { id: "1786343453481-3e53d1aa7108", w: 4032, h: 6048, alt: "木の浴槽と洗い場のある、人のいない浴室", caption: "木の浴槽のある浴室（イメージ）", by: "Fidel Fernando" },
  runRiver: { id: "1591537645006-47ece459f6a7", w: 4160, h: 3120, alt: "青空の下、川沿いの芝生の土手と遠くのビル群", caption: "大阪市内の河川敷（大阪市）", by: "D Konishi" },
  sleep: { id: "1764867248357-f1d63647bff3", w: 4275, h: 2814, alt: "夕方の光が差し込む寝室のベッド", caption: "やわらかな光の寝室（イメージ）", by: "Efe Kekikciler" },
  water: { id: "1723510044911-68fdbdc64f46", w: 3000, h: 2000, alt: "テーブルに置かれた一杯の水", caption: "一杯の水（イメージ）", by: "Michael Kahn" },
  mapAerial: { id: "1769307530595-3edcfc022f49", w: 9504, h: 6336, alt: "夕暮れの大阪の密集した街並みと通天閣を見下ろす", caption: "高所から見た大阪の街並み（大阪市）", by: "Hat Trick" },
  shrine: { id: "1695155441444-05c08368a68b", w: 9040, h: 6027, alt: "住吉大社の本殿と朱色の瑞垣", caption: "住吉大社（住吉区）", by: "Pourya Gohari" },
  market: { id: "1584583528653-966964d48bf1", w: 4685, h: 2933, alt: "黒門市場のアーケードと買い物客", caption: "黒門市場（中央区）", by: "Helga Christina" },
  takoyaki: { id: "1771308458012-e60e667bbddf", w: 8192, h: 5464, alt: "鉄板でたこ焼きを返す職人の手元", caption: "たこ焼きを焼く手元（イメージ）", by: "Jason Leung" },
  station: { id: "1740214784411-e41039c5f95e", w: 6192, h: 4128, alt: "Osaka Metroの乗換案内の下、階段を上る通勤客の後ろ姿", caption: "Osaka Metro の駅構内（大阪市）", by: "Sam" },
  sumo: { id: "1774014045694-a992783529e1", w: 7728, h: 5152, alt: "満員の観客に囲まれた土俵と吊り屋根", caption: "大相撲大阪場所の会場（浪速区・イメージ）", by: "Harman Tatla" },
} satisfies Record<string, Photo>;

export type PhotoSlot = keyof typeof photos;

/** Local file for a slot; next/image resizes it, and CSS object-cover crops it. */
export const photoSrc = (slot: PhotoSlot) => `/photos/${slot}.jpg`;

/** objectPosition style for a slot's cover crop (undefined = center). */
export const photoPos = (slot: PhotoSlot) => ({ objectPosition: (photos[slot] as Photo).pos });

export const photoCredits = () => [...new Set(Object.values(photos).map((p: Photo) => p.by))];

/** objectPosition for any image src: site photos keep their crop hint, uploads are centred. */
export function srcPos(src: string) {
  const slot = /^\/photos\/([A-Za-z0-9]+)\.jpg$/.exec(src)?.[1];
  return slot && slot in photos ? photoPos(slot as PhotoSlot) : undefined;
}
