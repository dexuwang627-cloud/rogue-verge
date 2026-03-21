# RogueVerge Codex Page Redesign Spec

## Overview

Full redesign of the Codex page: new layout (Immersive Flow), new background system (Acid Warp organic metablobs), new animation engine (GSAP ScrollTrigger-driven atmosphere), all with dual dormant/awakened state support.

**Preserves:** Text content (all copy), `DecryptedText` component, `TypewriterText` component, `SigilGlitch` section (unchanged).

**Removes:** `useScrollReveal` hook usage, `GsapSplitHeading`, `NoiseCanvas`, `DataStreamBorder` usage, `codex-fade-in`/`codex-visible` CSS approach.

---

## Layout: Immersive Flow

Continuous scroll with no visible section breaks. Content flows naturally from Genesis through Declaration. No sidebar, no progress bar — just the experience.

### Content Flow (top to bottom)

| Order | Content | Animation |
|-------|---------|-----------|
| **Opening** | "CODEX" title + "SCROLL TO DECRYPT" | Static centered. Blob dormant state. |
| **Genesis** | 3 paragraphs with `>` prefix (terminal style) | Staggered fade-in + translateY(30px→0). Blob awakens. |
| **Heartbeat 1** | "THE FLESH IS OBSOLETE" (giant text) | On viewport entry: blob convulse + glitch flash + scanline sweep. 2.5s decay. |
| **Manifesto** | 2 paragraphs with `::` prefix | Staggered fade-in. Blob stable but more alive than before. |
| **Quote** | "Better to reign in Hell, than serve in Heaven." | Red corner-bracket box. `DecryptedText` with center-outward reveal. |
| **Heartbeat 2** | "WEAR DEFIANCE" (giant text) | Second convulsion, stronger than first (1.8x scale, 2.8x speed). 3s decay. |
| **Sigil** | `SigilGlitch` component (unchanged from current) | Existing hover glitch effect preserved exactly. |
| **Declaration** | Final transmission + "END_OF_CODEX" | `TypewriterText` effect. Blob dissolves/shrinks to near-invisible. |

### I18n Note

The Opening section ("CODEX", "SCROLL TO DECRYPT") and section labels ("> ACCESSING RESTRICTED ARCHIVE...") are new UI strings not currently in `TRANSLATIONS`. They should be added to `src/data/constants.js` under both `zh-TW` and `en` keys for bilingual support. Alternatively, since these are stylistic/brand elements (not user-facing copy), hardcoded English is acceptable — consistent with how the current Codex handles labels like "END_OF_CODEX".

### Typography

| Element | Font | Size | Style |
|---------|------|------|-------|
| Heartbeat titles | Cinzel serif | `clamp(2rem, 7vw, 6rem)` | uppercase, wide tracking |
| Body text | Space Mono | `0.95rem` | line-height 2, color #555 |
| Quote | Cinzel serif italic | `clamp(1.2rem, 2.8vw, 1.8rem)` | color rgba(255,255,255,0.85) |
| Labels/small text | Space Mono | `0.65-0.75rem` | uppercase, wide letter-spacing |

---

## Background System (4 layers)

### Layer 1: Acid Warp (Canvas)

Full-screen canvas rendering organic metablob creatures.

**Organism structure:**
- Each organism is a cluster of 3-5 sub-blobs that merge via metaball field
- Sub-blob edges are distorted by 2D simplex noise (not circular — amoeba-like)
- Each sub-blob squirms independently (sine-driven offset animation)
- Whole organism breathes (slow scale pulse)
- 5-6 organisms drift slowly across the screen

**GSAP ScrollTrigger controls these parameters per section:**

| Parameter | Opening | Genesis | Heartbeat 1 | Manifesto | Heartbeat 2 | Declaration |
|-----------|---------|---------|-------------|-----------|-------------|-------------|
| intensity | 0.25 | 0.45 | 0.9→0.5 | 0.5 | 1.0→0.55 | 0.2 |
| noiseStrength | 0.4 | 0.6 | 1.0→0.7 | 0.7 | 1.0→0.75 | 0.5 |
| speed | 0.8 | 1.0 | 2.4→1.2 | 1.1 | 2.8→1.2 | 0.6 |
| scale | 0.8 | 1.0 | 1.5→1.1 | 1.05 | 1.8→1.1 | 0.6 |
| breathAmp | 0.1 | 0.15 | 0.4→0.2 | 0.18 | 0.5→0.2 | 0.08 |
| convulse | 0 | 0 | 1→0 | 0 | 1→0 | 0 |
| colorR | 30 | 45 | 80→50 | 50 | 100→55 | 25 |
| spread | 1.2 | 1.0 | 1.0 | 0.9 | 0.6→1.0 | 1.5 |

Arrow notation `X→Y` means: burst to X over 0.2-0.3s, then decay to Y over 2-3s.

**Convulsion effect:** When `convulse > 0`, organisms shake violently (random position displacement per frame proportional to convulse value).

**Base speed:** All animation speeds are multiplied by 1.2x (20% faster than default).

### Layer 2: Depth Layers (DOM)

Three parallax layers with different scroll speeds:

| Layer | Content | Scroll Speed | Opacity |
|-------|---------|-------------|---------|
| Code Rain | Vertical hex/code strings flowing down (CSS animation) | `scrollY * -0.05` | 0.03 |
| Geometry | Diamonds, brackets, lines — sine-wave drift + rotation | `scrollY * -0.12` + horizontal sine | 0.04 |
| Ghost Text | Large faded words from the manifesto (NOISE GENESIS, OBSOLETE, ROGUE VERGE, DEFIANCE) | `scrollY * -0.03` | 0.025, pulsing via sine |

### Layer 3: Atmosphere (CSS + JS)

- **Noise texture:** SVG fractal noise, fixed overlay. Base opacity 0.04, increases with scroll depth (+0.03 at bottom).
- **Vignette:** Radial gradient darkening edges.
- **Red glow:** Radial gradient `rgba(240,82,82,0.08)`, normally invisible. Flashes to opacity 1 during heartbeat, decays over 2s.

### Layer 4: Heartbeat System

Triggered by IntersectionObserver when heartbeat text enters viewport (threshold 0.5). Fires once per element.

**Sequence (0.15s total flash):**
1. `heartbeat-flash` overlay: 3-step CSS keyframe named `heartbeatFlash` (NOT `glitchClip` — that name is reserved for SigilGlitch) — red bands with clip-path
2. Scanline sweep: 2px red line sweeps top to bottom at 8px per frame
3. Red glow opacity → 1, then decay to 0 over 2s
4. Noise opacity spikes to 0.15, then decay to base over 2s
5. Acid Warp organisms convulse (handled by GSAP — see Layer 1)

---

## Dual-State System

`isAwakened` is passed to `<Codex>` from App.jsx (added in the motion-animations work). The current Codex component does not destructure or use it. The rewrite must destructure `isAwakened` from props and thread it to all sub-components (`AcidWarp`, `DepthLayers`, `HeartbeatFlash`, `useAtmosphere`).

| Aspect | Dormant | Awakened |
|--------|---------|----------|
| Acid Warp base intensity | 0.25 | 0.4 |
| Acid Warp heartbeat peak | 0.9 | 1.0 |
| Depth layers opacity | As specified | +50% across all layers |
| Noise base | 0.04 | 0.06 |
| Heartbeat flash | Standard | More intense (longer decay, brighter glow) |
| Body text reveal | Standard fade-in | Fade-in with 1-frame glitch flicker (like Relics cascade) |
| Code Rain speed | Normal | 1.3x faster |

---

## SigilGlitch Preservation

The `SigilGlitch` component is currently defined inside `Codex.jsx` (lines 198-230). It must be extracted into the new Codex.jsx with these modifications:

**Preserved exactly (visual/interaction):**
- The main grayscale/contrast image (`sigilism.png`)
- Red glitch overlay with `hue-rotate(320deg)` and `glitchClip` animation
- Scanline overlay
- Corner accent borders
- Label text "SIGIL // ENCODED_GLYPH_004"
- Hover interactions (grayscale removal, opacity change)

**Must change during extraction:**
1. **Remove `useScrollReveal` dependency.** The current `SigilGlitch` calls `useScrollReveal(0.2)` (line 199) which is defined inline in the current Codex.jsx. Replace with a simple GSAP ScrollTrigger fade-in, or use the same IntersectionObserver approach as the body text `data-reveal` elements.
2. **Remove `codex-fade-in` CSS class.** The current component's outer div uses `className="... codex-fade-in ..."` which permanently sets `opacity: 0` and relies on `useScrollReveal` to add `codex-visible`. Strip this class and handle visibility through the replacement scroll-reveal mechanism.
3. **Keep `glitchClip` keyframe.** The `glitchClip` keyframe in `src/index.css` (line 134) is used by `SigilGlitch`'s red overlay. This keyframe must NOT be removed during CSS cleanup. The new `HeartbeatFlash` component must use a differently-named keyframe (e.g., `heartbeatFlash`) to avoid collision.

**Also applies to:** `NoiseCanvas` (lines 149-193) is also defined inline in Codex.jsx. It is being removed (replaced by CSS noise texture). No extraction needed — it will simply not exist in the rewrite.

---

## Mobile Degradation

| Feature | Desktop | Mobile (pointer: coarse) |
|---------|---------|--------------------------|
| Acid Warp canvas | Full rendering | Disabled (too expensive) |
| Depth layers | All 3 layers | Disabled |
| Atmosphere noise | Active | Active (CSS only, cheap) |
| Heartbeat flash | Full (flash + scanline + glow) | Simplified (flash only, no scanline) |
| Body text reveal | Fade-in + translateY | Same (CSS transition, cheap) |
| DecryptedText | Full scramble animation | Same (JS, lightweight) |
| TypewriterText | Full typing effect | Same |
| SigilGlitch | Full hover effect | Touch-friendly (no hover state) |

---

## New Dependencies

None. Uses existing GSAP + ScrollTrigger. Simplex noise is implemented inline (no npm package).

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/ui/AcidWarp.jsx` | Canvas organic metablob system |
| `src/components/ui/DepthLayers.jsx` | Code Rain + geometry + ghost text parallax |
| `src/components/ui/HeartbeatFlash.jsx` | Glitch flash + scanline + red glow |
| `src/hooks/useAtmosphere.js` | GSAP ScrollTrigger setup driving blob state + atmosphere |

### Modified Files

| File | Change |
|------|--------|
| `src/components/pages/Codex.jsx` | Full rewrite — new layout, new animation system |

### CSS Changes

| File | Change |
|------|--------|
| `src/index.css` | `codex-fade-in` / `codex-visible` classes: remove the rules (lines 196-206) since no component will use them after the rewrite. **Do NOT remove `glitchClip` / `glitchClip2` keyframes** — `SigilGlitch` depends on them. Add new `heartbeatFlash` keyframe for `HeartbeatFlash.jsx`. |

### No Deleted Files

- `DataStreamBorder.jsx` stays (other pages might use it)
- No hooks deleted (the `useScrollReveal` was defined inline in Codex.jsx, not a separate file)

---

## Performance Considerations

- **Acid Warp canvas:** Renders at 3px step (every 3rd pixel), fills blocks. ~50k pixel checks per frame at 1080p. Tested smooth in demo.
- **Simplex noise:** Inlined 2D implementation, no dependency. Called per sub-blob per sampled pixel — bounded by organism count (5-6) × sub-blob count (3-5) × sampled pixels.
- **Depth layers:** Pure CSS animations + JS transform on scroll (RAF-throttled). No layout thrashing.
- **GSAP ScrollTrigger:** Lightweight observers, no scrub (discrete triggers only).
- **Mobile:** Canvas and depth layers disabled entirely. Only CSS atmosphere + flash remains.

---

## Testing Strategy

- **Visual regression:** Manual testing on Chrome, Safari, Firefox (desktop)
- **Scroll performance:** Chrome DevTools Performance tab — verify 60fps during continuous scroll + blob rendering
- **Heartbeat triggers:** Scroll to each heartbeat text, verify flash fires once, blob convulses, decays properly
- **Dual state:** Toggle awakened on Home, navigate to Codex — verify all effects intensify
- **SigilGlitch:** Verify hover effect works identically to current version
- **DecryptedText:** Verify quote scramble-reveal still works
- **TypewriterText:** Verify final transmission typing effect still works
- **Mobile:** Test on responsive mode — canvas disabled, basic effects only, no jank
