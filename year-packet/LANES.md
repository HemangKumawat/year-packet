# Lane routing — 2026-09-17 evening

| Lane | Status | Use tonight |
|---|---|---|
| **Cursor (this session)** | Live IDE + $50 credit redeemed; Ultra via Grok acct context | Implementation, video, apply ranked review |
| **cursor-agent CLI `--list-models`** | Auth required in this shell (no CURSOR_API_KEY in vault) | Caps digest still says cursor-agent authenticated (stale or different session) |
| **Astra model id** | **Not listed** in `.nexus/capabilities-*` / stack SSOT | Do **not** invent an Astra model ID; do **not** set Override OpenAI Base URL |
| **Grok** | auth.json present; `grok 1.0.34` | Adversarial Q4 review (`GROK_BRIEF.md` → `pitch/grok-adversarial.json`) |
| **Codex** | Conserve (97%) | Support finished; no parallel exploration |

Hard product critique also launched as Cursor Task (inherit) — not labeled Astra.

Falsifier for Astra: only use if `cursor-agent --list-models` (authenticated) literally shows a model whose name/id is Astra.
