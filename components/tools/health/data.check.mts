// Self-check for data.ts. Run: node components/tools/health/data.check.mts
import assert from "node:assert/strict";
import * as d from "./data.ts";

const near = (a: number, b: number, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

near(d.bmiOf(170, 63.6), 22.0, 0.01);
assert.equal(d.jasso(18.4), "低体重");
assert.equal(d.jasso(18.5), "普通体重");
assert.equal(d.jasso(25), "肥満1度");
assert.equal(d.jasso(41), "肥満4度");
assert.deepEqual(d.targetBmi(64), [20.0, 24.9]);
assert.equal(d.rowFor(d.AVERAGES.f, 47)!.ages, "40〜49歳");
assert.equal(d.rowFor(d.AVERAGES.m, 19), undefined);

// DRI reference BMR = 基準値 × 参照体重 (rounded to 10 kcal in the table)
for (const s of ["m", "f"] as const) for (const r of d.BMR_REF[s]) near(r.perKg * r.refW, r.bmr, 10);
// Ganpule: man 30y 170cm 65kg ≈ 1,497 kcal; sexes differ by 0.5473 MJ ≈ 131 kcal
near(d.ganpule("m", 65, 170, 30), 1497.1, 0.1);
near(d.ganpule("m", 60, 160, 40) - d.ganpule("f", 60, 160, 40), 130.7, 0.5);
near(d.harrisBenedict("f", 55, 158, 35), 655.0955 + 9.5634 * 55 + 1.8496 * 158 - 4.6756 * 35, 1e-9);
assert.equal(d.palFor(80).high, null);

// METs lookup boundaries
assert.equal(d.rowFor(d.WALK_METS, 4.5)!.mets, 3.5);
assert.equal(d.rowFor(d.WALK_METS, 4.49)!.mets, 3.0);
assert.equal(d.rowFor(d.RUN_METS, 10)!.mets, 9.8);
near(d.metsKcal(3, 50, 0.5), 75, 1e-9); // the example in 身体活動・運動ガイド2023

// Children
near(d.kaup(95, 14), d.bmiOf(95, 14), 1e-9);
near(d.rohrer(130, 28), 127.4, 0.1);
near(d.toddlerStdWeight("m", 95), 14.04, 0.01);
near(d.schoolStdWeight("f", 6, 115), 0.458 * 115 - 32.079, 1e-9);
near(d.himando(11.5, 10), 15, 1e-9);
// Boundaries: exactly -15% (toddler) / -20% (school) are on the thin side; +15 / +20 are on the heavy side
assert.equal(d.judgeHimando("toddler", -15), "やせ傾向");
assert.equal(d.judgeHimando("toddler", -14.9), "ふつう");
assert.equal(d.judgeHimando("toddler", 15), "肥満傾向");
assert.equal(d.judgeHimando("toddler", 30), "肥満傾向（30%以上）");
assert.equal(d.judgeHimando("school", -20), "痩身傾向");
assert.equal(d.judgeHimando("school", 19.9), "ふつう");
assert.equal(d.judgeHimando("school", 20), "肥満傾向");
assert.ok(d.ganpuleInRange(20) && d.ganpuleInRange(74) && !d.ganpuleInRange(19) && !d.ganpuleInRange(75));

// Body fat: US Navy metric form must match the DoD inch form
const inch = (cm: number) => cm / 2.54;
near(d.navy("m", 175, 85, 38), 86.01 * Math.log10(inch(85 - 38)) - 70.041 * Math.log10(inch(175)) + 36.76, 0.6);
near(d.navy("f", 160, 75, 32, 95), 163.205 * Math.log10(inch(75 + 95 - 32)) - 97.684 * Math.log10(inch(160)) - 78.387, 0.6);
near(d.deurenberg("m", 22, 30), 1.2 * 22 + 0.23 * 30 - 10.8 - 5.4, 1e-9);
assert.ok(d.cunBae("f", 22, 30) > d.cunBae("m", 22, 30));
near(d.normalizedFfmi(20, 180), 20, 1e-9);
near(d.normalizedFfmi(20, 170), 20.63, 1e-9); // Kouri 1995 abstract: + 6.3 × (1.80 m − height)

console.log("health data.ts: all checks passed");
