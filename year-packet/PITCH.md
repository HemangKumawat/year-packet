# Pitch — Hemang solo · Year Packet · 97 s narrated

**Primary:** `pitch/Hemang_YearPacket_narrated.mp4` (97.3 s, 1920×1080, Kokoro `af_heart` local TTS, phone UI centred). Uploaded under the required name `Hemang_YearPacket.mp4`.
**Backup:** `pitch/Hemang_YearPacket.mp4` (same recording, silent, 780×1688).
**Build:** `node record-pitch.mjs` (Playwright, real UI, resets demo state) → `HYPERFRAMES_PYTHON=… node mix-voice.mjs` (per-segment TTS placed at screen offsets from `pitch/narration.json`; overflow auto-trimmed ≤1.12×).

Organizers in the room: not engagement for its own sake; the **tone** is scored; calm off-season value. Every line is calm on purpose.

| t | Screen | Narration (verbatim `narration.json`) |
|---|---|---|
| 0:00 | Title card — solo · one-liner · prototype · Cursor/Grok | Year Packet. A solo entry for Taxfix, built in Cursor. Off-season, a tax app should feel calm. |
| 0:07 | Home — “How many days did you work from home this year?”, ring 0/210, weekly card | One question, no pressure… A log you can't rebuild in March. |
| 0:16 | Taps → 40/210, “Still a log, not a verdict” | Each tap is a day. Six euros in a Taxfix question later… nothing here is a refund. |
| 0:28 | Scan → four demo receipts | …The packet sorts them: keep, maybe, noise. And it finds the one question worth asking. |
| 0:41 | Packet — labour €420/€470, donation >€300 needs receipt, MediaMarkt **maybe → keep** (“you said: work”) | …MediaMarkt? One tap: mostly for work. Answered once, it stays answered. |
| 0:59 | Pipeline — six stages, Cursor/Grok craft note, guard refuses “You can deduct €847” | Six honest stages: deterministic rules, not live agents… |
| 1:17 | Handoff — “No filing tonight”, 4 mapped Taxfix questions, 1 still worth fetching | Handoff: no filing tonight… One thing is still worth fetching. |
| 1:27 | Home | That's Year Packet. Calm, honest, and only as much habit as one tap a day. |

**Kill words (never in UI or narration):** refund estimate, you're covered, receipts optional, nothing else to do, file now, streaks, pressure, locked, beat, urgency, “dies Dec 31”, “six autonomous agents”, Jan-2026 roadmap as proof.
