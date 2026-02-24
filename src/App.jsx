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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAwakened, setIsAwakened] = useState(false);

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [language, setLanguage] = useState('zh-TW');

  // Refs for triggering scramble on hover

  const relicsRef = useRef(null);
  const meRef = useRef(null);

  const handleBootComplete = () => {
    setIsLoading(false);
  };

  const handleRelicClick = (relic) => {
    setSelectedRelic(relic);
    setCurrentPage('relic_detail');
  };

  const toggleAwaken = () => {
    setIsAwakened(prev => !prev);
  };

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('loading-state');
    } else {
      document.body.classList.remove('loading-state');
    }
  }, [isLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const titles = {
      'home': 'ROGUE VERGE',

      'relics': 'RELICs // DATA LOG',
      'relic_detail': `[ R / V ] RELIC // ${selectedRelic ? selectedRelic.code : 'UNKNOWN'}`,
      'me': '[ ME ] // PROFILE',
    };

    const targetTitle = titles[currentPage] || 'ROGUE VERGE';
    const duration = 600;
    const scrambleChars = '!<>-_\\/[]{}—=+*^?#';
    let startTime = Date.now();
    let iteration = 0;

    const scrambleTitle = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        document.title = targetTitle;
        clearInterval(interval);
        return;
      }

      const newTitle = targetTitle.split('').map((char, index) => {
        if (index < iteration) {
          return char;
        }
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }).join('');

      document.title = newTitle;
      iteration += 3;
    };

    const interval = setInterval(scrambleTitle, 30);
    return () => clearInterval(interval);
  }, [currentPage, selectedRelic]);

  const t = TRANSLATIONS[language];

  return (
    <React.Fragment>
      {isLoading && <BootSequence onComplete={handleBootComplete} />}

      <div className={`min-h-screen bg-[#020202] text-[#e0e0e0] overflow-x-hidden font-sans transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isAwakened ? 'theme-awakened' : 'theme-dormant'}`}>

        {/* Global Background */}
        <div className="fixed inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
          <img src="/image/background_logo.svg" alt="ROGUE VERGE Background" className="w-full h-full object-cover opacity-5 animate-pulse-slow" style={{ filter: 'grayscale(100%) brightness(30%)' }} />
        </div>
        <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out ${isAwakened && currentPage === 'home' ? 'opacity-30' : 'opacity-0'}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)' }}></div>
        <div className={`fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-1000 ease-out ${isAwakened && currentPage === 'home' ? 'opacity-100 h-[120vh] w-[60vw]' : 'opacity-0 h-0 w-0'}`} style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(255, 255, 255, 0.15) 10deg, rgba(255, 255, 255, 0.4) 20deg, rgba(255, 255, 255, 0.15) 30deg, transparent 40deg)', filter: 'blur(40px)', transformOrigin: 'top center' }}></div>

        {/* Custom Cursor */}
        <CustomCursor isAwakened={isAwakened} />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-6 flex justify-between items-center mix-blend-difference">
          <div className="flex items-center gap-4 cursor-pointer z-50 group" onClick={() => setCurrentPage('home')}>
            <img src="/image/logo.svg" alt="ROGUE VERGE Logo" className="h-10 md:h-10 object-contain transition-all duration-300 ease-in-out grayscale contrast-125 group-hover:grayscale-0 group-hover:filter group-hover:drop-shadow-[0_0_5px_red]" />
          </div>

          <div className="flex gap-6 text-xs font-serif tracking-widest text-white z-50">


            <button
              onClick={() => setCurrentPage('relics')}
              onMouseEnter={() => relicsRef.current?.scramble()}
              className={`relative group transition-colors pt-1 pb-1 cursor-pointer ${currentPage === 'relics' || currentPage === 'relic_detail' ? 'text-red-500' : 'text-white'}`}>
              <ScrambleText ref={relicsRef} text={t.relics_title} className="transition-colors group-hover:text-red-500 pointer-events-none" />
              <span className={`pointer-events-none absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 force-gpu ${currentPage === 'relics' || currentPage === 'relic_detail' ? 'opacity-100 bg-red-600 shadow-[0_0_5px_red] animate-pulse' : 'opacity-0 bg-white group-hover:opacity-50'}`}></span>
            </button>

            <button
              onClick={() => setCurrentPage('me')}
              onMouseEnter={() => meRef.current?.scramble()}
              className={`relative group transition-colors pt-1 pb-1 cursor-pointer ${currentPage === 'me' ? 'text-red-500' : 'text-white'}`}>
              <ScrambleText ref={meRef} text={t.me_title} className="transition-colors group-hover:text-red-500 pointer-events-none" />
              <span className={`pointer-events-none absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 force-gpu ${currentPage === 'me' ? 'opacity-100 bg-red-600 shadow-[0_0_5px_red] animate-pulse' : 'opacity-0 bg-white group-hover:opacity-50'}`}></span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        {currentPage === 'home' && (
          <Home
            isAwakened={isAwakened}
            toggleAwaken={toggleAwaken}
            setCurrentPage={setCurrentPage}
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

        {currentPage === 'relics' && <Relics onItemClick={handleRelicClick} lang={language} />}
        {currentPage === 'relic_detail' && <RelicDetail item={selectedRelic} onBack={() => setCurrentPage('relics')} lang={language} />}
        {currentPage === 'me' && <Me lang={language} />}
      </div>
    </React.Fragment>
  );
}
