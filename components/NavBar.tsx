import React from 'react';
import { LanguageCode } from '../types';
import { translations } from '../services/i18n';

interface NavBarProps {
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  title: string;
  language: LanguageCode;
}

const NavBar: React.FC<NavBarProps> = ({ onBack, onHome, onGuide, title, language }) => {
  const t = translations[language];

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border relative">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors flex items-center gap-2 text-sm font-mono"
        >
          &lt; {t.common.back}
        </button>
        <button 
          onClick={onHome}
          className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors flex items-center gap-2 text-sm font-mono"
        >
          [ {t.common.home} ]
        </button>
      </div>
      
      {/* Guide Button - Top Middle */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0">
        <button
          id="manual-guide-trigger"
          onClick={onGuide}
          className="px-4 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 transition-all"
        >
          Guide
        </button>
      </div>

      <div className="text-sm font-bold tracking-widest uppercase text-primary hidden md:block">
        {title}
      </div>
    </div>
  );
};

export default NavBar;