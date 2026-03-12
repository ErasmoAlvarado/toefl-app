import { Database } from "./database.types";

export type ListeningType = Database["public"]["Enums"]["listening_type"];
export type AccentTag = "en-US" | "en-GB" | "en-AU";

export interface ListeningQuestion {
  id: string;
  text: string;
  type: string; // 'Choose a Response', 'Detail', 'Inference', etc.
  options: string[];
  correctAnswer: string; // matches one option exactly
  explanation: string;
}

export interface ListeningMaterial {
  id: string; // UUID
  title: string;
  audio_url: string | null;
  transcript: string | null;
  type: ListeningType;
  topic_category: string | null;
  difficulty: number | null; // 1-5
  is_ai_generated: boolean;
  duration_seconds: number | null;
  created_at: string;
  
  // Custom parsed questions list
  questions: ListeningQuestion[];
  
  // For 'Listen and Choose a Response', the transcript is NOT shown, but we can store it here.
  // We may also store the accent tag in the transcript or metadata if needed.
  accent?: AccentTag; 
}

// AI Generation Expected Objects
export interface GeneratedChooseResponse {
  audio_prompt_text: string;
  options: string[];
  correct_option: string;
  explanation: string;
  accent_tag: AccentTag;
}

export interface GeneratedTrack {
  transcript: string;
  questions: Omit<ListeningQuestion, "id">[];
}

export interface GeneratedListeningContent {
  choose_responses: GeneratedChooseResponse[];
  conversations: GeneratedTrack[];
  announcements: GeneratedTrack[];
  academic_talks: GeneratedTrack[];
  mst_plan: {
    router: string[];
    upper: string[];
    lower: string[];
    tryout_items: string[];
  };
}
