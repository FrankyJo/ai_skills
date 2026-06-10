# Phase 1 — Audit Commands & Mapping Strategy

Run scans in parallel where possible. Replace `src` with the actual source root.

---

## 1. Detect tooling & framework

```bash
cat package.json
ls next.config.* nuxt.config.* vite.config.* astro.config.* svelte.config.* webpack.config.* 2>/dev/null
cat tsconfig.json | grep -A 20 '"paths"'
```

## 2. Detect monorepo

```bash
ls pnpm-workspace.yaml lerna.json turbo.json nx.json rush.json 2>/dev/null
grep -A 10 '"workspaces"' package.json
ls apps packages 2>/dev/null
```

### Monorepo strategy

- **Each app is its own FSD root**: `apps/web/src/{app,pages,widgets,features,entities,shared}`. Never one FSD tree spanning apps.
- **Workspace packages stay packages.** A shared `packages/ui` kit is, from each app's perspective, an external library — apps consume it from their `shared/ui` or directly; do not dissolve it into one app.
- A large shared package may itself adopt FSD-style segments internally (`ui/`, `lib/`, `api/`), but that is optional and out of scope unless the user asks.
- **Red flag to report:** one app importing source files from another app (`apps/admin` importing `apps/web/src/...`). The fix is extracting to a workspace package — record it in the plan.
- If the user asked to migrate "the monorepo", migrate one app at a time, in scope order they confirm.

## 3. Current architecture detection

```bash
# Top-2-level tree of source
find src -maxdepth 2 -type d | sort
# File counts per top folder (size of each migration bucket)
for d in src/*/; do echo "$(find "$d" -type f | wc -l) $d"; done | sort -rn
```

Common patterns you will encounter:

| Pattern | Signature | Migration note |
|---|---|---|
| By-type | `components/ hooks/ utils/ api/ services/ constants/` | The classic case; mapping is per-file by usage count |
| Atomic design | `atoms/ molecules/ organisms/ templates/` | atoms/molecules → mostly `shared/ui`; organisms → pages or widgets by reuse |
| Feature folders | `features/<name>/` or `modules/<name>/` | Closest to FSD; verify each "feature" is really reused, else it's a page |
| Page-centric | `views/ pages/ screens/` + flat `components/` | Pages already exist; the work is in shared/segments |
| Flat / ad-hoc | everything in `src/` root | Map file by file; start from the router |

## 4. Route inventory (drives the page list)

```bash
# SPA routers
grep -rn "createBrowserRouter\|<Route\|RouteRecordRaw\|createRouter" src --include="*.ts*" --include="*.vue" -l
# File-based routing
find src/pages app pages -maxdepth 3 -type f 2>/dev/null | head -50
```

For each route record: path, component file, lazy or eager.

## 5. State & API inventory

```bash
grep -rn "configureStore\|createSlice\|create(\|defineStore\|createContext" src --include="*.ts*" -l
grep -rn "axios.create\|fetch(\|createApi\|useQuery\|useSWR" src --include="*.ts*" -l | head -20
```

Classify each store: global (→ `app/store` setup + slice-level models) or page-local (→ that page's `model/`).

## 6. Usage counts — the core mapping tool

For every module in shared-looking folders (`components/`, `utils/`, `hooks/`):

```bash
# Imports of one module
grep -rln "components/Button" src --include="*.ts*" --include="*.vue" | sort -u
```

Decision table:

| Import sites | Destination |
|---|---|
| 1 page | that page's slice (`pages/<x>/ui|model|api/`) |
| 2+ pages, no business meaning (Button, formatDate) | `shared/ui` / `shared/lib` |
| 2+ pages, business object (UserCard + user types + user api) | `entities/<object>/` |
| 2+ pages, user interaction (LoginForm, AddToCartButton) | `features/<action>/` |
| 2+ pages, big standalone block (Header, Footer) | `widgets/<block>/` |

## 7. Red-flag scan

```bash
# Circular import candidates (if madge is acceptable to run)
npx madge --circular --extensions ts,tsx src || true
# God files
find src -name "*.ts*" -size +20k
# utils dumps
wc -l src/utils/* src/helpers/* 2>/dev/null | sort -rn | head
```

Report all of these in the Phase 1 summary; god-files and `utils.ts` dumps get split **by purpose** during Step 5 (segments), not improved logically.

---

## Mapping table conventions (for fsd-migration-plan.md)

- Every **top-level module** gets a row; whole folders may map as one row when the destination is uniform (`src/api/*` → `src/shared/api/`).
- The reasoning column must cite evidence: "used by pages A, B, C" or "only imported by checkout".
- Files you cannot confidently place: map to the page of their main consumer and add `(revisit)` — pages-first is the safe default.
- Keep the table in dependency order where possible: shared foundation rows first, pages last; it doubles as the execution checklist.