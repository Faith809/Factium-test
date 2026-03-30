import React, { useState, useEffect } from 'react';
import { simulatePolicy } from '../services/geminiService';
import { PolicyImpact, UserProfile, AIModelId, AppView, LanguageCode } from '../types';
import { IconActivity, IconUser, IconInfo, IconRefresh, IconSearch, IconShield } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ReactMarkdown from 'react-markdown';
import ModelSelector from './ModelSelector';
import NavBar from './NavBar';
import { translations } from '../services/i18n';

interface Props {
  userProfile: UserProfile;
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  onNavigate: (view: AppView) => void;
  onAddMore?: () => void;
  language: LanguageCode;
}

import TerminalSelect from './TerminalSelect';
import SearchTerminal from './SearchTerminal';

import { saveSyncData } from '../services/dbService';

const PolicySimulator: React.FC<Props> = ({ userProfile: initialProfile, onBack, onHome, onGuide, onNavigate, onAddMore, language }) => {
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState<PolicyImpact | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');
  const [activeTab, setActiveTab] = useState<'impact' | 'analysis' | 'news' | 'discourse' | 'verification'>('impact');
  
  // Profile Vault
  const [profileVault, setProfileVault] = useState<UserProfile[]>([]);
  const [selectedVaultProfile, setSelectedVaultProfile] = useState<UserProfile>(initialProfile);

  const t = translations[language];

  useEffect(() => {
    // Load vault from localStorage (System storage for user protection)
    const vault = localStorage.getItem('factium_profile_vault');
    if (vault) {
      const parsedVault = JSON.parse(vault) as UserProfile[];
      setProfileVault(parsedVault);
      // If the current initial profile is not in vault, add it
      if (!parsedVault.find(p => p.name === initialProfile.name)) {
          const newVault = [initialProfile, ...parsedVault];
          setProfileVault(newVault);
          localStorage.setItem('factium_profile_vault', JSON.stringify(newVault));
      }
    } else {
      setProfileVault([initialProfile]);
      localStorage.setItem('factium_profile_vault', JSON.stringify([initialProfile]));
    }
  }, [initialProfile]);

  const handleSimulate = async (policy: string, attachments: any[]) => {
    if (!policy.trim() && attachments.length === 0) return;
    setLoading(true);
    setImpact(null);
    try {
      const result = await simulatePolicy(policy, selectedVaultProfile, selectedModel, attachments);
      setImpact(result);
      setActiveTab('impact');
      
      // Save to DB
      await saveSyncData({
        id: `policy-${Date.now()}`,
        type: 'policy',
        data: { query: policy, response: result },
        timestamp: Date.now(),
        imported: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSwitch = (val: string) => {
      const prof = profileVault.find(p => p.name === val);
      if (prof) setSelectedVaultProfile(prof);
  };

  const scoreData = impact ? [
    { name: 'Economic', score: impact.economicScore },
    { name: 'Social', score: impact.socialScore }
  ] : [];

  const isProfileComplete = selectedVaultProfile.location && selectedVaultProfile.incomeRange && selectedVaultProfile.occupation;

  if (!isProfileComplete) {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.policy.title} language={language} />
            <div className="glass-panel p-12 rounded-xl text-center border-2 border-red-600 space-y-6 flex flex-col items-center justify-center animate-fade-in">
                <div className="p-6 bg-red-950/30 rounded-full text-red-500">
                    <IconUser className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter">{t.policy.denied}</h2>
                <p className="text-text-muted max-w-lg mx-auto">
                    {t.policy.deniedDesc}
                </p>
                <button 
                    onClick={() => onNavigate(AppView.PROFILE)}
                    className="px-8 py-4 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/40"
                >
                    {t.policy.configureBtn}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.policy.title} language={language} />
      
      {/* Profile Switcher Dropdown (Referenced Profiles) */}
      <div id="policy-profile-status" className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-2xl border border-border/40 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3 flex-1">
            <div className="flex flex-col w-full">
                <TerminalSelect
                    label={t.policy.profileVault}
                    value={selectedVaultProfile.name}
                    onChange={handleProfileSwitch}
                    historyKey="policy_profile_vault"
                    icon={<IconUser className="w-4 h-4" />}
                    options={profileVault.map(p => ({
                        value: p.name,
                        label: `${p.name} (${p.location})`
                    }))}
                />
            </div>
        </div>
        <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} onAddMore={onAddMore} />
      </div>

      <div className="text-center md:text-left py-4">
        <h2 className="text-4xl font-black text-text mb-2 tracking-tighter uppercase italic font-serif">
            {t.policy.title.split(' ')[0]} <span className="text-primary">{t.policy.title.split(' ').slice(1).join(' ')}</span>
        </h2>
        <p className="text-text-muted">{t.policy.subtitle}</p>
      </div>

      <div id="policy-terminal" className="max-w-4xl mx-auto">
        <SearchTerminal 
          onSearch={handleSimulate} 
          placeholder={t.policy.placeholder}
          loading={loading}
          historyKey="policy"
        />
      </div>

      {impact && (
        <div id="policy-results" className="space-y-8 animate-fade-in">
          
          {/* Tabs for Future Look */}
          <div className="flex border-b border-border overflow-x-auto custom-scrollbar whitespace-nowrap gap-2">
              <button 
                onClick={() => setActiveTab('impact')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'impact' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
              >
                {t.policy.tabs.impact}
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
              >
                {t.policy.tabs.analysis}
              </button>
              <button 
                onClick={() => setActiveTab('news')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'news' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
              >
                {t.policy.tabs.news} (10)
              </button>
              <button 
                onClick={() => setActiveTab('discourse')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'discourse' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
              >
                {t.policy.tabs.discourse} (10)
              </button>
              <button 
                onClick={() => setActiveTab('verification')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verification' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
              >
                {t.policy.tabs.verification} (15)
              </button>
          </div>

          <div className="min-h-[500px]">
            {/* IMPACT TAB */}
            {activeTab === 'impact' && (
                <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
                    <div className="glass-panel p-10 rounded-[3rem] border border-primary/20 bg-surface/40 shadow-xl flex flex-col justify-center">
                        <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-10 opacity-60">{t.policy.scoreTitle}</h3>
                        <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" domain={[-10, 10]} hide />
                            <YAxis dataKey="name" type="category" stroke="#525252" fontSize={10} fontWeight="bold" />
                            <ReferenceLine x={0} stroke="#525252" />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                cursor={{fill: 'rgba(220, 38, 38, 0.05)'}}
                            />
                            <Bar dataKey="score" fill="#DC2626" radius={[0, 10, 10, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel p-10 rounded-[3rem] space-y-6 shadow-xl bg-surface/40 border border-border/40">
                        <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.5em] opacity-60">{t.policy.narrativeTitle}</h3>
                        <p className="text-text italic font-serif text-lg leading-relaxed border-l-4 border-primary/20 pl-8">
                            {impact.personalImpactSummary}
                        </p>
                        
                        <div className="pt-6 border-t border-border/10">
                            <h4 className="text-primary text-[10px] font-black uppercase tracking-widest mb-6">{t.policy.timelineTitle}</h4>
                            <div className="space-y-4">
                                {impact.timeline.map((event, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <span className="text-text font-mono text-xs bg-surface border border-border px-3 py-1 rounded-full shadow-sm">{event.year}</span>
                                    <span className="text-text-muted text-sm italic font-serif leading-relaxed">{event.predictedEvent}</span>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ANALYSIS TAB - 3 PARAGRAPHS */}
            {activeTab === 'analysis' && (
                <div className="glass-panel p-12 rounded-[3.5rem] border-l-[12px] border-primary bg-surface/50 shadow-2xl animate-slide-up">
                    <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-10 pb-6 border-b border-primary/10 flex items-center gap-3">
                        <IconInfo className="w-6 h-6" /> Detailed Forensic Analysis
                    </h3>
                    <div className="prose prose-invert prose-xl max-w-none text-text leading-[2] font-serif italic space-y-10">
                        <ReactMarkdown>{impact.forensicExplanation}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* NEWS & TRENDS TAB - 10 RESULTS */}
            {activeTab === 'news' && (
                <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
                    {impact.newsPredictions.map((news, i) => (
                        <a 
                            key={i} 
                            href={news.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="glass-card p-10 rounded-[2.5rem] border border-border bg-surface/40 hover:bg-black/80 hover:border-primary transition-all duration-700 group flex items-start gap-8 shadow-lg"
                        >
                            <span className="text-primary font-black opacity-20 group-hover:opacity-100 transition-opacity text-xl font-mono shrink-0">{(i+1).toString().padStart(2, '0')}</span>
                            <div className="space-y-4 overflow-hidden">
                                <h4 className="font-bold text-text text-xl leading-tight group-hover:text-primary transition-colors italic font-serif">{news.headline}</h4>
                                <p className="text-sm text-text-muted italic border-l-2 border-primary/20 pl-6 line-clamp-2">{news.trend}</p>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">Access Forecast →</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* PUBLIC DISCOURSE TAB - 10 RESULTS */}
            {activeTab === 'discourse' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                    {impact.socialDiscourse.map((post, i) => (
                        <a 
                            key={i} 
                            href={post.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="glass-card p-8 rounded-[2rem] border border-border bg-surface/50 hover:border-primary group relative block transition-all hover:shadow-[0_0_40px_rgba(220,38,38,0.1)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-black/40 border border-primary/20 text-primary uppercase tracking-[0.2em]">{post.platform}</span>
                                <span className="text-text-muted text-[10px] font-mono">#{i+1}</span>
                            </div>
                            <p className="text-base font-bold text-text italic mb-6 leading-relaxed group-hover:text-white transition-colors">"{post.controversy}"</p>
                            <div className="text-[10px] font-black text-primary text-right uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                                View Debate →
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* VERIFICATION TAB - 15 RESULTS */}
            {activeTab === 'verification' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {impact.referenceSources.map((ref, i) => (
                        <a 
                            key={i} 
                            href={ref.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-8 rounded-[2rem] border-l-8 border-primary bg-surface/50 hover:bg-black/90 hover:shadow-2xl transition-all flex items-center gap-6 group shadow-md"
                        >
                            <span className="text-primary font-black opacity-30 group-hover:opacity-100 transition-opacity font-mono">REF {(i+1).toString().padStart(2, '0')}</span>
                            <div className="flex flex-col gap-2 overflow-hidden">
                                <span className="text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-1">{ref.title}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted truncate">External Documentation Gateway →</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
          </div>

          <div className="pt-10 border-t border-border/20 text-center">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[1em] opacity-30 italic">Future Look Forecast Protocol // v2.5 verified</p>
          </div>

        </div>
      )}
    </div>
  );
};

export default PolicySimulator;