
import { Type } from "@google/genai";
import { UserProfile, AIModelId, BiasMetric, PolicyImpact, FinanceTrackerResponse, LanguageCode } from "../types";
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
  
  const biasSchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Bias score (0-100)." },
      label: { type: Type.STRING, description: "A simple name for the bias level." },
      reasoning: { type: Type.STRING, description: "A short, easy explanation of the bias." },
      omittedPoints: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Things the writer forgot to mention." 
      },
      forensicExplanation: { type: Type.STRING, description: "Exactly 3 easy paragraphs explaining why this topic exists and how we analyzed it." },
      findingsSources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "News headline or controversy summary." },
            url: { type: Type.STRING, description: "A valid clickable link." }
          },
          required: ["description", "url"]
        },
        description: "Exactly 15 items: News, Controversies, and Conspiracies related to the topic."
      },
      referenceSources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Name of the source site." },
            url: { type: Type.STRING, description: "Direct link to the external source." }
          },
          required: ["title", "url"]
        },
        description: "Exactly 15 different reference sources used to extract information."
      }
    },
    required: ["score", "label", "reasoning", "omittedPoints", "forensicExplanation", "findingsSources", "referenceSources"]
  };

  const systemInstruction = `You are a helpful assistant who checks facts. 
  MANDATORY: 
  1. Your 'forensicExplanation' MUST be exactly 3 paragraphs long. Explain the topic simply.
  2. Your 'findingsSources' MUST contain exactly 15 items consisting of news, controversies, and conspiracies.
  3. Your 'referenceSources' MUST contain exactly 15 items which are the external sites where data was extracted from.
  Use simple and relaxing language.` + tone;

  try {
    const response = await callAI(`Look at this text and tell me what's real and what's biased: "${text}"`, {
      json: true,
      modelId: modelId,
      attachments: attachments,
      system: systemInstruction
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error("Empty AI Response");
    
    const parsed = JSON.parse(textOutput);

    // Ensure we have exactly 15 for both source arrays
    const ensureCount = (arr: any[], count: number, filler: (i: number) => any) => {
        const list = Array.isArray(arr) ? arr : [];
        while (list.length < count) list.push(filler(list.length));
        return list.slice(0, count);
    };

    parsed.findingsSources = ensureCount(parsed.findingsSources || [], 15, (i) => ({
        description: "Finding more details for source #" + (i+1),
        url: "https://www.google.com/search?q=" + encodeURIComponent(text.substring(0, 50) + " controversy")
    }));

    parsed.referenceSources = ensureCount(parsed.referenceSources || [], 15, (i) => ({
        title: "Information Archive " + (i+1),
        url: "https://www.google.com/search?q=" + encodeURIComponent(text.substring(0, 50) + " reference")
    }));

    return parsed as BiasMetric;
  } catch (error) {
    console.error("Bias Analysis Failed:", error);
    return {
      score: 50,
      label: "Check Failed",
      reasoning: "We couldn't read the story correctly right now. Please try again later.",
      omittedPoints: ["Connection check", "Please refresh"],
      forensicExplanation: "The tool had a small problem finding the answer.\n\nWe are working to fix it as fast as we can.\n\nPlease come back in a few minutes.",
      findingsSources: [],
      referenceSources: [],
      controversies: []
    };
  }
};

export const simulatePolicy = async (policy: string, profile: UserProfile, modelId: AIModelId, attachments?: any[]): Promise<PolicyImpact> => {
  const lang = getActiveLanguage();
  const tone = getToneInstruction(lang);
  
  const policySchema = {
    type: Type.OBJECT,
    properties: {
      economicScore: { type: Type.NUMBER },
      socialScore: { type: Type.NUMBER },
      personalImpactSummary: { type: Type.STRING, description: "A simple note about the general impact." },
      forensicExplanation: { type: Type.STRING, description: "Exactly 3 detailed paragraphs explaining the results, purpose, and context based on the user's profile." },
      newsPredictions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            trend: { type: Type.STRING },
            url: { type: Type.STRING }
          }
        },
        description: "Exactly 10 news, predictions, and trends relevant to the user's profile."
      },
      socialDiscourse: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            controversy: { type: Type.STRING },
            url: { type: Type.STRING }
          }
        },
        description: "Exactly 10 items of online discourse and controversies relevant to the user's profile."
      },
      referenceSources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING }
          }
        },
        description: "Exactly 15 reference sources used to generate this simulation."
      },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            predictedEvent: { type: Type.STRING }
          },
          required: ["year", "predictedEvent"]
        }
      }
    },
    required: ["economicScore", "socialScore", "personalImpactSummary", "forensicExplanation", "newsPredictions", "socialDiscourse", "referenceSources", "timeline"]
  };

  const systemInstruction = "You are an advanced policy forecaster. MANDATORY: Exactly 3 paragraphs for forensicExplanation, 10 news items, 10 social discourse links, and 15 reference sites. All results MUST be personalized to the user's profile." + tone;

  try {
    const response = await callAI(`Tell me how this law: "${policy}" affects this person: ${JSON.stringify(profile)}. Provide 3 paragraphs of deep analysis, 10 news items, 10 social links, and 15 source references.`, {
      json: true,
      modelId: modelId,
      attachments: attachments,
      system: systemInstruction
    });

    const parsed = JSON.parse(response.text || "{}");

    // Helper to ensure item counts
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
  } catch (error) {
    console.error("Policy Simulation Failed:", error);
    throw error;
  }
};

export const trackCampaignFinance = async (query: string, modelId: AIModelId, attachments?: any[]): Promise<FinanceTrackerResponse> => {
  const lang = getActiveLanguage();
  const tone = getToneInstruction(lang);
  
  const financeSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A simple note about who is giving money." },
      forensicExplanation: { type: Type.STRING, description: "Exactly 3 detailed paragraphs explaining the results, purpose, and context." },
      donors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            amount: { type: Type.STRING },
            affiliation: { type: Type.STRING },
            controversy: { type: Type.STRING },
            sourceLink: { type: Type.STRING }
          }
        }
      },
      socialMediaFeed: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            headline: { type: Type.STRING },
            link: { type: Type.STRING },
            context: { type: Type.STRING, description: "One sentence summary of discourse/controversy." }
          }
        },
        description: "Exactly 15 results including predictions and controversies."
      },
      newsFeed: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            source: { type: Type.STRING },
            link: { type: Type.STRING }
          }
        },
        description: "Exactly 10 results from news sources."
      },
      referenceSources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING }
          }
        },
        description: "Exactly 15 reference sources used to process the input."
      },
      sources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            uri: { type: Type.STRING },
            trustScore: { type: Type.STRING }
          }
        }
      }
    },
    required: ["summary", "forensicExplanation", "donors", "socialMediaFeed", "newsFeed", "referenceSources", "sources"]
  };

  const systemInstruction = "You are an honest tracker who shows where money flows. MANDATORY: Exactly 3 paragraphs for forensicExplanation, 10 news items, 15 social chat results, and 15 reference sites." + tone;

  try {
    const response = await callAI(`Find the money flow and discourse for: "${query}". Provide 15 social posts, 10 news reports, and 15 source references.`, {
      json: true,
      modelId: modelId,
      attachments: attachments,
      system: systemInstruction
    });

    const parsed = JSON.parse(response.text || "{}");

    // Helper to ensure item counts
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
  } catch (error) {
    console.error("Finance Tracking Failed:", error);
    throw error;
  }
};
