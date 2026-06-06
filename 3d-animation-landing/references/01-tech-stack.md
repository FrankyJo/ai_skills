# 01 — Tech Stack

This file covers stack options for different project contexts. Always ask the user which stack they prefer (see SKILL.md intake) before writing any setup code.

---

## Stack Decision Matrix

| Scenario | Recommended stack |
|----------|-----------------|
| SEO matters, fullstack features needed | **Next.js App Router** |
| Pure frontend, fast iteration, no SSR | **Vite + React** |
| SEO + server loaders but no React Server Components | **Remix** |
| Mostly static, partial hydration | **Astro** |
| No build tool, maximum simplicity | **Vanilla HTML/CSS/JS** |
| User specified something else | Follow their choice |

---

## Option A — Next.js (App Router)

### Framework
- **Next.js** (latest stable) — App Router, Server Components, image optimization
- **React** (latest stable) — concurrent features, hooks
- Server Components by default; `"use client"` for interactive components

```bash
npx create-next-app@latest my-site --typescript --tailwind --app --src-dir
cd my-site
npm install framer-motion lenis @phosphor-icons/react geist
```

### Styling — Tailwind CSS v4
```css
/* globals.css */
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Fonts
```tsx
// layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

### SSR rules
- `"use client"` on any component using `useState`, `useEffect`, `useRef`, Framer Motion
- Phosphor icons in server components: `@phosphor-icons/react/dist/ssr`
- Export `metadata` from server components (not client)

### Integrations
- Third-party scripts: `next/script` with `strategy="lazyOnload"`
- Image optimization: `next/image`

---

## Option B — Vite + React

No SSR constraints — simpler mental model, faster HMR.

```bash
npm create vite@latest my-site -- --template react-ts
cd my-site
npm install framer-motion lenis @phosphor-icons/react tailwindcss @tailwindcss/vite
```

### Tailwind v4 with Vite
```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
export default { plugins: [react(), tailwindcss()] };
```

```css
/* index.css */
@import "tailwindcss";
```

### Key differences from Next.js
- No `"use client"` directive needed — everything is client by default
- No Server Components — all components can use hooks freely
- Phosphor icons: always use regular import (`@phosphor-icons/react`)
- Routing: use `react-router-dom` v7 or `@tanstack/react-router`
- No `next/image` — use standard `<img>` or `@unpic/react`
- SmoothScrollProvider wraps `<App />` in `main.tsx`

### Fonts
```tsx
// Use CSS @font-face or a font CDN (e.g., Fontsource)
npm install @fontsource-variable/geist
// In index.css:
@import "@fontsource-variable/geist";
```

---

## Option C — Remix

SSR + progressive enhancement, no React Server Components.

```bash
npx create-remix@latest my-site
cd my-site
npm install framer-motion lenis @phosphor-icons/react
# Add Tailwind: follow Remix Tailwind v4 guide
```

### Key differences
- Routes live in `app/routes/`
- Root layout in `app/root.tsx` — wrap with SmoothScrollProvider
- `loader` functions for server-side data
- No `"use client"` directive — use `typeof window !== "undefined"` guards instead, or move browser-only code into `useEffect`
- Framer Motion works but needs `useEffect` guards for SSR

---

## Option D — Astro

Best for mostly-static pages with selective hydration.

```bash
npm create astro@latest my-site
cd my-site
npx astro add react tailwind
npm install framer-motion lenis @phosphor-icons/react
```

### Key differences
- Page components in `src/pages/` (`.astro` files)
- React components used as islands with `client:load` or `client:visible`
- Scroll animation canvas component must have `client:load`
- SmoothScrollProvider: create as a React island with `client:load`
- No Server Components model — Astro has its own server rendering

```astro
---
// index.astro
import Hero from "../components/sections/Hero";
import SmoothScrollProvider from "../components/providers/SmoothScrollProvider";
---
<SmoothScrollProvider client:load>
  <Hero client:load />
</SmoothScrollProvider>
```

---

## Option E — Vanilla HTML/CSS/JS

No framework, no build step. Just files in a browser. Use this when the user explicitly wants plain HTML or doesn't need a JS framework.

### Dev server — critical

**Never use `python -m http.server`** — it does not support HTTP Range requests. Video seeking (`video.currentTime = ...`) silently fails: the canvas never updates on scroll.

Always use:

```bash
npx serve .
```

or:

```bash
npx http-server . --cors
```

Both support Range requests out of the box. This is the #1 reason canvas scrubbing "doesn't work" on Vanilla projects.

### File structure

```
project/
├── index.html
├── css/
│   ├── reset.css
│   ├── tokens.css       ← design tokens (CSS variables)
│   └── styles.css
├── js/
│   ├── scroll.js        ← canvas scroll engine
│   ├── animations.js    ← entrance animations
│   └── main.js          ← init, event listeners
└── public/
    └── videos/          ← animation video files
```

### Animation libraries via CDN

```html
<!-- GSAP (replaces Framer Motion) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>

<!-- Lenis smooth scroll -->
<script src="https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js"></script>
```

### Scroll animation engine (vanilla)

The canvas video engine is pure JS — no React or hooks needed. Use the same logic from `03-scroll-animation-deep-dive.md` but written as a plain function:

```js
// scroll.js
function initScrollAnimation({ sectionId, canvasId, videoSrc }) {
  const section = document.getElementById(sectionId);
  const canvas  = document.getElementById(canvasId);
  const ctx     = canvas.getContext("2d");

  // Resize
  const dpr = window.devicePixelRatio || 1;
  function resize() {
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  resize();
  window.addEventListener("resize", resize);

  // Video
  const video = document.createElement("video");
  video.src = videoSrc;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  let ready = false;
  video.addEventListener("canplaythrough", () => { ready = true; draw(0); }, { once: true });

  function draw(progress) {
    if (!ready) return;
    video.currentTime = progress * video.duration;
    const cw = canvas.width, ch = canvas.height;
    const vr = video.videoWidth / video.videoHeight;
    const cr = cw / ch;
    let dw, dh;
    if (cr > vr) { dw = cw; dh = cw / vr; }
    else          { dh = ch; dw = ch * vr; }
    if (window.innerWidth <= 768) { dw *= 1.3; dh *= 1.3; }
    ctx.drawImage(video, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // Scroll
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      draw(progress);
      ticking = false;
    });
  }, { passive: true });
}

// Usage:
initScrollAnimation({ sectionId: "hero", canvasId: "hero-canvas", videoSrc: "/public/videos/hero.mp4" });
```

### Entrance animations (vanilla — GSAP)

```js
// animations.js — replaces Framer Motion whileInView
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll(".animate-section").forEach(section => {
  gsap.from(section.querySelectorAll(".animate-item"), {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 85%",
      once: true,
    },
  });
});
```

### Lenis setup (vanilla)

```js
// main.js
const lenis = new Lenis({
  lerp: 0.08,
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### No `"use client"` needed — everything is client by default.

---

## Animation libraries (React stacks)

| Package | Why |
|---------|-----|
| `framer-motion` | Scroll reveals, springs, AnimatePresence |
| `lenis` | Physics-based smooth scroll, Safari-safe |
| `@phosphor-icons/react` | Icons |

## Animation libraries (Vanilla stack)

| CDN lib | Why |
|---------|-----|
| GSAP + ScrollTrigger | Replaces Framer Motion for entrance animations |
| Lenis | Same smooth scroll, use CDN or npm |
| Phosphor Icons SVG | Use inline SVGs or the icon CDN directly |

### Lenis setup (universal pattern)

```tsx
// SmoothScrollProvider.tsx
"use client"; // Next.js only — remove for other stacks

import { ReactLenis } from "lenis/react";

const isSafari =
  typeof navigator !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const options = {
  lerp: isSafari ? 0.1 : 0.08,
  smoothWheel: true,
  syncTouch: !isSafari,
};

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return <ReactLenis root options={options}>{children}</ReactLenis>;
}
```

---

## Dev Dependencies (framework-agnostic)

| Package | Purpose |
|---------|---------|
| `typescript` | Type safety |
| `eslint` | Linting |
| `@types/react` | React types |
| `@types/node` | Node types |