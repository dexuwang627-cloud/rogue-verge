import React from 'react';
import { Link } from 'react-router-dom';
import { TRANSLATIONS } from '../data/constants';
import FleshErosionText from '../components/UI/FleshErosionText';

const Manifesto = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="pt-32 px-6 md:px-20 max-w-5xl mx-auto min-h-screen pb-20">
            <Link
                to="/"
                className="mb-8 text-xs font-serif text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 group uppercase tracking-widest"
            >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span> BACK_TO_HOME
            </Link>
            <div className="border-l border-red-900/50 pl-8 md:pl-16 py-8 relative">

                <h2 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight relative z-10">
                    {t.manifesto_h2_1}
                    <FleshErosionText text={t.manifesto_h2_red} />
                    {t.manifesto_h2_2} <br /> {t.manifesto_h2_br}
                </h2>

                <div className="space-y-12 font-serif text-gray-400 leading-relaxed text-lg md:text-xl relative z-10">
                    <p>
                        {t.manifesto_text_1}
                        <span className="text-white"> ROGUE VERGE</span>{t.manifesto_text_2}
                    </p>
                    <p>
                        {t.manifesto_text_3}<strong className="text-white">{t.manifesto_text_bold}</strong>{t.manifesto_text_4}
                    </p>
                    <div className="p-6 border border-white/10 bg-white/5 mt-12 relative overflow-hidden">
                        <div
                            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40"
                            style={{
                                background: 'radial-gradient(circle at 80% 20%, rgba(130, 20, 20, 0.5) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(100, 10, 10, 0.4) 0%, transparent 30%)',
                            }}
                        ></div>

                        <p className="text-red-500 text-sm tracking-widest mb-4 relative z-10">{t.manifesto_core_title}</p>
                        <p className="text-white italic font-serif text-2xl relative z-10">
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

export default Manifesto;
