
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'km';

// Simple translation dictionary
const translations = {
  en: {
    // Header & Nav
    appName: "CineScript AI",
    poweredBy: "Powered by Gemini 2.5",
    rentLink: "Go to Rent",
    stepScript: "Script",
    stepStyle: "Style",
    stepCast: "Cast",
    stepSets: "Sets",
    stepScenes: "Scenes",
    stepPrompts: "Prompts",
    resetAll: "Clean",
    confirmReset: "Are you sure you want to clean everything? All current progress will be lost.",
    
    // Common Actions
    back: "Back",
    next: "Next",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    copy: "Copy",
    copied: "Copied!",
    loading: "Loading...",
    
    // Script Step
    storyInputTitle: "Story Input",
    storyInputDesc: "Paste your script, novel excerpt, or screenplay below.",
    loadSample: "Load Sample",
    modelAi: "Model AI",
    apiKey: "API Key",
    selectKey: "Select API Key",
    durationSceneCount: "Duration & Scene Count (Strict Mode)",
    scenes: "Scenes",
    analyzeNext: "Analyze & Next",
    analyzing: "Analyzing...",
    
    // Style Step
    styleTitle: "Select Visual Style",
    styleDesc: "Detected Tone:",
    chooseStyle: "Choose a visual language for your video.",
    confirmStyle: "Confirm Style",
    customStyle: "Custom Style",
    customStyleDesc: "Create a unique visual style from scratch.",
    styleName: "Style Name",
    styleDescription: "Description",
    lightingRules: "Lighting",
    colorRules: "Color",
    renderRules: "Render",
    cameraRules: "Camera",
    placeholderLighting: "e.g., Low-key, natural, neon...",
    placeholderColor: "e.g., Vibrant, pastel, monochrome...",
    placeholderRender: "e.g., 3D Render, Oil Painting, 8mm Film...",
    placeholderCamera: "e.g., Wide angle, handheld, drone...",
    
    // Cast Step
    castTitle: "Cast & Characters",
    castDesc: "Define the visual identity of your cast.",
    autoGenerateCast: "Auto-Generate Cast",
    manualAdd: "Manual Add",
    noCast: "No characters defined.",
    clickAuto: "Click Auto-Generate to analyze the script and create profiles.",
    name: "Name",
    role: "Role",
    visualAppearance: "Visual Appearance",
    personality: "Personality",
    saveCharacter: "Save Character",
    generatePreview: "Generate Preview",
    confirmCast: "Confirm Cast",
    
    // Sets Step
    setsTitle: "Sets & Locations",
    setsDesc: "Define the world and environments.",
    autoGenerateSets: "Auto-Generate Sets",
    noSets: "No locations defined.",
    locationName: "Location Name",
    visualDesc: "Visual Description",
    moodVibe: "Mood/Vibe",
    saveSet: "Save Set",
    generateImage: "Generate Image",
    checkDetails: "Check Details",
    collapse: "Collapse",
    confirmSets: "Confirm Sets",
    
    // Scenes Step
    scenesTitle: "Scene Breakdown",
    scenesDesc: "Convert script to scenes. Target:",
    generateScenes: "Generate Scenes",
    regenerateBreakdown: "Regenerate Breakdown",
    noScenesGenerated: "No scenes generated yet. Click \"Generate Scenes\" to analyze your script using Gemini.",
    location: "Location",
    action: "Action",
    duration: "Dur",
    confirmScenes: "Confirm Scenes",
    
    // Prompts Step
    promptsTitle: "Export & Generate",
    promptsDesc: "Review prompts and generate videos.",
    refreshPrompts: "Refresh Prompts",
    promptLabel: "Prompt",
    negativeLabel: "Negative:",
    generateWith: "Generate with",
    copyCustom: "Copy for Custom Model",
    regenerate: "Regenerate",
    generating: "Generating Video...",
    generationFailed: "Generation Failed",
    noVideo: "No video generated",
    requiresPaid: "Requires paid API key. 720p 16:9 Preview.",
    customCopyDesc: "Copies detailed prompt for use in external tools.",
    reset: "Reset",
    copyAll: "Copy All Prompts",
    copyPromptOnly: "Prompt Only",
    copyFull: "Full Prompt"
  },
  km: {
    // Header & Nav
    appName: "ស៊ីនស្គ្រីប អេអាយ",
    poweredBy: "ដំណើរការដោយ Gemini 2.5",
    rentLink: "ទៅកាន់ការជួល",
    stepScript: "សាច់រឿង",
    stepStyle: "រចនាប័ទ្ម",
    stepCast: "តួអង្គ",
    stepSets: "ទីតាំង",
    stepScenes: "ឈុតឆាក",
    stepPrompts: "បង្កើត",
    resetAll: "សម្អាត",
    confirmReset: "តើអ្នកពិតជាចង់សម្អាតគម្រោងទាំងមូលឡើងវិញមែនទេ? ទិន្នន័យទាំងអស់នឹងត្រូវបាត់បង់។",
    
    // Common Actions
    back: "ត្រឡប់ក្រោយ",
    next: "បន្ទាប់",
    confirm: "យល់ព្រម",
    cancel: "បោះបង់",
    save: "រក្សាទុក",
    delete: "លុប",
    edit: "កែប្រែ",
    copy: "ចម្លង",
    copied: "បានចម្លង!",
    loading: "កំពុងដំណើរការ...",
    
    // Script Step
    storyInputTitle: "ការបញ្ចូលសាច់រឿង",
    storyInputDesc: "បិទភ្ជាប់សាច់រឿង ឬអត្ថបទភាពយន្តរបស់អ្នកនៅខាងក្រោម។",
    loadSample: "ផ្ទុកគំរូ",
    modelAi: "ម៉ូដែល AI",
    apiKey: "កូនសោ API",
    selectKey: "ជ្រើសរើស API Key",
    durationSceneCount: "រយៈពេល និង ចំនួនឈុត (កំណត់ជាក់លាក់)",
    scenes: "ឈុត",
    analyzeNext: "វិភាគ និង បន្ទាប់",
    analyzing: "កំពុងវិភាគ...",
    
    // Style Step
    styleTitle: "ជ្រើសរើសរចនាប័ទ្មរូបភាព",
    styleDesc: "ប្រភេទរឿងដែលបានរកឃើញ:",
    chooseStyle: "ជ្រើសរើសរចនាប័ទ្មដែលសាកសមសម្រាប់វីដេអូរបស់អ្នក។",
    confirmStyle: "យល់ព្រមលើរចនាប័ទ្ម",
    customStyle: "រចនាប័ទ្មផ្ទាល់ខ្លួន",
    customStyleDesc: "បង្កើតរចនាប័ទ្មរូបភាពផ្ទាល់ខ្លួនរបស់អ្នក។",
    styleName: "ឈ្មោះរចនាប័ទ្ម",
    styleDescription: "ការពិពណ៌នា",
    lightingRules: "ពន្លឺ",
    colorRules: "ពណ៌",
    renderRules: "ការបង្ហាញ (Render)",
    cameraRules: "កាមេរ៉ា",
    placeholderLighting: "ឧ. ពន្លឺទន់, ធម្មជាតិ...",
    placeholderColor: "ឧ. ពណ៌រស់រវើក, សខ្មៅ...",
    placeholderRender: "ឧ. គំនូរប្រេង, ហ្វីល 8mm...",
    placeholderCamera: "ឧ. មុំទូលាយ, ថតពីលើ...",
    
    // Cast Step
    castTitle: "តួអង្គ និងតួសម្តែង",
    castDesc: "កំណត់អត្តសញ្ញាណ និងរូបរាងរបស់តួអង្គ關鍵。",
    autoGenerateCast: "បង្កើតតួអង្គស្វ័យប្រវត្តិ",
    manualAdd: "បន្ថែមដោយដៃ",
    noCast: "មិនទាន់មានតួអង្គទេ។",
    clickAuto: "ចុច \"បង្កើតដោយស្វ័យប្រវត្តិ\" ដើម្បីវិភាគសាច់រឿង និងបង្កើតប្រវត្តិរូប។",
    name: "ឈ្មោះ",
    role: "តួនាទី",
    visualAppearance: "រូបរាង",
    personality: "បុគ្គលិកលក្ខណៈ",
    saveCharacter: "រក្សាទុកតួអង្គ",
    generatePreview: "បង្កើតរូបភាពគំរូ",
    confirmCast: "យល់ព្រមលើតួអង្គ",
    
    // Sets Step
    setsTitle: "ទីតាំង និងឆាក",
    setsDesc: "កំណត់ពិភពលោក និងបរិយាកាសក្នុងរឿង។",
    autoGenerateSets: "បង្កើតទីតាំងស្វ័យប្រវត្តិ",
    noSets: "មិនទាន់មានទីតាំងទេ។",
    locationName: "ឈ្មោះទីតាំង",
    visualDesc: "ការពិពណ៌នារូបភាព",
    moodVibe: "បរិយាកាស/អារម្មណ៍",
    saveSet: "រក្សាទុកទីតាំង",
    generateImage: "បង្កើតរូបភាព",
    checkDetails: "មើលលម្អិត",
    collapse: "បិទលម្អិត",
    confirmSets: "យល់ព្រមលើទីតាំង",
    
    // Scenes Step
    scenesTitle: "ការបែងចែកឈុតឆាក",
    scenesDesc: "បំប្លែងសាច់រឿងទៅជាឈុតឆាក។ គោលដៅ:",
    generateScenes: "បង្កើតឈុតឆាក",
    regenerateBreakdown: "បង្កើតការបែងចែកឡើងវិញ",
    noScenesGenerated: "មិនទាន់មានឈុតឆាកទេ។ ចុច \"បង្កើតឈុតឆាក\" ដើម្បីវិភាគសាច់រឿង។",
    location: "ទីតាំង",
    action: "សកម្មភាព",
    duration: "រយៈពេល",
    confirmScenes: "យល់ព្រមលើឈុតឆាក",
    
    // Prompts Step
    promptsTitle: "នាំចេញ និងបង្កើតវីដេអូ",
    promptsDesc: "ពិនិត្យមើលពាក្យបញ្ជា និងបង្កើតវីដេអូ។",
    refreshPrompts: "ផ្ទុកពាក្យបញ្ជាឡើងវិញ",
    promptLabel: "ពាក្យបញ្ជា (Prompt)",
    negativeLabel: "មិនយក (Negative):",
    generateWith: "បង្កើតជាមួយ",
    copyCustom: "ចម្លងសម្រាប់ប្រើខាងក្រៅ",
    regenerate: "បង្កើតម្តងទៀត",
    generating: "កំពុងបង្កើតវីដេអូ...",
    generationFailed: "បរាជ័យក្នុងការបង្កើត",
    noVideo: "មិនមានវីដេអូ",
    requiresPaid: "តម្រូវឱ្យមានគណនីបង់ប្រាក់។ វីដេអូកម្រិត 720p 16:9",
    customCopyDesc: "ចម្លងពាក្យបញ្ជាលម្អិតសម្រាប់ប្រើប្រាស់ក្នុងឧបករណ៍ខាងក្រៅ។",
    reset: "កំណត់ឡើងវិញ",
    copyAll: "ចម្លងទាំងអស់",
    copyPromptOnly: "ចម្លងតែពាក្យបញ្ជា",
    copyFull: "ចម្លងពេញ"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
