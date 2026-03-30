import React, { useState, useEffect } from 'react';
import { UserProfile, AIModelId, LanguageCode } from '../types';
import { IconUser, IconRefresh, IconDollar, IconShield } from './Icons';
import ModelSelector from './ModelSelector';
import NavBar from './NavBar';
import { translations } from '../services/i18n';

interface Props {
  currentProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  onAddMore?: () => void;
  language: LanguageCode;
}

import HistoryInput from './HistoryInput';
import TerminalSelect from './TerminalSelect';

const UserProfileForm: React.FC<Props> = ({ currentProfile, onSave, onBack, onHome, onGuide, onAddMore, language }) => {
  const [formData, setFormData] = useState<UserProfile>(currentProfile);
  const [saved, setSaved] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');

  const t = translations[language];

  useEffect(() => {
    setFormData(currentProfile);
  }, [currentProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: string, value: string) => {
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    onSave(updated); // Automatic save
  };

  const handleAutofill = () => {
      const savedData = localStorage.getItem('factium_profile');
      if (savedData) {
          try {
              const parsed = JSON.parse(savedData);
              setFormData(parsed);
              onSave(parsed); // Update parent state immediately
              setAutofilled(true);
              setTimeout(() => setAutofilled(false), 3000);
          } catch(e) {
              alert("Corrupted data found. Unable to autofill.");
          }
      } else {
          alert("No saved profile data found on this device.");
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
        <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.profile.title} language={language} />

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-surface border border-border rounded-full text-primary">
                    <IconUser />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-text tracking-tighter uppercase italic font-serif">{t.profile.title}</h2>
                    <p className="text-text-muted">{t.profile.subtitle}</p>
                </div>
            </div>
            <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} onAddMore={onAddMore} />
        </div>

      <form id="profile-form" onSubmit={handleSubmit} className="glass-panel p-8 rounded-xl space-y-6 relative">
        <div className="absolute top-8 right-8">
            <button 
                type="button"
                onClick={handleAutofill}
                className="text-xs flex items-center gap-2 text-primary hover:text-white transition-colors uppercase font-bold tracking-wider"
                title="Restore from Device Storage"
            >
                <IconRefresh className="w-4 h-4" />
                {autofilled ? t.profile.restored : t.profile.autofill}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <HistoryInput
            label={t.profile.labels.name}
            value={formData.name}
            onChange={(val) => handleFieldChange('name', val)}
            historyKey="profile_name"
          />
          <HistoryInput
            label={t.profile.labels.location}
            value={formData.location}
            onChange={(val) => handleFieldChange('location', val)}
            placeholder="e.g. Austin, TX"
            historyKey="profile_location"
          />
          <TerminalSelect
            label={t.profile.labels.income}
            value={formData.incomeRange}
            onChange={(val) => handleFieldChange('incomeRange', val)}
            historyKey="profile_income"
            icon={<IconDollar className="w-4 h-4" />}
            options={[
              { value: "0-30k", label: "Under $30,000" },
              { value: "30k-60k", label: "$30,000 - $60,000" },
              { value: "60k-100k", label: "$60,000 - $100,000" },
              { value: "100k-250k", label: "$100,000 - $250,000" },
              { value: "250k+", label: "$250,000+" }
            ]}
          />
          <HistoryInput
            label={t.profile.labels.family}
            value={formData.familySize.toString()}
            onChange={(val) => handleFieldChange('familySize', val)}
            type="number"
            historyKey="profile_family"
          />
          <HistoryInput
            label={t.profile.labels.occupation}
            value={formData.occupation}
            onChange={(val) => handleFieldChange('occupation', val)}
            historyKey="profile_occupation"
          />
          <TerminalSelect
            label={t.profile.labels.political}
            value={formData.politicalLeaning}
            onChange={(val) => handleFieldChange('politicalLeaning', val)}
            historyKey="profile_political"
            icon={<IconShield className="w-4 h-4" />}
            options={[
              { value: "Neutral", label: "Neutral / Independent" },
              { value: "Conservative", label: "Conservative" },
              { value: "Liberal", label: "Liberal" },
              { value: "Libertarian", label: "Libertarian" },
              { value: "Progressive", label: "Progressive" }
            ]}
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
            <span className="text-primary text-sm font-medium transition-opacity duration-300" style={{ opacity: saved ? 1 : 0 }}>
                {t.profile.savedMsg}
            </span>
            <button
                type="submit"
                className="px-8 py-3 bg-primary hover:opacity-90 text-accent-text font-bold rounded-lg shadow-lg shadow-primary/20 transition-all"
            >
                {t.profile.saveBtn}
            </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;