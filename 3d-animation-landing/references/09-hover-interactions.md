# 09 — Hover Interactions

Premium hover effects for buttons, links, and cards. Every interactive element must have a deliberate, smooth hover state — bare color changes are not enough.

---

## Core rules

- **Duration: 200–300ms** — fast enough to feel responsive, slow enough to feel smooth. Never 0ms (jarring) or 500ms+ (sluggish).
- **Easing: `ease-out` or `cubic-bezier(0.4, 0, 0.2, 1)`** — fast start, soft landing.
- **Scale max: 1.03** on cards, **1.04** on buttons. More than that looks unstable.
- **`will-change: transform`** on elements that scale — promotes them to GPU layer and prevents jank.
- **Never use `transition-all`** — it transitions everything including `height`, `width`, `color` and causes layout recalculations. Always specify the exact properties: `transition-[transform,box-shadow,opacity,border-color]`.
- **Mirror the hover on `:focus-visible`** — keyboard users deserve the same feedback.

---

## Buttons

### Style A — Neumorphic Light

Lift + shadow deepening + slight scale. The card rises off the surface.

```tsx
<button className="
  relative
  rounded-2xl px-6 py-3
  bg-zinc-950 text-white font-medium
  shadow-[0_2px_8px_rgba(0,0,0,0.15)]
  transition-[transform,box-shadow] duration-200 ease-out
  hover:scale-[1.03]
  hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)]
  active:scale-[0.98] active:shadow-[0_1px_4px_rgba(0,0,0,0.15)]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950
">
  Get Started
</button>
```

Secondary variant (light surface):

```tsx
<button className="
  rounded-2xl px-6 py-3
  bg-white text-zinc-900 font-medium
  shadow-[var(--card-shadow)]
  transition-[transform,box-shadow] duration-200 ease-out
  hover:scale-[1.03]
  hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),inset_0_3px_1px_rgba(255,255,255,1)]
  active:scale-[0.98]
">
  Learn More
</button>
```

### Style B — Glassmorphic Dark

Glow border + brightness lift.

```tsx
<button className="
  rounded-2xl px-6 py-3
  bg-white/[0.08] text-white font-medium
  border border-white/[0.12]
  backdrop-blur-sm
  transition-[transform,box-shadow,border-color,background-color] duration-250 ease-out
  hover:scale-[1.03]
  hover:bg-white/[0.13]
  hover:border-indigo-400/60
  hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]
  active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
">
  Get Started
</button>
```

### Style C — Minimal

Invert fill + subtle scale.

```tsx
<button className="
  rounded-lg px-6 py-3
  bg-zinc-950 text-white font-medium
  transition-[transform,background-color] duration-200 ease-out
  hover:scale-[1.03] hover:bg-zinc-800
  active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950
">
  Get Started
</button>

{/* Outline variant */}
<button className="
  rounded-lg px-6 py-3
  border border-zinc-950 text-zinc-950 font-medium bg-transparent
  transition-[transform,background-color,color] duration-200 ease-out
  hover:scale-[1.03] hover:bg-zinc-950 hover:text-white
  active:scale-[0.98]
">
  Learn More
</button>
```

### Style D — Dark Premium

Gradient border reveal on hover using a pseudo-element trick.

```tsx
{/* The gradient border requires a wrapper — use Framer Motion or a CSS class */}
<button className="
  relative rounded-2xl px-6 py-3
  bg-[#161616] text-white font-medium
  border border-white/[0.08]
  transition-[transform,border-color,box-shadow] duration-250 ease-out
  hover:scale-[1.03]
  hover:border-white/25
  hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]
  active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30
">
  Get Started
</button>
```

---

## Cards

### Style A — Neumorphic Light

Lift off the surface — shadow deepens, card rises.

```tsx
<div className="
  card-surface p-7 rounded-[20px]
  transition-[transform,box-shadow] duration-300 ease-out
  cursor-default
  hover:-translate-y-1
  hover:shadow-[0px_1px_1px_-0.67px_rgba(0,0,0,0.09),0px_2.5px_2.5px_-1.33px_rgba(0,0,0,0.09),0px_5px_5px_-2px_rgba(0,0,0,0.08),0px_10px_10px_-2.67px_rgba(0,0,0,0.08),0px_20px_20px_-3.33px_rgba(0,0,0,0.06),0px_45px_45px_-4px_rgba(0,0,0,0.03),inset_0px_3px_1px_0px_rgba(255,255,255,1)]
">
```

Framer Motion variant (smoother spring):

```tsx
<motion.div
  className="card-surface p-7 rounded-[20px] cursor-default"
  whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(0,0,0,0.12), inset 0px 3px 1px rgba(255,255,255,1)" }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
>
```

### Style B — Glassmorphic Dark

Glow border + brightness increase.

```tsx
<div className="
  bg-white/[0.04] backdrop-blur-xl
  border border-white/[0.08] rounded-[20px] p-7
  transition-[border-color,box-shadow,background-color] duration-300 ease-out
  cursor-default
  hover:bg-white/[0.07]
  hover:border-indigo-400/30
  hover:shadow-[0_0_40px_rgba(99,102,241,0.12),0_4px_24px_rgba(0,0,0,0.4)]
">
```

### Style C — Minimal

Border darkens + subtle lift. No shadow unless hovered.

```tsx
<div className="
  bg-gray-50 border border-gray-200 rounded-xl p-7
  transition-[transform,border-color,box-shadow] duration-200 ease-out
  cursor-default
  hover:-translate-y-0.5
  hover:border-gray-400
  hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]
">
```

### Style D — Dark Premium

Top edge highlight appears on hover.

```tsx
<div className="
  bg-[#161616] border border-white/[0.06] rounded-2xl p-7
  transition-[transform,border-color,box-shadow] duration-300 ease-out
  cursor-default
  hover:-translate-y-1
  hover:border-white/15
  hover:shadow-[0_1px_0_rgba(255,255,255,0.1),0_16px_40px_rgba(0,0,0,0.5)]
">
```

---

## Navigation links

### Animated underline (all styles)

The underline grows from left on hover and shrinks from right on leave — a directional feel.

```tsx
<a className="
  relative inline-block text-sm font-medium
  text-zinc-600 hover:text-zinc-950
  transition-colors duration-200
  after:absolute after:bottom-0 after:left-0
  after:h-px after:w-0 after:bg-zinc-950
  after:transition-[width] after:duration-200 after:ease-out
  hover:after:w-full
">
  Services
</a>
```

Dark variant (glassmorphic / dark premium):

```tsx
<a className="
  relative inline-block text-sm font-medium
  text-zinc-400 hover:text-white
  transition-colors duration-200
  after:absolute after:bottom-0 after:left-0
  after:h-px after:w-0 after:bg-white
  after:transition-[width] after:duration-200 after:ease-out
  hover:after:w-full
">
  Services
</a>
```

### Icon links (arrow, external)

Nudge the icon right on hover:

```tsx
<a className="group inline-flex items-center gap-1.5 text-sm font-medium">
  View project
  <ArrowUpRight className="
    transition-transform duration-200
    group-hover:translate-x-0.5 group-hover:-translate-y-0.5
  " size={16} />
</a>
```

---

## EyebrowBadge / Pills

Subtle brightening on hover if the badge is clickable:

```tsx
<span className="
  {/* base glassmorphic styles */}
  transition-[background-color,border-color] duration-200
  hover:bg-white/60 hover:border-white/80
  cursor-pointer
">
  Our Services
</span>
```

---

## Framer Motion hover patterns

Use `whileHover` + `whileTap` for richer spring-based feedback:

```tsx
<motion.button
  whileHover={{ scale: 1.03, y: -1 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  Get Started
</motion.button>
```

For cards with reveal content on hover:

```tsx
<motion.div
  initial="rest"
  whileHover="hover"
  animate="rest"
>
  <motion.div
    variants={{
      rest: { opacity: 0, y: 8 },
      hover: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.2 }}
  >
    {/* Revealed on hover */}
  </motion.div>
</motion.div>
```

---

## CSS `transition` property cheat sheet

| What you're animating | Use |
| --------------------- | --- |
| Scale + shadow | `transition-[transform,box-shadow]` |
| Scale + border | `transition-[transform,border-color]` |
| Color + underline | `transition-[color,width]` (separate elements) |
| Everything above | `transition-[transform,box-shadow,border-color,background-color,opacity]` |
| Never use | `transition-all` |

---

## Checklist — hover interactions

- [ ] Every button has `hover:scale`, active state, and `focus-visible` ring
- [ ] Every card has a hover lift (translate-y or scale) + shadow change
- [ ] Navigation links have animated underline
- [ ] Arrow icons nudge on parent hover using `group-hover`
- [ ] No `transition-all` anywhere
- [ ] All transitions use `duration-200`–`duration-300` with `ease-out`
- [ ] Hover states tested on mobile (touch devices ignore hover — no broken layouts)
- [ ] Cards with `cursor-pointer` have a hover state; decorative cards use `cursor-default`
