# Phase 3 — Migration Playbook

Detailed recipes per step. Order follows the official FSD "from custom architecture" guide: **pages first, then everything else**. Verify (build + typecheck + tests) and commit after every step.

---

## Step 1 — Scaffold + divide by pages

```bash
mkdir -p src/{app,pages,shared}        # plus widgets/features/entities ONLY if planned
```

For each route from the audit:

1. `git mv` the route component and its **exclusively-used** child components into `src/pages/<route>/ui/`.
2. Create the public API:
   ```ts
   // src/pages/<route>/index.ts
   export { ProfilePage } from "./ui/ProfilePage";
   ```
3. Point the router at the public API.

Page slice naming: kebab-case, by business meaning (`sign-in`, `article-read`, `feed`). Group related pages without sharing code: `pages/settings/{profile,notifications}/`.

Don't chase perfection here — components shared between pages stay where they are until Step 3.

## Step 2 — app/ and shared/

**app/** (segments, no slices):

```
src/app/
├── entry: index.tsx / main.ts (framework entrypoint)
├── providers/   ← root providers composition (theme, store, query client)
├── routes/      ← router configuration
├── store/       ← global store setup (store instance, root reducer wiring)
└── styles/      ← global css, design tokens import
```

**shared/** — only the obviously foundational:

```
src/shared/
├── api/         ← HTTP client instance, base request helpers, generated clients
├── ui/          ← design-system components, ONE FOLDER + index PER COMPONENT
├── lib/         ← focused helpers grouped by topic: lib/dates/, lib/dom/
├── config/      ← env access, app constants, feature flags
└── routes/      ← route path constants (breaks pages↔pages knowledge)
```

When unsure whether something is foundational — leave it; Step 4 re-checks. It is easier to promote to shared later than to evict.

Set aliases now (`@/app`, `@/pages`, `@/widgets`, `@/features`, `@/entities`, `@/shared`) in tsconfig `paths` and the bundler. Then mass-update old alias imports:

```bash
grep -rln "from ['\"]@/components/" src   # then Edit each, or use a careful sed per mapping row
```

Prefer per-mapping-row search-and-replace over one giant regex; verify build between batches.

## Step 3 — Eliminate cross-page imports

```bash
grep -rn "from ['\"]\(@/pages\|\.\./\.\./\)" src/pages --include="*.ts*" --include="*.vue"
```

Triage every hit where page A imports from page B:

1. **Generic code** (no business meaning) → `shared/lib` or `shared/ui`.
2. **Reused business block** → `widgets/` / `features/` / `entities/` per plan.
3. **Small & likely to diverge** → **copy it into both pages.** Say this explicitly in the commit message; duplication is the documented FSD trade-off against coupling.

Also kill upward imports (a shared module importing from pages — happens with route constants and store types):
- route paths → `shared/routes`
- store types needed below → define types next to the model that owns them, in the lowest layer that uses them.

## Step 4 — Slim down shared

Re-run usage counts for everything now in `shared/`. Anything imported by exactly one page moves into that page (`api` request → `pages/<x>/api/`, helper → `pages/<x>/lib/`). Shared must hold zero business logic. Typical evictions: `shared/api/fetchUserOrders.ts` (one consumer), "common" components used once, validation schemas of one form.

## Step 5 — Segments inside every slice

Transform each page (and widget/feature/entity) internally:

```
pages/profile/
├── ui/        ProfilePage.tsx, ProfileForm.tsx, styles
├── api/       getProfile.ts, updateProfile.ts, types/mappers, query hooks
├── model/     form state, validation schema, page store
├── lib/       (only if needed)
└── index.ts   export { ProfilePage }
```

Splitting rules for legacy buckets:

- `hooks/useProfileQuery.ts` → `api/` (it fetches). `hooks/useWizardStep.ts` → `model/` (it's state).
- `types.ts` → types live next to what they describe: DTOs in `api/`, domain models in `model/`, prop types stay in the component file.
- `utils.ts` → split by purpose into `lib/<topic>.ts`; display formatters → `ui/`.
- Inside a slice use relative imports; never import via the slice's own `index.ts` (circular import).

## Step 6 — Extract entities / features / widgets (only if planned)

For each planned extraction:

1. Create the slice with segments + minimal `index.ts`.
2. `git mv` the implementation from the page(s); leave pages importing the public API.
3. If two entities reference each other, set up `@x`:
   ```ts
   // entities/artist/@x/song.ts
   export type { Artist } from "../model/artist";
   // entities/song/model/song.ts
   import type { Artist } from "entities/artist/@x/song";
   ```
4. Re-check the import rule: features must not import features; widgets must not import widgets. Violation → the slice boundary is wrong; merge or move down.

## Step 7 — Delete old structure

```bash
find src/components src/containers src/utils src/helpers src/hooks -type f 2>/dev/null   # must be empty
grep -rn "from ['\"]@/components\|from ['\"].*\.\./utils/" src --include="*.ts*"          # must be 0 hits
```

Delete the empty folders, remove dead aliases from tsconfig/bundler.

---

## Edge cases

- **Tests** move with their subject (`ProfileForm.test.tsx` next to `ui/ProfileForm.tsx`). Update jest/vitest path mappings to the new aliases in the same step that creates the aliases.
- **Storybook** stories move with components; update `.storybook/main` globs.
- **CSS Modules / styles** move with their component. Global styles → `app/styles/`. Design tokens → `shared/ui` or `app/styles` per plan.
- **Generated code** (API clients, GraphQL types) → `shared/api/generated/`; update the generator output path in its config.
- **Lazy imports / code splitting** — `import("…")` paths break silently at runtime, not build time. Grep `import(` and fix every dynamic path; this is a mandatory check in Step 1 and Step 7.
- **A file that won't move** (hidden coupling, 40 type errors) — don't refactor logic to force it. Leave it, add a `(revisit)` follow-up in the plan, continue.
- **Incremental mode coexistence** — old structure and FSD coexist; the only hard rule during coexistence: new FSD code never imports from old folders' internals, only old → new. Track per-step progress checklist in `fsd-migration-plan.md`.