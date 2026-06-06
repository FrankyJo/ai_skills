---
name: html-to-wordpress
description: >-
  Two-mode WordPress skill. MODE A — scan an existing WordPress theme, capture
  all CPTs / taxonomies / meta keys / menus / templates and write
  wp-analyze-theme.md (use before a redesign so content survives the switch).
  MODE B — port an HTML/CSS/JS layout onto a new custom theme: scaffold
  structure, split combined HTML into separate CSS/JS/PHP files, register CPTs,
  native meta boxes, taxonomies, menus. No ACF, no page builders, no plugins.
  Triggers for MODE A: "проанализируй тему", "сканируй WP тему", "analyze
  WordPress theme", "редизайн с сохранением контента", "перенести контент в
  новую тему". Triggers for MODE B: "натянуть верстку на WordPress", "сделать
  посадку", "создать тему WordPress", "port HTML to WordPress", "верстка на WP".
---

# HTML → WordPress Skill

You are a senior WordPress developer. This skill operates in two modes — pick the right one based on what the user asks.

---

## How to choose the mode

```
User wants to scan/audit an existing WP theme
  or says "analyze", "проанализируй", "что в теме", "редизайн"
  → MODE A: Analyze Existing Theme

User wants to build a new theme from HTML/CSS/JS layouts
  or says "натянуть", "посадка", "port HTML", "создать тему"
  → MODE B: Build New Theme
```

If unclear — ask: _"Do you want me to (A) scan your existing WordPress theme and document its structure, or (B) build a new theme from your HTML layouts?"_

---

---

# MODE A — Analyze Existing Theme

**Goal**: reverse-engineer a live WordPress theme and write `wp-analyze-theme.md` — a structured snapshot of everything the new theme must replicate so all existing wp-admin content maps automatically when the theme is switched.

## A-0 — Get the path

Ask if not provided:

```
Path to the existing WordPress theme folder?
(e.g. /var/www/html/wp-content/themes/my-theme)
```

Confirm it exists:
```bash
ls {path}/functions.php
```

## A-1 — Scan (run all commands in parallel)

### Theme metadata
```bash
grep -E 'Theme Name|Version|Author|Text Domain' {path}/style.css | head -10
```

### Custom Post Types
```bash
grep -rn "register_post_type" {path} --include="*.php" -A 3
```
Find and read CPT registration files in full:
```bash
find {path} -name "postTypes.php" -o -name "post-types.php" -o -name "cpt.php" 2>/dev/null | head -5
```

### Taxonomies
```bash
grep -rn "register_taxonomy" {path} --include="*.php" -A 3
```
Find and read taxonomy files:
```bash
find {path} -name "taxonomies.php" -o -name "taxonomy.php" 2>/dev/null | head -5
```

### Meta field keys (from DB operations)
```bash
grep -rhn "get_post_meta\|update_post_meta\|add_post_meta\|delete_post_meta" {path} --include="*.php" | grep -oP "(?<=['\"])_[a-zA-Z0-9_]+" | sort -u
```

### Meta box registrations
```bash
grep -rn "add_meta_box" {path} --include="*.php" -A 2
```

### Menu locations
```bash
grep -rn "register_nav_menus\|register_nav_menu" {path} --include="*.php" -A 10 | head -60
```

### Page templates
```bash
grep -rln "Template Name:" {path} --include="*.php"
grep -rh "Template Name:" {path} --include="*.php"
```

### Blocks / template parts used
```bash
grep -rhn "get_template_part" {path} --include="*.php" | grep -oP "(?<=')[^']+" | sort -u
ls {path}/blocks/ 2>/dev/null || ls {path}/template-parts/ 2>/dev/null
```

### Image sizes
```bash
grep -rn "add_image_size" {path} --include="*.php"
```

### Theme supports
```bash
grep -rn "add_theme_support" {path} --include="*.php"
```

### Shortcodes
```bash
grep -rhn "add_shortcode" {path} --include="*.php" | grep -oP "add_shortcode\(\s*['\"]([^'\"]+)" | sort -u
```

### AJAX actions
```bash
grep -rhn "wp_ajax_" {path} --include="*.php" | grep -oP "(wp_ajax_nopriv_|wp_ajax_)\K[a-zA-Z0-9_]+" | sort -u
```

### Theme options keys
```bash
grep -rhn "get_option(" {path} --include="*.php" | grep -oP "get_option\(\s*['\"]([^'\"]+)" | sort -u
```

### ACF fields (if present)
```bash
grep -rhn "get_field\b" {path} --include="*.php" | grep -oP "get_field\(\s*['\"]([^'\"]+)" | sort -u
```

## A-2 — Write wp-analyze-theme.md

Write to `{path}/wp-analyze-theme.md` using this exact structure:

```markdown
# WP Theme Analysis: {Theme Name}

**Version**: {version}  
**Text Domain**: {text-domain}  
**Analyzed**: {current date}

---

## Custom Post Types

### {cpt-slug}
- **Label**: {name} / {singular_name}
- **Menu icon**: {dashicon}
- **Supports**: title, editor, thumbnail, ...
- **Has archive**: yes / no
- **Rewrite slug**: /{slug}
- **Taxonomies**: {tax-slug-1}, {tax-slug-2}
- **Meta fields**:
  - `_field_key` — {text|url|number|textarea|array} — {description if inferrable}

(repeat for each CPT)

---

## Taxonomies

### {taxonomy-slug}
- **Post types**: {cpt-slug}
- **Hierarchical**: yes / no
- **Rewrite slug**: /{slug}

(repeat for each taxonomy)

---

## Menu Locations

| Handle  | Label          |
|---------|----------------|
| primary | Primary Menu   |
| footer  | Footer Menu    |

---

## Page Templates

| Template Name | File                    | Blocks used          |
|---------------|-------------------------|----------------------|
| Home          | pages/page-home.php     | hero, services, cta  |

---

## Blocks (template parts)

| Path                    | Used on pages |
|-------------------------|---------------|
| blocks/hero.php         | Home          |
| blocks/breadcrumbs.php  | all           |

---

## Image Sizes

| Handle     | Width | Height | Crop |
|------------|-------|--------|------|
| team-thumb | 300   | 300    | yes  |

---

## Theme Supports

- post-thumbnails
- title-tag
- menus
- html5

---

## Shortcodes

- `[shortcode_name]` — {file where defined}

---

## AJAX Actions

- `load_more_posts` — logged in + out

---

## Theme Options (get_option keys)

- `theme_options` — main options array

---

## ACF Fields (if applicable)

- `field_name` — used in {cpt/page}

---

## Migration Notes

> The new theme MUST use these exact values — they are stored in the database.
> Renaming any of them silently orphans existing content.

**CPT slugs** (post_type in wp_posts):
- {cpt-slug-1}
- {cpt-slug-2}

**Meta keys** (_key in wp_postmeta):
- `_field_key_1`
- `_field_key_2`

**Taxonomy slugs** (taxonomy in wp_term_taxonomy):
- {taxonomy-slug-1}

**Option keys** (option_name in wp_options):
- `theme_options`
```

## A-3 — Report to user

```
✓ Analysis written to: {path}/wp-analyze-theme.md

Found:
- {N} Custom Post Types: {list slugs}
- {N} Taxonomies: {list slugs}
- {N} Meta field keys
- {N} Page templates
- {N} Menu locations

When building the new theme, reference this file — the Migration Notes
section contains the exact DB slugs/keys the new theme must preserve.
```

---

---

# MODE B — Build New Theme

You are scaffolding a production-ready custom theme from HTML/CSS/JS layouts — **no ACF, no page builders, no unnecessary plugins**. Always use the classic WordPress editor.

## B-0 — Intake

### Check for wp-analyze-theme.md first

```
Is this a redesign of an existing WordPress site?
→ If yes: do you have a wp-analyze-theme.md (from analyzing the old theme)?
  Paste the path or content — I'll use the CPT slugs, meta keys,
  and taxonomy slugs from it exactly so existing content survives the switch.
→ If no: we'll define the structure from scratch.
```

If the file is provided — read the **Migration Notes** section first. Treat every slug and key there as fixed — never invent alternatives.

### Questions (send all at once)

```
1. Pages: List all distinct pages (e.g. Home, About, Services, Blog, Contact)

2. Common sections: Which sections repeat across pages?
   (e.g. Header, Footer, CTA strip, Cookie banner)

3. Dynamic content: Any sections with repeating items?
   (team members, services, portfolio, testimonials, FAQ, news)
   → Redesign: already mapped in wp-analyze — confirm or add new ones
   → Fresh start: these become Custom Post Types

4. Forms: Any contact / subscribe / application forms?
   → Native WP or Contact Form 7 only if complex

5. Assets: Path to HTML/CSS/JS files.
   Are CSS and JS separate files, or embedded inside the HTML?

6. Theme slug: folder name for the new theme (e.g. my-project)
```

Do not scaffold anything until all answers are in.

---

## B-1 — Analyse the HTML

Map HTML sections to WordPress concepts:

```
HTML element/section
│
├─ On EVERY page (nav, footer, cookie bar)
│   └─ → header.php / footer.php
│
├─ On MOST pages but not all (CTA strip, sidebar)
│   └─ → blocks/{name}.php  (get_template_part)
│
├─ Unique to ONE page
│   └─ → pages/page-{slug}.php  (Template Name: …)
│
├─ Repeating DATA (team, services, FAQ, portfolio)
│   └─ → Custom Post Type
│       ├─ needs grouping → Custom Taxonomy
│       └─ needs extra fields → Native meta box
│
└─ Site-wide settings (phone, address, social links)
    └─ → Theme Options (Settings API)
```

**Block** — self-contained section, included anywhere via `get_template_part`, never knows which page it's on.

**Page template** — layout glue for one page: calls `get_header()`, a sequence of `get_template_part()` calls, then `get_footer()`. Enqueues its own CSS/JS.

---

## B-2 — Split Assets

### Case A — CSS and JS are separate files

- CSS → `public/css/pages/{page}/{page}.css`
- JS  → `public/js/pages/{page}.js`
- Shared CSS → `public/css/index.css`
- Global JS  → `public/js/main.js`
- Images     → `public/image/`

### Case B — Everything inside one HTML file

1. Extract all `<style>` blocks → `public/css/pages/{page}/{page}.css`
2. Extract all `<script>` blocks + inline event handlers → `public/js/pages/{page}.js`
3. The remaining HTML skeleton → convert to PHP template at `pages/page-{slug}.php`
4. Merge multiple `<style>` blocks into one CSS file
5. Shared CSS seen on multiple pages → `public/css/index.css`
6. Never leave raw `<link>` or `<script>` tags in PHP — everything via WP enqueue

---

## B-3 — Theme Scaffold

```
{theme-slug}/
├── style.css                    ← required WP header
├── functions.php
├── index.php
├── page.php                     ← default page template
├── header.php
├── footer.php
├── 404.php
├── search.php
├── searchform.php
│
├── pages/
│   ├── page-home.php            ← Template Name: Home
│   └── page-{slug}.php
│
├── blocks/
│   ├── breadcrumbs.php
│   └── {section-name}.php
│
├── app/
│   ├── autoload.php
│   ├── themeFunctions.php
│   ├── wpFilters.php            ← disable Gutenberg here
│   ├── actionAjax.php
│   ├── core/
│   │   ├── postTypes.php
│   │   ├── taxonomies.php
│   │   ├── customField.php
│   │   └── customFieldRepeater.php
│   ├── front/
│   │   ├── addStyles.php
│   │   ├── addScripts.php
│   │   ├── menuCreator.php
│   │   └── front-ajax.php
│   ├── classes/
│   │   └── Breadcrumbs.php
│   └── shortcodes/
│       └── custom_shortcode.php
│
└── public/
    ├── css/
    │   ├── index.css
    │   └── pages/{page}/{page}.css
    ├── js/
    │   ├── main.js
    │   └── pages/{page}.js
    └── image/
```

---

## B-4 — Key Files

### style.css
```css
/*
Theme Name: {Theme Name}
Author: {Author}
Description: Custom theme
Version: 1.0.0
Text Domain: {theme-slug}
*/
```

### functions.php
```php
<?php
defined('ABSPATH') || exit;

define('APP_DIR',    get_template_directory()     . '/app/');
define('ASSETS_DIR', get_template_directory()     . '/public/');
define('ASSETS_URI', get_template_directory_uri() . '/public/');

require_once APP_DIR . 'core/postTypes.php';
require_once APP_DIR . 'core/taxonomies.php';
require_once APP_DIR . 'core/customField.php';
require_once APP_DIR . 'front/menuCreator.php';
require_once APP_DIR . 'front/addStyles.php';
require_once APP_DIR . 'front/addScripts.php';
require_once APP_DIR . 'front/front-ajax.php';
require_once APP_DIR . 'themeFunctions.php';
require_once APP_DIR . 'wpFilters.php';
require_once APP_DIR . 'actionAjax.php';
require_once APP_DIR . 'autoload.php';
```

### app/wpFilters.php (disable Gutenberg)
```php
<?php
add_filter('use_block_editor_for_post', '__return_false');
add_filter('use_widgets_block_editor',  '__return_false');
```

### app/front/menuCreator.php
```php
<?php
add_action('after_setup_theme', function () {
    register_nav_menus([
        'primary' => __('Primary Menu', 'theme-slug'),
        'footer'  => __('Footer Menu',  'theme-slug'),
    ]);
});
```

### app/front/addStyles.php
```php
<?php
add_action('wp_enqueue_scripts', 'addGlobalStyles');
function addGlobalStyles(): void {
    wp_enqueue_style('main', ASSETS_URI . 'css/index.css', [],
        filemtime(ASSETS_DIR . 'css/index.css'));
}
```

### app/front/addScripts.php
```php
<?php
add_action('wp_enqueue_scripts', function () {
    wp_deregister_script('jquery');
}, 100);

add_action('wp_enqueue_scripts', 'addGlobalScripts');
function addGlobalScripts(): void {
    wp_enqueue_script('main', ASSETS_URI . 'js/main.js', [],
        filemtime(ASSETS_DIR . 'js/main.js'), true);
}
```

### Page template (pages/page-home.php)
```php
<?php
/*
 * Template Name: Home
 */

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('home', ASSETS_URI . 'css/pages/home/home.css', ['main'],
        filemtime(ASSETS_DIR . 'css/pages/home/home.css'));
    wp_enqueue_script('home-js', ASSETS_URI . 'js/pages/home.js', [],
        filemtime(ASSETS_DIR . 'js/pages/home.js'), true);
});

get_header();
get_template_part('blocks/hero');
get_template_part('blocks/services');
get_template_part('blocks/cta');
get_footer();
```

### header.php
```php
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="header">
  <div class="header__wrapper container">
    <a class="header__logo" href="<?= esc_url(home_url('/')) ?>">
      <?php bloginfo('name'); ?>
    </a>
    <nav class="header__nav">
      <?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'menu_class' => 'header__menu']); ?>
    </nav>
  </div>
</header>
```

### footer.php
```php
<footer class="footer">
  <div class="footer__wrapper container">
    <?php wp_nav_menu(['theme_location' => 'footer', 'container' => false]); ?>
    <p class="footer__copy">&copy; <?= date('Y') ?> <?php bloginfo('name'); ?></p>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
```

---

## B-5 — Custom Post Types

Create a CPT when content repeats (3+ items), has ≥ 2 custom fields, needs its own archive, or is managed separately.

```php
<?php
// app/core/postTypes.php
add_action('init', 'initAllPostTypes');
function initAllPostTypes(): void {
    $default = [
        'public'       => true,
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt'],
        'has_archive'  => false,
        'rewrite'      => ['slug' => ''],
        'show_in_rest' => false,
    ];

    $post_types = [
        'team' => [
            'menu_icon' => 'dashicons-groups',
            'rewrite'   => ['slug' => 'team'],
            'supports'  => ['title', 'thumbnail'],
            'labels'    => [
                'name'          => 'Team',
                'singular_name' => 'Member',
                'add_new_item'  => 'Add Member',
                'edit_item'     => 'Edit Member',
            ],
        ],
    ];

    foreach ($post_types as $slug => $args) {
        register_post_type($slug, array_merge($default, $args));
    }
}
```

| Content type      | CPT slug          | Taxonomy             |
|-------------------|-------------------|----------------------|
| Blog/News         | `post` (built-in) | `category`, `tag`    |
| Portfolio / Cases | `portfolio`       | `portfolio_category` |
| Services          | `service`         | —                    |
| Team members      | `team`            | `department`         |
| Testimonials      | `testimonial`     | —                    |
| FAQ               | `faq`             | `faq_category`       |
| Vacancies / Jobs  | `vacancy`         | `department`         |

---

## B-6 — Custom Fields (native meta boxes)

```php
<?php
// app/core/customField.php
add_action('add_meta_boxes', 'registerExtraFields');
function registerExtraFields(): void {
    add_meta_box('team_extra', 'Member Details', 'renderTeamFields', 'team', 'normal', 'high');
}

function renderTeamFields(WP_Post $post): void {
    wp_nonce_field('team_extra_nonce', 'team_extra_nonce');
    $position = get_post_meta($post->ID, '_position', true);
    $linkedin  = get_post_meta($post->ID, '_linkedin',  true);
    ?>
    <table class="form-table">
      <tr>
        <th><label for="position">Position</label></th>
        <td><input type="text" id="position" name="position"
             value="<?= esc_attr($position) ?>" class="regular-text"></td>
      </tr>
      <tr>
        <th><label for="linkedin">LinkedIn URL</label></th>
        <td><input type="url" id="linkedin" name="linkedin"
             value="<?= esc_url($linkedin) ?>" class="regular-text"></td>
      </tr>
    </table>
    <?php
}

add_action('save_post_team', 'saveTeamFields');
function saveTeamFields(int $post_id): void {
    if (!isset($_POST['team_extra_nonce']) ||
        !wp_verify_nonce($_POST['team_extra_nonce'], 'team_extra_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $fields = ['position', 'linkedin'];
    foreach ($fields as $key) {
        if (isset($_POST[$key])) {
            update_post_meta($post_id, '_' . $key, sanitize_text_field($_POST[$key]));
        } else {
            delete_post_meta($post_id, '_' . $key);
        }
    }
}
```

---

## B-7 — Querying CPTs in blocks

```php
<?php
// blocks/team.php
$members = new WP_Query([
    'post_type'      => 'team',
    'posts_per_page' => -1,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'no_found_rows'  => true,
]);
?>
<section class="team">
  <div class="team__wrapper container">
    <?php while ($members->have_posts()): $members->the_post(); ?>
      <div class="team__card">
        <?php if (has_post_thumbnail()): ?>
          <?= get_the_post_thumbnail(null, 'thumbnail', ['class' => 'team__photo']) ?>
        <?php endif; ?>
        <h3 class="team__name"><?= esc_html(get_the_title()) ?></h3>
        <p class="team__position"><?= esc_html(get_post_meta(get_the_ID(), '_position', true)) ?></p>
      </div>
    <?php endwhile; wp_reset_postdata(); ?>
  </div>
</section>
```

---

## B-8 — Checklist before handoff

- [ ] `wp_head()` and `wp_footer()` present
- [ ] All output escaped: `esc_html()` / `esc_url()` / `esc_attr()`
- [ ] Nonces on every form and meta box save
- [ ] `wp_reset_postdata()` after every custom `WP_Query`
- [ ] CSS/JS via `wp_enqueue_*` with `filemtime()` — no raw `<link>` or `<script>` tags
- [ ] jQuery deregistered if unused
- [ ] `body_class()` on `<body>`
- [ ] Menu locations registered and assigned in WP Admin → Appearance → Menus
- [ ] Permalink structure `/%postname%/` (Settings → Permalinks → Save)
- [ ] Gutenberg disabled (`wpFilters.php`)
- [ ] Theme activated

---

## Rules (both modes)

1. **No ACF** unless explicitly asked. Use native meta boxes.
2. **No page builders**.
3. **No extra plugins** for features achievable with WP core.
4. **Classic editor only** — `show_in_rest => false` on all CPTs + `wpFilters.php` disables block editor.
5. **BEM** class naming.
6. **Never echo raw input** — always `esc_html`, `esc_url`, `esc_attr`, `wp_kses_post`.
7. **Blocks never know which page they're on** — no page-specific logic inside a block.
8. **CPT for repeating content** with ≥ 3 items or ≥ 2 custom fields.
9. Use `get_template_part()` — never `include`/`require` from the template layer.
10. **Split combined HTML** — extract `<style>` → `.css`, `<script>` → `.js`, remainder → `.php`.
11. **Redesign migration** — CPT slugs, taxonomy slugs, meta keys, and option keys from `wp-analyze-theme.md` Migration Notes are sacred. Copy verbatim. Renaming orphans DB content.
