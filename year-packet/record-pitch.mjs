#!/usr/bin/env node
/**
 * Scripted ~90s pitch video. Node timers (not page.waitForTimeout races).
 * timeout-policy: BATCH
 */
import { createServer } from "http";
import { readFileSync, statSync, mkdirSync, rmSync, readdirSync } from "fs";
import { extname, join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "pitch");
const framesDir = join(outDir, "frames");
mkdirSync(framesDir, { recursive: true });
for (const f of readdirSync(framesDir)) {
  try {
    rmSync(join(framesDir, f));
  } catch {
    /* ignore */
  }
}
const outMp4 = join(outDir, "Hemang_YearPacket.mp4");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const server = createServer((req, res) => {
  const path = (req.url || "/").split("?")[0];
  const file = path === "/" ? "/index.html" : path;
  try {
    const body = readFileSync(join(__dirname, file));
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("missing");
  }
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const { port } = server.address();
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--window-size=390,844"],
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__yearPacket, null, { timeout: 15_000 });

let i = 0;
const t0 = Date.now();
const nodeSleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function snap() {
  await page.screenshot({
    path: join(framesDir, `f${String(i).padStart(4, "0")}.png`),
    type: "png",
  });
  i += 1;
}
async function hold(seconds) {
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    await snap();
    await nodeSleep(500);
  }
}

// 0:00 title card — solo / project / one-liner / prototype
await page.evaluate(() => window.__yearPacket.resetDemo());
await page.evaluate((n) => window.__yearPacket.showScreen(n), "title");
await hold(7);

// 0:07 home — calm question, empty meter, weekly card
await page.evaluate((n) => window.__yearPacket.showScreen(n), "home");
await hold(9);
// 0:16 the habit: tap days one by one (visible ring movement), then a batch to 40
for (let k = 0; k < 6; k++) {
  await page.evaluate(() => window.__yearPacket.bumpHO());
  await hold(0.6);
}
for (let k = 0; k < 34; k++) await page.evaluate(() => window.__yearPacket.bumpHO());
await hold(8);

// 0:28 scan four demo receipts
await page.evaluate((n) => window.__yearPacket.showScreen(n), "capture");
await hold(3);
await page.click("#shutter");
await hold(10);

// 0:41 packet: read keep rows, then answer the one question (real state change)
await page.evaluate(() => document.getElementById("itemList").scrollIntoView({ block: "start" }));
await hold(6);
await page.evaluate(() => {
  const li = document.querySelector('#itemList button[data-resolve]');
  if (li) li.scrollIntoView({ block: "center", behavior: "instant" });
});
await hold(4);
await page.evaluate(() => window.__yearPacket.resolveItem("r3", "work"));
await hold(8);

// 0:59 pipeline — Cursor craft, six honest stages, guard refuses the test phrase
await page.evaluate((n) => window.__yearPacket.showScreen(n), "agents");
await hold(5);
await page.click("#runBtn");
await hold(13);

// 1:17 handoff — items already answer Taxfix questions; certificate later on its own
await page.evaluate((n) => window.__yearPacket.showScreen(n), "ready");
await hold(10);

// 1:27 back home — nothing due today
await page.evaluate((n) => window.__yearPacket.showScreen(n), "home");
await hold(6);

const wallSeconds = (Date.now() - t0) / 1000;
await browser.close();
server.close();

// Encode at the fps we actually captured, so video time == wall time (screenshots are slow).
const measuredFps = (i / wallSeconds).toFixed(4);
const ff = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-framerate",
    measuredFps,
    "-i",
    join(framesDir, "f%04d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "30",
    "-preset",
    "veryfast",
    "-movflags",
    "+faststart",
    "-an",
    outMp4,
  ],
  { encoding: "utf8" }
);
if (ff.status !== 0) {
  console.error(ff.stderr?.slice(-800));
  process.exit(1);
}
for (const f of readdirSync(framesDir)) rmSync(join(framesDir, f));

const st = statSync(outMp4);
const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", outMp4],
  { encoding: "utf8" }
);
const duration = Number(probe.stdout.trim());
const ok = st.size > 20_000 && duration >= 70 && duration <= 118; // event rule: ≤ 2:00 strict
console.log(JSON.stringify({ out: outMp4, bytes: st.size, frames: i, wall_s: Math.round(wallSeconds), fps: measuredFps, duration_s: duration, ok }));
process.exit(ok ? 0 : 2);
