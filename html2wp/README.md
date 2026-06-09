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

- "натянуть верстку на WordPress"
- "сделать посадку HTML на WP"
- "создать WordPress тему из макета"
- "port HTML to WordPress"
- "convert HTML layout to WordPress theme"
- "WordPress theme from scratch"

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
