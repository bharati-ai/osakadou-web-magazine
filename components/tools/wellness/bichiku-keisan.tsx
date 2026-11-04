"use client";

import { Printer } from "@phosphor-icons/react";
import { useState } from "react";
import { Choice, NumberField, Result, num } from "../fields";
import { CheckRow, useChecked } from "./shared";

export type Household = { adults: number; kids: number; infants: number; seniors: number; pets: number };

/**
 * Official per-person figures only:
 * 水 3L/人/日（農林水産省・首相官邸・大阪市水道局）、1日3食（大阪市）、米 1食75g・おかず 1食1品・カセットボンベ 6本/人/週（農林水産省ガイドの大人2人1週間の例）、
 * 携帯トイレ 5回/人/日（内閣府・経済産業省）、ペットのフードと水 5日分以上・できれば7日分以上（環境省）。
 */
export function stockpile(h: Household, days: 3 | 7) {
  const people = h.adults + h.kids + h.infants + h.seniors;
  const eaters = h.adults + h.kids + h.seniors; // 乳幼児はミルク・離乳食を別に用意
  const water = people * 3 * days;
  const meals = eaters * 3 * days;
  return {
    people,
    water,
    bottles: Math.ceil(water / 2),
    meals,
    riceKg: Math.round(meals * 0.075 * 10) / 10,
    sides: meals,
    gas: Math.ceil((people * 6 * days) / 7),
    toilet: (people - h.infants) * 5 * days, // 乳幼児はおむつを使う前提
    petDays: days === 7 ? 7 : 5,
  };
}

type Item = { id: string; label: React.ReactNode; note?: string };

export function BichikuKeisanTool() {
  const [v, setV] = useState({ adults: "2", kids: "0", infants: "0", seniors: "0", pets: "0" });
  const [days, setDays] = useState<"3" | "7">("7");
  const { checked, toggle, reset } = useChecked("osaka-live:bichiku");
  const n = (s: string) => Math.max(0, Math.min(20, Math.floor(num(s) ?? 0)));
  const h: Household = { adults: n(v.adults), kids: n(v.kids), infants: n(v.infants), seniors: n(v.seniors), pets: n(v.pets) };
  const d = Number(days) as 3 | 7;
  const r = stockpile(h, d);
  const set = (k: keyof typeof v) => (s: string) => setV((o) => ({ ...o, [k]: s }));
  const hint = (s: string) => {
    const x = num(s);
    if (x === null) return undefined;
    if (x > 20) return "20人（匹）までで計算しています。";
    if (!Number.isInteger(x) || x < 0) return `${Math.max(0, Math.floor(x))}として計算しています。`;
  };

  const counted: Item[] = r.people
    ? [
        { id: "water", label: <>飲料水 <b>{r.water}L</b>（2Lペットボトル{r.bottles}本）</>, note: "1人1日3L（飲み水と調理用の水）。トイレを流すなどの生活用水は別に。" },
        ...(r.meals ? [
          { id: "staple", label: <>主食 <b>{r.meals}食分</b>（お米だけなら約{r.riceKg}kg）</>, note: "1日3食で計算。米・パックご飯・めん類・パンなどを組み合わせて。お米は1食75g程度。" },
          { id: "sides", label: <>おかず <b>{r.sides}品</b>（レトルト食品・缶詰など）</>, note: "1食に1品の計算です。肉や魚の缶詰、レトルトのカレーや丼の素など。" },
        ] : []),
        { id: "gas", label: <>カセットボンベ <b>{r.gas}本</b>とカセットコンロ</>, note: "1人1週間でおよそ6本が目安。" },
        ...(r.people > h.infants ? [{ id: "toilet", label: <>携帯トイレ・簡易トイレ <b>{r.toilet}回分</b></>, note: "1人1日5回で計算（乳幼児はおむつを使う前提で除いています）。" }] : []),
        ...(h.pets ? [{ id: "pet", label: <>ペットのフードと水 <b>{r.petDays}日分以上</b>×{h.pets}匹分</>, note: "少なくとも5日分、できれば7日分以上。食器も一緒に。" }] : []),
      ]
    : [];

  const extra: Item[] = [
    { id: "veg", label: "野菜ジュースや日持ちする野菜、調味料、お菓子", note: "栄養のかたよりを防ぎ、ほっとできる食べ物も。" },
    { id: "lifewater", label: "生活用水（風呂の残り湯やポリタンクなど）", note: "トイレを流したり、手や食器を洗ったりする水は飲料水とは別に。" },
    ...(h.infants ? [{ id: "baby", label: "乳幼児用：粉ミルク・哺乳ビン・紙コップや使い捨てスプーン・レトルトなどの離乳食・紙おむつ", note: "ミルク用に飲料水は多めに。量はふだん使う量から見積もりましょう。" }] : []),
    ...(h.seniors ? [{ id: "senior", label: "高齢の家族用：レトルトやアルファ米のおかゆ、とろみ調整食品（飲み込みにくい人）", note: "食べ慣れたものを、ふだんの食事で試しておくと安心です。" }] : []),
    { id: "special", label: "アレルギー対応食など、食事に配慮が必要な人の食品", note: "ふだんから少なくとも2週間分の備蓄が推奨されています。" },
    { id: "app", label: "「大阪防災アプリ」で避難所やハザードマップを確認", note: "大阪市が提供。大阪府全域に対応しています。" },
  ];

  const all = [...counted, ...extra];
  const done = all.filter((i) => checked[i.id]).length;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <NumberField label="大人" unit="人" value={v.adults} onChange={set("adults")} min={0} max={20} step={1} hint={hint(v.adults)} />
        <NumberField label="こども" unit="人" value={v.kids} onChange={set("kids")} min={0} max={20} step={1} hint={hint(v.kids)} />
        <NumberField label="乳幼児" unit="人" value={v.infants} onChange={set("infants")} min={0} max={20} step={1} hint={hint(v.infants)} />
        <NumberField label="高齢者" unit="人" value={v.seniors} onChange={set("seniors")} min={0} max={20} step={1} hint={hint(v.seniors)} />
        <NumberField label="ペット（犬・猫）" unit="匹" value={v.pets} onChange={set("pets")} min={0} max={20} step={1} hint={hint(v.pets)} />
      </div>
      <Choice label="何日分を備えますか" value={days} onChange={setDays} options={[{ value: "3", label: "3日分（最低限）" }, { value: "7", label: "7日分（推奨）" }]} />

      <Result
        label={`${d}日分の飲料水の目安`}
        value={r.people ? String(r.water) : "-"}
        unit="L"
        sub={r.people ? <>{r.people}人分。2Lペットボトルなら<b>{r.bottles}本</b>です。</> : "家族の人数を入力してください。"}
      />

      <section aria-labelledby="bichiku-list">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="bichiku-list" className="font-maru text-lg font-bold">備蓄チェックリスト <span className="text-sm text-ink-2">{done}/{all.length}</span></h2>
          <div className="flex gap-2 print:hidden">
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-shu px-4 text-sm font-bold text-shu-ink">
              <Printer size={18} aria-hidden /> 印刷する
            </button>
            <button type="button" onClick={reset} className="min-h-11 rounded-full border-2 border-line px-4 text-sm font-bold">チェックを外す</button>
          </div>
        </div>
        {counted.length > 0 && (
          <>
            <h3 className="mt-4 text-sm font-bold text-ink-2">量の目安（{d}日分）</h3>
            <ul className="mt-1 divide-y divide-line">
              {counted.map((i) => (
                <li key={i.id}>
                  <CheckRow checked={!!checked[i.id]} onToggle={() => toggle(i.id)}>
                    <span className="block">{i.label}</span>
                    {i.note && <span className="block text-xs text-ink-2">{i.note}</span>}
                  </CheckRow>
                </li>
              ))}
            </ul>
          </>
        )}
        <h3 className="mt-4 text-sm font-bold text-ink-2">あわせて備えたいもの</h3>
        <ul className="mt-1 divide-y divide-line">
          {extra.map((i) => (
            <li key={i.id}>
              <CheckRow checked={!!checked[i.id]} onToggle={() => toggle(i.id)}>
                <span className="block">{i.label}</span>
                {i.note && <span className="block text-xs text-ink-2">{i.note}</span>}
              </CheckRow>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-2">チェックはこの端末のブラウザにだけ保存されます。</p>
      </section>
    </div>
  );
}
