import { createTRPCRouter } from "~/server/api/trpc";
import { personalityRouter } from "~/server/api/routers/personality";
import { creditsRouter } from "~/server/api/routers/credits";
import { chatRouter } from "~/server/api/routers/chat";
import { relationshipRouter } from "~/server/api/routers/relationship";
import { temporalRouter } from "~/server/api/routers/temporal";
import { agenticRouter } from "~/server/api/routers/agentic";
import { paymentsRouter } from "~/server/api/routers/payments";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { userRouter } from "~/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Core AI Girlfriend functionality
  personality: personalityRouter,
  relationship: relationshipRouter,
  temporal: temporalRouter,
  agentic: agenticRouter,
  chat: chatRouter,

  // Monetization system
  credits: creditsRouter,
  payments: paymentsRouter,

  // User management and analytics
  user: userRouter,
  analytics: analyticsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
