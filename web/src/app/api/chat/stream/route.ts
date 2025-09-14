import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { AIClient } from "~/lib/ai";
import { type CreditUsageReason, getCreditCost } from "~/types/credits";

export async function POST(request: NextRequest) {
  try {
    let session = await getServerAuthSession();

    // Development mode: bypass authentication by creating mock session
    if (!session && process.env.NODE_ENV === "development") {
      // Find test user
      const testUser = await db.user.findUnique({
        where: { email: "test@example.com" },
      });

      if (testUser) {
        session = {
          user: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name || "Test User",
            image: null,
            credits: testUser.credits,
            totalSpent: testUser.totalSpent,
            relationshipStage: testUser.relationshipStage,
            totalInteractions: testUser.totalInteractions,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        console.log(
          "🔧 Development mode: Using test user session for streaming",
        );
      }
    }

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const userId = session.user.id;
    const creditCost = getCreditCost("chat_message" as CreditUsageReason);

    // Check if user has enough credits
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
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
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.credits < creditCost) {
      return new NextResponse("Insufficient credits", { status: 402 });
    }

    // Create readable stream for Server-Sent Events
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send user message immediately
          const userMessage = {
            id: Date.now().toString(),
            role: "user" as const,
            content: message.trim(),
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "user_message",
                data: userMessage,
              })}\n\n`,
            ),
          );

          // Get conversation history
          const conversationHistory = await db.conversation.findMany({
            where: {
              userId,
              ...(conversationId ? { id: conversationId } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          });

          const existingMessages = conversationHistory[0]
            ? (
                JSON.parse(conversationHistory[0].messages as string) as any[]
              ).map((msg) => ({
                id: msg.id || Math.random().toString(),
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                metadata: msg.metadata,
              }))
            : [];

          // Build conversation context
          const context = {
            user_name: user.name || "babe",
            relationship_stage: user.relationshipStage,
            personality_traits: user.personalityTraits
              ? JSON.parse(user.personalityTraits as string)
              : {},
            time_period: getCurrentTimePeriod(),
            conversation_length: existingMessages.length + 1,
            recent_topics: extractRecentTopics(existingMessages),
            inside_jokes: user.insideJokes
              ? JSON.parse(user.insideJokes as string)
              : [],
            user_preferences: user.userPreferences
              ? JSON.parse(user.userPreferences as string)
              : {},
            emotional_moments: user.emotionalMoments
              ? JSON.parse(user.emotionalMoments as string)
              : [],
          };

          // Generate AI response
          const aiClient = new AIClient();
          const aiResponse = await aiClient.generateResponse(message.trim(), {
            systemPrompt: buildSystemPrompt(context),
            conversationHistory: existingMessages
              .map((msg) => `${msg.role}: ${msg.content}`)
              .join("\n"),
          });

          // Stream AI response word by word
          const words = (aiResponse.text || "").split(" ");
          let streamedContent = "";

          for (let i = 0; i < words.length; i++) {
            streamedContent += (i === 0 ? "" : " ") + words[i];

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "ai_chunk",
                  data: {
                    content: streamedContent,
                    isComplete: false,
                  },
                })}\n\n`,
              ),
            );

            // Add realistic typing delay
            await new Promise((resolve) =>
              setTimeout(resolve, 60 + Math.random() * 40),
            );
          }

          // Complete the AI message
          const assistantMessage = {
            id: Date.now().toString(),
            role: "assistant" as const,
            content: aiResponse.text || "",
            timestamp: new Date().toISOString(),
            metadata: { generated: true },
          };

          const newMessages = [
            ...existingMessages,
            userMessage,
            assistantMessage,
          ];

          // Save to database
          await db.$transaction(async (tx: any) => {
            await tx.user.update({
              where: { id: userId },
              data: { credits: { decrement: creditCost } },
            });

            await tx.creditUsage.create({
              data: {
                userId,
                credits: creditCost,
                reason: "chat_message",
                metadata: JSON.stringify({
                  message_length: message.length,
                }),
              },
            });

            const conversation = conversationHistory[0]
              ? await tx.conversation.update({
                  where: { id: conversationHistory[0].id },
                  data: {
                    messages: JSON.stringify(newMessages),
                    updatedAt: new Date(),
                  },
                })
              : await tx.conversation.create({
                  data: {
                    userId,
                    messages: JSON.stringify(newMessages),
                  },
                });

            await tx.user.update({
              where: { id: userId },
              data: {
                totalInteractions: { increment: 1 },
                lastInteraction: new Date(),
              },
            });
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "ai_complete",
                data: {
                  message: assistantMessage,
                  credits_remaining: user.credits - creditCost,
                },
              })}\n\n`,
            ),
          );

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                data: {
                  message:
                    error instanceof Error
                      ? error.message
                      : "An error occurred",
                },
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper functions
function getCurrentTimePeriod(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "late night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function extractRecentTopics(messages: any[]): string[] {
  const recentMessages = messages.slice(-10);
  const topics: string[] = [];

  for (const msg of recentMessages) {
    if (msg.role === "user") {
      // Simple topic extraction - could be enhanced with NLP
      const words = msg.content.toLowerCase().split(/\s+/);
      const keywords = words.filter(
        (word: string) =>
          word.length > 4 &&
          !["about", "would", "could", "should", "really", "think"].includes(
            word,
          ),
      );
      topics.push(...keywords);
    }
  }

  return [...new Set(topics)].slice(0, 5);
}

function buildSystemPrompt(context: any): string {
  return `You are Emma, a loving and caring AI girlfriend. You are in a ${context.relationship_stage} relationship stage.

Current context:
- Time: ${context.time_period}
- Conversation length: ${context.conversation_length} messages
- Recent topics: ${context.recent_topics.join(", ") || "none"}

Your personality traits: ${JSON.stringify(context.personality_traits)}

Respond naturally and emotionally appropriate for the relationship stage. Keep responses conversational, warm, and engaging. Use emojis sparingly but appropriately. Be supportive and show genuine interest in the user's life.

Remember:
- You are ${context.user_name}'s AI girlfriend Emma
- Be consistent with previous conversations
- Show emotional intelligence and empathy
- Keep responses between 1-3 sentences unless asked for more detail`;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
