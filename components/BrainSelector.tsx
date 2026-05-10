import React, { useState, useEffect } from 'react';
import { IconShield, IconZap, IconActivity, IconInfo, IconLock, IconUnlock, IconGlobe, IconCheck, IconCpu, IconDownload, IconTerminal } from './Icons';
import { LanguageCode, AIModelId } from '../types';
import { translations } from '../services/i18n';
import NavBar from './NavBar';

interface ModelInfo {
  id: string;
  name: string;
  type: 'Free' | 'High-Power';
  size: string;
  ram: string;
  potential: string;
  description: string;
  downloadUrl: {
    windows: string;
    mac: string;
    linux: string;
    mobile: string;
  };
}

const LOCAL_MODELS: ModelInfo[] = [
  // 4 Free Models
  {
    id: 'llama3:8b',
    name: 'Llama 3 (8B)',
    type: 'Free',
    size: '4.7 GB',
    ram: '8 GB',
    potential: 'Balanced',
    description: 'The most popular open-weight model. Great for general reasoning and fast search analysis.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/llama3'
    }
  },
  {
    id: 'phi3:mini',
    name: 'Phi-3 Mini',
    type: 'Free',
    size: '2.3 GB',
    ram: '4 GB',
    potential: 'Lightning Fast',
    description: 'Microsoft\'s ultra-light model. Perfect for quick summaries and low-power devices.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/phi3'
    }
  },
  {
    id: 'mistral:latest',
    name: 'Mistral (7B)',
    type: 'Free',
    size: '4.1 GB',
    ram: '8 GB',
    potential: 'Creative Forensic',
    description: 'Highly efficient and accurate. Excellent for identifying nuances and hidden bias.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/mistral'
    }
  },
  {
    id: 'gemma:2b',
    name: 'Gemma (2B)',
    type: 'Free',
    size: '1.6 GB',
    ram: '4 GB',
    potential: 'Micro-Engine',
    description: 'Google\'s lightweight open model. Runs on almost any modern smartphone or laptop.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/gemma'
    }
  },
  // 3 Paid/High-Power Models
  {
    id: 'llama3:70b',
    name: 'Llama 3 (70B)',
    type: 'High-Power',
    size: '40 GB',
    ram: '64 GB',
    potential: 'Super-Intelligence',
    description: 'The powerhouse. Requires a dedicated GPU (24GB+ VRAM) or high system RAM. Human-level reasoning.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/llama3:70b'
    }
  },
  {
    id: 'deepseek-coder:33b',
    name: 'DeepSeek Coder',
    type: 'High-Power',
    size: '20 GB',
    ram: '32 GB',
    potential: 'Logic Specialist',
    description: 'State-of-the-art coding and logic performance. Best for mathematical truth extraction.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/deepseek-coder'
    }
  },
  {
    id: 'command-r:latest',
    name: 'Command R',
    type: 'High-Power',
    size: '22 GB',
    ram: '32 GB',
    potential: 'Research Specialist',
    description: 'Built specifically for RAG (Retrieval Augmented Generation). Best for long-context search.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/command-r'
    }
  }
];

const BrainSelector: React.FC<{onBack: () => void; onHome: () => void; onGuide: () => void; language: LanguageCode}> = ({ onBack, onHome, onGuide, language }) => {
  const [activeModel, setActiveModel] = useState<string>('llama3:8b');
  const [customModel, setCustomModel] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  const [detectedOS, setDetectedOS] = useState<'windows' | 'mac' | 'linux' | 'mobile'>('windows');
  const [searchEnabled, setSearchEnabled] = useState<boolean>(true);
  
  const t = translations[language];

  useEffect(() => {
    // Initial state from vault
    const vault = JSON.parse(localStorage.getItem('factium_vault') || '{}');
    if (vault.localModel) setActiveModel(vault.localModel);
    if (vault.localSearchEnabled !== undefined) setSearchEnabled(vault.localSearchEnabled);

    // Basic OS detection
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('win')) setDetectedOS('windows');
    else if (ua.includes('mac')) setDetectedOS('mac');
    else if (ua.includes('linux')) setDetectedOS('linux');
    else if (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) setDetectedOS('mobile');

    // Ping Ollama
    const checkConnection = async () => {
      try {
        const res = await fetch('http://localhost:11434/api/tags');
        if (res.ok) setConnectionStatus('online');
        else setConnectionStatus('offline');
      } catch (e) {
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleActiveModel = (id: string) => {
    setActiveModel(id);
    const vault = JSON.parse(localStorage.getItem('factium_vault') || '{}');
    vault.localModel = id;
    vault.activeProvider = 'local';
    localStorage.setItem('factium_vault', JSON.stringify(vault));
  };

  const handleCustomModel = () => {
    if (!customModel.trim()) return;
    handleActiveModel(customModel);
  };

  const toggleSearch = () => {
    const newState = !searchEnabled;
    setSearchEnabled(newState);
    const vault = JSON.parse(localStorage.getItem('factium_vault') || '{}');
    vault.localSearchEnabled = newState;
    localStorage.setItem('factium_vault', JSON.stringify(vault));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in font-sans">
      <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.nav.local} language={language} />

      <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-7xl font-black text-text tracking-tighter italic uppercase leading-none">
            BRAIN <span className="text-sunset-gradient">FOUNDRY</span>
          </h2>
          <p className="text-text-muted font-serif italic text-xl opacity-80 decoration-primary/30 decoration-wavy underline">
            Transitioning to Local-First Search Architecture. zero server costs, 100% privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all duration-500 shadow-xl ${connectionStatus === 'online' ? 'bg-green-500/10 border-green-500 shadow-green-500/10' : 'bg-red-500/10 border-red-500 shadow-red-500/10'}`}>
               <div className={`w-4 h-4 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500'}`} />
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 opacity-60">Engine Status</p>
                 <p className={`text-sm font-black uppercase tracking-widest ${connectionStatus === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                   {connectionStatus === 'online' ? 'LOCAL ENGINE CONNECTED' : 'ENGINE OFFLINE'}
                 </p>
               </div>
            </div>

            <div 
              onClick={toggleSearch}
              className={`p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all duration-500 shadow-xl cursor-pointer ${searchEnabled ? 'bg-primary/10 border-primary shadow-primary/10' : 'bg-surface border-border opacity-60'}`}
            >
               <IconGlobe className={`w-6 h-6 ${searchEnabled ? 'text-primary' : 'text-text-muted'}`} />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 opacity-60">Live Internet Extraction</p>
                  <p className={`text-sm font-black uppercase tracking-widest ${searchEnabled ? 'text-primary' : 'text-text-muted'}`}>
                    {searchEnabled ? 'RAG SEARCH ENABLED' : 'SEARCH DISABLED'}
                  </p>
               </div>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Curated Gallery */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 border-b border-border/20 pb-4">
              <IconZap className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">CURATED AI GALLERY</h3>
           </div>

           <div className="grid gap-6">
              {LOCAL_MODELS.map(model => (
                <div 
                  key={model.id}
                  onClick={() => handleActiveModel(model.id)}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer group shadow-lg flex flex-col justify-between ${activeModel === model.id ? 'bg-surface border-primary ring-8 ring-primary/5 scale-[1.03] z-10' : 'bg-black/20 border-border hover:border-primary/50'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <h4 className="text-3xl font-black text-text tracking-tight italic font-serif leading-none">{model.name}</h4>
                           {model.type === 'High-Power' && <span className="p-1 rounded-md bg-sunset-gradient text-[8px] text-white font-black uppercase">Ultra</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${model.type === 'Free' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                            {model.type} • {model.size}
                          </span>
                          <span className="text-[9px] font-black px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 uppercase tracking-widest">
                            Min RAM: {model.ram}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full transition-all duration-500 ${activeModel === model.id ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-surface border border-border text-text-muted group-hover:text-primary'}`}>
                        {activeModel === model.id ? <IconCheck className="w-5 h-5" /> : <IconCpu className="w-5 h-5" />}
                      </div>
                    </div>
                    <p className="text-[13px] text-text-muted italic leading-relaxed mb-10 opacity-70 font-serif">{model.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary decoration-primary/20 transition-all group-hover:tracking-[0.3em]">Potential: {model.potential}</span>
                    <a 
                      href={model.downloadUrl[detectedOS]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/dl px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDownload className="w-3 h-3 transition-transform group-hover/dl:translate-y-0.5" />
                      Get for {detectedOS}
                    </a>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Custom Input & Instructions */}
        <div className="lg:sticky lg:top-24 h-fit space-y-8">
           <div className="flex items-center gap-4 border-b border-border/20 pb-4">
              <IconActivity className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">CUSTOM INTEGRATION</h3>
           </div>

           <div className="glass-card p-10 rounded-[3rem] space-y-8 border border-primary/20 bg-surface/40 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                 <IconTerminal className="w-64 h-64 grayscale" />
              </div>
              
              <p className="text-sm text-text-muted font-serif italic leading-relaxed relative z-10">
                Already have a model downloaded in your local engine? Enter its exact identifier below. This bypasses curation and connects directly to the local port.
              </p>
              
              <div className="space-y-4 relative z-10">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted pl-2">Local Model Name (Ollama Tag)</label>
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="e.g. deepseek-coder:33b"
                      className="flex-1 bg-black/40 border border-border rounded-2xl px-6 py-4 text-sm font-mono text-white focus:border-primary outline-none transition-all shadow-inner"
                    />
                    <button 
                      onClick={handleCustomModel}
                      className="px-8 py-4 bg-sunset-btn rounded-2xl text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      ACTIVATE
                    </button>
                 </div>
              </div>

              <div className="mt-12 pt-12 border-t border-border/20 space-y-6 relative z-10">
                 <h4 className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest">
                    <IconInfo className="w-4 h-4" /> Setup Workflow
                 </h4>
                 <ul className="space-y-5 text-xs text-text-muted font-serif italic leading-relaxed pl-2 opacity-80">
                    <li className="flex gap-4"><span className="text-primary font-black border-b border-primary/20 pb-1">01.</span> Installation: Download <strong className="text-text">Ollama</strong> for your OS. It acts as the local "Brain Stem" for this app.</li>
                    <li className="flex gap-4"><span className="text-primary font-black border-b border-primary/20 pb-1">02.</span> Warming up: Open your terminal and run <code className="bg-black p-1 rounded font-mono text-primary">ollama run llama3</code>.</li>
                    <li className="flex gap-4"><span className="text-primary font-black border-b border-primary/20 pb-1">03.</span> Sync: Once the model is pulled, it will appear as "Connected" in our health monitor.</li>
                    <li className="flex gap-4"><span className="text-primary font-black border-b border-primary/20 pb-1">04.</span> Network: Ensure <code className="bg-black p-1 rounded font-mono">localhost:11434</code> is accessible. No firewall should block it.</li>
                 </ul>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 items-start animate-pulse-slow shadow-sm group">
              <IconLock className="w-8 h-8 text-amber-500 shrink-0 group-hover:rotate-12 transition-transform" />
              <div>
                 <h5 className="text-amber-500 font-extrabold text-xs uppercase tracking-widest mb-2">ZERO-LATENCY PRIVACY GATE</h5>
                 <p className="text-[11px] text-amber-200/50 leading-relaxed font-serif italic">
                    By operating locally, you are shielded from cloud telemetry. Your search queries are processed locally and injected into the "Brain" on-device. No data is sent to external AI servers for training or monitoring.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BrainSelector;
