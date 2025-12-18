import React, { useState } from 'react';
import { ProjectState, Character } from '../types';
import { generateCharacterPreview, generateCastDetails } from '../services/geminiService';
import { UserGroupIcon, PlusIcon, PhotoIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepCast: React.FC<Props> = ({ project, updateProject, onNext, onBack }) => {
  const { t } = useLanguage();
  const [characters, setCharacters] = useState<Character[]>(project.cast);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Character['role']>('Hero');
  const [newAppearance, setNewAppearance] = useState('');
  const [newPersonality, setNewPersonality] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const handleAutoGenerate = async () => {
    if (!project.rawScript) {
      alert("No script data found to analyze.");
      return;
    }
    
    setIsAutoGenerating(true);
    try {
      const generatedCast = await generateCastDetails(project.rawScript);
      setCharacters(prev => [...prev, ...generatedCast]);
    } catch (e) {
      console.error("Auto generation failed", e);
      alert("Failed to auto-generate cast from script.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleAddCharacter = () => {
    const id = `char_${Date.now()}`;
    setCharacters([...characters, {
      id,
      name: newName || 'Unnamed',
      role: newRole,
      appearance: newAppearance || 'Standard cinematic look',
      personality: newPersonality || 'Neutral',
      description: ''
    }]);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewRole('Hero');
    setNewAppearance('');
    setNewPersonality('');
  };

  const handleGeneratePreview = async (charId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char || !project.selectedStyle) return;

    setGeneratingId(charId);
    try {
      const imageUrl = await generateCharacterPreview(char, project.selectedStyle);
      if (imageUrl) {
        setCharacters(chars => chars.map(c => c.id === charId ? { ...c, imageUrl } : c));
      }
    } catch (e) {
      console.error(e);
      alert("Could not generate image. Check API limits or configuration.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleRemove = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const handleNext = () => {
    updateProject({ cast: characters });
    onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6 text-indigo-400" />
            {t.castTitle}
          </h2>
          <p className="text-slate-400 mt-1">{t.castDesc}</p>
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
            {t.autoGenerateCast}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t.name}</label>
              <input 
                value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t.role}</label>
              <select 
                value={newRole} onChange={e => setNewRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
              >
                <option value="Hero">Hero</option>
                <option value="Villain">Villain</option>
                <option value="Supporting">Supporting</option>
                <option value="Creature">Creature</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.visualAppearance}</label>
            <input 
              value={newAppearance} onChange={e => setNewAppearance(e.target.value)}
              placeholder="e.g., Tall, skeletal, tattered black cloak, glowing eyes"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.personality}</label>
            <input 
              value={newPersonality} onChange={e => setNewPersonality(e.target.value)}
              placeholder="e.g., Cold, ancient, dominant"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => { setEditingId(null); resetForm(); }} className="px-4 py-2 text-slate-400 hover:text-white">{t.cancel}</button>
            <button onClick={handleAddCharacter} className="px-4 py-2 bg-indigo-600 text-white rounded">{t.saveCharacter}</button>
          </div>
        </div>
      )}

      {characters.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-dashed border-slate-700 p-12 flex flex-col items-center justify-center text-slate-500">
           <UserGroupIcon className="w-16 h-16 opacity-20 mb-4" />
           <p>{t.noCast}</p>
           <p className="text-sm mt-2">{t.clickAuto}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(char => (
            <div key={char.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-900 w-full relative group">
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 flex-col gap-2">
                    <UserGroupIcon className="w-12 h-12" />
                    <span className="text-xs">No Preview</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button 
                    onClick={() => handleGeneratePreview(char.id)}
                    disabled={generatingId === char.id}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm"
                  >
                    {generatingId === char.id ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                    ) : (
                      <PhotoIcon className="w-4 h-4" />
                    )}
                    {t.generatePreview}
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg">{char.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      char.role === 'Hero' ? 'bg-blue-900 text-blue-200' :
                      char.role === 'Villain' ? 'bg-red-900 text-red-200' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {char.role}
                    </span>
                  </div>
                  <button onClick={() => handleRemove(char.id)} className="text-slate-500 hover:text-red-400">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-400 text-xs mb-1 line-clamp-3"><strong className="text-slate-500">Look:</strong> {char.appearance}</p>
                <p className="text-slate-400 text-xs line-clamp-2"><strong className="text-slate-500">Personality:</strong> {char.personality}</p>
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
          disabled={characters.length === 0}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            characters.length === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {t.confirmCast}
        </button>
      </div>
    </div>
  );
};

export default StepCast;