
import React, { useEffect, useState } from 'react';
import { AIModel, AIModelId, CustomAIModel } from '../types';

interface Props {
  selectedModel: AIModelId;
  onSelect: (model: AIModelId) => void;
  onAddMore?: () => void;
}

const DEFAULT_MODELS: AIModel[] = [
  // Free Models
  { id: 'factium-native', name: 'Factium Native (Gemini Flash)', type: 'Free' },
  { id: 'deepseek-r1', name: 'DeepSeek R1 (Simulated)', type: 'Free' },
  { id: 'nolimit-gpt-free', name: 'NoLimitGPT (Free/Unfiltered)', type: 'Free' },
  { id: 'llama-3-unfiltered', name: 'Llama 3 AI (Unfiltered)', type: 'Free' },
  
  // Paid Models (Simulated for Demo)
  { id: 'gpt-4o', name: 'GPT-4o (Simulated)', type: 'Paid' },
  { id: 'claude-3.5', name: 'Claude 3.5 Sonnet (Simulated)', type: 'Paid' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', type: 'Paid' },
  { id: 'grok-1', name: 'Grok-1 (Simulated)', type: 'Paid' },
  { id: 'nolimit-gpt-paid', name: 'NoLimitGPT (Paid/Raw Access)', type: 'Paid' },
  { id: 'godmode-unrestricted', name: 'GodMode (Unlimited Access)', type: 'Paid' },
];

// Marketplace Models (For Display Matching)
const MARKETPLACE_METADATA: Record<string, string> = {
    'legal-eagle-prime': 'LegalEagle Prime (Specialist)',
    'dark-web-crawler': 'DarkWeb Crawler (Specialist)',
    'wall-street-oracle': 'Wall St. Oracle (Specialist)'
};

const ModelSelector: React.FC<Props> = ({ selectedModel, onSelect, onAddMore }) => {
  const [allModels, setAllModels] = useState<AIModel[]>(DEFAULT_MODELS);

  useEffect(() => {
      // Load Custom and Unlocked Models from Storage
      const unlockedIds: string[] = JSON.parse(localStorage.getItem('factium_unlocked_models') || '[]');
      const customModels: CustomAIModel[] = JSON.parse(localStorage.getItem('factium_custom_models') || '[]');
      
      // Load Custom Providers from Vault (Only if they have a key)
      const vaultStr = localStorage.getItem('factium_vault');
      const vault = vaultStr ? JSON.parse(vaultStr) : null;
      
      const customProviders: AIModel[] = (vault?.customProviders || [])
        .filter((cp: any) => vault?.keys?.[cp.id] || cp.apiKey)
        .map((cp: any) => ({
            id: cp.id,
            name: `${cp.name} (Custom)`,
            type: 'Custom'
        }));

      const unlockedModelObjects: AIModel[] = unlockedIds.map(id => ({
          id: id,
          name: MARKETPLACE_METADATA[id] || id,
          type: 'Paid'
      }));

      const customModelObjects: AIModel[] = customModels.map(m => ({
          id: m.id,
          name: `${m.name} (Persona)`,
          type: 'Custom'
      }));

      // Combine defaults with new ones, filtering out duplicates if any
      const combined = [...DEFAULT_MODELS, ...unlockedModelObjects, ...customProviders, ...customModelObjects];
      setAllModels(combined);

  }, []);

  const freeModels = allModels.filter(m => m.type === 'Free');
  const paidModels = allModels.filter(m => m.type === 'Paid');
  const customModels = allModels.filter(m => m.type === 'Custom');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'add-more') {
      if (onAddMore) onAddMore();
    } else {
      onSelect(val as AIModelId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-text-muted uppercase hidden sm:block">AI Model:</span>
      <select
        value={selectedModel}
        onChange={handleChange}
        className="bg-surface border border-border rounded-lg text-xs py-1.5 px-3 text-text focus:outline-none focus:border-primary cursor-pointer font-mono max-w-[200px]"
      >
        <optgroup label="Free Tier">
          {freeModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Paid / Unlocked Tier">
          {paidModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="User Custom Models">
          {customModels.map(model => (
              <option key={model.id} value={model.id}>
              {model.name}
              </option>
          ))}
          <option value="add-more">+ Add more...</option>
        </optgroup>
      </select>
    </div>
  );
};

export default ModelSelector;