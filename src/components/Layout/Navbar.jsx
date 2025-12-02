import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ScrambleText from '../UI/ScrambleText';
import { TRANSLATIONS } from '../../data/constants';

const Navbar = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    const location = useLocation();
    const currentPage = location.pathname.split('/')[1] || 'home';

    return (
        <nav className="fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-6 flex justify-between items-center mix-blend-difference">
            {/* Logo Only */}
            <Link to="/" className="flex items-center gap-4 cursor-pointer z-50">
                <img src="/image/logo.svg" alt="ROGUE VERGE Logo" className="h-10 md:h-10 object-contain transition-all duration-300 ease-in-out grayscale contrast-125 group-hover:grayscale-0 group-hover:filter group-hover:drop-shadow-[0_0_5px_red]" />
            </Link>

            {/* Nav Links */}
            <div className="flex gap-6 text-xs font-serif tracking-widest text-white z-50">

                {/* Manifest */}
                <Link to="/manifesto"
                    className={`relative group transition-colors pt-1 pb-1 cursor-pointer ${currentPage === 'manifesto' ? 'text-red-500' : 'text-white'}`}
                    aria-label={t.manifesto_title}
                >
                    <ScrambleText
                        text={t.manifesto_title}
                        className="transition-colors group-hover:text-red-500"
                    />
                    <span className={`absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 force-gpu ${currentPage === 'manifesto'
                        ? 'opacity-100 bg-red-600 shadow-[0_0_5px_red] animate-pulse'
                        : 'opacity-0 bg-white group-hover:opacity-50'
                        }`}></span>
                </Link>

                {/* Relics */}
                <Link to="/relics"
                    className={`relative group transition-colors pt-1 pb-1 cursor-pointer ${currentPage === 'relics' ? 'text-red-500' : 'text-white'}`}
                    aria-label={t.relics_title}
                >
                    <ScrambleText
                        text={t.relics_title}
                        className="transition-colors group-hover:text-red-500"
                    />
                    <span className={`absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 force-gpu ${currentPage === 'relics'
                        ? 'opacity-100 bg-red-600 shadow-[0_0_5px_red] animate-pulse'
                        : 'opacity-0 bg-white group-hover:opacity-50'
                        }`}></span>
                </Link>

                {/* Shop */}
                <a href="https://www.rogueverge.com"
                    className="relative group transition-colors cursor-pointer no-underline pt-1 pb-1 text-white"
                    aria-label={t.shop_title}
                >
                    <ScrambleText
                        text={t.shop_title}
                        className="transition-colors group-hover:text-red-500"
                    />
                    <span className="absolute bottom-0 left-0 w-full h-[1px] opacity-0 bg-white transition-all duration-300 group-hover:opacity-50"></span>
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
