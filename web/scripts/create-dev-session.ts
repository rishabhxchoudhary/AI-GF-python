import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const db = new PrismaClient();

async function createDevSession() {
  console.log("🔧 Creating development session bypass...\n");

  try {
    // Find or create test user
    let testUser = await db.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (!testUser) {
      console.log("Creating test user...");
      testUser = await db.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          credits: 100,
          personalityTraits: JSON.stringify({
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
          }),
          relationshipStage: "new",
          relationshipData: JSON.stringify({
            current_stage: "new",
            stage_start_time: new Date().toISOString(),
            interaction_count: 0,
            positive_interactions: 0,
            negative_interactions: 0,
            milestones: [],
            relationship_quality: {
              trust_level: 0.5,
              intimacy_level: 0.3,
              communication_quality: 0.5,
              sexual_chemistry: 0.6,
              emotional_bond: 0.4,
            },
          }),
          memories: JSON.stringify({
            basic_memory: {},
            user_preferences: {},
            inside_jokes: [],
            unresolved_topics: [],
            conversation_themes: [],
            emotional_moments: [],
          }),
          userPreferences: JSON.stringify({}),
          insideJokes: JSON.stringify([]),
          emotionalMoments: JSON.stringify([]),
        },
      });
    }

    console.log(`✅ Test user ready: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`💰 Credits: ${testUser.credits}`);

    // Create a dev session
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1); // 1 month from now

    // Clean up any existing sessions for this user
    await db.session.deleteMany({
      where: { userId: testUser.id },
    });

    const session = await db.session.create({
      data: {
        sessionToken,
        userId: testUser.id,
        expires,
      },
    });

    console.log(`✅ Development session created: ${session.id}`);
    console.log(`🔑 Session token: ${sessionToken}`);

    // Instructions for manual cookie setting
    console.log("\n📋 To use this session:");
    console.log("1. Open your browser developer tools (F12)");
    console.log("2. Go to Application/Storage > Cookies > http://localhost:3000");
    console.log(`3. Add a new cookie:`);
    console.log(`   Name: next-auth.session-token`);
    console.log(`   Value: ${sessionToken}`);
    console.log(`   Domain: localhost`);
    console.log(`   Path: /`);
    console.log(`   Expires: ${expires.toISOString()}`);
    console.log("4. Refresh the page and you should be logged in");
    console.log("5. Navigate to http://localhost:3000/chat to start chatting");

    // Alternative: Create an account entry for Google OAuth simulation
    console.log("\n🔧 Creating OAuth account simulation...");

    // Clean up existing accounts
    await db.account.deleteMany({
      where: { userId: testUser.id },
    });

    await db.account.create({
      data: {
        userId: testUser.id,
        type: "oauth",
        provider: "google",
        providerAccountId: "dev-google-123456789",
        access_token: "dev-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        token_type: "Bearer",
        scope: "email profile openid",
        id_token: "dev-id-token",
      },
    });

    console.log("✅ OAuth account simulation created");

    console.log("\n🎉 Development authentication setup complete!");
    console.log("\nYou can now:");
    console.log("• Set the session cookie manually (instructions above)");
    console.log("• Or try Google OAuth (should work better now)");
    console.log("• Visit http://localhost:3000/chat to start chatting");

  } catch (error) {
    console.error("❌ Error setting up development session:", error);
  } finally {
    await db.$disconnect();
  }
}

// Helper function to clean up sessions
async function cleanupSessions() {
  console.log("🧹 Cleaning up old sessions...");

  try {
    const result = await db.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    console.log(`✅ Cleaned up ${result.count} expired sessions`);
  } catch (error) {
    console.error("❌ Error cleaning up sessions:", error);
  } finally {
    await db.$disconnect();
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === "cleanup") {
  cleanupSessions().catch(console.error);
} else {
  createDevSession().catch(console.error);
}
