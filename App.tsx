
import React, { useState, useEffect } from 'react';
import { AppStep, ProjectState } from './types';
import { ArrowLeftIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline'; 
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import StepScript from './components/StepScript';
import StepStyle from './components/StepStyle';
import StepCast from './components/StepCast';
import StepSets from './components/StepSets';
import StepScenes from './components/StepScenes';
import StepPrompts from './components/StepPrompts';

const initialProjectState: ProjectState = {
  rawScript: '',
  tone: '',
  detectedCharacterNames: [],
  detectedLocations: [],
  selectedStyle: null,
  cast: [],
  sets: [],
  scenes: [],
  prompts: [],
  targetModel: 'Google Veo',
  targetDuration: '3 min',
  targetSceneCount: 23,
  apiKeys: {},
  aspectRatio: '16:9'
};

const CineScriptApp: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SCRIPT);
  const [resetKey, setResetKey] = useState(0);
  const [project, setProject] = useState<ProjectState>(() => {
    const saved = localStorage.getItem('cinescript_project_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load project state", e);
      }
    }
    return initialProjectState;
  });

  // Persist project state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cinescript_project_state', JSON.stringify(project));
  }, [project]);

  const updateProject = (updates: Partial<ProjectState>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < AppStep.PROMPTS) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > AppStep.SCRIPT) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      const resetState = {
        ...initialProjectState,
        apiKeys: project.apiKeys // Preserve API keys for convenience
      };
      setProject(resetState);
      localStorage.setItem('cinescript_project_state', JSON.stringify(resetState));
      setCurrentStep(AppStep.SCRIPT);
      setResetKey(prev => prev + 1); // Force full remount to clear local component states
    }
  };

  const steps = [
    { id: AppStep.SCRIPT, label: t.stepScript },
    { id: AppStep.STYLE, label: t.stepStyle },
    { id: AppStep.CAST, label: t.stepCast },
    { id: AppStep.SETS, label: t.stepSets },
    { id: AppStep.SCENES, label: t.stepScenes },
    { id: AppStep.PROMPTS, label: t.stepPrompts },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-indigo-500/30">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {t.appName}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-900/20 hover:bg-red-900/40 border border-red-700/30 hover:border-red-500/50 transition-colors text-xs font-medium text-red-300 mr-2"
              title={t.resetAll}
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="hidden sm:inline capitalize">{t.resetAll}</span>
            </button>

            <button 
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-xs font-medium text-slate-300"
            >
              <GlobeAltIcon className="w-4 h-4 text-indigo-400" />
              <span>{language === 'en' ? 'English' : 'ខ្មែរ'}</span>
            </button>
            
            <div className="hidden md:block text-xs text-slate-500 font-mono border-l border-slate-800 pl-4">
              {t.poweredBy}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <div className="mb-6 px-3">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group">
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t.rentLink}
              </button>
            </div>
            
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-indigo-900/20 text-indigo-400 border-l-2 border-indigo-500' 
                      : isCompleted 
                        ? 'text-slate-400 hover:text-slate-300' 
                        : 'text-slate-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 border flex-shrink-0 ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-900/50' 
                      : isCompleted
                        ? 'border-slate-600 bg-slate-800'
                        : 'border-slate-700'
                  }`}>
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className="font-medium text-sm">{step.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-h-[600px]">
          <div className="bg-slate-900/50" key={resetKey}>
            {currentStep === AppStep.SCRIPT && (
              <StepScript 
                project={project} 
                updateProject={updateProject} 
                onNext={nextStep} 
              />
            )}
            {currentStep === AppStep.STYLE && (
              <StepStyle 
                project={project} 
                updateProject={updateProject} 
                onNext={nextStep} 
                onBack={prevStep}
              />
            )}
            {currentStep === AppStep.CAST && (
              <StepCast 
                project={project} 
                updateProject={updateProject} 
                onNext={nextStep} 
                onBack={prevStep}
              />
            )}
            {currentStep === AppStep.SETS && (
              <StepSets 
                project={project} 
                updateProject={updateProject} 
                onNext={nextStep} 
                onBack={prevStep}
              />
            )}
            {currentStep === AppStep.SCENES && (
              <StepScenes 
                project={project} 
                updateProject={updateProject} 
                onNext={nextStep} 
                onBack={prevStep}
              />
            )}
            {currentStep === AppStep.PROMPTS && (
              <StepPrompts 
                project={project} 
                updateProject={updateProject} 
                onBack={prevStep}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <CineScriptApp />
    </LanguageProvider>
  );
};

export default App;
