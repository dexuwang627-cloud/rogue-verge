# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

No test suite is configured.

## Architecture

**Stack:** React 19 + Vite 7 + Tailwind CSS v4 + GSAP 3 + Framer Motion

**Routing:** Client-side only, no React Router. Navigation is controlled by `currentPage` state in `App.jsx`. Pages are conditionally rendered with `&&`. Valid page values: `'home'`, `'codex'`, `'relics'`, `'relic_detail'`, `'me'`.

- The `Me` page (`/me`) is hidden — accessible only via a secret easter egg: 5 rapid clicks on the logo within 2 seconds triggers a glitch flash and navigates to `me`.
- `BootSequence` is shown on first load only; subsequent visits skip it via `sessionStorage.rogue_verge_booted`.

**Internationalization:** Bilingual ZH-TW / EN. `TRANSLATIONS` object in `src/data/constants.js` provides all UI strings. All data-holding constants (`RELICS_DATA`) also live there. The `lang` prop is passed down from `App` to all pages.

**Component structure:**
- `src/components/pages/` — full-page components (`Home`, `Relics`, `RelicDetail`, `Codex`, `Me`)
- `src/components/ui/` — reusable effects and widgets
- `src/data/constants.js` — all translations and relic data

**Key UI components:**
- `ScrambleText` — hover-triggered character scramble; uses `forwardRef` + `useImperativeHandle` to expose a `scramble()` method so parent nav items can trigger it programmatically on `onMouseEnter`
- `DecryptedText` — similar scramble with `animateOn` modes: `'hover'`, `'view'` (IntersectionObserver), or `'none'` (programmatic via exposed `startScramble()`)
- `GlitchGeometryBlock` — canvas-based real-time glitch animation on `sigilism.png` with GSAP ScrollTrigger pin + scrub; uses `IntersectionObserver` to pause the `requestAnimationFrame` loop when off-screen
- `BootSequence` — full-screen terminal loading screen with animated progress bar
- `DataStreamBorder` — decorative scrolling base64 text along the edges of a container
- `CustomCursor` — replaces the native cursor; hidden on touch devices via CSS (`@media (pointer: coarse)`)

**Animation approach:**
- GSAP ScrollTrigger for scroll-pinned and scrubbed animations (`GlitchGeometryBlock`, `Codex` headings)
- CSS custom animations defined in `@theme` inside `src/index.css` (Tailwind v4 syntax): `animate-scanline`, `animate-pulse-slow`, `animate-noise`, `animate-data-scroll`, `animate-spin-slow`
- `codex-fade-in` / `codex-visible` CSS classes toggled by `IntersectionObserver` for scroll-reveal in the Codex page
- Framer Motion is imported (`motion.span` in `DecryptedText`) but minimally used

**Styling conventions:**
- Tailwind v4 via `@tailwindcss/vite` plugin — no `tailwind.config.js`, configuration is in `src/index.css` under `@theme`
- Color palette: near-black bg `#020202`, text `#e0e0e0`, accent red (`red-500`, `red-600`)
- `force-gpu` utility class in `index.css` for hardware-accelerated elements (`will-change: transform, opacity, filter; transform: translateZ(0)`)
- Font stack: serif = Cinzel + Noto Serif TC, mono = Space Mono, sans = Inter + Noto Sans TC (loaded via Google Fonts in `index.html`)
- `mix-blend-difference` is used on the nav to invert against backgrounds
