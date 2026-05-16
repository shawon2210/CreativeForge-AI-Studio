export interface StyleDNA {
  id: number;
  user_id: string;
  style_fingerprint: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface StyleMutation {
  id: number;
  user_id: string;
  original_dna: Record<string, any>;
  mutated_dna: Record<string, any>;
  mutation_type: string;
  generation_id?: number;
  created_at: Date;
}

export interface StyleEvolution {
  id: number;
  user_id: string;
  generation_id: number;
  style_dna: Record<string, any>;
  evolution_score: number;
  feedback: string;
  created_at: Date;
}
