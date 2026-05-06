import React, { useState, useEffect } from 'react';
import { IconShield, IconZap, IconActivity, IconInfo, IconLock, IconUnlock } from './Icons';
import { LanguageCode, AIModelId } from '../types';
import { translations } from '../services/i18n';
import NavBar from './NavBar';

interface ModelInfo {
  id: string;
  name: string;
  type: 'Free' | 'High-Resource';
  size: string;
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
    potential: 'Micro-Engine',
    description: 'Google\'s lightweight open model. Runs on almost any modern smartphone or laptop.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/gemma'
    }
  },
  // 3 Paid/High-Resource Models
  {
    id: 'llama3:70b',
    name: 'Llama 3 (70B)',
    type: 'High-Resource',
    size: '40 GB',
    potential: 'Super-Intelligence',
    description: 'The powerhouse. Requires a dedicated GPU (24GB+ VRAM). Human-level reasoning.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/llama3:70b'
    }
  },
  {
    id: 'command-r:latest',
    name: 'Command R',
    type: 'High-Resource',
    size: '22 GB',
    potential: 'Research Specialist',
    description: 'Built specifically for RAG (Retrieval Augmented Generation). Best for long-context search.',
    downloadUrl: {
      windows: 'https://ollama.com/download/windows',
      mac: 'https://ollama.com/download/mac',
      linux: 'https://ollama.com/download/linux',
      mobile: 'https://ollama.com/library/command-r'
    }
  },
  {
    id: 'custom:paid',
    name: 'External Brain (API)',
    type: 'High-Resource',
    size: 'Cloud-Based',
    potential: 'No-Limit',
    description: 'Connect to external high-end models via private API keys (Claude 3.5 Opus / GPT-4o).',
    downloadUrl: {
      windows: 'https://www.anthropic.com/',
      mac: 'https://www.openai.com/',
      linux: 'https://huggingface.co/',
      mobile: 'https://huggingface.co/'
    }
  }
];

const BrainSelector: React.FC<{onBack: () => void; onHome: () => void; onGuide: () => void; language: LanguageCode}> = ({ onBack, onHome, onGuide, language }) => {
  const [activeModel, setActiveModel] = useState<string>('llama3:8b');
  const [customModel, setCustomModel] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  const [detectedOS, setDetectedOS] = useState<'windows' | 'mac' | 'linux' | 'mobile'>('windows');
  
  const t = translations[language];

  useEffect(() => {
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
    setActiveModel(customModel);
    const vault = JSON.parse(localStorage.getItem('factium_vault') || '{}');
    vault.localModel = customModel;
    vault.activeProvider = 'local';
    localStorage.setItem('factium_vault', JSON.stringify(vault));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
      <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.nav.local} language={language} />

      <div className="flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-6xl font-black text-text tracking-tighter italic uppercase leading-none">
            BRAIN <span className="text-primary">FOUNDRY</span>
          </h2>
          <p className="text-text-muted font-serif italic text-xl">
            Choose your local engine. No server costs, 100% privacy, and forensic power on your own hardware.
          </p>
        </div>

        <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all duration-500 shadow-xl ${connectionStatus === 'online' ? 'bg-green-500/10 border-green-500 shadow-green-500/10' : 'bg-red-500/10 border-red-500 shadow-red-500/10'}`}>
           <div className={`w-4 h-4 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
           <div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Local Provider Health</p>
             <p className={`text-sm font-black uppercase tracking-widest ${connectionStatus === 'online' ? 'text-green-500' : 'text-red-500'}`}>
               {connectionStatus === 'online' ? 'ENGINE CONNECTED' : 'ENGINE OFFLINE'}
             </p>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Curated Gallery */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 border-b border-border pb-4">
              <IconZap className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">CURATED AI GALLERY</h3>
           </div>

           <div className="grid gap-4">
              {LOCAL_MODELS.map(model => (
                <div 
                  key={model.id}
                  onClick={() => handleActiveModel(model.id)}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer group shadow-lg ${activeModel === model.id ? 'bg-surface border-primary ring-4 ring-primary/5 scale-[1.02]' : 'bg-black/20 border-border hover:border-primary/50'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-text mb-1 tracking-tight italic font-serif">{model.name}</h4>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${model.type === 'Free' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                        {model.type} • {model.size}
                      </span>
                    </div>
                    {activeModel === model.id ? <IconShield className="w-6 h-6 text-primary" /> : null}
                  </div>
                  <p className="text-sm text-text-muted italic leading-relaxed mb-8 opacity-80">{model.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Potential: {model.potential}</span>
                    <a 
                      href={model.downloadUrl[detectedOS]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Download for {detectedOS}
                    </a>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Custom Input & Instructions */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 border-b border-border pb-4">
              <IconActivity className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">CUSTOM INTEGRATION</h3>
           </div>

           <div className="glass-card p-10 rounded-[3rem] space-y-8 border border-primary/20 bg-surface/40 shadow-2xl">
              <p className="text-sm text-text-muted font-serif italic leading-relaxed">
                Already have a model in your local engine that isn't on our list? Enter its exact name (e.g. <code className="text-primary font-mono bg-black/40 px-2 py-1 rounded">deepseek-coder:33b</code>) below to integrate it immediately.
              </p>
              
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted pl-2">Custom Model Identifier</label>
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="e.g. mistral-nemo"
                      className="flex-1 bg-black/40 border border-border rounded-2xl px-6 py-4 text-sm font-mono text-white focus:border-primary outline-none transition-all"
                    />
                    <button 
                      onClick={handleCustomModel}
                      className="px-8 py-4 bg-primary rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-lg"
                    >
                      ACTIVATE
                    </button>
                 </div>
              </div>

              <div className="mt-12 pt-12 border-t border-border/20 space-y-6">
                 <h4 className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest">
                    <IconInfo className="w-4 h-4" /> Setup Instructions
                 </h4>
                 <ul className="space-y-4 text-xs text-text-muted font-serif italic leading-relaxed pl-2">
                    <li className="flex gap-4"><span className="text-primary font-black">01.</span> Download and install <strong>Ollama</strong> as your local engine.</li>
                    <li className="flex gap-4"><span className="text-primary font-black">02.</span> Open terminal and run <code className="bg-black p-1 rounded">ollama run llama3</code> to preload the brain.</li>
                    <li className="flex gap-4"><span className="text-primary font-black">03.</span> Switch 'Active Provider' to Local in this app's dashboard.</li>
                    <li className="flex gap-4"><span className="text-primary font-black">04.</span> Ensure your firewall allows connections to port 11434.</li>
                 </ul>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 items-start animate-pulse shadow-sm">
              <IconLock className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                 <h5 className="text-amber-500 font-extrabold text-xs uppercase tracking-widest mb-2">FORENSIC PRIVACY GUARANTEE</h5>
                 <p className="text-[11px] text-amber-200/60 leading-relaxed font-serif italic">
                    In Local-First mode, your search queries and document analysis never leave the machine. The AI process happens 100% locally. Internet data is retrieved by our app and fed directly to your local brain.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BrainSelector;
