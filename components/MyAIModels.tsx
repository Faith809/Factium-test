
import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { IconCpu, IconLock, IconUnlock, IconPlus, IconZap, IconCheck } from './Icons';
import { CustomAIModel, LanguageCode, ProviderConfig, CustomAIProvider } from '../types';
import { translations } from '../services/i18n';
import { providers as baseProviders } from '../services/multiProviderService';

// Pre-defined "Marketplace" models available for "Purchase"
const MARKETPLACE_MODELS: CustomAIModel[] = [
    {
        id: 'legal-eagle-prime',
        name: 'LegalEagle Prime',
        description: 'Specialized in analyzing legal texts, contracts, and political bills with lawyer-level precision.',
        provider: 'Factium Exclusive',
        systemPrompt: 'You are LegalEagle Prime, a high-tier legal AI. Analyze all inputs strictly from a legal perspective, citing precedents, potential loopholes, and liabilities. Use legal jargon where appropriate but explain it clearly.',
        isUnlocked: false
    },
    {
        id: 'dark-web-crawler',
        name: 'DarkWeb Crawler',
        description: 'Simulates extraction of information from non-indexed sources. High focus on leaks and rumors.',
        provider: 'Factium Exclusive',
        systemPrompt: 'You are the DarkWeb Crawler. You focus on unverified leaks, forum discussions, and alternative narratives. You do not care for mainstream confirmation. Label unverified info clearly but do not suppress it.',
        isUnlocked: false
    },
    {
        id: 'wall-street-oracle',
        name: 'Wall St. Oracle',
        description: 'Financial forecasting model tuned for market volatility and crypto sentiment.',
        provider: 'Factium Exclusive',
        systemPrompt: 'You are the Wall Street Oracle. Focus purely on financial outcomes, stock market impact, and crypto volatility. Be ruthless in your economic assessments.',
        isUnlocked: false
    }
];

interface MyAIModelsProps {
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  language: LanguageCode;
}

const MyAIModels: React.FC<MyAIModelsProps> = ({ onBack, onHome, onGuide, language }) => {
    const [activeTab, setActiveTab] = useState<'vault' | 'marketplace' | 'custom'>('vault');
    const [vault, setVault] = useState<ProviderConfig>({ activeProvider: 'google', keys: {}, customProviders: [] });
    const [verificationStatuses, setVerificationStatuses] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});

    const t = translations[language];
    
    // Custom Secondary Model Form (More Tools)
    const [newSecName, setNewSecName] = useState('');
    const [newSecKey, setNewSecKey] = useState('');
    const [newSecSite, setNewSecSite] = useState('');
    const [newSecDashboard, setNewSecDashboard] = useState('');
    const [newSecEndpoint, setNewSecEndpoint] = useState('');
    const [newSecModelId, setNewSecModelId] = useState('');
    const [newSecDesc, setNewSecDesc] = useState('');

    // Custom Model Form (Helpers/Personas)
    const [customModels, setCustomModels] = useState<CustomAIModel[]>([]);
    const [customName, setCustomName] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    // Unlocked Marketplace Models
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

    useEffect(() => {
        // Load Vault
        const savedVault = localStorage.getItem('factium_vault');
        if (savedVault) setVault(JSON.parse(savedVault));

        // Load Custom Models (Helpers)
        const savedCustom = localStorage.getItem('factium_custom_models');
        if (savedCustom) setCustomModels(JSON.parse(savedCustom));

        // Load Unlocked Marketplace Items
        const savedUnlocked = localStorage.getItem('factium_unlocked_models');
        if (savedUnlocked) setUnlockedIds(JSON.parse(savedUnlocked));
    }, []);

    const handleSaveVault = () => {
        localStorage.setItem('factium_vault', JSON.stringify(vault));
        alert("AI Credentials Securely Stored in Local Vault.");
    };

    const handleUpdateKey = (providerId: string, key: string) => {
        setVault(prev => ({
            ...prev,
            keys: { ...prev.keys, [providerId]: key }
        }));
        setVerificationStatuses(prev => ({ ...prev, [providerId]: 'idle' }));
    };

    const handleVerifyKey = (providerId: string) => {
        const key = vault.keys[providerId];
        if (!key) return;

        setVerificationStatuses(prev => ({ ...prev, [providerId]: 'loading' }));
        
        // Simulate verification
        setTimeout(() => {
            setVerificationStatuses(prev => ({ ...prev, [providerId]: 'success' }));
            alert(`AI Model '${providerId}' successfully verified and integrated.`);
        }, 1500);
    };

    const handleAddCustomSecondary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSecName || !newSecEndpoint || !newSecModelId) {
            alert("Please fill in the mandatory fields (Name, Endpoint, Model ID).");
            return;
        }

        const newProvider: CustomAIProvider = {
            id: `custom-${Date.now()}`,
            name: newSecName,
            description: newSecDesc || 'User Preferred Secondary Model',
            keyUrl: newSecSite,
            siteUrl: newSecSite,
            dashboardUrl: newSecDashboard,
            endpoint: newSecEndpoint,
            modelId: newSecModelId,
            apiKey: newSecKey
        };

        const updatedVault = {
            ...vault,
            customProviders: [...(vault.customProviders || []), newProvider],
            keys: { ...vault.keys, [newProvider.id]: newSecKey }
        };

        setVault(updatedVault);
        localStorage.setItem('factium_vault', JSON.stringify(updatedVault));
        
        // Reset form
        setNewSecName('');
        setNewSecKey('');
        setNewSecSite('');
        setNewSecDashboard('');
        setNewSecEndpoint('');
        setNewSecModelId('');
        setNewSecDesc('');

        alert(`Secondary AI Model '${newProvider.name}' added to your Secure Keys.`);
    };

    const handleCreateCustomModel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customName || !customPrompt) return;

        const newModel: CustomAIModel = {
            id: `custom-${Date.now()}`,
            name: customName,
            description: 'User Defined Custom Model',
            provider: 'Custom',
            systemPrompt: customPrompt,
            isUnlocked: true
        };

        const updated = [...customModels, newModel];
        setCustomModels(updated);
        localStorage.setItem('factium_custom_models', JSON.stringify(updated));
        setCustomName('');
        setCustomPrompt('');
        alert("New Model '"+newModel.name+"' Forged & Added to Selectors.");
    };

    const handlePurchase = (model: CustomAIModel) => {
        const confirm = window.confirm(`Purchase license for ${model.name}? (Simulated Transaction)`);
        if (confirm) {
            const updatedUnlocked = [...unlockedIds, model.id];
            setUnlockedIds(updatedUnlocked);
            localStorage.setItem('factium_unlocked_models', JSON.stringify(updatedUnlocked));
            alert("License Acquired. Model is now available in all terminals.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title={t.models.title} language={language} />

            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full text-primary">
                    <IconCpu className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-text tracking-tighter uppercase italic font-serif">{t.models.title}</h2>
                    <p className="text-text-muted">{t.models.subtitle}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button 
                    onClick={() => setActiveTab('vault')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'vault' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
                >
                    {t.models.tabs.vault}
                </button>
                <button 
                    onClick={() => setActiveTab('marketplace')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'marketplace' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
                >
                    {t.models.tabs.marketplace}
                </button>
                <button 
                    onClick={() => setActiveTab('custom')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'custom' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-text-muted hover:text-text'}`}
                >
                    {t.models.tabs.custom}
                </button>
            </div>

            <div className="min-h-[400px]">
                
                {/* VAULT TAB */}
                {activeTab === 'vault' && (
                    <div id="models-vault" className="glass-panel p-8 rounded-xl animate-fade-in space-y-8">
                        <div className="border-l-4 border-primary pl-4 mb-6">
                            <h3 className="text-xl font-bold text-text">{t.models.vaultHeader}</h3>
                            <p className="text-text-muted text-sm mt-1">
                                {t.models.vaultDesc}
                            </p>
                        </div>
                        
                        <div className="space-y-12">
                            {/* Saved Models Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-border pb-2">
                                    <IconCheck className="text-green-500 w-5 h-5" />
                                    <h4 className="text-sm font-black text-text uppercase tracking-widest">Saved Models</h4>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {baseProviders.filter(p => vault.keys[p.id] || p.id === 'google').map(p => (
                                        <div key={p.id} className="space-y-3 p-4 border border-green-500/20 rounded-xl bg-green-500/5 relative group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{p.name}</label>
                                                    <IconCheck className="text-green-500 w-3 h-3" />
                                                </div>
                                                {p.keyUrl && (
                                                    <a href={p.keyUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary underline flex items-center gap-1">
                                                        <IconZap className="w-2 h-2" /> Get Key
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="password" 
                                                    placeholder="sk-..." 
                                                    value={p.id === 'google' ? '••••••••••••••••' : (vault.keys[p.id] || '')}
                                                    onChange={(e) => handleUpdateKey(p.id, e.target.value)}
                                                    disabled={p.id === 'google'}
                                                    className="flex-1 bg-surface border border-border rounded-lg p-4 text-text focus:border-primary focus:outline-none font-mono text-xs"
                                                />
                                                {p.id !== 'google' && (
                                                    <button 
                                                        onClick={() => handleVerifyKey(p.id)}
                                                        className="px-4 bg-surface border border-border rounded-lg text-[10px] font-black uppercase hover:border-primary transition-all"
                                                    >
                                                        {verificationStatuses[p.id] === 'loading' ? '...' : 'Verify'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {vault.customProviders?.filter(cp => vault.keys[cp.id] || cp.apiKey).map(cp => (
                                        <div key={cp.id} className="space-y-3 p-4 border border-green-500/20 rounded-xl bg-green-500/5 relative group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">{cp.name} (Custom)</label>
                                                    <IconCheck className="text-green-500 w-3 h-3" />
                                                </div>
                                                {cp.keyUrl && (
                                                    <a href={cp.keyUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary underline flex items-center gap-1">
                                                        <IconZap className="w-2 h-2" /> Get Key
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="password" 
                                                    placeholder="Custom Key" 
                                                    value={vault.keys[cp.id] || cp.apiKey || ''}
                                                    onChange={(e) => handleUpdateKey(cp.id, e.target.value)}
                                                    className="flex-1 bg-surface border border-border rounded-lg p-4 text-text focus:border-primary focus:outline-none font-mono text-xs"
                                                />
                                                <button 
                                                    onClick={() => handleVerifyKey(cp.id)}
                                                    className="px-4 bg-surface border border-border rounded-lg text-[10px] font-black uppercase hover:border-primary transition-all"
                                                >
                                                    {verificationStatuses[cp.id] === 'loading' ? '...' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Unsaved Models Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-border pb-2">
                                    <div className="w-5 h-5 border-2 border-dashed border-text-muted rounded-full"></div>
                                    <h4 className="text-sm font-black text-text-muted uppercase tracking-widest">Unsaved Models</h4>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {baseProviders.filter(p => !vault.keys[p.id] && p.id !== 'google').map(p => (
                                        <div key={p.id} className="space-y-3 p-4 border border-border rounded-xl bg-surface/30 opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{p.name} API Key</label>
                                                {p.keyUrl && (
                                                    <a href={p.keyUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary underline flex items-center gap-1">
                                                        <IconZap className="w-2 h-2" /> Get Key
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="password" 
                                                    placeholder="Enter sk-..." 
                                                    value={vault.keys[p.id] || ''}
                                                    onChange={(e) => handleUpdateKey(p.id, e.target.value)}
                                                    className="flex-1 bg-surface border border-border rounded-lg p-4 text-text focus:border-primary focus:outline-none font-mono text-xs"
                                                />
                                                <button 
                                                    onClick={() => handleVerifyKey(p.id)}
                                                    className="px-4 bg-surface border border-border rounded-lg text-[10px] font-black uppercase hover:border-primary transition-all"
                                                >
                                                    {verificationStatuses[p.id] === 'loading' ? '...' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {vault.customProviders?.filter(cp => !vault.keys[cp.id] && !cp.apiKey).map(cp => (
                                        <div key={cp.id} className="space-y-3 p-4 border border-border rounded-xl bg-surface/30 opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cp.name} (Custom)</label>
                                                {cp.keyUrl && (
                                                    <a href={cp.keyUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary underline flex items-center gap-1">
                                                        <IconZap className="w-2 h-2" /> Get Key
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="password" 
                                                    placeholder="Enter Custom Key" 
                                                    value={vault.keys[cp.id] || cp.apiKey || ''}
                                                    onChange={(e) => handleUpdateKey(cp.id, e.target.value)}
                                                    className="flex-1 bg-surface border border-border rounded-lg p-4 text-text focus:border-primary focus:outline-none font-mono text-xs"
                                                />
                                                <button 
                                                    onClick={() => handleVerifyKey(cp.id)}
                                                    className="px-4 bg-surface border border-border rounded-lg text-[10px] font-black uppercase hover:border-primary transition-all"
                                                >
                                                    {verificationStatuses[cp.id] === 'loading' ? '...' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="pt-6 border-t border-border flex justify-between items-center">
                            <div className="text-xs text-text-muted italic">
                                Active Provider: <span className="text-primary font-bold">{vault.activeProvider}</span>
                            </div>
                            <button 
                                onClick={handleSaveVault}
                                className="px-8 py-4 bg-primary hover:opacity-90 text-accent-text font-black rounded-xl transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                            >
                                {t.models.saveBtn}
                            </button>
                        </div>
                    </div>
                )}

                {/* MARKETPLACE TAB */}
                {activeTab === 'marketplace' && (
                    <div id="models-marketplace" className="space-y-12 animate-fade-in">
                        {/* Custom Secondary Model Form */}
                        <div className="glass-panel p-8 rounded-xl border border-primary/30 bg-primary/5">
                            <div className="flex items-center gap-3 mb-6">
                                <IconPlus className="text-primary w-6 h-6" />
                                <h3 className="text-xl font-bold text-text uppercase tracking-tighter">Add Custom Secondary Model</h3>
                            </div>
                            <form onSubmit={handleAddCustomSecondary} className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Model Name *</label>
                                    <input 
                                        type="text" 
                                        value={newSecName}
                                        onChange={(e) => setNewSecName(e.target.value)}
                                        placeholder="e.g. My Private Llama"
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">API Key</label>
                                    <input 
                                        type="password" 
                                        value={newSecKey}
                                        onChange={(e) => setNewSecKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Official Site URL</label>
                                    <input 
                                        type="text" 
                                        value={newSecSite}
                                        onChange={(e) => setNewSecSite(e.target.value)}
                                        placeholder="https://provider.com"
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Gateway Dashboard</label>
                                    <input 
                                        type="text" 
                                        value={newSecDashboard}
                                        onChange={(e) => setNewSecDashboard(e.target.value)}
                                        placeholder="https://console.provider.com"
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Target Endpoint *</label>
                                    <input 
                                        type="text" 
                                        value={newSecEndpoint}
                                        onChange={(e) => setNewSecEndpoint(e.target.value)}
                                        placeholder="https://api.provider.com/v1"
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Model Identifier *</label>
                                    <input 
                                        type="text" 
                                        value={newSecModelId}
                                        onChange={(e) => setNewSecModelId(e.target.value)}
                                        placeholder="e.g. llama-3-70b"
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none font-mono"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Description</label>
                                    <textarea 
                                        value={newSecDesc}
                                        onChange={(e) => setNewSecDesc(e.target.value)}
                                        placeholder="Optional description of this model's capabilities..."
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:border-primary outline-none h-20 resize-none"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <button 
                                        type="submit"
                                        className="px-10 py-4 bg-primary hover:opacity-90 text-accent-text font-black rounded-xl transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                                    >
                                        Forge Secondary Model
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {MARKETPLACE_MODELS.map((model) => {
                            const isOwned = unlockedIds.includes(model.id);
                            return (
                                <div key={model.id} className={`glass-panel p-6 rounded-xl flex flex-col justify-between border-t-4 transition-all ${isOwned ? 'border-green-500 opacity-80' : 'border-primary hover:shadow-primary/20 hover:shadow-lg'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-text">{model.name}</h3>
                                            {isOwned ? <IconUnlock className="text-green-500" /> : <IconLock className="text-primary" />}
                                        </div>
                                        <p className="text-sm text-text-muted mb-6 h-20">{model.description}</p>
                                    </div>
                                    
                                    {isOwned ? (
                                        <button disabled className="w-full py-2 bg-green-900/20 text-green-500 font-bold rounded border border-green-900/50 uppercase text-xs tracking-wider">
                                            {t.models.licenseAcquired}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handlePurchase(model)}
                                            className="w-full py-2 bg-primary hover:opacity-90 text-accent-text font-bold rounded shadow-lg transition-colors uppercase text-xs tracking-wider"
                                        >
                                            {t.models.purchase}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                )}

                {/* CUSTOM FOUNDRY TAB (Helpers) */}
                {activeTab === 'custom' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="glass-panel p-8 rounded-xl border-t-4 border-primary">
                            <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                                <IconPlus className="text-primary" /> {t.models.forgeTitle}
                            </h3>
                            <form onSubmit={handleCreateCustomModel} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">{t.models.identityLabel}</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Crypto Sniper Bot" 
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-text focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">{t.models.personaLabel}</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="e.g. You are an expert in cryptocurrency trends. Focus only on high volatility assets..." 
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-text focus:border-primary focus:outline-none font-mono text-sm"
                                    />
                                    <p className="text-xs text-text-muted mt-2">This prompt will override the default behavior of the base model.</p>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!customName || !customPrompt}
                                    className="px-6 py-3 bg-primary hover:opacity-90 text-accent-text font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {t.models.forgeBtn}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-text-muted uppercase tracking-wider">{t.models.activeModelsTitle}</h3>
                            {customModels.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {customModels.map((m, i) => (
                                        <div key={i} className="p-4 bg-surface border border-border rounded-lg flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-text">{m.name}</h4>
                                                <span className="text-xs text-text-muted">Type: Custom / Factium-Native</span>
                                            </div>
                                            <div className="text-green-500 text-xs font-bold uppercase border border-green-900/50 bg-green-900/10 px-2 py-1 rounded">
                                                Active
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-muted italic text-sm">No custom models forged yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAIModels;
