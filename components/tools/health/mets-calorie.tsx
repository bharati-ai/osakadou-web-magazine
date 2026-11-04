"use client";

import { useState } from "react";
import { NumberField, Result, num } from "../fields";
import { RUN_METS, WALK_METS, fmt, metsKcal, rowFor } from "./data";
import { More, Stats, Table } from "./parts";

const KINDS = {
  walk: { table: WALK_METS, km: "3", min: "40", name: "歩行" },
  run: { table: RUN_METS, km: "5", min: "30", name: "ランニング" },
};

/** Walking or running calories: METs (from the speed) × weight × hours. */
export function MetsCalorieTool({ kind }: { kind: keyof typeof KINDS }) {
  const k = KINDS[kind];
  const [w, setW] = useState("53");
  const [km, setKm] = useState(k.km);
  const [min, setMin] = useState(k.min);
  const wk = num(w), d = num(km), t = num(min);
  const valid = wk !== null && wk >= 25 && wk <= 250 && d !== null && d > 0 && d <= 100 && t !== null && t > 0 && t <= 600;
  const speed = valid ? d / (t / 60) : null;
  const row = speed === null ? undefined : rowFor(k.table, speed);
  const kcal = row ? metsKcal(row.mets, wk!, t! / 60) : null;
  const paceSec = valid ? Math.round((t! / d!) * 60) : 0; // per km
  const slow = kind === "run" && speed !== null && speed < 6.4;
  const fast = speed !== null && speed > (kind === "walk" ? 9 : 25);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="体重" unit="kg" value={w} onChange={setW} min={25} max={250} hint={w && !(wk !== null && wk >= 25 && wk <= 250) ? "25〜250kgで入力してください。" : undefined} />
        <NumberField label="距離" unit="km" value={km} onChange={setKm} min={0.1} max={100} hint={km && !(d !== null && d > 0 && d <= 100) ? "0.1〜100kmで入力してください。" : undefined} />
        <NumberField label="時間" unit="分" value={min} onChange={setMin} min={1} max={600} step={1} hint={min && !(t !== null && t > 0 && t <= 600) ? "1〜600分で入力してください。" : undefined} />
      </div>
      <Result
        label="消費カロリー（推定）"
        value={kcal === null ? "-" : fmt(kcal, 0)}
        unit="kcal"
        sub={
          !row ? "体重・距離・時間を入力すると計算します。"
          : <>平均 {fmt(speed!)}km/時。メッツ表の「{k.name}：{row.label}」<b>{row.mets}メッツ</b>で計算しています。</>
        }
      />
      {(slow || fast) && (
        <p className="text-sm text-ink-2">
          {slow ? "6.4km/時より遅いペースは歩行に近い速さです。メッツ表のいちばん遅い区分（6.4km/時）で計算しています。" : "入力した距離と時間が、ふつうの速さの範囲を大きく超えています。数字をご確認ください。"}
        </p>
      )}
      {row && (
        <Stats
          items={[
            { label: "平均速度", value: fmt(speed!), unit: "km/時" },
            { label: "1kmあたりのペース", value: `${Math.floor(paceSec / 60)}分${String(paceSec % 60).padStart(2, "0")}秒` },
            { label: "1kmあたり", value: fmt(kcal! / d!, 0), unit: "kcal" },
            { label: "1分あたり", value: fmt(kcal! / t!), unit: "kcal" },
          ]}
        />
      )}
      <More title={`${k.name}のメッツ（METs）一覧`}>
        <Table
          caption="国立健康・栄養研究所「改訂版 身体活動のメッツ（METs）表」より"
          head={["速さ", "メッツ", "コード"]}
          rows={k.table.map((r) => [r.label, fmt(r.mets), r.code])}
          mark={row ? k.table.indexOf(row) : undefined}
        />
        <p className="text-xs text-ink-2">入力した速さ以下で、いちばん近い区分のメッツを使います。{kind === "walk" && "歩行の値は、平らで固い地面を歩いた場合です。"}</p>
      </More>
    </div>
  );
}
