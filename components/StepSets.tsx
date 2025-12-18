import React, { useState } from 'react';
import { ProjectState, StorySet } from '../types';
import { generateSetPreview, generateSetsDetails } from '../services/geminiService';
import { MapIcon, PlusIcon, PhotoIcon, TrashIcon, SparklesIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepSets: React.FC<Props> = ({ project, updateProject, onNext, onBack }) => {
  const { t } = useLanguage();
  const [sets, setSets] = useState<StorySet[]>(project.sets || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Interaction state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVibe, setNewVibe] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const handleAutoGenerate = async () => {
    if (!project.rawScript) {
      alert("No script data found to analyze.");
      return;
    }
    
    setIsAutoGenerating(true);
    try {
      const generatedSets = await generateSetsDetails(project.rawScript);
      setSets(prev => [...prev, ...generatedSets]);
    } catch (e) {
      console.error("Auto generation failed", e);
      alert("Failed to auto-generate sets from script.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleAddSet = () => {
    const id = `set_${Date.now()}`;
    setSets([...sets, {
      id,
      name: newName || 'Unnamed Location',
      description: newDesc || 'Standard environment',
      visualVibe: newVibe || 'Neutral'
    }]);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewDesc('');
    setNewVibe('');
  };

  const handleGeneratePreview = async (setId: string) => {
    const setItem = sets.find(s => s.id === setId);
    if (!setItem || !project.selectedStyle) return;

    setGeneratingId(setId);
    try {
      const imageUrl = await generateSetPreview(setItem, project.selectedStyle);
      if (imageUrl) {
        setSets(prev => prev.map(s => s.id === setId ? { ...s, imageUrl } : s));
      }
    } catch (e) {
      console.error(e);
      alert("Could not generate image. Check API limits or configuration.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleRemove = (id: string) => {
    setSets(sets.filter(s => s.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sets.length - 1) return;
    
    const newSets = [...sets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSets[index], newSets[targetIndex]] = [newSets[targetIndex], newSets[index]];
    setSets(newSets);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNext = () => {
    updateProject({ sets });
    onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-indigo-400" />
            {t.setsTitle}
          </h2>
          <p className="text-slate-400 mt-1">{t.setsDesc}</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleAutoGenerate}
            disabled={isAutoGenerating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-emerald-900/20"
          >
            {isAutoGenerating ? (
               <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
            ) : (
               <SparklesIcon className="w-4 h-4" /> 
            )}
            {t.autoGenerateSets}
          </button>
          
          <button 
            onClick={() => setEditingId('new')}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> {t.manualAdd}
          </button>
        </div>
      </div>

      {editingId === 'new' && (
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.locationName}</label>
            <input 
              value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="e.g. Ruined Cathedral"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.visualDesc}</label>
            <input 
              value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="e.g., Ancient stone pillars, crumbling roof, overgrown vines"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.moodVibe}</label>
            <input 
              value={newVibe} onChange={e => setNewVibe(e.target.value)}
              placeholder="e.g., Ominous, foggy, majestic"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => { setEditingId(null); resetForm(); }} className="px-4 py-2 text-slate-400 hover:text-white">{t.cancel}</button>
            <button onClick={handleAddSet} className="px-4 py-2 bg-indigo-600 text-white rounded">{t.saveSet}</button>
          </div>
        </div>
      )}

      {sets.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-dashed border-slate-700 p-12 flex flex-col items-center justify-center text-slate-500">
           <MapIcon className="w-16 h-16 opacity-20 mb-4" />
           <p>{t.noSets}</p>
           <p className="text-sm mt-2">{t.noSets}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((item, index) => (
            <div key={item.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col transition-all hover:border-slate-600">
              <div className="h-40 bg-slate-900 w-full relative group">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 flex-col gap-2">
                    <MapIcon className="w-10 h-10" />
                    <span className="text-xs">No Preview</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm p-2">
                  <button 
                    onClick={() => handleGeneratePreview(item.id)}
                    disabled={generatingId === item.id}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs"
                  >
                    {generatingId === item.id ? (
                      <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"/>
                    ) : (
                      <PhotoIcon className="w-3 h-3" />
                    )}
                    {t.generateImage}
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-base truncate pr-2">{item.name}</h3>
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={() => handleMove(index, 'up')} 
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-slate-700 ${index === 0 ? 'text-slate-700' : 'text-slate-400 hover:text-white'}`}
                        title="Move Up"
                     >
                        <ChevronUpIcon className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={() => handleMove(index, 'down')} 
                        disabled={index === sets.length - 1}
                        className={`p-1 rounded hover:bg-slate-700 ${index === sets.length - 1 ? 'text-slate-700' : 'text-slate-400 hover:text-white'}`}
                        title="Move Down"
                     >
                        <ChevronDownIcon className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleRemove(item.id)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded ml-1">
                        <TrashIcon className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <div className="flex-1">
                   {expandedId === item.id ? (
                      <div className="space-y-2 text-xs animate-fade-in">
                          <div>
                            <span className="text-slate-500 font-semibold block">{t.visualDesc}:</span>
                            <span className="text-slate-300">{item.description}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold block">{t.moodVibe}:</span>
                            <span className="text-slate-300">{item.visualVibe}</span>
                          </div>
                      </div>
                   ) : (
                      <div className="text-xs text-slate-400">
                         <p className="line-clamp-2">{item.description}</p>
                         <p className="mt-1 text-indigo-400/80 italic truncate">{item.visualVibe}</p>
                      </div>
                   )}
                </div>

                <button 
                  onClick={() => toggleExpand(item.id)}
                  className="w-full mt-3 py-1.5 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-medium text-slate-500 hover:text-indigo-400 hover:bg-slate-900/50 rounded transition-colors"
                >
                  {expandedId === item.id ? (
                    <>{t.collapse} <ChevronUpIcon className="w-3 h-3" /></>
                  ) : (
                    <>{t.checkDetails} <ChevronDownIcon className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-slate-700">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {t.back}
        </button>
        <button
          onClick={handleNext}
          disabled={sets.length === 0}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            sets.length === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {t.confirmSets}
        </button>
      </div>
    </div>
  );
};

export default StepSets;