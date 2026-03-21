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
  }, [titleRef, currentPage, isAwakened, title]);
}
