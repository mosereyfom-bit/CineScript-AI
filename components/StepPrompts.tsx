
import React, { useState } from 'react';
import { ProjectState, GeneratedPrompt } from '../types';
import { generateImagePrompts, generateVideo } from '../services/geminiService';
import { 
  VideoCameraIcon, 
  ClipboardIcon, 
  ArrowPathIcon, 
  PlayIcon, 
  ExclamationTriangleIcon, 
  SparklesIcon, 
  ClipboardDocumentListIcon, 
  CheckIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  onBack: () => void;
  onReset: () => void;
}

const StepPrompts: React.FC<Props> = ({ project, updateProject, onBack, onReset }) => {
  const { t } = useLanguage();
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>(project.prompts);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState(false);
  
  const updatePromptStatus = (sceneId: number, status: GeneratedPrompt['videoStatus'], url?: string) => {
    const updated = prompts.map(p => p.sceneId === sceneId ? { ...p, videoStatus: status, videoUrl: url } : p);
    setPrompts(updated);
    updateProject({ prompts: updated });
  };

  const handleGeneratePrompts = async () => {
    setLoading(true);
    try {
      const generated = await generateImagePrompts(project);
      const formatted = generated
        .sort((a, b) => a.sceneId - b.sceneId)
        .map(p => ({ ...p, videoStatus: 'idle' as const }));
      
      setPrompts(formatted);
      updateProject({ prompts: formatted });
    } catch (e) {
      console.error(e);
      alert("Failed to generate prompts.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAllPrompts = () => {
    if (prompts.length === 0) return;
    const allText = prompts.map((p, index) => `[${index + 1}]_ ${p.promptText}`).join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopyAllStatus(true);
    setTimeout(() => setCopyAllStatus(false), 2000);
  };

  const handleGenerateVideo = async (sceneId: number, promptText: string, technicalSpecs: string, index: number) => {
    const provider = project.targetModel;
    const fullPrompt = `${technicalSpecs} [${index + 1}]_ ${promptText}`;

    if (provider === 'Custom') {
      navigator.clipboard.writeText(fullPrompt);
      alert("Prompt copied to clipboard!");
      return;
    }

    if (provider !== 'Google Veo' && provider !== 'Google Flow') {
      alert(`API Integration for ${provider} is in beta.`);
      return;
    }

    const aistudio = (window as any).aistudio;
    try {
      if (aistudio && aistudio.hasSelectedApiKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) await aistudio.openSelectKey();
      }
    } catch (e) {}

    updatePromptStatus(sceneId, 'generating');

    try {
      const videoUrl = await generateVideo(fullPrompt, project.aspectRatio);
      updatePromptStatus(sceneId, 'completed', videoUrl);
    } catch (e: any) {
      updatePromptStatus(sceneId, 'failed');
    }
  };

  const handleCopyPrompt = (sceneId: number, index: number, text: string, specs: string) => {
    const fullText = `${specs} [${index + 1}]_ ${text}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(sceneId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeletePrompt = (sceneId: number) => {
    const updated = prompts.filter(p => p.sceneId !== sceneId);
    setPrompts(updated);
    updateProject({ prompts: updated });
  };

  const getShortModelName = (name: string) => {
    return name.replace('Google ', '');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <VideoCameraIcon className="w-6 h-6 text-indigo-400" />
            {t.promptsTitle}
          </h2>
          <p className="text-slate-400 mt-1">{t.promptsDesc}</p>
        </div>
        <div className="flex gap-3">
          {prompts.length > 0 && (
            <button 
              onClick={handleCopyAllPrompts}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all shadow-lg border ${
                copyAllStatus 
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {copyAllStatus ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
              {copyAllStatus ? t.copied : "Copy All"}
            </button>
          )}
          <button 
            onClick={handleGeneratePrompts}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-lg"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
            ) : (
              <ArrowPathIcon className="w-4 h-4" />
            )}
            {prompts.length > 0 ? t.refreshPrompts : "Generate All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {prompts.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-500">
             <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
             <p>No prompts generated yet.</p>
          </div>
        ) : (
          prompts.map((p, index) => (
            <div key={p.sceneId} className="group bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30">
              <div className="p-6 space-y-6">
                
                {/* Prompt Text Area with sequential numbering */}
                <div className="relative bg-[#0f172a] p-6 rounded-xl border border-slate-700/50 shadow-inner group-hover:bg-[#0f172a]/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="space-y-4 flex-1">
                      <p className="text-base text-slate-100 leading-relaxed font-medium">
                        <span className="text-indigo-400 font-bold select-none mr-2 font-mono">
                          [{index + 1}]_
                        </span>
                        {p.promptText}
                      </p>
                      
                      {/* Technical Specs */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Technical Specs</label>
                        <p className="text-xs text-slate-400 font-mono bg-slate-900/50 p-2 rounded border border-slate-800/50">
                          {p.technicalSpecs}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Actions for Prompt */}
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button 
                      onClick={() => handleCopyPrompt(p.sceneId, index, p.promptText, p.technicalSpecs)}
                      className="p-2 rounded-lg bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/30"
                      title="Copy Prompt"
                    >
                      {copiedId === p.sceneId ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <ClipboardIcon className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDeletePrompt(p.sceneId)}
                      className="p-2 rounded-lg bg-slate-800/50 text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all border border-slate-700/30"
                      title="Delete Prompt"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Generation Area */}
                <div className="flex flex-col items-center">
                  {p.videoStatus === 'completed' && p.videoUrl ? (
                    <div className="w-full max-w-2xl space-y-4">
                      <video src={p.videoUrl} className="w-full rounded-xl border border-slate-700 shadow-2xl" controls />
                      <button 
                        onClick={() => handleGenerateVideo(p.sceneId, p.promptText, p.technicalSpecs, index)} 
                        className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowPathIcon className="w-3 h-3" /> Regenerate Video
                      </button>
                    </div>
                  ) : p.videoStatus === 'generating' ? (
                    <div className="w-full max-w-2xl py-12 flex flex-col items-center justify-center gap-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <SparklesIcon className="w-6 h-6 absolute inset-0 m-auto text-indigo-400 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Creating your cinematic scene...</p>
                        <p className="text-xs text-slate-500 mt-1">This may take a few moments</p>
                      </div>
                    </div>
                  ) : p.videoStatus === 'failed' ? (
                    <div className="w-full max-w-2xl py-8 flex flex-col items-center justify-center gap-4 bg-red-950/10 rounded-xl border border-dashed border-red-900/20">
                      <ExclamationTriangleIcon className="w-10 h-10 text-red-900/50" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-red-400">Generation Failed</p>
                        <button 
                          onClick={() => handleGenerateVideo(p.sceneId, p.promptText, p.technicalSpecs, index)}
                          className="mt-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl">
                      <button 
                        onClick={() => handleGenerateVideo(p.sceneId, p.promptText, p.technicalSpecs, index)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl text-base font-bold shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                      >
                        <PlayIcon className="w-6 h-6" />
                        Generate with {getShortModelName(project.targetModel)}
                      </button>
                      <p className="text-center text-[10px] text-slate-600 mt-3 uppercase tracking-widest font-bold">
                        Target Aspect Ratio: {project.aspectRatio} • 720p HD Preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-700">
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium border border-transparent hover:border-slate-700"
        >
          {t.back}
        </button>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-950/10 hover:bg-red-950/30 text-red-400 border border-red-900/20 transition-all font-bold text-sm"
        >
          <SparklesIcon className="w-4 h-4" />
          {t.resetAll}
        </button>
      </div>
    </div>
  );
};

export default StepPrompts;
