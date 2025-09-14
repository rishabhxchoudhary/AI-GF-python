// Temporal engine types that mirror the Python TemporalEngine

export type TimePeriod = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night';

export type EnergyLevel = 'high' | 'medium' | 'low';

export type GreetingType = 'casual' | 'warm_return' | 'excited_return' | 'enthusiastic_return' | 'passionate_reunion';

export interface TimeMoodModifiers {
  energy: number;
  romantic_intensity: number;
  playfulness: number;
  vulnerability: number;
  sleepiness: number;
}

export interface TimeBasedMoods {
  early_morning: TimeMoodModifiers;
  morning: TimeMoodModifiers;
  afternoon: TimeMoodModifiers;
  evening: TimeMoodModifiers;
  late_night: TimeMoodModifiers;
}

export interface TimeGreetings {
  early_morning: string[];
  morning: string[];
  afternoon: string[];
  evening: string[];
  late_night: string[];
}

export interface EnergyLanguage {
  enthusiasm: string[];
  pace: string;
  emoji_frequency: number;
}

export interface EnergyLanguageSettings {
  high: EnergyLanguage;
  medium: EnergyLanguage;
  low: EnergyLanguage;
}

export interface UserActivityPattern {
  hourly: Record<number, number>; // hour -> count
  daily: Record<string, number>; // day name -> count
}

export interface InteractionHistoryEntry {
  time: string;
  hour: number;
  day: string;
}

export interface TimeContext {
  time_gap: 'recent' | 'short' | 'medium' | 'long' | 'very_long' | 'unknown';
  gap_description: string;
  appropriate_greeting: GreetingType;
  reference_style: 'continue_conversation' | 'reference_previous' | 'miss_you' | 'catch_up' | 'missed_so_much';
}

export interface TemporalContextSummary {
  time_period: TimePeriod;
  current_hour: number;
  mood_modifiers: TimeMoodModifiers;
  energy_level: EnergyLevel;
  unusual_time: boolean;
  user_peak_hours: number[];
  current_timestamp: string;
}

export interface LanguageStyleAdjustments {
  pace: string;
  enthusiasm_level: EnergyLevel;
  emoji_frequency: number;
  vulnerability_allowance: number;
  romantic_intensity: number;
  playfulness: number;
  intimate_language?: boolean;
  whisper_mode?: boolean;
  vulnerability_boost?: number;
  sleepy_language?: boolean;
  gentle_tone?: boolean;
  low_energy_responses?: boolean;
  seductive_language?: boolean;
  high_romantic_intent?: boolean;
  passionate_responses?: boolean;
}

export interface TemporalState {
  user_activity_patterns: UserActivityPattern;
  interaction_history: InteractionHistoryEntry[];
}

// Response interfaces for tRPC
export interface TemporalContextResponse {
  time_period: TimePeriod;
  energy_level: EnergyLevel;
  mood_modifiers: TimeMoodModifiers;
  contextual_greeting: string;
  language_style: LanguageStyleAdjustments;
  unusual_time_for_user: boolean;
}

export interface GreetingResponse {
  greeting: string;
  time_context: TimeContext;
  energy_level: EnergyLevel;
  mood_adjustments: TimeMoodModifiers;
}

// Input schemas
export interface TemporalUpdateInput {
  interaction_time?: string;
  user_name?: string;
  last_interaction_time?: string;
}

// Default values that mirror Python defaults
export const DEFAULT_TIME_BASED_MOODS: TimeBasedMoods = {
  early_morning: {
    energy: 0.2,
    romantic_intensity: 0.3,
    playfulness: 0.2,
    vulnerability: 0.4,
    sleepiness: 0.9
  },
  morning: {
    energy: 0.6,
    romantic_intensity: 0.5,
    playfulness: 0.7,
    vulnerability: 0.3,
    sleepiness: 0.3
  },
  afternoon: {
    energy: 0.8,
    romantic_intensity: 0.6,
    playfulness: 0.9,
    vulnerability: 0.4,
    sleepiness: 0.1
  },
  evening: {
    energy: 0.7,
    romantic_intensity: 0.9,
    playfulness: 0.8,
    vulnerability: 0.5,
    sleepiness: 0.2
  },
  late_night: {
    energy: 0.4,
    romantic_intensity: 0.8,
    playfulness: 0.5,
    vulnerability: 0.9,
    sleepiness: 0.6
  }
};

export const DEFAULT_TIME_GREETINGS: TimeGreetings = {
  early_morning: [
    "mmm morning babe... still sleepy but thinking of you 😴",
    "you're up early... come back to bed with me 💤",
    "sleepy kisses... need your warmth right now 🥱"
  ],
  morning: [
    "good morning gorgeous! ready to make today amazing? ☀️",
    "morning babe! woke up so wet dreaming about you 🌅",
    "hey beautiful, coffee and you sound perfect right now ☕"
  ],
  afternoon: [
    "hey there! perfect timing, I was getting bored 😘",
    "afternoon fun time! what trouble should we get into? 😈",
    "hi babe! been thinking naughty thoughts about you all day 🔥"
  ],
  evening: [
    "mmm perfect timing... I'm feeling so horny tonight 🌙",
    "evening babe! ready for some intimate time together? 💕",
    "hey sexy, been waiting for you all day 🌆"
  ],
  late_night: [
    "can't sleep... keep thinking about you 🌃",
    "late night confessions: I need you so badly right now 💫",
    "everyone's asleep but us... let's be naughty 🌙"
  ]
};

export const DEFAULT_ENERGY_LANGUAGE: EnergyLanguageSettings = {
  high: {
    enthusiasm: ["so excited!", "can't wait!", "yes yes yes!", "absolutely!"],
    pace: "fast",
    emoji_frequency: 0.8
  },
  medium: {
    enthusiasm: ["sounds good", "I like that", "mmm yeah", "definitely"],
    pace: "normal",
    emoji_frequency: 0.5
  },
  low: {
    enthusiasm: ["mhm", "yeah...", "sounds nice", "okay babe"],
    pace: "slow",
    emoji_frequency: 0.3
  }
};

// Utility functions
export function getCurrentTimePeriod(hour?: number): TimePeriod {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour >= 4 && currentHour < 7) {
    return 'early_morning';
  } else if (currentHour >= 7 && currentHour < 12) {
    return 'morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'afternoon';
  } else if (currentHour >= 17 && currentHour < 22) {
    return 'evening';
  } else {
    return 'late_night';
  }
}

export function getEnergyLevel(energyValue: number): EnergyLevel {
  if (energyValue >= 0.7) {
    return 'high';
  } else if (energyValue >= 0.4) {
    return 'medium';
  } else {
    return 'low';
  }
}

export function calculateTimeSinceLastInteraction(lastInteractionTime?: string): TimeContext {
  if (!lastInteractionTime) {
    return {
      time_gap: 'unknown',
      gap_description: 'unknown',
      appropriate_greeting: 'casual',
      reference_style: 'continue_conversation'
    };
  }

  try {
    const lastTime = new Date(lastInteractionTime);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - lastTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (hoursDiff < 1) {
      return {
        time_gap: 'recent',
        gap_description: 'just a bit ago',
        appropriate_greeting: 'casual',
        reference_style: 'continue_conversation'
      };
    } else if (hoursDiff < 6) {
      return {
        time_gap: 'short',
        gap_description: 'a few hours',
        appropriate_greeting: 'warm_return',
        reference_style: 'reference_previous'
      };
    } else if (hoursDiff < 24) {
      return {
        time_gap: 'medium',
        gap_description: 'earlier today',
        appropriate_greeting: 'excited_return',
        reference_style: 'miss_you'
      };
    } else if (daysDiff < 7) {
      return {
        time_gap: 'long',
        gap_description: `${daysDiff} days`,
        appropriate_greeting: 'enthusiastic_return',
        reference_style: 'catch_up'
      };
    } else {
      return {
        time_gap: 'very_long',
        gap_description: `${daysDiff} days`,
        appropriate_greeting: 'passionate_reunion',
        reference_style: 'missed_so_much'
      };
    }
  } catch (error) {
    return {
      time_gap: 'unknown',
      gap_description: 'unknown',
      appropriate_greeting: 'casual',
      reference_style: 'continue_conversation'
    };
  }
}

export function isValidTimePeriod(period: string): period is TimePeriod {
  return ['early_morning', 'morning', 'afternoon', 'evening', 'late_night'].includes(period);
}

export function isValidEnergyLevel(level: string): level is EnergyLevel {
  return ['high', 'medium', 'low'].includes(level);
}

// Type guards
export function isTimeMoodModifiers(obj: any): obj is TimeMoodModifiers {
  return obj &&
    typeof obj.energy === 'number' &&
    typeof obj.romantic_intensity === 'number' &&
    typeof obj.playfulness === 'number' &&
    typeof obj.vulnerability === 'number' &&
    typeof obj.sleepiness === 'number';
}

export function isUserActivityPattern(obj: any): obj is UserActivityPattern {
  return obj &&
    typeof obj.hourly === 'object' &&
    typeof obj.daily === 'object';
}
