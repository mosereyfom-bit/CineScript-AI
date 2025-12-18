
import React, { useState, useEffect } from 'react';
import { ProjectState } from '../types';
import { analyzeScript, generateSetsDetails } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon, DocumentTextIcon, CpuChipIcon, KeyIcon, ClockIcon, LockClosedIcon, LockOpenIcon, MapIcon } from '@heroicons/react/24/outline';

const modelOptions = [
  'Google Veo',
  'Google Flow',
  'Kling AI',
  'Perplexity',
  'Custom'
];

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
}

const StepScript: React.FC<Props> = ({ project, updateProject, onNext }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [setsLoading, setSetsLoading] = useState(false);
  const [localScript, setLocalScript] = useState(project.rawScript);
  
  // Configuration State
  const [selectedModel, setSelectedModel] = useState(project.targetModel || 'Google Veo');
  const [selectedDuration, setSelectedDuration] = useState(project.targetDuration || '3 min');
  const [selectedSceneCount, setSelectedSceneCount] = useState(project.targetSceneCount || 23);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Local API Key State map
  const [localApiKeys, setLocalApiKeys] = useState<Record<string, string>>({});
  const [autoSaveKeys, setAutoSaveKeys] = useState(true);

  // Initialize keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('cinescript_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setLocalApiKeys(parsed);
        updateProject({ apiKeys: parsed });
      } catch (e) {
        console.error("Failed to parse saved API keys", e);
      }
    }
    
    // Check auto-save preference
    const savedAutoSave = localStorage.getItem('cinescript_autosave_enabled');
    if (savedAutoSave !== null) {
      setAutoSaveKeys(savedAutoSave === 'true');
    }
  }, []); // Only on mount

  // Check AI Studio Key status (Gemini/Veo only)
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        }
      } catch (e) {
        console.error("Failed to check API key", e);
      }
    };
    checkKey();
    
    // Sync model selection to project state
    updateProject({ 
      targetModel: selectedModel,
      targetDuration: selectedDuration,
      targetSceneCount: selectedSceneCount
    });
  }, [selectedModel, selectedDuration, selectedSceneCount]);

  const handleKeySelection = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        setTimeout(async () => {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        }, 1000);
      } else {
        alert("API Key selection is managed by the host environment.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualKeyChange = (value: string) => {
    const newKeys = { ...localApiKeys, [selectedModel]: value };
    setLocalApiKeys(newKeys);
    updateProject({ apiKeys: newKeys });
    
    if (autoSaveKeys) {
      localStorage.setItem('cinescript_api_keys', JSON.stringify(newKeys));
    }
  };

  const toggleAutoSave = () => {
    const newValue = !autoSaveKeys;
    setAutoSaveKeys(newValue);
    localStorage.setItem('cinescript_autosave_enabled', String(newValue));
    
    if (newValue) {
      // If turning on, save current state
      localStorage.setItem('cinescript_api_keys', JSON.stringify(localApiKeys));
    } else {
      // If turning off, clear storage (lock out)
      localStorage.removeItem('cinescript_api_keys');
    }
  };

  const handleAnalyze = async () => {
    if (!localScript.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeScript(localScript);
      updateProject({
        rawScript: localScript,
        tone: result.tone,
        detectedCharacterNames: result.characters,
        detectedLocations: result.locations,
        // Ensure config is fresh in state before proceeding
        targetModel: selectedModel,
        targetDuration: selectedDuration,
        targetSceneCount: selectedSceneCount
      });
      onNext();
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze script. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSets = async () => {
    if (!localScript.trim()) {
      alert("Please enter a script or story text first.");
      return;
    }
    setSetsLoading(true);
    try {
      const result = await generateSetsDetails(localScript);
      updateProject({ sets: result });
      alert(`AI has generated ${result.length} locations based on your script!`);
    } catch (error) {
      console.error("Sets generation failed", error);
      alert("Failed to generate sets. Please check your API configuration.");
    } finally {
      setSetsLoading(false);
    }
  };

  const sampleScript = `A lone warrior returns to a ruined kingdom, where a shadow king rules from the mist.
Elira stands firm in a flowing silver cloak, holding her runeblade. 
She faces the ShadowKing, a towering skeletal figure wrapped in swirling black shadows.
The ruined cathedral is filled with drifting fog.
The ShadowKing raises a hand, and the mist turns into obsidian daggers.`;

  const durationOptions = [
    { label: '3 min', scenes: 23, pace: 'Fast Paced' },
    { label: '8 min', scenes: 60, pace: 'Standard' },
    { label: '10 min', scenes: 75, pace: 'Detailed' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-indigo-400" />
            {t.storyInputTitle}
          </h2>
          <p className="text-slate-400 mt-1">{t.storyInputDesc}</p>
        </div>
        <button 
          onClick={() => setLocalScript(sampleScript)}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          {t.loadSample}
        </button>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        
        {/* Model AI Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <CpuChipIcon className="w-4 h-4" />
            {t.modelAi}
          </div>
          <div className="flex flex-wrap gap-3">
            {modelOptions.map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedModel === model
                    ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                {selectedModel === model && <span className="mr-2 text-cyan-400">✓</span>}
                {model}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 font-mono pl-1">
            Optimizes prompts for: <span className="text-cyan-500">{selectedModel}</span>
          </div>
        </div>

        {/* API Key Display - Dynamic based on Model */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
             <div className="flex items-center gap-2 text-slate-400 font-medium">
                <KeyIcon className="w-4 h-4" />
                {selectedModel} {t.apiKey}
             </div>
             <span className="text-slate-600 text-xs font-mono">
               {selectedModel === 'Google Veo' 
                 ? '(Securely saved via Google AI Studio)' 
                 : autoSaveKeys ? '(Auto-saved locally)' : '(Not saved)'}
             </span>
          </div>

          {selectedModel === 'Google Veo' ? (
            // Google Veo Specific Flow
            <button 
              onClick={handleKeySelection}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between group hover:border-slate-600 transition-colors"
            >
              <div className="font-mono text-slate-500 text-lg tracking-[0.2em] overflow-hidden">
                {hasApiKey ? '••••••••••••••••••••••••••••••••' : t.selectKey}
              </div>
              {hasApiKey ? (
                <LockClosedIcon className="w-5 h-5 text-emerald-500" />
              ) : (
                <LockOpenIcon className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
              )}
            </button>
          ) : (
            // Standard Input for other models
            <div className="space-y-2">
              <div className="relative group">
                <input
                  type="password"
                  value={localApiKeys[selectedModel] || ''}
                  onChange={(e) => handleManualKeyChange(e.target.value)}
                  placeholder={selectedModel === 'Custom' ? "Enter Custom API Endpoint or Key" : `Enter ${selectedModel} API Key`}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg p-3 pr-10 text-emerald-400 font-mono tracking-widest text-sm focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600 placeholder:tracking-normal"
                />
                <div className="absolute right-3 top-3.5 text-slate-500">
                  {localApiKeys[selectedModel] && autoSaveKeys ? (
                    <LockClosedIcon className="w-5 h-5 text-emerald-500/80" title="Saved locally" />
                  ) : (
                     <LockOpenIcon className="w-5 h-5 opacity-50" title="Not saved" />
                  )}
                </div>
              </div>
              
              {/* Auto-save Toggle */}
              <div className="flex justify-end">
                <button 
                  onClick={toggleAutoSave}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <span>Lock auto save</span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${autoSaveKeys ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform transform ${autoSaveKeys ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Duration & Scene Count */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <ClockIcon className="w-4 h-4" />
            {t.durationSceneCount}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {durationOptions.map((opt) => {
              const isActive = selectedDuration === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSelectedDuration(opt.label);
                    setSelectedSceneCount(opt.scenes);
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-cyan-500 bg-cyan-950/10'
                      : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-2xl font-bold mb-1 ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {opt.label}
                  </span>
                  <span className={`text-sm font-medium ${isActive ? 'text-cyan-600' : 'text-slate-500'}`}>
                    {opt.scenes} {t.scenes}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-2 bg-slate-900/50 px-2 py-0.5 rounded">
                    {opt.pace}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div className="space-y-4">
        {/* Auto-Sets Button Added Above Textarea */}
        <div className="flex justify-start">
          <button
            onClick={handleAutoSets}
            disabled={setsLoading || !localScript.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg border ${
              setsLoading || !localScript.trim()
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-900/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-500'
            }`}
          >
            {setsLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full"/>
            ) : (
              <MapIcon className="w-4 h-4" />
            )}
            Auto-Generate Sets & Locations (AI)
          </button>
        </div>

        {/* Script Input */}
        <div className="relative">
          <textarea
            className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
            placeholder={t.storyInputDesc}
            value={localScript}
            onChange={(e) => setLocalScript(e.target.value)}
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-500">
            {localScript.length} chars
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={loading || !localScript.trim()}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            loading || !localScript.trim()
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.analyzing}
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              {t.analyzeNext}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepScript;
