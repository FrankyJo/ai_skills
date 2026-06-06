# 03 — Scroll Animation Deep Dive

Scroll-driven canvas animations: the video plays as the user scrolls. This document covers the video-driven engine (default) and the frame-sequence fallback.

---

## Architecture Overview

Every scroll animation section follows the same structure:

1. **Tall section** (400–500vh) creates scroll distance
2. **Sticky viewport** (100vh) pins to screen while scrolling
3. **Canvas** renders the current animation frame based on scroll progress
4. **Annotation cards** appear/disappear at specific scroll thresholds

The animation source is either:
- **Video file** (default) — one `.mp4` per section, path comes from intake Block 4
- **Image sequence** (fallback) — 100+ numbered JPGs, used only when no video is available

---

## Video-Driven Canvas Engine (Default)

Use this whenever the user provides a video path in intake Block 4.

### Core approach

A hidden `<video>` element preloads the file. On every scroll tick the handler seeks to the target time via a **seek queue** (not a direct `currentTime` assignment), then draws `drawImage(video, ...)` in the `seeked` event callback. The result is identical to the frame-sequence approach but requires only one file.

### DO NOT use `requestVideoFrameCallback` (rVFC) for scrubbing

rVFC is designed for playback, not seeking. During `seeking`, it fires on partially decoded frames → visible glitches. Use the `seeked` event instead (see component pattern below).

### Scroll handler: always `window.addEventListener`, never `lenis.on('scroll')`

When Lenis is active, `lenis.on('scroll')` fires inside the GSAP ticker — nesting a RAF inside it is unreliable. For canvas scrubbing always use:

```js
window.addEventListener('scroll', handler, { passive: true });
```

### Full component pattern

```tsx
"use client";
import { useEffect, useRef } from "react";

const VIDEO_SRC = "/videos/hero.mp4"; // ← from intake Block 4
const SECTION_HEIGHT = "400vh";

export default function HeroCanvas() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const tickingRef  = useRef(false);
  const readyRef    = useRef(false);

  // Preload video
  useEffect(() => {
    const video = document.createElement("video");
    video.src       = VIDEO_SRC;
    video.muted     = true;
    video.playsInline = true;
    video.preload   = "auto";

    video.addEventListener("canplaythrough", () => {
      readyRef.current = true;
      // Draw first frame immediately
      drawFrame(0);
    }, { once: true });

    videoRef.current = video;
  }, []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Seek queue — prevents concurrent seeks and unpredictable browser behaviour
  const isSeekingRef = useRef(false);
  const nextTimeRef  = useRef<number | null>(null);

  const drawCurrentFrame = () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video || !readyRef.current) return;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"; // critical on Mac Retina — canvas is 2880px, video 1920px

    const cw = canvas.width, ch = canvas.height;
    const vRatio = video.videoWidth / video.videoHeight;
    const cRatio = cw / ch;
    let dw: number, dh: number;

    if (cRatio > vRatio) { dw = cw; dh = cw / vRatio; }
    else                  { dh = ch; dw = ch * vRatio; }

    if (window.innerWidth <= 768) { dw *= 1.3; dh *= 1.3; }

    ctx.drawImage(video, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video || !readyRef.current) return;

    if (isSeekingRef.current) {
      nextTimeRef.current = time; // queue the latest target, drop intermediates
      return;
    }
    isSeekingRef.current = true;
    video.currentTime = time;
  };

  // Draw after seek completes — avoids glitched partial frames
  useEffect(() => {
    const video = videoRef.current!;
    const onSeeked = () => {
      drawCurrentFrame();
      if (nextTimeRef.current !== null) {
        const t = nextTimeRef.current;
        nextTimeRef.current = null;
        video.currentTime = t; // drain queue
      } else {
        isSeekingRef.current = false;
      }
    };
    video?.addEventListener("seeked", onSeeked);
    return () => video?.removeEventListener("seeked", onSeeked);
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) { tickingRef.current = false; return; }

        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

        seekTo(progress * (videoRef.current?.duration ?? 0));

        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} style={{ height: SECTION_HEIGHT }} className="scroll-animation">
      <div
        className="sticky top-0 h-screen"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ willChange: "contents", transform: "translateZ(0)" }}
        />
        {/* Annotation cards go here as absolutely positioned children */}
      </div>
    </section>
  );
}
```

### Video preparation tips

- **Format:** MP4 (H.264) for maximum compatibility. Also export WebM (VP9) as a `<source>` fallback.
- **Duration:** 4–8 seconds is ideal. Longer = more scrub resolution, bigger file.
- **Resolution:** 1920×1080 for desktop. Reduce to 1280×720 for smaller file size.
- **Compression:** Target 5–15 MB. Use HandBrake or `ffmpeg -crf 28` for aggressive compression without visible quality loss.
- **No audio needed** — `muted` is always set.

### `ffmpeg` one-liner for web-optimized output

The `-g 1` flag is **critical for scrubbing** — it forces a keyframe on every frame so the browser can seek to any point instantly. Without it the browser must decode from the previous keyframe → visible lag on fast scrolls.

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -g 1 -pix_fmt yuv420p -movflags faststart output.mp4
ffmpeg -i input.mp4 -vcodec libvpx-vp9 -crf 35 -g 1 -b:v 0 output.webm
```

> `-g 1` increases file size by ~30–50% compared to normal encoding. That is expected and acceptable — the alternative is a laggy scrub.

### Loading state for video

Show a loading indicator while `canplaythrough` hasn't fired yet:

```tsx
const [ready, setReady] = useState(false);

video.addEventListener("canplaythrough", () => setReady(true), { once: true });

// In JSX:
{!ready && (
  <div className="absolute inset-0 flex items-center justify-center bg-background">
    <div className="h-1 w-48 rounded-full bg-zinc-200 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse" />
    </div>
  </div>
)}
```

---

## Frame-Sequence Engine (Fallback)

Use this only when the user does **not** have a video file and provides 100+ numbered JPG/PNG frames instead.

### Frame preloading

```tsx
const FRAME_COUNT = 106;

useEffect(() => {
  let loadedCount = 0;
  const imgs: HTMLImageElement[] = [];

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
  framesRef.current = imgs;
}, []);
```

### Frame selection

```tsx
const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
const img = framesRef.current[frameIndex];
ctx.drawImage(img, drawX, drawY, drawW, drawH);
```

The cover-fit drawing math and DPR scaling are identical to the video engine above.

---

## Hero Section

**File:** `src/components/sections/Hero.tsx`
**Frames:** 106 JPGs in `/public/frames/frame_0001.jpg` to `frame_0106.jpg`

### Section Height
```tsx
<section style={{ height: "400vh" }}>
  <div className="sticky top-0 h-screen">
    <canvas />
  </div>
</section>
```

Responsive heights via CSS:
```css
@media (max-width: 1024px) { .scroll-animation { height: 350vh !important; } }
@media (max-width: 768px)  { .scroll-animation { height: 300vh !important; } }
```

### Frame Preloading

All 106 frames are preloaded before the animation starts:

```tsx
const FRAME_COUNT = 106;

useEffect(() => {
  let loadedCount = 0;
  const imgs: HTMLImageElement[] = [];

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `/frames/frame_${String(i).padStart(4, "0")}.jpg`;
    img.onload = () => {
      loadedCount++;
      setLoadProgress(loadedCount / FRAME_COUNT);  // drives loading bar
      if (loadedCount === FRAME_COUNT) setLoaded(true);
    };
    imgs.push(img);
  }
  framesRef.current = imgs;
}, []);
```

A loading overlay shows progress until all frames are loaded.

### Scroll Progress Calculation

```tsx
const rect = section.getBoundingClientRect();
const scrollableHeight = section.offsetHeight - window.innerHeight;
const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));
```

- `rect.top` — distance from section top to viewport top (negative when scrolled past)
- `scrollableHeight` — total scrollable distance (400vh - 100vh = 300vh)
- `progress` — normalized 0 to 1

### Frame Selection

```tsx
const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
```

- progress `0.0` → frame 0
- progress `0.5` → frame 53
- progress `1.0` → frame 105

### Canvas Drawing (Cover-Fit)

The `drawFrame` function implements cover-fit scaling (like CSS `object-fit: cover`):

```tsx
const drawFrame = (index: number) => {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = cw / ch;

  if (window.innerWidth > 768) {
    // Desktop: standard cover-fit
    if (canvasRatio > imgRatio) {
      drawW = cw; drawH = cw / imgRatio;
    } else {
      drawH = ch; drawW = ch * imgRatio;
    }
  } else {
    // Mobile: cover-fit + 1.3x zoom
    // ... same cover-fit logic, then:
    drawW *= 1.3;
    drawH *= 1.3;
  }

  drawX = (cw - drawW) / 2;  // center horizontally
  drawY = (ch - drawH) / 2;  // center vertically
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
};
```

### Canvas DPI Scaling

For crisp rendering on retina displays:

```tsx
const resizeCanvas = () => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;    // internal resolution
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";   // display size
  canvas.style.height = window.innerHeight + "px";
};
```

### Hero Text Fade

The hero text fades out in the first 8% of scroll:

```tsx
if (heroTextRef.current) {
  const opacity = Math.max(0, 1 - progress / 0.08);
  heroTextRef.current.style.opacity = String(opacity);
}
```

- progress `0.00` → opacity `1.0` (fully visible)
- progress `0.04` → opacity `0.5`
- progress `0.08` → opacity `0.0` (fully hidden)

### Annotation Cards — Visibility Zones

Each card has a `show` and `hide` threshold:

```tsx
const annotations = [
  { id: "card-1", show: 0.10, hide: 0.30 },  // visible 10%-30% scroll
  { id: "card-2", show: 0.35, hide: 0.55 },  // visible 35%-55% scroll
  { id: "card-3", show: 0.60, hide: 0.80 },  // visible 60%-80% scroll
];
```

Cards use CSS transitions (not Framer Motion) for performance:
```tsx
className={`transition-all duration-400 ${
  visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
}`}
```

---

## ProjectsShowcase — Tunnel Animation

**File:** `src/components/sections/ProjectsShowcase.tsx`
**Frames:** 97 JPGs in `/public/tunnel-frames/frame_0001.jpg` to `frame_0097.jpg`

### Differences from Hero

| Aspect | Hero | ProjectsShowcase |
|--------|------|-----------------|
| Section height | 400vh | 500vh |
| Frame count | 106 | 97 |
| Mobile zoom | 1.3x | 1.3x |
| Cards | 3 annotation cards | 5 project cards |
| Background | Light (#f5f5f5) | Dark (zinc-950) |
| CTA overlay | None | Appears at 82% |

### Intro Text Fade

Fades in the first 6% of scroll (faster than hero):

```tsx
const newIntroOpacity = Math.max(0, 1 - progress / 0.06);
```

### Project Card Zones

5 project cards with tighter spacing:

```tsx
const projects = [
  { show: 0.04, hide: 0.17 },  // Project 1
  { show: 0.20, hide: 0.33 },  // Project 2
  { show: 0.36, hide: 0.49 },  // Project 3
  { show: 0.52, hide: 0.64 },  // Project 4
  { show: 0.67, hide: 0.78 },  // Project 5
];
```

### CTA Overlay

A "Book a Free Call" overlay appears at the end:

```tsx
const shouldShowCta = progress >= 0.82;
```

### Optimized State Updates

Only triggers React re-render when the visible card set actually changes:

```tsx
const newIds = [...newVisible].sort().join(",");
if (newIds !== prevVisibleIdsRef.current) {
  prevVisibleIdsRef.current = newIds;
  setVisibleCards(newVisible);  // only re-renders when set changes
}
```

---

## Scroll Handler Pattern (Both Sections)

The scroll handler follows this optimized pattern:

```
User scrolls
  → scroll event fires
  → check tickingRef (already processing?)
  → if not ticking, set ticking = true
  → requestAnimationFrame(() => {
      calculate progress
      update canvas frame (direct DOM)
      update text opacity (direct DOM via ref)
      update visible cards (React state, only if changed)
      set ticking = false
    })
```

This ensures:
- Only one RAF callback queued at a time
- Canvas and opacity updates bypass React
- React state only updates when visibility actually changes
- Scroll events don't stack up and cause jank

---

## Creating Your Own Frame Sequences

To create frame sequences for scroll animations:

1. **Design the animation** in After Effects, Blender, or any 3D tool
2. **Export as image sequence** — JPG for photos, PNG for transparency
3. **Naming convention:** `frame_0001.jpg`, `frame_0002.jpg`, etc.
4. **Recommended:** 60-120 frames for smooth scroll playback
5. **Resolution:** Match your target viewport (1920x1080 for desktop)
6. **Compression:** JPG quality 80-85% balances size vs. quality
7. **Place in** `/public/frames/` or similar directory
