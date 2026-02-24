import React, { useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../../data/constants';
import { ScrambleText } from '../ui/ScrambleText';
import { GlitchGeometryBlock } from '../ui/GlitchGeometryBlock';

export const Home = ({ isAwakened, toggleAwaken, setCurrentPage, lang }) => {
    const t = TRANSLATIONS[lang];
    const locRef = useRef(null);
    const lastUpdateRef = useRef(0);

    // Track mouse movement locally without triggering React state updates
    useEffect(() => {
        const handleMouseMove = (e) => {
            const now = Date.now();
            if (now - lastUpdateRef.current > 100 && locRef.current) {
                locRef.current.textContent = `LOC: [${e.clientX}, ${e.clientY}]`;
                lastUpdateRef.current = now;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <React.Fragment>
            {/* Glitch Effect Element — Top of page */}
            <GlitchGeometryBlock />

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center pt-24 overflow-hidden perspective-1000">
                <div className="relative group cursor-pointer z-30" onClick={toggleAwaken}>
                    <div className={`relative w-[300px] h-[400px] md:w-[400px] md:h-[550px] transition-all duration-1000 ease-out overflow-hidden bg-black border border-[#222] ${isAwakened ? 'shadow-[0_0_50px_rgba(255,255,255,0.1)] scale-105' : 'shadow-none grayscale'}`}>
                        <img src="./image/after.png" alt="Awakened State" className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${isAwakened ? 'opacity-100 grayscale-0 contrast-110 brightness-110' : 'opacity-0'}`} />
                        <img src="./image/before.png" alt="Dormant State" className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${isAwakened ? 'opacity-0' : 'opacity-100 grayscale contrast-125 brightness-50'}`} />

                        {isAwakened && (
                            <React.Fragment>
                                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 mix-blend-color-dodge" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/50 animate-scanline"></div>
                            </React.Fragment>
                        )}
                    </div>
                    <div className={`absolute -inset-4 border transition-all duration-1000 ease-out ${isAwakened ? 'border-white/30 translate-x-2 translate-y-2 opacity-100' : 'border-white/5 opacity-50'}`}></div>
                    <div className={`absolute -inset-4 border transition-all duration-1000 ease-out ${isAwakened ? 'border-white/30 -translate-x-2 -translate-y-2 opacity-100' : 'border-white/5 opacity-50'}`}></div>

                    <div className="absolute -bottom-16 left-0 w-full text-center font-serif text-xs tracking-[0.5em] uppercase">
                        {isAwakened ? <span className="text-white animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">System: Awakened</span> : <span className="text-gray-600">System: Dormant</span>}
                    </div>
                </div>

                {/* Bottom Interaction */}
                <div className={`absolute bottom-8 w-full flex flex-col items-center transition-all duration-700 ${isAwakened ? 'opacity-0 translate-y-10' : 'opacity-100'} z-50`}>
                    <ScrambleText text={t.home_cta} className="font-serif text-xs text-gray-400 tracking-[0.3em] cursor-help mb-4 hover:text-red-500 transition-colors" />
                    <div className="w-[1px] h-16 bg-gray-800 relative overflow-hidden mb-4">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-white animate-scanline"></div>
                    </div>
                    <div className="flex gap-8 font-serif text-[10px] text-gray-400">
                        <span ref={locRef}>LOC: [0, 0]</span>
                        <span>VEL: 65%</span>
                        <span className="animate-pulse text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">SYSTEM_READY</span>
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
};
