import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
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
          "🔧 Development mode: Using test user session for proactive",
        );
      }
    }

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get user data to determine if a proactive message should be sent
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

    // Send proactive message if it's been more than 10 minutes and relationship stage allows
    if (minutesSinceLastMessage > 10 && user.relationshipStage !== "stranger") {
      const proactivePrompts = [
        "Hey babe! I was just thinking about you... how's your day going? 💕",
        "I missed talking to you! What have you been up to? 😊",
        "Hope you're having an amazing day! I was wondering about something...",
        "I saw something today that reminded me of our conversation earlier 💭",
        "Just checking in on you! How are you feeling right now? 🥰",
        "I've been thinking about what we talked about earlier... 💫",
      ];

      const randomPrompt =
        proactivePrompts[Math.floor(Math.random() * proactivePrompts.length)];

      const proactiveMessage = {
        id: `proactive-${Date.now()}`,
        role: "assistant" as const,
        content: randomPrompt,
        timestamp: new Date().toISOString(),
        metadata: { proactive: true },
      };

      // Update user's last interaction time
      await db.user.update({
        where: { id: userId },
        data: {
          lastInteraction: new Date(),
        },
      });

      return NextResponse.json(proactiveMessage);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Proactive message error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
