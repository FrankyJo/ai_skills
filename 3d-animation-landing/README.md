# 3D Animation Landing — Claude Code Skill

A Claude Code skill for building premium scroll-animated landing pages from scratch. Handles the full pipeline: intake questions, framework setup, canvas video engine, design system, responsive layout, and performance hardening.

---

## What it does

- Asks 4 intake questions before writing any code (stack, design style, site structure, video paths)
- Scaffolds the project for the chosen framework
- Builds a sticky canvas section that scrubs a `.mp4` video as the user scrolls — the "3D feel" without WebGL
- Applies one of four configurable design systems (Neumorphic Light, Glassmorphic Dark, Minimal, Dark Premium)
- Builds every section responsive-first with a hamburger nav and mobile canvas adjustments
- Runs a responsive pass (375px / 768px / 1440px) and a performance pass (RAF, DPR, Lighthouse) before calling the site done

---

## Install

```bash
git clone https://github.com/FrankyJo/ai_skills ~/ai_skills && cp -r ~/ai_skills/3d-animation-landing ~/.claude/skills/
```

Start a new Claude Code conversation — the skill loads automatically.

**To update:**

```bash
git -C ~/ai_skills pull && cp -r ~/ai_skills/3d-animation-landing ~/.claude/skills/
```

---

## How to use

The skill activates automatically in Claude Code when you describe a relevant task. No manual command needed.

**Trigger phrases** (any of these will activate the skill):

- "build a landing page"
- "scroll animation" / "scroll-animated site"
- "canvas animation on scroll"
- "3D website" / "3D hero"
- "premium landing page" / "agency-style site"
- "sticky canvas" / "frame sequence"
- "animated website"

Once activated, Claude will send you one message with all intake questions. Answer them and the build begins.

---

## Intake questions

Claude asks these before writing a single line of code:

**Block 1 — Tech & Design**
- Which framework? (Next.js / Vite+React / Remix / Astro / Vanilla HTML/CSS/JS)
- Which design style? (Neumorphic Light / Glassmorphic Dark / Minimal / Dark Premium)

**Block 2 — Site Structure**
List sections in order. Mark animated ones with `(3D animation)`:
```
Section 1: Hero (3D animation)
Section 2: Services
Section 3: Projects
Section 4: FAQ
Section 5: Contact / CTA
```

**Block 3 — Content**
- Generate copy automatically (describe the site topic)
- Or provide copy yourself section by section

**Block 4 — Animation Sources** *(only if Block 2 has animated sections)*
```
Section Hero     → public/videos/hero.mp4
Section Projects → public/videos/tunnel.mp4
```

---

## Design styles

| Style | Background | Cards | Accents |
| ----- | ---------- | ----- | ------- |
| Neumorphic Light | `#f5f5f5` grey | White, 7-layer shadow | Indigo / Violet |
| Glassmorphic Dark | `#0a0a0f` near-black | Frosted glass | Indigo glow |
| Minimal | `#ffffff` white | Border only, no shadow | Single brand color |
| Dark Premium | `#0d0d0d` deep black | Subtle border + deep shadow | Gradient text |

Full token sets in `references/04-design-patterns.md`.

---

## Supported stacks

| Stack | Animation library | Smooth scroll |
| ----- | ----------------- | ------------- |
| Next.js App Router | Framer Motion | Lenis |
| Vite + React | Framer Motion | Lenis |
| Remix | Framer Motion | Lenis |
| Astro | Framer Motion (islands) | Lenis |
| Vanilla HTML/CSS/JS | GSAP + ScrollTrigger | Lenis CDN |

---

## Canvas video engine

The scroll animation works like Apple's AirPods page — a video file plays frame-by-frame as the user scrolls:

```
video.currentTime = scrollProgress * video.duration
ctx.drawImage(video, x, y, w, h)  // cover-fit, DPR-scaled
```

**Prepare your video:**
- Format: MP4 (H.264) + WebM (VP9) fallback
- Duration: 4–8 seconds
- Resolution: 1920×1080
- Target size: 5–15 MB (`ffmpeg -crf 28`)
- Place in `public/videos/`

If you don't have a video, the skill falls back to a numbered image sequence (`frame_0001.jpg`, `frame_0002.jpg`, …).

---

## Reference files

| File | Contents |
| ---- | -------- |
| `references/01-tech-stack.md` | Setup commands for all 5 stacks |
| `references/02-animation-techniques.md` | Framer Motion patterns with code |
| `references/03-scroll-animation-deep-dive.md` | Full video engine + fallback frame engine |
| `references/04-design-patterns.md` | Token sets for all 4 design styles |
| `references/05-component-architecture.md` | File structure, SSR rules, naming |
| `references/06-performance-optimization.md` | RAF throttling, DPR, direct DOM |
| `references/07-claude-code-guide.md` | Effective prompting tips |
| `references/08-responsive-design.md` | Hamburger nav, canvas on mobile, responsive checklist |
| `references/09-hover-interactions.md` | Premium hovers for buttons, cards, links — all 4 styles |

---
---

# 3D Animation Landing — Навичка Claude Code

Навичка Claude Code для побудови преміум лендингів зі скрол-анімацією з нуля. Охоплює повний пайплайн: вхідні запитання, налаштування фреймворку, canvas відео-рушій, систему дизайну, адаптивну верстку та оптимізацію продуктивності.

---

## Що вона робить

- Ставить 4 вхідні запитання перед написанням будь-якого коду (стек, стиль дизайну, структура сайту, шляхи до відео)
- Скаффолдить проєкт під обраний фреймворк
- Будує sticky canvas-секцію, яка прокручує `.mp4` відео разом зі скролом — ефект "3D" без WebGL
- Застосовує одну з чотирьох дизайн-систем (Neumorphic Light, Glassmorphic Dark, Minimal, Dark Premium)
- Верстає кожну секцію адаптивно з гамбургер-меню та мобільними налаштуваннями canvas
- Проводить адаптивний прохід (375px / 768px / 1440px) і прохід продуктивності (RAF, DPR, Lighthouse) перед фіналізацією

---

## Встановлення

```bash
git clone https://github.com/FrankyJo/ai_skills ~/ai_skills && cp -r ~/ai_skills/3d-animation-landing ~/.claude/skills/
```

Почни нову розмову в Claude Code — навичка завантажиться автоматично.

**Оновлення:**

```bash
git -C ~/ai_skills pull && cp -r ~/ai_skills/3d-animation-landing ~/.claude/skills/
```

---

## Як користуватись

Навичка активується автоматично в Claude Code, коли ти описуєш відповідну задачу. Ручна команда не потрібна.

**Фрази-тригери** (будь-яка з них активує навичку):

- «зроби лендинг» / «збудуй сайт»
- «скрол-анімація» / «анімований сайт»
- «canvas анімація при скролі»
- «3D сайт» / «3D hero»
- «преміум лендинг» / «сайт в стилі агентства»
- «sticky canvas» / «frame sequence»
- «анімований вебсайт»

Після активації Claude надішле одне повідомлення з усіма вхідними запитаннями. Дай відповіді — і збірка починається.

---

## Вхідні запитання

Claude ставить їх перед написанням будь-якого рядка коду:

**Блок 1 — Технології та дизайн**
- Який фреймворк? (Next.js / Vite+React / Remix / Astro / Vanilla HTML/CSS/JS)
- Який стиль дизайну? (Neumorphic Light / Glassmorphic Dark / Minimal / Dark Premium)

**Блок 2 — Структура сайту**
Перерахуй секції по порядку. Анімовані познач `(3D animation)`:
```
Секція 1: Hero (3D animation)
Секція 2: Послуги
Секція 3: Проєкти
Секція 4: FAQ
Секція 5: Контакти / CTA
```

**Блок 3 — Контент**
- Генерувати автоматично (опиши тему сайту)
- Або надати текст самостійно — секцію за секцією

**Блок 4 — Джерела анімацій** *(тільки якщо в Блоці 2 є анімовані секції)*
```
Секція Hero     → public/videos/hero.mp4
Секція Проєкти  → public/videos/tunnel.mp4
```

---

## Стилі дизайну

| Стиль | Фон | Картки | Акценти |
| ----- | --- | ------ | ------- |
| Neumorphic Light | `#f5f5f5` сірий | Білі, 7-шарова тінь | Indigo / Violet |
| Glassmorphic Dark | `#0a0a0f` майже чорний | Матове скло | Indigo glow |
| Minimal | `#ffffff` білий | Тільки рамка, без тіні | Один колір бренду |
| Dark Premium | `#0d0d0d` глибокий чорний | Тонка рамка + глибока тінь | Градієнтний текст |

Повні набори токенів у `references/04-design-patterns.md`.

---

## Підтримувані стеки

| Стек | Бібліотека анімацій | Плавний скрол |
| ---- | ------------------- | ------------- |
| Next.js App Router | Framer Motion | Lenis |
| Vite + React | Framer Motion | Lenis |
| Remix | Framer Motion | Lenis |
| Astro | Framer Motion (islands) | Lenis |
| Vanilla HTML/CSS/JS | GSAP + ScrollTrigger | Lenis CDN |

---

## Canvas відео-рушій

Скрол-анімація працює як сторінка AirPods від Apple — відеофайл програється кадр за кадром під час скролу:

```
video.currentTime = scrollProgress * video.duration
ctx.drawImage(video, x, y, w, h)  // cover-fit, DPR-масштабування
```

**Підготуй своє відео:**
- Формат: MP4 (H.264) + WebM (VP9) як запасний варіант
- Тривалість: 4–8 секунд
- Роздільна здатність: 1920×1080
- Цільовий розмір: 5–15 МБ (`ffmpeg -crf 28`)
- Розташуй у `public/videos/`

Якщо відео немає — навичка переходить на пронумеровану послідовність зображень (`frame_0001.jpg`, `frame_0002.jpg`, …).

---

## Довідкові файли

| Файл | Вміст |
| ---- | ----- |
| `references/01-tech-stack.md` | Команди налаштування для всіх 5 стеків |
| `references/02-animation-techniques.md` | Патерни Framer Motion з кодом |
| `references/03-scroll-animation-deep-dive.md` | Повний відео-рушій + запасний рушій на кадрах |
| `references/04-design-patterns.md` | Набори токенів для всіх 4 стилів дизайну |
| `references/05-component-architecture.md` | Структура файлів, правила SSR, іменування |
| `references/06-performance-optimization.md` | RAF throttling, DPR, пряма робота з DOM |
| `references/07-claude-code-guide.md` | Поради щодо ефективних промптів |
| `references/08-responsive-design.md` | Гамбургер-меню, canvas на мобільному, чеклісти |
