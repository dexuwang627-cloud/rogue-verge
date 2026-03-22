import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

const HeartbeatFlash = forwardRef(function HeartbeatFlash({ isAwakened = false }, ref) {
  const glitchRef = useRef(null);
  const scanlineRef = useRef(null);
  const redGlowRef = useRef(null);
  const rafRef = useRef(null);
  const decayTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    trigger() {
      // 1. Glitch flash — remove and re-add active class to force animation restart
      const glitch = glitchRef.current;
      if (glitch) {
        glitch.classList.remove('heartbeat-flash-active');
        // Force reflow so the browser registers the class removal before re-adding
        void glitch.offsetWidth;
        glitch.classList.add('heartbeat-flash-active');
      }

      // 2. Scanline sweep from top to bottom (RAF-driven)
      const scanline = scanlineRef.current;
      if (scanline) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const boxShadow = isAwakened
          ? '0 0 40px rgba(240,82,82,0.7)'
          : '0 0 20px rgba(240,82,82,0.5)';
        scanline.style.boxShadow = boxShadow;
        scanline.style.top = '0px';
        scanline.style.opacity = '0.6';

        const targetHeight = window.innerHeight;
        let top = 0;
        function step() {
          top += 8;
          if (top >= targetHeight) {
            scanline.style.top = `${targetHeight}px`;
            scanline.style.opacity = '0';
            rafRef.current = null;
            return;
          }
          scanline.style.top = `${top}px`;
          rafRef.current = requestAnimationFrame(step);
        }
        rafRef.current = requestAnimationFrame(step);
      }

      // 3. Red glow — flash to 1, then decay
      const redGlow = redGlowRef.current;
      if (redGlow) {
        if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
        redGlow.style.transition = 'none';
        redGlow.style.opacity = '1';

        const decayMs = isAwakened ? 3000 : 2000;
        decayTimerRef.current = setTimeout(() => {
          redGlow.style.transition = `opacity ${decayMs}ms ease-out`;
          redGlow.style.opacity = '0';
          decayTimerRef.current = null;
        }, 300);
      }
    },
  }));

  return (
    <>
      {/* Glitch flash overlay — full-screen, plays heartbeatFlash keyframe */}
      <div
        ref={glitchRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      {/* Scanline — 2px red bar that sweeps top to bottom */}
      <div
        ref={scanlineRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          height: '2px',
          backgroundColor: '#f05252',
          boxShadow: '0 0 20px rgba(240,82,82,0.5)',
          zIndex: 4,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      {/* Red glow overlay — radial gradient, fades in/out */}
      <div
        ref={redGlowRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0,
          background:
            'radial-gradient(ellipse at center, rgba(240,82,82,0.08), transparent 70%)',
        }}
      />
    </>
  );
});

export default HeartbeatFlash;
