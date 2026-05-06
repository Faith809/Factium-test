# Factium AI - Project Blueprint & Technical Documentation

## 1. Executive Summary
Factium AI (v1.4.9) is a next-generation fact-checking and forensic research application designed to cut through misinformation by providing high-speed, AI-driven analysis. Built for journalists, researchers, and truth-seekers, the platform leverages multiple AI engines through a secure proxy layer to deliver unbiased, unfiltered, and deeply grounded information. Unlike standard AI assistants, Factium AI prioritizes "information discovery" over simple conversation, enforcing strict result counts (typically 15 sources per module) to ensure breadth and depth in search results.

## 2. Core Philosophy & Mission
The primary goal of Factium AI is to provide a "Relaxing Gateway to Truth." In an era of informational noise, the app translates complex technical data into simple, relatable, and mature language. Its mission centers on transparency—not just telling the user what is true, but showing the paper trail through curated lists of controversies, social media discourse, and official archives. It operates on a policy of "Architectural Honesty," where AI limitations and connections are handled transparently, ensuring the user always knows the status of their "neural link."

## 3. Functionality: Fact Checker (Bias Analysis)
The Fact Checker is the app's frontline defense against bias. It analyzes input text or documents and generates a "Bias Meter" score. Beyond a simple percentage, it provides a two-paragraph reasoning of the slant found in the text and a forensic explanation of the underlying narrative. Most critically, it retrieves exactly 15 findings—sources that highlight where the text might be omitting key information or pushing a specific agenda. In "Deep Look" mode, it intentionally bypasses standard filters to find rare controversies or hidden context.

## 4. Functionality: Research Tool (Forensic Discovery)
The Research Tool is a search engine on steroids. Instead of a list of links, it generates a comprehensive "Briefing" that includes a summary, a list of 15 social wire extracts (X, Reddit, etc.), 15 visual archives (image descriptions and sources), and an index of 15 verified references. It uses AI to parse real-time grounding metadata from search engines, ensuring that every claim is anchored to a real URL. This module is the centerpiece for cross-border research, helping users discover international perspectives on local events.

## 5. Functionality: Finance Tracker (Money Flow)
Money leaves a digital footprint, and the Finance Tracker is designed to follow it. This module investigates campaign finance, corporate funding, and economic donor nodes. It produces a summary of financial influence, followed by a donor list (with amounts and controversies), and 15 items of social discourse specifically focused on financial transparency. It aims to reveal "who is paying for the narrative," providing researchers with a starting point for deeper investigative journalism into lobbying and political spending.

## 6. Functionality: Policy Simulator (Impact Forecasting)
The Policy Simulator moves from the past to the future. By profiling the user (location, occupation, income), it simulates how specific laws or policies will impact an individual's actual life. It generates 10 news predictions (forecasted headlines), 10 items of social discourse regarding the policy debate, and 15 reference sources. It translates dry legal text into 3 paragraphs of "Forensic Impact Analysis," helping regular people understand how high-level government decisions affect their grocery bills, rent, and job security.

## 7. Technical Architecture: The Proxy Layer
Factium AI utilizes a unique "Vercel Messenger" proxy architecture (`api/proxy.mjs`). This serverless backend acts as a secure intermediary between the user's browser and various AI providers (Google, OpenAI, Anthropic). It handles API key validation, payload sanitization, and model mapping. By centralizing the API logic in the proxy, the app protects sensitive keys from exposure in the client-side code while allowing for rapid updates to model endpoints without requiring a full application rebuild.

## 8. Technical Architecture: Frontend & State
The frontend is a high-performance React application powered by Vite. It uses a "Glassmorphism" design aesthetic, utilizing Tailwind CSS for a futuristic, terminal-like interface. State is managed locally through a specialized "Vault" system stored in `localStorage`, prioritizing user privacy. This vault contains the user's encrypted API keys and configuration, ensuring that no personal credentials reach the server except during the execution of a specific AI request.

## 9. Model Management & Intelligence
A core feature is the "Model Mapping Table" located in the proxy. It allows the app to stay resilient against external API changes. For instance, when Google retired `gemini-1.5-flash`, the proxy was updated to automatically redirect all requests to `gemini-2.0-flash`. This layer also handles "Simulated Models" (like DeepSeek or Llama 3 unfiltered), which are currently mapped to high-performance Gemini engines to provide a consistent experience while experimental support for local LLMs is being developed.

## 10. Language & Cross-Border Support (i18n)
Factium AI is built for a global audience with its `services/i18n.ts` service. It currently supports English and French, with the ability to instruct the AI to provide all forensic results exclusively in the user's chosen language. This is not just a UI translation; the AI itself is prompted to research in global contexts and report back in the target language, making international news accessible to non-English speakers without losing forensic nuance.

## 11. Current Problems: Quota & Rate Limiting
The most significant hurdle is the "RESOURCE_EXHAUSTED" (429) error from the Gemini API free tier. Since the app is highly research-intensive—sending large system instructions and requesting 15+ items at once—it frequently hits the tokens-per-minute (TPM) and requests-per-day limits. While v1.4.9 introduced smart error handling and retry mechanisms with exponential backoff, users on the free tier still experience interruptions during heavy research sessions.

## 12. Current Problems: Environment Configuration
The application relies heavily on the `VITE_VERCEL_PROXY_URL` environment variable. If this is not set correctly during deployment, the "neural link" between the frontend and the proxy breaks. Historically, this has caused "Proxy URL is not set" crashes. Current fixes include a fallback to the current origin, but seamless synchronization between GitHub pushes and Vercel environment updates remains a point of friction for some users.

## 13. Current Problems: Model Deprecation Cycle
Rapid changes in the AI landscape (e.g., Google's transition from v1beta to v1 stable) often break specific field names like `system_instruction` vs `systemInstruction`. Factium AI has to constantly evolve its "bridge" code to handle these nuances. The dependency on specific model versions (like `gemini-2.0-flash-exp`) means the app must be manually updated every time a model moves from experimental to stable or is retired.

## 14. Project Roadmap: Phase 1 (Near-term)
The immediate focus is on "Neural Stability." This includes implementing a multi-key rotation system in the Vault so users can add multiple API keys to spread the quota load. We also plan to introduce a "Search Result Cache" (IndexedDB) to prevent redundant API calls for recently researched topics. This will significantly reduce quota consumption and speed up repeat queries.

## 15. Project Roadmap: Phase 2 (Long-term)
The long-term vision includes "Native Collaborative Forensics." This involves a P2P sync system where users can safely share discovered "truth files" without a central server. Additionally, we aim to integrate local LLM support via WebGPU (using libraries like WebLLM) to allow for 100% private, offline fact-checking that bypasses the need for external API providers and their corresponding quota limits altogether.

## Goals & Objective Overview
*   **The Prime Directive:** Provide high-fidelity, grounded truth through structured data (15 results per list).
*   **The Privacy Goal:** Keep all API keys and user profiles in the local vault, never on a third-party server.
*   **The Accessibility Goal:** Use "Relaxing Tone" logic to make complex news accessible to all education levels.
*   **The Technical Goal:** Maintain a robust, self-healing proxy that bridges multiple AI standards into a single, cohesive research experience.
