import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ModelSelector from './ModelSelector';
import { AIModelId, LanguageCode } from '../types';
import NavBar from './NavBar';

const GUIDE_CONTENT = `
# The Billion-Dollar Marketing Blueprint for Factium AI

Congratulations. You now own a powerful piece of technology. Here is your faceless marketing strategy to sell this tool globally.

### 1. The "Expose The Truth" Hook (TikTok/Reels/Shorts)
*   **Format:** Faceless video. Dark background. Scrolling text or screen recording of Factium's "Verified Sources" feature.
*   **Audio:** Trending, slightly suspenseful or "news" aesthetic audio.
*   **Script:** "They don't want you to know who funds your local senator. I used AI to track the money in 5 seconds." -> *Show Factium Demo*. "Link in bio to get the tool."
*   **Tags:** #corruption #politics #ai #finance #truth #factium

### 2. The "Recession Proof" Angle (Twitter/X/Threads)
*   **Strategy:** Post screenshots of the "Policy Simulator".
*   **Caption:** "Inflation is rising. I asked my AI simulator how the new tax bill affects a $50k income in Ohio. The results are terrifying. You need to prepare."
*   **CTA:** "Run your own simulation here: [Link]"

### 3. The Digital Product Tiers
You can sell access to this exact web app (hosted by you) in tiers:
*   **Tier 1 (Free):** Basic Research (Limit queries).
*   **Tier 2 (Pro - $9.99):** Policy Simulator + Fact Checker.
*   **Tier 3 (Elite - $29.99):** Campaign Finance Tracker + Detailed Sources + PDF Exports.

### 4. Branding Aesthetics
*   **Colors:** Dark Mode only. Emerald Green for truth, Red for danger.
*   **Vibe:** Cyberpunk, WikiLeaks, Terminal, Insider Knowledge.
*   **Trust:** Always emphasize that *Factium* links to real sources. It doesn't hallucinate; it verifies.

### 5. Launch Platforms
*   **Etsy:** "Digital Planner for Politics & Finance"
*   **Gumroad/Selar:** "AI Research Assistant Source Code"
*   **Product Hunt:** Launch as " The AI Truth Engine".
`;

interface MarketingGuideProps {
  onBack: () => void;
  onHome: () => void;
  onGuide: () => void;
  language: LanguageCode;
}

const MarketingGuide: React.FC<MarketingGuideProps> = ({ onBack, onHome, onGuide, language }) => {
    const [selectedModel, setSelectedModel] = useState<AIModelId>('factium-native');
    
    return (
        <div className="max-w-4xl mx-auto space-y-4">
             <NavBar onBack={onBack} onHome={onHome} onGuide={onGuide} title="Marketing Guide" language={language} />
             <div className="flex justify-end">
                <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
             </div>
             <div className="glass-panel p-8 rounded-xl">
                 <div className="prose prose-invert prose-red max-w-none text-text">
                     <ReactMarkdown>{GUIDE_CONTENT}</ReactMarkdown>
                 </div>
            </div>
        </div>
    );
};

export default MarketingGuide;
