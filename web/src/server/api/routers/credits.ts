import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import {
  type CreditBalance,
  type CreditUsage,
  type CreditUsageStats,
  type Purchase,
  type PurchaseHistory,
  type CreditStatusResponse,
  type CreditUsageReason,
  type PurchaseStatus,
  DEFAULT_CREDIT_PACKAGES,
  CREDIT_COSTS,
  getCreditCost,
  isValidCreditUsageReason,
  calculateEstimatedDaysRemaining,
  shouldShowLowBalanceWarning,
} from "~/types/credits";

// Input validation schemas
const DeductCreditsInputSchema = z.object({
  amount: z.number().min(1).max(100),
  reason: z.string().refine(isValidCreditUsageReason),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const AddCreditsInputSchema = z.object({
  amount: z.number().min(1).max(10000),
  reason: z.string().refine(isValidCreditUsageReason),
  description: z.string().optional(),
  purchaseId: z.string().optional(),
  adminNote: z.string().optional(),
});

const CreditUsageQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  reason: z.string().refine(isValidCreditUsageReason).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PurchaseHistoryQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  status: z
    .enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "cancelled",
      "refunded",
      "partially_refunded",
    ])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

async function calculateCreditUsageStats(
  userId: string,
  days: number = 30,
): Promise<CreditUsageStats> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const usageRecords = await db.creditUsage.findMany({
    where: {
      userId,
      createdAt: { gte: cutoffDate },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUsed = usageRecords.reduce(
    (sum: number, record: any) => sum + record.credits,
    0,
  );
  const dailyUsage = Math.round((totalUsed / days) * 100) / 100;

  // Calculate usage by reason
  const usageByReason: Record<string, number> = {};
  let mostUsedReason: CreditUsageReason = "chat_message";
  let maxUsage = 0;

  for (const record of usageRecords) {
    const reason = record.reason as CreditUsageReason;
    usageByReason[reason] = (usageByReason[reason] || 0) + record.credits;

    if (usageByReason[reason]! > maxUsage) {
      maxUsage = usageByReason[reason]!;
      mostUsedReason = reason;
    }
  }

  // Calculate recent usage periods
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const dailyUsageRecords = usageRecords.filter(
    (record: any) => new Date(record.createdAt) > oneDayAgo,
  );
  const weeklyUsageRecords = usageRecords.filter(
    (record: any) => new Date(record.createdAt) > oneWeekAgo,
  );

  const dailyTotal = dailyUsageRecords.reduce(
    (sum: number, record: any) => sum + record.credits,
    0,
  );
  const weeklyTotal = weeklyUsageRecords.reduce(
    (sum: number, record: any) => sum + record.credits,
    0,
  );
  const monthlyTotal = totalUsed;

  return {
    total_used: totalUsed,
    daily_usage: dailyTotal,
    weekly_usage: weeklyTotal,
    monthly_usage: monthlyTotal,
    most_used_feature: mostUsedReason,
    usage_by_reason: usageByReason as Record<CreditUsageReason, number>,
    average_daily_usage: dailyUsage,
  };
}

async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true, totalSpent: true, createdAt: true },
  });

  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  // Get total purchased credits
  const purchases = await db.purchase.findMany({
    where: {
      userId,
      status: "completed",
    },
    select: { credits: true, createdAt: true },
  });

  const lifetimePurchased = purchases.reduce(
    (sum: number, purchase: any) => sum + purchase.credits,
    0,
  );
  const lifetimeSpent = lifetimePurchased + 5 - user.credits; // Include free trial credits

  // Get last purchase date
  const lastPurchase =
    purchases.length > 0
      ? purchases.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      : null;

  return {
    current: user.credits,
    lifetime_purchased: lifetimePurchased + 5, // Include free trial
    lifetime_spent: lifetimeSpent,
    last_purchase: lastPurchase?.createdAt.toISOString(),
    next_expiry: undefined, // Credits never expire
  };
}

export const creditsRouter = createTRPCRouter({
  // Get user's credit status
  getCreditStatus: protectedProcedure.query(
    async ({ ctx }): Promise<CreditStatusResponse> => {
      const balance = await getCreditBalance(ctx.session.user.id);
      const usageStats = await calculateCreditUsageStats(ctx.session.user.id);

      const recentUsage = await db.creditUsage.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const lowBalanceWarning = shouldShowLowBalanceWarning(
        balance.current,
        usageStats.average_daily_usage,
      );

      const estimatedDaysRemaining = calculateEstimatedDaysRemaining(
        balance.current,
        usageStats.average_daily_usage,
      );

      return {
        balance,
        usage_stats: usageStats,
        recent_usage: recentUsage as CreditUsage[],
        low_balance_warning: lowBalanceWarning,
        estimated_days_remaining: estimatedDaysRemaining ?? undefined,
      };
    },
  ),

  // Deduct credits (used by other services)
  deductCredits: protectedProcedure
    .input(DeductCreditsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { credits: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.credits < input.amount) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Insufficient credits. Please purchase more credits to continue.",
        });
      }

      // Deduct credits in a transaction
      const result = await db.$transaction(async (tx: any) => {
        // Update user credits
        const updatedUser = await tx.user.update({
          where: { id: ctx.session.user.id },
          data: { credits: { decrement: input.amount } },
          select: { credits: true },
        });

        // Record credit usage
        const usage = await tx.creditUsage.create({
          data: {
            userId: ctx.session.user.id,
            credits: input.amount,
            reason: input.reason,
            metadata: {
              description: input.description,
              ...input.metadata,
            },
          },
        });

        return { updatedUser, usage };
      });

      return {
        success: true,
        remaining_credits: result.updatedUser.credits,
        usage_id: result.usage.id,
      };
    }),

  // Add credits (admin only or purchase completion)
  addCredits: protectedProcedure
    .input(AddCreditsInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if this is an admin adjustment
      const isAdminAdjustment = input.reason === "admin_adjustment";
      if (isAdminAdjustment) {
        const userEmail = ctx.session.user.email;
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

        if (!adminEmails.includes(userEmail || "")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
      }

      const result = await db.$transaction(async (tx: any) => {
        // Update user credits
        const updatedUser = await tx.user.update({
          where: { id: ctx.session.user.id },
          data: { credits: { increment: input.amount } },
          select: { credits: true },
        });

        // Record credit addition
        const usage = await tx.creditUsage.create({
          data: {
            userId: ctx.session.user.id,
            credits: -input.amount, // Negative for credits added
            reason: input.reason,
            metadata: {
              description: input.description,
              purchase_id: input.purchaseId,
              admin_note: input.adminNote,
            },
          },
        });

        return { updatedUser, usage };
      });

      return {
        success: true,
        new_balance: result.updatedUser.credits,
        usage_id: result.usage.id,
      };
    }),

  // Get credit usage history
  getCreditUsageHistory: protectedProcedure
    .input(CreditUsageQuerySchema)
    .query(async ({ ctx, input }) => {
      const whereClause: any = { userId: ctx.session.user.id };

      if (input.reason) {
        whereClause.reason = input.reason;
      }

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {};
        if (input.startDate) {
          whereClause.createdAt.gte = new Date(input.startDate);
        }
        if (input.endDate) {
          whereClause.createdAt.lte = new Date(input.endDate);
        }
      }

      const [usageRecords, totalCount] = await Promise.all([
        db.creditUsage.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip: input.offset,
          take: input.limit,
        }),
        db.creditUsage.count({ where: whereClause }),
      ]);

      return {
        usage: usageRecords as CreditUsage[],
        total_count: totalCount,
        has_more: totalCount > input.offset + input.limit,
      };
    }),

  // Get purchase history
  getPurchaseHistory: protectedProcedure
    .input(PurchaseHistoryQuerySchema)
    .query(
      async ({
        ctx,
        input,
      }): Promise<{
        purchases: Purchase[];
        total_count: number;
        has_more: boolean;
      }> => {
        const whereClause: any = { userId: ctx.session.user.id };

        if (input.status) {
          whereClause.status = input.status;
        }

        if (input.startDate || input.endDate) {
          whereClause.createdAt = {};
          if (input.startDate) {
            whereClause.createdAt.gte = new Date(input.startDate);
          }
          if (input.endDate) {
            whereClause.createdAt.lte = new Date(input.endDate);
          }
        }

        const [purchases, totalCount] = await Promise.all([
          db.purchase.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip: input.offset,
            take: input.limit,
          }),
          db.purchase.count({ where: whereClause }),
        ]);

        return {
          purchases: purchases as Purchase[],
          total_count: totalCount,
          has_more: totalCount > input.offset + input.limit,
        };
      },
    ),

  // Get credit packages available for purchase
  getCreditPackages: protectedProcedure.query(() => {
    return DEFAULT_CREDIT_PACKAGES;
  }),

  // Check if user has sufficient credits for an action
  checkCredits: protectedProcedure
    .input(
      z.object({
        reason: z.string().refine(isValidCreditUsageReason),
        amount: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { credits: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const requiredCredits =
        input.amount || getCreditCost(input.reason as CreditUsageReason);
      const hasCredits = user.credits >= requiredCredits;

      return {
        has_credits: hasCredits,
        current_credits: user.credits,
        required_credits: requiredCredits,
        shortfall: hasCredits ? 0 : requiredCredits - user.credits,
      };
    }),

  // Admin: Get credit analytics
  getCreditAnalytics: adminProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      const cutoffDate = new Date(
        Date.now() - input.days * 24 * 60 * 60 * 1000,
      );

      // Get user statistics
      const [
        totalUsersWithCredits,
        totalCreditsInCirculation,
        todaysPurchases,
        todaysUsage,
        averageCreditsPerUser,
        recentPurchases,
      ] = await Promise.all([
        db.user.count({ where: { credits: { gt: 0 } } }),
        db.user.aggregate({ _sum: { credits: true } }),
        db.purchase.aggregate({
          where: {
            status: "completed",
            completedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          _sum: { credits: true, amount: true },
        }),
        db.creditUsage.aggregate({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            credits: { gt: 0 }, // Only actual usage, not additions
          },
          _sum: { credits: true },
        }),
        db.user.aggregate({ _avg: { credits: true } }),
        db.purchase.findMany({
          where: {
            status: "completed",
            completedAt: { gte: cutoffDate },
          },
          select: { packageType: true, amount: true },
        }),
      ]);

      // Calculate most popular package
      const packageCounts: Record<string, number> = {};
      for (const purchase of recentPurchases) {
        packageCounts[purchase.packageType] =
          (packageCounts[purchase.packageType] || 0) + 1;
      }

      const mostPopularPackage = Object.entries(packageCounts).reduce(
        (max, [pkg, count]) =>
          count > max.count ? { package: pkg, count } : max,
        { package: "starter", count: 0 },
      ).package;

      // Calculate conversion rate (users who purchased vs total users)
      const totalUsers = await db.user.count();
      const purchasingUsers = await db.purchase.count({
        where: { status: "completed" },
        distinct: ["userId"],
      });

      return {
        total_users_with_credits: totalUsersWithCredits,
        total_credits_in_circulation:
          totalCreditsInCirculation._sum.credits || 0,
        total_credits_purchased_today: todaysPurchases._sum.credits || 0,
        total_credits_spent_today: todaysUsage._sum.credits || 0,
        average_credits_per_user:
          Math.round((averageCreditsPerUser._avg.credits || 0) * 100) / 100,
        conversion_rate:
          totalUsers > 0
            ? Math.round((purchasingUsers / totalUsers) * 10000) / 100
            : 0,
        most_popular_package: mostPopularPackage,
        revenue_today: todaysPurchases._sum.amount || 0,
        revenue_this_month: recentPurchases.reduce(
          (sum: number, p: any) => sum + p.amount,
          0,
        ),
      };
    }),

  // Admin: Adjust user credits
  adminAdjustCredits: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        reason: z.string(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const adjustment = input.amount > 0 ? "increment" : "decrement";
      const absoluteAmount = Math.abs(input.amount);

      const result = await db.$transaction(async (tx: any) => {
        const updatedUser = await tx.user.update({
          where: { id: input.userId },
          data: { credits: { [adjustment]: absoluteAmount } },
          select: { credits: true, email: true },
        });

        await tx.creditUsage.create({
          data: {
            userId: input.userId,
            credits: input.amount > 0 ? -absoluteAmount : absoluteAmount,
            reason: "admin_adjustment",
            metadata: {
              adjustment_reason: input.reason,
              admin_note: input.note,
              original_amount: input.amount,
            },
          },
        });

        return updatedUser;
      });

      return {
        success: true,
        user_email: result.email,
        new_balance: result.credits,
      };
    }),
});
