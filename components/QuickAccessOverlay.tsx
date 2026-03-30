import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Maximize2, X, Camera, Mic, Square, 
  ExternalLink, Send, Image as ImageIcon,
  Check, Save, Download, Layout, Search,
  ShieldCheck, TrendingUp, DollarSign,
  History
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { saveSyncData, SyncData } from '../services/dbService';
import { GoogleGenAI } from "@google/genai";
import { Logo } from './Icons';
import SearchTerminal from './SearchTerminal';
import { Attachment, AppView } from '../types';

interface QuickAccessOverlayProps {
  onOpenMainApp: () => void;
  onClose: () => void;
  language: string;
}

const QuickAccessOverlay: React.FC<QuickAccessOverlayProps> = ({ onOpenMainApp, onClose, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [capturedFile, setCapturedFile] = useState<{ type: 'screenshot' | 'audio', data: string } | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [activeTerminal, setActiveTerminal] = useState<AppView>(AppView.RESEARCH);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker('/media-worker.js');
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'processed') {
        // Handle processed data if needed
      }
    };

    // Initialize BroadcastChannel
    broadcastChannelRef.current = new BroadcastChannel('factium_sync');
    broadcastChannelRef.current.onmessage = (event) => {
      if (event.data.type === 'VIEW_CHANGE' && event.data.payload.view) {
        const view = event.data.payload.view;
        // Only switch if it's one of the 4 supported terminals
        if ([AppView.RESEARCH, AppView.FACT_CHECKER, AppView.POLICY_SIMULATOR, AppView.FINANCE_TRACKER].includes(view)) {
          setActiveTerminal(view);
        }
      }
    };

    return () => {
      workerRef.current?.terminate();
      broadcastChannelRef.current?.close();
    };
  }, []);

  const syncToMainApp = useCallback((data: any) => {
    broadcastChannelRef.current?.postMessage({
      type: 'IMPORT_DATA',
      payload: { ...data, view: activeTerminal }
    });
  }, [activeTerminal]);

  useEffect(() => {
    if (isExpanded) {
      syncToMainApp({}); // Sync the view change
    }
  }, [activeTerminal, isExpanded, syncToMainApp]);

  const [captureError, setCaptureError] = useState<string | null>(null);

  // Screenshot logic
  const takeScreenshot = async () => {
    setCaptureError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => video.onloadedmetadata = resolve);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');
      stream.getTracks().forEach(track => track.stop());
      
      // Offload processing to worker
      workerRef.current?.postMessage({ type: 'process-image', data: dataUrl });
      
      setCapturedFile({ type: 'screenshot', data: dataUrl });
      setShowChoice(true);
      setIsBubbleOpen(false);
    } catch (err: any) {
      console.error("Screenshot failed:", err);
      if (err.name === 'NotAllowedError' || err.message?.includes('permissions policy')) {
        setCaptureError("Permission Denied: Screen capture is restricted in the preview iframe. Please open the app in a 'New Tab' to use this feature.");
      } else {
        setCaptureError("Screenshot failed. Please ensure you are using a supported browser and have granted permissions.");
      }
    }
  };

  // Audio recording logic
  const startRecording = async () => {
    setCaptureError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          workerRef.current?.postMessage({ type: 'process-audio', data: base64data });
          setCapturedFile({ type: 'audio', data: base64data });
          setShowChoice(true);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Audio recording failed:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCaptureError("Microphone Access Denied: Please allow microphone access in your browser settings or open the app in a 'New Tab'.");
      } else if (err.name === 'NotFoundError') {
        setCaptureError("No Microphone Found: Please connect a microphone and try again.");
      } else {
        setCaptureError("Audio recording failed. Please ensure you have granted microphone permissions.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsBubbleOpen(false);
    }
  };

  const handleChoice = async (importToApp: boolean) => {
    if (!capturedFile) return;

    if (importToApp) {
      const attachment: Attachment = {
        id: `qa-${Date.now()}`,
        name: `Capture_${new Date().toLocaleTimeString()}`,
        type: capturedFile.type === 'screenshot' ? 'image/png' : 'audio/webm',
        size: capturedFile.data.length,
        data: capturedFile.data,
        previewUrl: capturedFile.type === 'screenshot' ? capturedFile.data : undefined
      };

      // Sync to main app instantly
      syncToMainApp({ attachments: [attachment] });

      // Also save to DB for persistence
      const syncData: SyncData = {
        id: attachment.id,
        type: capturedFile.type,
        data: capturedFile.data,
        timestamp: Date.now(),
        imported: true
      };
      await saveSyncData(syncData);

      if (!isExpanded) setIsExpanded(true);
    } else {
      const link = document.createElement('a');
      link.href = capturedFile.data;
      link.download = `factium_${capturedFile.type}_${Date.now()}.${capturedFile.type === 'screenshot' ? 'png' : 'webm'}`;
      link.click();
    }

    setCapturedFile(null);
    setShowChoice(false);
  };

  const handleMiniAppSearch = (query: string, attachments: Attachment[]) => {
    // Sync search to main app
    syncToMainApp({ query, attachments });
    setQuery(query);
    // Perform local search for the mini-app view
    performAISearch(query, attachments);
  };

  const performAISearch = async (q: string, atts: Attachment[]) => {
    setIsSearching(true);
    setResults(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const parts: any[] = [{ text: q || "Analyze this intelligence capture." }];
      
      atts.forEach(att => {
        if (att.data) {
          parts.push({
            inlineData: {
              data: att.data.split(',')[1],
              mimeType: att.type
            }
          });
        }
      });

      let systemInstruction = "You are the Factium AI Quick-Access Terminal. Provide concise, high-impact intelligence summaries. Focus on speed and accuracy.";
      
      switch(activeTerminal) {
        case AppView.RESEARCH:
          systemInstruction += " Focus on deep topic research and comprehensive data gathering.";
          break;
        case AppView.FACT_CHECKER:
          systemInstruction += " Focus on verifying claims, identifying misinformation, and providing trust scores.";
          break;
        case AppView.POLICY_SIMULATOR:
          systemInstruction += " Focus on forecasting policy impacts, economic trends, and social consequences.";
          break;
        case AppView.FINANCE_TRACKER:
          systemInstruction += " Focus on tracking money flows, political donations, and financial controversies.";
          break;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction
        }
      });
      const text = response.text;
      setResults(text);

      // Save search result to DB for persistence
      const syncData: SyncData = {
        id: `search-${Date.now()}`,
        type: 'text',
        data: `Query: ${q}\n\nResult: ${text}`,
        timestamp: Date.now(),
        imported: true
      };
      await saveSyncData(syncData);
    } catch (err) {
      console.error("Quick search failed:", err);
      setResults("Intelligence retrieval failed. Check connection.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-auto absolute bottom-10 right-10 w-24 h-24 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* The Logo (Dead Center) */}
            <button 
              onClick={() => setIsBubbleOpen(!isBubbleOpen)}
              className="relative z-20 w-16 h-16 bg-transparent flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Logo className="w-12 h-12 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            </button>

            {/* Floating Action Buttons */}
            <AnimatePresence>
              {isBubbleOpen && (
                <>
                  {/* Top Left: Expand */}
                  <motion.button
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: 1, x: -45, y: -45 }}
                    exit={{ opacity: 0, x: 0, y: 0 }}
                    onClick={() => { setIsExpanded(true); setIsBubbleOpen(false); }}
                    className="absolute z-10 p-3 bg-surface/80 backdrop-blur-xl border border-primary/30 rounded-full text-primary shadow-xl hover:bg-primary hover:text-black transition-all"
                  >
                    <Maximize2 size={16} />
                  </motion.button>

                  {/* Top Right: Exit */}
                  <motion.button
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: 1, x: 45, y: -45 }}
                    exit={{ opacity: 0, x: 0, y: 0 }}
                    onClick={() => { setIsVisible(false); onClose(); }}
                    className="absolute z-10 p-3 bg-surface/80 backdrop-blur-xl border border-red-500/30 rounded-full text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </motion.button>

                  {/* Bottom Left: Screen Capture */}
                  <motion.button
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: 1, x: -45, y: 45 }}
                    exit={{ opacity: 0, x: 0, y: 0 }}
                    onClick={takeScreenshot}
                    className="absolute z-10 p-3 bg-surface/80 backdrop-blur-xl border border-primary/30 rounded-full text-primary shadow-xl hover:bg-primary hover:text-black transition-all"
                  >
                    <Camera size={16} />
                  </motion.button>

                  {/* Bottom Right: Audio Record */}
                  <motion.button
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: 1, x: 45, y: 45 }}
                    exit={{ opacity: 0, x: 0, y: 0 }}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    className={`absolute z-10 p-3 bg-surface/80 backdrop-blur-xl border rounded-full shadow-xl transition-all ${isRecording ? 'border-red-500 bg-red-500 text-white animate-pulse' : 'border-primary/30 text-primary hover:bg-primary hover:text-black'}`}
                  >
                    <Mic size={16} />
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping pointer-events-none opacity-20"></div>

            {/* Error Message Tooltip */}
            <AnimatePresence>
              {captureError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-4 w-64 p-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl text-center"
                >
                  {captureError}
                  <button 
                    onClick={() => setCaptureError(null)}
                    className="absolute -top-2 -right-2 p-1 bg-white text-red-500 rounded-full shadow-lg"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="pointer-events-auto fixed top-0 right-0 w-[450px] h-full bg-surface/95 backdrop-blur-3xl border-l border-border shadow-2xl flex flex-col z-[9999]"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-3">
                <Logo className="w-8 h-8" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Mini-App Terminal</h2>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenMainApp()}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  title="Open Main App"
                >
                  <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-text-muted hover:text-text transition-colors"
                >
                  <Square size={18} />
                </button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="p-2 text-text-muted hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Side Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Rail: Navigation */}
              <div className="w-16 border-r border-border flex flex-col items-center py-6 gap-6 bg-background/20">
                <button 
                  onClick={() => setActiveTerminal(AppView.RESEARCH)}
                  className={`p-3 rounded-xl transition-all ${activeTerminal === AppView.RESEARCH ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-muted hover:text-primary'}`}
                  title="Topic Search"
                >
                  <Search size={20} />
                </button>
                <button 
                  onClick={() => setActiveTerminal(AppView.FACT_CHECKER)}
                  className={`p-3 rounded-xl transition-all ${activeTerminal === AppView.FACT_CHECKER ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-muted hover:text-primary'}`}
                  title="Check the Facts"
                >
                  <ShieldCheck size={20} />
                </button>
                <button 
                  onClick={() => setActiveTerminal(AppView.POLICY_SIMULATOR)}
                  className={`p-3 rounded-xl transition-all ${activeTerminal === AppView.POLICY_SIMULATOR ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-muted hover:text-primary'}`}
                  title="Future Look"
                >
                  <TrendingUp size={20} />
                </button>
                <button 
                  onClick={() => setActiveTerminal(AppView.FINANCE_TRACKER)}
                  className={`p-3 rounded-xl transition-all ${activeTerminal === AppView.FINANCE_TRACKER ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-muted hover:text-primary'}`}
                  title="Money Tracker"
                >
                  <DollarSign size={20} />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-50">
                      {activeTerminal === AppView.RESEARCH && "Topic Search Terminal"}
                      {activeTerminal === AppView.FACT_CHECKER && "Fact-Checking Terminal"}
                      {activeTerminal === AppView.POLICY_SIMULATOR && "Future Forecast Terminal"}
                      {activeTerminal === AppView.FINANCE_TRACKER && "Financial Intelligence Terminal"}
                    </span>
                  </div>
                  {results && (
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 animate-fade-in markdown-body">
                      <div className="text-sm leading-relaxed font-serif italic">
                        <ReactMarkdown>{results}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  {!results && !isSearching && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                      <Logo className="w-16 h-16 grayscale" />
                      <p className="text-xs font-serif italic">Terminal ready for intelligence input...</p>
                    </div>
                  )}

                  {isSearching && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Processing Intelligence...</p>
                    </div>
                  )}
                </div>

                {/* Integrated Search Terminal */}
                <div className="mt-auto">
                  <SearchTerminal 
                    onSearch={handleMiniAppSearch}
                    placeholder={`Ask Factium AI (${activeTerminal.replace('_', ' ')})...`}
                    loading={isSearching}
                    historyKey={`mini_app_${activeTerminal.toLowerCase()}`}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-background/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Sync Active: Main App Linked</span>
              </div>
              <span className="text-[8px] font-mono text-text-muted opacity-50 uppercase">v3.0 Mini-App</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice Popup */}
      <AnimatePresence>
        {showChoice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto z-[10000]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface border border-primary/30 rounded-[2.5rem] p-8 max-w-sm w-full space-y-8 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  {capturedFile?.type === 'screenshot' ? <ImageIcon className="text-primary" /> : <Mic className="text-primary" />}
                </div>
                <h3 className="text-xl font-black italic uppercase font-serif tracking-tight">Intelligence Captured</h3>
                <p className="text-text-muted text-sm font-serif italic">Choose how to process this data filament.</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleChoice(true)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-black">Save & Import</span>
                    <span className="text-[8px] opacity-70">Inject to AI Terminal</span>
                  </div>
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => handleChoice(false)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border text-text font-black uppercase text-[10px] tracking-widest hover:bg-surface transition-colors"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-black">Save to Device</span>
                    <span className="text-[8px] opacity-70">Local Storage Only</span>
                  </div>
                  <Save size={16} />
                </button>
              </div>

              <button 
                onClick={() => { setShowChoice(false); setCapturedFile(null); }}
                className="w-full text-center text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text transition-colors"
              >
                Discard Filament
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickAccessOverlay;
