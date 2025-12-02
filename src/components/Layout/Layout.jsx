import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BootSequence from '../UI/BootSequence';

const Layout = ({ lang, setLang }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAwakened, setIsAwakened] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Cursor refs
    const cursorMainRef = useRef(null);
    const cursorTrail1Ref = useRef(null);
    const cursorTrail2Ref = useRef(null);

    const handleBootComplete = () => {
        setIsLoading(false);
    };

    useEffect(() => {
        if (isLoading) {
            document.body.classList.add('loading-state');
        } else {
            document.body.classList.remove('loading-state');
        }
    }, [isLoading]);

    // Custom Cursor Logic
    useEffect(() => {
        const trail1Pos = { x: 0, y: 0 };
        const trail2Pos = { x: 0, y: 0 };
        let currentMousePos = { x: 0, y: 0 };

        const handleMouseMove = (e) => {
            currentMousePos = { x: e.clientX, y: e.clientY };
            setMousePos({ x: e.clientX, y: e.clientY });

            if (cursorMainRef.current) {
                cursorMainRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0) rotate(45deg)`;
            }
        };

        const renderLoop = () => {
            trail1Pos.x += (currentMousePos.x - trail1Pos.x) * 0.2;
            trail1Pos.y += (currentMousePos.y - trail1Pos.y) * 0.2;

            trail2Pos.x += (currentMousePos.x - trail2Pos.x) * 0.1;
            trail2Pos.y += (currentMousePos.y - trail2Pos.y) * 0.1;

            if (cursorTrail1Ref.current) {
                cursorTrail1Ref.current.style.transform = `translate3d(${trail1Pos.x - 12}px, ${trail1Pos.y - 12}px, 0) rotate(45deg)`;
            }
            if (cursorTrail2Ref.current) {
                cursorTrail2Ref.current.style.transform = `translate3d(${trail2Pos.x - 8}px, ${trail2Pos.y - 8}px, 0) rotate(45deg)`;
            }

            requestAnimationFrame(renderLoop);
        };

        window.addEventListener('mousemove', handleMouseMove);
        const animationId = requestAnimationFrame(renderLoop);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    const toggleAwaken = () => {
        setIsAwakened(prev => !prev);
    };

    return (
        <React.Fragment>
            {isLoading && <BootSequence onComplete={handleBootComplete} />}

            {/* SVG Filter for Blood Effect */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="blood-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
                </filter>
            </svg>

            <div className={`min-h-screen bg-[#020202] text-[#e0e0e0] overflow-x-hidden font-sans transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isAwakened ? 'theme-awakened' : 'theme-dormant'}`}>

                {/* Global Background */}
                <div className="fixed inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                    <img src="/image/background_logo.svg" alt="ROGUE VERGE Background" className="w-full h-full object-cover opacity-20 animate-pulse-slow" style={{ filter: 'grayscale(100%) brightness(30%)' }} />
                </div>
                <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out ${isAwakened ? 'opacity-30' : 'opacity-0'}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)' }}></div>
                <div className={`fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-1000 ease-out ${isAwakened ? 'opacity-100 h-[120vh] w-[60vw]' : 'opacity-0 h-0 w-0'}`} style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(255, 255, 255, 0.15) 10deg, rgba(255, 255, 255, 0.4) 20deg, rgba(255, 255, 255, 0.15) 30deg, transparent 40deg)', filter: 'blur(40px)', transformOrigin: 'top center' }}></div>

                {/* Cursor Trails & Primary Cursor */}
                <div ref={cursorTrail1Ref} className="fixed w-6 h-6 border border-white/40 rotate-45 pointer-events-none z-[59] mix-blend-difference transition-transform duration-500 ease-out delay-[50ms] force-gpu" style={{ left: 0, top: 0 }}></div>
                <div ref={cursorTrail2Ref} className="fixed w-4 h-4 border border-white/20 rotate-45 pointer-events-none z-[58] mix-blend-difference transition-transform duration-500 ease-out delay-[100ms] force-gpu" style={{ left: 0, top: 0 }}></div>
                <div ref={cursorMainRef} className="fixed w-8 h-8 border border-white rotate-45 pointer-events-none z-[60] mix-blend-difference transition-transform duration-100 ease-out flex items-center justify-center force-gpu" style={{ left: 0, top: 0 }}>
                    <div className={`w-1 h-1 bg-white rounded-full ${isAwakened ? 'animate-ping bg-red-500' : ''}`}></div>
                </div>

                <Navbar lang={lang} setLang={setLang} />

                <main className="relative z-30">
                    <Outlet context={{ isAwakened, toggleAwaken, mousePos }} />
                </main>

                {/* Language Switcher */}
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 mix-blend-difference">
                    <div className="flex text-[10px] font-serif tracking-widest items-center bg-black/20 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full hover:border-red-500/50 transition-colors duration-300 cursor-pointer">
                        <button
                            onClick={() => setLang('zh-TW')}
                            className={`transition-all duration-300 ${lang === 'zh-TW' ? 'text-red-500 font-bold scale-110' : 'text-gray-400 hover:text-white'}`}
                            aria-label="Switch to Traditional Chinese"
                        >
                            ZH
                        </button>
                        <span className="text-gray-600 mx-2">/</span>
                        <button
                            onClick={() => setLang('en')}
                            className={`transition-all duration-300 ${lang === 'en' ? 'text-red-500 font-bold scale-110' : 'text-gray-400 hover:text-white'}`}
                            aria-label="Switch to English"
                        >
                            EN
                        </button>
                    </div>
                </div>

                <Footer />
            </div>
        </React.Fragment>
    );
};

export default Layout;
