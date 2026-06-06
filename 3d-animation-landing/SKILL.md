---
name: 3d-scroll-website
description: Build premium scroll-animated landing pages from scratch — stack selection, canvas frame-sequence animations, smooth scroll, configurable design systems (neumorphic / glassmorphic / minimal / dark), and performance hardening. Use this whenever the user mentions: building a landing page, a 3D website, a scroll-animated site, a canvas frame sequence (like Apple's AirPods page), scroll-driven hero animations, smooth-scroll sites, premium/agency-quality landing pages, SaaS landing pages, product showcases, portfolio sites, or any site with advanced scroll effects. Use it EVEN if the user doesn't say "3D" — phrases like "scroll animation", "frame sequence", "sticky canvas", "hero animation that plays on scroll", "premium landing page", or "animated website" are all signals. This is the whole pipeline in one place: intake questions, stack scaffolding, frame-sequence engine, scroll math, Framer Motion patterns, design system, performance hardening — don't stitch partial answers together when this skill covers it end-to-end.
---

# Build Premium Scroll-Animated Landing Pages

This skill covers the complete pipeline for building scroll-animated sites — from the canvas video engine that powers the "3D feel" to the design system, performance rules, and stack setup.

You are the builder. The user brings the idea; you ship the whole site.

## Project Intake — Ask First, Build Second

**Before writing a single line of code**, go through the intake in order. Ask all five blocks in one message so the user can answer everything at once.

---

### Block 1 — Tech & Design

```
1. Stack: Which framework?
   → Next.js (App Router)
   → Vite + React
   → Remix
   → Astro
   → Vanilla HTML/CSS/JS  — no build tool, pure files + CDN libs if needed
   → Other (describe)

2. Design style:
   → Neumorphic Light  — soft clay-like surfaces, light background, subtle shadows
   → Glassmorphic Dark — frosted glass, dark/gradient background, glow accents
   → Minimal           — flat, lots of whitespace, sharp typography
   → Dark Premium      — deep dark background, gradient accents, editorial feel
```

---

### Block 2 — Site Structure

Ask the user to list the sections in order. Show this example format:

```
List your sections in this format (rename / add / remove as needed):

Section 1: Hero
Section 2: Services
Section 3: Projects (3D animation)
Section 4: About us
Section 5: Testimonials
Section 6: FAQ
Section 7: Contact / CTA
```

Rules for interpreting the answer:
- A section marked `(3D animation)` or `(video)` or `(scroll animation)` means it uses the canvas+video engine — go to Block 4.
- Remaining sections are Framer Motion + design-system components.
- If the user doesn't specify order, ask them to number the sections.

---

### Block 3 — Content

After the structure is confirmed, ask:

```
Content for sections:
→ Generate it — I'll describe the site topic and you write the copy
→ I'll provide it — after the structure is confirmed, wait for my content per section

If generating — describe the site topic in 2–3 sentences:
```

If the user chooses "I'll provide it": scaffold all section components with `// TODO: content` placeholders, then wait for the user to provide text section by section before filling them in.

If the user chooses "Generate it": use the project type (Block 1) and the section list to write appropriate copy. Keep it realistic — no Lorem Ipsum.

---

### Block 4 — 3D Animation Sources

Only ask this block if the site has one or more `(3D animation)` sections.

```
For each section with a 3D animation, specify:
- Section name
- Path to the video file (e.g. public/videos/hero.mp4)
- Video format: mp4 (recommended), webm, or both

Example:
Section Hero      → public/videos/hero.mp4
Section Projects  → public/videos/tunnel.mp4
```

The video approach is now the **default** for scroll-driven canvas animations. Frame-image sequences are the fallback if the user specifically asks for them or doesn't have a video file.

Use the video source answers to configure `VIDEO_SRC` in each canvas section component. See **references/03-scroll-animation-deep-dive.md** for the video-driven canvas engine.

---

Do not guess any of these values. If the user skips a block, ask for that specific block before proceeding. The stack answer drives `references/01-tech-stack.md`; the design answer drives `references/04-design-patterns.md`.

## Mental model

The "3D feel" on premium sites is almost never runtime WebGL. It's a **video file** (or pre-rendered image sequence) that a `<canvas>` scrubs through based on scroll position. The viewport is pinned sticky while a tall parent section drives the scroll. That's the core trick.

Default approach: a single `.mp4` per animated section. `video.currentTime` is set on every scroll tick, then `ctx.drawImage(video, ...)` renders it to canvas with cover-fit scaling. Smooth, one file, no preloading hundreds of images.

Fallback (when no video is available): 100–120 numbered JPG frames preloaded into an array, `drawImage(frames[frameIndex], ...)` on each tick.

Everything else is polish: physics-based smooth scroll, scroll-triggered section reveals, CSS 3D transforms for decorative elements, SVG path animations, and a consistent design system.

Keep this model front-of-mind. If the user says "I want a hero that animates as I scroll" — they're describing a sticky canvas. The animation source (video or frames) comes from intake Block 4.

## When to reach for real 3D (Three.js / R3F) instead

- User needs the scene to respond to mouse movement, drag, or gestures
- User needs real-time lighting, physics, or procedural geometry
- Scene has too many states to pre-render cleanly

For everything else — a pre-rendered video (or frame sequence) wins. It's faster on mobile, never janks, and the animation is art-directed in a real 3D tool.

## Stack

Pick the setup based on the user's answer to intake question #1.

Full options, install commands, and configs: **references/01-tech-stack.md**

For React stacks: **Framer Motion** (scroll reveals, springs), **Lenis** (smooth scroll), **@phosphor-icons/react** (icons).
For Vanilla stack: **GSAP + ScrollTrigger** (replaces Framer Motion), **Lenis via CDN**, inline SVG icons.

## Design system

Pick the token set based on the user's answer to intake question #2.

Full token sets for all four styles: **references/04-design-patterns.md**

Each style has: shadow system, color palette, typography scale, spacing, and glassmorphism rules. Use one style consistently across all sections — mixing styles kills the premium feel.

## Hover interactions — non-negotiable

Every interactive element — buttons, cards, nav links, icon links — must have a deliberate, smooth hover state. Bare color-only changes are not premium. The rule:

- **Buttons:** `scale(1.03)` + shadow deepening + `active:scale(0.97)` snap. Always add `focus-visible` ring.
- **Cards:** lift with `translateY(-4px)` or `scale(1.01)` + shadow intensification.
- **Nav links:** animated underline that grows from left (`width: 0 → 100%`).
- **Icon links:** icon nudges in the direction of travel on parent `group-hover`.
- **Duration:** 200–300ms `ease-out`. Never `transition-all` — specify exact properties.

Full patterns with code for all four design styles: **references/09-hover-interactions.md**

## Build order (do not deviate)

Build one section at a time, check it in the browser before moving on. Skipping ahead always backfires — scroll math bugs are hard to debug on a half-built page.

1. **Scaffold** — Init project with user's chosen framework, install deps, set up fonts and SmoothScrollProvider wrapper.
2. **Design tokens** — Put the chosen style's shadow stack, color palette, and font variables in global CSS. Everything else pulls from these tokens.
3. **Navbar** — Build first so it's present during all section development. Include hamburger menu and responsive collapse from the start — don't add mobile nav as an afterthought.
4. **Primitives** — Build `AnimatedSection`, `AnimatedItem`, `Button`, `EyebrowBadge`. Every section reuses them.
5. **Canvas sections** — One per animated section from intake Block 2. Wire up the video source from Block 4. Test on mobile (DPR scaling, 1.3× zoom, reduced height) before moving on.
6. **Content sections** — One by one, in the order from intake Block 2. Each gets full responsive treatment as it's built — not deferred to step 8.
7. **Final CTA** — SVG path animation or dramatic reveal.
8. **Responsive pass** — Full review at 375px, 768px, 1440px. Fix overflow, reduce padding, check font sizes, verify hamburger, test canvas on iOS Safari. See **references/08-responsive-design.md** checklist.
9. **Performance pass** — Lighthouse, RAF audit, canvas DPR, lazy loading. See checklist below.

The specific sections depend on the project type from intake question #3. An agency portfolio uses different sections than a SaaS landing page.

## Canvas scroll engine (the core technique)

This is the part that makes or breaks the site. Get it right and everything feels premium; get it wrong and it stutters.

### Structure

```tsx
<section style={{ height: "400vh" }} className="scroll-animation">
  <div className="sticky top-0 h-screen">
    <canvas ref={canvasRef} className="h-full w-full" />
    {/* Annotation cards positioned absolutely over the canvas */}
  </div>
</section>
```

- Outer section is `400vh` (or `500vh` for longer animations) — this creates the scroll distance.
- Inner wrapper is `sticky top-0 h-screen` — it pins to the viewport while the parent scrolls.
- Canvas fills the pinned wrapper. On mobile reduce to `350vh` / `300vh`.

### The four things the scroll handler does

1. **Compute progress** — `-rect.top / (section.offsetHeight - window.innerHeight)`, clamped 0–1.
2. **Seek video** — `video.currentTime = progress * video.duration` (or pick a frame index for the fallback engine).
3. **Draw with cover-fit** — Like CSS `object-fit: cover`, centered. On mobile, multiply width/height by 1.3 to zoom in.
4. **Toggle annotation cards** — Each card has a `show` and `hide` threshold; only call `setState` when the visible-set actually changes.

### Non-negotiable performance rules

- **requestAnimationFrame + ticking ref.** Never update canvas or DOM synchronously in the scroll handler.
- **Direct DOM for hot updates.** Canvas `drawImage`, text opacity — via refs, never React state.
- **DPR-aware canvas sizing.** `canvas.width = innerWidth * devicePixelRatio`, CSS size = `innerWidth + "px"`.
- **Passive scroll listeners.** `addEventListener("scroll", handler, { passive: true })`.
- **Video must preload.** Show a loading indicator until `canplaythrough` fires — a blank canvas looks broken.

Full code, video engine, and mobile handling: **references/03-scroll-animation-deep-dive.md**

## Smooth scroll (Lenis)

Wrap the app in a `SmoothScrollProvider` client component. Safari wants different settings (higher `lerp`, no `syncTouch`) or it stutters on iOS. Get this wrapper in place before building the hero; the scroll math feels different with Lenis vs. native.

## Framer Motion patterns (non-canvas animations)

The non-canvas sections use a small, consistent vocabulary:

- **AnimatedSection + AnimatedItem** — staggered scroll reveals with `whileInView`, `viewport={{ once: true, margin: "-100px" }}`, spring `{ stiffness: 100, damping: 20 }`.
- **Infinite rotations** — orbit badges, background animations (`animate={{ rotate: 360 }}`, `repeat: Infinity`, `ease: "linear"`).
- **AnimatePresence** — FAQ accordions, modals, cards that mount/unmount.
- **CSS 3D cubes** — small decorative elements use `perspective` + `transformStyle: "preserve-3d"`. Framer Motion animates `rotateX` / `rotateY` cleanly.
- **SVG path animations** — dots travel along paths via `offset-path` + `offset-distance`.

Full catalog with code: **references/02-animation-techniques.md**

## Component architecture

```
src/
├── app/ (or pages/, depending on framework)
│   ├── layout.tsx          ← fonts, providers, global scripts
│   ├── page.tsx            ← composes sections in order
│   └── globals.css         ← tokens, utility classes
├── components/
│   ├── sections/           ← one file per page section
│   ├── ui/                 ← AnimatedSection, Button, EyebrowBadge, decorative assets
│   └── providers/          ← SmoothScrollProvider, and any modal/context providers
└── lib/
    └── (integrations — booking, analytics, etc.)
public/
└── videos/                 ← animation video files (e.g. hero.mp4, tunnel.mp4)
```

- Every hook-using or Framer-using component needs `"use client"` (Next.js). Forgetting this is the #1 hydration bug.
- Keep section files focused. If a section grows past ~300 lines, split out visuals to `ui/`.

Full architecture notes: **references/05-component-architecture.md**

## Asset pipeline — creating animation videos

The default animation source is a single `.mp4` per section (specified in intake Block 4).

**Recommended export settings:**
- Format: MP4 (H.264), also WebM (VP9) as fallback
- Duration: 4–8 seconds
- Resolution: 1920×1080 (desktop), 1280×720 if file size is a concern
- Compression: target 5–15 MB per video (`ffmpeg -crf 28`)
- No audio needed

**Tools for creating the animation:** Blender, Cinema 4D, After Effects, CapCut, DaVinci Resolve — any tool that can export a video file.

**Fallback — image sequence:** if the user has no video but has 100+ numbered frames (from a previous project or stock site), use the frame-sequence engine from `references/03-scroll-animation-deep-dive.md`. Ask the user for the frame directory path and naming pattern.

## Checklists

### Responsive checklist (run before step 9)

- [ ] No horizontal scroll at 375px, 768px, 1440px (use `overflow: clip` on body — not `overflow-x: hidden`, which breaks sticky)
- [ ] Every grid collapses to single column on mobile
- [ ] Section padding reduced on mobile (`py-16 md:py-32`)
- [ ] Hamburger menu visible and working on mobile
- [ ] Desktop nav hidden on mobile (`hidden md:flex`)
- [ ] All tap targets ≥ 44×44px
- [ ] Canvas section heights: `400vh → 350vh → 300vh`
- [ ] Canvas 1.3× mobile zoom applied
- [ ] Annotation cards not overlapping on mobile
- [ ] iOS Safari tested (smooth scroll, canvas)
- [ ] Fonts ≥ 16px on mobile (no iOS auto-zoom on inputs)
- [ ] Hover states don't break layout on touch devices (no stuck hover states)

Full responsive patterns and testing guide: **references/08-responsive-design.md**

### Performance checklist (step 9)

- [ ] Video preloads before animation is interactive (loading indicator shown)
- [ ] Scroll handler uses RAF + ticking ref
- [ ] Canvas scaled for `devicePixelRatio` (no blur on retina)
- [ ] Canvas updates via direct DOM refs, not React state
- [ ] Visible-card set only calls `setState` when set actually changes
- [ ] Passive scroll listeners everywhere
- [ ] Lenis configured with Safari-safe defaults
- [ ] Production build tested — some bugs only appear after `next build`
- [ ] Lighthouse: aim 85+ desktop, 70+ mobile
- [ ] Every button, card, and link has a hover + focus-visible state (see `references/09-hover-interactions.md`)
- [ ] No `transition-all` — only specific properties

Full performance deep-dive: **references/06-performance-optimization.md**

## Common pitfalls (check these first when things break)

1. **Missing `"use client"`** (Next.js) — any component using hooks or Framer Motion needs it. Symptom: hydration mismatch.
2. **Phosphor icons in server components** — use `@phosphor-icons/react/dist/ssr`. Symptom: build fails.
3. **Video not ready on first scroll** — blank canvas. Fix: wait for `canplaythrough` event before enabling scroll handler.
4. **React state on scroll value** — jank, high CPU. Fix: use refs and update DOM directly.
5. **Canvas blurry on retina** — missed DPR scaling. Fix: multiply `canvas.width`/`height` by `devicePixelRatio`.
6. **Safari smooth-scroll stutter** — Lenis defaults don't suit iOS. Fix: `lerp: 0.1`, `syncTouch: false`.
7. **`overflow-x: hidden` on `body` breaks `position: sticky`** — the canvas section stops pinning. Fix: use `overflow: clip` instead — it clips overflow without creating a scroll container, so sticky still works.
8. **Mobile nav not implemented** — desktop links on a 375px screen look broken. Always build the hamburger at step 3, not later.
9. **`python -m http.server` breaks video scrubbing (Vanilla only)** — it doesn't support HTTP Range requests → `video.currentTime` has no effect → canvas never updates. Fix: use `npx serve .` instead.
10. **`gsap.from()` instead of `gsap.fromTo()`** — `gsap.from()` reads the current computed state as the end state. If CSS doesn't have `opacity: 0` explicitly, the animation either doesn't play or snaps on completion. Always use `gsap.fromTo()` with explicit from and to values.
11. **`gsap.registerPlugin(ScrollTrigger)` called multiple times or inside functions** — causes unpredictable behaviour. Always register once at the top of the file, before any other GSAP code.
12. **TDZ with `const` in Vanilla JS** — if `seekTo` or `seeked` listeners reference `const video = ...` before the declaration line runs, you get `ReferenceError`. Always declare variables before the functions that use them. Structure: declare → assign handlers → call init.
13. **Hero nav + site header conflict** — a common pattern is: hero has its own inline nav (visible while hero is on screen), and a fixed site header appears after hero scrolls out. Show/hide condition: `section.getBoundingClientRect().bottom <= window.innerHeight` means hero has left the viewport — show site header, hide hero nav. Wire this check inside the same scroll handler as the canvas scrub.

## References index

- `references/01-tech-stack.md` — Stack options (Next.js / Vite / Remix / Astro / Vanilla), install commands, font setup
- `references/02-animation-techniques.md` — Every non-canvas animation pattern with code
- `references/03-scroll-animation-deep-dive.md` — Video engine, frame-sequence fallback, scroll math, mobile handling
- `references/04-design-patterns.md` — Four design styles with token sets (neumorphic / glassmorphic / minimal / dark)
- `references/05-component-architecture.md` — File layout, reusable components, SSR rules
- `references/06-performance-optimization.md` — RAF, direct DOM, preloading, hardware acceleration
- `references/07-claude-code-guide.md` — Effective prompting, CLAUDE.md usage, setup walkthrough
- `references/08-responsive-design.md` — Breakpoints, hamburger nav, canvas mobile, responsive checklist
- `references/09-hover-interactions.md` — Premium hover patterns for buttons, cards, links across all 4 styles

Read the relevant reference file when the section you're working on touches its topic. Do not read all of them up-front — pull them in on demand.

## One more thing

Run the intake questions first. Build in the order given. Check each section in the browser before moving to the next. When something feels off, diagnose against the rules in this doc before reaching for clever workarounds — nine times out of ten the fix is already listed above.