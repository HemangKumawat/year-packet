#!/usr/bin/env bash
# CLI surface — deterministic fixture pipeline (same contracts as UI).
set -euo pipefail
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  node --input-type=module <<'JS'
import { readFileSync } from "fs";
import { runPipeline, formatCli } from "./agents.js";
const receipts = JSON.parse(readFileSync("./fixtures/receipts.json", "utf8"));
console.log(formatCli(runPipeline(receipts, { homeOfficeDays: 40 })));
JS
else
  echo "node required for demo.sh" >&2
  exit 1
fi
