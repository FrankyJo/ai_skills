# 04 — Design Patterns

Four configurable design styles. Pick the one the user chose during intake and apply it consistently across all sections. Never mix styles within one project.

---

## How to choose

| User said | Use style |
|-----------|----------|
| Soft, clay-like, light background | **A — Neumorphic Light** |
| Dark, frosted glass, glowing accents | **B — Glassmorphic Dark** |
| Clean, flat, lots of whitespace | **C — Minimal** |
| Deep dark, gradient accents, editorial | **D — Dark Premium** |

---

## Style A — Neumorphic Light

Soft 3D surfaces emerging from a light grey background. Signature 7-layer shadow stack.

### CSS tokens

```css
:root {
  --background: #f5f5f5;
  --foreground: #09090b;
  --muted: #71717a;
  --card-bg: #ffffff;

  --card-shadow:
    0px 0.7px 0.7px -0.67px rgba(0, 0, 0, 0.08),
    0px 1.8px 1.8px -1.33px rgba(0, 0, 0, 0.08),
    0px 3.6px 3.6px -2px    rgba(0, 0, 0, 0.07),
    0px 6.9px 6.9px -2.67px rgba(0, 0, 0, 0.07),
    0px 13.6px 13.6px -3.33px rgba(0, 0, 0, 0.05),
    0px 30px 30px -4px       rgba(0, 0, 0, 0.02),
    inset 0px 3px 1px 0px    rgba(255, 255, 255, 1);
}
```

**Why this shadow works:** Multiple subtle layers at different distances create depth without harsh edges. The inset white highlight simulates light hitting the top edge.

### Card surface classes

```css
.card-surface {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.card-surface-nested {
  background: var(--background);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
}
```

### Pill / badge shadow

```tsx
const pillShadow =
  "0px 0.7px 0.7px -0.67px rgba(0,0,0,0.08), " +
  "0px 1.8px 1.8px -1.33px rgba(0,0,0,0.08), " +
  "0px 3.6px 3.6px -2px rgba(0,0,0,0.07), " +
  "0px 6.9px 6.9px -2.67px rgba(0,0,0,0.07), " +
  "inset 0px 2px 1px 0px rgba(255,255,255,1)";
```

### Glassmorphism (navbar, floating pills)

```tsx
// Navbar — light mode
"bg-white/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/30"

// Navbar — dark section
"bg-black/70 backdrop-blur-xl border border-white/15"

// EyebrowBadge
"bg-white/40 backdrop-blur-md border border-white/60"
```

### Palette

| Variable / Class | Value | Usage |
|-----------------|-------|-------|
| `--background` | `#f5f5f5` | Page background |
| `--foreground` | `#09090b` | Primary text |
| `--muted` | `#71717a` | Secondary text |
| `zinc-950` | `#09090b` | Headings, buttons |
| `zinc-300` | borders |
| `indigo-500` | `#6366f1` | Primary accent |
| `violet-500` | `#8b5cf6` | Gradient endpoint |
| `amber-400` | | Star ratings |

```tsx
// Gradient
"bg-gradient-to-r from-indigo-500 to-violet-500"
```

### Typography

| Element | Classes |
|---------|---------|
| H1 | `text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tighter` |
| H2 | `text-3xl md:text-5xl font-semibold tracking-tighter` |
| H3 | `text-lg font-semibold tracking-tight` |
| Body | `text-lg leading-relaxed` |
| Eyebrow | `text-[10px] font-medium tracking-wider uppercase` |

Max-width constraints: headings `max-w-[18ch]`–`max-w-[22ch]`, body `max-w-[48ch]`–`max-w-[55ch]`.

---

## Style B — Glassmorphic Dark

Dark or gradient background. Frosted glass cards. Glow and neon accents.

### CSS tokens

```css
:root {
  --background: #0a0a0f;
  --foreground: #f4f4f5;
  --muted: #a1a1aa;
  --card-bg: rgba(255, 255, 255, 0.05);

  --card-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  --glow-accent: rgba(99, 102, 241, 0.4); /* indigo glow */
}
```

### Card surface

```css
.card-surface {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
}
```

### Glassmorphism classes

```tsx
// Card (frosted)
"bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px]"

// Navbar
"bg-black/50 backdrop-blur-2xl border-b border-white/10"

// EyebrowBadge
"bg-white/[0.06] backdrop-blur-md border border-white/20"

// Glow effect on accent elements
"shadow-[0_0_40px_var(--glow-accent)]"
```

### Palette

| Class / Variable | Value | Usage |
|-----------------|-------|-------|
| `--background` | `#0a0a0f` | Page background |
| `zinc-50` | Text primary |
| `zinc-400` | Muted text |
| `indigo-400` | `#818cf8` | Accent (lighter for dark bg) |
| `violet-400` | `#a78bfa` | Gradient endpoint |
| `cyan-400` | | Alt accent / glow |

```tsx
// Gradient text
"bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"

// Glow border on hover
"hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
```

### Typography

Same scale as Neumorphic Light, but:
- All headings in `zinc-50` or gradient text
- Body in `zinc-300`
- Muted text in `zinc-500`

---

## Style C — Minimal

No decoration. Pure typography and whitespace. Subtle line borders only.

### CSS tokens

```css
:root {
  --background: #ffffff;
  --foreground: #111111;
  --muted: #6b7280;
  --card-bg: #fafafa;
  --border: #e5e7eb;

  --card-shadow: none; /* no shadows in minimal style */
}
```

### Card surface

```css
.card-surface {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
}
```

### Design rules for Minimal

- **No shadows** — use borders instead
- **No glassmorphism** — avoid `backdrop-filter`
- **No gradients** — single-color accents only
- **Generous whitespace** — `py-32 md:py-48` for sections
- **Strong typography** — let font weight and size carry the design

### Palette

| Class | Usage |
|-------|-------|
| `#111111` | Headings |
| `gray-600` | Body text |
| `gray-400` | Muted |
| `gray-200` | Borders |
| `gray-50` | Background cards |
| One accent color | User's brand color — ask them |

### Typography

| Element | Classes |
|---------|---------|
| H1 | `text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter` |
| H2 | `text-4xl md:text-6xl font-bold tracking-tighter` |
| Body | `text-xl leading-relaxed text-gray-600` |
| Eyebrow | `text-xs font-semibold tracking-widest uppercase text-gray-400` |

Max-width: headings `max-w-[14ch]`, body `max-w-[52ch]`.

---

## Style D — Dark Premium

Deep, near-black background. Large editorial typography. Gradient accents used sparingly.

### CSS tokens

```css
:root {
  --background: #0d0d0d;
  --foreground: #efefef;
  --muted: #888888;
  --card-bg: #161616;

  --card-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.5);
}
```

### Card surface

```css
.card-surface {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}
```

### Design rules for Dark Premium

- **Subtle elevation** — 1px top highlight border + deep shadow (no multi-layer neumorphic)
- **Gradient text** on key headings — not every heading, just the hero
- **High contrast** — very dark background, near-white text
- **Thin borders** — `rgba(255,255,255,0.06)` — barely visible

```tsx
// Gradient text (hero only)
"bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent"

// Navbar
"bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-white/[0.06]"

// EyebrowBadge
"bg-white/[0.08] border border-white/15 text-zinc-400"
```

### Palette

| Class / Hex | Usage |
|-------------|-------|
| `#0d0d0d` | Background |
| `#efefef` | Primary text |
| `#888888` | Muted text |
| `#161616` | Card background |
| One gradient pair | Ask user for brand colors, or default to `from-zinc-100 to-zinc-400` |

### Typography

| Element | Classes |
|---------|---------|
| H1 | `text-5xl md:text-7xl font-bold leading-[1.0] tracking-tight` |
| H2 | `text-4xl md:text-5xl font-semibold tracking-tight` |
| Body | `text-lg leading-relaxed text-zinc-400` |
| Eyebrow | `text-xs font-medium tracking-widest uppercase text-zinc-500` |

---

## Shared layout rules (all styles)

### Section spacing

```tsx
"px-6 py-24 md:px-8 md:py-32"
```

### Container

```tsx
"mx-auto max-w-[1400px]"
```

### Card padding

```tsx
"p-7"          // standard
"p-6"          // compact
"max-md:p-4"   // mobile override
```

### Grid patterns

```tsx
// Equal columns
"grid-cols-1 md:grid-cols-3 gap-5"

// Asymmetric (bento)
"grid-cols-1 md:grid-cols-[2fr_3fr] gap-5"
"grid-cols-1 md:grid-cols-[3fr_2fr] gap-5"
```

### Border radius

| Element | Radius |
|---------|--------|
| Cards | `rounded-[20px]` or `rounded-2xl` |
| Buttons | `rounded-2xl` |
| Badges / Pills | `rounded-full` |
| Inner containers | `rounded-xl` |

### Responsive strategy

- Mobile-first base styles
- `md:` (768px) and `lg:` (1024px) for overrides
- Canvas section heights: `400vh` → `350vh` (tablet) → `300vh` (mobile)
- Canvas zoom on mobile: 1.3×
- Card padding on mobile: `p-7` → `p-4`

### Spring configurations

| Use case | Stiffness | Damping |
|----------|-----------|---------|
| Default scroll reveal | 100 | 20 |
| Hero text entrance | 80 | 20 |
| FAQ accordion | 200 | 25 |
| Mobile menu | 300 | 30 |
| Dramatic/slow reveal | 60 | 18 |