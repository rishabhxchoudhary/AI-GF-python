import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async () => {
    return {
      id: "user-1",
      email: "user@example.com",
      name: "User",
      credits: 100,
      totalSpent: 0,
      joinedAt: new Date().toISOString(),
    };
  }),

  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        preferences: z.object({}).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Update user profile
      return {
        success: true,
        message: "Profile updated successfully",
      };
    }),
});
