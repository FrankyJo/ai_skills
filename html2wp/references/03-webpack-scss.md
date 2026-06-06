# SCSS + Webpack Build Pipeline

## Philosophy

- One **global** CSS bundle: `src/css/pages/index.scss` → `public/css/index.css`
- One CSS bundle **per page**: `src/css/pages/{page}/{page}.scss` → `public/css/pages/{page}/{page}.css`
- **Critical CSS** prefix: `critical-{page}.scss` → `public/css/critical/critical-{page}.css` (inlined in `<head>`)
- JS follows the same entry pattern
- Webpack auto-discovers entries via glob — no manual entry list updates needed

## package.json

```json
{
  "name": "theme-slug",
  "version": "1.0.0",
  "scripts": {
    "build":  "webpack --mode production",
    "dev":    "WATCH=true webpack --mode development",
    "watch":  "webpack --mode development --watch"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "glob": "^10.3.10",
    "imagemin-webpack-plugin": "^2.4.2",
    "imagemin-webp-webpack-plugin": "^3.3.6",
    "mini-css-extract-plugin": "^2.7.6",
    "postcss": "^8.4.31",
    "postcss-loader": "^7.3.3",
    "sass": "^1.69.5",
    "sass-loader": "^13.3.2",
    "terser-webpack-plugin": "^5.3.9",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  }
}
```

## webpack.config.js

```js
const path                 = require('path');
const glob                 = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin         = require('terser-webpack-plugin');

function getEntries() {
    const entries = {};

    // JS entries: src/js/pages/main.js  +  src/js/pages/*.js
    glob.sync('./src/js/pages/*.js').forEach(file => {
        const name = path.basename(file, '.js');
        entries[`js/${name}`] = file;
    });

    // CSS entries: src/css/pages/**/*.scss
    glob.sync('./src/css/pages/**/*.scss').forEach(file => {
        const rel  = path.relative('./src/css/pages', file);
        const name = rel.replace(/\.scss$/, '');

        if (name.includes('critical')) {
            entries[`css/critical/${path.basename(name)}`] = file;
        } else {
            entries[`css/pages/${name}`] = file;
        }
    });

    return entries;
}

module.exports = (env, argv) => ({
    target: ['web', 'es5'],
    entry:  getEntries(),
    output: {
        path:     path.resolve(__dirname, 'public'),
        filename: '[name].js',
        clean:    true,
    },
    devtool: argv.mode === 'development' ? 'source-map' : false,
    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /node_modules/,
                use:     'babel-loader',
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: 'asset/resource',
                generator: { filename: 'image/[name][ext]' },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
    ],
    optimization: {
        minimizer: [new TerserPlugin({ extractComments: false })],
    },
});
```

## .babelrc

```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.5%, last 2 versions, not dead"
    }]
  ]
}
```

## postcss.config.js

```js
module.exports = {
    plugins: { autoprefixer: {} }
};
```

## SCSS file patterns

### Global reset / settings

```scss
// src/css/settings/colors.scss
:root {
    --color-primary:    #1A1A2E;
    --color-accent:     #E94560;
    --color-bg:         #F8F9FA;
    --color-text:       #2D2D2D;
    --color-text-muted: #6B7280;
}
```

```scss
// src/css/settings/screen.scss
$bp-mobile:  375px;
$bp-tablet:  768px;
$bp-desktop: 1280px;
$bp-wide:    1440px;

@mixin mobile  { @media (max-width: #{$bp-tablet - 1}) { @content; } }
@mixin tablet  { @media (min-width: $bp-tablet) { @content; } }
@mixin desktop { @media (min-width: $bp-desktop) { @content; } }
```

```scss
// src/css/settings/mixins.scss
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

@mixin container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 20px;

    @include tablet  { padding: 0 40px; }
    @include desktop { padding: 0 80px; }
}
```

### Page entry

```scss
// src/css/pages/home/home.scss
@use '../../settings/settings' as *;

.hero {
    position: relative;
    min-height: 100vh;

    &__wrapper {
        @include container;
        @include flex-center;
        flex-direction: column;
        padding-top: 80px;
    }

    &__title {
        font-size: clamp(2rem, 5vw, 5rem);
        color: var(--color-primary);
    }

    @include mobile {
        &__title { text-align: center; }
    }
}
```

## Enqueuing in PHP

```php
// Global CSS — addStyles.php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('global', ASSETS_URI . 'css/pages/index.css', [],
        filemtime(ASSETS_DIR . 'css/pages/index.css'));
});

// Page-specific CSS — inside the page template file
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('home', ASSETS_URI . 'css/pages/home/home.css', ['global'],
        filemtime(ASSETS_DIR . 'css/pages/home/home.css'));
    wp_enqueue_script('home-js', ASSETS_URI . 'js/pages/home.js', [],
        filemtime(ASSETS_DIR . 'js/pages/home.js'), true);
});
```

> `filemtime()` provides automatic cache-busting: the file hash changes every time webpack rebuilds.

## Critical CSS inline

For above-the-fold CSS, output it inline in `<head>`:

```php
// In header.php, before wp_head()
$critical = get_template_directory() . '/public/css/critical/critical-home.css';
if (is_front_page() && file_exists($critical)): ?>
  <style><?= file_get_contents($critical) ?></style>
<?php endif;
```
