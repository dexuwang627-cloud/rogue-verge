import React, { useEffect, useRef } from 'react';

// --------------------------------------------------------------------------
// Static data — defined outside component to avoid re-creation on render
// --------------------------------------------------------------------------

const CODE_COLUMNS = [
    { left: '5%',  text: 'RVQ/NDU1 4F 0x7F 3A:D2 NULL SIG_BREAK 0xDEAD',       duration: 20, delay: 0 },
    { left: '15%', text: 'TRANSMIT LOCKED 10110 ANOMALY VERGE 0xCAFE NULL',      duration: 16, delay: -4 },
    { left: '30%', text: '3A:D2 0xFF SIG_BREAK RVQ INIT NULL 0x7F FAULT',        duration: 23, delay: -8 },
    { left: '50%', text: '0xDEAD ANOMALY 4F TRANSMIT 10110 VERGE LOCKED 0xBEEF', duration: 18, delay: -2 },
    { left: '70%', text: 'SIG_BREAK NULL 0xCAFE RVQ/NDU1 3A:D2 0xFF FAULT',      duration: 25, delay: -11 },
    { left: '85%', text: 'LOCKED VERGE 0x7F ANOMALY 10110 NULL 0xDEAD RVQ',      duration: 19, delay: -5 },
    { left: '95%', text: '0xFF 4F 3A:D2 TRANSMIT INIT SIG_BREAK 0xBEEF FAULT',  duration: 21, delay: -7 },
];

const GEO_FRAGMENTS = [
    { top: '8%',  left: '12%', type: 'diamond',  rotation: 45 },
    { top: '22%', left: '78%', type: 'bracket',  rotation: 0  },
    { top: '38%', left: '35%', type: 'line',     rotation: 30 },
    { top: '55%', left: '60%', type: 'diamond',  rotation: 45 },
    { top: '68%', left: '20%', type: 'bracket',  rotation: 0  },
    { top: '75%', left: '88%', type: 'line',     rotation: 60 },
    { top: '85%', left: '45%', type: 'diamond',  rotation: 45 },
    { top: '92%', left: '70%', type: 'bracket',  rotation: 0  },
];

const GHOST_TEXTS = [
    { text: 'NOISE GENESIS', top: '12%', left: '8%'  },
    { text: 'OBSOLETE',      top: '38%', left: '55%' },
    { text: 'ROGUE VERGE',   top: '62%', left: '15%' },
    { text: 'DEFIANCE',      top: '82%', left: '65%' },
];

// --------------------------------------------------------------------------
// Fragment sizing helpers (pure functions)
// --------------------------------------------------------------------------

const getFragmentStyle = (type) => {
    if (type === 'diamond') {
        return { width: '20px', height: '20px', border: '1px solid #555' };
    }
    if (type === 'bracket') {
        return { width: '12px', height: '24px', border: '1px solid #555' };
    }
    // line
    return { width: '60px', height: '0px', border: 'none', borderTop: '1px solid #555' };
};

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export const DepthLayers = ({ isAwakened = false }) => {
    const layer1Ref = useRef(null);
    const layer2Ref = useRef(null);
    const layer3Ref = useRef(null);
    const rafRef    = useRef(null);
    const scrollRef = useRef(0);

    // Mobile guard — render nothing on touch devices
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    useEffect(() => {
        if (isTouchDevice) return;
        const onScroll = () => {
            if (rafRef.current) return; // already scheduled — skip

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                const scrollY = window.scrollY;
                scrollRef.current = scrollY;

                // Layer 1 — code rain: slow upward drift
                if (layer1Ref.current) {
                    const y = scrollY * -0.05;
                    layer1Ref.current.style.transform = `translateY(${y}px)`;
                }

                // Layer 2 — geometry: faster upward drift + horizontal sine per fragment
                if (layer2Ref.current) {
                    const baseY = scrollY * -0.12;
                    layer2Ref.current.style.transform = `translateY(${baseY}px)`;

                    const fragments = layer2Ref.current.querySelectorAll('[data-fragment]');
                    fragments.forEach((el, i) => {
                        const hx  = Math.sin(scrollY * 0.002 + i * 2) * 15;
                        const rot = Math.sin(scrollY * 0.001 + i) * 20;
                        const baseRot = GEO_FRAGMENTS[i]?.rotation ?? 0;
                        el.style.transform = `translateX(${hx}px) rotate(${baseRot + rot}deg)`;
                    });
                }

                // Layer 3 — ghost text: very slow drift + opacity pulse
                if (layer3Ref.current) {
                    const y = scrollY * -0.03;
                    layer3Ref.current.style.transform = `translateY(${y}px)`;

                    const labels = layer3Ref.current.querySelectorAll('[data-ghost]');
                    labels.forEach((el, i) => {
                        const op = Math.sin(scrollY * 0.003 + i * 1.5) * 0.02 + 0.03;
                        el.style.opacity = Math.max(0, op);
                    });
                }
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [isTouchDevice]);

    // Awakened mode adjusts CSS animation durations for code rain
    const speedMultiplier = isAwakened ? (1 / 1.3) : 1;

    if (isTouchDevice) return null;

    return (
        <>
            {/* ── Layer 1: Code Rain ── */}
            <div
                ref={layer1Ref}
                className="force-gpu"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.03,
                    overflow: 'hidden',
                }}
            >
                <style>{`
                    @keyframes codefall {
                        from { transform: translateY(-100%); }
                        to   { transform: translateY(100vh); }
                    }
                `}</style>

                {CODE_COLUMNS.map((col, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: col.left,
                            writingMode: 'vertical-rl',
                            whiteSpace: 'nowrap',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            color: '#e0e0e0',
                            letterSpacing: '0.1em',
                            animation: `codefall ${col.duration * speedMultiplier}s linear ${col.delay}s infinite`,
                        }}
                    >
                        {col.text}
                    </div>
                ))}
            </div>

            {/* ── Layer 2: Geometry ── */}
            <div
                ref={layer2Ref}
                className="force-gpu"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.04,
                }}
            >
                {GEO_FRAGMENTS.map((frag, i) => (
                    <div
                        key={i}
                        data-fragment={i}
                        style={{
                            position: 'absolute',
                            top: frag.top,
                            left: frag.left,
                            transform: `rotate(${frag.rotation}deg)`,
                            willChange: 'transform',
                            ...getFragmentStyle(frag.type),
                        }}
                    />
                ))}
            </div>

            {/* ── Layer 3: Ghost Text ── */}
            <div
                ref={layer3Ref}
                className="force-gpu"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 1, // individual items carry their own opacity
                }}
            >
                {GHOST_TEXTS.map((item, i) => (
                    <div
                        key={i}
                        data-ghost={i}
                        style={{
                            position: 'absolute',
                            top: item.top,
                            left: item.left,
                            fontFamily: "'Cinzel', serif",
                            fontSize: 'clamp(2rem, 5vw, 5rem)',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: '#e0e0e0',
                            opacity: 0.025,
                            userSelect: 'none',
                            willChange: 'opacity',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.text}
                    </div>
                ))}
            </div>
        </>
    );
};
