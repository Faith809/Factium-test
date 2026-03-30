import React, { useState } from 'react';
import ModelSelector from './ModelSelector';
import { AIModelId, LanguageCode } from '../types';
import NavBar from './NavBar';
import { IconShield, IconActivity, IconSearch, IconZap, Logo } from './Icons';
import { translations } from '../services/i18n';

interface AboutPageProps {
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  language: LanguageCode;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack, onHome, onGuide, language }) => {
    const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');
    const t = translations[language];
    
    return (
        <div id="about-content" className="max-w-5xl mx-auto space-y-12 pb-24 animate-fade-in">
             <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.nav.about} language={language} />
             
             <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-border pb-10">
                <div className="flex items-center gap-6">
                  <div className="p-1 rounded-[2rem] bg-sunset-gradient shadow-xl">
                    <Logo className="w-20 h-20" />
                  </div>
                  <div>
                    <h2 className="text-6xl font-black text-text tracking-tighter italic leading-none uppercase font-serif">THE <span className="text-primary">MANIFESTO</span></h2>
                    <p className="text-text-muted mt-2 font-serif italic text-lg max-w-xl">
                      Defining the architectural blueprint for the truth layer.
                    </p>
                  </div>
                </div>
                <div className="bg-surface p-2 rounded-2xl border border-border shadow-xl">
                  <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
                </div>
             </div>

             <div className="grid lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-2 space-y-10">
                    <section className="glass-card p-12 rounded-[3.5rem] border-t-8 border-primary bg-surface/40 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4 text-primary mb-6">
                            <IconShield className="w-10 h-10" />
                            <h3 className="text-3xl font-black italic uppercase font-serif tracking-tight">The Truth Engine</h3>
                        </div>
                        
                        <div className="markdown-body text-xl leading-[1.8] font-serif italic opacity-90">
                            <p>
                                Factium AI is a next-generation decentralized intelligence terminal designed to dismantle information asymmetry. In an era where news is curated by algorithms designed for engagement rather than truth, Factium serves as a raw, unfiltered lens into the world's data.
                            </p>
                            <p>
                                By aggregating millions of data points—from campaign finance records and legislative archives to real-time social sentiment—we empower the individual to bypass media gatekeepers and access the source code of reality itself.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6 pt-10 border-t border-border/20">
                            <div className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-3">
                                <IconSearch className="text-primary w-6 h-6" />
                                <h4 className="font-black text-xs uppercase tracking-widest">Total Transparency</h4>
                                <p className="text-[11px] text-text-muted leading-relaxed italic">Uncovering what is hidden in plain sight through algorithmic auditing.</p>
                            </div>
                            <div className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-3">
                                <IconActivity className="text-primary w-6 h-6" />
                                <h4 className="font-black text-xs uppercase tracking-widest">Predictive Power</h4>
                                <p className="text-[11px] text-text-muted leading-relaxed italic">Forecasting personal economic impact before legislation passes the floor.</p>
                            </div>
                            <div className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-3">
                                <IconShield className="text-primary w-6 h-6" />
                                <h4 className="font-black text-xs uppercase tracking-widest">Bias Elimination</h4>
                                <p className="text-[11px] text-text-muted leading-relaxed italic">Mathematical analysis of media spin using forensic linguistics.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-2xl font-black text-text uppercase tracking-tight pl-6 border-l-4 border-primary italic">Our Core Philosophy</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="glass-card p-10 rounded-[3rem] bg-surface/30 border border-border/40 space-y-4 shadow-xl">
                                <h4 className="text-primary font-black text-xs uppercase tracking-[0.4em]">Decentralized Logic</h4>
                                <p className="text-sm text-text font-serif italic leading-relaxed opacity-80">
                                    We believe intelligence shouldn't be centralized. Factium is a BYOK (Bring Your Own Key) terminal, ensuring that your research remains private, local, and sovereign.
                                </p>
                            </div>
                            <div className="glass-card p-10 rounded-[3rem] bg-surface/30 border border-border/40 space-y-4 shadow-xl">
                                <h4 className="text-primary font-black text-xs uppercase tracking-[0.4em]">The Digital Shield</h4>
                                <p className="text-sm text-text font-serif italic leading-relaxed opacity-80">
                                    Your personal data is your greatest asset. Factium utilizes local storage and encrypted filaments to prevent tracking of your curiosity.
                                </p>
                            </div>
                        </div>
                    </section>
                 </div>

                 <div className="space-y-10">
                    <div className="glass-card p-10 rounded-[3rem] bg-sunset-gradient shadow-2xl space-y-8 border-none">
                    <span style={{ color: 'var(--app-accent-text, #fff)' }}>
                      <IconZap className="w-12 h-12" />
                    </span>
                        <h3 className="text-2xl font-black italic uppercase font-serif" style={{ color: 'var(--app-accent-text, #fff)' }}>Future Roadmap</h3>
                        <ul className="space-y-6 font-serif italic text-sm opacity-90" style={{ color: 'var(--app-accent-text, #fff)' }}>
                            <li className="flex gap-4 border-b border-white/10 pb-4">
                                <span className="font-black text-xl opacity-40">01</span>
                                <span>Integration of fully autonomous verification layers for the decentralized web.</span>
                            </li>
                            <li className="flex gap-4 border-b border-white/10 pb-4">
                                <span className="font-black text-xl opacity-40">02</span>
                                <span>Real-time "Policy Shield" calculations for tax, health, and economic shifts.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-black text-xl opacity-40">03</span>
                                <span>Peer-to-peer truth grounding via consensus mechanisms.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border border-border/40 bg-surface/20 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">System Integrity</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-mono text-text-muted">CORE KERNEL: ONLINE</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-mono text-text-muted">ENCRYPTION: AES-256</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-xs font-mono text-text-muted">PROTOCOL: V2.5-ELITE</span>
                        </div>
                    </div>
                 </div>
             </div>

             <div className="pt-20 border-t border-border/20 text-center space-y-4">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.8em] opacity-40">Factium AI // Established 2025 // No Hallucinations, Only Verifications</p>
                <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent w-full opacity-20"></div>
             </div>
        </div>
    );
};

export default AboutPage;