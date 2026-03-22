import { useState } from 'react';
import { motion } from 'motion/react'; // eslint-disable-line no-unused-vars
import { isTouchDevice } from '../../utils/device';

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
