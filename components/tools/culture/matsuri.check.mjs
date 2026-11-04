// Run: node components/tools/culture/matsuri.check.mjs
import assert from "node:assert/strict";
import { MATSURI, statusOf } from "./matsuri.ts";

const by = (n) => MATSURI.find((e) => e.name.startsWith(n));
assert.deepEqual(statusOf(by("大阪・光"), "2026-10-31"), { s: "soon", days: 3, start: "2026-11-03" });
assert.deepEqual(statusOf(by("大阪・光"), "2027-01-31"), { s: "now", left: 0 });
assert.deepEqual(statusOf(by("大阪・光"), "2027-02-01"), { s: "tba" }); // one-off edition: never rolls over
assert.deepEqual(statusOf(by("十日"), "2027-01-11"), { s: "now", left: 0 });
assert.deepEqual(statusOf(by("十日"), "2027-01-12"), { s: "soon", days: 362, start: "2028-01-09" }); // annual: next year
assert.deepEqual(statusOf(by("愛染"), "2027-07-01"), { s: "now", left: 1 });
assert.deepEqual(statusOf(by("天神"), "2026-10-31"), { s: "soon", days: 266, start: "2027-07-24" });
console.log("ok: matsuri countdown");
