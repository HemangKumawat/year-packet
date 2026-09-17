#!/usr/bin/env node
/**
 * Narrated landscape pitch: Kokoro (hyperframes tts, local) per segment, placed at
 * screen-aligned offsets over the silent recording; phone centred on 1920x1080.
 * timeout-policy: BATCH
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pitch = join(__dirname, "pitch");
const voiceDir = join(pitch, "voice");
mkdirSync(voiceDir, { recursive: true });
const base = join(pitch, "Hemang_YearPacket.mp4");
const out = join(pitch, "Hemang_YearPacket_narrated.mp4");
const spec = JSON.parse(readFileSync(join(pitch, "narration.json"), "utf8"));
const PY = process.env.HYPERFRAMES_PYTHON || "/tmp/year-packet-voice/.venv/bin/python";

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", env: { ...process.env, ...env } });
  if (r.status !== 0) {
    console.error(`${cmd} ${args.join(" ")}\n${(r.stderr || r.stdout || "").slice(-1200)}`);
    process.exit(1);
  }
  return r.stdout;
}
function dur(file) {
  return Number(
    run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", file]).trim()
  );
}

const placed = [];
for (const s of spec.segments) {
  const txt = join(voiceDir, `${s.id}.txt`);
  const raw = join(voiceDir, `${s.id}.raw.wav`);
  const wav = join(voiceDir, `${s.id}.wav`);
  writeFileSync(txt, s.text + "\n");
  if (!existsSync(raw) || readFileSync(txt, "utf8") !== (existsSync(txt + ".done") ? readFileSync(txt + ".done", "utf8") : "")) {
    run("npx", ["--yes", "hyperframes", "tts", txt, "--voice", spec.voice, "--output", raw, "--json"], {
      HYPERFRAMES_PYTHON: PY,
    });
    writeFileSync(txt + ".done", s.text + "\n");
  }
  const d = dur(raw);
  let tempo = 1;
  if (d > s.max) tempo = Math.min(1.12, d / s.max);
  const filters = [`atempo=${tempo.toFixed(3)}`, "loudnorm=I=-16:TP=-1.5:LRA=11"];
  run("ffmpeg", ["-y", "-v", "error", "-i", raw, "-af", filters.join(","), "-ar", "48000", "-ac", "2", wav]);
  const final = dur(wav);
  placed.push({ id: s.id, at: s.at, raw_s: +d.toFixed(2), tempo: +tempo.toFixed(3), final_s: +final.toFixed(2), fits: final <= s.max + 0.3 });
}
console.log(JSON.stringify(placed, null, 0));
if (placed.some((p) => !p.fits)) {
  console.error("segment overflow — shorten text");
  process.exit(2);
}

const videoDur = dur(base);
const inputs = ["-i", base];
const delayParts = [];
placed.forEach((p, i) => {
  inputs.push("-i", join(voiceDir, `${p.id}.wav`));
  const ms = Math.round(p.at * 1000);
  delayParts.push(`[${i + 1}:a]adelay=${ms}|${ms}[a${i}]`);
});
const mixIn = placed.map((_, i) => `[a${i}]`).join("");
const fc = [
  ...delayParts,
  `${mixIn}amix=inputs=${placed.length}:normalize=0:duration=longest,apad=whole_dur=${videoDur.toFixed(3)}[voice]`,
  `[0:v]scale=-2:1040,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0c100e,format=yuv420p[v]`,
].join(";");

run("ffmpeg", [
  "-y", "-v", "error",
  ...inputs,
  "-filter_complex", fc,
  "-map", "[v]", "-map", "[voice]",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
  "-c:a", "aac", "-b:a", "128k",
  "-movflags", "+faststart",
  "-t", videoDur.toFixed(3),
  out,
]);

const d = dur(out);
const hasAudio = run("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_name", "-of", "default=nk=1:nw=1", out]).trim();
const ok = d <= 120 && d >= 70 && hasAudio === "aac" && statSync(out).size > 100_000;
console.log(JSON.stringify({ out, duration_s: +d.toFixed(2), audio: hasAudio, bytes: statSync(out).size, ok }));
process.exit(ok ? 0 : 3);
