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
        {isEnter && (
          <div
            className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500"
            style={{
              boxShadow: '0 0 15px rgba(239,68,68,0.5), 0 0 30px rgba(239,68,68,0.2)',
            }}
          />
        )}
      </div>
    </div>
  );
};
