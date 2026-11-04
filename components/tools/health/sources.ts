import type { Source } from "../tool-shell";

/** Verified source links for the health tool pages (checked 2026-10). */
export const S = {
  bmiCheck: { label: "e-ヘルスネット（厚生労働省）：BMIチェックツール（日本肥満学会の区分）", href: "https://kennet.mhlw.go.jp/information/information/metabolic/bmi_check.html" },
  obesity: { label: "e-ヘルスネット（厚生労働省）：肥満と健康", href: "https://kennet.mhlw.go.jp/information/information/food/e-02-001.html" },
  bmi: { label: "e-ヘルスネット（厚生労働省）：BMI", href: "https://kennet.mhlw.go.jp/information/information/dictionary/metabolic/ym-002.html" },
  bodyFat: { label: "e-ヘルスネット（厚生労働省）：体脂肪率", href: "https://kennet.mhlw.go.jp/information/information/dictionary/metabolic/ym-041.html" },
  mets: { label: "e-ヘルスネット（厚生労働省）：メッツ / METs", href: "https://kennet.mhlw.go.jp/information/information/dictionary/exercise/ys-004.html" },
  nhns: { label: "厚生労働省：令和6年国民健康・栄養調査報告（第14表・第15表）", href: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/eiyou/r6-houkoku_00001.html" },
  dri: { label: "厚生労働省：日本人の食事摂取基準（2025年版）", href: "https://www.mhlw.go.jp/stf/newpage_44138.html" },
  driEnergy: { label: "日本人の食事摂取基準（2025年版）エネルギー（PDF）", href: "https://www.mhlw.go.jp/content/10904750/001316461.pdf" },
  driProtein: { label: "日本人の食事摂取基準（2025年版）たんぱく質（PDF）", href: "https://www.mhlw.go.jp/content/10904750/001316462.pdf" },
  driBalance: { label: "日本人の食事摂取基準（2025年版）エネルギー産生栄養素バランス（PDF）", href: "https://www.mhlw.go.jp/content/10904750/001316465.pdf" },
  metsTable: { label: "国立健康・栄養研究所：改訂版「身体活動のメッツ（METs）表」（PDF）", href: "https://www.nibn.go.jp/eiken/programs/2011mets.pdf" },
  guide2023: { label: "厚生労働省：健康づくりのための身体活動・運動ガイド2023（PDF）", href: "https://www.mhlw.go.jp/content/001194020.pdf" },
  niphManual: { label: "国立保健医療科学院：乳幼児身体発育評価マニュアル（PDF）", href: "https://www.niph.go.jp/soshiki/07shougai/hatsuiku/index.files/katsuyou.pdf" },
  niphGuide: { label: "国立保健医療科学院：乳幼児身体発育曲線の活用・実践ガイド（PDF）", href: "https://www.niph.go.jp/soshiki/07shougai/hatsuiku/index.files/jissen_2021_03.pdf" },
  mext: { label: "文部科学省：肥満・痩身傾向児の算出方法について（PDF）", href: "https://www.mext.go.jp/content/20210728-mxt_chousa01-000013187_3.pdf" },
  ganpule: { label: "Ganpule AAほか（2007）日本人の基礎代謝量の推定式（Eur J Clin Nutr）", href: "https://doi.org/10.1038/sj.ejcn.1602645" },
  miyake: { label: "Miyake Rほか（2011）日本人成人における基礎代謝量推定式の妥当性（J Nutr Sci Vitaminol）", href: "https://doi.org/10.3177/jnsv.57.224" },
  deurenberg: { label: "Deurenberg Pほか（1991）BMIからの体脂肪率推定式（Br J Nutr）", href: "https://doi.org/10.1079/bjn19910073" },
  cunBae: { label: "Gómez-Ambrosi Jほか（2012）CUN-BAE式（Diabetes Care）", href: "https://doi.org/10.2337/dc11-1334" },
  lee: { label: "Lee RCほか（2000）骨格筋量の推定式（Am J Clin Nutr）", href: "https://doi.org/10.1093/ajcn/72.3.796" },
  kouri: { label: "Kouri EMほか（1995）FFMI（Clin J Sport Med）", href: "https://doi.org/10.1097/00042752-199510000-00003" },
  awgs: { label: "Chen LKほか（2020）AWGS 2019 サルコペニア診断基準（J Am Med Dir Assoc）", href: "https://doi.org/10.1016/j.jamda.2019.12.012" },
  edPortal: { label: "国立精神・神経医療研究センター：摂食障害情報ポータルサイト", href: "https://edcenter.ncnp.go.jp/edportal_general/" },
  edConsult: { label: "摂食障害全国支援センター：相談窓口", href: "https://edcenter.ncnp.go.jp/consultation.html" },
  sarcopenia: { label: "健康長寿ネット（長寿科学振興財団）：サルコペニアの診断", href: "https://www.tyojyu.or.jp/net/byouki/sarcopenia/shindan.html" },
} satisfies Record<string, Source>;

export const CAUTION_BASE = "計算結果は推定の目安で、診断ではありません。体重や体調で気になることがあるときは、医療機関に相談してください。";
