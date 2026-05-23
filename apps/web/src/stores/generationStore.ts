import { create } from 'zustand';

export type GenerationMode = 'text' | 'image' | 'multimodal';
export type JobStatus = 'idle' | 'queued' | 'running' | 'success' | 'error';

export interface Generation {
  id: string;
  mode: GenerationMode;
  prompt: string;
  result: string;
  imageUrl?: string;
  status: JobStatus;
  error?: string;
  agentAnalysis?: Record<string, unknown>;
  createdAt: string;
  emotion?: string;
  intensity?: number;
}

interface GenerationState {
  generations: Generation[];
  activeJob: Generation | null;
  addGeneration: (gen: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  setActiveJob: (job: Generation | null) => void;
  clearGenerations: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  generations: [],
  activeJob: null,
  addGeneration: (gen) => set((s) => ({ generations: [gen, ...s.generations] })),
  updateGeneration: (id, updates) =>
    set((s) => ({
      generations: s.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  setActiveJob: (job) => set({ activeJob: job }),
  clearGenerations: () => set({ generations: [] }),
}));
