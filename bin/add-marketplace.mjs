#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MARKETPLACE_KEY = "ppv";
const MARKETPLACE_REPO = "FrankyJo/ai_skills";

const settingsDir = join(homedir(), ".claude");
const settingsPath = join(settingsDir, "settings.json");

mkdirSync(settingsDir, { recursive: true });

let settings = {};
try {
  settings = JSON.parse(readFileSync(settingsPath, "utf8"));
} catch {}

if (settings.extraKnownMarketplaces?.[MARKETPLACE_KEY]) {
  console.log(`Marketplace "${MARKETPLACE_KEY}" already registered.`);
  process.exit(0);
}

settings.extraKnownMarketplaces ??= {};
settings.extraKnownMarketplaces[MARKETPLACE_KEY] = {
  source: { source: "github", repo: MARKETPLACE_REPO },
};

writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
console.log(`
Marketplace registered! Install skills with:

  npx claude-skill-3d-animation-landing
  npx claude-skill-html2wp
`);