import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TRANSLATIONS } from './data/constants';

gsap.registerPlugin(ScrollTrigger);
import { BootSequence } from './components/ui/BootSequence';
import { CustomCursor } from './components/ui/CustomCursor';
import { ScrambleText } from './components/ui/ScrambleText';
import { Home } from './components/pages/Home';

import { Relics } from './components/pages/Relics';
import { RelicDetail } from './components/pages/RelicDetail';
import { Me } from './components/pages/Me';
import { Codex } from './components/pages/Codex';
import { PageTransition } from './components/ui/PageTransition';
import { PageTitle } from './components/PageTitle';
import { ShaderBackground } from './components/ui/ShaderBackground';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAwakened, setIsAwakened] = useState(false);

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [language, setLanguage] = useState('zh-TW');
  const [transition, setTransition] = useState({ isActive: false, phase: null, pendingPage: null });
  const transitionLock = useRef(false);

  // Refs for triggering scramble on hover

  const relicsRef = useRef(null);
  const codexRef = useRef(null);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const handleBootComplete = () => {
    setIsLoading(false);
  };

  const handleRelicClick = (relic) => {
    setSelectedRelic(relic);
    navigateTo('relic_detail', { lightweight: true });
  };

  const toggleAwaken = () => {
    setIsAwakened(prev => !prev);
  };

  const navigateTo = (page, { lightweight = false } = {}) => {
    if (transitionLock.current || page === currentPage) return;

    if (lightweight) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    } else {
      transitionLock.current = true;
      setTransition({ isActive: true, phase: 'enter', pendingPage: page });
    }
  };

  const handleTransitionPhaseComplete = () => {
    setTransition((prev) => {
      if (prev.phase === 'enter') {
        return { ...prev, phase: 'swap' };
      }
      transitionLock.current = false;
      return { isActive: false, phase: null, pendingPage: null };
    });
  };

  useEffect(() => {
    if (transition.phase === 'swap') {
      setCurrentPage(transition.pendingPage);
      window.scrollTo(0, 0);
      setTransition((prev) => ({ ...prev, phase: 'exit' }));
    }
  }, [transition.phase]);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('loading-state');
    } else {
      document.body.classList.remove('loading-state');
    }
  }, [isLoading]);

  useEffect(() => {
    const titles = {
      'home': 'ROGUE VERGE',

      'codex': '[ R / V ] CODEX // THE FLESH IS OBSOLETE',
      'relics': 'RELICs // DATA LOG',
      'relic_detail': `[ R / V ] RELIC // ${selectedRelic ? selectedRelic.code : 'UNKNOWN'}`,
      'me': '[ R / V ] // UNKNOWN',
    };

    const targetTitle = titles[currentPage] || 'ROGUE VERGE';

    // Set correct title immediately (for SEO / social previews)
    document.title = targetTitle;

    // Delayed scramble animation (cosmetic only)
    const duration = 600;
    const scrambleChars = '!<>-_\\/[]{}—=+*^?#';
    let startTime = 0;
    let iteration = 0;

    const delayTimer = setTimeout(() => {
      startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
          document.title = targetTitle;
          clearInterval(interval);
          return;
        }
        const newTitle = targetTitle.split('').map((char, index) => {
          if (index < iteration) return char;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
        document.title = newTitle;
        iteration += 3;
      }, 30);
      // store for cleanup
      cleanupInterval = interval;
    }, 800);

    let cleanupInterval = null;
    return () => {
      clearTimeout(delayTimer);
      if (cleanupInterval) clearInterval(cleanupInterval);
    };
  }, [currentPage, selectedRelic]);

  const t = TRANSLATIONS[language];

  return (
    <React.Fragment>
      {isLoading && <BootSequence onComplete={handleBootComplete} />}

      <div className={`min-h-screen bg-[#020202] text-[#e0e0e0] overflow-x-hidden font-sans transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isAwakened ? 'theme-awakened' : 'theme-dormant'}`}>

        {/* Global Background */}
        <ShaderBackground isAwakened={isAwakened} />
        <div className="fixed inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
          <img src="/image/background_logo.svg" alt="ROGUE VERGE Background" className="w-full h-full object-cover opacity-5 animate-pulse-slow" style={{ filter: 'grayscale(100%) brightness(30%)' }} />
        </div>
        <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out ${isAwakened && currentPage === 'home' ? 'opacity-30' : 'opacity-0'}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)' }}></div>
        <div className={`fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-1000 ease-out ${isAwakened && currentPage === 'home' ? 'opacity-100 h-[120vh] w-[60vw]' : 'opacity-0 h-0 w-0'}`} style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(255, 255, 255, 0.15) 10deg, rgba(255, 255, 255, 0.4) 20deg, rgba(255, 255, 255, 0.15) 30deg, transparent 40deg)', filter: 'blur(40px)', transformOrigin: 'top center' }}></div>

        {/* Global Awakened Vignette — subtle red edge glow across all pages */}
        <div
          className={`fixed inset-0 pointer-events-none z-10 transition-opacity duration-[2000ms] ease-in-out ${isAwakened ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(120, 20, 20, 0.08) 70%, rgba(80, 10, 10, 0.15) 100%)',
            animation: isAwakened ? 'awakenedPulse 4s ease-in-out infinite' : 'none',
          }}
        ></div>

        {/* Custom Cursor */}
        <CustomCursor isAwakened={isAwakened} />
        <PageTransition
          isActive={transition.isActive}
          phase={transition.phase}
          onPhaseComplete={handleTransitionPhaseComplete}
        />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-6 flex justify-between items-center mix-blend-difference">
          <div className="flex items-center gap-4 cursor-pointer z-50 group" onClick={() => {
            // Secret entrance: 5 rapid clicks to access hidden Me page
            logoClickCount.current += 1;
            clearTimeout(logoClickTimer.current);

            if (logoClickCount.current >= 5) {
              logoClickCount.current = 0;
              // Glitch flash feedback
              document.body.style.transition = 'filter 0.1s';
              document.body.style.filter = 'invert(1) hue-rotate(180deg)';
              setTimeout(() => {
                document.body.style.filter = 'none';
                setCurrentPage('me');
              }, 150);
            } else {
              // Navigate home immediately on any click
              navigateTo('home');
              // Reset counter after 2 seconds of inactivity (for secret entrance detection only)
              logoClickTimer.current = setTimeout(() => {
                logoClickCount.current = 0;
              }, 2000);
            }
          }}>
            <img src="/image/logo.svg" alt="ROGUE VERGE Logo" className="h-10 md:h-10 object-contain transition-all duration-300 ease-in-out grayscale contrast-125 group-hover:grayscale-0 group-hover:filter group-hover:drop-shadow-[0_0_5px_red]" />
          </div>

          <div className="flex gap-6 text-xs font-serif tracking-widest text-white z-50">


            <button
              onClick={() => navigateTo('codex')}
              onMouseEnter={() => codexRef.current?.scramble()}
              className={`relative group transition-colors pt-1 pb-1 cursor-pointer ${currentPage === 'codex' ? 'text-red-500' : 'text-white'}`}>
              <ScrambleText ref={codexRef} text={t.codex_title} className="transition-colors group-hover:text-red-500 pointer-events-none" />
              <span className={`pointer-events-none absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 force-gpu ${currentPage === 'codex' ? 'opacity-100 bg-red-600 shadow-[0_0_5px_red] animate-pulse' : 'opacity-0 bg-white group-hover:opacity-50'}`}></span>
            </button>

            <button
              onClick={() => navigateTo('relics')}
              onMouseEnter={() => relicsRef.current?.scramble()}
              className={`relative group transition-colors pt-1 pb-1 cursor-pointer ${currentPage === 'relics' || currentPage === 'relic_detail' ? 'text-red-500' : 'text-white'}`}>
              <ScrambleText ref={relicsRef} text={t.relics_title} className="transition-colors group-hover:text-red-500 pointer-events-none" />
              <span className={`pointer-events-none absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 force-gpu ${currentPage === 'relics' || currentPage === 'relic_detail' ? 'opacity-100 bg-red-600 shadow-[0_0_5px_red] animate-pulse' : 'opacity-0 bg-white group-hover:opacity-50'}`}></span>
            </button>
          </div>
        </nav>

        <PageTitle currentPage={currentPage} isAwakened={isAwakened} lang={language} />

        {/* Main Content */}
        {currentPage === 'home' && (
          <Home
            isAwakened={isAwakened}
            toggleAwaken={toggleAwaken}
            lang={language}
          />
        )}

        {/* Language Switcher */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 mix-blend-difference">
          <div className="flex text-[10px] font-serif tracking-widest items-center bg-black/20 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full hover:border-red-500/50 transition-colors duration-300 cursor-pointer">
            <button
              onClick={() => setLanguage('zh-TW')}
              className={`transition-all duration-300 ${language === 'zh-TW' ? 'text-red-500 font-bold scale-110' : 'text-gray-400 hover:text-white'}`}
            >
              ZH
            </button>
            <span className="text-gray-600 mx-2">/</span>
            <button
              onClick={() => setLanguage('en')}
              className={`transition-all duration-300 ${language === 'en' ? 'text-red-500 font-bold scale-110' : 'text-gray-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Pages */}

        {currentPage === 'codex' && <Codex lang={language} isAwakened={isAwakened} />}
        {currentPage === 'relics' && <Relics onItemClick={handleRelicClick} lang={language} isAwakened={isAwakened} />}
        {currentPage === 'relic_detail' && <RelicDetail item={selectedRelic} onBack={() => navigateTo('relics', { lightweight: true })} lang={language} />}
        {currentPage === 'me' && <Me lang={language} />}
      </div>
    </React.Fragment>
  );
}
