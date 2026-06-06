# 06 — Performance Optimization

How we keep 200+ frame images and complex animations running at 60fps.

---

## 1. RequestAnimationFrame Throttling

The scroll handler uses a "ticking" pattern to prevent multiple RAF callbacks from stacking:

```tsx
const tickingRef = useRef(false);

const handleScroll = () => {
  if (tickingRef.current) return;     // already processing — skip
  tickingRef.current = true;

  requestAnimationFrame(() => {
    // ... do expensive work (canvas draw, opacity updates) ...
    tickingRef.current = false;       // ready for next frame
  });
};

window.addEventListener("scroll", handleScroll, { passive: true });
```

**Why:** Without throttling, a single scroll gesture can fire 30+ events per frame. Each would queue a separate RAF callback, causing jank. The ticking ref ensures only one callback runs per animation frame.

---

## 2. Direct DOM Manipulation via Refs

React re-renders are expensive during rapid scroll events. For properties that change every frame, we bypass React entirely:

### Hero Text Opacity
```tsx
const heroTextRef = useRef<HTMLDivElement>(null);

// Inside scroll handler (NOT useState):
if (heroTextRef.current) {
  const opacity = Math.max(0, 1 - progress / 0.08);
  heroTextRef.current.style.opacity = String(opacity);
}
```

### Intro Overlay Opacity (ProjectsShowcase)
```tsx
const introOverlayRef = useRef<HTMLDivElement>(null);
const introOpacityRef = useRef(1);

// Only update DOM when value actually changes (>0.01 threshold)
const newIntroOpacity = Math.max(0, 1 - progress / 0.06);
if (Math.abs(newIntroOpacity - introOpacityRef.current) > 0.01) {
  introOpacityRef.current = newIntroOpacity;
  introOverlayRef.current.style.opacity = String(newIntroOpacity);
}
```

**Rule of thumb:** If a value changes on every scroll tick, use refs. If it changes at discrete thresholds, React state is fine.

---

## 3. Optimized React State Updates

For card visibility (which has discrete states), we only call setState when the visible set actually changes:

```tsx
const prevVisibleIdsRef = useRef("");

// Build new visible set
const newIds = [...newVisible].sort().join(",");
if (newIds !== prevVisibleIdsRef.current) {
  prevVisibleIdsRef.current = newIds;
  setVisibleCards(newVisible);  // React re-render only when needed
}
```

Similarly for the CTA:
```tsx
setCtaVisible((prev) => (prev === shouldShowCta ? prev : shouldShowCta));
```

---

## 4. Frame Preloading

All frames are loaded before the animation section becomes interactive:

```tsx
for (let i = 1; i <= FRAME_COUNT; i++) {
  const img = new Image();
  img.src = `/frames/frame_${String(i).padStart(4, "0")}.jpg`;
  img.onload = () => {
    loadedCount++;
    setLoadProgress(loadedCount / FRAME_COUNT);
    if (loadedCount === FRAME_COUNT) setLoaded(true);
  };
  imgs.push(img);
}
```

A loading overlay with progress bar covers the page until all frames are ready. This prevents:
- Blank frames during scroll
- Janky loading mid-animation
- Layout shifts

---

## 5. Hardware Acceleration

Apply GPU hints **only on the canvas itself**, not on the sticky parent container:

```tsx
<div className="sticky top-0 h-screen">
  {/* NO will-change here — wrong GPU layer on Mac Retina → blur */}
  <canvas
    style={{
      willChange: "contents",
      transform: "translateZ(0)", // GPU layer on the canvas only
    }}
  />
</div>
```

| Property | Where | Effect |
|----------|-------|--------|
| `will-change: contents` | canvas only | Hints that pixel content will change frequently |
| `transform: translateZ(0)` | canvas only | Promotes canvas to its own GPU layer |
| ~~`will-change: transform`~~ | ~~sticky parent~~ | **Do not use** — creates a GPU layer at the wrong resolution on Mac Retina, causing blur |

**Why the parent must not have `will-change: transform`:** On Mac Retina the sticky container is a CSS stacking context. Adding `will-change` promotes it at the logical resolution (1440px), not the physical one (2880px). The canvas inside inherits this context → blurry output even with correct DPR scaling.

**Caution:** Each promoted layer consumes GPU memory. Only apply to elements that genuinely change every frame.

---

## 6. Passive Event Listeners

All scroll listeners use `{ passive: true }`:

```tsx
window.addEventListener("scroll", handleScroll, { passive: true });
```

**Why:** A passive listener tells the browser "this handler won't call `preventDefault()`", allowing the browser to start scrolling immediately without waiting for the handler to execute. This eliminates scroll delay.

---

## 7. Canvas DPI Scaling + Image Smoothing

Render at the device's native resolution for crisp display:

```tsx
const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;     // internal resolution (e.g., 2880 on retina)
canvas.height = window.innerHeight * dpr;
canvas.style.width = window.innerWidth + "px";   // display size (e.g., 1440px)
canvas.style.height = window.innerHeight + "px";
```

On a 2x retina display:
- Internal canvas: 2880x1800 pixels
- Display size: 1440x900 CSS pixels
- Video source: typically 1920x1080

Because the canvas is physically larger than the video, the browser scales up. Without `imageSmoothingQuality = 'high'` the upscale is blurry. **Always set this after getting the context:**

```tsx
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high"; // must set — default is "low"
```

Set it once after `getContext` and again after any `canvas.width` / `canvas.height` resize — resizing resets canvas state including smoothing settings.

---

## 8. Lazy Loading External Scripts

Calendly widget script loads after the page is interactive:

```tsx
<Script
  src="https://assets.calendly.com/assets/external/widget.js"
  strategy="lazyOnload"
/>
```

`lazyOnload` = loads after the page's `load` event, when the browser is idle. This prevents the script from competing with critical rendering resources.

---

## 9. CSS Transitions Over Framer Motion for Scroll

Annotation cards use CSS transitions instead of Framer Motion for performance:

```tsx
// CSS transition (fast, no JS overhead):
className={`transition-all duration-400 ${
  visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
}`}

// vs. Framer Motion (more expressive, but heavier):
// <motion.div animate={{ opacity: visible ? 1 : 0 }} />
```

For elements that toggle during scroll (many times per second), CSS transitions are lighter than Framer Motion's animation loop.

---

## Performance Checklist

- [ ] Scroll handlers use RAF throttling with ticking ref
- [ ] Frequently-changing values use refs, not useState
- [ ] React state only updates when values actually change
- [ ] Frames are preloaded before animation starts
- [ ] Canvas has `will-change: contents` + `transform: translateZ(0)` — **not** the sticky parent
- [ ] `ctx.imageSmoothingQuality = "high"` set after `getContext` and after every resize
- [ ] Scroll listeners are passive
- [ ] Canvas scales for device pixel ratio
- [ ] Third-party scripts use `lazyOnload` strategy
- [ ] Scroll-toggled elements use CSS transitions, not Framer Motion
