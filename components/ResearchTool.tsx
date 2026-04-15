import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { forensicResearch } from '../services/multiProviderService';
import { DetailedResearchResponse, ResearchMode, AIModelId, LanguageCode } from '../types';
import { IconSearch, IconShield, IconActivity, IconInfo, IconMenu, IconRefresh } from './Icons';
import ModelSelector from './ModelSelector';
import NavBar from './NavBar';
import { translations } from '../services/i18n';

import SearchTerminal from './SearchTerminal';
import { Attachment } from '../types';

import { saveSyncData } from '../services/dbService';

const ResearchTool: React.FC<{onBack: () => void; onHome: () => void; onGuide: () => void; onAddMore?: () => void; language: LanguageCode; initialData?: { query: string, attachments: Attachment[] } | null}> = ({ onBack, onHome, onGuide, onAddMore, language, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetailedResearchResponse | null>(null);
  const [mode, setMode] = useState<ResearchMode>(ResearchMode.RESTRICTED);
  const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const t = translations[language];

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Sync active module when mode changes
  useEffect(() => {
    if (mode === ResearchMode.RESTRICTED && activeModule === 'scandals') {
      setActiveModule(null);
    }
  }, [mode]);

  const handleSearch = async (query: string, attachments: any[]) => {
    if (!query.trim() && attachments.length === 0) return;
    setLoading(true);
    setResult(null);
    setActiveModule(null);
    try {
      // Add delay to prevent parallel requests and rate limiting
      await new Promise(r => setTimeout(r, 1500));
      const response = await forensicResearch(query, mode, selectedModel, attachments);
      setResult(response);
      
      // Save to DB
      await saveSyncData({
        id: `research-${Date.now()}`,
        type: 'research',
        data: { query, response },
        timestamp: Date.now(),
        imported: true
      });
    } catch (e) {
      console.error(e);
      alert("Search failed. Our helpers are taking a short break. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in">
      <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.nav.research} language={language} />

      {isOffline && (
        <div className="bg-amber-900/40 border border-amber-500 text-amber-100 p-4 rounded-2xl text-xs font-mono animate-pulse text-center tracking-widest uppercase">
          CONNECTION LOST: Using local memory only.
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="text-6xl font-black text-text tracking-tighter italic leading-none">{t.research.title.split(' ')[0]} <span className="text-primary">{t.research.title.split(' ').slice(1).join(' ')}</span></h2>
          <p className="text-text-muted mt-4 font-serif italic text-lg max-w-xl">
            {t.research.subtitle}
          </p>
        </div>
        <div className="bg-surface p-2 rounded-2xl border border-border shadow-xl">
          <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} onAddMore={onAddMore} />
        </div>
      </div>

      <div id="research-mode-toggle" className="glass-card p-2 rounded-3xl flex bg-black/40 border border-border w-fit shadow-2xl">
        <button 
          onClick={() => setMode(ResearchMode.RESTRICTED)} 
          className={`px-10 py-3 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${mode === ResearchMode.RESTRICTED ? 'bg-white text-black shadow-lg scale-105' : 'text-text-muted hover:text-white'}`}
        >
          {t.research.modeRestricted}
        </button>
        <button 
          onClick={() => setMode(ResearchMode.UNRESTRICTED)} 
          className={`px-10 py-3 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${mode === ResearchMode.UNRESTRICTED ? 'bg-primary text-white shadow-[0_0_25px_rgba(220,38,38,0.3)] scale-105' : 'text-text-muted hover:text-white'}`}
        >
          {t.research.modeUnrestricted}
        </button>
      </div>

      <SearchTerminal 
        id="research-terminal"
        onSearch={handleSearch} 
        placeholder={mode === ResearchMode.UNRESTRICTED ? t.research.placeholder2 : t.research.placeholder1}
        loading={loading}
        historyKey="research"
        initialData={initialData}
      />

      {loading && (
        <div className="p-40 text-center space-y-6">
          <div className="text-primary font-black tracking-[1.5em] uppercase text-sm animate-pulse">{t.research.loading}</div>
          <div className="h-1 bg-border rounded-full max-w-md mx-auto overflow-hidden">
            <div className="h-full bg-primary w-1/3 animate-progress"></div>
          </div>
        </div>
      )}

      {result && (
        <div id="research-results" className="space-y-16 animate-fade-in">
          <div className="glass-card p-12 rounded-[3rem] border-l-[12px] border-primary bg-surface/60 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <h3 className="text-primary font-black text-xs uppercase tracking-[0.6em] mb-10 border-b border-primary/20 pb-6">{t.research.briefing}</h3>
            <div className="prose prose-invert prose-red max-w-none text-text text-xl leading-[1.8] font-serif italic opacity-90">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {mode === ResearchMode.UNRESTRICTED && (
              <button 
                onClick={() => setActiveModule('scandals')} 
                className={`px-8 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 hover:scale-105 ${activeModule === 'scandals' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted'}`}
              >
                <IconShield className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.research.controversies} ({result.scandals.length})</span>
              </button>
            )}
            <button 
              onClick={() => setActiveModule('details')} 
              className={`px-8 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 hover:scale-105 ${activeModule === 'details' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted'}`}
            >
              <IconInfo className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.research.insights}</span>
            </button>
            <button 
              onClick={() => setActiveModule('social')} 
              className={`px-8 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 hover:scale-105 ${activeModule === 'social' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted'}`}
            >
              <IconMenu className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.research.social} ({result.socialWire.length})</span>
            </button>
            <button 
              onClick={() => setActiveModule('visuals')} 
              className={`px-8 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 hover:scale-105 ${activeModule === 'visuals' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted'}`}
            >
              <IconActivity className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.research.visuals} ({result.visualArchives.length})</span>
            </button>
            <button 
              onClick={() => setActiveModule('sources')} 
              className={`px-8 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 hover:scale-105 ${activeModule === 'sources' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted'}`}
            >
              <IconSearch className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.research.sources} ({result.sourceIndex.length})</span>
            </button>
          </div>

          <div className="min-h-[500px] border-t border-border/30 pt-12">
            {activeModule === 'scandals' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                {result.scandals.map((s, i) => (
                  <a 
                    key={i} 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-surface/40 backdrop-blur-sm border border-red-900/40 p-8 rounded-3xl flex gap-6 shadow-xl group hover:border-primary transition-all duration-500 hover:bg-surface/60 cursor-pointer"
                  >
                    <span className="text-primary font-black text-xl opacity-40 group-hover:opacity-100 transition-opacity shrink-0">{(i+1).toString().padStart(2, '0')}</span>
                    <div className="flex flex-col gap-2">
                        <p className="text-text font-serif italic leading-relaxed text-base group-hover:text-white transition-colors">{s.description}</p>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Read Conspiracy →</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {activeModule === 'details' && (
               <div className="glass-card p-12 rounded-[2.5rem] border border-border/40 animate-slide-up bg-surface/30 shadow-2xl">
                  <h4 className="text-primary text-xs font-black uppercase tracking-widest mb-10 opacity-60">{t.research.insights}</h4>
                  <div className="prose prose-invert prose-lg max-w-none text-text leading-[1.8] font-serif space-y-6">
                    <ReactMarkdown>{result.detailedInfo}</ReactMarkdown>
                  </div>
               </div>
            )}

            {activeModule === 'sources' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {result.sourceIndex.map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`p-6 rounded-[2rem] border-l-8 bg-surface/50 hover:bg-black/60 transition-all flex flex-col gap-4 group shadow-md hover:shadow-xl ${src.trustScore === 'TRUSTED' ? 'border-green-600 hover:border-green-400' : 'border-red-600 hover:border-red-400'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full tracking-widest shrink-0 ${src.trustScore === 'TRUSTED' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>{src.trustScore}</span>
                      <span className="text-[9px] font-mono text-text-muted group-hover:text-primary transition-colors">REF-{(i+1).toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-base font-black text-text group-hover:text-primary transition-colors line-clamp-2">{src.title}</span>
                      <span className="text-[10px] text-text-muted font-mono truncate opacity-60">{src.uri}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {activeModule === 'social' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                {result.socialWire.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="glass-card p-8 rounded-[2rem] border border-border group relative block hover:border-primary hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all transform hover:-translate-y-2"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-surface border border-border text-primary uppercase tracking-[0.2em]">{link.platform}</span>
                      <span className="text-text-muted text-[10px] font-mono">#{i+1}</span>
                    </div>
                    <h5 className="font-bold text-xl text-text mb-4 leading-tight group-hover:text-primary transition-colors italic font-serif line-clamp-2">{link.label}</h5>
                    <p className="text-sm text-text-muted italic border-l-2 border-primary/20 pl-4 leading-relaxed line-clamp-3">{link.context}</p>
                    <div className="mt-8 text-[10px] font-black text-primary text-right uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                      Access Post →
                    </div>
                  </a>
                ))}
              </div>
            )}

            {activeModule === 'visuals' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 animate-slide-up">
                {result.visualArchives.map((img, i) => (
                  <a 
                    key={i} 
                    href={img.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group relative overflow-hidden aspect-square rounded-[2rem] border border-border bg-surface block hover:border-primary transition-all duration-700 hover:shadow-2xl"
                  >
                    <img 
                      src={img.url} 
                      alt={img.description} 
                      className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                      <p className="text-[11px] text-white font-serif italic leading-relaxed mb-4 line-clamp-3">{img.description}</p>
                      <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        View Details →
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {!activeModule && (
               <div className="h-80 flex flex-col items-center justify-center text-text-muted font-mono space-y-10 opacity-40">
                  <div className="w-24 h-24 border-[3px] border-dashed border-primary/30 rounded-full flex items-center justify-center animate-spin-slow">
                     <IconMenu className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-[14px] uppercase tracking-[0.6em] font-black text-center italic">{t.research.initiate}</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchTool;