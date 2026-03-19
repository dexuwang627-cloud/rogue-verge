# Visual Effects Enhancement — Scanline Page Transition + Relic Card Interactions

**Date:** 2026-03-19
**Status:** Approved

## Scope

Two visual enhancements for the RogueVerge website:
1. Scanline wipe page transition for main navigation
2. Relic card 3D tilt + glitch hover effect

Scrolling parallax is deferred to a separate future task.

---

## Feature 1: Scanline Wipe Page Transition

### New Component: `src/components/ui/PageTransition.jsx`

Fixed full-screen overlay (`fixed inset-0, z-[999]`) with two animation phases:

| Phase | Time | Action |
|-------|------|--------|
| Phase 1 (enter) | 0–350ms | Black curtain scales from `scaleY(0)` → `scaleY(1)`, transform-origin top. A 2px white scanline glows at the leading edge. |
| Page swap | 350ms | Execute `setCurrentPage()` while screen is fully covered. |
| Phase 2 (exit) | 350–750ms | Curtain scales from `scaleY(1)` → `scaleY(0)`, transform-origin top (retracts upward, revealing new page). |
| Cleanup | 750ms | Unmount overlay. |

### Visual Details

- Curtain color: `#020202` (matches site background)
- Scanline: 2px height, white, `box-shadow: 0 0 15px rgba(255,255,255,0.5)`
- Easing: `cubic-bezier(0.76, 0, 0.24, 1)` (fast-in fast-out)

### Navigation Routing Logic (App.jsx)

New `navigateTo(page)` function replaces direct `setCurrentPage()` calls:

- **Main navigation** (home ↔ codex ↔ relics): triggers scanline wipe transition
- **Detail navigation** (relics ↔ relic_detail): lightweight fade (opacity + translateY, 300ms)
- **Lock during transition**: `navigateTo` ignores calls while a transition is in progress

#### Which calls get which treatment

| Trigger | From → To | Transition |
|---------|-----------|------------|
| Nav button: Codex | any → codex | Scanline wipe |
| Nav button: Relics | any → relics | Scanline wipe |
| Logo click (home) | any → home | Scanline wipe |
| Relic card click | relics → relic_detail | Fade |
| Back button | relic_detail → relics | Fade |
| Secret 5-click (me) | any → me | Keeps existing glitch flash |

### CSS Additions (index.css)

Two new keyframes:
- `scanline-wipe-enter`: `scaleY(0)` → `scaleY(1)`, origin top
- `scanline-wipe-exit`: `scaleY(1)` → `scaleY(0)`, origin top

### Implementation Notes

- `PageTransition` receives `isActive`, `phase`, and `onPhaseComplete` props
- `onAnimationEnd` callback drives phase progression (no setTimeout)
- Component returns `null` when `isActive` is false

---

## Feature 2: Relic Card 3D Tilt + Glitch Hover

### New Hook: `src/hooks/useTilt.js`

Returns `{ ref, onMouseMove, onMouseLeave }` for the card container.

**Tilt calculation:**
1. `onMouseMove`: compute cursor offset from card center as ratio (-1 to 1)
2. Map to `rotateX: ±10deg` (inverted Y axis), `rotateY: ±10deg`
3. Apply directly via `ref.current.style.transform` (no React state, no re-render)

**Reset:**
- `onMouseLeave`: set transform to `rotateX(0) rotateY(0)`

**Smoothing:**
- `transition: transform 0.15s ease-out` on the card element

**Touch devices:**
- `@media (pointer: coarse)`: disable tilt entirely (no mousemove on touch)

### Card Container Changes (Relics.jsx)

```
div.perspective-1000 (wrapper, already exists as utility)
└── div (card) — applies useTilt
    ├── style.transform = rotateX/Y from hook
    ├── transformStyle: preserve-3d
    ├── div.glitch-overlay (new, hover-only)
    │   ├── ::before — red-shifted image copy, translate(2px, 0), clip-path animation
    │   └── ::after — cyan-shifted image copy, translate(-2px, 0), clip-path animation
    └── (existing card content unchanged)
```

### Glitch Hover Effect

CSS-only using pseudo-elements on a new `.relic-glitch-overlay` class:

- **::before**: `background: inherit`, red tint via `mix-blend-mode: screen` + red overlay, offset `translate(2px, 0)`, animated with existing `glitchClip` keyframe
- **::after**: same but cyan tint, offset `translate(-2px, 0)`, animated with existing `glitchClip2` keyframe
- Both are `opacity: 0` by default, `group-hover:opacity-70`
- Animation runs once on hover enter (~0.3s), not continuous
- Pointer-events: none on overlay

### CSS Additions (index.css)

```css
.relic-glitch-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.group:hover .relic-glitch-overlay {
  opacity: 1;
}

.relic-glitch-overlay::before,
.relic-glitch-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  mix-blend-mode: screen;
}

.relic-glitch-overlay::before {
  animation: glitchClip 0.3s steps(4) 1;
  transform: translate(2px, 0);
  filter: hue-rotate(-30deg) saturate(2);
}

.relic-glitch-overlay::after {
  animation: glitchClip2 0.3s steps(4) 1;
  transform: translate(-2px, 0);
  filter: hue-rotate(30deg) saturate(2);
}
```

Reuses existing `glitchClip` and `glitchClip2` keyframes from index.css.

---

## Detail Page Fade (Lightweight Transition)

For relic_detail ↔ relics transitions:

- Enter: `opacity: 0 → 1` + `translateY(20px → 0)`, 300ms, `ease-out`
- Exit: instant (relics page re-mounts fresh)
- Implemented as a CSS class `.fade-enter` applied on mount, toggled via useEffect

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/PageTransition.jsx` | **New** — scanline wipe overlay |
| `src/hooks/useTilt.js` | **New** — 3D tilt hook |
| `src/App.jsx` | Add `navigateTo()`, integrate PageTransition, pass to nav buttons |
| `src/components/pages/Relics.jsx` | Apply useTilt, add glitch overlay div, wrap cards in perspective |
| `src/components/pages/RelicDetail.jsx` | Add fade-enter class on mount |
| `src/index.css` | Add scanline-wipe keyframes, relic-glitch-overlay styles, fade-enter class |

## Performance Considerations

- Tilt uses direct DOM manipulation (ref.style.transform), zero React re-renders
- Glitch is pure CSS pseudo-elements + keyframes, no JS runtime cost
- PageTransition uses CSS animations with `onAnimationEnd`, no timers
- Touch devices: tilt disabled via media query
- All animated elements use `will-change` or `force-gpu` for compositor-layer promotion

## Future Work (Not In Scope)

- Scrolling parallax layers (next task)
- Performance optimization pass (after visual work complete)
