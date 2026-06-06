# Theme Options (Settings API, no plugin)

## When to use Theme Options

Use a Theme Options admin page for **site-wide settings** that don't belong to a specific post:
- Phone number, email, address
- Social media links
- Google Analytics / GTM ID
- Header/footer scripts
- Default SEO description

**Do NOT** use Theme Options for:
- Per-page settings → use page meta boxes
- Per-CPT settings → use CPT meta boxes
- Navigation menus → use `register_nav_menus`

## Simple options page with Settings API

```php
// app/core/themeOptions.php

add_action('admin_menu', 'registerOptionsPage');
function registerOptionsPage(): void {
    add_menu_page(
        'Theme Options',
        'Theme Options',
        'manage_options',
        'theme-options',
        'renderOptionsPage',
        'dashicons-admin-customizer',
        60
    );
}

add_action('admin_init', 'registerOptionSettings');
function registerOptionSettings(): void {
    register_setting('theme_options_group', 'theme_options', [
        'sanitize_callback' => 'sanitizeThemeOptions',
    ]);

    add_settings_section('contacts_section', 'Contact Info', '__return_false', 'theme-options');
    add_settings_section('social_section',   'Social Links',  '__return_false', 'theme-options');

    $fields = [
        'contacts_section' => [
            'phone'   => 'Phone',
            'email'   => 'Email',
            'address' => 'Address',
        ],
        'social_section' => [
            'facebook'  => 'Facebook URL',
            'instagram' => 'Instagram URL',
            'linkedin'  => 'LinkedIn URL',
        ],
    ];

    foreach ($fields as $section => $group) {
        foreach ($group as $key => $label) {
            add_settings_field($key, $label, function () use ($key) {
                $value = get_option('theme_options')[$key] ?? '';
                echo '<input type="text" name="theme_options[' . esc_attr($key) . ']"
                      value="' . esc_attr($value) . '" class="regular-text">';
            }, 'theme-options', $section);
        }
    }
}

function sanitizeThemeOptions(array $input): array {
    $clean = [];
    $text_fields = ['phone', 'address'];
    $url_fields  = ['facebook', 'instagram', 'linkedin'];
    $email_fields = ['email'];

    foreach ($text_fields  as $k) $clean[$k] = sanitize_text_field($input[$k] ?? '');
    foreach ($url_fields   as $k) $clean[$k] = esc_url_raw($input[$k] ?? '');
    foreach ($email_fields as $k) $clean[$k] = sanitize_email($input[$k] ?? '');

    return $clean;
}

function renderOptionsPage(): void {
    if (!current_user_can('manage_options')) return;
    ?>
    <div class="wrap">
      <h1>Theme Options</h1>
      <form method="post" action="options.php">
        <?php
        settings_fields('theme_options_group');
        do_settings_sections('theme-options');
        submit_button();
        ?>
      </form>
    </div>
    <?php
}
```

## Reading options in templates

```php
// Get all options
$opts = get_option('theme_options', []);

// Use in template
$phone = $opts['phone'] ?? '';
$email = $opts['email'] ?? '';

if ($phone): ?>
  <a href="tel:<?= esc_attr(preg_replace('/\D/', '', $phone)) ?>">
    <?= esc_html($phone) ?>
  </a>
<?php endif;
```

## Helper function (add to themeFunctions.php)

```php
function theme_option(string $key, string $default = ''): string {
    $opts = get_option('theme_options', []);
    return $opts[$key] ?? $default;
}

// Usage in any template:
$phone = theme_option('phone');
```

## Don't forget to include in functions.php

```php
require_once APP_DIR . 'core/themeOptions.php';
```
