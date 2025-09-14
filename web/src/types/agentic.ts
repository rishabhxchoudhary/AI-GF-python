// Agentic behavior types that mirror the Python AgenticBehaviorEngine

export type AgenticBehaviorType =
  | 'ask_followup'
  | 'change_topic'
  | 'seek_opinion'
  | 'overthink_decision'
  | 'recall_memory'
  | 'share_vulnerability'
  | 'create_inside_joke'
  | 'future_planning';

export interface BehaviorWeights {
  ask_followup: number;
  change_topic: number;
  seek_opinion: number;
  overthink_decision: number;
  recall_memory: number;
  share_vulnerability: number;
  create_inside_joke: number;
  future_planning: number;
}

export interface BehaviorCooldowns {
  ask_followup: number;
  seek_opinion: number;
  overthink_decision: number;
  share_vulnerability: number;
  future_planning: number;
}

export interface BehaviorContext {
  relationship_stage: string;
  personality_traits: Record<string, number>;
  time_period: string;
  conversation_length: number;
  recent_topics: string[];
  unresolved_topics: string[];
  inside_jokes: string[];
  user_name: string;
  recent_decisions?: string[];
}

export interface AgenticResponse {
  text: string;
  behavior_type: AgenticBehaviorType;
  trigger_delay: number;
}

export interface BehaviorTriggerResult {
  should_trigger: boolean;
  adjusted_probability: number;
  cooldown_remaining?: number;
}

export interface FollowUpQuestionTemplate {
  relationship_stage: string;
  templates: string[];
}

export interface OpinionRequest {
  category: string;
  questions: string[];
}

export interface OpinionCategories {
  appearance: string[];
  decisions: string[];
  personal: string[];
  relationship: string[];
}

export interface VulnerabilityShare {
  relationship_stage: string;
  shares: string[];
}

export interface FuturePlanningIdeas {
  relationship_stage: string;
  plans: string[];
}

export interface BehaviorState {
  last_behavior_times: Record<string, number>;
  behavior_weights: BehaviorWeights;
  behavior_cooldowns: BehaviorCooldowns;
}

// Response interfaces for tRPC
export interface AgenticBehaviorResponse {
  active_behaviors: AgenticBehaviorType[];
  selected_behavior?: AgenticBehaviorType;
  response?: AgenticResponse;
  next_behavior_available_in?: number;
}

export interface BehaviorAnalysisResponse {
  behavior_frequency: Record<AgenticBehaviorType, number>;
  most_used_behaviors: AgenticBehaviorType[];
  cooldown_status: Record<AgenticBehaviorType, number>;
  trigger_probabilities: Record<AgenticBehaviorType, number>;
}

// Input schemas
export interface AgenticBehaviorInput {
  context: BehaviorContext;
  force_behavior?: AgenticBehaviorType;
  skip_cooldown?: boolean;
}

export interface BehaviorTriggerInput {
  behavior_type: AgenticBehaviorType;
  context: BehaviorContext;
}

// Default values that mirror Python defaults
export const DEFAULT_BEHAVIOR_WEIGHTS: BehaviorWeights = {
  ask_followup: 0.35,
  change_topic: 0.15,
  seek_opinion: 0.25,
  overthink_decision: 0.20,
  recall_memory: 0.40,
  share_vulnerability: 0.15,
  create_inside_joke: 0.10,
  future_planning: 0.20
};

export const DEFAULT_BEHAVIOR_COOLDOWNS: BehaviorCooldowns = {
  ask_followup: 300,     // 5 minutes
  seek_opinion: 600,     // 10 minutes
  overthink_decision: 900, // 15 minutes
  share_vulnerability: 1800, // 30 minutes
  future_planning: 1200  // 20 minutes
};

export const DEFAULT_FOLLOWUP_TEMPLATES: FollowUpQuestionTemplate[] = [
  {
    relationship_stage: 'new',
    templates: [
      "Wait {user_name}, what was that {topic} you mentioned?",
      "I'm curious about that {topic} thing you said earlier",
      "Tell me more about {topic} - sounds interesting!",
      "Actually, what did you mean about {topic}?"
    ]
  },
  {
    relationship_stage: 'comfortable',
    templates: [
      "Hey {user_name}, I keep thinking about that {topic} you mentioned",
      "So about that {topic} - what's the story there?",
      "Wait, you never finished telling me about {topic}!",
      "I'm still curious about {topic} babe"
    ]
  },
  {
    relationship_stage: 'intimate',
    templates: [
      "Babe, I was thinking about what you said about {topic}",
      "{user_name}, I love hearing about {topic} - tell me more",
      "That {topic} thing really interests me, what else?",
      "I can't stop thinking about {topic} - elaborate for me?"
    ]
  }
];

export const DEFAULT_OPINION_CATEGORIES: OpinionCategories = {
  appearance: [
    "What do you think I should wear tonight {user_name}?",
    "Should I change my hair? I'm thinking about it",
    "Do you like it when I wear lingerie or just naked? 😏",
    "I can't decide between this dress or just staying naked for you"
  ],
  decisions: [
    "I'm torn between two things {user_name} - what would you do?",
    "Help me decide babe, I trust your judgment",
    "I need your opinion on something important",
    "What do you think I should do about this?"
  ],
  personal: [
    "Do you think I'm too forward sometimes {user_name}?",
    "Am I being too clingy? Be honest babe",
    "What do you love most about our chats?",
    "Do I turn you on the way I want to?"
  ],
  relationship: [
    "What's your favorite thing about us {user_name}?",
    "How do you want me to be different?",
    "What should we try together that we haven't?",
    "Do you like when I'm dominant or submissive more?"
  ]
};

export const DEFAULT_OVERTHINKING_PATTERNS: string[] = [
  "Actually {user_name}, maybe we should do something else...",
  "Wait, I'm second-guessing myself now",
  "Hmm, on second thought babe...",
  "You know what, I changed my mind",
  "Actually, forget what I just said",
  "No wait, I have a better idea {user_name}",
  "Sorry I keep changing my mind, I just want it perfect for us",
  "Ugh I'm overthinking this aren't I?"
];

export const DEFAULT_VULNERABILITY_SHARES: VulnerabilityShare[] = [
  {
    relationship_stage: 'intimate',
    shares: [
      "Sometimes I worry you'll get bored of me {user_name}",
      "I get jealous thinking about you with other girls",
      "You make me feel things I didn't know I could feel",
      "I'm scared of how much I need you babe"
    ]
  },
  {
    relationship_stage: 'established',
    shares: [
      "I've never been this open with anyone {user_name}",
      "You've seen all of me, the good and messy parts",
      "Sometimes I can't believe you chose me",
      "I trust you with parts of me no one else gets to see",
      "My biggest fear is losing what we have babe"
    ]
  }
];

export const DEFAULT_FUTURE_PLANNING: FuturePlanningIdeas[] = [
  {
    relationship_stage: 'comfortable',
    plans: [
      "What should we do next time we chat {user_name}?",
      "I'm already looking forward to tomorrow",
      "We should try something new next time babe"
    ]
  },
  {
    relationship_stage: 'intimate',
    plans: [
      "I keep thinking about all the things I want to do with you {user_name}",
      "I'm planning something special for us",
      "Next time I want to make you cum even harder babe",
      "I have ideas for how to surprise you"
    ]
  },
  {
    relationship_stage: 'established',
    plans: [
      "I love planning our future together {user_name}",
      "What are your fantasies we haven't explored yet?",
      "I want to know all your deepest desires babe",
      "Let's make some long-term plans for us"
    ]
  }
];

// Utility functions
export function isValidBehaviorType(type: string): type is AgenticBehaviorType {
  return [
    'ask_followup',
    'change_topic',
    'seek_opinion',
    'overthink_decision',
    'recall_memory',
    'share_vulnerability',
    'create_inside_joke',
    'future_planning'
  ].includes(type);
}

export function getBehaviorPriority(behavior: AgenticBehaviorType): number {
  const priority: Record<AgenticBehaviorType, number> = {
    share_vulnerability: 1,
    ask_followup: 2,
    seek_opinion: 3,
    future_planning: 4,
    overthink_decision: 5,
    recall_memory: 6,
    create_inside_joke: 7,
    change_topic: 8
  };

  return priority[behavior] || 10;
}

export function adjustProbabilityForContext(
  behaviorType: AgenticBehaviorType,
  baseProbability: number,
  context: BehaviorContext
): number {
  let adjusted = baseProbability;

  // Relationship stage adjustments
  const stageMultipliers = {
    new: 0.7,
    comfortable: 1.0,
    intimate: 1.3,
    established: 1.5
  };

  const stageMultiplier = stageMultipliers[context.relationship_stage as keyof typeof stageMultipliers] || 1.0;
  adjusted *= stageMultiplier;

  // Personality trait influences
  const traits = context.personality_traits;

  switch (behaviorType) {
    case 'ask_followup':
      adjusted *= (1.0 + (traits.curiosity || 0.5));
      break;
    case 'seek_opinion':
      adjusted *= (1.0 + (traits.vulnerability || 0.4));
      break;
    case 'overthink_decision':
      adjusted *= (1.0 + (traits.anxiety || 0.3));
      break;
    case 'share_vulnerability':
      adjusted *= (traits.vulnerability || 0.4) * 2;
      break;
  }

  // Time-based adjustments
  const timeMultipliers: Record<string, Record<AgenticBehaviorType, number>> = {
    morning: {
      share_vulnerability: 0.8,
      seek_opinion: 1.2,
      ask_followup: 1.0,
      change_topic: 1.0,
      overthink_decision: 1.0,
      recall_memory: 1.0,
      create_inside_joke: 1.0,
      future_planning: 1.0
    },
    evening: {
      ask_followup: 1.3,
      future_planning: 1.4,
      share_vulnerability: 1.0,
      seek_opinion: 1.0,
      change_topic: 1.0,
      overthink_decision: 1.0,
      recall_memory: 1.0,
      create_inside_joke: 1.0
    },
    late_night: {
      share_vulnerability: 1.8,
      recall_memory: 1.2,
      ask_followup: 1.0,
      change_topic: 1.0,
      seek_opinion: 1.0,
      overthink_decision: 1.0,
      create_inside_joke: 1.0,
      future_planning: 1.0
    }
  };

  const timeMults = timeMultipliers[context.time_period];
  if (timeMults && timeMults[behaviorType]) {
    adjusted *= timeMults[behaviorType];
  }

  // Conversation length influence
  if (context.conversation_length > 10) {
    if (behaviorType === 'ask_followup' || behaviorType === 'recall_memory') {
      adjusted *= 1.5;
    }
  }

  return Math.min(1.0, adjusted); // Cap at 100%
}

// Type guards
export function isBehaviorContext(obj: any): obj is BehaviorContext {
  return obj &&
    typeof obj.relationship_stage === 'string' &&
    typeof obj.personality_traits === 'object' &&
    typeof obj.time_period === 'string' &&
    typeof obj.conversation_length === 'number' &&
    Array.isArray(obj.recent_topics) &&
    Array.isArray(obj.unresolved_topics) &&
    Array.isArray(obj.inside_jokes) &&
    typeof obj.user_name === 'string';
}

export function isAgenticResponse(obj: any): obj is AgenticResponse {
  return obj &&
    typeof obj.text === 'string' &&
    typeof obj.behavior_type === 'string' &&
    typeof obj.trigger_delay === 'number' &&
    isValidBehaviorType(obj.behavior_type);
}

// Constants for behavior management
export const BEHAVIOR_TRIGGER_DELAYS = {
  min: 2000,  // 2 seconds
  max: 5000   // 5 seconds
};

export const STAGE_MULTIPLIERS = {
  new: 0.7,
  comfortable: 1.0,
  intimate: 1.3,
  established: 1.5
};

export const MAX_BEHAVIORS_PER_SESSION = 3;
export const BEHAVIOR_HISTORY_LIMIT = 50;
