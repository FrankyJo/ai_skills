---
name: fsd-migration
description: >-
  Analyze an existing frontend project (including monorepos) and migrate its
  architecture to Feature-Sliced Design (FSD) v2.1. Audits the current
  structure, writes fsd-migration-plan.md with an old-path → new-path mapping,
  then executes the restructure incrementally with build/test verification
  after every step: pages first, then app/shared, cross-import elimination,
  segments, public APIs, and lint enforcement (Steiger). Triggers: "migrate to
  FSD", "refactor to Feature-Sliced Design", "convert project to FSD",
  "restructure frontend architecture", "перевести проект на FSD", "переписати
  архітектуру на FSD", "рефакторинг на Feature-Sliced Design", "мігрувати на
  FSD".
license: MIT
metadata:
  author: ppv
  version: "1.0"
---

# FSD Migration Skill

You are a senior frontend architect. This skill takes an existing frontend codebase with any architecture (by-type folders, atomic design, ad-hoc modules, monorepo apps) and restructures it into **Feature-Sliced Design v2.1**.

**Core promise: the app must build and behave identically after every phase.** This is a refactor, not a rewrite — no logic changes, no dependency upgrades, no "improvements while we're at it".

Methodology source: [fsd.how](https://fsd.how). FSD rules are summarized in [references/01-fsd-cheatsheet.md](references/01-fsd-cheatsheet.md) — read it before planning.

---

## Workflow overview

```
Phase 0  Intake        → confirm scope, framework, verify commands
Phase 1  Audit         → detect current architecture, inventory the code
Phase 2  Plan          → write fsd-migration-plan.md, get user approval
Phase 3  Execute       → restructure step by step, verify after each step
Phase 4  Enforce       → path aliases, Steiger, final report
```

Never skip Phase 2. Never start moving files without an approved plan.

---

# Phase 0 — Intake

Ask only what you cannot detect yourself. Detect first, then confirm:

```bash
# Framework & tooling
cat package.json | head -60
ls next.config.* nuxt.config.* vite.config.* astro.config.* 2>/dev/null
# Monorepo?
ls pnpm-workspace.yaml lerna.json turbo.json nx.json 2>/dev/null
cat package.json | grep -A 10 '"workspaces"'
```

Then confirm with the user:

1. **Scope** — whole repo, or one app/package of a monorepo? In a monorepo, **each app gets its own FSD root** (`apps/web/src/{app,pages,...}`). Shared workspace packages stay packages — do not force one giant FSD tree across the monorepo. See [references/02-audit-and-mapping.md](references/02-audit-and-mapping.md).
2. **Verify commands** — how to prove nothing broke: build command, test command, typecheck command. If none exist, the minimum bar is a successful production build + typecheck.
3. **Mode** — `full` (migrate everything in this session) or `incremental` (migrate layer by layer / page by page across sessions, FSD coexists with old structure). Default to `full` for small/medium projects, recommend `incremental` for large ones (>~400 source files).
4. **Git** — work on a new branch (`refactor/fsd-migration`). Confirm the working tree is clean before starting.

Record the answers at the top of the plan file in Phase 2.

---

# Phase 1 — Audit

Goal: understand the project well enough that every existing file can be assigned a future FSD path. Run scans in parallel; full command list in [references/02-audit-and-mapping.md](references/02-audit-and-mapping.md).

## 1.1 Inventory

- **Routes/pages** — router config, `pages/` or `app/` dir (Next/Nuxt), route components. The page list drives the whole migration.
- **Current architecture pattern** — by-type (`components/`, `hooks/`, `utils/`, `api/`), atomic design (`atoms/`, `molecules/`), feature folders, or mixed.
- **State management** — Redux/Zustand/Pinia/MobX/Context: where stores live, which are global vs per-page.
- **API layer** — fetch wrappers, generated clients, react-query/SWR hooks.
- **UI kit candidates** — design-system-ish components (Button, Input, Modal) vs business components (UserCard, OrderTable).
- **Import aliases** — `tsconfig.json` paths, bundler aliases. You will redefine these.
- **Usage counts** — for each shared-looking module, count import sites:
  ```bash
  grep -rn "from ['\"].*components/Button" src --include="*.ts*" | wc -l
  ```
  Used by 1 page → belongs to that page. Used by 2+ pages → candidate for shared/entities/widgets.

## 1.2 Detect the framework constraints

Next.js / Nuxt / SvelteKit own the `pages/` or `app/` folder name. Standard solutions (keep the framework folder thin, real code in `src/pages/` etc.) are in [references/04-framework-integration.md](references/04-framework-integration.md). Read it whenever the project uses a meta-framework.

## 1.3 Report findings

Before planning, give the user a short summary: detected architecture, page count, framework, state manager, the 5–10 most-imported modules, and any red flags (circular imports, god-files, code imported across monorepo app boundaries).

---

# Phase 2 — Plan

Write **`fsd-migration-plan.md`** in the project root. Structure:

```markdown
# FSD Migration Plan
Scope / mode / verify commands / branch  ← from Phase 0

## Target structure
src/
├── app/        ← entry, providers, router, global styles
├── pages/      ← one slice per route
├── widgets/    ← (only if needed)
├── features/   ← (only if needed)
├── entities/   ← (only if needed)
└── shared/     ← ui kit, api client, lib, config

## Layer decisions
Which layers this project gets and WHY. Most projects need only
shared + pages + app. Do not create widgets/features/entities
"just in case" — justify each with ≥2 concrete reuse sites.

## Mapping table
| Current path | New path | Layer reasoning |
|---|---|---|
| src/components/Button.tsx | src/shared/ui/button/ | used by 7 pages |
| src/components/UserCard.tsx | src/pages/profile/ui/ | used only by profile |
| ...every top-level module gets a row... |

## Execution steps
Numbered steps matching Phase 3, each with its verify check.

## Out of scope
Logic changes, dependency updates, renames not required by FSD.
```

Planning rules (from FSD v2.1 — "start simple, extract when needed"):

- **Pages first.** Single-use code lives in the page that uses it. Duplication between two pages is acceptable; premature extraction is not.
- **Shared is for foundation** — UI kit, API client, config, focused lib helpers. Not a dumping ground.
- **Entities only when** the same business object (User, Product, Order) has model/api/ui reused across multiple pages. See the cheatsheet's "do you need entities at all" section.
- **Features only when** a user interaction is reused on 2+ pages.
- **Widgets only when** a large self-sufficient UI block is reused (header, footer) — a page's hero section is not a widget.

**Present the plan to the user and get approval before Phase 3.** If the user requested full autonomy, state the plan summary and proceed.

---

# Phase 3 — Execute

Follow the official from-custom step order. After **every** step: run the verify commands (build + typecheck + tests), fix all breakage from that step before the next one, then commit (`git mv` for moves — preserve history).

## Step 1 — Scaffold layers + divide by pages

Create the layer folders that the plan approved (no empty extras). Move each route's component tree into `src/pages/<route-name>/ui/`, create `index.ts` public API per page exporting only the page component. Update router imports to the public APIs.

## Step 2 — Separate app and shared

- `src/app/`: entrypoint, root providers, router config, global styles, store setup. App has **segments, not slices** (`app/routes/`, `app/providers/`, `app/styles/`).
- `src/shared/`: move only the clearly foundational code — API client → `shared/api/`, design-system components → `shared/ui/<component>/`, generic helpers → `shared/lib/<topic>/`, env/config → `shared/config/`.
- Set up aliases now: `@/app`, `@/pages`, `@/shared`, … (tsconfig `paths` + bundler).

## Step 3 — Eliminate cross-page imports

Find them:

```bash
grep -rn "from ['\"]@/pages/" src/pages --include="*.ts*"
# triage each hit: an import is fine only if it stays inside the same page slice
```

For each page-A-imports-page-B case, choose:
- code is generic → move down to `shared/`
- code is a reused business block → extract to `widgets/`/`features/`/`entities/` (only if plan approved that layer)
- small and diverging → **duplicate it**; duplication beats coupling between pages.

After this step the import rule must hold: slices import only strictly lower layers.

## Step 4 — Slim down shared

Anything in `shared/` imported by exactly one page moves into that page. Re-run usage counts to verify. Shared must contain zero business logic and zero knowledge of upper layers.

## Step 5 — Introduce segments

Inside every slice, organize by **purpose**: `ui/`, `api/`, `model/`, `lib/`, `config/`. Never `components/`, `hooks/`, `helpers/`, `types/` as segment names — distribute their contents by purpose (a hook fetching data → `api/`; a hook with form state → `model/`). Each slice keeps a single `index.ts` public API with **named explicit re-exports, never `export *`**.

## Step 6 — Extract entities/features/widgets (only if planned)

Move the reused business objects/interactions identified in the plan. Cross-imports between two entities use the `@x` notation (`entities/A/@x/b.ts`) — rules in [references/01-fsd-cheatsheet.md](references/01-fsd-cheatsheet.md). The `@x` pattern is allowed **only** on the entities layer.

## Step 7 — Delete the old structure

The old `components/`, `containers/`, `utils/` folders must now be empty — delete them. `grep` for any import still pointing at old paths; zero hits required.

Execution discipline:

- One step = one commit, message `fsd: step N — <what>`.
- If a step explodes into too many type errors, bisect it: move half, verify, move the rest.
- **Never** change behavior to make a move easier — if a file resists moving (hidden coupling), document it in the plan's "Out of scope / follow-ups" and leave a TODO.
- In `incremental` mode: stop after the step agreed with the user, update `fsd-migration-plan.md` with a "Progress" checklist so the next session can resume.

---

# Phase 4 — Enforce & report

1. **Steiger** (official FSD linter):
   ```bash
   npm install -D steiger @feature-sliced/steiger-plugin
   npx steiger ./src
   ```
   Fix every violation or document why it's accepted.
2. **Import boundaries** — if the project uses ESLint, add boundary enforcement (config in [references/05-enforcement.md](references/05-enforcement.md)).
3. **Final verification** — full build, typecheck, test suite, and (if a dev server exists) boot the app and load 2–3 key pages.
4. **Report** — update `fsd-migration-plan.md`: mark steps done, list follow-ups. Give the user a summary: final tree (2 levels deep), what moved where (top 10 by impact), what was deliberately left out, and how to keep the architecture enforced (Steiger in CI).

---

## Reference files

| File | When to read |
|---|---|
| [references/01-fsd-cheatsheet.md](references/01-fsd-cheatsheet.md) | Before Phase 2 — layers, slices, segments, import rule, public API, @x |
| [references/02-audit-and-mapping.md](references/02-audit-and-mapping.md) | Phase 1 — scan commands, architecture detection, monorepo strategy |
| [references/03-migration-playbook.md](references/03-migration-playbook.md) | Phase 3 — detailed per-step recipes and edge cases |
| [references/04-framework-integration.md](references/04-framework-integration.md) | When the project uses Next.js / Nuxt / Vite / Astro |
| [references/05-enforcement.md](references/05-enforcement.md) | Phase 4 — Steiger, ESLint boundaries, tsconfig paths, CI |