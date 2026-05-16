import { create } from 'zustand';

interface Generation {
  id: string;
  prompt: string;
  result: string;
  status: 'idle' | 'running' | 'success' | 'error';
  createdAt: string;
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
