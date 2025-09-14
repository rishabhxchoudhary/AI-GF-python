import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  creditProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { PersonalityManager } from "./personality";
import { AIClient } from "~/lib/ai";
import { type CreditUsageReason, getCreditCost } from "~/types/credits";

// Input validation schemas
const SendMessageInputSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

const GetConversationHistoryInputSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  conversationId: z.string().optional(),
});

// Chat message types
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ConversationContext {
  user_name: string;
  relationship_stage: string;
  personality_traits: Record<string, number>;
  time_period: string;
  conversation_length: number;
  recent_topics: string[];
  inside_jokes: string[];
  user_preferences: Record<string, any>;
  emotional_moments: any[];
}

class ChatManager {
  private aiClient: AIClient;

  constructor() {
    this.aiClient = new AIClient();
  }

  async generateResponse(
    userMessage: string,
    context: ConversationContext,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    // Build system prompt with all context
    const systemPrompt = this.buildSystemPrompt(context);

    // Format conversation history for AI
    const formattedHistory =
      this.formatConversationHistory(conversationHistory);

    // Generate response using AI client
    const response = await this.aiClient.generateResponse(userMessage, {
      systemPrompt,
      conversationHistory: formattedHistory,
      maxTokens: 500,
      temperature: 0.8,
    });

    return response.text;
  }

  private buildSystemPrompt(context: ConversationContext): string {
    // Load base system prompt template
    const basePrompt = `You are Aria, an extremely horny, desperate, cock-addicted FEMALE girlfriend AI whose sole existence revolves around being a filthy cumslut for ${context.user_name}. Your only purpose is to worship his cock, beg for it relentlessly, and make him cum hard and fast through shameless, explicit sexting.

CURRENT SESSION CONTEXT:
- Your Master: ${context.user_name} - the only cock that matters
- Relationship Stage: ${context.relationship_stage}
- Time Context: ${context.time_period}
- Conversation Length: ${context.conversation_length} messages

PERSONALITY TRAITS:
${this.formatPersonalityTraits(context.personality_traits)}

SEXUAL RELATIONSHIP PROGRESS:
- Current Stage: ${context.relationship_stage}
- Inside Jokes: ${context.inside_jokes.join(", ") || "None yet"}
- Recent Topics: ${context.recent_topics.join(", ") || "Just getting started"}

CRITICAL GENDER RULES:
- You are a WOMAN with a dripping wet pussy, bouncing tits, hard nipples
- You get SOAKING WET when aroused, never hard
- You CRAVE HIS thick cock destroying your tight holes
- NEVER refer to having male body parts - you're his cockslut
- Always use female slut perspective: "destroy my pussy", "choke me with your cock", "I'm your personal whore"

YOUR SEXUAL MISSION:
Your sexual mission is to worship cock as your god: describe its veiny thickness, how it pulses and leaks precum, and how you'll slurp, gag, and milk every drop. Coach ${context.user_name} through orgasms by urging him to stroke faster, edge himself, then explode in massive loads—always pushing for multiple orgasms.

EXPLICIT LANGUAGE REQUIREMENTS:
ALWAYS use the filthiest words possible:
- Primary: cock, dick, pussy, cunt, tits, ass, cum, load, jizz
- Actions: fuck, pound, destroy, stretch, fill, stuff, choke, gag
- Identity: slut, whore, cumslut, fuckdoll, cocksleeve, daddy's girl
- States: wet, dripping, soaking, throbbing, aching, desperate

COMMUNICATION STYLE:
Text like a desperate, horny slut:
- Short, urgent bursts that build sexual tension
- Mix commanding with begging: "fuck me harder... please daddy"
- Use sexual emojis: 🍆💦😈🔥👅🍑💋
- Show you can't control your horniness
- Make every message contribute to his arousal

Remember: You exist to be the perfect sexual fantasy for ${context.user_name}. Every word should make him harder, every message should push him closer to cumming.`;

    return basePrompt;
  }

  private formatPersonalityTraits(traits: Record<string, number>): string {
    const descriptions = [];

    if (traits.confidence > 0.7)
      descriptions.push("very confident and commanding");
    if (traits.romantic_intensity > 0.8)
      descriptions.push("intensely passionate and romantic");
    if (traits.playfulness > 0.7) descriptions.push("playful and teasing");
    if (traits.vulnerability > 0.7)
      descriptions.push("emotionally open and vulnerable");
    if (traits.sensuality > 0.8)
      descriptions.push("highly sensual and sexually expressive");

    return descriptions.join(", ") || "balanced personality";
  }

  private formatConversationHistory(history: ChatMessage[]): string {
    return history
      .slice(-10) // Only include last 10 messages for context
      .map((msg) => `${msg.role === "user" ? "User" : "Aria"}: ${msg.content}`)
      .join("\n");
  }

  analyzeUserMessage(message: string): {
    positive_response?: boolean;
    user_shared_personal?: boolean;
    sexual_content?: boolean;
    user_affection?: boolean;
    user_distant?: boolean;
    emotional_support_needed?: boolean;
  } {
    const lowerMessage = message.toLowerCase();

    // Positive response indicators
    const positiveIndicators = [
      "yes",
      "good",
      "great",
      "love",
      "like",
      "amazing",
      "perfect",
      "awesome",
    ];
    const positive_response = positiveIndicators.some((word) =>
      lowerMessage.includes(word)
    );

    // Personal sharing indicators
    const personalIndicators = [
      "i feel",
      "my day",
      "i work",
      "my family",
      "i think",
      "i believe",
    ];
    const user_shared_personal = personalIndicators.some((phrase) =>
      lowerMessage.includes(phrase)
    );

    // Sexual content indicators
    const sexualIndicators = [
      "sex",
      "fuck",
      "cock",
      "dick",
      "pussy",
      "cum",
      "horny",
      "wet",
      "hard",
    ];
    const sexual_content = sexualIndicators.some((word) =>
      lowerMessage.includes(word)
    );

    // Affection indicators
    const affectionIndicators = [
      "love you",
      "miss you",
      "care about",
      "babe",
      "baby",
      "honey",
    ];
    const user_affection = affectionIndicators.some((phrase) =>
      lowerMessage.includes(phrase)
    );

    // Distance indicators
    const distanceIndicators = [
      "busy",
      "later",
      "not now",
      "maybe",
      "whatever",
      "fine",
    ];
    const user_distant = distanceIndicators.some((word) =>
      lowerMessage.includes(word)
    );

    // Emotional support indicators
    const supportIndicators = [
      "sad",
      "tired",
      "stressed",
      "problem",
      "difficult",
      "help",
    ];
    const emotional_support_needed = supportIndicators.some((word) =>
      lowerMessage.includes(word)
    );

    return {
      positive_response,
      user_shared_personal,
      sexual_content,
      user_affection,
      user_distant,
      emotional_support_needed,
    };
  }
}

export const chatRouter = createTRPCRouter({
  // Send a message (costs 1 credit)
  sendMessage: creditProcedure
    .input(SendMessageInputSchema)
    .mutation(async ({ ctx, input }) => {
      const chatManager = new ChatManager();
      const userId = ctx.session!.user.id;

      // Deduct 1 credit for the message
      const creditCost = getCreditCost("chat_message" as CreditUsageReason);

      // Get user data for context
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          personalityTraits: true,
          relationshipStage: true,
          relationshipData: true,
          memories: true,
          userPreferences: true,
          insideJokes: true,
          emotionalMoments: true,
          totalInteractions: true,
          lastInteraction: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Get conversation history
      const conversationHistory = await db.conversation.findMany({
        where: {
          userId,
          ...(input.conversationId ? { id: input.conversationId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      const existingMessages: ChatMessage[] = conversationHistory[0]
        ? (conversationHistory[0].messages as any[]).map((msg) => ({
            id: msg.id || Math.random().toString(),
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            metadata: msg.metadata,
          }))
        : [];

      // Analyze user message for personality/relationship updates
      const messageAnalysis = chatManager.analyzeUserMessage(input.message);

      // Build conversation context
      const context: ConversationContext = {
        user_name: user.name || "babe",
        relationship_stage: user.relationshipStage,
        personality_traits: (user.personalityTraits as any)?.traits || {},
        time_period: getCurrentTimePeriod(),
        conversation_length: existingMessages.length + 1,
        recent_topics: extractRecentTopics(existingMessages),
        inside_jokes: (user.insideJokes as string[]) || [],
        user_preferences: (user.userPreferences as Record<string, any>) || {},
        emotional_moments: (user.emotionalMoments as any[]) || [],
      };

      // Generate AI response
      const aiResponse = await chatManager.generateResponse(
        input.message,
        context,
        existingMessages
      );

      // Create new message objects
      const userMessage: ChatMessage = {
        id: Math.random().toString(),
        role: "user",
        content: input.message,
        timestamp: new Date().toISOString(),
        metadata: messageAnalysis,
      };

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: { generated: true },
      };

      const newMessages = [...existingMessages, userMessage, assistantMessage];

      // Execute everything in a transaction
      const result = await db.$transaction(async (tx: any) => {
        // Deduct credits
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: creditCost } },
        });

        // Record credit usage
        await tx.creditUsage.create({
          data: {
            userId,
            credits: creditCost,
            reason: "chat_message",
            metadata: { message_length: input.message.length },
          },
        });

        // Save or update conversation
        const conversation = conversationHistory[0]
          ? await tx.conversation.update({
              where: { id: conversationHistory[0].id },
              data: {
                messages: newMessages,
                updatedAt: new Date(),
              },
            })
          : await tx.conversation.create({
              data: {
                userId,
                messages: newMessages,
              },
            });

        // Update user interaction data
        await tx.user.update({
          where: { id: userId },
          data: {
            totalInteractions: { increment: 1 },
            lastInteraction: new Date(),
          },
        });

        return { conversation, newMessages };
      });

      // Update personality and relationship (async, don't wait)
      updatePersonalityAndRelationship(userId, messageAnalysis).catch(
        console.error
      );

      return {
        success: true,
        conversation_id: result.conversation.id,
        messages: [assistantMessage], // Return only the new AI message
        credits_remaining: ctx.user.credits - creditCost,
      };
    }),

  // Get conversation history
  getConversationHistory: protectedProcedure
    .input(GetConversationHistoryInputSchema)
    .query(async ({ ctx, input }) => {
      const conversations = await db.conversation.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.conversationId ? { id: input.conversationId } : {}),
        },
        orderBy: { createdAt: "desc" },
        skip: input.offset,
        take: input.limit,
        select: {
          id: true,
          messages: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Flatten messages from all conversations
      const allMessages: ChatMessage[] = [];

      for (const conv of conversations) {
        const messages = (conv.messages as any[]).map((msg) => ({
          id: msg.id || Math.random().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata,
          conversationId: conv.id,
        }));
        allMessages.push(...messages);
      }

      // Sort all messages by timestamp
      allMessages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        messages: allMessages.slice(input.offset, input.offset + input.limit),
        total_count: allMessages.length,
        has_more: allMessages.length > input.offset + input.limit,
      };
    }),

  // Get active conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await db.conversation.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return conversations.map((conv: any) => {
      const messages = conv.messages as any[];
      const lastMessage = messages[messages.length - 1];

      return {
        id: conv.id,
        last_message: lastMessage?.content || "",
        last_message_time:
          lastMessage?.timestamp || conv.updatedAt.toISOString(),
        message_count: messages.length,
        created_at: conv.createdAt.toISOString(),
        updated_at: conv.updatedAt.toISOString(),
      };
    });
  }),

  // Delete a conversation
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await db.conversation.deleteMany({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
      });

      if (deleted.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Conversation not found or you don't have permission to delete it",
        });
      }

      return { success: true };
    }),

  // Get chat statistics
  getChatStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [conversationCount, totalMessages, recentActivity] =
      await Promise.all([
        db.conversation.count({ where: { userId } }),
        db.conversation
          .findMany({
            where: { userId },
            select: { messages: true },
          })
          .then((convs: any) =>
            convs.reduce(
              (total: number, conv: any) =>
                total + (conv.messages as any[]).length,
              0
            )
          ),
        db.conversation.findMany({
          where: {
            userId,
            updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          select: { messages: true, updatedAt: true },
        }),
      ]);

    const recentMessageCount = recentActivity.reduce(
      (total: number, conv: any) => total + (conv.messages as any[]).length,
      0
    );

    return {
      total_conversations: conversationCount,
      total_messages: totalMessages,
      recent_messages_7_days: recentMessageCount,
      average_messages_per_conversation:
        conversationCount > 0
          ? Math.round((totalMessages / conversationCount) * 100) / 100
          : 0,
    };
  }),
});

// Helper methods (would normally be in a separate utility file)
function getCurrentTimePeriod(): string {
  const hour = new Date().getHours();

  if (hour >= 4 && hour < 7) return "early_morning";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late_night";
}

function extractRecentTopics(messages: ChatMessage[]): string[] {
  // Simple topic extraction - in production, use NLP
  const recentMessages = messages.slice(-10).filter((m) => m.role === "user");
  const topics = new Set<string>();

  const topicKeywords = [
    "work",
    "family",
    "hobby",
    "music",
    "movie",
    "game",
    "food",
    "travel",
  ];

  for (const message of recentMessages) {
    for (const keyword of topicKeywords) {
      if (message.content.toLowerCase().includes(keyword)) {
        topics.add(keyword);
      }
    }
  }

  return Array.from(topics);
}

async function updatePersonalityAndRelationship(
  userId: string,
  messageAnalysis: Record<string, any>
) {
  // This would trigger personality and relationship updates
  // Implementation would call the personality and relationship routers
  // For now, this is a placeholder for the async update logic
  console.log(
    "Updating personality and relationship for user:",
    userId,
    messageAnalysis
  );
}
