import { useRef } from 'react';
import { useLiquidMorph } from '../hooks/useLiquidMorph';
import { TRANSLATIONS } from '../data/constants';

// Map currentPage to the translation key used in TRANSLATIONS
const PAGE_TITLE_KEYS = {
  codex: 'codex_title',
  relics: 'relics_title',
  relic_detail: 'relics_title',
  me: 'me_title',
};

export function PageTitle({ currentPage, isAwakened, lang = 'zh-TW' }) {
  const titleRef = useRef(null);
  const t = TRANSLATIONS[lang] || {};
  const titleKey = PAGE_TITLE_KEYS[currentPage];
  const title = titleKey ? (t[titleKey] || '') : '';

  useLiquidMorph(titleRef, currentPage, { isAwakened, title });

  if (currentPage === 'home') return null;

  return (
    <div
      ref={titleRef}
      className="fixed top-28 left-6 md:left-12 z-40 font-serif text-sm tracking-[0.5em] uppercase text-neutral-600 will-change-[filter] force-gpu pointer-events-none"
    />
  );
}
