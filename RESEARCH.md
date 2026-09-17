# Taxfix Hackathon — research synthesis (2026-09-17)

Sources: official pack (`outputs/telegram-495/`), kickoff PDF Tax 365 (`outputs/telegram-496/KICKOFF.md`), Taxfix site + Survicate/Braze retention story, Trustpilot/Play themes, Finanztip/WISO/ELSTER competitive notes, two Grok briefs. Room audio TG #496/#497 opened; slides win.

## Challenge — Tax 365 (jury 25% each)

Open Taxfix **outside filing season, especially Q4** — voluntary recurring value (less anxiety / tax-readiness / feel financially clever). Someone opens in **November because they want to**; return loop is **next month**, not next July. **No empty reminders or fake urgency.** Also scored on Cursor multi-agent craft + working demo. Pitch ≤2 min by **21:00 sharp**. Full contract: `CHALLENGE_BRIEF.md`.

## What Taxfix already is

- **Basic:** guided Q&A → free estimate → pay to file via ELSTER (~€40–50).
- **Expert:** independent StB, checklist uploads, chat; % of refund / min fee.
- **Taxfix+:** vault + Academy + year-round chat (subscription) — storage exists; **habit does not**.
- **EN/expat moat** is real; complex/foreign/dual-residence cases bounce.
- **Internal truth (Survicate):** seasonality is the retention problem — “come back” is the stated goal; Braze journeys already cover off-season education. Promo pushes without opt-out show up in Play complaints.

## Public pain (do not build into the demo)

1. **Estimate ≠ Bescheid** — loudest trust wound. → **Never show a refund €.**
2. Billing / Expert / subscription surprises.
3. Scan opacity; support delays; eligibility walls.
4. Praise cluster: speed, no jargon, English for expats.

## Competitive white space

| Player | Off-season strength |
|---|---|
| **WISO Steuer-Box** | Best year-round Beleg archive → auto into return |
| **MeinELSTER+** | Official free Belege; okELSTER threat to “file in 10 min” |
| **Steuerbot** | Chat file; weak year archive |
| **Taxfix** | Vault exists; weaker pull habit than WISO |

**Gap:** English-first *readiness literacy* (what to keep now, what waits until Feb) — not another dumb archive, not an AI Steuerberater.

## Q4 physics (binding)

**Cannot honestly do in Nov:** refund estimate (Lohnsteuerbescheinigung / Jahressteuerbescheinigung arrive **after** year-end).

**Can do now:** home-office day log, commute notes, Weihnachten Spendenquittungen, Handwerker labor invoices, work-kit/training receipts, side-hustle rows, life-event notes. Pauschbetrag (€1,230) is *already* in Lohnsteuer — tracking only matters if actual Werbungskosten may **exceed** it (Finanztip). That is the honest “clever” question.

## Tropes that lose tonight

Nudge spam · filing streaks · crypto · generic chatbot · “AI tax advisor” · calendar reminders · refund theatre.

## Grok recommendations (converged)

1. **Steuerklar** — Q4 readiness map + progress vs Pauschbetrag + keep/maybe/not inbox; literacy copy only.
2. **Year Packet** — multi-agent shoebox: Ingestor → Classifier → Gap Scout → Packet Clerk → **Claim Guard** (vetoes €-refund and advice claims).

**Merged build for tonight: Year Packet / Steuerklar** — same product. **Mobile-first phone chrome** in `year-packet/` (`?tour=1` auto-plays tab navigation for screen-record). Cursor agents + ruflo MCP + CLI fixtures. Cursor $50 credit; **Override OFF**.

### Anti-bolt-on (Hemang 2026-09-17 · win vs ~30 teams)

Taxfix already ships: guided filing, Document Manager storage, Taxfix+ vault, Academy, Braze off-season education. **Do not** pitch “smarter Documents” or “OCR on the vault.” **Do not** use Jan-2026 Document Manager “auto-import planned for 2026” as proof of September absence.

**Product we ship instead:** Year Packet = Q4-native mode —
1. **Clever Meter** — logged Werbungskosten pressure vs €1,230 Arbeitnehmer-Pauschbetrag; HO day rate €6 capped at €1,260 / 210 days (§4 Abs. 5 S. 1 Nr. 6c EStG). Never a refund €; amounts not verified deductibles.
2. **Q4 capture** — donations & craftsman *payment year* evidence while you have it — **not** a fake “receipts die 31 Dec” deadline.
3. **Claim Guard** — vetoes “You can/may deduct €…”.
4. **Unlock** — filing questions when Lohnsteuerbescheinigung exists; Q4 prep still useful earlier.

**Craft honesty:** Cursor built UI/CLI; Grok researched; pipeline = deterministic JS stages over fixtures (not six live LLM agents). Pitch video: `year-packet/pitch/Hemang_YearPacket.mp4`.

### Demo spine (≤2 min) — record the phone

1. Clever ring + HO cap literacy.
2. Scan → Packet with Q4 tags (payment year).
3. Pipeline + Claim Guard veto “You can deduct €847.”
4. Unlock locked for filing; Q4 prep allowed. Footer: *Not filing. Not a vault. Not a refund.*

### Falsifiers

- Any screen states a deductible/refund euro.
- Judge can describe it as “chatbot plus folders.”
- Demo needs Steuer-ID / ELSTER / income.

## Dual track (Hemang 2026-09-17)

- **Year Packet** = Taxfix jury primary (`year-packet/`).
- **Open Labs** = “github for labs” clarified as open-source **publicly funded** labs + **problem agenda** (what to solve), not ELN. Complements Nightwatch (runs instruments). Stub: `open-labs/`.
- **brag** = pitch-video assembler later; **no writes to Taxfix Google Drive** from this host.

## Still open

- **Solo** — Hemang has no team. Do not invent teammates or ask for a team name. ≥4-person prize tracks: skip. Still deliver pitch + demo.
- Kickoff PDF + TG #496/#497 are on disk (`outputs/telegram-496/`). Challenge name **Tax 365**.
- Screen-record `Hemang_YearPacket.mp4` on the laptop (`?tour=1`).
