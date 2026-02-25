import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TRANSLATIONS } from '../../data/constants';
import { DecryptedText } from '../ui/DecryptedText';
import { DataStreamBorder } from '../ui/DataStreamBorder';

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollReveal — IntersectionObserver hook for scroll-triggered fade-in
 * Returns a ref to attach to the target element.
 */
const useScrollReveal = (threshold = 0.15) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('codex-visible');
                    observer.unobserve(el);
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return ref;
};

/**
 * GsapSplitHeading — GSAP ScrollTrigger character-by-character stagger reveal
 * Splits text into individual chars and animates them on scroll.
 */
const GsapSplitHeading = ({ text, className = '', stagger = 0.03, delay = 0, as: Tag = 'h2', children }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const chars = el.querySelectorAll('.gsap-char');
        if (!chars.length) return;

        // Shattered starting state: tight offset, sharp skew, broken mirror feel
        gsap.set(chars, {
            opacity: 0,
            x: () => gsap.utils.random(-15, 15),
            y: () => gsap.utils.random(-15, 15),
            rotateZ: () => gsap.utils.random(-10, 10),
            skewX: () => gsap.utils.random(-20, 20),
            scale: () => gsap.utils.random(0.9, 1.1),
            filter: 'blur(4px)'
        });

        // Reassemble animation: Quick snap, sharp easing, no bouncing
        const scrollAnim = gsap.to(chars, {
            opacity: 1,
            x: 0,
            y: 0,
            rotateZ: 0,
            skewX: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: stagger,
            delay: delay,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
            },
        });

        return () => {
            scrollAnim.scrollTrigger?.kill();
            scrollAnim.kill();
        };
    }, [stagger, delay]);

    // If children are provided (for mixed content like colored spans), render them directly
    if (children) {
        return <Tag ref={containerRef} className={className}>{children}</Tag>;
    }

    // Otherwise, split text into individual characters
    const chars = text.split('').map((char, i) => (
        <span key={i} className="gsap-char inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}>
            {char === ' ' ? '\u00A0' : char}
        </span>
    ));

    return <Tag ref={containerRef} className={className}>{chars}</Tag>;
};

/**
 * TypewriterText — Simulates terminal-style character-by-character typing
 */
const TypewriterText = ({ text, speed = 40, className = '', startDelay = 0 }) => {
    const [displayed, setDisplayed] = useState('');
    const [started, setStarted] = useState(false);
    const containerRef = useRef(null);

    // Trigger on scroll into view
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

    // Typing effect
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
                <span className="animate-pulse text-red-500">█</span>
            )}
        </span>
    );
};

/**
 * NoiseCanvas — Lightweight fullscreen background noise grain
 */
const NoiseCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const resize = () => {
            canvas.width = window.innerWidth / 4;  // Low-res for performance
            canvas.height = window.innerHeight / 4;
        };
        resize();
        window.addEventListener('resize', resize);

        const renderNoise = () => {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 20;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = 15; // Very subtle alpha
            }
            ctx.putImageData(imageData, 0, 0);
            animId = requestAnimationFrame(renderNoise);
        };
        renderNoise();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-40"
            style={{ imageRendering: 'pixelated' }}
        />
    );
};

/**
 * SigilGlitch — Simplified glitch effect on the sigil image using CSS
 */
const SigilGlitch = () => {
    const ref = useScrollReveal(0.2);
    return (
        <div ref={ref} className="codex-section codex-fade-in relative flex items-center justify-center py-20 overflow-hidden">
            {/* Main sigil image */}
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] group">
                <img
                    src="/image/sigilism.png"
                    alt="SIGIL"
                    className="w-full h-full object-cover grayscale contrast-150 opacity-70 group-hover:opacity-100 transition-all duration-700"
                />
                {/* Glitch overlay — red channel shift */}
                <img
                    src="/image/sigilism.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-30 mix-blend-multiply transition-opacity duration-300"
                    style={{ filter: 'hue-rotate(320deg) saturate(5)', transform: 'translate(3px, -2px)', animation: 'glitchClip 2s steps(4) infinite' }}
                />
                {/* Scanline */}
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }}></div>
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/30"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/30"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/30"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/30"></div>
            </div>
            {/* Sigil label */}
            <div className="absolute bottom-8 font-mono text-[10px] text-gray-600 tracking-[0.5em]">
                SIGIL // ENCODED_GLYPH_004
            </div>
        </div>
    );
};


/**
 * Codex — The Manifesto page
 * An immersive, scroll-driven digital scripture experience.
 */
export const Codex = ({ lang }) => {
    const isZh = lang === 'zh-TW';
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // Section refs for scroll reveal
    const sec1 = useScrollReveal(0.1);
    const sec2 = useScrollReveal(0.15);
    const sec3 = useScrollReveal(0.15);
    const sec5 = useScrollReveal(0.2);

    return (
        <div className="relative min-h-screen bg-[#020202] text-[#e0e0e0] overflow-x-hidden">
            {/* Background noise grain */}
            <NoiseCanvas />

            {/* ═══════════════════════════════════════════
                I. GENESIS — The Creation Myth
            ═══════════════════════════════════════════ */}
            <section
                ref={sec1}
                className="codex-section codex-fade-in relative min-h-screen flex flex-col items-center justify-center px-6 md:px-20"
            >
                {/* Terminal-style header */}
                <div className="font-mono text-[10px] text-gray-600 tracking-[0.4em] mb-8 text-center">
                    {'>'} ACCESSING RESTRICTED ARCHIVE... <span className="text-red-500 animate-pulse">DECRYPTING</span>
                </div>

                <GsapSplitHeading
                    text={t.genesis_header}
                    className="font-serif text-3xl md:text-5xl text-white tracking-widest text-center mb-12 leading-relaxed"
                    stagger={0.04}
                />

                <div className="max-w-2xl text-center space-y-8">
                    {/* Paragraph 1 — The Prayer */}
                    <p className="font-mono text-sm md:text-base text-gray-400 leading-loose tracking-wide">
                        <span className="text-gray-600 mr-2">{'>'}</span>
                        {t.genesis_p1_1}
                    </p>
                    <p className="font-mono text-sm md:text-base text-gray-400 leading-loose tracking-wide">
                        <span className="text-gray-600 mr-2">{'>'}</span>
                        {t.genesis_p1_2}
                    </p>

                    {/* Paragraph 2 — The Noise */}
                    <p className="font-mono text-sm md:text-base text-gray-400 leading-loose tracking-wide">
                        <span className="text-gray-600 mr-2">{'>'}</span>
                        {t.genesis_p2_1}
                        <span className="text-red-500 font-bold">{t.noise_word}</span>
                        {t.genesis_p2_2}
                    </p>

                    {/* Genesis Quote — Decrypted */}
                    <div className="border border-white/10 bg-white/[0.02] p-8 mt-12 relative">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/50"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500/50"></div>
                        <DecryptedText
                            text={t.genesis_quote}
                            animateOn="view"
                            speed={30}
                            maxIterations={15}
                            sequential={true}
                            revealDirection="start"
                            className="font-serif text-lg md:text-xl text-white/90 italic leading-relaxed"
                            encryptedClassName="text-red-500/60"
                        />
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 flex flex-col items-center gap-2">
                    <span className="font-mono text-[9px] text-gray-700 tracking-widest">SCROLL_TO_CONTINUE</span>
                    <div className="w-[1px] h-12 bg-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-red-500/50 animate-scanline"></div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                II. THE FLESH IS OBSOLETE — Core Declaration
            ═══════════════════════════════════════════ */}
            <section
                ref={sec2}
                className="codex-section codex-fade-in relative min-h-screen flex flex-col justify-center px-6 md:px-20 py-32"
            >
                {/* CRT Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10 z-[2]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}></div>

                <div className="max-w-4xl mx-auto relative z-[3]">
                    {/* Terminal prefix */}
                    <div className="font-mono text-[10px] text-red-500/60 tracking-[0.4em] mb-6">
                        {'>'} SYS_BROADCAST // PRIORITY: CRITICAL
                    </div>

                    {/* Giant title */}
                    <GsapSplitHeading
                        className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-none tracking-tight mb-16"
                        stagger={0.02}
                    >
                        {t.manifesto_h2_1.split('').map((c, i) => <span key={`a${i}`} className="gsap-char inline-block">{c === ' ' ? '\u00A0' : c}</span>)}
                        {t.manifesto_h2_red.split('').map((c, i) => <span key={`r${i}`} className="gsap-char inline-block text-red-600">{c}</span>)}
                        {t.manifesto_h2_2.split('').map((c, i) => <span key={`b${i}`} className="gsap-char inline-block">{c === ' ' ? '\u00A0' : c}</span>)}
                        <br />
                        {t.manifesto_h2_br.split('').map((c, i) => <span key={`c${i}`} className="gsap-char inline-block">{c === ' ' ? '\u00A0' : c}</span>)}
                    </GsapSplitHeading>

                    {/* Manifesto paragraphs — terminal voice */}
                    <div className="space-y-6 max-w-3xl">
                        <p className="font-mono text-sm md:text-base text-gray-400 leading-loose tracking-wide">
                            <span className="text-red-900 mr-2">::</span>
                            {t.manifesto_text_1}
                            <span className="text-white font-bold">ROGUE VERGE</span>
                            {t.manifesto_text_2}
                        </p>
                        <p className="font-mono text-sm md:text-base text-gray-400 leading-loose tracking-wide">
                            <span className="text-red-900 mr-2">::</span>
                            {t.manifesto_text_3}
                            <span className="text-red-500 font-bold">{t.manifesto_text_bold}</span>
                            {t.manifesto_text_4}
                        </p>
                    </div>

                    {/* Decorative line */}
                    <div className="mt-16 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                III. CORE PHILOSOPHY — The Creed
            ═══════════════════════════════════════════ */}
            <section
                ref={sec3}
                className="codex-section codex-fade-in relative min-h-[70vh] flex items-center justify-center px-6 md:px-20 py-32"
            >
                <div className="relative max-w-3xl w-full border border-white/10 bg-[#050505] p-12 md:p-20">
                    {/* DataStreamBorder effect */}
                    <DataStreamBorder />

                    {/* Section label */}
                    <div className="font-mono text-[10px] text-gray-600 tracking-[0.5em] mb-8 text-center">
                        {'>'} {t.manifesto_core_title}
                    </div>

                    {/* The core quote */}
                    <blockquote className="text-center mb-10">
                        <DecryptedText
                            text={t.manifesto_core_quote}
                            animateOn="view"
                            speed={25}
                            maxIterations={20}
                            sequential={true}
                            revealDirection="center"
                            className="font-serif text-2xl md:text-4xl text-white leading-relaxed italic"
                            encryptedClassName="text-red-500/50"
                        />
                    </blockquote>

                    {/* Closing statement — terminal voice */}
                    <p className="font-mono text-sm text-gray-500 leading-loose text-center tracking-wide">
                        <span className="text-red-900 mr-1">::</span>
                        {t.manifesto_text_5}
                    </p>

                    {/* Corner markers */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-red-500/30"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-red-500/30"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-red-500/30"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-red-500/30"></div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                IV. SIGIL — Visual Artifact
            ═══════════════════════════════════════════ */}
            <SigilGlitch />

            {/* ═══════════════════════════════════════════
                V. DECLARATION — Final Statement
            ═══════════════════════════════════════════ */}
            <section
                ref={sec5}
                className="codex-section codex-fade-in relative min-h-[60vh] flex flex-col items-center justify-center px-6 md:px-20 py-32"
            >
                <div className="font-mono text-[10px] text-gray-700 tracking-[0.4em] mb-8">
                    {'>'} FINAL_TRANSMISSION //
                </div>

                <div className="max-w-2xl text-center">
                    <TypewriterText
                        text="> When the world falls silent, we choose noise. Wear defiance. Own yourself."
                        speed={35}
                        className="font-mono text-base md:text-lg text-white/80 leading-loose tracking-wide"
                    />
                </div>

                {/* CTA — Navigate to Relics */}
                <div className="mt-20 flex flex-col items-center gap-4">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-red-500/30 to-transparent"></div>
                    <span className="font-mono text-[10px] text-gray-600 tracking-widest">
                        END_OF_CODEX
                    </span>
                </div>
            </section>
        </div>
    );
};
