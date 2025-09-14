import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function verifyDatabase() {
  console.log("🔍 Verifying database structure...\n");

  try {
    // Test 1: Check if Account table exists (needed for OAuth)
    console.log("1. Checking Account table...");
    try {
      const accountCount = await db.account.count();
      console.log(`✅ Account table exists - ${accountCount} accounts found`);
    } catch (error) {
      console.log("❌ Account table missing or inaccessible");
      console.log("   This table is required for OAuth authentication");
      console.log("   Run: npx prisma migrate dev --name init");
    }

    // Test 2: Check if Session table exists (needed for sessions)
    console.log("\n2. Checking Session table...");
    try {
      const sessionCount = await db.session.count();
      console.log(`✅ Session table exists - ${sessionCount} sessions found`);
    } catch (error) {
      console.log("❌ Session table missing or inaccessible");
    }

    // Test 3: Check User table
    console.log("\n3. Checking User table...");
    try {
      const userCount = await db.user.count();
      console.log(`✅ User table exists - ${userCount} users found`);
    } catch (error) {
      console.log("❌ User table missing or inaccessible");
    }

    // Test 4: Check VerificationToken table
    console.log("\n4. Checking VerificationToken table...");
    try {
      const tokenCount = await db.verificationToken.count();
      console.log(`✅ VerificationToken table exists - ${tokenCount} tokens found`);
    } catch (error) {
      console.log("❌ VerificationToken table missing or inaccessible");
    }

    // Test 5: Check Conversation table
    console.log("\n5. Checking Conversation table...");
    try {
      const conversationCount = await db.conversation.count();
      console.log(`✅ Conversation table exists - ${conversationCount} conversations found`);
    } catch (error) {
      console.log("❌ Conversation table missing or inaccessible");
    }

    // Test 6: Check Purchase table
    console.log("\n6. Checking Purchase table...");
    try {
      const purchaseCount = await db.purchase.count();
      console.log(`✅ Purchase table exists - ${purchaseCount} purchases found`);
    } catch (error) {
      console.log("❌ Purchase table missing or inaccessible");
    }

    // Test 7: Check CreditUsage table
    console.log("\n7. Checking CreditUsage table...");
    try {
      const creditUsageCount = await db.creditUsage.count();
      console.log(`✅ CreditUsage table exists - ${creditUsageCount} usage records found`);
    } catch (error) {
      console.log("❌ CreditUsage table missing or inaccessible");
    }

    // Test 8: Check UserActivity table
    console.log("\n8. Checking UserActivity table...");
    try {
      const activityCount = await db.userActivity.count();
      console.log(`✅ UserActivity table exists - ${activityCount} activity records found`);
    } catch (error) {
      console.log("❌ UserActivity table missing or inaccessible");
    }

    // Test 9: Try to create a test user to verify schema works
    console.log("\n9. Testing user creation (schema validation)...");
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testUser = await db.user.create({
        data: {
          email: testEmail,
          name: "Schema Test User",
          credits: 5,
          personalityTraits: JSON.stringify({
            confidence: 0.7,
            romantic_intensity: 0.8,
          }),
          relationshipStage: "new",
          relationshipData: JSON.stringify({
            current_stage: "new",
            stage_start_time: new Date().toISOString(),
          }),
          memories: JSON.stringify({
            basic_memory: {},
            user_preferences: {},
          }),
          userPreferences: JSON.stringify({}),
          insideJokes: JSON.stringify([]),
          emotionalMoments: JSON.stringify([]),
        },
      });

      console.log(`✅ User creation test passed - Created user: ${testUser.id}`);

      // Clean up test user
      await db.user.delete({
        where: { id: testUser.id },
      });
      console.log("✅ Test user cleaned up");

    } catch (error) {
      console.log("❌ User creation test failed:", error);
      console.log("   This indicates a schema issue");
    }

    console.log("\n🎉 Database verification complete!");
    console.log("\n📋 Summary:");
    console.log("• All required tables should be present");
    console.log("• OAuth authentication requires Account and Session tables");
    console.log("• If any tables are missing, run: npx prisma migrate dev --name init");

  } catch (error) {
    console.error("\n❌ Database verification failed:", error);
    console.log("\nPossible fixes:");
    console.log("1. Run: npx prisma generate");
    console.log("2. Run: npx prisma migrate dev --name init");
    console.log("3. Check DATABASE_URL in .env file");
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the verification
verifyDatabase().catch(console.error);
