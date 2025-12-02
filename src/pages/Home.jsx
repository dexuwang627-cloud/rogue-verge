import React from 'react';
import { Link } from 'react-router-dom';
import ScrambleText from '../components/UI/ScrambleText';
import { TRANSLATIONS } from '../data/constants';

const Home = ({ isAwakened, toggleAwaken, mousePos, lang }) => {
    const t = TRANSLATIONS[lang];

    return (
        <React.Fragment>
            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center pt-24 overflow-hidden perspective-1000">

                <div className="relative group cursor-pointer z-30" onClick={toggleAwaken} role="button" tabIndex="0" aria-label="Toggle system awakening" onKeyPress={(e) => e.key === 'Enter' && toggleAwaken()}>
                    {/* Image Container */}
                    <div className={`relative w-[300px] h-[400px] md:w-[400px] md:h-[550px] transition-all duration-1000 ease-out overflow-hidden bg-black border border-[#222] ${isAwakened ? 'shadow-[0_0_50px_rgba(255,255,255,0.1)] scale-105' : 'shadow-none grayscale'}`}>
                        <img src="/image/after.png" alt="Awakened State" className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${isAwakened ? 'opacity-100 grayscale-0 contrast-110 brightness-110' : 'opacity-0'}`} />
                        <img src="/image/before.png" alt="Dormant State" className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${isAwakened ? 'opacity-0' : 'opacity-100 grayscale contrast-125 brightness-50'}`} />

                        {isAwakened && (
                            <React.Fragment>
                                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 mix-blend-color-dodge" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/50 animate-scanline"></div>
                            </React.Fragment>
                        )}
                    </div>
                    {/* Borders */}
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
                        <span>LOC: [{mousePos.x}, {mousePos.y}]</span>
                        <span>VEL: 65%</span>
                        <span className="animate-pulse text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">SYSTEM_READY</span>
                    </div>
                </div>
            </section>

            {/* Home Manifesto Preview */}
            <section className="relative py-24 px-6 md:px-20 max-w-4xl mx-auto">
                <div className="flex flex-col gap-12">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-[1px] transition-colors duration-500 ${isAwakened ? 'bg-white box-shadow-[0_0_10px_white]' : 'bg-red-900'}`}></div>
                        <h2 className={`font-serif text-sm tracking-widest transition-colors duration-500 ${isAwakened ? 'text-white' : 'text-red-900'}`}>{t.genesis_header}</h2>
                    </div>

                    <div className="font-serif text-2xl md:text-2xl leading-tight space-y-8">
                        <p>
                            {/* P1 */}
                            {t.genesis_p1_1}<span className={`transition-colors duration-1000 ${isAwakened ? 'text-white drop-shadow-[0_0_5px_white]' : 'text-gray-500'}`}>{t.genesis_p1_2}</span>
                        </p>
                        <p>
                            {/* P2 */}
                            {t.genesis_p2_1}
                            <span className="relative inline-block mx-1">
                                <span className="absolute top-0 left-0 -ml-1.5 text-red-600 opacity-90 animate-noise force-gpu">{t.noise_word}</span>
                                <span className="absolute top-0 left-0 ml-1.5 text-blue-600 opacity-90 animate-noise force-gpu" style={{ animationDirection: 'reverse' }}>{t.noise_word}</span>
                                <strong className="relative z-10 font-serif text-white opacity-90 bg-black/50 px-1 animate-noise">{t.noise_word}</strong>
                            </span>
                            {t.genesis_p2_2}
                        </p>
                        <p className="opacity-80 text-xl md:text-2xl font-serif pt-4 border-l-2 border-white pl-6">
                            {t.genesis_quote}
                        </p>
                    </div>
                    <div className="text-center pt-12">
                        <Link to="/manifesto" className="px-8 py-3 border border-white/20 text-xs font-serif tracking-[0.2em] hover:bg-white hover:text-black transition-all">{t.read_manifesto}</Link>
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
};

export default Home;
