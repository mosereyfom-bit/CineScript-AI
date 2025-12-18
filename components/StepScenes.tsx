
import React, { useState } from 'react';
import { ProjectState, Scene } from '../types';
import { generateSceneBreakdown } from '../services/geminiService';
import { FilmIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepScenes: React.FC<Props> = ({ project, updateProject, onNext, onBack }) => {
  const { t } = useLanguage();
  const [scenes, setScenes] = useState<Scene[]>(project.scenes);
  const [loading, setLoading] = useState(false);

  const handleGenerateScenes = async () => {
    setLoading(true);
    try {
      const generatedScenes = await generateSceneBreakdown(
        project.rawScript, 
        project.targetDuration || '3 min', 
        project.targetSceneCount || 23
      );
      // Ensure sequential IDs starting from 1
      const sequentialScenes = generatedScenes.map((scene, index) => ({
        ...scene,
        id: index + 1
      }));
      setScenes(sequentialScenes);
    } catch (e) {
      console.error(e);
      alert("Failed to generate scene breakdown.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    updateProject({ scenes });
    onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FilmIcon className="w-6 h-6 text-indigo-400" />
            {t.scenesTitle}
          </h2>
          <p className="text-slate-400 mt-1">
            {t.scenesDesc} <span className="text-indigo-400 font-mono">{project.targetDuration}</span> / <span className="text-indigo-400 font-mono">{project.targetSceneCount} {t.scenes}</span>.
          </p>
        </div>
        <button 
          onClick={handleGenerateScenes}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-lg"
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
          ) : (
            <FilmIcon className="w-4 h-4" />
          )}
          {scenes.length > 0 ? t.regenerateBreakdown : t.generateScenes}
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
        {scenes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FilmIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>{t.noScenesGenerated}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            <div className="grid grid-cols-12 bg-slate-800 p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-2">{t.location}</div>
              <div className="col-span-6">{t.action}</div>
              <div className="col-span-2">{t.stepCast}</div>
              <div className="col-span-1 text-right">{t.duration}</div>
            </div>
            {scenes.map((scene, index) => (
              <div key={index} className="grid grid-cols-12 p-4 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors items-center">
                <div className="col-span-1 text-center font-mono text-indigo-400">{scene.id}</div>
                <div className="col-span-2 flex items-center gap-1 text-slate-400">
                  <MapPinIcon className="w-3 h-3" />
                  {scene.location}
                </div>
                <div className="col-span-6 pr-4">
                  {scene.action}
                </div>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {scene.characters.map((charName, i) => (
                    <span key={i} className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                      {charName}
                    </span>
                  ))}
                </div>
                <div className="col-span-1 text-right font-mono text-slate-500 flex items-center justify-end gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {scene.duration}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-700">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {t.back}
        </button>
        <button
          onClick={handleNext}
          disabled={scenes.length === 0}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            scenes.length === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {t.confirmScenes}
        </button>
      </div>
    </div>
  );
};

export default StepScenes;
