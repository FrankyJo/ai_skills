# fsd-migration — Migrate Frontend Architecture to FSD

A Claude Code skill that analyzes an existing frontend project (including monorepos) and restructures it into [Feature-Sliced Design](https://fsd.how) v2.1 — with a written migration plan, incremental execution, and build verification after every step.

---

## What it does

- Audits the current architecture: routes, state management, API layer, import usage counts, monorepo layout
- Writes `fsd-migration-plan.md` — target structure, old-path → new-path mapping table, justified layer decisions
- Executes the official "from custom architecture" step order: pages first → app/shared → cross-import elimination → segments → public APIs
- Preserves git history (`git mv`), one step = one verified commit
- Handles framework quirks: Next.js (App/Pages Router), Nuxt, Vite SPA, Astro, SvelteKit
- Wires in enforcement: Steiger (official FSD linter) + ESLint import boundaries

**Refactor, not rewrite** — no logic changes, the app must build and behave identically after every phase.

---

## Install

**Option 1 — npx**

```bash
npx claude-skill-fsd-migration
```

**Option 2 — Manual**

```bash
git clone https://github.com/FrankyJo/ai_skills ~/ai_skills && cp -r ~/ai_skills/fsd-migration ~/.claude/skills/
```

**To update:**

```bash
npx claude-skill-fsd-migration
```

---

## How to use

Any of these phrases activate the skill:

- "migrate to FSD"
- "refactor to Feature-Sliced Design"
- "convert this project to FSD"
- "restructure the frontend architecture"
- "apply Feature-Sliced Design to this monorepo"

Claude will confirm scope and verify commands, audit the project, present a migration plan for approval, then execute it step by step.

---

## Workflow

| Phase | Output |
|---|---|
| 0 — Intake | scope (app vs monorepo), build/test commands, migration mode, branch |
| 1 — Audit | architecture pattern, page list, usage counts, red flags |
| 2 — Plan | `fsd-migration-plan.md` with mapping table — requires approval |
| 3 — Execute | 7 steps, each verified (build + typecheck + tests) and committed |
| 4 — Enforce | Steiger + ESLint boundaries, final verification, report |

## Key decisions

| Question | Answer |
|---|---|
| Layer default | `shared` + `pages` + `app`; widgets/features/entities only with proven reuse |
| Single-use code | lives in its page (FSD v2.1 "pages first") |
| Cross-page imports | move down, extract, or **duplicate** — never couple pages |
| Monorepo | each app = its own FSD root; workspace packages stay packages |
| Entity cross-links | `@x` notation, entities layer only |
| Public APIs | explicit named re-exports, never `export *` |

---
---

# fsd-migration — Міграція фронтенд-архітектури на FSD

Навичка Claude Code, що аналізує існуючий фронтенд-проект (включно з монорепами) і перебудовує його на [Feature-Sliced Design](https://fsd.how) v2.1 — з письмовим планом міграції, поетапним виконанням і перевіркою збірки після кожного кроку.

---

## Що вона робить

- Аудит поточної архітектури: маршрути, стейт-менеджмент, API-шар, підрахунок використань імпортів, структура монорепи
- Пише `fsd-migration-plan.md` — цільова структура, таблиця відповідності старий шлях → новий шлях, обґрунтовані рішення щодо шарів
- Виконує офіційний порядок кроків "from custom architecture": спочатку pages → app/shared → усунення крос-імпортів → сегменти → публічні API
- Зберігає історію git (`git mv`), один крок = один перевірений коміт
- Враховує особливості фреймворків: Next.js (App/Pages Router), Nuxt, Vite SPA, Astro, SvelteKit
- Підключає контроль: Steiger (офіційний лінтер FSD) + ESLint-правила меж імпортів

**Рефакторинг, а не переписування** — без змін логіки, додаток має збиратися і працювати однаково після кожної фази.

---

## Встановлення

**Варіант 1 — npx**

```bash
npx claude-skill-fsd-migration
```

**Варіант 2 — Вручну**

```bash
git clone https://github.com/FrankyJo/ai_skills ~/ai_skills && cp -r ~/ai_skills/fsd-migration ~/.claude/skills/
```

**Оновлення:**

```bash
npx claude-skill-fsd-migration
```

---

## Як користуватись

Будь-яка з цих фраз активує навичку:

- "перевести проект на FSD"
- "переписати архітектуру на FSD"
- "рефакторинг на Feature-Sliced Design"
- "мігрувати на FSD"
- "застосувати Feature-Sliced Design до монорепи"

Claude уточнить скоуп і команди перевірки, проведе аудит, покаже план міграції на затвердження, потім виконає його крок за кроком.

---

## Робочий процес

| Фаза | Результат |
|---|---|
| 0 — Інтейк | скоуп (застосунок чи монорепа), команди збірки/тестів, режим міграції, гілка |
| 1 — Аудит | патерн архітектури, список сторінок, підрахунок використань, проблемні місця |
| 2 — План | `fsd-migration-plan.md` з таблицею відповідності — потребує затвердження |
| 3 — Виконання | 7 кроків, кожен перевірений (збірка + типи + тести) і закомічений |
| 4 — Контроль | Steiger + межі ESLint, фінальна перевірка, звіт |

## Ключові рішення

| Питання | Відповідь |
|---|---|
| Шари за замовчуванням | `shared` + `pages` + `app`; widgets/features/entities — лише з доведеним перевикористанням |
| Код одного використання | живе у своїй сторінці (FSD v2.1 "pages first") |
| Крос-імпорти між сторінками | перемістити вниз, винести, або **продублювати** — ніколи не зв'язувати сторінки |
| Монорепа | кожен застосунок = власний корінь FSD; workspace-пакети лишаються пакетами |
| Зв'язки між entities | нотація `@x`, лише на шарі entities |
| Публічні API | явні іменовані реекспорти, ніколи `export *` |
