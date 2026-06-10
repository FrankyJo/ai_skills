# FSD v2.1 Cheatsheet

Condensed rules from [fsd.how](https://fsd.how). This is the rulebook for every placement decision during migration.

---

## Layers (top → bottom)

| Layer | Sliced? | Contains | Notes |
|---|---|---|---|
| `app/` | No (segments only) | entrypoint, providers, router config, global store setup, global styles, analytics init | Knows about everything below |
| `pages/` | Yes | one slice per route/screen: page component, its non-reused blocks, loading/error states, page-local data fetching | The workhorse layer in v2.1 |
| `widgets/` | Yes | large self-sufficient UI blocks reused across pages (header, footer, sidebar) | Single-use blocks stay in the page |
| `features/` | Yes | reused user interactions with business value (add-to-cart, toggle-theme, auth-by-oauth) | "Not everything needs to be a feature" |
| `entities/` | Yes | reused business objects: User, Product, Order — their model, api, base ui | Often unnecessary; see below |
| `shared/` | No (segments only) | UI kit, API client, config, focused lib helpers, routes constants, i18n | Zero business logic, zero knowledge of upper layers |

`processes/` is deprecated — migrate its content to `features/` or `app/`.

**Not all layers are required.** Most projects: `shared` + `pages` + `app`. Each extra layer must justify itself with real (not hypothetical) reuse.

---

## The import rule

> A module in a slice can only import other slices located on layers **strictly below**.

- `pages/profile` may import `widgets/`, `features/`, `entities/`, `shared/` — never another page.
- `entities/user` may import only `shared/` (and other entities via `@x` only).
- `app/` and `shared/` are exceptions: they have no slices, their segments may import each other freely within the layer.
- Within one slice: relative imports with full paths. Across slices: absolute (aliased) imports via public API. This prevents accidental circular imports.

---

## Slices

- Named by **business domain** (`profile`, `news-feed`, `checkout`), never by tech (`forms`, `modals`).
- Zero coupling between slices on the same layer; high cohesion inside a slice.
- Slices may be grouped in folders (`pages/settings/{profile,billing}/`) but the group folder must contain **no shared code**.

## Segments

Named by **purpose (why), not essence (what)**:

| Segment | Contains |
|---|---|
| `ui/` | components, formatters for display, styles |
| `api/` | request functions, data types/DTOs, mappers, query hooks |
| `model/` | stores, schemas, business logic, validation |
| `lib/` | slice-internal library code (several focused helpers, not one `utils.ts` dump) |
| `config/` | config values, feature flags |

Forbidden segment names: `components/`, `hooks/`, `helpers/`, `types/`, `utils/` — distribute their contents by purpose instead. Custom segments are fine in `app/` and `shared/` (e.g. `app/routes/`, `shared/i18n/`).

---

## Public API

Every slice exposes `index.ts`; outside code may import **only** the public API, never internal paths.

- **Explicit named re-exports only.** `export *` hides the contract and breaks tree-shaking.
- Export the minimum: page component from a page, maybe loader/metadata. Internals stay internal.
- `shared/ui` and `shared/lib`: one index **per component/library** (`shared/ui/button/index.ts`), not one monolithic `shared/ui/index.ts` — preserves tree-shaking and dev-server speed.
- Beware re-exporting through the slice index from a sibling file inside the same slice (`import { x } from "../"`) — that's how circular imports happen. Inside a slice, import the source file directly.

## Cross-imports: the `@x` notation

Real domains have connected entities (Song ↔ Artist). When entity B must be referenced by entity A's types:

```
entities/
├── A/
│   ├── @x/
│   │   └── b.ts        ← public API only for entities/B
│   └── index.ts
└── B/                   ← imports from "entities/A/@x/b"
```

- Allowed **only on the entities layer**.
- Keep `@x` exports minimal (usually types).
- On any other layer a cross-import means a modeling mistake: move code down, extract upward, or duplicate.

---

## "Do we need entities at all?"

Create `entities/` only when **all** are true:

1. The same business object's logic/types/ui is used by 2+ pages right now.
2. The usages don't always change together with one page.
3. The object has a focused, nameable responsibility.

Otherwise keep the code in the page. The same test applies to each feature and widget. When in doubt — pages first; extracting later is cheap, un-extracting is annoying.

---

## Static assets

- Used by one slice → inside that slice, next to its `ui/`.
- Reused (logo, icon set, fonts) → `shared/assets/` (or `shared/ui/` if coupled to the component kit).
- Public/static files required at fixed URLs (favicon, robots.txt, PDFs served as-is) → framework's `public/` folder, outside FSD.