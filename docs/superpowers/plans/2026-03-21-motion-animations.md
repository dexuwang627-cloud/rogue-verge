# Motion Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four animation systems (Magnetic Field, Spring Physics, Cascade Reveal, Liquid Morph) with dual dormant/awakened state support to RogueVerge.

**Architecture:** Motion (motion.dev) handles physics-based interactions (Magnetic Field, Spring Physics). GSAP handles scroll-driven and timeline animations (Cascade Reveal, Liquid Morph). All animations read `isAwakened` from App.jsx state and adjust parameters accordingly.

**Tech Stack:** React 19, Motion (motion.dev), GSAP 3 + ScrollTrigger, Vite 7, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-21-motion-animations-design.md`

**Project root:** `/Users/te-shuwang/Library/Mobile Documents/com~apple~TextEdit/Documents/personal/rogue-verge-archive`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/ui/MagneticWrapper.jsx` | Wraps any element with 3D cursor-tracking tilt + spring return |
| `src/components/ui/SpringCard.jsx` | Hover lift with spring physics + animated top-line |
| `src/components/PageTitle.jsx` | Persistent page title that morphs on `currentPage` change |
| `src/hooks/useCascadeReveal.js` | GSAP ScrollTrigger stagger reveal with optional glitch burst |
| `src/hooks/useLiquidMorph.js` | GSAP blur morph timeline triggered by page name change |

### Modified Files

| File | Change |
|------|--------|
| `src/App.jsx` (235 lines) | Pass `isAwakened` to Relics/Codex (lines 228-229), add PageTitle |
| `src/components/pages/Relics.jsx` (54 lines) | Remove useTilt, add MagneticWrapper + SpringCard + useCascadeReveal |
| `package.json` | Add `motion` dependency |

### Deleted Files

| File | Reason |
|------|--------|
| `src/hooks/useTilt.js` | Replaced by MagneticWrapper |

---

## Task 0: Install Motion and Remove useTilt

**Files:**
- Modify: `package.json`
- Delete: `src/hooks/useTilt.js`
- Modify: `src/components/pages/Relics.jsx` (line 3: remove useTilt import, lines 6,12,14-15: remove usage)

- [ ] **Step 1: Install motion**

Run: `npm install motion`

- [ ] **Step 2: Verify installation**

Run: `npm ls motion`
Expected: `motion@<version>` appears in tree

- [ ] **Step 3: Verify framer-motion is not in the project**

Run: `grep -r "framer-motion" package.json src/ 2>/dev/null`
Expected: No matches. If any found, remove those imports before proceeding.

- [ ] **Step 4: Remove useTilt import and usage from Relics.jsx**

In `src/components/pages/Relics.jsx`, remove line 3:
```jsx
import { useTilt } from '../../hooks/useTilt';
```

In the `RelicCard` component (line 6), remove the hook call:
```jsx
const { ref, onMouseMove, onMouseLeave } = useTilt();
```

On the card div (lines 11-17), remove `ref={ref}`, `onMouseMove={onMouseMove}`, `onMouseLeave={onMouseLeave}`, and `style={{ transformStyle: 'preserve-3d' }}`. Keep the perspective wrapper `<div className="perspective-1000">` — MagneticWrapper will replace it in Task 3.

The card div becomes:
```jsx
<div className="group relative aspect-square border border-white/10 bg-[#050505] overflow-hidden cursor-pointer">
```

- [ ] **Step 5: Delete useTilt.js**

Delete file: `src/hooks/useTilt.js`

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/hooks/useTilt.js src/components/pages/Relics.jsx
git commit -m "chore: install motion, remove useTilt (replaced by MagneticWrapper)"
```

---

## Task 1: MagneticWrapper Component

**Files:**
- Create: `src/components/ui/MagneticWrapper.jsx`

- [ ] **Step 1: Create MagneticWrapper**

```jsx
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const DORMANT_CONFIG = { maxTilt: 15, stiffness: 300, damping: 30 };
const AWAKENED_CONFIG = { maxTilt: 25, stiffness: 150, damping: 10 };

export function MagneticWrapper({ isAwakened = false, children, className = '' }) {
  const ref = useRef(null);
  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  const config = isAwakened ? AWAKENED_CONFIG : DORMANT_CONFIG;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [config.maxTilt, -config.maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-config.maxTilt, config.maxTilt]);

  const springRotateX = useSpring(rotateX, { stiffness: config.stiffness, damping: config.damping });
  const springRotateY = useSpring(rotateY, { stiffness: config.stiffness, damping: config.damping });

  function handleMouseMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  if (isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 800,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (component not yet used, but imports should resolve)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MagneticWrapper.jsx
git commit -m "feat: add MagneticWrapper component with spring-based 3D tilt"
```

---

## Task 2: SpringCard Component

**Files:**
- Create: `src/components/ui/SpringCard.jsx`

- [ ] **Step 1: Create SpringCard**

```jsx
import { useState } from 'react';
import { motion } from 'motion/react';

const DORMANT_CONFIG = {
  y: -4,
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  lineSpring: { type: 'spring', stiffness: 300, damping: 25 },
};

const AWAKENED_CONFIG = {
  y: -8,
  spring: { type: 'spring', stiffness: 200, damping: 12 },
  lineSpring: { type: 'spring', stiffness: 180, damping: 10 },
};

export function SpringCard({ isAwakened = false, children, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  const config = isAwakened ? AWAKENED_CONFIG : DORMANT_CONFIG;

  if (isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ y: isHovered ? config.y : 0 }}
      transition={config.spring}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          transformOrigin: 'left',
          backgroundColor: isAwakened ? '#f05252' : '#555',
        }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={config.lineSpring}
      />
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SpringCard.jsx
git commit -m "feat: add SpringCard component with spring hover lift"
```

---

## Task 3: Wire MagneticWrapper + SpringCard into Relics

**Files:**
- Modify: `src/App.jsx` (line 229: pass isAwakened to Relics)
- Modify: `src/components/pages/Relics.jsx` (wrap cards with MagneticWrapper + SpringCard)

- [ ] **Step 1: Pass isAwakened to Relics in App.jsx**

In `src/App.jsx`, line 229, change:
```jsx
{currentPage === 'relics' && <Relics onItemClick={handleRelicClick} lang={language} />}
```
to:
```jsx
{currentPage === 'relics' && <Relics onItemClick={handleRelicClick} lang={language} isAwakened={isAwakened} />}
```

- [ ] **Step 2: Update Relics.jsx to use MagneticWrapper + SpringCard**

Rewrite `src/components/pages/Relics.jsx`. **Important:** Use the exact field names from `RELICS_DATA` — items have `src`, `code`, `note` (localised object), `id`. NOT `image`/`name`/`type`.

```jsx
import React from 'react';
import { TRANSLATIONS, RELICS_DATA } from '../../data/constants';
import { MagneticWrapper } from '../ui/MagneticWrapper';
import { SpringCard } from '../ui/SpringCard';

const RelicCard = ({ item, lang, onClick, isAwakened }) => {
    const displayNote = (item.note && typeof item.note === 'object') ? item.note[lang] : item.note;

    return (
        <MagneticWrapper isAwakened={isAwakened}>
            <SpringCard
                isAwakened={isAwakened}
                className="group relative aspect-square border border-white/10 bg-[#050505] overflow-hidden cursor-pointer"
            >
                <div onClick={() => onClick(item)} className="w-full h-full relative">
                    <div className="absolute inset-0 w-full h-full">
                        <img src={item.src} alt={item.code} loading="lazy" className="w-full h-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110" />
                    </div>
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-500"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 group-hover:opacity-0">
                        <span className="font-serif text-xs text-red-500 tracking-widest animate-pulse">[{item.code}]</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="font-serif text-white text-lg">{item.code}</p>
                        <p className="font-serif text-xs text-gray-400">{displayNote}</p>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/30 group-hover:border-white transition-colors"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/30 group-hover:border-white transition-colors"></div>
                </div>
            </SpringCard>
        </MagneticWrapper>
    );
};

export const Relics = ({ onItemClick, lang, isAwakened }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="pt-32 px-6 md:px-20 min-h-screen pb-20">
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                <h2 className="font-serif text-4xl text-white tracking-widest">ARCHIVE</h2>
                <span className="font-serif text-xs text-gray-500 mb-2"> // RECOVERED DATA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RELICS_DATA.map((item) => (
                    <RelicCard key={item.id} item={item} lang={lang} onClick={onItemClick} isAwakened={isAwakened} />
                ))}
            </div>
        </div>
    );
};

- [ ] **Step 3: Verify dev server**

Run: `npm run dev`
Open browser, navigate to Relics page. Verify:
- Cards tilt toward cursor on hover
- Cards spring back on mouse leave
- Cards lift up slightly on hover with spring bounce
- Red top-line appears on hover

- [ ] **Step 4: Test awakened state**

Go to Home, click the statue to toggle awakened. Navigate to Relics:
- Tilt should be more aggressive (25deg vs 15deg)
- Spring should be bouncier (more overshoot)
- Top-line should be red

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/pages/Relics.jsx
git commit -m "feat: integrate MagneticWrapper + SpringCard into Relics page"
```

---

## Task 4: Cascade Reveal Hook

**Files:**
- Create: `src/hooks/useCascadeReveal.js`

- [ ] **Step 1: Create useCascadeReveal hook**

```js
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function glitchBurst(element) {
  const tl = gsap.timeline();
  tl.set(element, {
    clipPath: 'inset(20% 0 60% 0)',
    x: -8,
    opacity: 0.7,
  });
  tl.set(element, {
    clipPath: 'inset(60% 0 10% 0)',
    x: 5,
    opacity: 0.5,
  }, '+=0.03');
  tl.set(element, {
    clipPath: 'inset(0)',
    x: 0,
    opacity: 1,
  }, '+=0.03');
  return tl;
}

export function useCascadeReveal(containerRef, { isAwakened = false, itemSelector = '.cascade-item' } = {}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (items.length === 0) return;

    // Set initial state
    gsap.set(items, { opacity: 0, y: 60, scale: 0.9 });

    // Build a master timeline so glitch + reveal are sequenced per item
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    });

    items.forEach((item, i) => {
      const offset = i * 0.12;

      if (isAwakened) {
        // Glitch burst BEFORE reveal (per-item, not global onStart)
        master.add(glitchBurst(item), offset);
      }

      master.fromTo(item,
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
        isAwakened ? offset + 0.06 : offset  // offset after glitch if awakened
      );
    });

    // Bottom line animation (staggered after items appear)
    const lines = container.querySelectorAll('.cascade-line');
    let linesTween = null;
    if (lines.length > 0) {
      linesTween = gsap.fromTo(lines,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          delay: 0.3,
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }

    return () => {
      master.scrollTrigger?.kill();
      master.kill();
      linesTween?.scrollTrigger?.kill();
      linesTween?.kill();
    };
  }, [containerRef, isAwakened, itemSelector]);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCascadeReveal.js
git commit -m "feat: add useCascadeReveal hook with GSAP stagger + glitch burst"
```

---

## Task 5: Wire Cascade Reveal into Relics

**Files:**
- Modify: `src/components/pages/Relics.jsx` (add useCascadeReveal + cascade CSS classes)

- [ ] **Step 1: Add useCascadeReveal to Relics**

In `src/components/pages/Relics.jsx`:

Add import:
```jsx
import { useRef } from 'react';
import { useCascadeReveal } from '../../hooks/useCascadeReveal';
```

In the `Relics` component, add `useRef` and `useCascadeReveal`:
```jsx
export const Relics = ({ onItemClick, lang, isAwakened }) => {
    const t = TRANSLATIONS[lang];
    const gridRef = useRef(null);

    useCascadeReveal(gridRef, { isAwakened, itemSelector: '.cascade-item' });

    return (
        <div className="pt-32 px-6 md:px-20 min-h-screen pb-20">
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                <h2 className="font-serif text-4xl text-white tracking-widest">ARCHIVE</h2>
                <span className="font-serif text-xs text-gray-500 mb-2"> // RECOVERED DATA</span>
            </div>

            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RELICS_DATA.map((item) => (
                    <div key={item.id} className="cascade-item relative">
                        <RelicCard item={item} lang={lang} onClick={onItemClick} isAwakened={isAwakened} />
                        <div
                            className="cascade-line absolute bottom-0 left-0 right-0 h-[2px] origin-left"
                            style={{ backgroundColor: isAwakened ? '#f05252' : '#555' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Test in dev server**

Run: `npm run dev`
Navigate to Relics page. Verify:
- Cards start invisible
- On scroll into view, cards appear one by one with 120ms delay
- Bottom line scales in from left after each card
- Animation only plays once (scroll back up, scroll down — no re-trigger)

- [ ] **Step 3: Test awakened glitch**

Toggle awakened on Home, navigate to Relics:
- Cards should have a brief glitch flicker before appearing
- Bottom line should be red

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/Relics.jsx
git commit -m "feat: wire cascade reveal into Relics grid"
```

---

## Task 6: Liquid Morph Hook

**Files:**
- Create: `src/hooks/useLiquidMorph.js`

- [ ] **Step 1: Create useLiquidMorph hook**

```js
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Fallback titles (used if lang/translations not provided)
const PAGE_TITLES = {
  home: '',
  codex: 'CODEX',
  relics: 'RELICS',
  relic_detail: 'RELIC',
  me: 'TERMINAL',
};

export function useLiquidMorph(titleRef, currentPage, { isAwakened = false, title = '' } = {}) {
  const prevPage = useRef(currentPage);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    if (prevPage.current === currentPage) return;

    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    // Use provided title (from TRANSLATIONS) or fallback to English
    const newTitle = title || PAGE_TITLES[currentPage] || '';
    prevPage.current = currentPage;

    if (!newTitle) {
      // Home page — just fade out
      gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in' });
      return;
    }

    if (isMobile) {
      // Simple fade on mobile (no blur)
      gsap.to(el, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          el.textContent = newTitle;
          gsap.to(el, { opacity: 1, duration: 0.15, ease: 'power2.out' });
        },
      });
      return;
    }

    const duration = isAwakened ? 0.3 : 0.5;
    const blur = isAwakened ? 8 : 12;
    const shadow = isAwakened ? '0 0 20px rgba(240,82,82,0.4)' : 'none';

    const tl = gsap.timeline();

    // Blur out
    tl.to(el, {
      filter: `blur(${blur}px)`,
      opacity: 0,
      textShadow: shadow,
      duration,
      ease: 'power2.in',
      onComplete: () => { el.textContent = newTitle; },
    });

    // Blur in
    tl.fromTo(el,
      { filter: `blur(${blur}px)`, opacity: 0, textShadow: shadow },
      {
        filter: 'blur(0px)',
        opacity: 1,
        textShadow: 'none',
        duration,
        ease: 'power2.out',
      },
      `-=${isAwakened ? 0.1 : 0.2}`
    );
  }, [titleRef, currentPage, isAwakened]);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLiquidMorph.js
git commit -m "feat: add useLiquidMorph hook for page title transitions"
```

---

## Task 7: PageTitle Component + App Integration

**Files:**
- Create: `src/components/PageTitle.jsx`
- Modify: `src/App.jsx` (add PageTitle, pass isAwakened to Codex)

- [ ] **Step 1: Create PageTitle component**

```jsx
import { useRef } from 'react';
import { useLiquidMorph } from '../hooks/useLiquidMorph';
import { TRANSLATIONS } from '../data/constants';

// Map currentPage to the translation key used in TRANSLATIONS
const PAGE_TITLE_KEYS = {
  codex: 'codex_title',
  relics: 'relics_title',
  relic_detail: 'relics_title',
  me: 'me_title',
};

export function PageTitle({ currentPage, isAwakened, lang = 'zh-TW' }) {
  const titleRef = useRef(null);
  const t = TRANSLATIONS[lang] || {};
  const titleKey = PAGE_TITLE_KEYS[currentPage];
  const title = titleKey ? (t[titleKey] || '') : '';

  useLiquidMorph(titleRef, currentPage, { isAwakened, title });

  if (currentPage === 'home') return null;

  return (
    <div
      ref={titleRef}
      className="fixed top-28 left-6 md:left-12 z-40 font-serif text-sm tracking-[0.5em] uppercase text-neutral-600 will-change-[filter] force-gpu pointer-events-none"
    />
  );
}
```

Note: The `PAGE_TITLE_KEYS` mapping should match your actual keys in `TRANSLATIONS`. Check `src/data/constants.js` to verify the exact key names (e.g. `codex_title`, `relics_title`). If the keys don't exist, fall back to the hardcoded English titles in `useLiquidMorph`.

- [ ] **Step 2: Add PageTitle to App.jsx and pass isAwakened to Codex**

In `src/App.jsx`:

Add import near other component imports:
```jsx
import { PageTitle } from './components/PageTitle';
```

Add `<PageTitle>` after the closing `</nav>` tag (line 196), before `{/* Main Content */}` (line 198):
```jsx
        </nav>

        <PageTitle currentPage={currentPage} isAwakened={isAwakened} lang={language} />

        {/* Main Content */}
```

On line 228, pass `isAwakened` to Codex:
```jsx
{currentPage === 'codex' && <Codex lang={language} isAwakened={isAwakened} />}
```

- [ ] **Step 3: Test in dev server**

Run: `npm run dev`
Navigate between pages. Verify:
- Page title blurs out and morphs into new title on navigation
- Title appears as small fixed text in top-left
- Morph runs in parallel with existing PageTransition wipe
- Home page shows no title

- [ ] **Step 4: Test awakened state**

Toggle awakened, then navigate:
- Morph should be faster (600ms vs 1000ms)
- Should see red text-shadow glow during blur phase

- [ ] **Step 5: Commit**

```bash
git add src/components/PageTitle.jsx src/App.jsx
git commit -m "feat: add PageTitle with liquid morph transitions"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No new lint errors

- [ ] **Step 3: Bundle size check**

Run: `npx vite-bundle-visualizer`
Verify `motion` chunk is present and reasonable (~30-34kB gzipped)

- [ ] **Step 4: Full manual test**

Test on desktop browser (Chrome):
1. Home page: statue click toggles awakened
2. Navigate to Relics:
   - Cascade reveal: cards appear one by one on scroll
   - Magnetic tilt: cards tilt toward cursor
   - Spring hover: cards lift with spring bounce, red top-line appears
   - Page title morphs in
3. Navigate to Codex:
   - Page title morphs from RELICS → CODEX
   - Existing scroll animations still work (GsapSplitHeading, codex-fade-in)
4. Toggle awakened and repeat — verify dual-state parameter changes
5. Open Chrome DevTools Performance tab, scroll through Relics — verify 60fps

- [ ] **Step 5: Mobile check**

Open in responsive mode (or real device):
- Magnetic tilt: disabled (no 3D transform on cards)
- Spring hover: disabled (no y displacement)
- Cascade reveal: basic stagger fade-in, no glitch
- Liquid morph: simple opacity fade, no blur
- All touch interactions work normally

- [ ] **Step 6: Commit and push**

```bash
git push -u origin feat/motion-animations
```
