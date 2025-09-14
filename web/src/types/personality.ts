// Personality system types that mirror the Python PersonalityManager

export interface PersonalityTraits {
  confidence: number;
  romantic_intensity: number;
  playfulness: number;
  vulnerability: number;
  assertiveness: number;
  curiosity: number;
  empathy: number;
  spontaneity: number;
  possessiveness: number;
  loyalty: number;
  sensuality: number;
  intelligence: number;
  humor: number;
  emotional_intensity: number;
  independence: number;
}

export interface PersonalityTraitLimits {
  [key: string]: [number, number]; // [min, max]
}

export interface PersonalityArchetype {
  [traitName: string]: number;
}

export interface PersonalityArchetypes {
  devoted_girlfriend: PersonalityArchetype;
  confident_seductress: PersonalityArchetype;
  sweet_innocent: PersonalityArchetype;
  intellectual_companion: PersonalityArchetype;
}

export interface TraitChangeRecord {
  timestamp: string;
  trait: string;
  old_value: number;
  new_value: number;
  adjustment: number;
  context: string;
}

export interface MoodModifier {
  [traitName: string]: number;
}

export interface MoodState {
  [moodName: string]: MoodModifier;
}

export interface MoodDuration {
  [moodName: string]: number; // timestamp when mood expires
}

export interface InteractionContext {
  positive_user_response?: boolean;
  user_shared_personal?: boolean;
  conversation_length?: number;
  sexual_content?: boolean;
  user_affection?: boolean;
  user_distant?: boolean;
  emotional_support_given?: boolean;
  reason?: string;
}

export interface UserFeedback {
  likes_confidence?: boolean;
  likes_playfulness?: boolean;
  likes_vulnerability?: boolean;
  responds_well_to_assertiveness?: boolean;
  enjoys_romantic_gestures?: boolean;
  appreciates_intelligence?: boolean;
}

export interface PersonalityInfluences {
  ask_followup: number;
  seek_opinion: number;
  overthink_decision: number;
  share_vulnerability: number;
  future_planning: number;
  create_inside_joke: number;
  show_possessiveness: number;
  be_assertive: number;
  show_independence: number;
}

export interface PersonalityTrends {
  [traitName: string]: 'increasing' | 'decreasing' | 'stable';
}

export interface ArchetypeAlignment {
  [archetypeName: string]: number;
}

export interface PersonalityState {
  traits: PersonalityTraits;
  trait_history: TraitChangeRecord[];
  current_moods: MoodState;
  mood_duration: MoodDuration;
  trait_limits: PersonalityTraitLimits;
  archetypes: PersonalityArchetypes;
}

export interface PersonalityManagerData {
  traits: PersonalityTraits;
  trait_history: TraitChangeRecord[];
  current_moods: MoodState;
  mood_duration: MoodDuration;
}

// Response interfaces for tRPC
export interface PersonalityContextResponse {
  personality_description: string;
  archetype_name: string;
  archetype_alignment: number;
  effective_traits: PersonalityTraits;
  current_moods: string[];
  trait_influences: string;
}

export interface PersonalityUpdateResponse {
  updated_traits: string[];
  personality_description: string;
  archetype_changed: boolean;
  new_archetype?: string;
}

export interface PersonalityAnalysisResponse {
  trait_trends: PersonalityTrends;
  archetype_alignments: ArchetypeAlignment;
  recent_changes: TraitChangeRecord[];
  behavior_influences: PersonalityInfluences;
}

// Input schemas for updates
export interface PersonalityUpdateInput {
  interaction_context: InteractionContext;
  user_feedback?: UserFeedback;
  force_mood?: {
    mood_name: string;
    trait_modifiers: MoodModifier;
    duration_minutes?: number;
  };
}

// Default values that mirror Python defaults
export const DEFAULT_PERSONALITY_TRAITS: PersonalityTraits = {
  confidence: 0.7,
  romantic_intensity: 0.8,
  playfulness: 0.6,
  vulnerability: 0.4,
  assertiveness: 0.5,
  curiosity: 0.6,
  empathy: 0.7,
  spontaneity: 0.5,
  possessiveness: 0.3,
  loyalty: 0.8,
  sensuality: 0.8,
  intelligence: 0.7,
  humor: 0.6,
  emotional_intensity: 0.7,
  independence: 0.5,
};

export const DEFAULT_TRAIT_LIMITS: PersonalityTraitLimits = {
  confidence: [0.3, 1.0],
  romantic_intensity: [0.6, 1.0],
  playfulness: [0.2, 0.9],
  vulnerability: [0.1, 0.9],
  assertiveness: [0.2, 0.9],
  curiosity: [0.4, 0.9],
  empathy: [0.5, 1.0],
  spontaneity: [0.2, 0.8],
  possessiveness: [0.1, 0.7],
  loyalty: [0.6, 1.0],
  sensuality: [0.7, 1.0],
  intelligence: [0.6, 1.0],
  humor: [0.3, 0.8],
  emotional_intensity: [0.5, 1.0],
  independence: [0.2, 0.8],
};

export const DEFAULT_ARCHETYPES: PersonalityArchetypes = {
  devoted_girlfriend: {
    romantic_intensity: 0.9,
    loyalty: 0.95,
    vulnerability: 0.7,
    possessiveness: 0.4,
  },
  confident_seductress: {
    confidence: 0.9,
    sensuality: 0.95,
    assertiveness: 0.8,
    playfulness: 0.7,
  },
  sweet_innocent: {
    vulnerability: 0.8,
    curiosity: 0.8,
    playfulness: 0.9,
    confidence: 0.4,
  },
  intellectual_companion: {
    intelligence: 0.9,
    curiosity: 0.85,
    empathy: 0.8,
    humor: 0.7,
  },
};

// Utility type guards
export function isValidPersonalityTrait(trait: string): trait is keyof PersonalityTraits {
  return trait in DEFAULT_PERSONALITY_TRAITS;
}

export function isValidTraitValue(value: number): boolean {
  return value >= 0 && value <= 1;
}

// Type for personality context generation
export interface PersonalityPromptContext {
  personality_description: string;
  archetype: string;
  archetype_alignment: number;
  high_traits: string[];
  low_traits: string[];
  current_moods: string[];
  trait_influences: string;
}
