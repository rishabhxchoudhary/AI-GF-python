import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function createDevUser() {
  try {
    // Check if test user already exists
    const existingUser = await db.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      console.log("✅ Test user already exists:", existingUser.email);
      console.log(`Credits: ${existingUser.credits}`);
      return existingUser;
    }

    // Create new test user with full AI girlfriend setup
    const testUser = await db.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        credits: 100, // Give test user plenty of credits
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

    console.log("🎉 Created test user successfully!");
    console.log(`Email: ${testUser.email}`);
    console.log(`Credits: ${testUser.credits}`);
    console.log(`User ID: ${testUser.id}`);

    return testUser;
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the script
createDevUser().catch(console.error);
