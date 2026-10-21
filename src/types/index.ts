export interface Hairstyle {
  id: string;
  name: string;
  category: 'fades' | 'crops' | 'classic' | 'modern' | 'textured' | 'buzz';
  categoryLabel: string;
  description: string;
  imageUrl: string;
  tags: string[];
  maintenance: 'Low' | 'Medium' | 'High';
  faceShape: string[];
  promptDescription: string;
  popular?: boolean;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  originalImage: string;
  generatedImage: string;
  hairstyle: Hairstyle;
  notes?: string;
}

export type TabType = 'home' | 'chat' | 'explore' | 'studio' | 'history' | 'profile';

export type GenerationStatus =
  | 'idle'
  | 'preparing'
  | 'analyzing'
  | 'generating'
  | 'polishing'
  | 'done'
  | 'error';

export interface GenerateHairstyleRequest {
  image: string; // base64 data url or raw base64 (client photo)
  hairstyleId?: string;
  referenceImage?: string; // base64 data url or url (hairstyle reference)
  customNotes?: string;
  customPrompt?: string;
}

export interface GenerateHairstyleResponse {
  success: boolean;
  image?: string;
  mimeType?: string;
  error?: string;
  code?: string;
  debugPrompt?: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
}
