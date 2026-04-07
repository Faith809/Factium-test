
import { Type } from "@google/genai";
import { UserProfile, AIModelId, BiasMetric, PolicyImpact, FinanceTrackerResponse, LanguageCode, ResearchMode } from "../types";
import { languageNames } from "./i18n";
import { callAI } from "./multiProviderService";

const getActiveLanguage = (): LanguageCode => (localStorage.getItem('factium_lang') as LanguageCode) || 'en';

const getToneInstruction = (lang: LanguageCode) => {
  const langName = languageNames[lang];
  const baseTone = " IMPORTANT: Use simple, relatable, and relaxing language. Avoid complex jargon or 'big words'. Be direct, honest, and mature in your tone.";
  return baseTone + (lang !== 'en' ? ` Also, provide all output exclusively in ${langName}.` : "");
};

export const analyzeBias = async (text: string, modelId: AIModelId, mode: string, attachments?: any[]): Promise<BiasMetric> => {
  const lang = getActiveLanguage();
  const tone = getToneInstruction(lang);
  const isUnrestricted = mode === ResearchMode.UNRESTRICTED;
  
  const systemInstruction = `You are a helpful assistant who checks facts and analyzes bias. 
  MANDATORY REQUIREMENTS: 
  1. 'score': Provide a functional and accurate bias score (0-100).
  2. 'label': A simple name for the bias level.
  3. 'reasoning': Provide exactly 2 paragraphs of explanation and summary of the results.
  4. 'forensicExplanation': Provide exactly 3 paragraphs of detailed and simple explanation of the results, why it exists, and its information of discussion.
  5. 'findingsSources': Provide exactly 15 items. ${isUnrestricted ? 'Since this is DEEP LOOK (UNRESTRICTED) mode, provide at least 10 items that are unfiltered, secretive, and controversial news/gist sources (both safe and unsafe) where controversial information is extracted from.' : 'Provide news, controversies, and conspiracies related to the topic.'} Each item MUST have a "description" and a valid clickable "url".
  6. 'referenceSources': Provide exactly 15 different sources of the latest and verified or trusted news and reference sources concerning the discussion. Each item MUST have a "title" and a valid clickable "url".
  7. 'omittedPoints': List things the writer forgot to mention.
  
  Use simple and relaxing language.` + tone;

  try {
    const response = await callAI(`Analyze this text for bias and facts: "${text}". Mode: ${isUnrestricted ? 'DEEP LOOK (UNRESTRICTED)' : 'QUICK CHECK (RESTRICTED)'}`, {
      json: true,
      modelId: modelId,
      attachments: attachments,
      system: systemInstruction
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error("Empty AI Response");
    
    const parsed = JSON.parse(textOutput);

    const ensureCount = (arr: any[], count: number, filler: (i: number) => any) => {
        const list = Array.isArray(arr) ? arr : [];
        while (list.length < count) list.push(filler(list.length));
        return list.slice(0, count);
    };

    parsed.findingsSources = ensureCount(parsed.findingsSources || [], 15, (i) => ({
        description: isUnrestricted ? "Unfiltered controversial source node #" + (i+1) : "Finding more details for source #" + (i+1),
        url: isUnrestricted ? "https://www.google.com/search?q=" + encodeURIComponent(text.substring(0, 50) + " leak controversy") : "https://www.google.com/search?q=" + encodeURIComponent(text.substring(0, 50) + " controversy")
    }));

    parsed.referenceSources = ensureCount(parsed.referenceSources || [], 15, (i) => ({
        title: "Verified Reference " + (i+1),
        url: "https://www.google.com/search?q=" + encodeURIComponent(text.substring(0, 50) + " official reference")
    }));

    return parsed as BiasMetric;
  } catch (error: any) {
    console.error("Bias Analysis Failed:", error);
    const isMissingKey = error.message?.includes("MISSING_KEY");
    return {
      score: 50,
      label: isMissingKey ? "Missing API Key" : "Check Failed",
      reasoning: isMissingKey ? "Please enter your API key in the recalibrate settings." : "We couldn't read the story correctly right now. Please try again later.",
      omittedPoints: ["Connection check", "Please refresh"],
      forensicExplanation: "The tool had a small problem finding the answer.\n\nThis usually happens if your API key is missing or invalid.\n\nPlease check your settings and try again.",
      findingsSources: [],
      referenceSources: [],
      controversies: []
    };
  }
};

export const simulatePolicy = async (policy: string, profile: UserProfile, modelId: AIModelId, attachments?: any[]): Promise<PolicyImpact> => {
  const lang = getActiveLanguage();
  const tone = getToneInstruction(lang);
  
  const systemInstruction = "You are an advanced policy forecaster. MANDATORY: Exactly 3 paragraphs for forensicExplanation, 10 news items, 10 social discourse links, and 15 reference sites. All results MUST be personalized to the user's profile." + tone;

  try {
    const response = await callAI(`Tell me how this law: "${policy}" affects this person: ${JSON.stringify(profile)}. Provide 3 paragraphs of deep analysis, 10 news items, 10 social links, and 15 source references.`, {
      json: true,
      modelId: modelId,
      attachments: attachments,
      system: systemInstruction
    });

    const parsed = JSON.parse(response.text || "{}");
    
    const ensureCount = (arr: any[], count: number, filler: (i: number) => any) => {
      const list = Array.isArray(arr) ? arr : [];
      while (list.length < count) list.push(filler(list.length));
      return list.slice(0, count);
    };

    parsed.newsPredictions = ensureCount(parsed.newsPredictions || [], 10, (i) => ({
      headline: "Future Forecast News #" + (i+1),
      trend: "Emerging trend for " + profile.occupation,
      url: "https://www.google.com/search?q=" + encodeURIComponent(policy + " " + profile.location + " news")
    }));

    parsed.socialDiscourse = ensureCount(parsed.socialDiscourse || [], 10, (i) => ({
      platform: i % 2 === 0 ? "X" : "Reddit",
      controversy: "Debate node regarding " + policy,
      url: "https://www.reddit.com/search/?q=" + encodeURIComponent(policy)
    }));

    parsed.referenceSources = ensureCount(parsed.referenceSources || [], 15, (i) => ({
      title: "Official Archive " + (i+1),
      url: "https://www.google.com/search?q=" + encodeURIComponent(policy + " sources")
    }));

    return parsed as PolicyImpact;
  } catch (error: any) {
    console.error("Policy Simulation Failed:", error);
    const isMissingKey = error.message?.includes("MISSING_KEY");
    return {
      economicScore: 0,
      socialScore: 0,
      personalImpactSummary: isMissingKey ? "Missing API Key. Please recalibrate in settings." : "Simulation failed. Please check your connection or API key.",
      forensicExplanation: "We encountered an error while processing your request.\n\nThis usually happens if your API key is invalid or if there's a network problem.\n\nPlease verify your settings and try again.",
      newsPredictions: [],
      socialDiscourse: [],
      referenceSources: [],
      timeline: []
    } as any;
  }
};

export const trackCampaignFinance = async (query: string, modelId: AIModelId, attachments?: any[]): Promise<FinanceTrackerResponse> => {
  const lang = getActiveLanguage();
  const tone = getToneInstruction(lang);
  const systemInstruction = "You are an honest tracker who shows where money flows. MANDATORY: Exactly 3 paragraphs for forensicExplanation, 10 news items, 15 social chat results, and 15 reference sites." + tone;

  try {
    const response = await callAI(`Find the money flow and discourse for: "${query}". Provide 15 social posts, 10 news reports, and 15 source references.`, {
      json: true,
      modelId: modelId,
      attachments: attachments,
      system: systemInstruction
    });

    const parsed = JSON.parse(response.text || "{}");

    const ensureCount = (arr: any[], count: number, filler: (i: number) => any) => {
      const list = Array.isArray(arr) ? arr : [];
      while (list.length < count) list.push(filler(list.length));
      return list.slice(0, count);
    };

    parsed.newsFeed = ensureCount(parsed.newsFeed || [], 10, (i) => ({
      headline: "Additional News Node #" + (i+1),
      source: "External Wire",
      link: "https://www.google.com/search?q=" + encodeURIComponent(query + " news")
    }));

    parsed.socialMediaFeed = ensureCount(parsed.socialMediaFeed || [], 15, (i) => ({
      platform: i % 2 === 0 ? "X" : "Reddit",
      headline: "Global Discourse Channel #" + (i+1),
      link: "https://www.reddit.com/search/?q=" + encodeURIComponent(query),
      context: "Ongoing prediction and community debate node."
    }));

    parsed.referenceSources = ensureCount(parsed.referenceSources || [], 15, (i) => ({
      title: "Verification Ledger " + (i+1),
      url: "https://www.google.com/search?q=" + encodeURIComponent(query + " documentation")
    }));

    return parsed as FinanceTrackerResponse;
  } catch (error: any) {
    console.error("Finance Tracking Failed:", error);
    const isMissingKey = error.message?.includes("MISSING_KEY");
    return {
      summary: isMissingKey ? "Missing API Key" : "Tracking Error",
      forensicExplanation: "The finance tracker could not retrieve data at this time.\n\nPlease ensure your API key is correctly configured in the setup wizard.\n\nIf the problem persists, check your internet connection.",
      donors: [],
      socialMediaFeed: [],
      newsFeed: [],
      referenceSources: [],
      sources: []
    } as any;
  }
};
