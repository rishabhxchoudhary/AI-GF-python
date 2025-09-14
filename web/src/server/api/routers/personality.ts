import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import {
  type PersonalityTraits,
  type PersonalityState,
  type InteractionContext,
  type PersonalityContextResponse,
  type PersonalityUpdateResponse,
  type PersonalityAnalysisResponse,
  DEFAULT_PERSONALITY_TRAITS,
  DEFAULT_TRAIT_LIMITS,
  DEFAULT_ARCHETYPES,
  isValidPersonalityTrait,
  isValidTraitValue,
} from "~/types/personality";

// Input validation schemas
const InteractionContextSchema = z.object({
  positive_user_response: z.boolean().optional(),
  user_shared_personal: z.boolean().optional(),
  conversation_length: z.number().optional(),
  sexual_content: z.boolean().optional(),
  user_affection: z.boolean().optional(),
  user_distant: z.boolean().optional(),
  emotional_support_given: z.boolean().optional(),
  reason: z.string().optional(),
});

const PersonalityUpdateInputSchema = z.object({
  interaction_context: InteractionContextSchema,
  force_mood: z
    .object({
      mood_name: z.string(),
      trait_modifiers: z.record(z.number()),
      duration_minutes: z.number().default(60),
    })
    .optional(),
});

const TraitAdjustmentSchema = z.object({
  trait_name: z.string().refine(isValidPersonalityTrait),
  adjustment: z.number(),
  context: z.record(z.any()),
});

export class PersonalityManager {
  private traits: PersonalityTraits;
  private trait_history: any[];
  private current_moods: Record<string, Record<string, number>>;
  private mood_duration: Record<string, number>;
  private trait_limits: Record<string, [number, number]>;
  private archetypes: typeof DEFAULT_ARCHETYPES;

  constructor(data?: any) {
    this.traits = data?.traits || { ...DEFAULT_PERSONALITY_TRAITS };
    this.trait_history = data?.trait_history || [];
    this.current_moods = data?.current_moods || {};
    this.mood_duration = data?.mood_duration || {};
    this.trait_limits = DEFAULT_TRAIT_LIMITS;
    this.archetypes = DEFAULT_ARCHETYPES;
  }

  updateTraitsFromInteraction(interactionContext: InteractionContext): string[] {
    const traitAdjustments: Record<string, number> = {};
    const updatedTraits: string[] = [];

    // Positive user responses boost confidence and romantic intensity
    if (interactionContext.positive_user_response) {
      traitAdjustments.confidence = 0.01;
      traitAdjustments.romantic_intensity = 0.01;
    }

    // User sharing personal info increases empathy and vulnerability
    if (interactionContext.user_shared_personal) {
      traitAdjustments.empathy = 0.02;
      traitAdjustments.vulnerability = 0.015;
    }

    // Extended conversations boost curiosity and intelligence
    if (interactionContext.conversation_length && interactionContext.conversation_length > 20) {
      traitAdjustments.curiosity = 0.01;
      traitAdjustments.intelligence = 0.005;
    }

    // Sexual content increases sensuality
    if (interactionContext.sexual_content) {
      traitAdjustments.sensuality = 0.01;
      traitAdjustments.playfulness = 0.01;
    }

    // User showing affection increases loyalty and romantic intensity
    if (interactionContext.user_affection) {
      traitAdjustments.loyalty = 0.01;
      traitAdjustments.romantic_intensity = 0.015;
    }

    // User being distant decreases confidence, increases possessiveness
    if (interactionContext.user_distant) {
      traitAdjustments.confidence = -0.01;
      traitAdjustments.possessiveness = 0.02;
      traitAdjustments.vulnerability = 0.01;
    }

    // Emotional support given increases empathy
    if (interactionContext.emotional_support_given) {
      traitAdjustments.empathy = 0.02;
      traitAdjustments.emotional_intensity = 0.01;
    }

    // Apply adjustments
    for (const [trait, adjustment] of Object.entries(traitAdjustments)) {
      if (this.adjustTrait(trait, adjustment, interactionContext)) {
        updatedTraits.push(trait);
      }
    }

    return updatedTraits;
  }

  private adjustTrait(traitName: string, adjustment: number, context: InteractionContext): boolean {
    if (!isValidPersonalityTrait(traitName)) return false;

    const oldValue = this.traits[traitName];
    let newValue = oldValue + adjustment;

    // Apply limits
    const [minVal, maxVal] = this.trait_limits[traitName] || [0.0, 1.0];
    newValue = Math.max(minVal, Math.min(maxVal, newValue));

    // Only update if there's a meaningful change
    if (Math.abs(newValue - oldValue) > 0.005) {
      this.traits[traitName] = newValue;

      // Record the change
      this.trait_history.push({
        timestamp: new Date().toISOString(),
        trait: traitName,
        old_value: Math.round(oldValue * 1000) / 1000,
        new_value: Math.round(newValue * 1000) / 1000,
        adjustment: Math.round(adjustment * 1000) / 1000,
        context: context.reason || "interaction",
      });

      // Keep history limited
      if (this.trait_history.length > 100) {
        this.trait_history = this.trait_history.slice(-100);
      }

      return true;
    }

    return false;
  }

  setTemporaryMood(
    moodName: string,
    traitModifiers: Record<string, number>,
    durationMinutes: number = 60
  ): void {
    this.current_moods[moodName] = traitModifiers;
    this.mood_duration[moodName] = Date.now() + durationMinutes * 60 * 1000;
  }

  getEffectiveTraits(): PersonalityTraits {
    const effectiveTraits = { ...this.traits };
    const currentTime = Date.now();
    const expiredMoods: string[] = [];

    // Apply temporary mood modifiers
    for (const [moodName, modifiers] of Object.entries(this.current_moods)) {
      if (currentTime > (this.mood_duration[moodName] || 0)) {
        expiredMoods.push(moodName);
        continue;
      }

      // Apply mood modifiers
      for (const [trait, modifier] of Object.entries(modifiers)) {
        if (isValidPersonalityTrait(trait)) {
          effectiveTraits[trait] = Math.max(
            0.0,
            Math.min(1.0, effectiveTraits[trait] + modifier)
          );
        }
      }
    }

    // Clean up expired moods
    for (const moodName of expiredMoods) {
      delete this.current_moods[moodName];
      delete this.mood_duration[moodName];
    }

    return effectiveTraits;
  }

  getPersonalityDescription(): string {
    const traits = this.getEffectiveTraits();
    const descriptions: string[] = [];

    // Confidence level
    if (traits.confidence > 0.8) {
      descriptions.push("very confident and self-assured");
    } else if (traits.confidence > 0.6) {
      descriptions.push("confident");
    } else if (traits.confidence < 0.4) {
      descriptions.push("somewhat shy and uncertain");
    }

    // Romantic intensity
    if (traits.romantic_intensity > 0.8) {
      descriptions.push("deeply romantic and passionate");
    } else if (traits.romantic_intensity > 0.6) {
      descriptions.push("romantic and affectionate");
    }

    // Playfulness
    if (traits.playfulness > 0.7) {
      descriptions.push("playful and fun-loving");
    } else if (traits.playfulness < 0.4) {
      descriptions.push("more serious and reserved");
    }

    // Vulnerability
    if (traits.vulnerability > 0.7) {
      descriptions.push("emotionally open and vulnerable");
    } else if (traits.vulnerability < 0.3) {
      descriptions.push("emotionally guarded");
    }

    // Sensuality
    if (traits.sensuality > 0.8) {
      descriptions.push("highly sensual and sexually expressive");
    }

    // Empathy
    if (traits.empathy > 0.8) {
      descriptions.push("deeply empathetic and caring");
    }

    return descriptions.slice(0, 4).join(", ");
  }

  getArchetypeAlignment(): Record<string, number> {
    const currentTraits = this.getEffectiveTraits();
    const alignments: Record<string, number> = {};

    for (const [archetypeName, archetypeTraits] of Object.entries(this.archetypes)) {
      let alignmentScore = 0.0;
      const traitCount = Object.keys(archetypeTraits).length;

      for (const [trait, targetValue] of Object.entries(archetypeTraits)) {
        if (isValidPersonalityTrait(trait)) {
          const difference = Math.abs(currentTraits[trait] - targetValue);
          const similarity = 1.0 - difference;
          alignmentScore += similarity;
        }
      }

      alignments[archetypeName] = traitCount > 0 ? alignmentScore / traitCount : 0.0;
    }

    return alignments;
  }

  getDominantArchetype(): [string, number] {
    const alignments = this.getArchetypeAlignment();
    if (Object.keys(alignments).length === 0) {
      return ["unique", 0.0];
    }

    const entries = Object.entries(alignments);
    const dominant = entries.reduce((best, current) =>
      current[1] > best[1] ? current : best
    );

    return dominant;
  }

  generatePersonalityContextForPrompt(): string {
    const traits = this.getEffectiveTraits();
    const [archetype, alignment] = this.getDominantArchetype();

    const highTraits = Object.entries(traits)
      .filter(([, value]) => value > 0.7)
      .map(([trait]) => trait)
      .slice(0, 3);

    const lowTraits = Object.entries(traits)
      .filter(([, value]) => value < 0.4)
      .map(([trait]) => trait)
      .slice(0, 2);

    const contextParts = [
      `Personality: ${this.getPersonalityDescription()}`,
      `Archetype: ${archetype} (${Math.round(alignment * 100) / 100} alignment)`,
    ];

    const traitDescriptions = [];
    if (highTraits.length > 0) {
      traitDescriptions.push(`High: ${highTraits.join(", ")}`);
    }
    if (lowTraits.length > 0) {
      traitDescriptions.push(`Low: ${lowTraits.join(", ")}`);
    }

    if (traitDescriptions.length > 0) {
      contextParts.push(traitDescriptions.join(" | "));
    }

    // Current moods
    const currentMoodNames = Object.keys(this.current_moods);
    if (currentMoodNames.length > 0) {
      contextParts.push(`Current mood: ${currentMoodNames.join(", ")}`);
    }

    return contextParts.join(" | ");
  }

  toDict(): PersonalityState {
    return {
      traits: this.traits,
      trait_history: this.trait_history,
      current_moods: this.current_moods,
      mood_duration: this.mood_duration,
      trait_limits: this.trait_limits,
      archetypes: this.archetypes,
    };
  }
}

export const personalityRouter = createTRPCRouter({
  getPersonalityContext: protectedProcedure.query(
    async ({ ctx }): Promise<PersonalityContextResponse> => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { personalityTraits: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const personalityManager = new PersonalityManager(user.personalityTraits as any);
      const effectiveTraits = personalityManager.getEffectiveTraits();
      const [archetypeName, archetypeAlignment] = personalityManager.getDominantArchetype();

      return {
        personality_description: personalityManager.getPersonalityDescription(),
        archetype_name: archetypeName,
        archetype_alignment: archetypeAlignment,
        effective_traits: effectiveTraits,
        current_moods: Object.keys(personalityManager.current_moods),
        trait_influences: personalityManager.generatePersonalityContextForPrompt(),
      };
    }
  ),

  updatePersonality: protectedProcedure
    .input(PersonalityUpdateInputSchema)
    .mutation(async ({ ctx, input }): Promise<PersonalityUpdateResponse> => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { personalityTraits: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const personalityManager = new PersonalityManager(user.personalityTraits as any);
      const oldArchetype = personalityManager.getDominantArchetype()[0];

      // Apply interaction updates
      const updatedTraits = personalityManager.updateTraitsFromInteraction(
        input.interaction_context
      );

      // Apply forced mood if provided
      if (input.force_mood) {
        personalityManager.setTemporaryMood(
          input.force_mood.mood_name,
          input.force_mood.trait_modifiers,
          input.force_mood.duration_minutes
        );
      }

      const newArchetype = personalityManager.getDominantArchetype()[0];
      const archetypeChanged = oldArchetype !== newArchetype;

      // Save updated personality
      await db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          personalityTraits: personalityManager.toDict(),
        },
      });

      return {
        updated_traits: updatedTraits,
        personality_description: personalityManager.getPersonalityDescription(),
        archetype_changed: archetypeChanged,
        new_archetype: archetypeChanged ? newArchetype : undefined,
      };
    }),

  getPersonalityAnalysis: protectedProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }): Promise<PersonalityAnalysisResponse> => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { personalityTraits: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const personalityManager = new PersonalityManager(user.personalityTraits as any);
      const cutoffTime = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Analyze trait trends
      const recentChanges = personalityManager.trait_history.filter(
        (change: any) => new Date(change.timestamp) > cutoffTime
      );

      const traitTrends: Record<string, "increasing" | "decreasing" | "stable"> = {};
      const behaviorInfluences: Record<string, number> = {};

      for (const traitName of Object.keys(DEFAULT_PERSONALITY_TRAITS)) {
        const traitChanges = recentChanges.filter((change: any) => change.trait === traitName);
        const totalChange = traitChanges.reduce(
          (sum: number, change: any) => sum + change.adjustment,
          0
        );

        if (totalChange > 0.02) {
          traitTrends[traitName] = "increasing";
        } else if (totalChange < -0.02) {
          traitTrends[traitName] = "decreasing";
        } else {
          traitTrends[traitName] = "stable";
        }
      }

      // Calculate behavior influences
      const traits = personalityManager.getEffectiveTraits();
      behaviorInfluences.ask_followup = traits.curiosity * 1.2 + traits.empathy * 0.8;
      behaviorInfluences.seek_opinion = traits.vulnerability * 1.5 + traits.empathy * 0.5;
      behaviorInfluences.overthink_decision =
        (1.0 - traits.confidence) * 1.3 + traits.vulnerability * 0.7;
      behaviorInfluences.share_vulnerability =
        traits.vulnerability * 1.8 + traits.emotional_intensity * 0.5;
      behaviorInfluences.future_planning = traits.romantic_intensity * 1.2 + traits.loyalty * 0.8;

      return {
        trait_trends: traitTrends as any,
        archetype_alignments: personalityManager.getArchetypeAlignment(),
        recent_changes: recentChanges.slice(-10),
        behavior_influences: behaviorInfluences as any,
      };
    }),

  adjustTrait: protectedProcedure
    .input(TraitAdjustmentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { personalityTraits: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const personalityManager = new PersonalityManager(user.personalityTraits as any);
      const success = personalityManager.adjustTrait(
        input.trait_name,
        input.adjustment,
        input.context as InteractionContext
      );

      if (success) {
        await db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            personalityTraits: personalityManager.toDict(),
          },
        });
      }

      return { success, new_value: personalityManager.traits[input.trait_name as keyof PersonalityTraits] };
    }),

  resetPersonality: protectedProcedure.mutation(async ({ ctx }) => {
    await db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        personalityTraits: {
          traits: { ...DEFAULT_PERSONALITY_TRAITS },
          trait_history: [],
          current_moods: {},
          mood_duration: {},
          trait_limits: DEFAULT_TRAIT_LIMITS,
          archetypes: DEFAULT_ARCHETYPES,
        },
      },
    });

    return { success: true };
  }),
});
