
import React, { useState, useEffect } from 'react';
import ResearchTool from './components/ResearchTool';
import FactChecker from './components/FactChecker';
import PolicySimulator from './components/PolicySimulator';
import FinanceTracker from './components/FinanceTracker';
import UserProfileForm from './components/UserProfileForm';
import AboutPage from './components/AboutPage';
import Dashboard from './components/Dashboard';
import MyAIModels from './components/MyAIModels';
import SetupWizard from './components/SetupWizard';
import { IconSun, IconMoon, IconZap, Logo, IconMenu, IconX } from './components/Icons';
import { AppView, UserProfile, LanguageCode, AppearanceSettings } from './types';
import { translations } from './services/i18n';
import { createTour } from './services/tourService';
import AppearanceStation from './components/AppearanceStation';
import QuickAccessOverlay from './components/QuickAccessOverlay';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [initialResearchData, setInitialResearchData] = useState<any>(null);
  const [history, setHistory] = useState<AppView[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    accent: '#f59e0b',
    accentGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    background: '#F8FAFC',
    isDark: false
  });
  const [isAppearanceStationOpen, setAppearanceStationOpen] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isQuickAccessEnabled, setQuickAccessEnabled] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', location: '', incomeRange: '', familySize: 1, politicalLeaning: 'Neutral', occupation: ''
  });

  const t = translations[language];

  useEffect(() => {
    const vault = localStorage.getItem('factium_vault');
    if (!vault) {
      setNeedsSetup(true);
    } else {
      const parsed = JSON.parse(vault);
      const activeProvider = parsed.activeProvider;
      const key = parsed.keys[activeProvider];
      if (!key) setNeedsSetup(true);
    }

    const saved = localStorage.getItem('factium_profile');
    if (saved) setUserProfile(JSON.parse(saved));
    const savedAppearance = localStorage.getItem('factium_appearance');
    if (savedAppearance) setAppearance(JSON.parse(savedAppearance));
    const savedLang = localStorage.getItem('factium_lang') as LanguageCode;
    if (savedLang) setLanguage(savedLang);
    const savedQA = localStorage.getItem('factium_qa_enabled');
    if (savedQA) setQuickAccessEnabled(JSON.parse(savedQA));
  }, []);

  useEffect(() => {
    if (!needsSetup) {
      const tourCompleted = localStorage.getItem('factium_tour_completed');
      const vault = localStorage.getItem('factium_vault');
      if (!tourCompleted && vault) {
        // Delay slightly to ensure Dashboard is fully rendered
        const timer = setTimeout(() => {
          handleStartTour();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [needsSetup]);

  const handleStartTour = (tourType: string = 'dashboard') => {
    const tour = createTour(t, tourType, () => setTourStarted(false));
    setTourStarted(true);
    tour.drive();
  };

  useEffect(() => {
    localStorage.setItem('factium_qa_enabled', JSON.stringify(isQuickAccessEnabled));
  }, [isQuickAccessEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-accent', appearance.accent);
    root.style.setProperty('--app-accent-gradient', appearance.accentGradient);
    root.style.setProperty('--app-bg', appearance.background);
    
    // Determine accent text color (white or black)
    const ACCENT_TEXT_COLORS: Record<string, string> = {
      '#f59e0b': '#000', // Gold
      '#94A3B8': '#000', // Silver
      '#B45309': '#fff', // Bronze
      '#1D4ED8': '#fff', // Metallic Blue
      '#047857': '#fff', // Emerald
      '#B91C1C': '#fff', // Ruby
      '#7E22CE': '#fff', // Amethyst
      '#E11D48': '#fff', // Rose Gold
      '#92400E': '#fff', // Copper
      '#475569': '#fff', // Platinum
    };
    root.style.setProperty('--app-accent-text', ACCENT_TEXT_COLORS[appearance.accent] || '#000');

    if (appearance.isDark) {
      root.style.setProperty('--app-text', '#F8FAFC');
      root.style.setProperty('--app-text-muted', '#94A3B8');
      root.style.setProperty('--app-surface', 'rgba(13, 18, 30, 0.7)');
      root.style.setProperty('--app-border', 'rgba(255, 255, 255, 0.1)');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.style.setProperty('--app-text', '#0F172A');
      root.style.setProperty('--app-text-muted', '#475569');
      root.style.setProperty('--app-surface', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--app-border', 'rgba(0, 0, 0, 0.1)');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    
    localStorage.setItem('factium_appearance', JSON.stringify(appearance));
  }, [appearance]);

  useEffect(() => {
    localStorage.setItem('factium_lang', language);
  }, [language]);

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('factium_sync');
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'IMPORT_DATA' && event.data.payload.view) {
        setCurrentView(event.data.payload.view);
      }
    };
    return () => broadcastChannel.close();
  }, []);

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('factium_sync');
    broadcastChannel.postMessage({
      type: 'VIEW_CHANGE',
      payload: { view: currentView }
    });
    return () => broadcastChannel.close();
  }, [currentView]);

  if (needsSetup) return <SetupWizard onComplete={() => setNeedsSetup(false)} language={language} setLanguage={setLanguage} />;

  const navigateTo = (view: AppView, initialData?: any) => {
    setHistory(prev => [...prev, currentView]);
    setCurrentView(view);
    if (initialData) setInitialResearchData(initialData);
    else setInitialResearchData(null);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prevHist => prevHist.slice(0, -1));
      setCurrentView(prev);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const NavItem = ({ view, label }: { view: AppView, label: string }) => (
    <button
      onClick={() => navigateTo(view)}
      className={`block w-full text-left px-4 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] ${
        currentView === view ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-text-muted hover:text-text hover:bg-surface'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-surface border-r border-border flex flex-col transform transition-transform duration-500 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-border flex flex-col items-start gap-3">
          <div className="w-full flex items-center justify-between md:block">
            <div id="app-logo" className="p-1 rounded-xl bg-gradient-to-br from-white via-yellow-400 to-orange-600 shadow-lg inline-block">
               <Logo className="w-10 h-10" />
            </div>
            <button 
              className="md:hidden p-2 text-text-muted hover:text-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <IconX className="w-6 h-6" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-black text-text tracking-tighter italic font-serif leading-none">FACTIUM <span className="text-primary">AI</span></h1>
            <p className="text-[9px] text-text-muted mt-1 font-mono tracking-[0.4em] uppercase font-bold">The Truth Layer v2.5</p>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div id="nav-dashboard"><NavItem view={AppView.DASHBOARD} label={t.hubTitle} /></div>
          <div className="h-px bg-border my-6"></div>
          <div id="nav-research"><NavItem view={AppView.RESEARCH} label={t.nav.research} /></div>
          <div id="nav-fact-checker"><NavItem view={AppView.FACT_CHECKER} label={t.nav.factChecker} /></div>
          <div id="nav-policy"><NavItem view={AppView.POLICY_SIMULATOR} label={t.nav.policy} /></div>
          <div id="nav-finance"><NavItem view={AppView.FINANCE_TRACKER} label={t.nav.finance} /></div>
          <div id="nav-models"><NavItem view={AppView.MY_MODELS} label={t.nav.models} /></div>
          <div className="h-px bg-border my-6"></div>
          <div id="nav-about"><NavItem view={AppView.ABOUT} label={t.nav.about} /></div>
          <div id="nav-profile"><NavItem view={AppView.PROFILE} label={t.nav.profile} /></div>
          
          <div className="pt-6">
            <button 
              id="recalibrate-btn"
              onClick={() => setNeedsSetup(true)}
              className="group w-full flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <IconZap className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text">{t.recalibrate}</span>
              </div>
              <span className="text-primary text-lg">→</span>
            </button>
          </div>
        </nav>
        <div className="p-6 border-t border-border">
            <button 
              onClick={() => setAppearanceStationOpen(true)} 
              className="w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/20 transition-all flex items-center justify-center gap-3"
            >
              <IconSun className="w-4 h-4" />
              Appearance
            </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative bg-background">
         {/* Mobile Header */}
         <header className="md:hidden sticky top-0 z-20 flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-2">
               <Logo className="w-8 h-8" />
               <span className="font-black italic font-serif tracking-tighter">FACTIUM</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-text-muted hover:text-text bg-primary/5 rounded-xl border border-primary/10"
            >
              <IconMenu className="w-6 h-6" />
            </button>
         </header>

         <div className="relative p-6 md:p-12 max-w-7xl mx-auto min-h-full">
            {currentView === AppView.DASHBOARD && (
              <Dashboard 
                onNavigate={navigateTo} 
                language={language} 
                setLanguage={setLanguage} 
                isQuickAccessEnabled={isQuickAccessEnabled}
                setQuickAccessEnabled={setQuickAccessEnabled}
                onStartTour={handleStartTour}
                onOpenAppearance={() => setAppearanceStationOpen(true)}
              />
            )}
            {currentView === AppView.RESEARCH && <ResearchTool onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('research')} onAddMore={() => navigateTo(AppView.MY_MODELS)} language={language} initialData={initialResearchData} />}
            {currentView === AppView.FACT_CHECKER && <FactChecker onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('factChecker')} onAddMore={() => navigateTo(AppView.MY_MODELS)} language={language} />}
            {currentView === AppView.POLICY_SIMULATOR && <PolicySimulator userProfile={userProfile} onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('policy')} onNavigate={navigateTo} onAddMore={() => navigateTo(AppView.MY_MODELS)} language={language} />}
            {currentView === AppView.FINANCE_TRACKER && <FinanceTracker onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('finance')} onAddMore={() => navigateTo(AppView.MY_MODELS)} language={language} />}
            {currentView === AppView.MY_MODELS && <MyAIModels onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('models')} language={language} />}
            {currentView === AppView.ABOUT && <AboutPage onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('about')} language={language} />}
            {currentView === AppView.PROFILE && <UserProfileForm currentProfile={userProfile} onSave={(p) => {
              setUserProfile(p); 
              localStorage.setItem('factium_profile', JSON.stringify(p));
              // Update vault
              const vault = localStorage.getItem('factium_profile_vault');
              let parsedVault = vault ? JSON.parse(vault) : [];
              if (!Array.isArray(parsedVault)) parsedVault = [];
              const existingIdx = parsedVault.findIndex((v: any) => v.name === p.name);
              if (existingIdx >= 0) {
                parsedVault[existingIdx] = p;
              } else {
                parsedVault.push(p);
              }
              localStorage.setItem('factium_profile_vault', JSON.stringify(parsedVault));
            }} onBack={goBack} onHome={() => setCurrentView(AppView.DASHBOARD)} onGuide={() => handleStartTour('profile')} onAddMore={() => navigateTo(AppView.MY_MODELS)} language={language} />}
         </div>
      </main>

      {isAppearanceStationOpen && (
        <AppearanceStation 
          settings={appearance} 
          onUpdate={setAppearance} 
          onClose={() => setAppearanceStationOpen(false)} 
        />
      )}

      {isQuickAccessEnabled && (
        <QuickAccessOverlay 
          onOpenMainApp={() => setCurrentView(AppView.DASHBOARD)} 
          onClose={() => setQuickAccessEnabled(false)}
          language={language} 
        />
      )}
    </div>
  );
};

export default App;
