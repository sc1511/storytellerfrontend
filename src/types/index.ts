// Story Types
export interface StoryChoice {
  label: string;
  description: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct_answer: number; // Index of the correct option (0-based)
}

export interface AdvancedVocabularyWord {
  word: string;
  definition: string;
}

export interface StoryMetrics {
  vocabulary: {
    total_word_count: number;
    unique_words: number;
    diversity_score: number;
    advanced_vocabulary: string[] | AdvancedVocabularyWord[];
    reading_level: string;
  };
  creativity: {
    originality_score: number;
    character_development_depth: number;
    plot_complexity: 'simple' | 'moderate' | 'complex';
    sensory_language_density: string;
  };
  educational: string[];
}

export interface StoryMetadata {
  child_name: string;
  character: string;
  setting: string;
  object: string;
  language: 'en' | 'nl';
  age: string;
}

export interface StoryResponse {
  success: boolean;
  message: string;
  session_id: string;
  story_id: string;
  story: string;
  story_sequence: number;
  is_conclusion: boolean;
  next_choices: StoryChoice[];
  comprehension_questions?: ComprehensionQuestion[];
  metrics: StoryMetrics;
  metadata: StoryMetadata;
  timestamp: string;
}

// Story Session
export interface StorySession {
  session_id: string;
  story_segments: StorySegment[];
  metadata: StoryMetadata;
  created_at: string;
  completed: boolean;
}

export interface StorySegment {
  sequence: number;
  story_text: string;
  choice_made?: string;
  next_choices: StoryChoice[];
  comprehension_questions?: ComprehensionQuestion[];
  metrics: StoryMetrics;
  animationFile?: object | null; // Lottie animation data
}

// Child Profile
export interface AvatarCustomization {
  avatarId: string; // ID van de gekozen avatar (bijv. 'avatar4')
  // Optionele customization velden voor toekomstige uitbreiding
  skinColor?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  accessories?: string[];
}

export interface ChildProfile {
  id: string;
  name: string; // Original name from parent - used for login validation
  displayName?: string; // Name chosen by child for stories (optional)
  age: string;
  avatar: string; // Emoji fallback
  avatarCustomization?: AvatarCustomization; // Custom avatar data
  language: 'en' | 'nl';
  reading_level?: string;
  created_at: string;
  total_stories: number;
  favorite_character?: string;
}

// Parent Dashboard
export interface ParentDashboardData {
  child_profiles: ChildProfile[];
  recent_stories: StorySession[];
  aggregate_metrics: {
    total_stories: number;
    total_reading_time: number;
    average_vocabulary_score: number;
    reading_progress: ReadingProgress[];
  };
}

export interface ReadingProgress {
  date: string;
  stories_read: number;
  vocabulary_score: number;
}

