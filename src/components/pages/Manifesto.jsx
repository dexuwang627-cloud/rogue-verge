import React from 'react';
import { TRANSLATIONS } from '../../data/constants';

export const Manifesto = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="pt-32 px-6 md:px-20 max-w-5xl mx-auto min-h-screen pb-20">
            <div className="border-l border-red-900/50 pl-8 md:pl-16 py-8">
                <h2 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">
                    {t.manifesto_h2_1}<span className="text-red-600">{t.manifesto_h2_red}</span>{t.manifesto_h2_2} <br /> {t.manifesto_h2_br}
                </h2>
                <div className="space-y-12 font-serif text-gray-400 leading-relaxed text-lg md:text-xl">
                    <p>
                        {t.manifesto_text_1}
                        <span className="text-white"> ROGUE VERGE</span>{t.manifesto_text_2}
                    </p>
                    <p>
                        {t.manifesto_text_3}<strong className="text-white">{t.manifesto_text_bold}</strong>{t.manifesto_text_4}
                    </p>
                    <div className="p-6 border border-white/10 bg-white/5 mt-12">
                        <p className="text-red-500 text-sm tracking-widest mb-4">{t.manifesto_core_title}</p>
                        <p className="text-white italic font-serif text-2xl">
                            {t.manifesto_core_quote}
                        </p>
                    </div>
                    <p>
                        {t.manifesto_text_5}
                    </p>
                </div>
            </div>
        </div>
    );
};
