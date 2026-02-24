import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../../data/constants';
import { DataStreamBorder } from '../ui/DataStreamBorder';

export const RelicDetail = ({ item, onBack, lang }) => {
    if (!item || !item.images || item.images.length === 0) return null;

    const t = TRANSLATIONS[lang];
    const displayNote = (item.note && typeof item.note === 'object') ? item.note[lang] : item.note;
    const displayDesc = (item.description && typeof item.description === 'object') ? item.description[lang] : item.description;
    const displayPrice = item.price === 'Sold Out' ? t.sold_out : item.price;

    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = item.images.length;

    useEffect(() => {
        setCurrentSlide(0);
    }, [item]);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    return (
        <div className="pt-32 px-6 md:px-20 min-h-screen pb-20">
            <button
                onClick={onBack}
                className="mb-8 text-xs font-serif text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span> {t.back_to_archive}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="relative border border-white/10 bg-[#050505] p-4 group">
                    <DataStreamBorder />
                    <div className="overflow-hidden relative aspect-square">
                        <div
                            className="flex transition-transform duration-500 ease-in-out h-full"
                            style={{ width: `${totalSlides * 100}%`, transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` }}
                        >
                            {item.images.map((imgSrc, index) => (
                                <div key={index} className="flex-shrink-0 h-full flex items-center justify-center" style={{ width: `${100 / totalSlides}%` }}>
                                    <img src={imgSrc} alt={`${item.code} - ${index}`} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {totalSlides > 1 && (
                        <React.Fragment>
                            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-3 text-white/70 hover:text-white transition-colors z-20">&gt;</button>
                            <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-3 text-white/70 hover:text-white transition-colors z-20">&lt;</button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/30 px-3 py-1 rounded z-20">
                                {item.images.map((_, index) => (
                                    <div key={index} className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${currentSlide === index ? 'bg-red-500' : 'bg-white/40 hover:bg-white/70'}`} onClick={() => setCurrentSlide(index)}></div>
                                ))}
                            </div>
                        </React.Fragment>
                    )}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/50"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/50"></div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight mb-2">{item.code}</h2>
                        <p className="font-serif text-sm text-red-500 tracking-widest">{displayNote}</p>
                    </div>
                    <div className="w-full h-[1px] bg-white/10"></div>
                    <div className="space-y-4">
                        <p className="font-serif text-xs text-gray-500">[ DESCRIPTION ]</p>
                        <p className="font-serif text-sm text-gray-300 leading-relaxed">{displayDesc || "No data available for this relic."}</p>
                    </div>
                    <div className="pt-8">
                        <p className="font-serif text-2xl text-white mb-6">{displayPrice}</p>
                        <a href="https://www.rogueverge.com" target="_blank" rel="noopener noreferrer" className="inline-block w-full md:w-auto text-center border border-white/30 bg-white/5 px-8 py-4 text-xs font-serif tracking-[0.2em] text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300">{t.acquire_asset}</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
