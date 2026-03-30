import React, { useState, useEffect } from 'react';
import { IconX, IconHistory } from './Icons';
import { SearchHistory } from '../types';

interface HistoryInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  historyKey: string;
  type?: string;
}

const HistoryInput: React.FC<HistoryInputProps> = ({ label, value, onChange, placeholder, historyKey, type = "text" }) => {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`history_${historyKey}`);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [historyKey]);

  const saveToHistory = (val: string) => {
    if (!val.trim()) return;
    const newEntry: SearchHistory = {
      id: Math.random().toString(36).substr(2, 9),
      query: val,
      timestamp: Date.now()
    };
    const updatedHistory = [newEntry, ...history.filter(h => h.query !== val)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem(`history_${historyKey}`, JSON.stringify(updatedHistory));
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(`history_${historyKey}`, JSON.stringify(updatedHistory));
  };

  return (
    <div className="relative space-y-2 group">
      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => {
            saveToHistory(value);
            setTimeout(() => setShowHistory(false), 200);
          }}
          placeholder={placeholder}
          className="w-full bg-surface/50 dark:bg-black border border-border focus:border-primary rounded-2xl py-4 px-6 text-text dark:text-white focus:outline-none transition-all"
        />
        
        {showHistory && history.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down">
            <div className="p-3 border-b border-border flex items-center gap-2 text-text-muted">
              <IconHistory className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Previous Entries</span>
            </div>
            {history.map(h => (
              <div
                key={h.id}
                onClick={() => {
                  onChange(h.query);
                  setShowHistory(false);
                }}
                className="flex items-center justify-between px-5 py-3 hover:bg-white/5 cursor-pointer group/item transition-colors"
              >
                <span className="text-sm text-text">{h.query}</span>
                <button
                  onClick={(e) => deleteHistoryEntry(h.id, e)}
                  className="p-1 text-text-muted hover:text-primary opacity-0 group-hover/item:opacity-100 transition-all"
                >
                  <IconX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryInput;
