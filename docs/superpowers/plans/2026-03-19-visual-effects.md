# Visual Effects Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scanline wipe page transitions for main navigation, 3D tilt + glitch hover on relic cards, and remove the acquire button.

**Architecture:** Pure CSS animations + a lightweight React hook for tilt. No new dependencies. PageTransition is a full-screen overlay driven by `onAnimationEnd`. useTilt uses direct DOM manipulation via refs to avoid re-renders.

**Tech Stack:** React 19, Tailwind CSS v4, CSS keyframes, existing GSAP (untouched)

**Spec:** `docs/superpowers/specs/2026-03-19-visual-effects-design.md`

**Note:** Line numbers are approximate — match by code pattern, not line number.

---

## File Structure

| File | Status | Responsibility |
|------|--------|----------------|
| `src/components/ui/PageTransition.jsx` | **New** | Full-screen scanline wipe overlay with enter/exit phases |
| `src/hooks/useTilt.js` | **New** | 3D tilt hook — mousemove tracking, direct DOM transform |
| `src/index.css` | Modify | New keyframes (scanline-wipe-enter/exit), relic-glitch-overlay styles, fade-enter classes |
| `src/App.jsx` | Modify | `navigateTo()` function, PageTransition integration, remove `setCurrentPage` prop from Home |
| `src/components/pages/Home.jsx` | Modify | Remove unused `setCurrentPage` prop |
| `src/components/pages/Relics.jsx` | Modify | Apply useTilt, add glitch overlay, wrap cards in perspective |
| `src/components/pages/RelicDetail.jsx` | Modify | Add fade-enter animation, remove acquire button + price |
| `src/data/constants.js` | Modify | Remove `acquire_asset` and `sold_out` translation keys |

---

### Task 1: Add CSS keyframes and utility classes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add scanline-wipe keyframes to `@theme`**

In `src/index.css`, inside the `@theme { }` block (after the existing `@keyframes data-scroll` block), add:

```css
@keyframes scanline-wipe-enter {
  0% {
    transform: scaleY(0);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes scanline-wipe-exit {
  0% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(0);
  }
}
```

Do NOT add `--animate-scanline-wipe-*` theme tokens — the PageTransition component uses inline animation styles directly.

- [ ] **Step 2: Add relic-glitch-overlay styles**

Append after the `.codex-visible` block (end of file):

```css
/* ═══════════════════════════════════════════
   Relic card — glitch hover overlay
═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   Detail page — fade enter
═══════════════════════════════════════════ */
.fade-enter {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
```

- [ ] **Step 3: Verify dev server shows no CSS errors**

Run: check browser console at http://localhost:5173/ — no errors, existing animations still work.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: add scanline-wipe keyframes, glitch overlay, and fade-enter CSS"
```

---

### Task 2: Create PageTransition component

**Files:**
- Create: `src/components/ui/PageTransition.jsx`

- [ ] **Step 1: Create the component**

The scanline glow sits inside the curtain div at `bottom: 0` so it naturally tracks the curtain's leading edge as the curtain scales. Uses `will-change: transform` directly instead of `force-gpu` class to avoid the `transform: translateZ(0)` conflicting with the `scaleY` animation.

```jsx
import React from 'react';

export const PageTransition = ({ isActive, phase, onPhaseComplete }) => {
  if (!isActive) return null;

  const isEnter = phase === 'enter';
  const isExit = phase === 'exit';

  if (!isEnter && !isExit) return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto">
      <div
        className="absolute inset-0 bg-[#020202]"
        style={{
          willChange: 'transform',
          transformOrigin: isEnter ? 'top' : 'bottom',
          animation: isEnter
            ? 'scanline-wipe-enter 350ms cubic-bezier(0.76, 0, 0.24, 1) forwards'
            : 'scanline-wipe-exit 400ms cubic-bezier(0.76, 0, 0.24, 1) forwards',
        }}
        onAnimationEnd={onPhaseComplete}
      >
        {/* Scanline glow — inside curtain at bottom edge, tracks the leading edge */}
        {isEnter && (
          <div
            className="absolute bottom-0 left-0 w-full h-[2px] bg-white"
            style={{
              boxShadow: '0 0 15px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.2)',
            }}
          />
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify file is valid JSX**

Run: check that `npm run dev` still compiles without errors (component is not yet mounted).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/PageTransition.jsx
git commit -m "feat: add PageTransition scanline wipe component"
```

---

### Task 3: Create useTilt hook

**Files:**
- Create: `src/hooks/useTilt.js`

- [ ] **Step 1: Create the hook**

During active mouse tracking, `transition` is set to `'none'` for immediate response. On mouse leave, `transition` is restored for a smooth reset animation.

```js
import { useRef, useCallback } from 'react';

const MAX_TILT = 10; // degrees

export const useTilt = () => {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const ratioX = (e.clientX - centerX) / (rect.width / 2);
    const ratioY = (e.clientY - centerY) / (rect.height / 2);

    const rotateX = -ratioY * MAX_TILT;
    const rotateY = ratioX * MAX_TILT;

    el.style.transition = 'none';
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.style.transition = 'transform 0.15s ease-out';
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
};
```

- [ ] **Step 2: Verify file is valid**

Run: check `npm run dev` still compiles (hook not yet used).

- [ ] **Step 3: Commit**

```bash
mkdir -p src/hooks
git add src/hooks/useTilt.js
git commit -m "feat: add useTilt hook for 3D card tilt effect"
```

---

### Task 4: Integrate PageTransition into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add imports and transition state**

At top of App.jsx, add import (after the existing component imports):
```jsx
import { PageTransition } from './components/ui/PageTransition';
```

Inside `App()`, add state after the existing state declarations (`language` state):
```jsx
const [transition, setTransition] = useState({ isActive: false, phase: null, pendingPage: null });
const transitionLock = useRef(false);
```

Note: `useRef` is already imported on line 1.

- [ ] **Step 2: Add `navigateTo` function**

After the `toggleAwaken` function, add. Uses an explicit `{ lightweight }` option flag for clarity — callers decide which transition type they want:

```jsx
const navigateTo = (page, { lightweight = false } = {}) => {
  if (transitionLock.current || page === currentPage) return;

  if (lightweight) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  } else {
    transitionLock.current = true;
    setTransition({ isActive: true, phase: 'enter', pendingPage: page });
  }
};

const handleTransitionPhaseComplete = () => {
  setTransition((prev) => {
    if (prev.phase === 'enter') {
      return { ...prev, phase: 'swap' };
    }
    // Exit complete — cleanup
    transitionLock.current = false;
    return { isActive: false, phase: null, pendingPage: null };
  });
};
```

- [ ] **Step 3: Add useEffect for the swap phase**

After the `handleTransitionPhaseComplete` function, add a useEffect that handles the page swap cleanly (avoids state updates and side effects inside a state updater):

```jsx
useEffect(() => {
  if (transition.phase === 'swap') {
    setCurrentPage(transition.pendingPage);
    window.scrollTo(0, 0);
    setTransition((prev) => ({ ...prev, phase: 'exit' }));
  }
}, [transition.phase]);
```

- [ ] **Step 4: Replace `setCurrentPage` calls with `navigateTo`**

In the nav section, replace these with standard (non-lightweight) navigateTo:
- `setCurrentPage('home')` (in logo click handler, the single-click branch) → `navigateTo('home')`
- `onClick={() => setCurrentPage('codex')}` → `onClick={() => navigateTo('codex')}`
- `onClick={() => setCurrentPage('relics')}` → `onClick={() => navigateTo('relics')}`

Keep `setCurrentPage('me')` unchanged (secret entrance keeps glitch flash).

- [ ] **Step 5: Update detail navigation to use lightweight**

Replace `handleRelicClick`:
```jsx
const handleRelicClick = (relic) => {
  setSelectedRelic(relic);
  navigateTo('relic_detail', { lightweight: true });
};
```

Replace the RelicDetail `onBack` prop:
```jsx
{currentPage === 'relic_detail' && <RelicDetail item={selectedRelic} onBack={() => navigateTo('relics', { lightweight: true })} lang={language} />}
```

- [ ] **Step 6: Remove `setCurrentPage` prop from Home**

Update the Home component render to remove the prop:
```jsx
<Home
  isAwakened={isAwakened}
  toggleAwaken={toggleAwaken}
  lang={language}
/>
```

- [ ] **Step 7: Add PageTransition to render**

Right after `<CustomCursor isAwakened={isAwakened} />`, add:
```jsx
<PageTransition
  isActive={transition.isActive}
  phase={transition.phase}
  onPhaseComplete={handleTransitionPhaseComplete}
/>
```

- [ ] **Step 8: Remove the manual `scrollTo` useEffect**

Remove the existing `useEffect` that does `window.scrollTo(0, 0)` on `currentPage` change — scrolling is now handled in both paths: inside the `swap` phase useEffect for main nav, and inside `navigateTo` for lightweight nav.

- [ ] **Step 9: Verify in browser**

Test all transitions:
1. Home → Codex (nav button): scanline wipe
2. Codex → Relics (nav button): scanline wipe
3. Relics → Home (logo click): scanline wipe
4. Relics → relic_detail (card click): no wipe, lightweight switch
5. relic_detail → Relics (back button): no wipe, lightweight switch
6. relic_detail → Home (logo click): scanline wipe
7. relic_detail → Codex (nav button): scanline wipe
8. 5x logo click: existing glitch flash → Me page

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate PageTransition with navigateTo routing logic"
```

---

### Task 5: Remove unused `setCurrentPage` prop from Home.jsx

**Files:**
- Modify: `src/components/pages/Home.jsx`

- [ ] **Step 1: Remove prop**

Change the function signature from:
```jsx
export const Home = ({ isAwakened, toggleAwaken, setCurrentPage, lang }) => {
```
to:
```jsx
export const Home = ({ isAwakened, toggleAwaken, lang }) => {
```

`setCurrentPage` is not used anywhere in the Home component body — only declared in the props.

- [ ] **Step 2: Commit**

```bash
git add src/components/pages/Home.jsx
git commit -m "refactor: remove unused setCurrentPage prop from Home"
```

---

### Task 6: Apply useTilt + glitch overlay to Relics.jsx

**Files:**
- Modify: `src/components/pages/Relics.jsx`

- [ ] **Step 1: Create a RelicCard sub-component with tilt**

Replace the entire file with:

```jsx
import React from 'react';
import { TRANSLATIONS, RELICS_DATA } from '../../data/constants';
import { useTilt } from '../../hooks/useTilt';

const RelicCard = ({ item, lang, onClick }) => {
    const { ref, onMouseMove, onMouseLeave } = useTilt();
    const displayNote = (item.note && typeof item.note === 'object') ? item.note[lang] : item.note;

    return (
        <div className="perspective-1000">
            <div
                ref={ref}
                onClick={() => onClick(item)}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="group relative aspect-square border border-white/10 bg-[#050505] overflow-hidden cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className="absolute inset-0 w-full h-full">
                    <img src={item.src} alt={item.code} className="w-full h-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110" />
                </div>
                {/* Glitch overlay — inherits background from inline style */}
                <div
                    className="relic-glitch-overlay"
                    style={{ backgroundImage: `url(${item.src})` }}
                />
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
        </div>
    );
};

export const Relics = ({ onItemClick, lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="pt-32 px-6 md:px-20 min-h-screen pb-20">
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                <h2 className="font-serif text-4xl text-white tracking-widest">ARCHIVE</h2>
                <span className="font-serif text-xs text-gray-500 mb-2"> // RECOVERED DATA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RELICS_DATA.map((item) => (
                    <RelicCard key={item.id} item={item} lang={lang} onClick={onItemClick} />
                ))}
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Verify in browser**

Navigate to Relics page. Hover over cards:
- Cards should tilt following the cursor
- RGB glitch effect should flash briefly on hover enter
- Cards should smoothly reset on mouse leave

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/Relics.jsx
git commit -m "feat: add 3D tilt and glitch hover to relic cards"
```

---

### Task 7: Add fade-enter to RelicDetail + remove acquire button

**Files:**
- Modify: `src/components/pages/RelicDetail.jsx`

- [ ] **Step 1: Add fade-enter effect and remove acquire button**

Replace the file with:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS } from '../../data/constants';
import { DataStreamBorder } from '../ui/DataStreamBorder';

export const RelicDetail = ({ item, onBack, lang }) => {
    if (!item || !item.images || item.images.length === 0) return null;

    const t = TRANSLATIONS[lang];
    const displayNote = (item.note && typeof item.note === 'object') ? item.note[lang] : item.note;
    const displayDesc = (item.description && typeof item.description === 'object') ? item.description[lang] : item.description;

    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = item.images.length;
    const containerRef = useRef(null);

    useEffect(() => {
        setCurrentSlide(0);
    }, [item]);

    // Fade-enter: mount with .fade-enter (opacity 0, translateY 20px),
    // then RAF adds .fade-enter-active to transition to visible state.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        requestAnimationFrame(() => {
            el.classList.add('fade-enter-active');
        });
    }, []);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    return (
        <div ref={containerRef} className="fade-enter pt-32 px-6 md:px-20 min-h-screen pb-20">
            <button
                onClick={onBack}
                className="mb-8 text-xs font-serif text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span> {t.back_to_archive}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="relative border border-white/10 bg-[#050505] p-4 group">
                    <DataStreamBorder />
                    <div className="overflow-hidden relative aspect-square">
                        <div
                            className="flex transition-transform duration-500 ease-in-out h-full"
                            style={{ width: `${totalSlides * 100}%`, transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` }}
                        >
                            {item.images.map((imgSrc, index) => (
                                <div key={index} className="flex-shrink-0 h-full flex items-center justify-center" style={{ width: `${100 / totalSlides}%` }}>
                                    <img src={imgSrc} alt={`${item.code} - ${index}`} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {totalSlides > 1 && (
                        <React.Fragment>
                            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-3 text-white/70 hover:text-white transition-colors z-20">&gt;</button>
                            <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-3 text-white/70 hover:text-white transition-colors z-20">&lt;</button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/30 px-3 py-1 rounded z-20">
                                {item.images.map((_, index) => (
                                    <div key={index} className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${currentSlide === index ? 'bg-red-500' : 'bg-white/40 hover:bg-white/70'}`} onClick={() => setCurrentSlide(index)}></div>
                                ))}
                            </div>
                        </React.Fragment>
                    )}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/50"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/50"></div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight mb-2">{item.code}</h2>
                        <p className="font-serif text-sm text-red-500 tracking-widest">{displayNote}</p>
                    </div>
                    <div className="w-full h-[1px] bg-white/10"></div>
                    <div className="space-y-4">
                        <p className="font-serif text-xs text-gray-500">[ DESCRIPTION ]</p>
                        <p className="font-serif text-sm text-gray-300 leading-relaxed">{displayDesc || "No data available for this relic."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
```

Key changes: added `containerRef` + `fade-enter` class + `useEffect` for `fade-enter-active`, removed the entire price + acquire button block.

- [ ] **Step 2: Verify in browser**

Click a relic card → detail page should fade in smoothly. The acquire button and price should be gone.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/RelicDetail.jsx
git commit -m "feat: add fade-enter to RelicDetail, remove acquire button"
```

---

### Task 8: Clean up unused translation keys

**Files:**
- Modify: `src/data/constants.js`

- [ ] **Step 1: Remove `acquire_asset` and `sold_out` from both language blocks**

In the `zh-TW` block, remove:
```
acquire_asset: "ACQUIRE_ASSET",
sold_out: "Sold Out",
```

In the `en` block, remove the same two keys.

- [ ] **Step 2: Verify no remaining references**

Search for `acquire_asset` and `sold_out` across `src/` — should return zero results (RelicDetail no longer uses them).

- [ ] **Step 3: Commit**

```bash
git add src/data/constants.js
git commit -m "chore: remove unused acquire_asset and sold_out translation keys"
```

---

### Task 9: Final verification

- [ ] **Step 1: Full navigation test**

Test all transitions in browser:
1. Home → Codex (nav button): scanline wipe
2. Codex → Relics (nav button): scanline wipe
3. Relics → Home (logo click): scanline wipe
4. Relics → relic_detail (card click): no wipe, lightweight with fade
5. relic_detail → Relics (back button): no wipe, lightweight
6. relic_detail → Home (logo click): scanline wipe
7. relic_detail → Codex (nav button): scanline wipe
8. 5x logo click: existing glitch flash → Me page

- [ ] **Step 2: Relic card interaction test**

1. Hover card: 3D tilt follows cursor
2. Hover card: brief glitch flash on enter
3. Leave card: smooth reset to flat
4. On mobile/touch (if available): no tilt, normal hover

- [ ] **Step 3: Verify no console errors**

Open browser DevTools → Console. Navigate through all pages. No errors or warnings.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 5: Commit build verification (if any fixes needed)**
