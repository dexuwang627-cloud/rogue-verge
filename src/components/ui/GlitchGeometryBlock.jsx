import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DecryptedText } from './DecryptedText';

gsap.registerPlugin(ScrollTrigger);

export const GlitchGeometryBlock = () => {
    const sectionRef = useRef(null);
    const topRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const overlayRef = useRef(null);
    const textContainerRef = useRef(null);
    const textTriggerRef = useRef(null);
    const scaleRef = useRef({ value: 0.25 });

    // Canvas animation logic (Top Section Background)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let img = new Image();
        img.src = './image/sigilism.png';

        let width = 0;
        let height = 0;

        const resize = () => {
            if (!topRef.current) return;
            const style = window.getComputedStyle(topRef.current);
            width = parseInt(style.width, 10);
            height = parseInt(style.height, 10);

            // Limit resolution for performance
            const maxRes = 800;
            const ratio = width / height;
            if (width > maxRes) {
                canvas.width = maxRes;
                canvas.height = maxRes / ratio;
            } else {
                canvas.width = width;
                canvas.height = height;
            }
        };

        const render = () => {
            if (!isMounted) return;
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            // Background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            // Draw Base Image with glitch offsets
            if (img.complete && img.naturalHeight !== 0) {
                const imgAspect = img.width / img.height;
                const canvasAspect = w / h;
                let drawW = w;
                let drawH = h;

                if (imgAspect > canvasAspect) {
                    drawH = w / imgAspect;
                } else {
                    drawW = h * imgAspect;
                }
                const currentScale = scaleRef.current.value;
                const sw = drawW * currentScale;
                const sh = drawH * currentScale;
                const dx = (w - sw) / 2;
                const dy = (h - sh) / 2;

                ctx.save();
                // Random RGB shifts
                const maxShift = w * 0.05 * currentScale;
                if (Math.random() > 0.9) {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.drawImage(img, dx + (Math.random() - 0.5) * maxShift, dy, sw, sh);
                    ctx.drawImage(img, dx, dy + (Math.random() - 0.5) * maxShift, sw, sh);
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(img, dx, dy, sw, sh);
                }
                ctx.restore();

                // Aggressive Slicing
                if (Math.random() > 0.8) {
                    const sliceY = dy + Math.random() * sh;
                    const sliceH = Math.random() * (sh * 0.2);
                    const sliceMaxX = w * 0.1 * currentScale;
                    const offsetX = (Math.random() - 0.5) * sliceMaxX;

                    try {
                        // Hardware accelerated slicing by drawing the canvas back onto itself
                        ctx.drawImage(canvas, 0, sliceY, w, sliceH, offsetX, sliceY, w, sliceH);
                    } catch (e) {
                        // ignore out of bounds
                    }
                }
            }

            // Color crushing
            if (Math.random() > 0.95) {
                ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, 0.2)`;
                ctx.fillRect(0, 0, w, h);
            }

            animationRef.current = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();

        let isMounted = true;

        img.onload = () => {
            if (isMounted) {
                animationRef.current = requestAnimationFrame(render);
            }
        };

        return () => {
            isMounted = false;
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // GSAP ScrollTrigger Logic
    useGSAP(() => {
        let textTriggered = false;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "+=150%", // Extend scroll distance for smoother experience
                scrub: 1, // Smooth scrubbing
                pin: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    if (self.progress > 0.8 && !textTriggered) {
                        textTriggered = true;
                        if (textTriggerRef.current) textTriggerRef.current.startScramble();
                    } else if (self.progress < 0.8 && textTriggered) {
                        textTriggered = false;
                    }
                }
            }
        });

        // Internal Canvas Scale Animation
        tl.to(scaleRef.current, {
            value: 1,
            duration: 1,
            ease: "power2.inOut"
        }, 0);

        // Fade in dark overlay to reduce glitch visibility to 20% (opacity 0.8 black)
        tl.to(overlayRef.current, {
            opacity: 0.8,
            duration: 0.3,
            ease: "power2.inOut"
        }, 0.7);

        // Fade in text container
        tl.to(textContainerRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.inOut"
        }, 0.7);

    }, { scope: sectionRef });

    return (
        <div className="w-full">
            <div ref={sectionRef} className="relative h-screen w-full bg-black overflow-hidden border-t border-white/10">
                {/* --- TOP SECTION --- */}
                <div ref={topRef} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black z-20">
                    {/* Canvas Background */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full mix-blend-screen opacity-100 filter contrast-125 saturate-150"
                    />

                    {/* Scanlines Overlay (Hardware Accelerated CSS) */}
                    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px)' }}></div>
                    {/* Vignette Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80 z-20"></div>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black opacity-60 z-20"></div>

                    {/* Darkening Overlay for Text Reveal */}
                    <div ref={overlayRef} className="absolute inset-0 pointer-events-none bg-black opacity-0 z-30"></div>

                    {/* Decrypted Text Container */}
                    <div ref={textContainerRef} className="absolute z-40 flex items-center justify-center opacity-0 pointer-events-none w-full h-full">
                        <DecryptedText
                            ref={textTriggerRef}
                            text="ROGUE VERGE"
                            speed={50}
                            maxIterations={15}
                            sequential={true}
                            revealDirection="center"
                            className="font-serif text-5xl md:text-8xl text-white tracking-[0.2em] font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            encryptedClassName="text-red-500 font-mono tracking-widest opacity-80"
                            animateOn="none"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};
