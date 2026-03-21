# RogueVerge Motion Animations Design Spec

## Overview

Add four new animation systems to RogueVerge, enhancing the cyberpunk aesthetic with physics-based interactions and scroll-driven reveals. All animations respond to the global dormant/awakened state toggle.

**Tech split:**
- Motion (motion.dev) — Magnetic Field, Spring Physics
- GSAP (existing) — Cascade Reveal, Liquid Morph

**Target:** Desktop-first. Mobile devices get graceful degradation (simpler or disabled animations).

---

## Migration Prerequisites

Before implementing any new animation, complete these migrations:

### 1. Remove `useTilt.js` — replaced by Magnetic Field

The Relics page currently has a `useTilt` hook (`src/hooks/useTilt.js`) that applies `perspective() rotateX() rotateY()` via direct DOM style mutation on `mousemove`. This overlaps entirely with the Magnetic Field animation. Keeping both would produce double-transform conflicts on the same elements.

**Action:** Delete `src/hooks/useTilt.js` and remove all `useTilt` usage from `src/components/pages/Relics.jsx` before adding `MagneticWrapper`.

### 2. Migrate `framer-motion` to `motion`

`DecryptedText.jsx` imports `motion.span` from `framer-motion`. The project previously removed most framer-motion usage (commit `837ffb7`) but this import remains.

**Action:** Replace `import { motion } from "framer-motion"` with `import { motion } from "motion/react"` in `DecryptedText.jsx`. Verify no other `framer-motion` imports exist. Remove `framer-motion` from `package.json` after adding `motion`.

### 3. Wire `isAwakened` to child pages

Currently `App.jsx` does not pass the awakened state to `Relics` or `Codex`:
```jsx
{currentPage === 'codex' && <Codex lang={language} />}
{currentPage === 'relics' && <Relics onItemClick={handleRelicClick} lang={language} />}
```

**Action:** Pass `isAwakened` prop to `Relics`, `Codex`, and any component that needs dual-state animation parameters. Alternatively, expose it via a lightweight React context if prop-drilling gets excessive.

---

## Global: Dual-State System

All four animations read from the existing awakened state (triggered by clicking the homepage statue image). The state is already managed in `App.jsx`.

| Aspect | Dormant | Awakened |
|--------|---------|----------|
| Color palette | Gray borders, muted tones | Red accents, glowing shadows |
| Motion feel | Heavy, dampened, restrained | Light, elastic, expressive |
| Blur/glow | None or minimal | Red text-shadow, box-shadow |
| Extra effects | None | Glitch flickers on reveal |

Components receive the `isAwakened` boolean and select their animation parameters accordingly. No additional global state is introduced.

---

## 1. Magnetic Field

**Library:** Motion (motion.dev)
**Location:** Relics page card grid
**Replaces:** `useTilt.js` (see Migration Prerequisites)
**Mobile:** Disabled entirely; cards are static with tap-to-reveal info

### Behavior

Each Relic card tracks cursor position relative to its own center. As the cursor moves over a card, the card tilts in 3D toward the cursor. On mouse leave, it springs back to flat (not linear snap — spring physics with overshoot).

### Parameters

| Parameter | Dormant | Awakened |
|-----------|---------|----------|
| Max tilt | 15deg | 25deg |
| Spring stiffness | 300 | 150 |
| Spring damping | 30 | 10 |
| Border color (hover) | `#555` | `#f05252` |
| Box shadow (hover) | none | `0 0 30px rgba(240,82,82,0.15)` |
| Glyph opacity (hover) | 0.15 | 0.35 |

### Motion API Usage

```jsx
// Per card component
const x = useMotionValue(0);
const y = useMotionValue(0);

const maxTilt = isAwakened ? 25 : 15;
const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

const springConfig = isAwakened
  ? { stiffness: 150, damping: 10 }
  : { stiffness: 300, damping: 30 };
const springRotateX = useSpring(rotateX, springConfig);
const springRotateY = useSpring(rotateY, springConfig);
```

### Mouse handler

```jsx
function handleMouseMove(e) {
  const rect = ref.current.getBoundingClientRect();
  x.set((e.clientX - rect.left) / rect.width - 0.5);
  y.set((e.clientY - rect.top) / rect.height - 0.5);
}

function handleMouseLeave() {
  x.set(0);
  y.set(0);
}
```

### Component structure

```
MagneticWrapper (new, wraps RelicCard)
├── motion.div (applies perspective + rotateX + rotateY)
└── children (existing RelicCard content, with useTilt removed)
```

`MagneticWrapper` accepts `isAwakened` and internally resolves `maxTilt`, `stiffness`, `damping` from it. Callers don't need to pass raw physics numbers.

### Touch device detection

Reuse the existing touch detection logic from `CustomCursor.jsx` (`@media (pointer: coarse)`). If touch device, `MagneticWrapper` renders a plain `div` with no motion.

---

## 2. Spring Physics

**Library:** Motion (motion.dev)
**Location:** Site-wide cards and buttons (Relics cards, Codex sections, CTA buttons)
**Mobile:** Disable spring displacement; retain CSS color transitions only

### Behavior

On hover, the element lifts upward with spring physics (overshoots then settles). A red top-line scales in from left with spring easing. Corner bracket borders transition gray to red. On mouse leave, springs back down.

### Parameters

| Parameter | Dormant | Awakened |
|-----------|---------|----------|
| Y displacement | -4px | -8px |
| Spring stiffness | 400 | 200 |
| Spring damping | 30 | 12 |
| Top line scaleX spring stiffness | 300 | 180 |
| Top line overshoot | minimal | visible (scaleX briefly > 1) |

### Motion API Usage

The top-line animation is driven by the parent's hover state, not its own `whileHover` (since the cursor is rarely directly over the 2px line element). Use `useAnimation` or a shared hover state:

```jsx
function SpringCard({ isAwakened, children }) {
  const [isHovered, setIsHovered] = useState(false);

  const yTarget = isAwakened ? -8 : -4;
  const springConfig = {
    type: "spring",
    stiffness: isAwakened ? 200 : 400,
    damping: isAwakened ? 12 : 30,
  };
  const lineSpringConfig = {
    type: "spring",
    stiffness: isAwakened ? 180 : 300,
    damping: isAwakened ? 10 : 25,
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ y: isHovered ? yTarget : 0 }}
      transition={springConfig}
    >
      <motion.div
        className="spring-line"
        animate={{ scaleX: isHovered ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={lineSpringConfig}
        style={{ transformOrigin: "left" }}
      />
      {children}
    </motion.div>
  );
}
```

### Component structure

```
SpringCard (new, reusable)
├── motion.div (y displacement, manages hover state)
│   ├── motion.div.spring-line (scaleX driven by parent hover)
│   ├── Corner brackets (4x, CSS transition on border-color)
│   └── children (card content)
```

### Interaction with Magnetic Field

On Relics page, cards have both Magnetic Field AND Spring Physics:
- `MagneticWrapper` handles 3D tilt (cursor tracking via rotateX/Y)
- `SpringCard` handles y-lift on hover (translateY)

Nesting order: `MagneticWrapper > SpringCard > CardContent`

These don't conflict because they control different transform properties (rotate vs translate).

---

## 3. Cascade Reveal

**Library:** GSAP + ScrollTrigger (existing)
**Location:** Relics grid items only
**Replaces on Codex:** Nothing — Codex keeps its existing `useScrollReveal` + `codex-fade-in` CSS system
**Mobile:** Disable glitch flicker; retain basic stagger fade-in

### Scope Clarification

The Codex page already has a working scroll-reveal system (`IntersectionObserver` toggling `codex-visible` CSS class) plus `GsapSplitHeading` for character-level stagger. Adding a second GSAP-based stagger would conflict with these. Therefore, **Cascade Reveal is scoped to the Relics grid only**. Codex animations remain untouched.

### Behavior

Relics grid items start invisible (`opacity: 0`, `translateY: 60px`, `scale: 0.9`). When scrolled into viewport, they appear one by one with 120ms stagger, sweeping left-to-right, top-to-bottom. Each element's bottom border line scales in from left after the element appears.

### Parameters

| Parameter | Dormant | Awakened |
|-----------|---------|----------|
| Stagger interval | 120ms | 120ms |
| Entry duration | 600ms | 600ms |
| Easing | `power3.out` | `power3.out` |
| Bottom line color | `#555` | `#f05252` |
| Bottom line duration | 800ms | 800ms |
| Glitch on entry | none | 1-2 frame glitch burst before reveal |

### GSAP Implementation

```js
// Basic stagger reveal
gsap.fromTo(items,
  { opacity: 0, y: 60, scale: 0.9 },
  {
    opacity: 1, y: 0, scale: 1,
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: container,
      start: "top 80%",
      once: true,  // fire only once, don't re-trigger on scroll back
    },
  }
);
```

### Awakened Glitch Burst

When awakened, each element's reveal is preceded by a 2-frame glitch:

```js
function glitchBurst(element) {
  const tl = gsap.timeline();
  tl.set(element, {
    clipPath: "inset(20% 0 60% 0)",
    x: -8,
    opacity: 0.7,
  });
  tl.set(element, {
    clipPath: "inset(60% 0 10% 0)",
    x: 5,
    opacity: 0.5,
  }, "+=0.03");
  tl.set(element, {
    clipPath: "inset(0)",
    x: 0,
    opacity: 1,
  }, "+=0.03");
  return tl;
}
```

This integrates into the stagger by inserting `glitchBurst` as an `onStart` callback for each element's tween.

### Component structure

No new component needed. Add a custom hook:

```
useCascadeReveal(containerRef, { isAwakened })
```

This hook sets up the ScrollTrigger and handles cleanup on unmount. Applied to Relics grid container only.

---

## 4. Liquid Morph

**Library:** GSAP (timeline)
**Location:** Page title transitions on `currentPage` state change
**Mobile:** Disable blur; use simple opacity fade (300ms)

### Integration with Navigation (No React Router)

This project does **not** use React Router. Navigation is controlled by `currentPage` state in `App.jsx` with conditional rendering. The morph transition hooks into `currentPage` changes, not route changes.

The existing `PageTransition` component handles full-screen page wipe transitions. Liquid Morph targets **only the page title text**, running in parallel with (not replacing) `PageTransition`. The title blurs/morphs while the page content wipes in underneath.

### Behavior

When `currentPage` changes:
1. Current title blurs out + fades (half the transition duration)
2. Brief overlap where both titles are semi-visible and blurred (liquid fusion moment)
3. New title sharpens in + fades up (half the transition duration)

### Parameters

| Parameter | Dormant | Awakened |
|-----------|---------|----------|
| Total duration | 1000ms | 600ms |
| Max blur | 12px | 8px |
| Text shadow (during blur) | none | `0 0 20px rgba(240,82,82,0.4)` |
| Overlap region | 200ms | 100ms |

### Safari Caveat

`filter: blur()` on text elements can cause sub-pixel rendering artifacts on Safari. Mitigation: wrap the title in a `div` with `will-change: filter` to hint the compositor, and add the existing `force-gpu` utility class.

### GSAP Implementation

```js
function morphTransition(titleEl, oldText, newText, { isAwakened }) {
  const duration = isAwakened ? 0.3 : 0.5;
  const blur = isAwakened ? 8 : 12;
  const shadow = isAwakened ? "0 0 20px rgba(240,82,82,0.4)" : "none";

  const tl = gsap.timeline();

  // Blur out current text
  tl.to(titleEl, {
    filter: `blur(${blur}px)`,
    opacity: 0,
    textShadow: shadow,
    duration,
    ease: "power2.in",
    onComplete: () => { titleEl.textContent = newText; },
  });

  // Blur in new text
  tl.fromTo(titleEl,
    { filter: `blur(${blur}px)`, opacity: 0, textShadow: shadow },
    { filter: "blur(0px)", opacity: 1, textShadow: "none", duration, ease: "power2.out" },
    `-=${isAwakened ? 0.1 : 0.2}` // overlap
  );

  return tl;
}
```

### Hook interface

```js
useLiquidMorph(titleRef, currentPage, { isAwakened })
```

The hook watches `currentPage` via `useEffect`, maps page names to display titles (from `TRANSLATIONS`), and triggers `morphTransition` on change.

### Component structure

```
App.jsx
├── PageTitle (new, persistent wrapper with ref)
│   └── GSAP timeline on currentPage change
├── Navigation (existing)
├── PageTransition (existing, full-screen wipe)
└── Conditional page render (existing)
    ├── Home
    ├── Codex
    ├── Relics
    └── Me
```

`PageTitle` is a simple `div` positioned in the layout. It does not interfere with the existing conditional page rendering.

---

## New Dependencies

| Package | Purpose | Estimated Size |
|---------|---------|---------------|
| `motion` | Magnetic Field, Spring Physics, DecryptedText migration | ~30-34kB gzipped (full React bindings) |

**Removes:** `framer-motion` (~35kB gzipped)

Net bundle impact is approximately neutral. The migration is justified by:
- `motion` is the official successor to `framer-motion` (same team, same API surface)
- Better tree-shaking and runtime performance
- Active maintenance vs. deprecated package

No other new dependencies. GSAP and ScrollTrigger are already installed.

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/ui/MagneticWrapper.jsx` | Reusable magnetic tilt wrapper |
| `src/components/ui/SpringCard.jsx` | Reusable spring hover card |
| `src/components/PageTitle.jsx` | Persistent page title with morph transition |
| `src/hooks/useCascadeReveal.js` | ScrollTrigger stagger reveal hook |
| `src/hooks/useLiquidMorph.js` | GSAP morph transition hook |

### Modified Files

| File | Change |
|------|--------|
| `src/App.jsx` | Pass `isAwakened` to Relics/Codex, add PageTitle component |
| `src/components/pages/Relics.jsx` | Remove `useTilt` usage, wrap cards with MagneticWrapper + SpringCard, apply useCascadeReveal |
| `src/components/ui/DecryptedText.jsx` | Migrate `framer-motion` import to `motion/react` |
| `package.json` | Add `motion`, remove `framer-motion` |

### Deleted Files

| File | Reason |
|------|--------|
| `src/hooks/useTilt.js` | Replaced by MagneticWrapper |

---

## Performance Considerations

- **Magnetic Field:** All transforms are GPU-composited (`transform: perspective() rotateX() rotateY()`). No layout thrashing. `useMotionValue` bypasses React re-renders.
- **Spring Physics:** Same — `transform: translateY()` is composited.
- **Cascade Reveal:** `ScrollTrigger` with `once: true` fires stagger only once. No re-animation on scroll back.
- **Liquid Morph:** `filter: blur()` is expensive but limited to a single text element with `will-change: filter` hint. Disabled on mobile.
- **Touch devices:** Magnetic Field and Spring displacement are disabled. Blur is disabled. Only CSS transitions remain.

---

## Testing Strategy

- **Visual regression:** Manual testing on Chrome, Safari, Firefox (desktop)
- **Safari blur check:** Specifically verify Liquid Morph doesn't cause font re-rasterization artifacts
- **Mobile:** Test on iOS Safari, Chrome Android — verify degradation works
- **Dual-state toggle:** Verify all four animations switch parameters correctly on dormant/awakened toggle (this is the highest-risk test path)
- **Page transitions:** Verify Liquid Morph runs in parallel with PageTransition without visual conflicts
- **Performance:** Chrome DevTools Performance tab — ensure no jank (maintain 60fps during animations)
- **Bundle size:** Run `npx vite-bundle-visualizer` after adding `motion` to verify actual gzipped size
