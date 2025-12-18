
import React, { useState, useEffect } from 'react';
import { ProjectState, VisualStyle } from '../types';
import { PaintBrushIcon, TvIcon, CpuChipIcon, ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Helper to generate a basic style object
const createStyle = (name: string, render: string, lighting: string = 'Cinematic', color: string = 'Vibrant'): VisualStyle => ({
  id: name.toLowerCase().replace(/\s+/g, '_'),
  name,
  description: `${name} style visual aesthetic`,
  previewColor: '',
  rules: {
    render,
    lighting,
    color,
    camera: 'Dynamic'
  }
});

const PRESET_STYLES: VisualStyle[] = [
  createStyle('3D Cartoon', '3D Cartoon, Pixar-style, smooth surfacing'),
  createStyle('2D Anime', '2D Anime, Japanese animation style, cel shaded'),
  createStyle('Realistic CG', 'Realistic CG, Unreal Engine 5, 8k, detailed'),
  createStyle('Pixel Art', 'Pixel Art, 16-bit, retro game style'),
  createStyle('Cinematic', 'Cinematic, movie quality, photorealistic'),
  createStyle('Ghibli', 'Studio Ghibli style, hand-painted backgrounds'),
  createStyle('2D Novel', 'Visual Novel style, illustrated, static beauty'),
  createStyle('Clay', 'Claymation, stop-motion, plasticine texture'),
  createStyle('Ndebele Cartoon Style', 'Ndebele art patterns, bold geometric, cartoon')
];

const StepStyle: React.FC<Props> = ({ project, updateProject, onNext, onBack }) => {
  const { t } = useLanguage();
  const [customInput, setCustomInput] = useState('');
  const [aspectRatioOpen, setAspectRatioOpen] = useState(false);

  // Sync local custom input state with project state on mount
  useEffect(() => {
    if (project.selectedStyle?.id === 'custom') {
      setCustomInput(project.selectedStyle.name);
    }
  }, [project.selectedStyle]);

  const handleSelect = (style: VisualStyle) => {
    updateProject({ selectedStyle: style });
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    
    if (value.trim()) {
      // Preserve existing rules if we are already in custom mode, otherwise initialize defaults
      const currentRules = project.selectedStyle?.id === 'custom' 
        ? project.selectedStyle.rules 
        : {
            render: value,
            lighting: 'Dynamic',
            color: 'Dynamic',
            camera: 'Cinematic'
          };

      updateProject({
        selectedStyle: {
          id: 'custom',
          name: value,
          description: value,
          previewColor: '',
          rules: currentRules
        }
      });
    } else {
      updateProject({ selectedStyle: null });
    }
  };

  const handleRuleChange = (field: keyof VisualStyle['rules'], value: string) => {
    if (!project.selectedStyle || project.selectedStyle.id !== 'custom') {
        // If they start editing rules of a preset, promote it to custom automatically
        const baseStyle = project.selectedStyle || createStyle('Custom', 'Dynamic');
        updateProject({
            selectedStyle: {
                ...baseStyle,
                id: 'custom',
                name: customInput || baseStyle.name,
                rules: {
                    ...baseStyle.rules,
                    [field]: value
                }
            }
        });
        return;
    }

    updateProject({
      selectedStyle: {
        ...project.selectedStyle,
        rules: {
          ...project.selectedStyle.rules,
          [field]: value
        }
      }
    });
  };

  const aspectRatios = [
    { label: 'Landscape (16:9)', value: '16:9' },
    { label: 'Portrait (9:16)', value: '9:16' },
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Classic (4:3)', value: '4:3' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PaintBrushIcon className="w-6 h-6 text-indigo-400" />
          Video Settings
        </h2>
        <p className="text-slate-400 mt-1">{t.chooseStyle}</p>
      </div>

      <div className="space-y-8">
        
        {/* Style Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Style Presets
          </label>
          
          {/* Style Pills */}
          <div className="flex flex-wrap gap-3">
            {PRESET_STYLES.map((style) => {
              const isSelected = project.selectedStyle?.id === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleSelect(style)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? 'bg-slate-700 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  {style.name}
                </button>
              );
            })}
          </div>

          {/* Custom Input Section */}
          <div className="pt-4 space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">
              Custom Style Logic
            </label>
            <input
              type="text"
              value={customInput}
              onChange={handleCustomChange}
              placeholder="Or type a custom visual style here..."
              className={`w-full bg-slate-900/50 border rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                project.selectedStyle?.id === 'custom' 
                  ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'border-indigo-500/20 hover:border-indigo-500/40'
              }`}
            />

            {/* Detailed Rule Inputs */}
            {project.selectedStyle && (
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  {project.selectedStyle.id === 'custom' ? 'Custom Style Parameters' : `${project.selectedStyle.name} Parameters (Read-Only)`}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">Render Style</label>
                    <input
                      type="text"
                      readOnly={project.selectedStyle.id !== 'custom'}
                      value={project.selectedStyle.rules.render}
                      onChange={(e) => handleRuleChange('render', e.target.value)}
                      placeholder="e.g. Unreal Engine 5, Digital Painting"
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-all ${project.selectedStyle.id === 'custom' ? 'focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50' : 'opacity-50'}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">Lighting</label>
                    <input
                      type="text"
                      readOnly={project.selectedStyle.id !== 'custom'}
                      value={project.selectedStyle.rules.lighting}
                      onChange={(e) => handleRuleChange('lighting', e.target.value)}
                      placeholder="e.g. Volumetric fog, Rembrant lighting"
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-all ${project.selectedStyle.id === 'custom' ? 'focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50' : 'opacity-50'}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">Color Palette</label>
                    <input
                      type="text"
                      readOnly={project.selectedStyle.id !== 'custom'}
                      value={project.selectedStyle.rules.color}
                      onChange={(e) => handleRuleChange('color', e.target.value)}
                      placeholder="e.g. Desaturated, Teal & Orange"
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-all ${project.selectedStyle.id === 'custom' ? 'focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50' : 'opacity-50'}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">Camera Movement</label>
                    <input
                      type="text"
                      readOnly={project.selectedStyle.id !== 'custom'}
                      value={project.selectedStyle.rules.camera}
                      onChange={(e) => handleRuleChange('camera', e.target.value)}
                      placeholder="e.g. Handheld, Slow dolly zoom"
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-all ${project.selectedStyle.id === 'custom' ? 'focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50' : 'opacity-50'}`}
                    />
                  </div>

                </div>
                {project.selectedStyle.id !== 'custom' && (
                  <p className="text-[10px] text-slate-600 italic">Select the Custom input field above to start editing these rules manually.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Aspect Ratio Section */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TvIcon className="w-4 h-4" /> Aspect Ratio
            </label>
            <div className="relative">
                <button
                    onClick={() => setAspectRatioOpen(!aspectRatioOpen)}
                    className="w-full bg-slate-900/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl px-5 py-4 text-left text-slate-200 flex justify-between items-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                    <span className="font-medium">
                        {aspectRatios.find(r => r.value === (project.aspectRatio || '16:9'))?.label}
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${aspectRatioOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {aspectRatioOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {aspectRatios.map((ratio) => (
                            <button
                                key={ratio.value}
                                onClick={() => {
                                    updateProject({ aspectRatio: ratio.value });
                                    setAspectRatioOpen(false);
                                }}
                                className={`w-full text-left px-5 py-3 transition-colors text-sm font-medium border-l-2 ${
                                    (project.aspectRatio || '16:9') === ratio.value 
                                    ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500' 
                                    : 'text-slate-300 border-transparent hover:bg-slate-800'
                                }`}
                            >
                                {ratio.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Model AI Display */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CpuChipIcon className="w-4 h-4" /> {t.modelAi}
            </label>
            <div className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-4 text-slate-200 flex items-center gap-2 opacity-75">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
               {project.targetModel || 'Google Veo'}
            </div>
        </div>

      </div>

      <div className="flex justify-between pt-8 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {t.back}
        </button>
        <button
          onClick={onNext}
          disabled={!project.selectedStyle}
          className={`px-8 py-2.5 rounded-lg font-semibold transition-all shadow-lg ${
            !project.selectedStyle
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
          }`}
        >
          {t.confirmStyle}
        </button>
      </div>
    </div>
  );
};

export default StepStyle;
