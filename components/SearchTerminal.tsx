import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconMic, IconPaperclip, IconImage, IconFile, IconX, IconHistory, IconRefresh } from './Icons';
import { SearchHistory, Attachment } from '../types';
import { getAllSyncData, markAsImported } from '../services/dbService';

interface SearchTerminalProps {
  onSearch: (query: string, attachments: Attachment[]) => void;
  placeholder: string;
  loading: boolean;
  historyKey: string;
  initialData?: { query: string, attachments: Attachment[] } | null;
  id?: string;
}

const SearchTerminal: React.FC<SearchTerminalProps> = ({ onSearch, placeholder, loading, historyKey, initialData, id }) => {
  const [query, setQuery] = useState(initialData?.query || '');
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.query) setQuery(initialData.query);
      if (initialData.attachments) {
        setAttachments(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newItems = initialData.attachments.filter(a => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [initialData]);

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('factium_sync');
    
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'IMPORT_DATA') {
        const { query: newQuery, attachments: newAttachments } = event.data.payload;
        
        if (newQuery) setQuery(newQuery);
        if (newAttachments) {
          setAttachments(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const filtered = newAttachments.filter((a: Attachment) => !existingIds.has(a.id));
            return [...prev, ...filtered];
          });
        }
      }
    };

    const checkSyncData = async () => {
      const data = await getAllSyncData();
      const unimported = data.filter(item => !item.imported);
      
      if (unimported.length > 0) {
        setAttachments(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newAttachments: Attachment[] = unimported
            .filter(item => !existingIds.has(item.id))
            .map(item => ({
              id: item.id,
              name: `QuickAccess_${item.type}_${new Date(item.timestamp).toLocaleTimeString()}`,
              type: item.type === 'screenshot' ? 'image/png' : 'audio/webm',
              size: item.data.length,
              data: item.data,
              previewUrl: item.type === 'screenshot' ? item.data : undefined
            }));
          return [...prev, ...newAttachments];
        });
        
        for (const item of unimported) {
          await markAsImported(item.id);
        }
      }
    };

    checkSyncData();
    const interval = setInterval(checkSyncData, 5000); // Poll every 5s
    return () => {
      broadcastChannel.close();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`history_${historyKey}`);
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedAttachments = localStorage.getItem(`pending_attachments_${historyKey}`);
    if (savedAttachments) setAttachments(JSON.parse(savedAttachments));
  }, [historyKey]);

  useEffect(() => {
    localStorage.setItem(`pending_attachments_${historyKey}`, JSON.stringify(attachments));
  }, [attachments, historyKey]);

  const saveToHistory = (q: string) => {
    const newEntry: SearchHistory = {
      id: Math.random().toString(36).substr(2, 9),
      query: q,
      timestamp: Date.now()
    };
    const updatedHistory = [newEntry, ...history.filter(h => h.query !== q)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem(`history_${historyKey}`, JSON.stringify(updatedHistory));
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(`history_${historyKey}`, JSON.stringify(updatedHistory));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result as string,
          previewUrl: type === 'image' ? (event.target?.result as string) : undefined
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setQuery(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && attachments.length === 0) return;
    if (query.trim()) saveToHistory(query.trim());
    onSearch(query, attachments);
    setAttachments([]);
    setShowHistory(false);
  };

  return (
    <div id={id} className="relative w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="relative group flex flex-col gap-4"
      >
        <div className="relative flex items-center bg-surface backdrop-blur-2xl border border-border rounded-[3rem] p-2 shadow-2xl transition-all duration-500 focus-within:ring-2 focus-within:ring-primary/50">
          
          <div className="flex items-center gap-2 pl-6">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-3 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-primary/5"
              title="Attach Image"
            >
              <IconImage className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-primary/5"
              title="Attach File"
            >
              <IconPaperclip className="w-6 h-6" />
            </button>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none py-6 px-4 text-xl text-text placeholder:text-text-muted/50 focus:outline-none font-serif italic"
          />

          <div className="flex items-center gap-2 pr-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 transition-all rounded-full ${isListening ? 'bg-primary text-[var(--app-accent-text)] animate-pulse' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
              title="Voice Input"
            >
              <IconMic className="w-6 h-6" />
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="p-5 bg-primary text-[var(--app-accent-text)] rounded-full transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 hover:opacity-90"
            >
              {loading ? <IconRefresh className="animate-spin w-7 h-7" /> : <IconSearch className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 px-6 animate-fade-in">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center gap-2 bg-surface backdrop-blur-md border border-border rounded-2xl p-2 pr-3 group/chip transition-all hover:bg-primary/5">
                {att.previewUrl ? (
                  <img src={att.previewUrl} alt={att.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <IconFile className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="text-xs font-medium text-text max-w-[120px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 text-text-muted hover:text-primary transition-colors"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => handleFileUpload(e, 'file')} 
          className="hidden" 
          multiple 
        />
        <input 
          type="file" 
          ref={imageInputRef} 
          onChange={(e) => handleFileUpload(e, 'image')} 
          className="hidden" 
          accept="image/*" 
          multiple 
        />

        {showHistory && history.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-surface/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden z-50 animate-slide-down">
            <div className="p-4 border-b border-border flex items-center gap-2 text-text-muted">
              <IconHistory className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recent Searches</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.map(h => (
                <div
                  key={h.id}
                  onClick={() => {
                    setQuery(h.query);
                    setShowHistory(false);
                  }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 cursor-pointer group/item transition-colors"
                >
                  <span className="text-text font-serif italic">{h.query}</span>
                  <button
                    onClick={(e) => deleteHistoryEntry(h.id, e)}
                    className="p-2 text-text-muted hover:text-primary opacity-0 group-hover/item:opacity-100 transition-all"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchTerminal;
