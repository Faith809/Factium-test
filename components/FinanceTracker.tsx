import React, { useState } from 'react';
import { trackCampaignFinance } from '../services/geminiService';
import { AIModelId, FinanceTrackerResponse, LanguageCode } from '../types';
import { IconDollar, IconInfo, IconActivity, IconShield, IconSearch } from './Icons';
import ReactMarkdown from 'react-markdown';
import ModelSelector from './ModelSelector';
import NavBar from './NavBar';
import { translations } from '../services/i18n';

interface FinanceTrackerProps {
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  onAddMore?: () => void;
  language: LanguageCode;
}

import SearchTerminal from './SearchTerminal';

import { saveSyncData } from '../services/dbService';

const FinanceTracker: React.FC<FinanceTrackerProps> = ({ onBack, onHome, onGuide, onAddMore, language }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinanceTrackerResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');
  
  const t = translations[language];

  // Tabs
  const [activeTab, setActiveTab] = useState<'donors' | 'social' | 'news' | 'analysis' | 'verification'>('donors');

  const handleTrack = async (query: string, attachments: any[]) => {
    if (!query.trim() && attachments.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      // Add delay to prevent parallel requests and rate limiting
      await new Promise(r => setTimeout(r, 1500));
      const data = await trackCampaignFinance(query, selectedModel, attachments);
      setResult(data);
      setActiveTab('analysis');
      
      // Save to DB
      await saveSyncData({
        id: `finance-${Date.now()}`,
        type: 'finance',
        data: { query, response: data },
        timestamp: Date.now(),
        imported: true
      });
    } catch (e) {
      alert("Tracking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.finance.title} language={language} />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2 tracking-tighter uppercase italic font-serif">{t.finance.title}</h2>
          <p className="text-text-muted">{t.finance.subtitle}</p>
        </div>
        <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} onAddMore={onAddMore} />
      </div>

      <SearchTerminal 
        id="finance-terminal"
        onSearch={handleTrack} 
        placeholder={t.finance.placeholder}
        loading={loading}
        historyKey="finance"
      />

      {result && (
        <div className="animate-fade-in space-y-6">
          
          {/* Summary Card */}
          <div className="glass-panel p-6 rounded-xl border-l-4 border-primary">
             <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-2">{t.finance.briefTitle}</h3>
             <p className="text-text leading-relaxed text-sm">{result.summary}</p>
          </div>

          {/* Navigation Tabs for Results */}
          <div className="flex border-b border-border overflow-x-auto custom-scrollbar whitespace-nowrap">
              <button 
                onClick={() => setActiveTab('donors')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'donors' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
              >
                {t.finance.tabs.donors}
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analysis' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
              >
                {t.finance.tabs.analysis}
              </button>
              <button 
                onClick={() => setActiveTab('news')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'news' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
              >
                {t.finance.tabs.news}
              </button>
              <button 
                onClick={() => setActiveTab('social')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'social' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
              >
                {t.finance.tabs.social}
              </button>
              <button 
                onClick={() => setActiveTab('verification')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'verification' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
              >
                {t.finance.tabs.verification}
              </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
              
              {/* DONORS TAB */}
              {activeTab === 'donors' && (
                  <div className="grid gap-4 animate-fade-in">
                      {result.donors && result.donors.length > 0 ? result.donors.map((donor, idx) => (
                          <div key={idx} className="glass-panel p-4 rounded-xl border-l-2 border-primary/50 hover:border-primary transition-all">
                              <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                                  <h4 className="font-bold text-lg text-text">{donor.name}</h4>
                                  <span className="font-mono text-primary font-bold bg-primary/20 px-3 py-1 rounded">{donor.amount || "Undisclosed"}</span>
                              </div>
                              <p className="text-sm text-text-muted mb-2"><span className="text-text-muted font-bold">Affiliation:</span> {donor.affiliation}</p>
                              <p className="text-sm text-red-400/80 mb-3"><span className="font-bold">Controversy:</span> {donor.controversy}</p>
                              <a href={donor.sourceLink} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:opacity-80 uppercase font-black tracking-widest flex items-center gap-1">
                                  Open Source Site →
                              </a>
                          </div>
                      )) : (
                          <div className="p-8 text-center text-text-muted font-mono border border-dashed border-border rounded-xl">
                              {t.finance.noData}
                          </div>
                      )}
                  </div>
              )}

              {/* ONLINE CHAT TAB - 15 RESULTS */}
              {activeTab === 'social' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                      {result.socialMediaFeed.map((item, idx) => (
                          <a 
                            key={idx} 
                            href={item.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="glass-panel p-6 rounded-[1.5rem] border border-border group hover:border-primary transition-all flex flex-col justify-between hover:bg-black/40"
                          >
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black bg-primary/10 border border-primary/30 px-3 py-1 rounded-full text-primary uppercase">{item.platform}</span>
                                    <span className="text-[9px] text-text-muted font-mono">#{idx+1}</span>
                                </div>
                                <h5 className="text-base font-bold text-text italic mb-4 group-hover:text-primary transition-colors leading-snug">"{item.headline}"</h5>
                                <p className="text-xs text-text-muted italic border-l-2 border-primary/20 pl-4">{item.context}</p>
                              </div>
                              <div className="mt-6 text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Source Site →</div>
                          </a>
                      ))}
                  </div>
              )}

              {/* NEWS TAB - 10 RESULTS */}
              {activeTab === 'news' && (
                  <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                       {result.newsFeed.map((news, idx) => (
                           <a 
                            key={idx} 
                            href={news.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="glass-card p-6 rounded-3xl border border-border bg-surface/40 hover:bg-black/60 transition-all flex justify-between items-start group shadow-md"
                           >
                               <div className="space-y-3">
                                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block opacity-60">Archive 0{idx+1}</span>
                                   <h4 className="font-bold text-text text-lg leading-tight group-hover:text-primary transition-colors">{news.headline}</h4>
                                   <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{news.source}</span>
                               </div>
               <div className="p-3 bg-surface border border-border rounded-xl group-hover:border-primary transition-all">
                                  <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Source Site →</span>
                               </div>
                           </a>
                       ))}
                  </div>
              )}

              {/* ANALYSIS TAB - 3 PARAGRAPHS */}
              {activeTab === 'analysis' && (
                  <div className="glass-card p-12 rounded-[3.5rem] border-l-[10px] border-primary bg-surface/40 shadow-2xl animate-slide-up">
                      <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-10 pb-6 border-b border-primary/10 flex items-center gap-3">
                        <IconInfo className="w-5 h-5" /> Analysis & Explanation
                      </h4>
                      <div className="markdown-body text-xl leading-[1.8] font-serif italic">
                        <ReactMarkdown>{result.forensicExplanation}</ReactMarkdown>
                      </div>
                  </div>
              )}

              {/* VERIFICATION TAB - 15 REFERENCE LINKS */}
              {activeTab === 'verification' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {result.referenceSources.map((ref, i) => (
                      <a 
                        key={i} 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="glass-card p-8 rounded-[2.5rem] border border-border bg-surface/30 hover:bg-black/90 hover:border-primary transition-all duration-500 group flex items-start gap-6 shadow-xl"
                      >
                        <span className="text-primary font-black opacity-30 group-hover:opacity-100 transition-opacity font-mono">REF {(i+1).toString().padStart(2, '0')}</span>
                        <div className="flex flex-col gap-3 overflow-hidden">
                          <p className="text-text italic font-serif leading-snug group-hover:text-white transition-colors line-clamp-2">{ref.title}</p>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-primary transition-colors truncate">Open Source Site →</span>
                        </div>
                      </a>
                    ))}
                  </div>
              )}
          </div>
          
          {/* Internal Grounding Footer */}
          <div className="mt-8 pt-6 border-t border-border/40">
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-6 italic opacity-50">Grounding Matrix // verified reference points</p>
             <div className="flex flex-wrap gap-2">
                 {result.sources.length > 0 ? result.sources.map((s, i) => (
                     <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-surface text-text-muted px-4 py-2 rounded-full hover:bg-black border border-border hover:border-primary hover:text-primary transition-all max-w-xs truncate font-mono italic">{s.title}</a>
                 )) : <span className="text-[10px] text-text-muted italic opacity-40">Internal verification in progress...</span>}
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default FinanceTracker;