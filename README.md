# Year Packet — Cursor Hackathon Berlin @ Taxfix · 2026-09-17 · solo entry

**Challenge:** Tax 365 — voluntary, useful value *outside* filing season, in a calm tone (organizers: "not engagement for its own sake; the tone is what we score").
**Submission sheet:** `SUBMISSION.md` (team, one-liner, repo, Cursor use). **Video:** `year-packet/pitch/Hemang_YearPacket_narrated.mp4` (97 s, narrated; silent backup alongside). Deadline 21:00 Berlin.

| Folder | What |
|---|---|
| `year-packet/` | The prototype: mobile UI, rule pipeline, Claim Guard, CLI twin, tests, recorder, narration mixer |
| `open-labs/` | Parallel idea (OpenDocket) — not part of the jury demo |
| `RESEARCH.md` | Taxfix / statute / competitor notes |
| `CHALLENGE_BRIEF.md` | Notes from the room — noisy ASR of one far-mic recording, not verbatim |

## Run it

```bash
cd year-packet && python3 -m http.server 8765     # http://127.0.0.1:8765/  (desktop shows the phone + context panel)
./demo.sh                                           # CLI twin of the pipeline
node test-guard.mjs                                 # 35 checks: guard, caps, meter, resolution, thresholds
node record-pitch.mjs                               # silent base recording (Playwright, real UI)
HYPERFRAMES_PYTHON=/path/to/venv/python node mix-voice.mjs   # local Kokoro narration → landscape mp4
```

## What it does (and doesn't)
- **Day Meter** — home-office days × €6 vs the €1,230 allowance the tax office applies automatically (cap 210 d / €1,260). A log, not a verdict. Receipt euros never feed it.
- **Packet** — four demo receipts sorted keep / maybe / noise; one question ("mostly for work?") resolves a maybe and stays resolved. Craftsman: labour vs material + bank transfer (§35a). Donation >€300: official receipt needed (§50 EStDV).
- **Claim Guard** — refuses any sentence promising a refund or deduction euro.
- **Handoff** — each kept item mapped to the Taxfix filing question it already answers; certificate arrives later on its own.
- Deterministic rules over fixtures. No live OCR, no runtime LLM. Not tax advice.

## How it was built
Cursor (Fable 5.1 agent) wrote everything here; Grok ran adversarial review against Taxfix's live product and a competitor sweep; a Codex session verified statute thresholds and preflighted local TTS. Details in `SUBMISSION.md`.
