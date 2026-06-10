#!/usr/bin/env node
import { mkdirSync, cpSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "fsd-migration";
const ENTRIES = ["SKILL.md", "README.md", "references"];

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const toProject = process.argv.includes("--project");

const targetDir = join(
  toProject ? process.cwd() : homedir(),
  ".claude", "skills", SKILL_NAME
);

mkdirSync(targetDir, { recursive: true });
for (const entry of ENTRIES) {
  cpSync(join(PKG_ROOT, entry), join(targetDir, entry), { recursive: true });
}
console.log(`Installed ${SKILL_NAME} -> ${targetDir}`);
