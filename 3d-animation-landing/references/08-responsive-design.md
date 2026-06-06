# 08 — Responsive Design

Every site built with this skill must work on mobile, tablet, and desktop. This file covers the full responsive strategy — layout, typography, navigation, canvas, and testing.

---

## Breakpoints

| Name | Width | Tailwind prefix | Vanilla CSS |
|------|-------|----------------|-------------|
| Mobile | 0–767px | base (no prefix) | default |
| Tablet | 768–1023px | `md:` | `@media (min-width: 768px)` |
| Desktop | 1024px+ | `lg:` | `@media (min-width: 1024px)` |
| Wide | 1280px+ | `xl:` | `@media (min-width: 1280px)` |

**Always mobile-first.** Write base styles for mobile, then override with `md:` and `lg:`. Never write desktop-first and try to undo.

---

## Typography Scale (Responsive)

| Element | Mobile | Tablet (md:) | Desktop (lg:) |
|---------|--------|-------------|--------------|
| H1 Hero | `text-3xl` | `text-5xl` | `text-7xl` |
| H2 Section | `text-2xl` | `text-4xl` | `text-5xl` |
| H3 Card | `text-lg` | `text-xl` | `text-2xl` |
| Body | `text-base` | `text-lg` | `text-lg` |
| Eyebrow | `text-[10px]` | `text-[10px]` | `text-[10px]` |

```tsx
// H1 example
<h1 className="text-3xl md:text-5xl lg:text-7xl font-semibold leading-[1.05] tracking-tighter">
```

**Max-width on headings always matters on mobile** — without it, long headings overflow. Use `max-w-[18ch]` on H1, `max-w-[22ch]` on H2.

---

## Layout & Grid (Responsive)

### Single column → multi-column

```tsx
// 1 col on mobile, 3 on desktop
"grid grid-cols-1 md:grid-cols-3 gap-5"

// 1 col on mobile, 2 on desktop
"grid grid-cols-1 md:grid-cols-2 gap-5"

// Bento asymmetric — stack on mobile
"grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-5"
```

### Section spacing — reduce on mobile

```tsx
"px-5 py-16 md:px-8 md:py-24 lg:py-32"
```

### Container — full width on mobile, capped on desktop

```tsx
"mx-auto w-full max-w-[1400px] px-5 md:px-8"
```

### Card padding — reduce on mobile

```tsx
"p-5 md:p-7"
```

### Hide / show by breakpoint

```tsx
// Hide on mobile, show on desktop
"hidden md:block"

// Show on mobile only
"block md:hidden"

// Hide on desktop
"md:hidden"
```

---

## Navigation (Hamburger Menu)

On mobile, the navbar must collapse into a hamburger. This is required — a full desktop nav on mobile is not acceptable.

### Pattern

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 ...">
      <div className="flex items-center justify-between px-5 py-4 md:px-8">
        {/* Logo */}
        <a href="/">Logo</a>

        {/* Desktop links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8">
          <li><a href="#services">Services</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        {/* Hamburger — visible only on mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`block h-0.5 w-6 bg-current transition-transform duration-300
            ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-current transition-opacity duration-300
            ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-current transition-transform duration-300
            ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <ul className="flex flex-col px-5 py-6 gap-6">
              <li><a href="#services" onClick={() => setOpen(false)}>Services</a></li>
              <li><a href="#projects" onClick={() => setOpen(false)}>Projects</a></li>
              <li><a href="#contact" onClick={() => setOpen(false)}>Contact</a></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
```

---

## Canvas Sections (Responsive)

Canvas scroll animations need extra treatment on mobile.

### Section height — reduce on smaller screens

```css
/* Tailwind approach */
/* Apply via inline style + CSS override */
.scroll-animation { height: 400vh; }

@media (max-width: 1024px) { .scroll-animation { height: 350vh; } }
@media (max-width: 768px)  { .scroll-animation { height: 300vh; } }
```

Or pass height via CSS variable:

```tsx
<section
  className="scroll-animation"
  style={{ "--section-height": "400vh" } as React.CSSProperties}
/>
```

### Canvas zoom on mobile (1.3×)

The animation subject often looks too small on mobile. Apply 1.3× zoom in the draw function:

```tsx
const isMobile = window.innerWidth <= 768;
if (isMobile) { drawW *= 1.3; drawH *= 1.3; }
```

### Canvas DPR — always scale for retina

```tsx
const dpr = window.devicePixelRatio || 1;
canvas.width  = window.innerWidth  * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width  = window.innerWidth  + "px";
canvas.style.height = window.innerHeight + "px";
```

Without this, the canvas is blurry on every modern phone screen.

### Annotation cards on mobile

On mobile, canvas annotation cards should:
- Stack below the canvas or be hidden entirely — overlapping text on a 375px screen looks broken
- Use `absolute bottom-0` positioning instead of `absolute left-1/4 top-1/3`
- Or use `hidden md:block` to hide them on mobile completely

---

## Images (Responsive)

### React (Next.js)

```tsx
import Image from "next/image";

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={800}
  className="w-full h-auto"
  priority // for above-the-fold images
/>
```

### React (Vite/Remix)

```tsx
<img
  src="/hero-image.jpg"
  srcSet="/hero-image-640.jpg 640w, /hero-image-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero"
  className="w-full h-auto"
  loading="lazy" // add "eager" for above-the-fold
/>
```

### Vanilla HTML

```html
<picture>
  <source media="(max-width: 768px)" srcset="/hero-mobile.jpg">
  <img src="/hero-desktop.jpg" alt="Hero" loading="eager">
</picture>
```

---

## Touch & Mobile UX Rules

- **Minimum tap target: 44×44px** — buttons, links, nav items. Add `min-h-[44px] min-w-[44px]` if needed.
- **No hover-only interactions** — anything that requires hover must also work on tap.
- **Scroll-driven canvas + touch scroll** — Lenis with `syncTouch: false` on iOS prevents fighting between Lenis and native touch scroll. This is already in the SmoothScrollProvider defaults.
- **Font size minimum: 16px** on mobile — smaller fonts trigger iOS auto-zoom on input focus.
- **Avoid horizontal overflow** — add `overflow-x-hidden` to `<body>` or the root wrapper to catch stray absolute elements.

---

## Responsive Checklist

Run through this before marking any section complete:

### Layout
- [ ] Every grid is single-column on mobile (320px viewport)
- [ ] No horizontal scroll on any breakpoint
- [ ] Section padding reduced on mobile (`py-16 md:py-32`)
- [ ] Card padding reduced on mobile (`p-5 md:p-7`)
- [ ] Containers have side padding on mobile (`px-5`)

### Typography
- [ ] H1 legible and not overflowing on 375px screen
- [ ] Body text minimum 16px on mobile
- [ ] Long headings have `max-w-[18ch]` constraint

### Navigation
- [ ] Hamburger menu visible and working on mobile
- [ ] Desktop nav hidden on mobile (`hidden md:flex`)
- [ ] Mobile menu closes after link click
- [ ] All nav tap targets are at least 44px

### Canvas sections
- [ ] Section height reduced: `400vh → 350vh → 300vh`
- [ ] Canvas DPR scaling applied
- [ ] Mobile canvas zoom (1.3×) applied
- [ ] Annotation cards positioned correctly on mobile (not overlapping text)

### Images
- [ ] Above-the-fold images use `priority` / `loading="eager"`
- [ ] Below-the-fold images use `loading="lazy"`
- [ ] No images overflow their containers

### Testing
- [ ] Tested at 375px (iPhone SE) — the tightest common screen
- [ ] Tested at 768px (iPad) — the tablet breakpoint
- [ ] Tested at 1440px (desktop)
- [ ] iOS Safari tested (smooth scroll, canvas)
- [ ] Android Chrome tested

---

## Testing at Common Breakpoints

In Chrome DevTools, test at these presets before calling mobile done:

| Device | Width | What to check |
|--------|-------|--------------|
| iPhone SE | 375px | Tightest layout, largest typography risk |
| iPhone 14 | 390px | Most common iOS size |
| Pixel 7 | 412px | Most common Android size |
| iPad | 768px | Breakpoint boundary |
| iPad Pro | 1024px | Second breakpoint boundary |
| MacBook | 1440px | Standard desktop |