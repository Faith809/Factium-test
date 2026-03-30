
import React, { useState } from 'react';
import { AppView, LanguageCode } from '../types';
import { IconSearch, IconShield, IconActivity, IconDollar, IconUser, IconCpu, IconMenu, IconZap, IconInfo, IconSun, Logo } from './Icons';
import { translations, languageNames } from '../services/i18n';
import CapturedIntelligence from './CapturedIntelligence';
import { SyncData } from '../services/dbService';

interface DashboardProps {
  onNavigate: (view: AppView, initialData?: any) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isQuickAccessEnabled: boolean;
  setQuickAccessEnabled: (enabled: boolean) => void;
  onStartTour: () => void;
  onOpenAppearance: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  language, 
  setLanguage,
  isQuickAccessEnabled,
  setQuickAccessEnabled,
  onStartTour,
  onOpenAppearance
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'language'>('features');
  const t = translations[language];

  const features = [
    {
      id: 'QUICK_ACCESS',
      title: "Bubble Pop-up System",
      desc: "Enable floating intelligence terminal for cross-app research.",
      icon: <IconZap className={`w-6 h-6 ${isQuickAccessEnabled ? 'text-primary animate-pulse' : 'text-text-muted'}`} />,
      tag: "SYSTEM",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&fit=crop",
      color: isQuickAccessEnabled ? "bg-primary" : "bg-surface",
      isToggle: true,
      tourId: "bubble-master-switch"
    },
    {
      id: AppView.RESEARCH,
      title: t.nav.research,
      desc: t.research.subtitle,
      icon: <IconSearch className="w-6 h-6" />,
      tag: "CORE",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&h=400&fit=crop",
      color: "bg-primary"
    },
    {
      id: AppView.FACT_CHECKER,
      title: t.nav.factChecker,
      desc: t.factChecker.subtitle,
      icon: <IconShield className="w-6 h-6" />,
      tag: "DIAGNOSTIC",
      image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=600&h=400&fit=crop",
      color: "bg-secondary"
    },
    {
      id: AppView.POLICY_SIMULATOR,
      title: t.nav.policy,
      desc: t.policy.subtitle,
      icon: <IconActivity className="w-6 h-6" />,
      tag: "FORECAST",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=400&fit=crop",
      color: "bg-accent"
    },
    {
      id: AppView.FINANCE_TRACKER,
      title: t.nav.finance,
      desc: t.finance.subtitle,
      icon: <IconDollar className="w-6 h-6" />,
      tag: "FORENSIC",
      image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=600&h=400&fit=crop",
      color: "bg-blue-500"
    },
    {
      id: AppView.MY_MODELS,
      title: t.nav.models,
      desc: t.models.subtitle,
      icon: <IconCpu className="w-6 h-6" />,
      tag: "CUSTOM",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
      color: "bg-indigo-500"
    },
    {
      id: AppView.PROFILE,
      title: t.nav.profile,
      desc: t.profile.subtitle,
      icon: <IconUser className="w-6 h-6" />,
      tag: "SYNC",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-24 animate-fade-in py-12">
      <div id="dashboard-hero" className="text-center space-y-10 pt-16 relative">
        {/* Master Switch for Bubble Pop-up Overlay */}
        <div id="bubble-master-switch" className="md:absolute md:top-0 md:right-0 flex items-center gap-4 p-4 bg-surface/50 backdrop-blur-xl border border-border rounded-[2rem] shadow-xl z-10 mx-auto w-fit md:mx-0 mb-8 md:mb-0">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Bubble Pop-up</span>
            <span className="text-[8px] font-mono text-text-muted uppercase opacity-60">Master Switch</span>
          </div>
          <button 
            onClick={() => setQuickAccessEnabled(!isQuickAccessEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all duration-500 p-1 ${isQuickAccessEnabled ? 'bg-primary shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-border'}`}
          >
            <div 
              className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 flex items-center justify-center ${isQuickAccessEnabled ? 'translate-x-6' : 'translate-x-0'}`}
            >
              {isQuickAccessEnabled ? <IconZap className="w-3 h-3 text-primary" /> : <div className="w-1.5 h-1.5 bg-text-muted rounded-full"></div>}
            </div>
          </button>
        </div>

        <div className="flex justify-center mb-8">
           <div className="p-1 rounded-[2.5rem] bg-sunset-gradient shadow-[0_0_50px_rgba(251,191,36,0.2)] animate-pulse-slow">
              <Logo className="w-32 h-32" />
           </div>
        </div>
        <div className="inline-block px-6 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-black tracking-[0.5em] uppercase mb-6 shadow-sm border border-primary/20">
          Neural BYOK Terminal v2.5
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-text leading-[1] font-serif italic uppercase">
          {t.hubTitle.split(' ')[0]} <span className="text-sunset-gradient">{t.hubTitle.split(' ')[1] || ''}</span>
        </h1>
        <p className="text-text-muted max-w-3xl mx-auto text-xl font-serif italic leading-relaxed opacity-80">
          {t.intro}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
           <button 
             onClick={() => onNavigate(AppView.RESEARCH)} 
             className="bg-sunset-btn hover:scale-105 text-black px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_10px_40px_rgba(245,158,11,0.3)] active:scale-95"
           >
             {t.explore}
           </button>
           <button 
             onClick={() => onNavigate(AppView.ABOUT)} 
             className="px-12 py-5 rounded-[2rem] font-bold text-sm border border-border hover:bg-surface/50 transition-all text-text-muted hover:text-text tracking-widest uppercase"
           >
             {t.manifesto}
           </button>
           <button 
             id="guide-btn"
             onClick={onStartTour}
             className="px-12 py-5 rounded-[2rem] font-black text-[10px] border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-primary tracking-[0.3em] uppercase flex items-center gap-3"
           >
             <IconInfo className="w-4 h-4" />
             Guide
           </button>
           <button 
             onClick={onOpenAppearance}
             className="px-12 py-5 rounded-[2rem] font-black text-[10px] border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-primary tracking-[0.3em] uppercase flex items-center gap-3"
           >
             <IconSun className="w-4 h-4" />
             Appearance
           </button>
        </div>
      </div>

      <div className="flex border-b border-border mb-12">
          <button 
            onClick={() => setActiveTab('features')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'features' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'}`}
          >
            {t.common.discoveryChambers}
          </button>
          <button 
            onClick={() => setActiveTab('language')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'language' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'}`}
          >
            {t.language}
          </button>
      </div>

      {activeTab === 'features' ? (
        <div className="space-y-24">
          <CapturedIntelligence 
            onImport={(item: SyncData) => {
              onNavigate(AppView.RESEARCH, { 
                query: '', 
                attachments: [{
                  id: item.id,
                  type: item.type === 'screenshot' ? 'image' : 'audio',
                  data: item.data,
                  name: `Captured ${item.type}`
                }]
              });
            }} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => {
                  if (feature.id === 'QUICK_ACCESS') {
                    setQuickAccessEnabled(!isQuickAccessEnabled);
                  } else {
                    onNavigate(feature.id as AppView);
                  }
                }}
                className={`glass-card group p-3 rounded-[2.5rem] cursor-pointer hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-all duration-700 border border-transparent hover:border-primary/30 ${feature.id === 'QUICK_ACCESS' && isQuickAccessEnabled ? 'ring-2 ring-primary/50' : ''}`}
              >
                <div className="relative overflow-hidden rounded-[2rem] mb-8 aspect-video">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-5 right-5 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[9px] font-black tracking-[0.3em] uppercase border border-white/10">
                    {feature.tag}
                  </div>
                  <div className={`absolute -bottom-6 left-8 p-5 rounded-[1.5rem] ${feature.color} text-white shadow-2xl transition-all duration-500 group-hover:rotate-3 group-hover:-translate-y-4`}>
                    {feature.icon}
                  </div>
                </div>
                
                <div className="p-8 pt-4">
                  <h3 className="text-2xl font-black text-text mb-3 tracking-tight group-hover:text-primary transition-colors uppercase italic font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-base text-text-muted font-serif italic leading-relaxed mb-8 opacity-80">
                    {feature.desc}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border/20">
                     <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-surface overflow-hidden shadow-xl">
                             <img 
                               src={`https://i.pravatar.cc/100?u=${feature.id}-${i}`} 
                               alt="observer" 
                               className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                               referrerPolicy="no-referrer"
                             />
                          </div>
                        ))}
                        <div className="text-[10px] text-text-muted ml-6 mt-1.5 font-black uppercase tracking-[0.2em]">{t.activeSeekers}</div>
                     </div>
                     <div className="text-[11px] font-black text-primary uppercase tracking-[0.4em] group-hover:translate-x-3 transition-transform duration-500">
                       {t.common.unveil} →
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-[3rem] animate-slide-up space-y-12">
            <div className="text-center space-y-4">
                <IconMenu className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-black italic uppercase font-serif tracking-tight">{t.selectLanguage}</h3>
                <p className="text-text-muted font-serif italic">{t.setup.desc1}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {(Object.keys(languageNames) as LanguageCode[]).map((lang) => (
                    <button 
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`p-6 rounded-3xl border-2 transition-all duration-500 group flex flex-col items-center gap-3 ${language === lang ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-border bg-surface/30 hover:border-primary/50'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">{lang.toUpperCase()}</span>
                        <span className="text-lg font-black text-text italic font-serif">{languageNames[lang]}</span>
                        {language === lang && <div className="w-2 h-2 bg-primary rounded-full animate-pulse mt-2"></div>}
                    </button>
                ))}
            </div>
            
            <div className="pt-12 border-t border-border/20 text-center">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.6em] opacity-40 italic">Linguistic Filaments v2.5 // Secure Translation Matrix</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
