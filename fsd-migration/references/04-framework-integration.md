# Framework Integration

Meta-frameworks reserve folder names that clash with FSD (`pages/`, `app/`). The universal pattern: **keep the framework folder as a thin adapter, real code lives in the FSD root (`src/`)**.

---

## Next.js — App Router

`app/` is owned by Next. Keep it outside `src/` (or as `src/app` with the FSD app layer renamed — prefer the first):

```
project/
├── app/                        ← Next.js routing ONLY: thin re-export files
│   ├── layout.tsx              ← imports from src/app
│   └── profile/page.tsx        ← export { ProfilePage as default } from "@/pages/profile"
└── src/
    ├── app/                    ← FSD app layer: providers, global styles
    ├── pages/                  ← FSD pages (the real page components)
    ├── ...
    └── shared/
```

Rules:
- Every `app/**/page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` is ≤5 lines: re-export from the corresponding FSD slice.
- `"use client"` boundaries: the directive lives in the FSD slice file, not the adapter.
- Route handlers (`app/api/**/route.ts`) re-export handlers from `pages/<x>/api/` or `shared/api/`.
- `middleware.ts` stays in the root (framework requirement); its logic imports from `shared/`.
- Server-only modules: split the slice public API by environment (`index.server.ts` / `index.client.ts`) instead of mixing in one index.

## Next.js — Pages Router

```
project/
├── pages/                      ← Next routing: thin re-exports + _app.tsx, _document.tsx
│   └── profile.tsx             ← export { ProfilePage as default } from "@/pages/profile"
└── src/{app,pages,...,shared}/ ← FSD root
```

`_app.tsx` composes providers from `src/app/providers`. `getServerSideProps`/`getStaticProps` are defined in the FSD page slice and re-exported by the adapter file.

## Nuxt

Nuxt owns `pages/`, `layouts/`, `plugins/`. Configure Nuxt to point routing at a thin dir and keep FSD in `src/`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  dir: { pages: "./routes" },          // thin adapter pages
  srcDir: "src/",
});
```

Adapter route files re-export FSD page components. Disable Nuxt auto-imports for FSD layers or scope them carefully — implicit imports bypass public APIs; prefer explicit imports inside FSD code.

## Vite / CRA-style SPA (React, Vue, Solid)

The simple case — no reserved names:

```
src/
├── app/        ← main.tsx mounts here; router config in app/routes
├── pages/      ← lazy-loaded route components
├── ...
└── shared/
```

Aliases in both `tsconfig.json` and `vite.config.ts` (`resolve.alias`). Route-level code splitting: `lazy(() => import("@/pages/profile"))` works against the public API — make the page component a default-style named export consistently.

## Astro

Astro owns `src/pages` for file routing. Keep `.astro` route files thin; FSD lives beside it:

```
src/
├── pages/          ← Astro routes (thin), allowed to import from FSD layers
├── app/  widgets/  features/  shared/   ← FSD layers (skip FSD "pages", routes play that role)
```

Treat Astro's `src/pages` as the FSD pages layer itself: each route file is the slice's `ui`, heavy logic goes to a co-named folder slice if it grows.

## SvelteKit

`src/routes` is reserved. Same adapter pattern: `+page.svelte` files re-export/embed components from FSD `src/pages/<slice>`; `+page.server.ts` loaders import from the slice's `api/` segment. `src/lib` ≠ FSD — don't dump code there just because SvelteKit aliases it; use it only for the `$lib` alias root if convenient, pointing into `shared/`.

---

## Alias setup reference

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/app/*": ["src/app/*"],
      "@/pages/*": ["src/pages/*"],
      "@/widgets/*": ["src/widgets/*"],
      "@/features/*": ["src/features/*"],
      "@/entities/*": ["src/entities/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```

Mirror in the bundler (vite `resolve.alias`, webpack `resolve.alias`, Next reads tsconfig automatically). Update test runner config (`vitest.config` `resolve.alias` / jest `moduleNameMapper`) in the same commit.
