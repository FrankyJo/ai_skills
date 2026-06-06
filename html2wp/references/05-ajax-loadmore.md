# AJAX & Load More

## WordPress AJAX pattern (no plugin)

WordPress routes AJAX through `admin-ajax.php`. Two hooks per action:
- `wp_ajax_{action}` — logged-in users
- `wp_ajax_nopriv_{action}` — logged-out users

### Step 1 — Output nonce to JS

```php
// app/front/front-ajax.php
add_action('wp_enqueue_scripts', function () {
    wp_localize_script('main', 'wpAjax', [
        'url'   => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('wp_ajax_nonce'),
    ]);
});
```

### Step 2 — Register the action handler

```php
// app/actionAjax.php
add_action('wp_ajax_load_more_posts',        'loadMorePostsHandler');
add_action('wp_ajax_nopriv_load_more_posts', 'loadMorePostsHandler');

function loadMorePostsHandler(): void {
    check_ajax_referer('wp_ajax_nonce', 'nonce');

    $paged     = absint($_POST['page']    ?? 1);
    $post_type = sanitize_key($_POST['post_type'] ?? 'post');
    $per_page  = 6;

    $query = new WP_Query([
        'post_type'      => $post_type,
        'posts_per_page' => $per_page,
        'paged'          => $paged,
        'no_found_rows'  => false,
    ]);

    if (!$query->have_posts()) {
        wp_send_json_error(['message' => 'No more posts']);
    }

    ob_start();
    while ($query->have_posts()): $query->the_post();
        get_template_part('blocks/card', $post_type);
    endwhile;
    wp_reset_postdata();
    $html = ob_get_clean();

    wp_send_json_success([
        'html'      => $html,
        'max_pages' => $query->max_num_pages,
        'page'      => $paged,
    ]);
}
```

### Step 3 — JS side

```js
// src/js/utils/loadmore.js
export function initLoadMore(buttonSelector, containerSelector, postType) {
    const btn       = document.querySelector(buttonSelector);
    const container = document.querySelector(containerSelector);
    if (!btn || !container) return;

    let page = 1;
    let loading = false;

    btn.addEventListener('click', async () => {
        if (loading) return;
        loading = true;
        page++;

        try {
            const body = new FormData();
            body.append('action',    'load_more_posts');
            body.append('nonce',     wpAjax.nonce);
            body.append('page',      page);
            body.append('post_type', postType);

            const res  = await fetch(wpAjax.url, { method: 'POST', body });
            const json = await res.json();

            if (!json.success) {
                btn.style.display = 'none';
                return;
            }

            container.insertAdjacentHTML('beforeend', json.data.html);

            if (page >= json.data.max_pages) btn.style.display = 'none';
        } finally {
            loading = false;
        }
    });
}
```

```js
// src/js/pages/main.js
import { initLoadMore } from '../utils/loadmore.js';

initLoadMore('.load-more-btn', '.posts-grid', 'post');
```

## Card template part

```php
// blocks/card-post.php  (get_template_part('blocks/card', 'post'))
?>
<article class="card">
  <?php if (has_post_thumbnail()): ?>
    <a class="card__img-link" href="<?= esc_url(get_permalink()) ?>">
      <?= get_the_post_thumbnail(null, 'medium', ['class' => 'card__img']) ?>
    </a>
  <?php endif; ?>
  <div class="card__body">
    <h3 class="card__title">
      <a href="<?= esc_url(get_permalink()) ?>"><?= esc_html(get_the_title()) ?></a>
    </h3>
    <p class="card__excerpt"><?= esc_html(get_the_excerpt()) ?></p>
    <time class="card__date" datetime="<?= esc_attr(get_the_date('c')) ?>">
      <?= esc_html(get_the_date()) ?>
    </time>
  </div>
</article>
```

## HTML trigger

```php
// In the block that lists posts
<div class="posts-grid">
  <?php while ($query->have_posts()): $query->the_post();
      get_template_part('blocks/card', 'post');
  endwhile; wp_reset_postdata(); ?>
</div>

<?php if ($query->max_num_pages > 1): ?>
  <button class="load-more-btn btn" type="button">Load more</button>
<?php endif; ?>
```
