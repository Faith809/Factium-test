
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllSyncData, deleteSyncData, SyncData, markAsImported } from '../services/dbService';
import { Trash2, ExternalLink, Image as ImageIcon, Mic, Clock, CheckCircle } from 'lucide-react';

interface CapturedIntelligenceProps {
  onImport: (data: SyncData) => void;
}

const CapturedIntelligence: React.FC<CapturedIntelligenceProps> = ({ onImport }) => {
  const [items, setItems] = useState<SyncData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllSyncData();
      setItems(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Failed to load sync data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 5 seconds to catch new captures from overlay
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    await deleteSyncData(id);
    setItems(items.filter(item => item.id !== id));
  };

  const handleImport = async (item: SyncData) => {
    await markAsImported(item.id);
    onImport(item);
    loadData();
  };

  if (items.length === 0 && !loading) return null;

  return (
    <div id="captured-intelligence" className="space-y-10 animate-fade-in">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-black italic uppercase font-serif tracking-tight">Captured Intelligence</h3>
            <p className="text-text-muted text-xs font-serif italic">Data filaments synchronized from the Quick-Access Overlay.</p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
          {items.length} Filaments Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass-card p-6 rounded-[2rem] border border-border relative group hover:border-primary/30 transition-all ${item.imported ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${item.type === 'screenshot' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                    {item.type === 'screenshot' ? <ImageIcon size={16} /> : <Mic size={16} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {item.type === 'screenshot' ? 'Visual Capture' : 'Audio Capture'}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden bg-background/50 border border-border mb-6 relative group/media">
                {item.type === 'screenshot' ? (
                  <img src={item.data} alt="Capture" className="w-full h-full object-cover grayscale-[30%] group-hover/media:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                      <Mic size={24} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Audio Waveform Encrypted</span>
                  </div>
                )}
                {item.imported && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-500">
                      <CheckCircle size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Imported</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-text-muted opacity-50">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <button 
                  onClick={() => handleImport(item)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  <ExternalLink size={12} />
                  Process in Research
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CapturedIntelligence;
