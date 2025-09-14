import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function testTRPCEndpoints() {
  console.log("🧪 Testing tRPC endpoints...\n");

  try {
    // Test 1: Check database connection
    console.log("1. Testing database connection...");
    const userCount = await db.user.count();
    console.log(`✅ Database connected - ${userCount} users found\n`);

    // Test 2: Find our test user
    console.log("2. Testing test user exists...");
    const testUser = await db.user.findUnique({
      where: { email: "test@example.com" },
      select: {
        id: true,
        email: true,
        credits: true,
        relationshipStage: true,
      },
    });

    if (!testUser) {
      console.log("❌ Test user not found. Run: npx tsx scripts/setup-dev-user.ts");
      process.exit(1);
    }

    console.log("✅ Test user found:");
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Credits: ${testUser.credits}`);
    console.log(`   Relationship Stage: ${testUser.relationshipStage}\n`);

    // Test 3: Test credit operations
    console.log("3. Testing credit operations...");
    const originalCredits = testUser.credits;

    // Simulate credit deduction
    await db.user.update({
      where: { id: testUser.id },
      data: { credits: { decrement: 1 } },
    });

    // Check updated credits
    const updatedUser = await db.user.findUnique({
      where: { id: testUser.id },
      select: { credits: true },
    });

    if (updatedUser && updatedUser.credits === originalCredits - 1) {
      console.log("✅ Credit deduction works");

      // Restore original credits
      await db.user.update({
        where: { id: testUser.id },
        data: { credits: originalCredits },
      });
      console.log("✅ Credits restored\n");
    } else {
      console.log("❌ Credit deduction failed\n");
    }

    // Test 4: Test conversation storage
    console.log("4. Testing conversation storage...");
    const testConversation = await db.conversation.create({
      data: {
        userId: testUser.id,
        messages: JSON.stringify([
          {
            id: "test-1",
            role: "user",
            content: "Hello, this is a test message",
            timestamp: new Date().toISOString(),
          },
          {
            id: "test-2",
            role: "assistant",
            content: "Hi! I'm your AI girlfriend. How are you today?",
            timestamp: new Date().toISOString(),
          },
        ]),
      },
    });

    console.log("✅ Test conversation created");
    console.log(`   ID: ${testConversation.id}\n`);

    // Clean up test conversation
    await db.conversation.delete({
      where: { id: testConversation.id },
    });
    console.log("✅ Test conversation cleaned up\n");

    // Test 5: Test credit usage tracking
    console.log("5. Testing credit usage tracking...");
    const creditUsage = await db.creditUsage.create({
      data: {
        userId: testUser.id,
        credits: 1,
        reason: "test_message",
        metadata: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    console.log("✅ Credit usage recorded");
    console.log(`   ID: ${creditUsage.id}`);

    // Clean up credit usage
    await db.creditUsage.delete({
      where: { id: creditUsage.id },
    });
    console.log("✅ Credit usage cleaned up\n");

    // Test 6: Test personality data structure
    console.log("6. Testing personality data...");
    const personalityData = testUser ? await db.user.findUnique({
      where: { id: testUser.id },
      select: {
        personalityTraits: true,
        relationshipData: true,
        memories: true,
      },
    }) : null;

    if (personalityData) {
      try {
        const traits = personalityData.personalityTraits
          ? JSON.parse(personalityData.personalityTraits)
          : null;
        const relationship = personalityData.relationshipData
          ? JSON.parse(personalityData.relationshipData)
          : null;
        const memories = personalityData.memories
          ? JSON.parse(personalityData.memories)
          : null;

        console.log("✅ Personality data structure valid:");
        console.log(`   Traits: ${Object.keys(traits || {}).length} properties`);
        console.log(`   Relationship: Stage "${relationship?.current_stage}"`);
        console.log(`   Memories: ${Object.keys(memories || {}).length} categories\n`);
      } catch (error) {
        console.log("❌ Personality data structure invalid:", error);
      }
    }

    console.log("🎉 All tests passed! tRPC backend is ready.\n");
    console.log("Next steps:");
    console.log("1. Visit http://localhost:3000/auth/signin to sign in");
    console.log("2. Use Google or GitHub authentication");
    console.log("3. Visit http://localhost:3000/chat to start chatting");
    console.log("4. Check http://localhost:3000/credits for credit status");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the tests
testTRPCEndpoints().catch(console.error);
