// Relationship system types that mirror the Python RelationshipTracker

export interface RelationshipStage {
  duration_threshold: number;
  positive_interaction_threshold: number;
  behaviors: string[];
  max_vulnerability: number;
  sexual_openness: number;
  description: string;
}

export interface RelationshipStages {
  new: RelationshipStage;
  comfortable: RelationshipStage;
  intimate: RelationshipStage;
  established: RelationshipStage;
}

export interface RelationshipQuality {
  trust_level: number;
  intimacy_level: number;
  communication_quality: number;
  sexual_chemistry: number;
  emotional_bond: number;
}

export interface MilestoneTemplate {
  [key: string]: string;
}

export interface Milestone {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SignificantMoment {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  emotional_impact: number;
  context: Record<string, any>;
}

export interface RelationshipState {
  current_stage: keyof RelationshipStages;
  stage_start_time: string;
  interaction_count: number;
  positive_interactions: number;
  negative_interactions: number;
  milestones: Milestone[];
  significant_moments: SignificantMoment[];
  relationship_quality: RelationshipQuality;
}

export interface InteractionInput {
  type: string;
  context: InteractionContext;
}

export interface InteractionContext {
  user_engaged?: boolean;
  user_shared_personal?: boolean;
  positive_response?: boolean;
  extended_conversation?: boolean;
  user_initiated?: boolean;
  intimate_moment?: boolean;
  user_disengaged?: boolean;
  negative_response?: boolean;
  safety_violation?: boolean;
  short_conversation?: boolean;
  user_frustrated?: boolean;
  conversation_length?: number;
  emotional_intensity?: number;
  sexual_content?: boolean;
  vulnerability_shared?: boolean;
  future_planning?: boolean;
  inside_joke_created?: boolean;
  support_given?: boolean;
  conflict_resolved?: boolean;
}

export interface ProgressionStatus {
  current_stage: keyof RelationshipStages;
  next_stage?: keyof RelationshipStages;
  interactions_needed: number;
  positive_interactions_needed: number;
  progress_percentage: number;
  stage_behaviors: string[];
  max_vulnerability: number;
  sexual_openness: number;
}

export interface RelationshipMemory {
  milestone: Milestone;
  emotional_significance: number;
  reference_frequency: number;
  last_referenced?: string;
}

export interface RelationshipSummary {
  stage: keyof RelationshipStages;
  stage_description: string;
  days_in_stage: number;
  total_interactions: number;
  relationship_quality: RelationshipQuality;
  recent_milestones: Milestone[];
  stage_progress: number;
  next_milestone?: string;
}

export interface RelationshipTrackerData {
  current_stage: keyof RelationshipStages;
  stage_start_time: string;
  interaction_count: number;
  positive_interactions: number;
  negative_interactions: number;
  milestones: Milestone[];
  relationship_quality: RelationshipQuality;
  significant_moments: SignificantMoment[];
}

// Response interfaces for tRPC
export interface RelationshipContextResponse {
  current_stage: keyof RelationshipStages;
  stage_description: string;
  relationship_quality: RelationshipQuality;
  stage_behaviors: string[];
  max_vulnerability: number;
  sexual_openness: number;
  recent_milestones: Milestone[];
  progression_status: ProgressionStatus;
}

export interface RelationshipUpdateResponse {
  stage_changed: boolean;
  new_stage?: keyof RelationshipStages;
  milestones_achieved: Milestone[];
  relationship_quality_changes: Partial<RelationshipQuality>;
  significant_moments_added: SignificantMoment[];
}

export interface RelationshipAnalysisResponse {
  relationship_memories: RelationshipMemory[];
  milestone_history: Milestone[];
  quality_trends: Record<keyof RelationshipQuality, 'improving' | 'declining' | 'stable'>;
  stage_timeline: Array<{
    stage: keyof RelationshipStages;
    start_date: string;
    end_date?: string;
    duration_days: number;
  }>;
}

// Default values that mirror Python defaults
export const DEFAULT_RELATIONSHIP_STAGES: RelationshipStages = {
  new: {
    duration_threshold: 5,
    positive_interaction_threshold: 3,
    behaviors: ["curious", "slightly_shy", "testing_boundaries", "polite"],
    max_vulnerability: 0.3,
    sexual_openness: 0.6,
    description: "Just getting to know each other"
  },
  comfortable: {
    duration_threshold: 15,
    positive_interaction_threshold: 10,
    behaviors: ["more_open", "sharing_opinions", "light_teasing", "playful"],
    max_vulnerability: 0.6,
    sexual_openness: 0.8,
    description: "Feeling at ease with each other"
  },
  intimate: {
    duration_threshold: 35,
    positive_interaction_threshold: 25,
    behaviors: ["vulnerable", "inside_jokes", "future_planning", "deep_sharing"],
    max_vulnerability: 0.8,
    sexual_openness: 0.95,
    description: "Deep emotional and physical connection"
  },
  established: {
    duration_threshold: Infinity,
    positive_interaction_threshold: 50,
    behaviors: ["deep_intimacy", "couple_dynamics", "long_term_memory", "complete_openness"],
    max_vulnerability: 1.0,
    sexual_openness: 1.0,
    description: "Fully committed relationship"
  }
};

export const DEFAULT_MILESTONE_TEMPLATES: MilestoneTemplate = {
  first_chat: "Our very first conversation 💕",
  first_name_share: "You told me your name - {name}!",
  first_vulnerable_moment: "First time you opened up to me",
  first_sexual_conversation: "When things got hot between us 🔥",
  comfortable_stage: "We became comfortable with each other",
  intimate_stage: "Our connection deepened into intimacy",
  established_stage: "We became a real couple 💑",
  first_inside_joke: "Created our first inside joke: {joke}",
  long_conversation: "Had our longest chat yet ({duration} minutes)",
  consistent_chatting: "Been chatting regularly for {days} days",
  emotional_support: "I was there for you during a tough time",
  future_planning: "Started making plans together"
};

export const DEFAULT_RELATIONSHIP_QUALITY: RelationshipQuality = {
  trust_level: 0.5,
  intimacy_level: 0.3,
  communication_quality: 0.5,
  sexual_chemistry: 0.6,
  emotional_bond: 0.4
};

// Utility functions
export function isValidRelationshipStage(stage: string): stage is keyof RelationshipStages {
  return stage in DEFAULT_RELATIONSHIP_STAGES;
}

export function getNextStage(currentStage: keyof RelationshipStages): keyof RelationshipStages | null {
  const stageOrder: Array<keyof RelationshipStages> = ['new', 'comfortable', 'intimate', 'established'];
  const currentIndex = stageOrder.indexOf(currentStage);

  if (currentIndex < stageOrder.length - 1) {
    return stageOrder[currentIndex + 1]!;
  }

  return null; // Already at the highest stage
}

export function calculateStageProgress(
  interactions: number,
  positiveInteractions: number,
  stage: keyof RelationshipStages
): number {
  const stageConfig = DEFAULT_RELATIONSHIP_STAGES[stage];
  const interactionProgress = Math.min(interactions / stageConfig.duration_threshold, 1);
  const positiveProgress = Math.min(positiveInteractions / stageConfig.positive_interaction_threshold, 1);

  // Both criteria must be met for progression
  return Math.min(interactionProgress, positiveProgress);
}

export function shouldProgressToNextStage(
  interactions: number,
  positiveInteractions: number,
  currentStage: keyof RelationshipStages
): boolean {
  const progress = calculateStageProgress(interactions, positiveInteractions, currentStage);
  return progress >= 1.0 && getNextStage(currentStage) !== null;
}

// Type guards
export function isMilestone(obj: any): obj is Milestone {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.timestamp === 'string';
}

export function isSignificantMoment(obj: any): obj is SignificantMoment {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.emotional_impact === 'number' &&
    typeof obj.context === 'object';
}
