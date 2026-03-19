# Visual Effects Enhancement — Scanline Page Transition + Relic Card Interactions

**Date:** 2026-03-19
**Status:** Approved

## Scope

Two visual enhancements for the RogueVerge website:
1. Scanline wipe page transition for main navigation
2. Relic card 3D tilt + glitch hover effect

Additional change: remove "acquire assets" button from RelicDetail.

Scrolling parallax is deferred to a separate future task.

---

## Feature 1: Scanline Wipe Page Transition

### New Component: `src/components/ui/PageTransition.jsx`

Fixed full-screen overlay (`fixed inset-0, z-[999]`) with `will-change: transform` (force-gpu) for compositor-layer promotion. Two animation phases:

| Phase | Time | Action |
|-------|------|--------|
| Phase 1 (enter) | 0–350ms | Black curtain scales from `scaleY(0)` → `scaleY(1)`, **transform-origin: top**. A 2px white scanline glows at the leading edge. |
| Page swap | 350ms | Execute `setCurrentPage()` while screen is fully covered. |
| Phase 2 (exit) | 350–750ms | Curtain scales from `scaleY(1)` → `scaleY(0)`, **transform-origin: bottom** (continues downward, "wipe through" effect — scanline direction is consistent top→bottom across both phases). |
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
- `scanline-wipe-exit`: `scaleY(1)` → `scaleY(0)`, origin bottom

### Implementation Notes

- `PageTransition` receives `isActive`, `phase`, and `onPhaseComplete` props
- `onAnimationEnd` callback drives phase progression (no setTimeout)
- Component returns `null` when `isActive` is false
- Overlay div applies `force-gpu` class for hardware acceleration

---

## Feature 2: Relic Card 3D Tilt + Glitch Hover

### New Hook: `src/hooks/useTilt.js`

Returns `{ ref, onMouseMove, onMouseLeave }` for the card container.

**Tilt calculation:**
1. `onMouseMove`: compute cursor offset from card center as ratio (-1 to 1)
2. Map to `rotateX: ±10deg` (inverted Y axis), `rotateY: ±10deg`
3. Apply directly via `ref.current.style.transform` (no React state, no re-render)
4. Set `ref.current.style.transition = 'none'` during active tracking for immediate response

**Reset:**
- `onMouseLeave`: set `transition: transform 0.15s ease-out`, then reset transform to `rotateX(0) rotateY(0)` — transition only applies during reset, not during active tracking

**Touch devices:**
- `@media (pointer: coarse)`: disable tilt entirely (no mousemove on touch)

### Card Container Changes (Relics.jsx)

```
div.perspective-1000 (wrapper, already exists as utility)
└── div (card) — applies useTilt
    ├── style.transform = rotateX/Y from hook
    ├── transformStyle: preserve-3d
    ├── div.relic-glitch-overlay (new, hover-only)
    │   ├── style={{ backgroundImage, backgroundSize: 'cover' }} — inline from item.src
    │   ├── ::before — red-shifted copy, clip-path animation (on hover only)
    │   └── ::after — cyan-shifted copy, clip-path animation (on hover only)
    └── (existing card content unchanged)
```

### Glitch Hover Effect

CSS pseudo-elements on `.relic-glitch-overlay`:

- The overlay div receives `style={{ backgroundImage: url(${item.src}), backgroundSize: 'cover' }}` as an inline style so that `background: inherit` on pseudo-elements correctly inherits the relic image (since the card image is an `<img>` tag, pseudo-elements cannot access it directly).
- **::before** and **::after**: `background: inherit` inherits from the overlay's inline backgroundImage.
- Animations are scoped to hover state (`group:hover .relic-glitch-overlay::before`) so they re-trigger on each hover enter, not on mount.
- The `glitchClip`/`glitchClip2` keyframes include their own `transform` values which override the base `translate(±2px, 0)` during animation playback — this is intentional: the keyframe's random offsets create the glitch movement, and the static 2px offset only applies in the post-animation resting state.

### CSS Additions (index.css)

```css
.relic-glitch-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  background-size: cover;
  background-position: center;
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

/* Animations scoped to hover — re-trigger on each hover enter */
.group:hover .relic-glitch-overlay::before {
  animation: glitchClip 0.3s steps(4) 1;
  transform: translate(2px, 0);
  filter: hue-rotate(-30deg) saturate(2);
}

.group:hover .relic-glitch-overlay::after {
  animation: glitchClip2 0.3s steps(4) 1;
  transform: translate(-2px, 0);
  filter: hue-rotate(30deg) saturate(2);
}
```

Reuses existing `glitchClip` and `glitchClip2` keyframes from index.css.

---

## Detail Page Fade (Lightweight Transition)

For relic_detail ↔ relics transitions:

- Component mounts with `.fade-enter` class: `opacity: 0; transform: translateY(20px)`
- A `useEffect` on mount uses `requestAnimationFrame` to add `.fade-enter-active` class: `opacity: 1; transform: translateY(0); transition: all 300ms ease-out`
- This two-class pattern ensures the browser registers the initial state before transitioning
- Exit: instant (relics page re-mounts fresh)

---

## Additional Change: Remove "Acquire Assets" Button

In `RelicDetail.jsx`, remove the entire `<div className="pt-8">` block containing the price display and the `<a href="https://www.rogueverge.com">` acquire button. Also remove the corresponding `acquire_asset` and `sold_out` translation lookups if no longer referenced elsewhere.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/PageTransition.jsx` | **New** — scanline wipe overlay |
| `src/hooks/useTilt.js` | **New** — 3D tilt hook |
| `src/App.jsx` | Add `navigateTo()`, integrate PageTransition, remove `setCurrentPage` prop from Home |
| `src/components/pages/Home.jsx` | Remove unused `setCurrentPage` prop |
| `src/components/pages/Relics.jsx` | Apply useTilt, add glitch overlay div, wrap cards in perspective |
| `src/components/pages/RelicDetail.jsx` | Add fade-enter on mount, remove acquire button |
| `src/index.css` | Add scanline-wipe keyframes, relic-glitch-overlay styles, fade-enter/fade-enter-active classes |

## Performance Considerations

- Tilt uses direct DOM manipulation (ref.style.transform), zero React re-renders
- Tilt transition is `none` during active tracking, only applied on mouse leave for smooth reset
- Glitch is pure CSS pseudo-elements + keyframes, no JS runtime cost
- PageTransition overlay uses `force-gpu` / `will-change: transform` for compositor-layer promotion
- PageTransition uses CSS animations with `onAnimationEnd`, no timers
- Touch devices: tilt disabled via media query

## Future Work (Not In Scope)

- Scrolling parallax layers (next task)
- Performance optimization pass (after visual work complete)
