/**
 * Year Packet — Q4 clever check for Taxfix (solo hackathon build).
 *
 * Honest limits (Codex + Grok adversarial audit 2026-09-17):
 * - Pipeline stages are deterministic JS over fixtures — not live LLM agents.
 * - Home-office Tagespauschale: €6/day, max €1,260/year (§4 Abs. 5 S. 1 Nr. 6c EStG) → 210 days.
 * - Meter = home-office days × €6 ONLY, vs the €1,230 allowance (§9a EStG) the Finanzamt
 *   applies automatically. Receipt euros never feed the ring (unverified ≠ Werbungskosten).
 * - Craftsman (§35a EStG): labour only, invoice + bank transfer, payment year.
 * - Donation: simplified proof (bank slip) up to €300 (§50 Abs. 4 EStDV); above → Zuwendungsbestätigung.
 * - No "receipts expire 31 Dec". No refund / deduction euros anywhere.
 */

export const TAX_YEAR = 2026;
export const PAUSCHBETRAG = 1230; // Arbeitnehmer-Pauschbetrag — an allowance applied automatically, not cash
export const HO_DAY_EUR = 6;
export const HO_DAY_CAP = 210; // €1,260 / €6
export const HO_EUR_CAP = HO_DAY_CAP * HO_DAY_EUR;
export const DONATION_SIMPLE_PROOF_EUR = 300; // §50 Abs. 4 EStDV (since 2021)
export const CRAFTSMAN_LABOUR_ONLY = true; // §35a Abs. 3 EStG

/** Named pipeline stages (contracts). Demo runs them in-process over fixtures. */
export const STAGES = [
  { id: "ingestor", name: "Ingestor", owns: "receipt fields → merchant, date, amount (demo receipts)" },
  { id: "classifier", name: "Classifier", owns: "keep | maybe | noise — and the one question that resolves a maybe" },
  { id: "gap_scout", name: "Gap Scout", owns: "what a complete year still needs (labour split, donation receipt, day log)" },
  { id: "clever", name: "Day Meter", owns: "home-office days × €6 vs the €1,230 allowance" },
  { id: "claim_guard", name: "Claim Guard", owns: "no refund or deduction euros in any sentence" },
  { id: "unlock", name: "Handoff", owns: "which Taxfix filing question each item already answers" },
];

/** @deprecated alias — UI may still import AGENTS */
export const AGENTS = STAGES;

const WERBUNG = new Set(["work-kit", "commute", "home-office", "training"]);

const RULES = {
  donation: {
    bucket: "donation",
    keep: "keep",
    werbung: false,
    q4_capture: true,
    literacy: (r) =>
      Number(r.amount_eur) > DONATION_SIMPLE_PROOF_EUR
        ? `Donation over €${DONATION_SIMPLE_PROOF_EUR}: a bank slip is not enough — ask the charity for the Zuwendungsbestätigung now, while it's fresh. The year you paid is the year it counts.`
        : `Donation up to €${DONATION_SIMPLE_PROOF_EUR}: simplified proof may apply — keep the payment record and the charity's confirmation together.`,
    taxfix_when_filing: "Spenden / Mitgliedsbeiträge",
  },
  craftsman: {
    bucket: "craftsman",
    keep: "keep",
    werbung: false,
    q4_capture: true,
    literacy: (r) => {
      const labour = r.labour_eur != null ? `€${r.labour_eur} labour counts` : "only the labour share counts";
      const material = r.material_eur != null ? `, €${r.material_eur} material doesn't` : "";
      return `Craftsman: ${labour}${material}. Needs the invoice and a bank transfer (no cash). Paid in ${String(r.date).slice(0, 4)} → belongs to ${String(r.date).slice(0, 4)}.`;
    },
    taxfix_when_filing: "Handwerkerleistungen (§35a)",
  },
  "work-kit": {
    bucket: "work-kit",
    keep: "maybe",
    werbung: true,
    q4_capture: false,
    question: "Was this mostly for work?",
    literacy: () => "One question decides this. It never feeds the day meter either way.",
    resolve: {
      work: {
        keep: "keep",
        literacy: () =>
          "You said mostly work — keep the invoice. Taxfix will ask about it under Arbeitsmittel; only matters if your real work costs pass the €1,230 allowance.",
      },
      private: {
        keep: "noise",
        literacy: () => "Private — nothing to keep. Delete it with a clear conscience.",
      },
    },
    taxfix_when_filing: "Werbungskosten → Arbeitsmittel",
  },
  commute: {
    bucket: "commute",
    keep: "keep",
    werbung: true,
    q4_capture: false,
    literacy: () =>
      "Monthly ticket: keep it. A day you commuted usually can't also be a home-office day — the day log stays yours to say.",
    taxfix_when_filing: "Wege zur Arbeit / Homeoffice",
  },
};

function classify(receipt) {
  const t = `${receipt.merchant} ${receipt.raw_text}`.toLowerCase();
  if (/spende|zuwendung|tafel|gemeinnütz/.test(t)) return RULES.donation;
  if (/sanitär|handwerker|arbeitslohn|material/.test(t)) return RULES.craftsman;
  if (/ticket|bvg|bahn|jobticket|deutschlandticket/.test(t)) return RULES.commute;
  if (/monitor|hub|notebook|laptop|headset|media|kurs|seminar/.test(t)) return RULES["work-kit"];
  return {
    bucket: "unknown",
    keep: "maybe",
    werbung: false,
    q4_capture: false,
    literacy: () => "Unclear — keep the file. The day meter ignores it.",
    taxfix_when_filing: "Ask Taxfix when filing opens",
  };
}

/** Apply a user's answer to a "maybe" item. Pure. */
function applyResolution(item, answer) {
  const rule = item.resolve && item.resolve[answer];
  if (!rule) return item;
  return { ...item, keep: rule.keep, literacy: rule.literacy, resolved: answer, question: null };
}

/** Finite nonnegative integer days, capped at statutory 210 counting days. */
export function normalizeHomeOfficeDays(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(HO_DAY_CAP, Math.floor(n));
}

export function homeOfficeEuros(days) {
  const d = normalizeHomeOfficeDays(days);
  return Math.min(HO_EUR_CAP, d * HO_DAY_EUR);
}

/**
 * Block deduction/refund *claims*. Allow literacy that refuses estimates.
 */
export function claimGuard(text) {
  const scrubbed = String(text || "")
    .replace(/\b(?:never|no|not|without)\s+(?:quote\s+a\s+|guess\s+a\s+)?refunds?\b/gi, " ")
    .replace(/\bno\s+refund\s+estimates?\b/gi, " ")
    .replace(/\bnot\s+a\s+refund\b/gi, " ")
    .replace(/\brefund\s+theatre\b/gi, " ")
    .replace(/\brefund\s+estimates?\b/gi, " ")
    .replace(/\bnever\s+guess\s+a\s+refund\b/gi, " ");

  const claimPatterns = [
    /\byou\s+(?:may|can|could)\s+deduct\b/i,
    /\bdu\s+kannst\s+absetzen\b/i,
    /\b(?:may|can|could)\s+deduct\s*€?\s*\d/i,
    /\bdeduct\s*€\s*\d/i,
    /\bestimated?\s*€\s*\d/i,
    /\b€\s*\d[\d.,]*\s*back\b/i,
    /\bget\s*€\s*\d[\d.,]*\s*back\b/i,
    /\brefund\s*(?:of\s*)?€\s*\d/i,
    /\b€\s*\d[\d.,]*\s*(?:refund|erstattung)\b/i,
    /\berstattung\s*(?:von\s*)?€?\s*\d/i,
    /\b(?:your|an?)\s+estimated?\s+refund\b/i,
    /\brefund\s+estimated\b/i,
  ];
  if (claimPatterns.some((re) => re.test(scrubbed))) {
    return {
      ok: false,
      veto: "Claim Guard kept it honest: no refund or deduction promises in this packet.",
    };
  }
  return { ok: true, veto: null };
}

/** Meter state from home-office euros ONLY (days × €6). */
export function cleverState(hoEur) {
  if (hoEur <= 0) {
    return {
      id: "empty",
      label: "Days you remember",
      hint: "Tap a day when you remember one. Nothing is lost by starting late — the €1,230 allowance is applied automatically either way.",
    };
  }
  if (hoEur < PAUSCHBETRAG) {
    return {
      id: "under",
      label: "Still a log, not a verdict",
      hint: `Each day is €6 in Taxfix's question later. Below €${PAUSCHBETRAG.toLocaleString("en")} the automatic allowance is what applies; this log is how you'll remember which days were really home.`,
    };
  }
  return {
    id: "over",
    label: "Past the allowance — your real work costs matter",
    hint: "Your day log alone passes €1,230, so Taxfix will ask about work costs when filing opens. Keep what's real. We never quote a refund.",
  };
}

export function runPipeline(receipts, { homeOfficeDays = 0, resolutions = {} } = {}) {
  const stages = [];
  const days = normalizeHomeOfficeDays(homeOfficeDays);

  const ingested = receipts.map((r) => ({ ...r, ingested_at: new Date().toISOString() }));
  stages.push({
    agent: "ingestor",
    ok: true,
    detail: `${ingested.length} demo receipts read: merchant, date, amount`,
  });

  const classified = ingested
    .map((r) => ({ ...r, ...classify(r) }))
    .map((c) => (resolutions[c.id] ? applyResolution(c, resolutions[c.id]) : c))
    .map((c) => ({ ...c, literacy: typeof c.literacy === "function" ? c.literacy(c) : c.literacy }));
  const openQuestions = classified.filter((c) => c.question);
  const resolvedCount = classified.filter((c) => c.resolved).length;
  stages.push({
    agent: "classifier",
    ok: true,
    detail:
      classified.map((c) => `${c.merchant}→${c.keep}`).join(", ") +
      (openQuestions.length ? ` · ${openQuestions.length} question open` : "") +
      (resolvedCount ? ` · ${resolvedCount} resolved by you` : ""),
  });

  const bigDonationNeedsReceipt = classified.some(
    (c) => c.bucket === "donation" && Number(c.amount_eur) > DONATION_SIMPLE_PROOF_EUR
  );
  const checklist = [
    {
      type: `Donation receipt (needed above €${DONATION_SIMPLE_PROOF_EUR})`,
      present: !bigDonationNeedsReceipt || classified.some((c) => c.bucket === "donation" && c.has_receipt),
      q4: true,
    },
    {
      type: "Craftsman invoice: labour split + bank transfer",
      present: classified.some((c) => c.bucket === "craftsman" && c.labour_eur != null),
      q4: true,
    },
    { type: "Home-office day log", present: days > 0, q4: true },
    {
      type: "Lohnsteuerbescheinigung (wage-tax certificate)",
      present: false,
      note: "arrives after year-end; Taxfix Expert can fetch it — not your job in Q4",
      q4: false,
    },
  ];
  const gaps = checklist.filter((c) => !c.present);
  const q4Gaps = gaps.filter((g) => g.q4);
  stages.push({
    agent: "gap_scout",
    ok: true,
    detail: q4Gaps.length
      ? `Still worth fetching this year: ${q4Gaps.map((g) => g.type).join("; ")}`
      : "Everything a complete year needs is here — the certificate comes later on its own",
  });

  // Meter = home-office days only. Receipt euros are noted, never counted (Grok #1).
  const fromHO = homeOfficeEuros(days);
  const workReceiptsNoted = classified
    .filter((c) => c.keep !== "noise" && (c.werbung || WERBUNG.has(c.bucket)))
    .reduce((s, c) => s + (Number(c.amount_eur) || 0), 0);
  const clever = cleverState(fromHO);
  stages.push({
    agent: "clever",
    ok: true,
    detail: `${days} home-office days × €${HO_DAY_EUR} = €${fromHO} (cap €${HO_EUR_CAP}) vs €${PAUSCHBETRAG} allowance → ${clever.label}. Work receipts (€${workReceiptsNoted}) noted, not counted.`,
  });

  const packet = {
    year: TAX_YEAR,
    title: `Year Packet ${TAX_YEAR}`,
    tagline: "Not filing. Not a vault. A calm look at the year while you can still fetch what's missing.",
    pauschbetrag_eur: PAUSCHBETRAG,
    simulation: true,
    clever: {
      ...clever,
      pressure_eur: fromHO,
      from_home_office_eur: fromHO,
      from_receipts_eur: 0,
      work_receipts_noted_eur: workReceiptsNoted,
      home_office_days: days,
      home_office_day_cap: HO_DAY_CAP,
      amounts_are: "home_office_days_only",
    },
    questions_open: openQuestions.length,
    questions_resolved: resolvedCount,
    items: classified.map((c) => ({
      id: c.id,
      filename: c.filename,
      merchant: c.merchant,
      date: c.date,
      amount_eur: c.amount_eur,
      bucket: c.bucket,
      keep: c.keep,
      question: c.question || null,
      resolved: c.resolved || null,
      literacy: c.literacy,
      q4_capture: !!c.q4_capture,
      feeds_when_filing: c.taxfix_when_filing,
    })),
    gaps,
    q4_items: classified.filter((c) => c.q4_capture),
    disclaimer:
      "Not tax advice. No refund estimate. The meter counts home-office days, not money back. Prototype over demo receipts.",
  };

  const literacyBlob =
    packet.items.map((i) => i.literacy).join("\n") +
    "\n" +
    stages.map((s) => s.detail).join("\n") +
    "\n" +
    clever.hint +
    "\n" +
    packet.disclaimer;
  const guard = claimGuard(literacyBlob);
  const attack = claimGuard("You can deduct €847.");
  stages.push({
    agent: "claim_guard",
    ok: guard.ok && !attack.ok,
    detail: guard.ok ? "Every sentence clean. Test phrase “You can deduct €847” refused." : guard.veto,
    attack_demo: attack,
  });

  const handoff = packet.items
    .filter((i) => i.keep === "keep")
    .map((i) => `${i.merchant} → ${i.feeds_when_filing}`);
  stages.push({
    agent: "unlock",
    ok: true,
    detail: `${handoff.length} items already answer a Taxfix filing question: ${handoff.join("; ")}`,
  });

  return { stages, packet, agents: STAGES, handoff };
}

export function formatCli(result) {
  const lines = [];
  lines.push("=== Year Packet · fixture pipeline (deterministic stages) ===");
  for (const s of result.stages) {
    lines.push(`[${s.ok ? "ok" : "FAIL"}] ${s.agent}: ${s.detail}`);
  }
  lines.push("");
  lines.push(result.packet.title);
  lines.push(result.packet.tagline);
  const c = result.packet.clever;
  lines.push(
    `Day meter: ${c.home_office_days}/${c.home_office_day_cap} days = €${c.from_home_office_eur} vs €${result.packet.pauschbetrag_eur} allowance → ${c.label}`
  );
  for (const i of result.packet.items) {
    lines.push(
      `- [${i.keep}] ${i.bucket} · ${i.merchant}${i.q4_capture ? " · Q4" : ""}${i.question ? ` · ? ${i.question}` : ""}${i.resolved ? ` · you: ${i.resolved}` : ""}`
    );
  }
  lines.push("");
  lines.push(result.packet.disclaimer);
  return lines.join("\n");
}
