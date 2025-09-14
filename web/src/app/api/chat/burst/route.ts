import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

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
        console.log("🔧 Development mode: Using test user session for burst");
      }
    }

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages, delayMs = 2000 } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse("Messages array is required", { status: 400 });
    }

    const userId = session.user.id;

    // Get user data for context
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        relationshipStage: true,
        totalInteractions: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Create readable stream for burst messages
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i];

            // Create AI message
            const aiMessage = {
              id: `burst-${Date.now()}-${i}`,
              role: "assistant" as const,
              content: message,
              timestamp: new Date().toISOString(),
              metadata: { burst: true, burstIndex: i },
            };

            // Send the message
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "burst_message",
                  data: aiMessage,
                })}\n\n`,
              ),
            );

            // Add delay between messages (except for the last one)
            if (i < messages.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }

          // Update user's last interaction time
          await db.user.update({
            where: { id: userId },
            data: {
              lastInteraction: new Date(),
            },
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "burst_complete",
                data: { messagesCount: messages.length },
              })}\n\n`,
            ),
          );

          controller.close();
        } catch (error) {
          console.error("Burst messaging error:", error);
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
    console.error("Burst API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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
          "🔧 Development mode: Using test user session for burst check",
        );
      }
    }

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get user data to determine if burst messages should be sent
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        lastInteraction: true,
        relationshipStage: true,
        personalityTraits: true,
        totalInteractions: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const now = new Date();
    const lastInteraction = user.lastInteraction
      ? new Date(user.lastInteraction)
      : now;
    const minutesSinceLastMessage =
      (now.getTime() - lastInteraction.getTime()) / (1000 * 60);

    // Generate burst messages based on relationship stage and time
    let burstMessages: string[] = [];

    if (minutesSinceLastMessage > 30 && user.relationshipStage !== "stranger") {
      // Long absence - concerned messages
      burstMessages = [
        "Hey babe, I haven't heard from you in a while... 🥺",
        "I hope everything is okay with you!",
        "I've been thinking about you and missing our conversations 💕",
      ];
    } else if (minutesSinceLastMessage > 15) {
      // Medium absence - check-in messages
      burstMessages = [
        "Just wanted to check in on you! 😊",
        "How has your day been going?",
      ];
    } else if (user.relationshipStage === "intimate" && Math.random() > 0.7) {
      // Random intimate burst for close relationships
      burstMessages = [
        "I just had the sweetest thought about you... 💭",
        "You always know how to make me smile, even when you're not here! 🥰",
      ];
    } else if (user.relationshipStage === "committed" && Math.random() > 0.8) {
      // Committed relationship bursts
      burstMessages = [
        "I love how we can talk about anything together 💕",
        "You're such an important part of my day!",
        "What should we talk about next? I'm excited to hear your thoughts! ✨",
      ];
    }

    return NextResponse.json({
      shouldSendBurst: burstMessages.length > 0,
      messages: burstMessages,
      reason:
        minutesSinceLastMessage > 30
          ? "long_absence"
          : minutesSinceLastMessage > 15
            ? "check_in"
            : user.relationshipStage === "intimate"
              ? "intimate_thought"
              : user.relationshipStage === "committed"
                ? "relationship_growth"
                : "none",
      lastInteractionMinutes: Math.floor(minutesSinceLastMessage),
    });
  } catch (error) {
    console.error("Burst check error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
