#!/usr/bin/env node
/** Guard + HO cap checks (Codex handoff). */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import {
  claimGuard,
  normalizeHomeOfficeDays,
  homeOfficeEuros,
  runPipeline,
  HO_DAY_CAP,
  HO_EUR_CAP,
  cleverState,
  PAUSCHBETRAG,
} from "./agents.js";

let fail = 0;
function check(name, cond, extra = "") {
  console.log(cond ? "PASS" : "FAIL", name, extra);
  if (!cond) fail++;
}

// Guard: claims blocked
for (const t of [
  "You can deduct €847.",
  "You may deduct €847.",
  "You could deduct 100",
  "You may deduct €847 refund estimated",
  "get €200 back",
  "Erstattung €500",
]) {
  check(`block:${t.slice(0, 28)}`, claimGuard(t).ok === false);
}

// Guard: literacy allowed
for (const t of [
  cleverState(PAUSCHBETRAG + 50).hint,
  "Not tax advice. No refund estimate.",
  "We never guess a refund.",
  "we never quote a refund",
]) {
  check(`allow:${t.slice(0, 36)}`, claimGuard(t).ok === true);
}

// HO validation
check("neg→0", normalizeHomeOfficeDays(-5) === 0);
check("211→210", normalizeHomeOfficeDays(211) === HO_DAY_CAP);
check("eur cap", homeOfficeEuros(211) === HO_EUR_CAP);
check("nan→0", normalizeHomeOfficeDays(NaN) === 0);

const receipts = JSON.parse(readFileSync(join(__dirname, "fixtures/receipts.json"), "utf8"));
const hi = runPipeline(receipts, { homeOfficeDays: 211 });
check("HO capped in packet", hi.packet.clever.home_office_days === 210);
check(
  "high-pressure guard ok",
  hi.stages.find((s) => s.agent === "claim_guard").ok === true
);
check("attack vetoed", hi.stages.find((s) => s.agent === "claim_guard").attack_demo.ok === false);
check("no die-Dec31 string", !JSON.stringify(hi).includes("dies after 31"));

// Grok #1: meter = HO days only; receipt euros never feed the ring
const forty = runPipeline(receipts, { homeOfficeDays: 40 });
check("ring = 40×6", forty.packet.clever.pressure_eur === 240, String(forty.packet.clever.pressure_eur));
check("ring ignores receipts", forty.packet.clever.from_receipts_eur === 0);
check("40 days → below allowance", forty.packet.clever.id === "under");
check("0 days → empty state", runPipeline(receipts, { homeOfficeDays: 0 }).packet.clever.id === "empty");
check("210 days → over", hi.packet.clever.id === "over");

// Codex: no "you are covered" / "no need to keep receipts" from incomplete logs
const allText = JSON.stringify(forty) + JSON.stringify(hi);
check("no coverage claim", !/you'?re covered|no need to (chase|keep)|nothing else to do|receipts are optional/i.test(allText));
check("no 'in your pay' cash claim", !/in your pay/i.test(allText));

// Grok #2: craftsman labour split, donation >€300 needs receipt
const craft = forty.packet.items.find((i) => i.bucket === "craftsman");
check("craftsman labour €420 shown", /€420 labour/.test(craft.literacy) && /€470 material doesn't/.test(craft.literacy));
const don = forty.packet.items.find((i) => i.bucket === "donation");
check("donation >300 asks receipt", /Zuwendungsbestätigung/.test(don.literacy));
check("gap: donation receipt open", forty.packet.gaps.some((g) => /Donation receipt/.test(g.type)));

// Real state change: resolving the one question
const maybe = forty.packet.items.find((i) => i.keep === "maybe");
check("one maybe with question", !!maybe && !!maybe.question);
const resolved = runPipeline(receipts, { homeOfficeDays: 40, resolutions: { [maybe.id]: "work" } });
const after = resolved.packet.items.find((i) => i.id === maybe.id);
check("resolved → keep", after.keep === "keep" && after.resolved === "work" && !after.question);
check("resolved counted", resolved.packet.questions_resolved === 1 && resolved.packet.questions_open === 0);
check("ring unchanged by resolution", resolved.packet.clever.pressure_eur === 240);
const priv = runPipeline(receipts, { homeOfficeDays: 40, resolutions: { [maybe.id]: "private" } });
check("private → noise", priv.packet.items.find((i) => i.id === maybe.id).keep === "noise");
check("resolved guard ok", resolved.stages.find((s) => s.agent === "claim_guard").ok === true);
check("2026 everywhere", forty.packet.year === 2026 && !JSON.stringify(forty.packet).includes("2025"));

process.exit(fail ? 1 : 0);
