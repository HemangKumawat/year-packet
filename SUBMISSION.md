# Submission — Cursor Hackathon Berlin @ Taxfix · 2026-09-17

**Team name:** Hemang (solo)
**Active team members:** Hemang Kumawat — 1 (not prize-eligible: <4 members; competing on merit)

**Project name:** Year Packet
**One line:** Off-season, the tax app should feel calm — Year Packet lets a Taxfix user log home-office days, answer the one question that turns an unclear receipt into keep-or-noise, and see which evidence is still worth fetching this year, with no refund numbers and nothing due today.

**Video:** `Hemang_YearPacket.mp4` — 97 s, narrated (local Kokoro TTS), 1920×1080, real UI recording.
**Repository:** https://github.com/HemangKumawat/year-packet (prototype: open `year-packet/index.html` over any static server, e.g. `cd year-packet && python3 -m http.server 8765`; CLI twin `./demo.sh`; tests `node test-guard.mjs`).

## What it is, honestly
- A working mobile-first prototype: five screens, real state (home-office day log and answered questions persist in localStorage), deterministic rule pipeline over four demo receipts. No live OCR, no live model agents.
- Day Meter = days × €6 against the €1,230 employee allowance that the tax office applies automatically (§9a / §4 Abs. 5 Nr. 6c EStG; cap 210 days / €1,260). Receipt euros never feed the meter. It is a log, not a verdict.
- Packet: craftsman labour vs material and bank-transfer requirement (§35a EStG); donation over €300 needs the official donation receipt (Zuwendungsbestätigung, §50 Abs. 4 EStDV); one “Was this mostly for work?” question resolves a maybe. Resolved questions are the only thing counted — no streaks, no spend totals.
- Claim Guard: unit-tested filter that refuses any sentence promising a refund or a deduction euro (35 tests green).
- Handoff: each kept item maps to the Taxfix filing question it already answers; the wage-tax certificate arrives later on its own.

## How Cursor was used
- Cursor (Fable 5.1 agent) wrote the whole app: UI, `agents.js` rules, Claim Guard, CLI twin, Playwright recorder (`record-pitch.mjs`), narration mixer (`mix-voice.mjs`), tests.
- Cursor ran the multi-lane loop: dispatched Grok for adversarial review against Taxfix’s live product (subscription page, Document Manager, support articles, statute) and folded its ranked findings back into the build (HO-only meter, labour/material split, €300 threshold, 2026 fixtures, calm-tone copy pass).
- A Codex session verified legal thresholds and preflighted local TTS; Cursor owned every edit and the final render.
- Not used: paid voice APIs, live LLM calls at runtime, Taxfix Drive writes from the build machine.

## Limitations
- Fixtures, not a camera. Rules, not a model. Legal thresholds cited to statute but this is not tax advice.
- Customer-value claim is a hypothesis: “people come back in Q4 because something is still unknown and still fetchable.” Not user-tested tonight.
