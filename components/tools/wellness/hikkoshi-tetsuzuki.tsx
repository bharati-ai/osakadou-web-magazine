"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { Choice } from "../fields";
import { CheckRow, TogglePill, useChecked } from "./shared";

type From = "outside" | "otherWard" | "sameWard";
type Kids = "none" | "school" | "small";
type Flag = "kokuho" | "myna" | "license" | "inkan" | "car" | "kei" | "moped" | "bike" | "bicycle" | "dog" | "chip";
export type Answers = { from: From; kids: Kids; flags: Set<Flag> };

/** A procedure. `days` + `count`: "day" = 引っ越した日から, "next" = 翌日から, "before" = 引っ越し日のN日前まで. */
export type Step = {
  id: string; title: string; when: string; where: string; href: string; src: string; note?: string;
  days?: number; count?: "day" | "next" | "before"; early?: boolean;
};

const C = "https://www.city.osaka.lg.jp";
const P = "https://www.police.pref.osaka.lg.jp";

// Every deadline and place below was checked on the linked official page (2026-10-31).
export function buildSteps({ from, kids, flags }: Answers): Step[] {
  const out = from === "outside";
  const s: Step[] = [];
  const has = (f: Flag) => flags.has(f);

  if (from === "sameWard")
    s.push({ id: "jumin", title: "転居届", when: "引っ越した日から14日以内", days: 14, count: "day", where: "お住まいの区の区役所（窓口サービス課）", href: `${C}/shimin/page/0000369826.html`, src: "大阪市：転居届" });
  else
    s.push({
      id: "jumin", title: out ? "転入届" : "転入届（市内の別の区へ）", when: "引っ越した日から14日以内", days: 14, count: "day",
      where: "新しい住所の区役所（窓口サービス課）", href: `${C}/shimin/page/0000369822.html`, src: "大阪市：転入届",
      note: out
        ? "引っ越す前の届出や郵送はできません。前の市区町村の転出証明書を持参します（マイナポータルで転出届をした場合は不要）。"
        : "新しい区の区役所で、転出と転入の届出をまとめて行います。大阪市内の引っ越しなので転出証明書はいりません。",
    });

  if (has("myna"))
    s.push({
      id: "myna", title: "マイナンバーカードの住所変更", days: 14, count: "day",
      when: out ? "転入届と同時に（転入届から90日を過ぎると失効）" : "住所の届出と同時に",
      where: "区役所（窓口サービス課）", href: `${C}/hirano/page/0000682369.html`, src: "大阪市平野区：マイナンバーカードの住所変更",
      note: "署名用電子証明書は住所変更で失効します。必要なら同じ窓口で発行し直せます。",
    });

  if (has("kokuho")) {
    s.push({ id: "kokuho", title: out ? "国民健康保険の加入" : "国民健康保険の住所変更", when: "14日以内（世帯主が届出）", days: 14, count: "day", where: "区役所（保険年金業務担当）", href: `${C}/fukushi/page/0000369734.html`, src: "大阪市：引越しに伴う国民健康保険の手続き" });
    s.push({ id: "nenkin", title: "国民年金（第1号被保険者）の住所", when: "マイナンバーと基礎年金番号が結びついていれば、原則届出は不要", where: "結びついていない人は区役所へ", href: "https://www.nenkin.go.jp/service/kokunen/kanyu/20120803.html", src: "日本年金機構：住所変更" });
  }

  if (kids !== "none") {
    if (out) s.push({ id: "jidou", title: "児童手当の申請", when: "転入した日の翌日から15日以内", days: 15, count: "next", where: "区の保健福祉センター（郵送・オンラインも可）", href: `${C}/kodomo/page/0000370608.html`, src: "大阪市：児童手当" });
    else if (from === "otherWard") s.push({ id: "jidou", title: "児童手当の手続きの確認", when: "区をまたぐ引っ越しのため、手続きが必要か確認を", early: true, where: "新しい区の保健福祉センター", href: `${C}/kodomo/page/0000370608.html`, src: "大阪市：児童手当" });
    s.push({ id: "iryo", title: out ? "こども医療費助成の申請" : "こども医療費助成の住所変更", when: out ? "転入後、早めに（期限の記載はありません）" : "住所が変わったら必ず届出（期限の記載はありません）", early: true, where: "区の保健福祉センター（医療助成担当）", href: `${C}/kodomo/page/0000369443.html`, src: "大阪市：こどもの医療費助成" });
    if (kids === "school")
      s.push(out
        ? { id: "school", title: "小・中学校の転校", when: "転入届のあと", early: true, where: "区役所（就学事務担当）で就学通知書を受け取り、新しい学校へ", href: `${C}/kyoiku/page/0000010127.html`, src: "大阪市：小学校・中学校の転校" }
        : { id: "school", title: "小・中学校の就学手続き", when: "転居・転入の手続きのあと", early: true, where: "お住まいの区役所", href: `${C}/kyoiku/page/0000372142.html`, src: "大阪市：市内転居する場合" });
  }

  if (has("inkan") && out)
    s.push({ id: "inkan", title: "印鑑登録", when: "必要になったら（前の市区町村の登録は転出で廃止されます）", early: true, where: "区役所", href: `${C}/shimin/page/0000369902.html`, src: "大阪市：印鑑登録申請" });

  if (has("license"))
    s.push({ id: "license", title: "運転免許証の住所変更", when: "速やかに", early: true, where: "警察署（水上署・関空署を除く）、門真・光明池の運転免許試験場", href: `${P}/tetsuduki/untenmenkyo/3700.html`, src: "大阪府警察：記載事項変更", note: "受付を終えた警察署もあります。行く前に受付場所を確認しましょう。" });

  if (has("car")) {
    s.push({ id: "car", title: "車検証の住所変更（変更登録）", when: "住所が変わった日から15日以内", days: 15, count: "day", where: "新しい住所を管轄する運輸支局", href: "https://laws.e-gov.go.jp/law/326AC0000000185", src: "道路運送車両法 第12条（e-Gov法令検索）" });
    s.push({ id: "garage", title: "車庫証明（保管場所証明）の申請", when: "変更登録とあわせて", early: true, where: "新しい保管場所を管轄する警察署", href: `${P}/tetsuduki/shako/henko/12307.html`, src: "大阪府警察：保管場所証明" });
  }
  if (has("kei"))
    s.push({ id: "kei", title: "軽自動車の住所変更", when: "15日以内（道路運送車両法）", days: 15, count: "day", where: "軽自動車検査協会 大阪主管事務所（住之江区）", href: "https://www.keikenkyo.or.jp/procedures/change_address.html", src: "軽自動車検査協会：住所変更", note: "警察署への保管場所の届出も必要です。" });
  if (has("moped") && out)
    s.push({ id: "moped", title: "原付（125cc以下）のナンバー登録", when: "転入した日から10日以内", days: 10, count: "day", where: "市税事務所（オンライン申請も可）", href: `${C}/zaisei/page/0000021471.html`, src: "大阪市：軽自動車税のQ&A", note: "先に前の市区町村で廃車の手続きをして、廃車証明書を持っていきます。" });
  if (has("bike"))
    s.push({ id: "bike", title: "126cc以上のバイクの住所変更", when: "250cc超は15日以内。126〜250ccの期限は運輸支局で確認を", days: 15, count: "day", where: "なにわ自動車検査登録事務所（住之江区）", href: `${C}/zaisei/page/0000370636.html`, src: "大阪市：軽自動車税" });

  if (has("bicycle")) {
    s.push({ id: "bohan", title: "自転車の防犯登録の住所変更", when: "期限の定めはありません", early: true, where: "自転車防犯登録所（自転車販売店）や警察署", href: `${P}/seikatsu/bohan/6611.html`, src: "大阪府警察：自転車防犯登録" });
    s.push({ id: "hoken", title: "自転車保険の加入を確認", when: "大阪府では加入が義務です", early: true, where: "加入中の保険の補償内容を確認", href: "https://www.pref.osaka.lg.jp/o130080/dorokankyo/osakajitensha/jitensya-hoken.html", src: "大阪府：自転車保険の加入義務" });
  }

  if (has("dog"))
    s.push(out
      ? { id: "dog", title: "犬の登録の変更", when: "引っ越した日から30日以内", days: 30, count: "day", where: "区の保健福祉センター（前の市区町村の鑑札を持参）", href: `${C}/kenko/page/0000371482.html`, src: "大阪市：引越しに伴う飼い犬登録" }
      : { id: "dog", title: "犬の登録の住所変更", when: "期限の定めはありません（郵送・電話・オンラインも可）", early: true, where: "区の保健福祉センター", href: `${C}/kenko/page/0000371482.html`, src: "大阪市：引越しに伴う飼い犬登録" });
  if (has("chip"))
    s.push({ id: "chip", title: "マイクロチップ登録の変更（犬・猫）", when: "変更から30日以内", days: 30, count: "day", where: "環境省の犬と猫のマイクロチップ情報登録（オンライン）", href: "https://www.env.go.jp/nature/dobutsu/aigo/pickup/chip_qa.html", src: "環境省：マイクロチップQ&A", note: "マイクロチップ登録をしている犬は、こちらの変更で区への届出が不要になります。" });

  s.push({ id: "water", title: "水道の使用開始の届出", when: "使用開始日の5日前までが原則", days: 5, count: "before", where: "大阪市水道局（マイページ・電話）", href: `${C}/suido/page/0000370402.html`, src: "大阪市水道局：水道の使用開始の届出", note: "大阪市内で引っ越すときは、今の住所の使用中止の届出もあわせて。" });
  s.push({ id: "post", title: "郵便の転居届（1年間の転送）", when: "期限はなし。登録まで数日かかるので引っ越し前に", count: "before", where: "e転居（ネット）・郵便局の窓口", href: "https://www.post.japanpost.jp/service/receive/relocation/", src: "日本郵便：転居・転送サービス" });
  s.push({ id: "sodai", title: "粗大ごみの申込み", when: "予約制。引っ越し前に早めに", count: "before", where: "粗大ごみ収集受付センター（ネット・電話）", href: `${C}/kankyo/page/0000515879.html`, src: "大阪市：粗大ごみ収集の申込み" });
  return s;
}

const DOW = "日月火水木金土";
function dueDate(move: string, st: Step) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(move);
  if (!m || st.days === undefined) return null;
  // conservative: 「日から」は引っ越した日を1日目として数える（法定の期限より1日早い目安になることがあります）
  const off = st.count === "before" ? -st.days : st.count === "next" ? st.days : st.days - 1;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + off);
  return `${d.getMonth() + 1}月${d.getDate()}日（${DOW[d.getDay()]}）`;
}

const GROUPS: { key: string; label: string; test: (s: Step) => boolean }[] = [
  { key: "before", label: "引っ越しの前に", test: (s) => s.count === "before" },
  { key: "2w", label: "引っ越しから2週間ほどで", test: (s) => s.count !== "before" && s.days !== undefined && s.days <= 15 },
  { key: "1m", label: "1か月以内に", test: (s) => s.count !== "before" && s.days !== undefined && s.days > 15 },
  { key: "early", label: "早めに・必要に応じて", test: (s) => s.days === undefined && s.count !== "before" },
];

export function HikkoshiTetsuzukiTool() {
  const id = useId();
  const [from, setFrom] = useState<From>("outside");
  const [kids, setKids] = useState<Kids>("none");
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["myna"]));
  const [move, setMove] = useState("");
  const { checked, toggle, reset } = useChecked("osaka-live:hikkoshi");
  const flip = (f: Flag) => (on: boolean) => setFlags((o) => { const n = new Set(o); if (on) n.add(f); else n.delete(f); return n; });
  const steps = buildSteps({ from, kids, flags });
  const done = steps.filter((s) => checked[s.id]).length;

  const pills = (items: [Flag, string][]) => (
    <div className="flex flex-wrap gap-2">
      {items.filter(([f]) => !(f === "inkan" || f === "moped") || from === "outside").map(([f, label]) => (
        <TogglePill key={f} label={label} checked={flags.has(f)} onChange={flip(f)} />
      ))}
    </div>
  );

  return (
    <div className="grid gap-6">
      <Choice label="1. どこから引っ越しますか" value={from} onChange={setFrom} options={[
        { value: "outside", label: "大阪市の外から" },
        { value: "otherWard", label: "大阪市内の別の区から" },
        { value: "sameWard", label: "同じ区の中で" },
      ]} />
      <div className="grid gap-1.5">
        <label htmlFor={id} className="text-sm font-bold">2. 引っ越し日（任意）</label>
        <input id={id} type="date" value={move} onChange={(e) => setMove(e.target.value)} className="h-12 w-full max-w-xs rounded-[10px] border-2 border-line-strong bg-paper px-3 text-lg font-bold tabular-nums outline-none focus:border-shu" />
        <p className="text-xs text-ink-2">入れると、期限の目安日も表示します。</p>
      </div>
      <Choice label="3. お子さんはいますか" value={kids} onChange={setKids} options={[
        { value: "none", label: "いない" },
        { value: "school", label: "いる（小・中学生を含む）" },
        { value: "small", label: "いる（小・中学生はいない）" },
      ]} />
      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-bold">4. あてはまるもの（いくつでも）</legend>
        {pills([["myna", "マイナンバーカードがある"], ["kokuho", "国民健康保険に入っている"], ["license", "運転免許証がある"], ["inkan", "印鑑登録を使う"]])}
      </fieldset>
      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-bold">5. 乗りもの・ペット（いくつでも）</legend>
        {pills([["car", "普通車"], ["kei", "軽自動車"], ["moped", "原付（125cc以下）"], ["bike", "126cc以上のバイク"], ["bicycle", "自転車"], ["dog", "犬"], ["chip", "マイクロチップ登録済みの犬・猫"]])}
      </fieldset>

      <section aria-labelledby={`${id}-list`}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] bg-band p-5">
          <div>
            <h2 id={`${id}-list`} className="font-maru text-lg font-bold">あなたの手続きリスト</h2>
            <p aria-live="polite" className="text-sm text-ink-2"><b className="font-latin text-3xl text-shu-ink">{steps.length}</b> 件（完了 {done}件）</p>
          </div>
          <button type="button" onClick={reset} className="min-h-11 rounded-full border-2 border-line-strong bg-card px-4 text-sm font-bold print:hidden">チェックを外す</button>
        </div>
        {GROUPS.map((g) => {
          const list = steps.filter(g.test);
          if (!list.length) return null;
          return (
            <div key={g.key} className="mt-5">
              <h3 className="font-maru font-bold">{g.label}</h3>
              <ul className="mt-1 divide-y divide-line">
                {list.map((st) => {
                  const due = move ? dueDate(move, st) : null;
                  return (
                    <li key={st.id}>
                      <CheckRow checked={!!checked[st.id]} onToggle={() => toggle(st.id)}>
                        <span className="block font-bold">{st.title}</span>
                        <span className="block text-sm"><span className="text-shu-ink">期限：</span>{st.when}{due && <>（<b>{due}</b>までが目安）</>}</span>
                        <span className="block text-sm text-ink-2">窓口：{st.where}</span>
                        {st.note && <span className="block text-xs text-ink-2">{st.note}</span>}
                      </CheckRow>
                      <a href={st.href} target="_blank" rel="noopener" className="mb-2 ml-9 inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4 hover:text-shu-ink">
                        {st.src}<ArrowSquareOut size={14} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <p className="mt-3 text-xs text-ink-2">期限の目安日は、引っ越した日を1日目として数えた余裕のある日付です。チェックはこの端末のブラウザにだけ保存されます。</p>
      </section>
    </div>
  );
}
