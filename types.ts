
// Centralized type definitions for the Factium Intelligence platform
export type AIProviderId = 'google' | 'openai' | 'anthropic' | 'huggingface' | 'cohere' | 'custom';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ru' | 'pt' | 'ar' | 'hi' | 'it' | 'ko' | 'tr' | 'vi' | 'id';

export interface AIProvider {
  id: AIProviderId;
  name: string;
  logo: string;
  isFreeTierAvailable: boolean;
  keyUrl: string;
  description: string;
}

export interface ProviderConfig {
  activeProvider: AIProviderId;
  keys: Partial<Record<AIProviderId, string>>;
  customEndpoint?: string;
  customProviders?: CustomAIProvider[];
}

export interface CustomAIProvider {
  id: string;
  name: string;
  description: string;
  keyUrl: string;
  siteUrl: string;
  dashboardUrl: string;
  endpoint: string;
  modelId: string;
  apiKey: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  location: string;
  incomeRange: string;
  familySize: number;
  politicalLeaning: string;
  occupation: string;
  quickAccessEnabled?: boolean;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RESEARCH = 'RESEARCH',
  FACT_CHECKER = 'FACT_CHECKER',
  POLICY_SIMULATOR = 'POLICY_SIMULATOR',
  FINANCE_TRACKER = 'FINANCE_TRACKER',
  MY_MODELS = 'MY_MODELS',
  ABOUT = 'ABOUT',
  PROFILE = 'PROFILE'
}

export enum ResearchMode {
  RESTRICTED = 'RESTRICTED',
  UNRESTRICTED = 'UNRESTRICTED'
}

export type AIModelId = string;

export interface AIModel {
  id: AIModelId;
  name: string;
  type: 'Free' | 'Paid' | 'Custom';
}

export interface CustomAIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  systemPrompt: string;
  isUnlocked: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
  trustScore: 'TRUSTED' | 'UNTRUSTED';
}

export interface DetailedResearchResponse {
  summary: string;
  scandals: Array<{ description: string; url: string }>;
  socialWire: Array<{ platform: string; label: string; url: string; context: string }>;
  detailedInfo: string;
  visualArchives: Array<{ description: string; url: string; sourceUrl: string }>;
  sourceIndex: GroundingSource[];
}

export interface BiasMetric {
  score: number;
  label: string;
  reasoning: string;
  omittedPoints: string[];
  forensicExplanation: string; // Should contain 3 paragraphs
  findingsSources: Array<{ description: string; url: string }>; // 15 items: News, Controversies, Conspiracies
  referenceSources: Array<{ title: string; url: string }>; // 15 items: External Reference Sites
  controversies: Array<{ description: string; url: string }>; // Legacy support
}

export interface PolicyImpact {
  economicScore: number;
  socialScore: number;
  personalImpactSummary: string;
  forensicExplanation: string; // 3 detailed paragraphs
  newsPredictions: Array<{ headline: string; trend: string; url: string }>; // 10 results
  socialDiscourse: Array<{ platform: string; controversy: string; url: string }>; // 10 results
  referenceSources: Array<{ title: string; url: string }>; // 15 results
  timeline: Array<{ year: string; predictedEvent: string }>;
}

export interface FinanceTrackerResponse {
  summary: string;
  forensicExplanation: string; // 3 paragraphs explaining results and purpose
  donors: Array<{ name: string; amount: string; affiliation: string; controversy: string; sourceLink: string }>;
  socialMediaFeed: Array<{ platform: string; headline: string; link: string; context?: string }>; // 15 results
  newsFeed: Array<{ headline: string; source: string; link: string }>; // 10 results
  referenceSources: Array<{ title: string; url: string }>; // 15+ external sources
  sources: GroundingSource[];
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  previewUrl?: string;
}

export interface AppearanceSettings {
  accent: string;
  accentGradient: string;
  background: string;
  isDark: boolean;
}
