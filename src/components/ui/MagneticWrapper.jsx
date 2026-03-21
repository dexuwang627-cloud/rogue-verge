import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'; // eslint-disable-line no-unused-vars

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
