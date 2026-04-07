import React, { useState, useEffect } from 'react';
import { providers as baseProviders } from '../services/multiProviderService';
import { AIProviderId, ProviderConfig, LanguageCode, CustomAIProvider } from '../types';
import { IconShield, IconLock, IconPlus, IconCpu, IconMenu, IconZap, IconCheck, IconAlertTriangle } from './Icons';
import { translations, languageNames } from '../services/i18n';

interface Props {
  onComplete: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const SetupWizard: React.FC<Props> = ({ onComplete, language, setLanguage }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<AIProviderId | string>('google');
  const [key, setKey] = useState('');
  
  // Custom Model Fields
  const [customName, setCustomName] = useState('');
  const [customSite, setCustomSite] = useState('');
  const [customDashboard, setCustomDashboard] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  
  const [customProviders, setCustomProviders] = useState<CustomAIProvider[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const t = translations[language];

  useEffect(() => {
    const vault = localStorage.getItem('factium_vault');
    if (vault) {
      const parsed = JSON.parse(vault) as ProviderConfig;
      if (parsed.customProviders) setCustomProviders(parsed.customProviders);
      if (parsed.keys[selected as AIProviderId]) setKey(parsed.keys[selected as AIProviderId] || '');
    }
  }, []);

  const allProviders = [...baseProviders, ...customProviders.map(cp => ({
    id: cp.id,
    name: cp.name,
    description: cp.description,
    isFreeTierAvailable: false,
    keyUrl: cp.keyUrl
  }))];

  const handleVerify = async () => {
    setVerificationStatus('loading');
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (key && key.length > 10) {
      setVerificationStatus('success');
    } else {
      setVerificationStatus('error');
    }
  };

  const handleSave = () => {
    if (selected === 'custom') {
      if (!customName || !customEndpoint || !key) {
        return alert("All fields including API Key and Endpoint are required for Custom Foundry.");
      }
      
      const newCustomProvider: CustomAIProvider = {
        id: `custom-${Date.now()}`,
        name: customName,
        description: customDescription || `Custom base model: ${customName}`,
        keyUrl: customDashboard || customSite,
        siteUrl: customSite,
        dashboardUrl: customDashboard,
        endpoint: customEndpoint,
        modelId: customModelId,
        apiKey: key
      };

      const updatedCustoms = [...customProviders, newCustomProvider];
      setCustomProviders(updatedCustoms);
      
      const config: ProviderConfig = {
        activeProvider: newCustomProvider.id as any,
        keys: { [newCustomProvider.id]: key },
        customProviders: updatedCustoms
      };
      localStorage.setItem('factium_vault', JSON.stringify(config));
      onComplete();
      return;
    }

    if (!key) return alert("Authentication Key required for activation.");
    
    const config: ProviderConfig = {
      activeProvider: selected as any,
      keys: { [selected as any]: key },
      customProviders: customProviders
    };
    localStorage.setItem('factium_vault', JSON.stringify(config));
    onComplete();
  };

  const currentProvider = allProviders.find(p => p.id === selected);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-6">
      <div className="glass-card max-w-2xl w-full rounded-[2.5rem] border-2 border-primary shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Progress Background */}
        <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500 z-50" style={{ width: `${(step/3)*100}%` }}></div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-10 flex-1 custom-scrollbar">
          
          {/* Tabs for Setup */}
          <div className="flex justify-center gap-4 mb-10 border-b border-border pb-4">
              <button onClick={() => setStep(1)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'text-primary scale-110' : 'text-text-muted hover:text-text'}`}>01. {t.setup.language}</button>
              <button onClick={() => setStep(2)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${step === 2 ? 'text-primary scale-110' : 'text-text-muted hover:text-text'}`}>02. {t.setup.engine}</button>
              <button onClick={() => setStep(3)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${step === 3 ? 'text-primary scale-110' : 'text-text-muted hover:text-text'}`}>03. {t.setup.security}</button>
          </div>

          {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-primary/10 rounded-full text-primary mb-6">
                      <IconMenu className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">{t.setup.title1.split(' ')[0]} <span className="text-primary">{t.setup.title1.split(' ')[1] || ''}</span></h1>
                    <p className="text-text-muted font-medium italic">{t.setup.desc1}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      {(Object.keys(languageNames) as LanguageCode[]).map((lang) => (
                          <button 
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`p-5 rounded-2xl border-2 transition-all flex justify-between items-center group ${language === lang ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-surface/30 hover:border-primary/50'}`}
                          >
                              <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary">{lang.toUpperCase()}</span>
                                  <span className="text-base font-black text-text italic font-serif">{languageNames[lang]}</span>
                              </div>
                              {language === lang && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </button>
                      ))}
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setStep(2)} 
                      className="w-full py-5 bg-primary hover:bg-red-700 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {t.setup.continue} →
                    </button>
                  </div>
              </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <div className="inline-block p-4 bg-primary/10 rounded-full text-primary mb-6">
                  <IconShield className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">{t.setup.title2.split(' ')[0]} <span className="text-primary">{t.setup.title2.split(' ')[1] || ''}</span></h1>
                <p className="text-text-muted font-medium italic">{t.setup.desc2}</p>
              </div>

              <div className="grid gap-4">
                {allProviders.map(p => (
                  <div key={p.id} className="space-y-3">
                    <button 
                      onClick={() => {
                        setSelected(p.id);
                        setVerificationStatus('idle');
                      }}
                      className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex justify-between items-center group ${selected === p.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50 bg-surface/30'}`}
                    >
                      <div>
                        <div className="font-black text-lg group-hover:text-primary transition-colors">{p.name}</div>
                        <div className="text-xs text-text-muted italic">{p.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.isFreeTierAvailable && <span className="text-[10px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full uppercase tracking-tighter">Free Available</span>}
                        {selected === p.id && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                      </div>
                    </button>

                    {/* Inline Key Input for Standard Providers */}
                    {selected === p.id && !p.id.startsWith('custom-') && p.id !== 'custom' && (
                      <div className="px-4 pb-4 space-y-4 animate-slide-down">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                            {p.id === 'google' ? 'Gemini API Key' : t.setup.apiKeyLabel}
                          </label>
                          {p.keyUrl && (
                            <a 
                              href={p.keyUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-black text-primary underline decoration-primary/30 hover:decoration-primary transition-all"
                            >
                              <IconZap className="w-2 h-2" />
                              Get Key
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="password" 
                              value={key}
                              onChange={(e) => {
                                setKey(e.target.value);
                                setVerificationStatus('idle');
                              }}
                              placeholder="Paste Secure Token (sk-...)"
                              className={`w-full bg-background border-2 rounded-xl p-3 font-mono text-xs outline-none transition-all pr-10 ${
                                verificationStatus === 'success' ? 'border-green-500/50 focus:border-green-500' :
                                verificationStatus === 'error' ? 'border-red-500/50 focus:border-red-500' :
                                'border-border focus:border-primary'
                              }`}
                            />
                            <IconCpu className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 w-4 h-4" />
                          </div>
                          <button 
                            onClick={handleVerify}
                            disabled={verificationStatus === 'loading'}
                            className={`px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                              verificationStatus === 'success' ? 'bg-green-500 text-white' :
                              verificationStatus === 'error' ? 'bg-red-500 text-white' :
                              'bg-surface border border-border text-text hover:border-primary'
                            }`}
                          >
                            {verificationStatus === 'loading' ? '...' : 
                             verificationStatus === 'success' ? <IconCheck className="w-3 h-3" /> :
                             verificationStatus === 'error' ? <IconAlertTriangle className="w-3 h-3" /> :
                             'Verify'}
                          </button>
                        </div>
                        {verificationStatus === 'success' && (
                          <p className="text-[9px] font-bold text-green-500 flex items-center gap-1">
                            <IconCheck className="w-2 h-2" /> Validated
                          </p>
                        )}
                        {verificationStatus === 'error' && (
                          <p className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                            <IconAlertTriangle className="w-2 h-2" /> Invalid
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Custom Model Option */}
                <button 
                  onClick={() => setSelected('custom')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex justify-between items-center group ${selected === 'custom' ? 'border-primary bg-primary/5 shadow-lg' : 'border-dashed border-border hover:border-primary/50 bg-surface/30'}`}
                >
                  <div className="flex items-center gap-4">
                    <IconPlus className="text-primary w-6 h-6" />
                    <div>
                      <div className="font-black text-lg group-hover:text-primary transition-colors">Custom Foundry</div>
                      <div className="text-xs text-text-muted italic">Integrate your own processing endpoint or model logic.</div>
                    </div>
                  </div>
                  {selected === 'custom' && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                </button>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setStep(3)} 
                  className="w-full py-5 bg-primary hover:bg-red-700 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {selected === 'custom' ? 'Configure Details' : t.setup.linkTitle} →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in pb-4">
               <button 
                 onClick={() => setStep(2)} 
                 className="group flex items-center gap-2 text-xs font-black text-text-muted hover:text-primary uppercase tracking-widest transition-all"
               >
                 <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.setup.back}
               </button>

               <div className="glass-card p-8 rounded-3xl border border-primary/20 bg-surface/50 shadow-inner">
                  <div className="flex items-center gap-4 mb-6">
                    <IconLock className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-black italic uppercase font-serif">{selected === 'custom' ? 'Custom Integration' : t.setup.filamentTitle}</h2>
                  </div>

                  {selected === 'custom' ? (
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Preferred Model Name</label>
                          <input 
                            type="text" 
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g. My Custom AI"
                            className="w-full bg-background border-2 border-border rounded-xl p-4 font-mono text-xs focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Official Model Site</label>
                          <input 
                            type="text" 
                            value={customSite}
                            onChange={(e) => setCustomSite(e.target.value)}
                            placeholder="https://my-ai-site.com"
                            className="w-full bg-background border-2 border-border rounded-xl p-4 font-mono text-xs focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Official Gateway Dashboard</label>
                        <input 
                          type="text" 
                          value={customDashboard}
                          onChange={(e) => setCustomDashboard(e.target.value)}
                          placeholder="https://dashboard.my-ai.com"
                          className="w-full bg-background border-2 border-border rounded-xl p-4 font-mono text-xs focus:border-primary outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Target Endpoint URL</label>
                          <input 
                            type="text" 
                            value={customEndpoint}
                            onChange={(e) => setCustomEndpoint(e.target.value)}
                            placeholder="https://api.custom-engine.com/v1"
                            className="w-full bg-background border-2 border-border rounded-xl p-4 font-mono text-xs focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Model Identifier</label>
                          <input 
                            type="text" 
                            value={customModelId}
                            onChange={(e) => setCustomModelId(e.target.value)}
                            placeholder="e.g. llama-3-unfiltered"
                            className="w-full bg-background border-2 border-border rounded-xl p-4 font-mono text-xs focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Model Purpose / Description</label>
                        <textarea 
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          placeholder="Describe how this model should serve as your base engine..."
                          className="w-full bg-background border-2 border-border rounded-xl p-4 font-mono text-xs focus:border-primary outline-none h-20 resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Preferred Model API Key</label>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            value={key}
                            onChange={(e) => {
                              setKey(e.target.value);
                              setVerificationStatus('idle');
                            }}
                            placeholder="Custom Secret Token"
                            className={`flex-1 bg-background border-2 rounded-xl p-4 font-mono text-xs outline-none transition-all ${
                              verificationStatus === 'success' ? 'border-green-500/50 focus:border-green-500' :
                              verificationStatus === 'error' ? 'border-red-500/50 focus:border-red-500' :
                              'border-border focus:border-primary'
                            }`}
                          />
                          <button 
                            onClick={handleVerify}
                            disabled={verificationStatus === 'loading'}
                            className={`px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                              verificationStatus === 'success' ? 'bg-green-500 text-white' :
                              verificationStatus === 'error' ? 'bg-red-500 text-white' :
                              'bg-surface border border-border text-text hover:border-primary'
                            }`}
                          >
                            {verificationStatus === 'loading' ? '...' : 
                             verificationStatus === 'success' ? <IconCheck className="w-4 h-4" /> :
                             verificationStatus === 'error' ? <IconAlertTriangle className="w-4 h-4" /> :
                             'Verify'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <p className="text-sm text-text-muted leading-relaxed italic mb-6">
                        {selected === 'google' ? t.setup.geminiConfig : t.setup.filamentDesc}
                      </p>
                      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Engine</span>
                          <span className="text-sm font-black text-primary italic">{currentProvider?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</span>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${verificationStatus === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                            {verificationStatus === 'success' ? 'Verified' : 'Pending Activation'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
               </div>

               <button 
                 onClick={handleSave} 
                 className="w-full py-5 bg-primary hover:bg-red-700 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                 disabled={verificationStatus === 'loading' || (selected !== 'google' && verificationStatus !== 'success' && selected !== 'custom')}
               >
                 {selected === 'custom' ? 'Forge & Activate' : t.setup.activate}
               </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default SetupWizard;
