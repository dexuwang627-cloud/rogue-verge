import React from 'react';
import { TRANSLATIONS, RELICS_DATA } from '../../data/constants';

export const Relics = ({ onItemClick, lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="pt-32 px-6 md:px-20 min-h-screen pb-20">
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                <h2 className="font-serif text-4xl text-white tracking-widest">ARCHIVE</h2>
                <span className="font-serif text-xs text-gray-500 mb-2"> // RECOVERED DATA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RELICS_DATA.map((item) => {
                    const displayNote = (item.note && typeof item.note === 'object') ? item.note[lang] : item.note;

                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            className="group relative aspect-square border border-white/10 bg-[#050505] overflow-hidden cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full">
                                <img src={item.src} alt={item.code} className="w-full h-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-500"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 group-hover:opacity-0">
                                <span className="font-serif text-xs text-red-500 tracking-widest animate-pulse">[{item.code}]</span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <p className="font-serif text-white text-lg">{item.code}</p>
                                <p className="font-serif text-xs text-gray-400">{displayNote}</p>
                            </div>
                            <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/30 group-hover:border-white transition-colors"></div>
                            <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/30 group-hover:border-white transition-colors"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
