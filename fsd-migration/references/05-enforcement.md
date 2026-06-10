# Phase 4 — Enforcement & Verification

The migration only sticks if the architecture is machine-enforced. Set up both tools below, then run final verification.

---

## 1. Steiger — the official FSD linter

```bash
npm install -D steiger @feature-sliced/steiger-plugin
npx steiger ./src
```

Config when exceptions are needed:

```ts
// steiger.config.ts
import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/shared/**"],
    rules: {
      // example: allow bigger shared/ui while the kit is consolidated
      "fsd/excessive-slicing": "off",
    },
  },
]);
```

Key rules to pay attention to after a migration:

- `insignificant-slice` — entity/feature used by one page → merge it back into the page.
- `excessive-slicing` — too many slices on a layer → group or merge.
- `forbidden-imports` — upward or cross-imports → fix, never silence.
- `public-api` — slice without index / deep imports → add the missing public API.

Every remaining violation must be either fixed or explicitly accepted in `fsd-migration-plan.md` with a reason.

## 2. ESLint import boundaries

If the project uses ESLint, add layer enforcement so violations fail in the editor and CI. Two options:

**Option A — `@conarti/eslint-plugin-feature-sliced`** (FSD-specific):

```js
// eslint.config.js (flat)
import fsd from "@conarti/eslint-plugin-feature-sliced/configs/flat";
export default [fsd.recommended];
```

**Option B — `eslint-plugin-boundaries`** (general, more controllable):

```js
import boundaries from "eslint-plugin-boundaries";

export default [{
  plugins: { boundaries },
  settings: {
    "boundaries/elements": [
      { type: "app",      pattern: "src/app/*" },
      { type: "pages",    pattern: "src/pages/*" },
      { type: "widgets",  pattern: "src/widgets/*" },
      { type: "features", pattern: "src/features/*" },
      { type: "entities", pattern: "src/entities/*" },
      { type: "shared",   pattern: "src/shared/*" },
    ],
  },
  rules: {
    "boundaries/element-types": ["error", {
      default: "disallow",
      rules: [
        { from: "app",      allow: ["pages", "widgets", "features", "entities", "shared"] },
        { from: "pages",    allow: ["widgets", "features", "entities", "shared"] },
        { from: "widgets",  allow: ["features", "entities", "shared"] },
        { from: "features", allow: ["entities", "shared"] },
        { from: "entities", allow: ["entities", "shared"] },   // same-layer only via @x
        { from: "shared",   allow: ["shared"] },
      ],
    }],
  },
}];
```

## 3. Final verification checklist

Run all, in order; every item must pass:

```bash
# 1. Typecheck
npx tsc --noEmit
# 2. Lint (incl. boundaries)
npm run lint
# 3. FSD lint
npx steiger ./src
# 4. Tests
npm test
# 5. Production build
npm run build
# 6. No imports into old structure remain
grep -rn "from ['\"]@/components\|@/utils\|@/helpers\|@/hooks" src --include="*.ts*" ; echo "expect: no output"
# 7. No deep imports bypassing public APIs (spot check)
grep -rn "from ['\"]@/pages/[^'\"]*/ui/" src --include="*.ts*" --exclude-dir=pages ; echo "expect: no output"
```

If a dev server exists: boot it and load the 2–3 highest-traffic pages; check the console for runtime errors from dynamic `import()` paths (these don't fail at build time).

## 4. CI

Add Steiger + the boundary lint to the project's CI pipeline (same script as the existing lint step):

```json
// package.json
"scripts": {
  "lint:fsd": "steiger ./src",
  "check": "tsc --noEmit && npm run lint && npm run lint:fsd && npm test"
}
```

## 5. Final report template

Append to `fsd-migration-plan.md` and summarize for the user:

```markdown
## Result
- Final tree (2 levels): <tree>
- Steps completed: 1–7 ✅ / partial (incremental: next step = N)
- Verification: build ✅ typecheck ✅ tests ✅ steiger ✅
- Top moves: <10 highest-impact relocations>
- Deliberately out of scope / follow-ups: <list with reasons>
- Enforcement: steiger + eslint boundaries wired into `npm run check`
```
