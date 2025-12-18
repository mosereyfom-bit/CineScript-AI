export enum AppStep {
  SCRIPT = 1,
  STYLE = 2,
  CAST = 3,
  SETS = 4,
  SCENES = 5,
  PROMPTS = 6
}

export interface Character {
  id: string;
  name: string;
  role: 'Hero' | 'Villain' | 'Supporting' | 'Creature';
  description: string;
  personality: string;
  appearance: string;
  imageUrl?: string; // Base64 preview
}

export interface StorySet {
  id: string;
  name: string;
  description: string;
  visualVibe: string;
  imageUrl?: string; // Base64 preview
}

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  rules: {
    lighting: string;
    color: string;
    render: string;
    camera: string;
  };
  previewColor: string;
}

export interface Scene {
  id: number;
  location: string;
  action: string;
  characters: string[]; // Character IDs
  duration: string;
  visualNotes?: string;
}

export interface GeneratedPrompt {
  sceneId: number;
  promptText: string;
  negativePrompt?: string;
  technicalSpecs: string;
  videoUrl?: string; // URL to the generated video
  videoStatus?: 'idle' | 'generating' | 'completed' | 'failed';
}

export interface ProjectState {
  rawScript: string;
  tone: string;
  detectedCharacterNames: string[];
  detectedLocations: string[];
  selectedStyle: VisualStyle | null;
  cast: Character[];
  sets: StorySet[];
  scenes: Scene[];
  prompts: GeneratedPrompt[];
  // New configuration fields
  targetModel: string;
  targetDuration: string;
  targetSceneCount: number; // Added for strict adherence to pacing
  apiKeys: Record<string, string>; // Map of model name to API key
  aspectRatio: string;
}