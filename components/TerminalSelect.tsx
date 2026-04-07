import React, { useState, useEffect, useRef } from 'react';
import { IconX, IconHistory, IconRefresh } from './Icons';
import { SearchHistory } from '../types';

interface Option {
  value: string;
  label: string;
}

interface TerminalSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (val: string) => void;
  historyKey: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const TerminalSelect: React.FC<TerminalSelectProps> = ({ label, value, options, onChange, historyKey, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`history_${historyKey}`);
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [historyKey]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveToHistory = (val: string) => {
    if (!val) return;
    const newEntry: SearchHistory = {
      id: Math.random().toString(36).substr(2, 9),
      query: val,
      timestamp: Date.now()
    };
    const updatedHistory = [newEntry, ...history.filter(h => h.query !== val)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem(`history_${historyKey}`, JSON.stringify(updatedHistory));
  };

  const handleSelect = (val: string) => {
    onChange(val);
    saveToHistory(val);
    setIsOpen(false);
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(`history_${historyKey}`, JSON.stringify(updatedHistory));
  };

  const selectedOption = (options || []).find(o => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : value || placeholder || "Select Option";

  const filteredOptions = (options || []).filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative space-y-2 group" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface/50 dark:bg-black border border-border rounded-2xl py-4 px-6 text-text dark:text-white cursor-pointer transition-all flex items-center justify-between ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <span className={`font-serif italic ${!value ? 'opacity-40' : ''}`}>{displayValue}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onChange(''); }}
                    className="p-1 text-text-muted hover:text-primary transition-colors"
                >
                    <IconX className="w-3 h-3" />
                </button>
            )}
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-primary animate-pulse' : 'bg-border'}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 dark:bg-black backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down">
          
          <div className="p-2 border-b border-border/50">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search options..."
              className="w-full bg-white/5 dark:bg-white/10 border-none rounded-xl py-2 px-4 text-xs text-text dark:text-white focus:outline-none placeholder:text-text-muted/50"
            />
          </div>

          {searchTerm === '' && history.length > 0 && (
            <div className="border-b border-border/50">
              <div className="p-3 flex items-center gap-2 text-text-muted bg-white/5">
                <IconHistory className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Recent Selections</span>
              </div>
              {history.map(h => (
                <div
                  key={h.id}
                  onClick={() => handleSelect(h.query)}
                  className="flex items-center justify-between px-6 py-3 hover:bg-primary/10 cursor-pointer group/item transition-colors"
                >
                  <span className="text-sm text-text dark:text-white font-serif italic">{(options || []).find(o => o.value === h.query)?.label || h.query}</span>
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

          <div className="p-3 flex items-center gap-2 text-text-muted bg-white/5">
            <IconRefresh className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {searchTerm ? `Results for "${searchTerm}"` : "All Options"}
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-6 py-4 hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-primary/5 text-primary' : 'text-text dark:text-white'}`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-text-muted italic text-xs">
                No matching options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalSelect;
