
import { GoogleGenAI, Type } from "@google/genai";
import { Character, Scene, GeneratedPrompt, VisualStyle, ProjectState, StorySet } from "../types";

// Default instance for basic text/image tasks
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Script Analysis ---

export const analyzeScript = async (script: string): Promise<{ tone: string; characters: string[]; locations: string[] }> => {
  // Fix: Use gemini-3-flash-preview for basic text tasks
  const model = "gemini-3-flash-preview";
  const prompt = `Analyze the following movie script or story text. Identify the overall tone/genre, list the names of the key characters, and list the key locations/sets where the story takes place.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt + "\n\nSCRIPT:\n" + script,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tone: { type: Type.STRING, description: "The genre or tone of the story" },
          characters: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of character names"
          },
          locations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of key locations/settings names"
          }
        },
        required: ["tone", "characters", "locations"]
      }
    }
  });

  return JSON.parse(response.text || '{"tone": "Unknown", "characters": [], "locations": []}');
};

// --- Character Generation & Preview ---

export const generateCastDetails = async (script: string): Promise<Character[]> => {
  // Fix: Use gemini-3-flash-preview for basic text tasks
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the script and generate detailed character profiles for the main cast.
    For each character, determine their role, visual appearance, and personality based on the text.
    
    Return a JSON list.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt + "\n\nSCRIPT:\n" + script,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING, enum: ['Hero', 'Villain', 'Supporting', 'Creature'] },
            appearance: { type: Type.STRING, description: "Visual description of clothing, face, body, items" },
            personality: { type: Type.STRING, description: "Key personality traits" },
            description: { type: Type.STRING, description: "Short bio or role description" }
          },
          required: ["name", "role", "appearance", "personality"]
        }
      }
    }
  });

  const rawCast = JSON.parse(response.text || '[]');
  
  // Map to Character interface with IDs
  return rawCast.map((c: any, index: number) => ({
    id: `auto_char_${Date.now()}_${index}`,
    name: c.name,
    role: c.role || 'Supporting',
    appearance: c.appearance || 'Standard',
    personality: c.personality || 'Neutral',
    description: c.description || '',
    imageUrl: undefined
  }));
};

export const generateCharacterPreview = async (char: Character, style: VisualStyle): Promise<string | undefined> => {
  // Fix: Use gemini-2.5-flash-image for general image generation
  const model = "gemini-2.5-flash-image";
  const prompt = `Character Design Portrait. 
  Name: ${char.name}. 
  Role: ${char.role}. 
  Appearance: ${char.appearance}. 
  Personality traits visible: ${char.personality}.
  Style: ${style.name} (${style.rules.render}, ${style.rules.lighting}, ${style.rules.color}).
  High quality, detailed, centered portrait.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {}
    });

    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Failed to generate character image", e);
    throw e;
  }
  return undefined;
};

// --- Set Generation & Preview ---

export const generateSetsDetails = async (script: string): Promise<StorySet[]> => {
  // Fix: Use gemini-3-flash-preview for basic text tasks
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the script and identify the key locations (sets) where the story takes place.
    For each location, provide a cinematic visual description and the overall mood/vibe.
    
    Return a JSON list.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt + "\n\nSCRIPT:\n" + script,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING, description: "Visual description of the environment, architecture, lighting" },
            visualVibe: { type: Type.STRING, description: "Mood or atmosphere (e.g. Ominous, Majestic)" }
          },
          required: ["name", "description", "visualVibe"]
        }
      }
    }
  });

  const rawSets = JSON.parse(response.text || '[]');
  
  return rawSets.map((s: any, index: number) => ({
    id: `auto_set_${Date.now()}_${index}`,
    name: s.name,
    description: s.description || 'Standard cinematic environment',
    visualVibe: s.visualVibe || 'Neutral',
    imageUrl: undefined
  }));
};

export const generateSetPreview = async (set: StorySet, style: VisualStyle): Promise<string | undefined> => {
  // Fix: Use gemini-2.5-flash-image for general image generation
  const model = "gemini-2.5-flash-image";
  const prompt = `Cinematic Environment Design. 
  Location: ${set.name}. 
  Description: ${set.description}. 
  Vibe/Mood: ${set.visualVibe}.
  Style: ${style.name} (${style.rules.render}, ${style.rules.lighting}, ${style.rules.color}, ${style.rules.camera}).
  High quality, detailed, wide shot.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {}
    });

    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Failed to generate set image", e);
    throw e;
  }
  return undefined;
};

// --- Scene Breakdown ---

export const generateSceneBreakdown = async (script: string, targetDuration: string, targetSceneCount: number): Promise<Scene[]> => {
  // Fix: Use gemini-3-pro-preview for complex reasoning tasks
  const model = "gemini-3-pro-preview";
  const prompt = `
    Break down the following story into a list of cinematic scenes. 
    
    CRITICAL CONSTRAINTS:
    1. The total video duration target is ${targetDuration}.
    2. You MUST generate approximately ${targetSceneCount} distinct scenes to match the desired pacing.
    3. Ensure a logical flow where the story is fully told within this scene count.
    
    For each scene, provide:
    - location: Where it happens.
    - action: What happens (visuals).
    - characters: List of names involved.
    - duration: Estimated duration (e.g., "5s", "10s"). The sum should equal roughly ${targetDuration}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt + "\n\nSCRIPT:\n" + script,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            location: { type: Type.STRING },
            action: { type: Type.STRING },
            characters: { type: Type.ARRAY, items: { type: Type.STRING } },
            duration: { type: Type.STRING },
            visualNotes: { type: Type.STRING }
          },
          required: ["id", "location", "action", "characters", "duration"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

// --- Prompt Generation ---

export const generateImagePrompts = async (project: ProjectState): Promise<GeneratedPrompt[]> => {
  // Fix: Use gemini-3-pro-preview for complex coding/reasoning tasks
  const model = "gemini-3-pro-preview"; 
  
  const context = {
    style: project.selectedStyle,
    characters: project.cast.map(c => ({ name: c.name, appearance: c.appearance })),
    sets: project.sets.map(s => ({ name: s.name, description: s.description, vibe: s.visualVibe })),
    scenes: project.scenes
  };

  const prompt = `
    You are an expert AI Video Prompt Engineer.
    Based on the provided Style, Character Profiles, Set/Location Details, and Scene Breakdown, generate a precise image generation prompt for each scene.
    
    CONSISTENCY LOCK:
    The "Style" definition provided below is the absolute law. You must explicitly weave the specific keywords, render style, lighting, and color palette from the [Style Context] into EVERY SINGLE generated prompt. Do not deviate. The visual aesthetic must be perfectly consistent across all shots. Ensure the 'Style' is strictly woven into EVERY 'Prompts'.

    FORMULA: [STYLE SPECS] + [SCENE ACTION] + [SET/LOCATION VISUALS] + [CHARACTER VISUALS] + [LIGHTING & CAMERA].
    
    Rules:
    1. Match the scene 'location' to a 'set' in the context if possible, and use that set's description.
    2. Match scene 'characters' to 'character' profiles.
    3. Ensure consistent visual language across all prompts.
    
    Style Context: ${JSON.stringify(context.style)}
    Character Context: ${JSON.stringify(context.characters)}
    Set/Location Context: ${JSON.stringify(context.sets)}
    Scenes: ${JSON.stringify(context.scenes)}

    Return a JSON array of prompts.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneId: { type: Type.INTEGER },
            promptText: { type: Type.STRING },
            technicalSpecs: { type: Type.STRING },
            negativePrompt: { type: Type.STRING }
          },
          required: ["sceneId", "promptText", "technicalSpecs"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

// --- Video Generation (Veo) ---

export const generateVideo = async (promptText: string, aspectRatio: string = '16:9'): Promise<string> => {
  // Fix: Re-initialize GoogleGenAI to ensure updated API key usage as per guidelines
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  console.log("Starting video generation with prompt:", promptText.substring(0, 50) + "...", "Ratio:", aspectRatio);

  let operation = await veoAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: promptText,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio as any
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000)); 
    operation = await veoAi.operations.getVideosOperation({operation: operation});
  }

  if (operation.error) {
    throw new Error(`Video generation failed: ${operation.error.message || 'Unknown error'}`);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("No video URI returned from the API.");
  }

  return `${videoUri}&key=${process.env.API_KEY}`;
};
