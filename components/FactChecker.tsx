import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { analyzeBias } from '../services/geminiService';
import { BiasMetric, AIModelId, ResearchMode, LanguageCode } from '../types';
import { IconShield, IconLock, IconUnlock, IconInfo, IconActivity, IconRefresh, IconSearch } from './Icons';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import ModelSelector from './ModelSelector';
import NavBar from './NavBar';
import { translations } from '../services/i18n';

interface FactCheckerProps {
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  onAddMore?: () => void;
  language: LanguageCode;
}

import SearchTerminal from './SearchTerminal';

import { saveSyncData } from '../services/dbService';

const FactChecker: React.FC<FactCheckerProps> = ({ onBack, onHome, onGuide, onAddMore, language }) => {
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<BiasMetric | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');
  const [mode, setMode] = useState<ResearchMode>(ResearchMode.RESTRICTED);
  const [activeTab, setActiveTab] = useState<'report' | 'forensic' | 'proof'>('report');

  const t = translations[language];

  // Sync active tab when mode changes to ensure restricted tabs are not accessible
  useEffect(() => {
    if (mode === ResearchMode.RESTRICTED && activeTab === 'report') {
      setActiveTab('forensic');
    }
  }, [mode]);

  const handleAnalyze = async (text: string, attachments: any[]) => {
    if (!text.trim() && attachments.length === 0) return;
    setLoading(true);
    setMetric(null);
    try {
      const data = await analyzeBias(text, selectedModel, mode, attachments);
      setMetric(data);
      // Ensure we don't default to a restricted tab
      setActiveTab(mode === ResearchMode.UNRESTRICTED ? 'report' : 'forensic');
      
      // Save to DB
      await saveSyncData({
        id: `fact-check-${Date.now()}`,
        type: 'fact_check',
        data: { query: text, response: data },
        timestamp: Date.now(),
        imported: true
      });
    } catch (e) {
      console.error(e);
      alert("Analysis sequence failed. Neural links are unstable.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = metric ? [
    { name: 'Neutrality', uv: 100 - metric.score, fill: '#262626' },
    { name: 'Bias Level', uv: metric.score, fill: metric.score > 50 ? '#DC2626' : '#ea580c' }
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in">
      <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.nav.factChecker} language={language} />
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="text-6xl font-black text-text tracking-tighter italic leading-none uppercase">
            {t.factChecker.title.split(' ')[0]} <span className="text-primary">{t.factChecker.title.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-text-muted mt-4 font-serif italic text-lg max-w-xl">
            {t.factChecker.subtitle}
          </p>
        </div>
        <div className="bg-surface p-2 rounded-2xl border border-border shadow-xl">
          <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} onAddMore={onAddMore} />
        </div>
      </div>

      <div className="glass-card p-2 rounded-3xl flex bg-black/40 border border-border w-fit shadow-2xl">
        <button 
          onClick={() => setMode(ResearchMode.RESTRICTED)} 
          className={`px-10 py-3 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${mode === ResearchMode.RESTRICTED ? 'bg-white text-black shadow-lg scale-105' : 'text-text-muted hover:text-white'}`}
        >
          {t.factChecker.modeRestricted}
        </button>
        <button 
          onClick={() => setMode(ResearchMode.UNRESTRICTED)} 
          className={`px-10 py-3 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${mode === ResearchMode.UNRESTRICTED ? 'bg-primary text-white shadow-[0_0_25px_rgba(220,38,38,0.3)] scale-105' : 'text-text-muted hover:text-white'}`}
        >
          {t.factChecker.modeUnrestricted}
        </button>
      </div>

      <div id="fact-checker-terminal" className="max-w-4xl mx-auto">
        <SearchTerminal 
          onSearch={handleAnalyze} 
          placeholder={t.factChecker.placeholder}
          loading={loading}
          historyKey="factcheck"
        />
      </div>

      <div className="space-y-8 min-h-[600px]">
        {!metric && !loading && (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[3rem] p-12 text-text-muted font-mono opacity-40 text-center">
            <div className="w-20 h-20 rounded-full border border-dashed border-primary mb-8 flex items-center justify-center animate-spin-slow">
               <IconShield className="w-8 h-8 text-primary" />
            </div>
            <p className="uppercase tracking-[0.6em] text-xs">Waiting for your story...</p>
          </div>
        )}

        {loading && (
          <div className="glass-card h-full rounded-[3rem] flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="text-primary font-black tracking-[1.5em] uppercase text-sm animate-pulse">{t.factChecker.loading}</div>
            <div className="h-1 bg-border rounded-full w-full max-w-md overflow-hidden">
              <div className="h-full bg-primary w-1/3 animate-progress"></div>
            </div>
          </div>
        )}

        {metric && (
          <div id="fact-checker-results" className="animate-fade-in space-y-8">
            <div id="fact-checker-tabs" className="flex flex-wrap gap-3">
              {mode === ResearchMode.UNRESTRICTED && (
                <button 
                  onClick={() => setActiveTab('report')}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === 'report' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted hover:border-primary/50'}`}
                >
                  <IconActivity className="w-4 h-4" /> {t.factChecker.tabs.report}
                </button>
              )}
              <button 
                onClick={() => setActiveTab('forensic')}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === 'forensic' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted hover:border-primary/50'}`}
              >
                <IconInfo className="w-4 h-4" /> {t.factChecker.tabs.forensic}
              </button>
              <button 
                onClick={() => setActiveTab('proof')}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === 'proof' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface border-border text-text-muted hover:border-primary/50'}`}
              >
                <IconSearch className="w-4 h-4" /> {t.factChecker.tabs.proof}
              </button>
            </div>

            {activeTab === 'report' && mode === ResearchMode.UNRESTRICTED && (
              <div className="space-y-8 animate-slide-up">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card p-10 rounded-[3rem] border border-primary/20 bg-surface/40 shadow-xl flex flex-col items-center">
                     <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-60">Bias Meter</h4>
                     <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={10} data={chartData} startAngle={180} endAngle={0}>
                          <RadialBar background dataKey="uv" cornerRadius={10} />
                          <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-text text-5xl font-black font-serif italic">
                            {metric.score}%
                          </text>
                          <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-text-muted text-[10px] uppercase font-black tracking-widest">
                            {metric.label}
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="glass-card p-10 rounded-[3rem] border border-border/40 bg-surface/40 shadow-xl">
                    <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Quick Summary</h4>
                    <p className="text-text font-serif italic text-lg leading-relaxed opacity-90 border-l-4 border-primary/20 pl-6">
                      {metric.reasoning}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border border-border/40 bg-surface/40 shadow-xl">
                    <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">News, Controversies & Conspiracies</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {metric.findingsSources.map((s, idx) => (
                        <a 
                          key={idx} 
                          href={s.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-6 rounded-3xl bg-black/20 border border-white/5 hover:border-primary transition-all group shadow-md"
                        >
                          <span className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">FINDING #{idx + 1}</span>
                          <p className="text-sm font-serif italic leading-snug line-clamp-2 mb-4">{s.description}</p>
                          <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">Read Story →</span>
                        </a>
                      ))}
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'forensic' && (
              <div className="glass-card p-12 rounded-[3.5rem] border border-primary/20 bg-surface/40 shadow-2xl animate-slide-up">
                <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 border-b border-primary/10 pb-6">{t.factChecker.tabs.forensic}</h4>
                <div className="prose prose-invert prose-lg max-w-none text-text leading-[1.8] font-serif italic space-y-8">
                  <ReactMarkdown>{metric.forensicExplanation}</ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'proof' && (
              <div className="space-y-8 animate-slide-up">
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metric.referenceSources.map((ref, i) => (
                    <a 
                      key={i} 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="glass-card p-8 rounded-[2.5rem] border border-border bg-surface/50 hover:bg-black/80 hover:border-primary transition-all duration-500 group flex items-start gap-6 shadow-xl"
                    >
                      <span className="text-primary font-black opacity-30 group-hover:opacity-100 transition-opacity font-mono">{(i+1).toString().padStart(2, '0')}</span>
                      <div className="flex flex-col gap-3 overflow-hidden">
                        <p className="text-text italic font-serif leading-snug group-hover:text-white transition-colors line-clamp-1">{ref.title}</p>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-primary transition-colors truncate">Open Source Site →</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactChecker;