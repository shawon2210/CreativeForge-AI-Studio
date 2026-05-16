export interface World {
  id: number;
  name: string;
  description: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Character {
  id: number;
  name: string;
  description: string;
  traits: Record<string, any>;
  world_id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  event_date: Date;
  world_id: number;
  related_character_ids: number[];
  related_location_ids: number[];
  user_id: string;
}

export interface LoreEntry {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  world_id: number;
  user_id: string;
}
