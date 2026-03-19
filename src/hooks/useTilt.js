import { useRef, useCallback } from 'react';

const MAX_TILT = 5; // degrees

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
