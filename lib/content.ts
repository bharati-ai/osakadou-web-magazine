import type { PhotoSlot } from "./photos";

// Copy and facts carried over from the reviewed legacy page (docs/01-research.md, round 1-5 critiques).

export const FEATURES = [
  { href: "#calendar", n: "01", title: "いまの大阪、どんな空？", sub: "天気と季節の行事、今日のくらし指数", photo: "castleAutumn" },
  { href: "#areas", n: "02", title: "大阪の「ふだん」を歩く", sub: "キタ・ミナミから天満まで、6エリアの横顔", photo: "tenmaArcade" },
  { href: "#unwell", n: "03", title: "近所のお医者さん、どう探す？", sub: "#7119から休日の診療所まで、相談先の一覧", photo: "roseBridge" },
  { href: "/tools", n: "04", title: "使える、無料ツール", sub: "BMIから肌予報、近くの施設マップまで", photo: "skincare" },
  { href: "#checklist", n: "05", title: "ごみの日、いつやったっけ？", sub: "防災・医療・手続きを12項目でチェック", photo: "alleyCat" },
] as const satisfies readonly { href: string; n: string; title: string; sub: string; photo: PhotoSlot }[];

export const HERO_SLIDES: { photo: PhotoSlot; caption: string }[] = [
  { photo: "heroWide", caption: "黄葉の大阪城公園（中央区）" },
  { photo: "tenmaArcade", caption: "天神橋筋商店街（北区）" },
  { photo: "roseBridge", caption: "中之島公園ばら園の橋（北区）" },
  { photo: "tenjinNight", caption: "天神祭の夜（北区）" },
  { photo: "market", caption: "黒門市場（中央区）" },
];

export const AREAS = [
  { kanji: "北", name: "キタ", ward: "梅田・大阪駅周辺／北区", photo: "skyBuilding", desc: "JR大阪駅と梅田の各駅が集まる北の玄関口。高層ビルと迷路のような地下街、お初天神や阪急東通の飲み屋街が混ざり合う街です。", day: "買い物も乗り換えも一度に済ませたい日", stations: "大阪、梅田、東梅田、西梅田、大阪梅田、北新地" },
  { kanji: "南", name: "ミナミ", ward: "なんば・心斎橋／中央区・浪速区", photo: "dotonboriDay", desc: "道頓堀の川沿いに看板が並び、心斎橋筋の商店街がなんばへと続く繁華街。劇場や飲食店も多く、夜遅くまでにぎわいます。", day: "にぎやかな街を食べ歩きしたい日", stations: "なんば、心斎橋、日本橋、大阪難波、JR難波" },
  { kanji: "中", name: "中之島・北浜", ward: "北区・中央区", photo: "publicHall", desc: "堂島川と土佐堀川に挟まれた中洲に、美術館や図書館、近代建築が並びます。対岸の北浜は、大阪取引所とレトロビルの並ぶ街です。", day: "川沿いで建築と美術を眺める日", stations: "淀屋橋、北浜、なにわ橋、大江橋、渡辺橋、中之島" },
  { kanji: "天", name: "天王寺・阿倍野", ward: "天王寺区・阿倍野区・浪速区", photo: "tsutenkaku", desc: "天王寺公園や動物園、四天王寺のある街に、あべのハルカスが建つ南の拠点。通天閣の新世界へも歩いてすぐです。", day: "公園と下町を気ままに歩く日", stations: "天王寺、大阪阿部野橋、阿倍野、天王寺駅前、四天王寺前夕陽ケ丘" },
  { kanji: "城", name: "京橋・大阪城", ward: "都島区・中央区", photo: "castleBoat", desc: "大阪城公園の緑と石垣を望むエリア。京橋は複数の路線が交わる乗換駅で、駅前には飲食店が集まります。", day: "お城のまわりを散歩したい日", stations: "京橋、大阪城公園、森ノ宮、大阪ビジネスパーク、天満橋、谷町四丁目" },
  { kanji: "宮", name: "天満・天神橋筋", ward: "北区", photo: "tenmaArcade", desc: "大阪天満宮の門前町として育った、天神橋筋商店街のある街。アーケードが南北に長く続き、日々の買い物客でにぎわいます。", day: "商店街で晩ごはんの買い物をする日", stations: "南森町、大阪天満宮、扇町、天満、天神橋筋六丁目" },
] as const satisfies readonly { kanji: string; name: string; ward: string; photo: PhotoSlot; desc: string; day: string; stations: string }[];

export type Season = "spring" | "summer" | "autumn" | "winter";
export const SEASONS: { id: Season; label: string; months: string; photo: PhotoSlot; memo: string; events: { month: string; title: string; note: string; photo?: PhotoSlot }[] }[] = [
  {
    id: "spring", label: "春", months: "3〜5月", photo: "seasonSpring",
    memo: "スギやヒノキの花粉が飛ぶ季節です。飛散情報を確かめ、つらい症状が続くときは医療機関に相談を。",
    events: [
      { month: "3月", title: "大相撲三月場所", note: "毎年3月、エディオンアリーナ大阪（大阪府立体育会館）", photo: "sumo" },
      { month: "4月", title: "造幣局 桜の通り抜け", note: "例年4月中旬の約1週間・事前予約制", photo: "seasonSpring" },
      { month: "5月", title: "中之島公園ばら園の見頃", note: "例年5月中旬（秋は10月中旬）", photo: "roseBridge" },
    ],
  },
  {
    id: "summer", label: "夏", months: "6〜8月", photo: "seasonSummer",
    memo: "6月は平年では、1年でいちばん雨の多い月。8月の平年の日最高気温は33.7℃。具合が悪いときは涼しい場所で休み、水分を。意識がおかしいときは迷わず119番を。",
    events: [
      { month: "6月", title: "愛染まつり（愛染堂勝鬘院）", note: "毎年6月30日〜7月2日。大阪の夏祭りのさきがけとされる" },
      { month: "7月", title: "天神祭（大阪天満宮）", note: "例年7月24・25日、船渡御や奉納花火", photo: "tenjinNight" },
      { month: "7〜8月", title: "住吉祭（住吉大社）", note: "7月の海の日から8月1日まで", photo: "shrine" },
    ],
  },
  {
    id: "autumn", label: "秋", months: "9〜11月", photo: "castleAutumn",
    memo: "大阪の平年の月平均気温は、10月が19.5℃、11月が13.8℃。ひと月で5℃以上下がります。脱ぎ着しやすい服で調節を。",
    events: [
      { month: "9月", title: "岸和田だんじり祭（9月祭礼）", note: "2026年は9月19・20日（岸和田・春木地区）" },
      { month: "10月", title: "岸和田だんじり祭（10月祭礼）", note: "2026年は10月10・11日（山手地区）" },
      { month: "11月", title: "大阪・光の饗宴", note: "2026年は11月3日〜翌1月31日", photo: "seasonWinter" },
    ],
  },
  {
    id: "winter", label: "冬", months: "12〜2月", photo: "seasonWinter",
    memo: "空気が乾燥し、かぜやインフルエンザなどの感染症が増えやすい時期です。発熱が続くときは医療機関に相談を。",
    events: [
      { month: "12月", title: "御堂筋イルミネーション", note: "2026年は12月31日まで・約4km" },
      { month: "1月", title: "十日えびす（えべっさん）", note: "毎年1月9日〜11日、今宮戎神社" },
      { month: "2月", title: "大阪マラソン", note: "2027年は2月28日（日）開催予定", photo: "runRiver" },
    ],
  },
];

export const seasonOf = (month: number): Season => (["winter", "spring", "summer", "autumn"] as const)[Math.floor((month % 12) / 3)];

export const HELP_QUICK = [
  { when: "救急車を呼ぶか迷ったら", hours: "24時間", num: "#7119", tel: "%237119", alt: "06-6582-7119", altTel: "0665827119" },
  { when: "夜間の子どもの急病", hours: "19時〜翌8時", num: "#8000", tel: "%238000", alt: "06-6765-3650", altTel: "0667653650" },
  { when: "いま受診できる医療機関", hours: "24時間", num: "06-6693-1199", tel: "0666931199" },
] as const;

export const HELP_RESOURCES = [
  { title: "救急安心センターおおさか", icon: "Ambulance", link: { label: "#7119", href: "tel:%237119" }, meta: "つながらないとき 06-6582-7119／24時間・365日", when: "急な病気やけがで、救急車を呼ぶか、すぐ病院へ行くか迷うとき。看護師などが、医師の支援のもとで相談に応じます。", source: { label: "大阪市消防局", href: "https://www.city.osaka.lg.jp/shobo/page/0000052526.html" } },
  { title: "小児救急電話相談", icon: "Baby", link: { label: "#8000", href: "tel:%238000" }, meta: "つながらないとき 06-6765-3650／毎日19:00〜翌8:00", when: "夜間に子どもの急な病気やけがで、どうしたらよいか迷うとき。看護職の相談員が相談に応じます。", source: { label: "大阪府", href: "https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi_02.html" } },
  { title: "大阪府救急医療情報センター", icon: "PhoneCall", link: { label: "06-6693-1199", href: "tel:0666931199" }, meta: "24時間・365日", when: "いま診療を受けられる医療機関を、電話で教えてほしいとき。", source: { label: "大阪府", href: "https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi_01.html" } },
  { title: "医療機関を探す", icon: "MagnifyingGlass", link: { label: "医療情報ネット（ナビイ）", href: "https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2310/initialize?pref=27" }, meta: "厚生労働省が運営する検索サイト（大阪府のページ）", when: "近くの病院や診療所、歯科、薬局を、場所や診療科から調べたいとき。", source: { label: "大阪府", href: "https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi_01.html" } },
  { title: "休日・夜間急病診療所（大阪市）", icon: "FirstAid", link: { label: "休日・夜間急病診療所の案内", href: "https://www.city.osaka.lg.jp/kenko/page/0000371474.html" }, meta: "診療科と受付時間は公式ページでご確認ください", when: "休日や夜間に、急な病気で受診先を探しているとき。受診前に電話で確認してください。", source: { label: "大阪市健康局", href: "https://www.city.osaka.lg.jp/kenko/page/0000371474.html" } },
  { title: "大阪救急ナビ", icon: "Compass", link: { label: "大阪救急ナビ（大阪府）", href: "https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi.html" }, meta: "救急の相談窓口と医療機関の探し方をまとめた府のページ", when: "どの窓口に相談すればよいか、まとめて確かめたいとき。", source: { label: "大阪府", href: "https://www.pref.osaka.lg.jp/o100030/iryo/qq/osaka-qq-navi.html" } },
] as const;

export const CHECKLIST = [
  { group: "防災", items: [
    { id: "c1-1", label: "大阪防災アプリを入れている", note: "大阪市が提供。大阪府内全域の避難所や防災情報を確認できます" },
    { id: "c1-2", label: "自宅周辺の水害ハザードマップを見た", note: "大阪市は24区それぞれの水害ハザードマップを公開しています" },
    { id: "c1-3", label: "近くの避難所の場所を確かめた", note: "大阪防災アプリの地図でも、避難所を確認できます" },
    { id: "c1-4", label: "水や食料などの備えを用意した", note: "備蓄の量は「防災備蓄の目安計算」ツールでも確かめられます" },
  ]},
  { group: "医療・健康", items: [
    { id: "c2-1", label: "#7119と#8000をスマホの連絡先に登録した", note: "救急車を呼ぶか迷うときと、子どもの夜間の電話相談です" },
    { id: "c2-2", label: "相談できるかかりつけ医がいる", note: "健康のことを相談でき、必要なときは専門医を紹介してくれる身近な医師" },
    { id: "c2-3", label: "特定健診の受け方を確かめた", note: "大阪市国保の40〜74歳は無料。受診券を持って受診します" },
    { id: "c2-4", label: "がん検診の対象と費用を確かめた", note: "大阪市は年齢などで対象が決まり、費用は無料〜1,500円です" },
  ]},
  { group: "暮らしの手続き", items: [
    { id: "c3-1", label: "転入届を14日以内に出した", note: "大阪市は区役所などの窓口で。引っ越し前や郵送では出せません" },
    { id: "c3-2", label: "ごみの4分類と収集日を確かめた", note: "収集日は地域で異なります。「さんあ～る」や収集マップで確認を" },
    { id: "c3-3", label: "粗大ごみの出し方を確かめた", note: "大阪市では30cmを超えるものなどが対象。事前予約制で有料です" },
    { id: "c3-5", label: "自転車保険に入っているか確かめた", note: "大阪府では2016年7月から、自転車利用者の保険加入が義務です" },
  ]},
] as const;

export const CHECKLIST_SOURCES = [
  { label: "大阪市（がん検診）", href: "https://www.city.osaka.lg.jp/kenko/page/0000008503.html" },
  { label: "大阪市（転入届）", href: "https://www.city.osaka.lg.jp/shimin/page/0000369822.html" },
  { label: "大阪市（ごみ）", href: "https://www.city.osaka.lg.jp/kankyo/page/0000009337.html" },
  { label: "大阪市（大阪防災アプリ）", href: "https://www.city.osaka.lg.jp/kikikanrishitsu/page/0000345020.html" },
  { label: "大阪府（自転車保険）", href: "https://www.pref.osaka.lg.jp/o130080/dorokankyo/osakajitensha/jitensya-hoken.html" },
];

export const THEMES = [
  { id: "living", n: "01", title: "大阪の暮らし", en: "Living in Osaka", photo: "alleyCat", desc: "駅前の喫茶店、自転車で通うスーパー、近所の公園。大阪の街で毎日をどう過ごすかを、住む人の目線で取り上げます。", series: ["大阪で一人暮らしを始める前に", "大阪の商店街さんぽ", "水都大阪の川べりを歩く"] },
  { id: "health", n: "02", title: "健康・医療", en: "Health & Medical", photo: "roseBridge", desc: "かかりつけ医の見つけ方や、休日・夜間に困ったときの相談先など、医療の基本情報を、公的機関の情報をもとに扱います。", series: ["大阪でかかりつけ医を見つけるには", "大阪市のがん検診・特定健診ガイド", "大阪の休日・夜間の医療相談ガイド"] },
  { id: "beauty", n: "03", title: "美容・ウェルネス", en: "Beauty & Wellness", photo: "skincare", desc: "スキンケア、睡眠、食事、からだを動かす習慣など、毎日のセルフケアの基本を。成分表示や情報の読み方も一緒に考えます。", series: ["化粧品の成分表示の読み方", "美容医療の前に確かめたい、契約と相談先", "大阪の気候に合わせた、季節のスキンケア"] },
  { id: "culture", n: "04", title: "ひと・トレンド・カルチャー", en: "People & Culture", photo: "market", desc: "だしや粉もん、銭湯、ミュージアム。大阪の暮らしに根づく文化を、店を営む人やつくる人の話とあわせて紹介します。", series: ["大阪のだしと粉もんの話", "大阪の銭湯をめぐる", "中之島のミュージアムめぐり"] },
  { id: "guide", n: "05", title: "暮らしのガイド", en: "Living Guide", photo: "station", desc: "ごみの出し方、防災の備え、引っ越しの手続きなど、大阪で暮らすための実用情報を、自治体の公式情報へのリンクとともに。", series: ["大阪市のごみ分別と出し方", "大阪で引っ越したときの手続き一覧", "南海トラフ地震に備える大阪の防災"] },
] as const satisfies readonly { id: string; n: string; title: string; en: string; photo: PhotoSlot; desc: string; series: readonly string[] }[];
