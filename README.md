# Cursor Hackathon @ Taxfix — dual track

**Challenge: Tax 365** — from deadline day to year-round. Voluntary recurring engagement *outside* filing season (November because they *want* to). Full brief: `CHALLENGE_BRIEF.md` · slides: `outputs/telegram-496/KICKOFF.md`.

**Solo builder:** Hemang (no team — ignore ≥4 prize tracks). **Pitch deadline:** 21:00 CEST sharp · **Do not write to Taxfix Google Drive from this machine** (upload video from venue laptop only).

| Track | Role tonight | Folder |
|---|---|---|
| **Year Packet** | Primary jury demo — Q4 Clever Meter (not DocMgr bolt-on) | `year-packet/` |
| **OpenDocket** | Parallel: public-funded lab problem agenda | `open-labs/` |
| Research | Synthesis | `RESEARCH.md` |

## Models

- **Cursor $50 credit** — build lane (Override OpenAI Base URL **OFF**).
- **Grok** — strategy / research (save Cursor tokens).
- **RVN** `http://rogbeast:11470/v1` model `rvn` — backup only; never as global Override.

## Jury (25% each)

Innovation · Cursor multi-agent (agents/MCP/SDK/CLI) · Taxfix fit (off-season / Q4) · demo.

## Quick start (Year Packet — mobile)

```bash
cd year-packet && python3 -m http.server 8765
# http://127.0.0.1:8765/?tour=1
./demo.sh
node test-guard.mjs
node record-pitch.mjs   # writes pitch/Hemang_YearPacket.mp4
```

Differentiator: Clever Meter + Claim Guard + Q4 capture (payment year) — **not** a Document Manager bolt-on.
**Tone is the scored criterion** (jury audio, `CHALLENGE_BRIEF.md`): calm, optional, weekly-light. Video is a **silent** screen recording (`year-packet/pitch/Hemang_YearPacket.mp4`, ~80 s).
