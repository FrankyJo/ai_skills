# Custom Post Types & Taxonomies

## When to create a CPT

Create a Custom Post Type when **any** of the following is true:
- Content repeats (3+ items of the same kind)
- Content has ≥ 2 extra data fields beyond title/content/thumbnail
- Content needs its own archive page (`/team/`, `/portfolio/`)
- Content needs a single template different from regular pages
- Content is managed by editors separately from pages

**Do NOT** create a CPT for:
- One-off pages (About, Contact) → use a page template
- Content that only ever has a title and body → use regular Posts
- Site-wide settings (phone, hours) → use Theme Options (Settings API)

## CPT + Taxonomy pairing rules

A taxonomy is needed when:
- Items need to be filterable by category (portfolio by industry, FAQ by topic)
- Items need an archive split by group
- Editors want to group/filter in wp-admin

Register taxonomy in `taxonomies.php`, link it to the CPT via the `taxonomies` arg.

## Full example: Services + Service Category

```php
// app/core/postTypes.php
add_action('init', 'initAllPostTypes');
function initAllPostTypes(): void {
    $default = [
        'public'      => true,
        'has_archive' => false,
        'rewrite'     => ['slug' => 'services'],
        'supports'    => ['title', 'editor', 'thumbnail'],
        'show_in_rest'=> true,
    ];

    $post_types = [
        'service' => [
            'menu_icon'  => 'dashicons-hammer',
            'taxonomies' => ['service_category'],
            'labels'     => [
                'name'          => 'Services',
                'singular_name' => 'Service',
                'add_new_item'  => 'Add Service',
                'edit_item'     => 'Edit Service',
                'search_items'  => 'Search Services',
            ],
        ],
    ];

    foreach ($post_types as $slug => $args) {
        register_post_type($slug, array_merge($default, $args));
    }
}
```

```php
// app/core/taxonomies.php
add_action('init', 'initAllTaxonomies');
function initAllTaxonomies(): void {
    $default = [
        'public'       => true,
        'hierarchical' => true,
    ];

    $taxonomies = [
        'service' => [
            'service_category' => [
                'rewrite' => ['slug' => 'service-category'],
                'labels'  => [
                    'name'          => 'Service Categories',
                    'singular_name' => 'Category',
                    'add_new_item'  => 'Add Category',
                    'edit_item'     => 'Edit Category',
                ],
            ],
        ],
    ];

    foreach ($taxonomies as $post_type => $tax_list) {
        foreach ($tax_list as $tax_slug => $args) {
            register_taxonomy($tax_slug, $post_type, array_merge($default, $args));
        }
    }
}
```

## Querying CPTs in blocks

```php
// Standard query — all items, editor order
$query = new WP_Query([
    'post_type'      => 'service',
    'posts_per_page' => -1,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'no_found_rows'  => true,   // skip COUNT(*) for non-paginated queries
]);

// Query by taxonomy term
$query = new WP_Query([
    'post_type'      => 'portfolio',
    'posts_per_page' => 12,
    'tax_query'      => [[
        'taxonomy' => 'portfolio_category',
        'field'    => 'slug',
        'terms'    => 'web-design',
    ]],
]);

// ALWAYS reset after custom query
wp_reset_postdata();
```

## CPT reference table

| Content           | CPT slug      | Has archive | Taxonomy              |
|-------------------|---------------|-------------|-----------------------|
| Blog / News       | `post`        | yes         | `category`, `post_tag`|
| Portfolio / Cases | `portfolio`   | yes         | `portfolio_category`  |
| Services          | `service`     | no          | `service_category`    |
| Team members      | `team`        | no          | `department`          |
| Testimonials      | `testimonial` | no          | —                     |
| FAQ               | `faq`         | no          | `faq_category`        |
| Vacancies         | `vacancy`     | yes         | `department`          |
| Partners / Logos  | `partner`     | no          | —                     |
