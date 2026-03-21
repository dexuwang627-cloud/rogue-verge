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
