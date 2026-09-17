# Grok brief — Taxfix Year Packet adversarial review (bounded)

Deadline context: Cursor Hackathon @ Taxfix, pitch 21:00 CEST, solo Hemang.
Conserve Codex. No Claude. No paid fallback. No Taxfix Drive writes. No global Override.

## Task
Challenge current **Q4 differentiation** of Year Packet against Taxfix features that already exist. Audit year-end / December claims. Return **only ranked changes** that improve the demo before 21:00.

## Product under review (read these; do not rewrite wholesale)
- `Cursor_Hackathon/year-packet/` (index.html, app.js, agents.js, PITCH.md)
- `Cursor_Hackathon/RESEARCH.md`
- Codex handoff already applied: `docs/handoffs/2026-09-17-hackathon-codex-support.md`

## Current claimed differentiators
1. Clever Meter: logged Werbungskosten pressure vs €1,230 Arbeitnehmer-Pauschbetrag; HO €6/day capped 210 days / €1,260.
2. Q4 capture for donations/craftsman **payment year** (NOT “receipts die 31 Dec”).
3. Claim Guard vetoes deduction/refund-euro claims.
4. Unlock filing when Lohnsteuerbescheinigung exists; Q4 prep useful earlier.
5. Honest craft: deterministic fixture pipeline + Cursor/Grok collaboration (not six live LLM agents).
6. Parallel OpenDocket exists but is NOT the Taxfix jury primary.

## Hard constraints from owner + audit
- Official challenge **Tax 365** (`../../outputs/telegram-496/KICKOFF.md`, `../CHALLENGE_BRIEF.md`): voluntary off-season return loop (next month, not next July). Tone: in control / clever, not anxious. No notification theatre, streaks, fake urgency, engagement-for-engagement, filing-only features.
- Solo; ~30 teams; win seriously.
- No bolt-on on Document Manager / vault / Academy.
- No refund theatre; no fake urgency; no Jan-2026 Taxfix roadmap as proof of September absence.
- Primary sources preferred (taxfix.de, support.taxfix.de, gesetze-im-internet.de, Finanztip).

## Deliverable format (strict)
Ranked list max **7** changes. For each:
1. Change (one sentence, file-level if possible)
2. Why it beats “Taxfix already does X” (cite primary URL)
3. Acceptance check (observable in demo/video in <5 min)
4. Effort: S / M (skip L)

Also: **KILL list** — claims in current pitch/UI that are still false or undifferentiated (with source).

End with: TOP 3 to do before 21:00 only.
