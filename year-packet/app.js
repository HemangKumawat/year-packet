import {
  STAGES,
  PAUSCHBETRAG,
  HO_DAY_EUR,
  HO_DAY_CAP,
  normalizeHomeOfficeDays,
  homeOfficeEuros,
  cleverState,
  runPipeline,
} from "./agents.js";

const LS_KEY = "year-packet-ho-days-2026";
const LS_RESOLVED = "year-packet-resolved-2026";

const agentList = document.getElementById("agentList");
const itemList = document.getElementById("itemList");
const stagesEl = document.getElementById("stages");
const guardBanner = document.getElementById("guardBanner");
const gapList = document.getElementById("gapList");
const phone = document.getElementById("phone");
const vfLabel = document.getElementById("vfLabel");
const viewfinder = document.getElementById("viewfinder");
const cleverRing = document.getElementById("cleverRing");
const cleverEur = document.getElementById("cleverEur");
const cleverLabel = document.getElementById("cleverLabel");
const cleverHint = document.getElementById("cleverHint");
const cleverCard = document.getElementById("cleverCard");
const decStrip = document.getElementById("decStrip");
const errBanner = document.getElementById("errBanner");
const hoCount = document.getElementById("hoCount");
const packetSub = document.getElementById("packetSub");
const handoffList = document.getElementById("handoffList");

let homeOfficeDays = normalizeHomeOfficeDays(
  Number(localStorage.getItem(LS_KEY) || 0)
);
let resolutions = {};
try {
  resolutions = JSON.parse(localStorage.getItem(LS_RESOLVED) || "{}") || {};
} catch {
  resolutions = {};
}
let lastPacket = null;
let lastReceipts = null;
let tourRunning = false;
let pipelineBusy = false;

function setClock() {
  const d = new Date();
  document.getElementById("clock").textContent = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
setClock();
setInterval(setClock, 30_000);

function showError(msg) {
  if (!errBanner) return;
  errBanner.hidden = !msg;
  errBanner.textContent = msg || "";
}

function persistHO() {
  localStorage.setItem(LS_KEY, String(homeOfficeDays));
  if (hoCount) hoCount.textContent = `${homeOfficeDays} / ${HO_DAY_CAP} days`;
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.hidden = s.dataset.screen !== name;
  });
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("on", t.dataset.tab === name);
  });
}

function renderStages(activeId = null, done = new Set()) {
  agentList.replaceChildren(
    ...STAGES.map((a) => {
      const li = document.createElement("li");
      if (done.has(a.id)) li.classList.add("done");
      if (activeId === a.id) li.classList.add("active");
      const strong = document.createElement("strong");
      strong.textContent = a.name;
      const owns = document.createElement("span");
      owns.className = "owns";
      owns.textContent = a.owns;
      li.append(strong, owns);
      return li;
    })
  );
}

function paintClever(hoEur) {
  const state = cleverState(hoEur);
  const days = Math.round(hoEur / HO_DAY_EUR);
  const pct = Math.min(100, (days / HO_DAY_CAP) * 100);
  cleverRing.style.setProperty("--pct", String(pct));
  cleverEur.textContent = `${days}`;
  cleverLabel.textContent = state.label;
  cleverHint.textContent = state.hint;
  cleverCard.dataset.state = state.id;
}

function updateMeterFromLocal() {
  paintClever(homeOfficeEuros(homeOfficeDays));
  persistHO();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function renderItems(packet) {
  itemList.replaceChildren();
  packet.items.forEach((item, i) => {
    const li = document.createElement("li");
    li.style.animationDelay = `${i * 55}ms`;
    const badge = document.createElement("span");
    badge.className = `badge ${item.keep}`;
    badge.textContent = item.keep;
    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = item.merchant;
    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = `${item.bucket} · ${item.date} · €${item.amount_eur}${item.resolved ? ` · you said: ${item.resolved}` : ""}`;
    const lit = document.createElement("div");
    lit.className = "item-meta";
    lit.textContent = item.literacy;
    li.append(badge, title, meta, lit);
    if (item.resolved) li.classList.add("resolved");

    if (item.question) {
      const q = document.createElement("div");
      q.className = "item-q";
      const qs = document.createElement("span");
      qs.textContent = item.question;
      const yes = document.createElement("button");
      yes.type = "button";
      yes.textContent = "Mostly work";
      yes.dataset.resolve = `${item.id}:work`;
      const no = document.createElement("button");
      no.type = "button";
      no.textContent = "Private";
      no.dataset.resolve = `${item.id}:private`;
      q.append(qs, yes, no);
      li.appendChild(q);
    }
    itemList.appendChild(li);
  });

  if (packetSub) {
    const open = packet.questions_open || 0;
    const done = packet.questions_resolved || 0;
    packetSub.textContent =
      `${packet.items.filter((i) => i.keep === "keep").length} keep · ` +
      (open ? `${open} question open` : "no questions open") +
      (done ? ` · ${done} answered by you` : "");
  }

  if (packet.q4_items?.length) {
    decStrip.textContent = packet.q4_items
      .map((d) => `${d.merchant} (${d.bucket})`)
      .join(" · ");
  }
}

function renderGaps(packet, handoff = []) {
  if (handoffList) {
    handoffList.replaceChildren(
      ...handoff.map((h) => {
        const li = document.createElement("li");
        li.className = "ok";
        li.textContent = h;
        return li;
      })
    );
  }
  gapList.replaceChildren(
    ...packet.gaps.map((g) => {
      const li = document.createElement("li");
      li.className = g.q4 ? "gap" : "ok";
      li.textContent = `${g.q4 ? "Still worth fetching" : "Later, on its own"}: ${g.type}${g.note ? ` — ${g.note}` : ""}`;
      return li;
    })
  );
}

/** Real state change: the user answers the one question on a "maybe" item. */
function resolveItem(id, answer) {
  if (!lastReceipts) return;
  resolutions = { ...resolutions, [id]: answer };
  localStorage.setItem(LS_RESOLVED, JSON.stringify(resolutions));
  const result = runPipeline(lastReceipts, { homeOfficeDays, resolutions });
  lastPacket = result.packet;
  renderItems(result.packet);
  renderGaps(result.packet, result.handoff);
}
itemList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-resolve]");
  if (!btn) return;
  const [id, answer] = btn.dataset.resolve.split(":");
  resolveItem(id, answer);
});

async function runPipelineUI() {
  if (pipelineBusy) return null;
  pipelineBusy = true;
  showError("");
  try {
    const res = await fetch("./fixtures/receipts.json");
    if (!res.ok) throw new Error(`Could not load fixtures (${res.status})`);
    const receipts = await res.json();
    lastReceipts = receipts;
    const result = runPipeline(receipts, { homeOfficeDays, resolutions });
    lastPacket = result.packet;
    homeOfficeDays = result.packet.clever.home_office_days;
    paintClever(result.packet.clever.pressure_eur);
    persistHO();

    stagesEl.replaceChildren();
    guardBanner.hidden = true;
    const done = new Set();
    renderStages();

    for (const stage of result.stages) {
      renderStages(stage.agent, done);
      await sleep(420);
      done.add(stage.agent);
      renderStages(null, done);
      const div = document.createElement("div");
      div.className = "stage" + (stage.ok ? "" : " fail");
      div.textContent = `${stage.agent}: ${stage.detail}`;
      stagesEl.appendChild(div);

      if (stage.agent === "claim_guard" && stage.attack_demo && !stage.attack_demo.ok) {
        guardBanner.hidden = false;
        guardBanner.textContent = stage.attack_demo.veto;
      }
    }

    renderItems(result.packet);
    renderGaps(result.packet, result.handoff);
    return result;
  } catch (err) {
    showError(String(err.message || err));
    return null;
  } finally {
    pipelineBusy = false;
  }
}

async function simulateCapture() {
  if (pipelineBusy) return;
  viewfinder.classList.add("flash");
  vfLabel.textContent = "Reading four demo receipts…";
  await sleep(700);
  viewfinder.classList.remove("flash");
  vfLabel.textContent = "Sorting: keep / maybe";
  await sleep(650);
  vfLabel.textContent = "One question found";
  await sleep(550);
  await runPipelineUI();
  showScreen("packet");
}

/** Readable pitch pacing (~90–100s). */
async function playTour() {
  if (tourRunning) return;
  tourRunning = true;
  phone.classList.add("touring");
  try {
    showScreen("home");
    await sleep(7000);
    homeOfficeDays = normalizeHomeOfficeDays(Math.max(homeOfficeDays, 40));
    updateMeterFromLocal();
    await sleep(6000);

    showScreen("capture");
    await sleep(3500);
    await simulateCapture();
    await sleep(8000);

    showScreen("agents");
    await sleep(4000);
    await runPipelineUI();
    await sleep(12000);

    showScreen("ready");
    await sleep(9000);
    showScreen("home");
    await sleep(4000);
  } finally {
    phone.classList.remove("touring");
    tourRunning = false;
  }
}

document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => showScreen(t.dataset.tab));
});
document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => showScreen(el.dataset.go));
});

document.getElementById("runBtn").addEventListener("click", () => runPipelineUI());
document.getElementById("shutter").addEventListener("click", () => simulateCapture());
document.getElementById("tourBtn").addEventListener("click", () => playTour());

function bumpHO() {
  homeOfficeDays = normalizeHomeOfficeDays(homeOfficeDays + 1);
  updateMeterFromLocal();
}
document.getElementById("hoBtn").addEventListener("click", bumpHO);
document.getElementById("hoDesk").addEventListener("click", bumpHO);

renderStages();
updateMeterFromLocal();

const params = new URLSearchParams(location.search);
if (params.get("tour") === "1" || params.get("auto") === "1") {
  setTimeout(() => playTour(), 800);
}

function resetDemo() {
  homeOfficeDays = 0;
  resolutions = {};
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_RESOLVED);
  updateMeterFromLocal();
}

// Expose for record script
window.__yearPacket = { playTour, showScreen, bumpHO, resolveItem, resetDemo };
