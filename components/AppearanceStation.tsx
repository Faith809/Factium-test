import React from 'react';
import { AppearanceSettings } from '../types';
import { IconX, IconSun, IconMoon, IconZap } from './Icons';

interface Props {
  settings: AppearanceSettings;
  onUpdate: (settings: AppearanceSettings) => void;
  onClose: () => void;
}

export const METALLIC_ACCENTS = [
  { name: 'Gold', color: '#f59e0b', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
  { name: 'Silver', color: '#94A3B8', gradient: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)' },
  { name: 'Bronze', color: '#B45309', gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' },
  { name: 'Metallic Blue', color: '#1D4ED8', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' },
  { name: 'Emerald', color: '#047857', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)' },
  { name: 'Ruby', color: '#B91C1C', gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' },
  { name: 'Amethyst', color: '#7E22CE', gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)' },
  { name: 'Rose Gold', color: '#E11D48', gradient: 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)' },
  { name: 'Copper', color: '#92400E', gradient: 'linear-gradient(135deg, #B45309 0%, #92400E 100%)' },
  { name: 'Platinum', color: '#475569', gradient: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)' },
];

export const BACKGROUND_TONES = [
  // Light Range
  { name: 'Soft White', color: '#F8FAFC', isDark: false },
  { name: 'Bone', color: '#F5F5F0', isDark: false },
  { name: 'Light Grey', color: '#E2E8F0', isDark: false },
  { name: 'Sky Tint', color: '#F0F9FF', isDark: false },
  // Dark Range
  { name: 'Midnight', color: '#02040A', isDark: true },
  { name: 'Charcoal', color: '#1A202C', isDark: true },
  { name: 'Deep Navy', color: '#0A192F', isDark: true },
  { name: 'Forest Black', color: '#050A05', isDark: true },
];

const AppearanceStation: React.FC<Props> = ({ settings, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card max-w-lg w-full rounded-[2.5rem] border-2 border-primary shadow-2xl relative overflow-hidden flex flex-col animate-slide-up">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconZap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black italic uppercase font-serif tracking-tight">Appearance Station</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text transition-colors">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Row 1: Metallic Accents */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Metallic Accents</label>
            <div className="grid grid-cols-5 gap-4">
              {METALLIC_ACCENTS.map((accent) => (
                <button
                  key={accent.name}
                  onClick={() => onUpdate({ ...settings, accent: accent.color, accentGradient: accent.gradient })}
                  className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-lg ${settings.accent === accent.color ? 'border-white scale-110 ring-2 ring-primary' : 'border-transparent'}`}
                  style={{ background: accent.gradient }}
                  title={accent.name}
                />
              ))}
            </div>
          </div>

          {/* Row 2: Background Tones */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Background Tones</label>
            <div className="grid grid-cols-4 gap-4">
              {BACKGROUND_TONES.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => onUpdate({ ...settings, background: bg.color, isDark: bg.isDark })}
                  className={`h-12 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center ${settings.background === bg.color ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                  style={{ backgroundColor: bg.color }}
                  title={bg.name}
                >
                  {bg.isDark ? <IconMoon className="w-4 h-4 text-white/40" /> : <IconSun className="w-4 h-4 text-black/20" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-surface/50 border-t border-border text-center">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Dynamic Appearance Engine v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default AppearanceStation;
