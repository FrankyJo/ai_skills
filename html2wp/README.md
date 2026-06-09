# html2wp — HTML to WordPress Skill

A Claude Code skill for porting static HTML/CSS layouts onto a custom WordPress theme — no ACF, no page builders, no unnecessary plugins.

---

## What it does

- Asks intake questions: how many pages, which sections repeat, what content is dynamic
- Scaffolds a complete custom theme based on [wordpress_blank](https://github.com/FrankyJo/wordpress_blank)
- Breaks HTML into the right WordPress concepts: header/footer, reusable blocks, page templates, custom post types
- Generates native meta boxes (no ACF) for custom fields
- Sets up SCSS + Webpack build pipeline
- Enforces BEM, proper escaping, nonces, and WP best practices throughout

---

## Install

**Option 1 — npx**

```bash
npx claude-skill-html2wp
```

**Option 2 — Manual**

```bash
git clone https://github.com/FrankyJo/ai_skills ~/ai_skills && cp -r ~/ai_skills/html2wp ~/.claude/skills/
```

**To update:**

```bash
npx claude-skill-html2wp
```

---

## How to use

Describe what you want to port to WordPress. Any of these phrases activate the skill:

- "port HTML to WordPress"
- "apply HTML layout to WordPress"
- "create WordPress theme from mockup"
- "convert HTML layout to WordPress theme"
- "WordPress theme from scratch"
- "scan WordPress theme"
- "analyze existing WordPress theme"

Claude will ask 6 intake questions, then scaffold the full theme.

---

## Architecture decisions

| Question | Answer |
|---|---|
| Base theme structure | [wordpress_blank](https://github.com/FrankyJo/wordpress_blank) |
| Custom fields | Native meta boxes (no ACF) |
| Page builders | Never |
| CSS | SCSS + Webpack, one file per page |
| JS | Vanilla JS or lightweight libs, jQuery deregistered |
| Repeating content | Custom Post Types |
| Section reuse | `get_template_part('blocks/name')` |
| Menus | `register_nav_menus` + `wp_nav_menu` |

---

## Theme structure

```
{theme-slug}/
├── style.css / functions.php / index.php
├── header.php / footer.php / page.php / 404.php
├── pages/         ← page templates (Template Name: ...)
├── blocks/        ← reusable sections (get_template_part)
├── app/
│   ├── core/      ← postTypes, taxonomies, customField
│   └── front/     ← addStyles, addScripts, menuCreator
├── src/css/       ← SCSS source
├── src/js/        ← JS source
└── public/        ← webpack output
```

---
---

# html2wp — Навичка HTML до WordPress

Навичка Claude Code для натягування статичної HTML/CSS верстки на кастомну WordPress тему — без ACF, без конструкторів сторінок, без зайвих плагінів.

---

## Що вона робить

- Ставить вхідні запитання: кількість сторінок, які секції повторюються, який контент динамічний
- Скаффолдить повну кастомну тему на базі [wordpress_blank](https://github.com/FrankyJo/wordpress_blank)
- Розбиває HTML на правильні концепції WordPress: header/footer, блоки що повторюються, шаблони сторінок, кастомні типи постів
- Генерує нативні мета-поля (без ACF) для кастомних полів
- Налаштовує SCSS + Webpack білд-пайплайн
- Дотримується BEM, правильного екранування, nonces та найкращих практик WP

---

## Встановлення

**Варіант 1 — npx**

```bash
npx claude-skill-html2wp
```

**Варіант 2 — Вручну**

```bash
git clone https://github.com/FrankyJo/ai_skills ~/ai_skills && cp -r ~/ai_skills/html2wp ~/.claude/skills/
```

**Оновлення:**

```bash
npx claude-skill-html2wp
```

---

## Як користуватись

Опиши що хочеш перенести на WordPress. Будь-яка з цих фраз активує навичку:

- "натягнути верстку на WordPress"
- "зробити посадку HTML на WP"
- "створити WordPress тему з макету"
- "port HTML to WordPress"
- "конвертувати HTML верстку в WordPress тему"
- "WordPress тема з нуля"
- "проаналізувати WordPress тему"

Claude поставить 6 вхідних запитань, потім скаффолдить повну тему.

---

## Архітектурні рішення

| Питання | Відповідь |
|---|---|
| Базова структура теми | [wordpress_blank](https://github.com/FrankyJo/wordpress_blank) |
| Кастомні поля | Нативні мета-поля (без ACF) |
| Конструктори сторінок | Ніколи |
| CSS | SCSS + Webpack, один файл на сторінку |
| JS | Vanilla JS або легкі бібліотеки, jQuery відключений |
| Контент що повторюється | Кастомні типи постів |
| Повторне використання секцій | `get_template_part('blocks/name')` |
| Меню | `register_nav_menus` + `wp_nav_menu` |

---

## Структура теми

```
{theme-slug}/
├── style.css / functions.php / index.php
├── header.php / footer.php / page.php / 404.php
├── pages/         ← шаблони сторінок (Template Name: ...)
├── blocks/        ← секції що повторюються (get_template_part)
├── app/
│   ├── core/      ← postTypes, taxonomies, customField
│   └── front/     ← addStyles, addScripts, menuCreator
├── src/css/       ← вихідний SCSS
├── src/js/        ← вихідний JS
└── public/        ← вивід webpack
```
