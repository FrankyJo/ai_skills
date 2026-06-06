# Native Meta Boxes (No ACF)

## When to use meta boxes

- Custom data fields on a CPT (position, LinkedIn, price, date, URL)
- Fields on a regular page that editors need to fill in
- Any structured data that isn't body content

## Single-field meta box pattern

```php
// app/core/customField.php

add_action('add_meta_boxes', 'registerProjectFields');
function registerProjectFields(): void {
    // add_meta_box(id, title, callback, post_type, context, priority)
    add_meta_box(
        'project_details',
        'Project Details',
        'renderProjectFields',
        'portfolio',
        'normal',
        'high'
    );
}

function renderProjectFields(WP_Post $post): void {
    wp_nonce_field('project_details_nonce', 'project_details_nonce');

    $url     = get_post_meta($post->ID, '_project_url',  true);
    $year    = get_post_meta($post->ID, '_project_year', true);
    $client  = get_post_meta($post->ID, '_client_name',  true);
    ?>
    <table class="form-table">
      <tr>
        <th><label for="_project_url">Project URL</label></th>
        <td><input type="url" id="_project_url" name="_project_url"
             value="<?= esc_url($url) ?>" class="regular-text"></td>
      </tr>
      <tr>
        <th><label for="_project_year">Year</label></th>
        <td><input type="number" id="_project_year" name="_project_year"
             value="<?= esc_attr($year) ?>" min="2000" max="2099" class="small-text"></td>
      </tr>
      <tr>
        <th><label for="_client_name">Client</label></th>
        <td><input type="text" id="_client_name" name="_client_name"
             value="<?= esc_attr($client) ?>" class="regular-text"></td>
      </tr>
    </table>
    <?php
}

// Hook: save_post_{post_type} fires only for that post type
add_action('save_post_portfolio', 'saveProjectFields');
function saveProjectFields(int $post_id): void {
    if (!isset($_POST['project_details_nonce']) ||
        !wp_verify_nonce($_POST['project_details_nonce'], 'project_details_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    // Map: POST key → meta key → sanitizer
    $fields = [
        '_project_url'  => 'esc_url_raw',
        '_project_year' => 'absint',
        '_client_name'  => 'sanitize_text_field',
    ];

    foreach ($fields as $key => $sanitizer) {
        if (isset($_POST[$key]) && $_POST[$key] !== '') {
            update_post_meta($post_id, $key, $sanitizer($_POST[$key]));
        } else {
            delete_post_meta($post_id, $key);
        }
    }
}
```

## Repeater meta box pattern

For a list of repeating rows (e.g. list of features, gallery items with captions):

```php
// app/core/customFieldRepeater.php

add_action('add_meta_boxes', function () {
    add_meta_box('service_features', 'Features List',
        'renderServiceFeatures', 'service', 'normal', 'default');
});

function renderServiceFeatures(WP_Post $post): void {
    wp_nonce_field('service_features_nonce', 'service_features_nonce');
    $features = get_post_meta($post->ID, '_features', true) ?: [];
    ?>
    <div id="features-repeater">
      <?php foreach ($features as $i => $row): ?>
        <div class="repeater-row" style="display:flex;gap:8px;margin-bottom:8px;">
          <input type="text" name="features[<?= $i ?>][icon]"
                 value="<?= esc_attr($row['icon'] ?? '') ?>" placeholder="Icon class">
          <input type="text" name="features[<?= $i ?>][text]"
                 value="<?= esc_attr($row['text'] ?? '') ?>" placeholder="Feature text" style="flex:1">
          <button type="button" class="button remove-row">Remove</button>
        </div>
      <?php endforeach; ?>
    </div>
    <button type="button" class="button add-row" data-target="features-repeater">+ Add Feature</button>

    <script>
    document.querySelectorAll('.add-row').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.target);
            const count  = target.querySelectorAll('.repeater-row').length;
            const tpl    = `<div class="repeater-row" style="display:flex;gap:8px;margin-bottom:8px;">
                <input type="text" name="features[${count}][icon]" placeholder="Icon class">
                <input type="text" name="features[${count}][text]" placeholder="Feature text" style="flex:1">
                <button type="button" class="button remove-row">Remove</button>
            </div>`;
            target.insertAdjacentHTML('beforeend', tpl);
        });
    });
    document.addEventListener('click', e => {
        if (e.target.classList.contains('remove-row')) e.target.closest('.repeater-row').remove();
    });
    </script>
    <?php
}

add_action('save_post_service', function (int $post_id) {
    if (!isset($_POST['service_features_nonce']) ||
        !wp_verify_nonce($_POST['service_features_nonce'], 'service_features_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $raw      = $_POST['features'] ?? [];
    $features = [];
    foreach ($raw as $row) {
        $icon = sanitize_html_class($row['icon'] ?? '');
        $text = sanitize_text_field($row['text'] ?? '');
        if ($text !== '') $features[] = compact('icon', 'text');
    }
    update_post_meta($post_id, '_features', $features);
});
```

## Sanitizer reference

| Field type    | Sanitizer          | Escaper      |
|---------------|--------------------|--------------|
| Text input    | `sanitize_text_field` | `esc_attr`  |
| Textarea      | `sanitize_textarea_field` | `esc_textarea` |
| URL           | `esc_url_raw`       | `esc_url`   |
| Integer       | `absint`            | `absint`    |
| Email         | `sanitize_email`    | `esc_attr`  |
| HTML content  | `wp_kses_post`      | `wp_kses_post` |
| Slug          | `sanitize_title`    | `esc_attr`  |
| CSS class     | `sanitize_html_class` | `esc_attr` |

## Reading meta in templates

```php
// Single value
$url = get_post_meta(get_the_ID(), '_project_url', true);

// Array / repeater
$features = get_post_meta(get_the_ID(), '_features', true) ?: [];

// In a WP_Query loop — still use get_the_ID() inside the loop
while ($query->have_posts()): $query->the_post();
    $position = get_post_meta(get_the_ID(), '_position', true);
endwhile;
wp_reset_postdata();
```
