import React, { useEffect, useRef, useState } from 'react';
import { TRANSLATIONS } from '../../data/constants';
import { AcidWarp } from '../ui/AcidWarp';
import { DepthLayers } from '../ui/DepthLayers';
import HeartbeatFlash from '../ui/HeartbeatFlash';
import { DecryptedText } from '../ui/DecryptedText';
import { useAtmosphere } from '../../hooks/useAtmosphere';
import { GlitchGeometryBlock } from '../ui/GlitchGeometryBlock';

// ---------------------------------------------------------------------------
// TypewriterText -- terminal-style character-by-character typing
// ---------------------------------------------------------------------------
const TypewriterText = ({ text, speed = 40, className = '', startDelay = 0 }) => {
    const [displayed, setDisplayed] = useState('');
    const [started, setStarted] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setTimeout(() => setStarted(true), startDelay);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [started, startDelay]);

    useEffect(() => {
        if (!started) return;
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [started, text, speed]);

    return (
        <span ref={containerRef} className={className}>
            {displayed}
            {started && displayed.length < text.length && (
                <span className="animate-pulse text-red-500">&#x2588;</span>
            )}
        </span>
    );
};

// ---------------------------------------------------------------------------
// SigilGlitch -- CSS glitch effect on the sigil image
// ---------------------------------------------------------------------------
const SigilGlitch = () => {
    return (
        <div
            data-reveal
            className="relative flex items-center justify-center py-20 overflow-hidden"
            style={REVEAL_STYLE}
        >
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] group">
                <img
                    src="/image/sigilism.png"
                    alt="SIGIL"
                    className="w-full h-full object-cover grayscale contrast-150 opacity-70 group-hover:opacity-100 transition-all duration-700"
                />
                {/* Glitch overlay -- red channel shift */}
                <img
                    src="/image/sigilism.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-30 mix-blend-multiply transition-opacity duration-300"
                    style={{
                        filter: 'hue-rotate(320deg) saturate(5)',
                        transform: 'translate(3px, -2px)',
                        animation: 'glitchClip 2s steps(4) infinite',
                    }}
                />
                {/* Scanline */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
                    }}
                />
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/30" />
            </div>
            {/* Sigil label */}
            <div
                className="absolute bottom-8"
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.7rem',
                    letterSpacing: '0.4em',
                    color: '#555',
                }}
            >
                SIGIL // ENCODED_GLYPH_004
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Noise texture SVG data URL
// ---------------------------------------------------------------------------
const NOISE_SVG_URL =
    "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E";

// ---------------------------------------------------------------------------
// Inline style constants (shared across sections)
// ---------------------------------------------------------------------------
const BODY_TEXT_STYLE = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.95rem',
    lineHeight: '2',
    color: '#555',
};

const HEARTBEAT_TEXT_STYLE = {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(2rem, 7vw, 6rem)',
    letterSpacing: '0.15em',
};

const QUOTE_TEXT_STYLE = {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(1.2rem, 2.8vw, 1.8rem)',
    fontStyle: 'italic',
};

const LABEL_STYLE = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.7rem',
    letterSpacing: '0.4em',
};

const REVEAL_STYLE = {
    opacity: 0,
    transform: 'translateY(30px)',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
};

// ---------------------------------------------------------------------------
// useScrollReveal -- IntersectionObserver for [data-reveal] elements
// ---------------------------------------------------------------------------
function useDataReveal(containerRef) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const elements = container.querySelectorAll('[data-reveal]');
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.15 }
        );

        for (const el of elements) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, [containerRef]);
}

// ---------------------------------------------------------------------------
// Codex -- The Manifesto page (Immersive Flow layout)
// ---------------------------------------------------------------------------
export const Codex = ({ lang, isAwakened }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const contentRef = useRef(null);
    const { acidState, flashRef } = useAtmosphere({ isAwakened });

    // Activate scroll-reveal for all [data-reveal] elements
    useDataReveal(contentRef);

    return (
        <div
            className="relative overflow-x-hidden"
            style={{ backgroundColor: '#020202', minHeight: '100vh' }}
        >
            {/* Background animation layers */}
            <AcidWarp state={acidState} />
            <DepthLayers isAwakened={isAwakened} />
            <HeartbeatFlash ref={flashRef} isAwakened={isAwakened} />

            {/* Noise overlay */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 3,
                    pointerEvents: 'none',
                    opacity: 0.04,
                    backgroundImage: `url("${NOISE_SVG_URL}")`,
                    backgroundSize: '256px 256px',
                }}
            />

            {/* Vignette overlay */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2,
                    pointerEvents: 'none',
                    background:
                        'radial-gradient(ellipse at center, transparent 40%, #020202 100%)',
                }}
            />

            {/* Main content */}
            <div ref={contentRef} style={{ position: 'relative', zIndex: 10 }}>

                {/* Sigilism scroll animation — Codex entry gate */}
                <GlitchGeometryBlock />

                {/* ============================================================
                    Opening
                ============================================================ */}
                <section
                    id="codex-opening"
                    className="flex flex-col items-center justify-center px-6 md:px-20"
                    style={{ height: '100vh' }}
                >
                    <div
                        className="text-center mb-8"
                        style={{ ...LABEL_STYLE, color: '#555' }}
                    >
                        {'>'} ACCESSING RESTRICTED ARCHIVE...
                    </div>

                    <h1
                        className="text-white tracking-widest text-center mb-12"
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                            letterSpacing: '0.2em',
                        }}
                    >
                        CODEX
                    </h1>

                    {/* Decorative line */}
                    <div
                        className="mb-12"
                        style={{
                            width: '120px',
                            height: '1px',
                            background:
                                'linear-gradient(to right, transparent, rgba(239,68,68,0.4), transparent)',
                        }}
                    />

                    <div style={{ ...LABEL_STYLE, color: '#444' }}>
                        SCROLL TO DECRYPT
                    </div>
                </section>

                {/* ============================================================
                    Genesis body
                ============================================================ */}
                <section
                    id="codex-genesis"
                    className="max-w-3xl mx-auto px-6 md:px-20 py-24"
                >
                    <p
                        data-reveal
                        style={{
                            ...BODY_TEXT_STYLE,
                            ...REVEAL_STYLE,
                            marginBottom: '2rem',
                        }}
                    >
                        <span style={{ color: '#444', marginRight: '0.5rem' }}>{'>'}</span>
                        {t.genesis_p1_1}
                    </p>

                    <p
                        data-reveal
                        style={{
                            ...BODY_TEXT_STYLE,
                            ...REVEAL_STYLE,
                            marginBottom: '2rem',
                        }}
                    >
                        <span style={{ color: '#444', marginRight: '0.5rem' }}>{'>'}</span>
                        {t.genesis_p1_2}
                    </p>

                    <p
                        data-reveal
                        style={{
                            ...BODY_TEXT_STYLE,
                            ...REVEAL_STYLE,
                            marginBottom: '2rem',
                        }}
                    >
                        <span style={{ color: '#444', marginRight: '0.5rem' }}>{'>'}</span>
                        {t.genesis_p2_1}
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                            {t.noise_word}
                        </span>
                        {t.genesis_p2_2}
                    </p>
                </section>

                {/* ============================================================
                    Heartbeat 1 -- THE FLESH IS OBSOLETE
                ============================================================ */}
                <section
                    id="codex-heartbeat-1"
                    className="flex items-center justify-center px-6 md:px-20"
                    style={{ height: '60vh' }}
                >
                    <h2
                        className="text-white text-center leading-none"
                        style={HEARTBEAT_TEXT_STYLE}
                    >
                        {t.manifesto_h2_1}
                        <span style={{ color: '#dc2626' }}>{t.manifesto_h2_red}</span>
                        {t.manifesto_h2_2}
                        <br />
                        {t.manifesto_h2_br}
                    </h2>
                </section>

                {/* ============================================================
                    Manifesto body
                ============================================================ */}
                <section
                    id="codex-manifesto"
                    className="max-w-3xl mx-auto px-6 md:px-20 py-24"
                >
                    <p
                        data-reveal
                        style={{
                            ...BODY_TEXT_STYLE,
                            ...REVEAL_STYLE,
                            marginBottom: '2rem',
                        }}
                    >
                        <span style={{ color: '#7f1d1d', marginRight: '0.5rem' }}>::</span>
                        {t.manifesto_text_1}
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>ROGUE VERGE</span>
                        {t.manifesto_text_2}
                    </p>

                    <p
                        data-reveal
                        style={{
                            ...BODY_TEXT_STYLE,
                            ...REVEAL_STYLE,
                            marginBottom: '2rem',
                        }}
                    >
                        <span style={{ color: '#7f1d1d', marginRight: '0.5rem' }}>::</span>
                        {t.manifesto_text_3}
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                            {t.manifesto_text_bold}
                        </span>
                        {t.manifesto_text_4}
                    </p>
                </section>

                {/* ============================================================
                    Core Quote
                ============================================================ */}
                <section
                    className="flex items-center justify-center px-6 md:px-20"
                    style={{ height: '70vh' }}
                >
                    <div
                        className="relative max-w-3xl w-full p-12 md:p-20"
                        style={{ backgroundColor: '#050505' }}
                    >
                        {/* Red corner brackets */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-red-500/50" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-red-500/50" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-red-500/50" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-red-500/50" />

                        <blockquote className="text-center" style={QUOTE_TEXT_STYLE}>
                            <DecryptedText
                                text={t.manifesto_core_quote}
                                animateOn="view"
                                speed={25}
                                maxIterations={20}
                                sequential={true}
                                revealDirection="center"
                                className="text-white leading-relaxed"
                                encryptedClassName="text-red-500/50"
                            />
                        </blockquote>
                    </div>
                </section>

                {/* ============================================================
                    Heartbeat 2 -- WEAR DEFIANCE
                ============================================================ */}
                <section
                    id="codex-heartbeat-2"
                    className="flex items-center justify-center px-6 md:px-20"
                    style={{ height: '60vh' }}
                >
                    <h2
                        className="text-white text-center leading-none"
                        style={HEARTBEAT_TEXT_STYLE}
                    >
                        WEAR{' '}
                        <span style={{ color: '#dc2626' }}>DEFIANCE</span>
                    </h2>
                </section>

                {/* ============================================================
                    Sigil
                ============================================================ */}
                <section
                    className="flex items-center justify-center px-6 md:px-20"
                    style={{ height: '80vh' }}
                >
                    <SigilGlitch />
                </section>

                {/* ============================================================
                    Declaration (final)
                ============================================================ */}
                <section
                    id="codex-final"
                    className="flex flex-col items-center justify-center px-6 md:px-20"
                    style={{ height: '60vh' }}
                >
                    <div className="mb-8" style={{ ...LABEL_STYLE, color: '#555' }}>
                        {'>'} FINAL_TRANSMISSION //
                    </div>

                    <div className="max-w-2xl text-center">
                        <TypewriterText
                            text={`> ${t.manifesto_text_5}`}
                            speed={35}
                            className="font-mono text-base md:text-lg text-white/80 leading-loose tracking-wide"
                        />
                    </div>

                    <div className="mt-20 flex flex-col items-center gap-4">
                        <div
                            style={{
                                width: '1px',
                                height: '64px',
                                background:
                                    'linear-gradient(to bottom, rgba(239,68,68,0.3), transparent)',
                            }}
                        />
                        <span style={{ ...LABEL_STYLE, color: '#555' }}>
                            END_OF_CODEX
                        </span>
                    </div>
                </section>

            </div>
        </div>
    );
};
