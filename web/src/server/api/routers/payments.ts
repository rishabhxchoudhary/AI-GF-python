import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import Stripe from "stripe";
import { env } from "~/env";
import {
  type CreditPackage,
  type Purchase,
  type StripeCheckoutSession,
  type PurchaseResponse,
  DEFAULT_CREDIT_PACKAGES,
  getPackageById,
} from "~/types/credits";

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Input validation schemas
const CreateCheckoutSessionInputSchema = z.object({
  packageId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  couponCode: z.string().optional(),
});

const HandleWebhookInputSchema = z.object({
  signature: z.string(),
  body: z.string(),
});

const VerifyPaymentInputSchema = z.object({
  sessionId: z.string(),
});

// Helper functions
async function createStripeCheckoutSession(
  userId: string,
  userEmail: string,
  creditPackage: CreditPackage,
  successUrl?: string,
  cancelUrl?: string,
  couponCode?: string
): Promise<Stripe.Checkout.Session> {
  const baseUrl = env.APP_URL || env.NEXTAUTH_URL || "http://localhost:3000";

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ["card"],
    mode: "payment",
    success_url:
      successUrl ||
      `${baseUrl}/dashboard/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${baseUrl}/pricing?cancelled=true`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${creditPackage.name} - ${creditPackage.credits} Credits`,
            description: `Get ${creditPackage.credits} credits to chat with your AI girlfriend`,
            images: [`${baseUrl}/images/credits-creditPackage.jpg`],
            metadata: {
              package_id: creditPackage.id,
              credits: creditPackage.credits.toString(),
            },
          },
          unit_amount: Math.round(creditPackage.price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packageId: creditPackage.id,
      credits: creditPackage.credits.toString(),
      package_name: creditPackage.name,
    },
    allow_promotion_codes: true,
  };

  // Apply coupon if provided
  if (couponCode) {
    try {
      const coupons = await stripe.coupons.list({ limit: 100 });
      const validCoupon = coupons.data.find(
        (coupon) => coupon.id === couponCode && coupon.valid
      );

      if (validCoupon) {
        sessionConfig.discounts = [{ coupon: couponCode }];
      }
    } catch (error) {
      console.warn("Failed to apply coupon:", error);
      // Continue without coupon rather than failing
    }
  }

  return await stripe.checkout.sessions.create(sessionConfig);
}

async function handleSuccessfulPayment(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id;
  const packageId = session.metadata?.packageId;
  const credits = parseInt(session.metadata?.credits || "0");
  const packageName = session.metadata?.package_name || "Unknown";

  if (!userId || !packageId || !credits) {
    throw new Error("Missing required metadata in Stripe session");
  }

  // Use transaction to ensure atomicity
  await db.$transaction(async (tx) => {
    // Create purchase record
    const purchase = await tx.purchase.create({
      data: {
        userId,
        stripeSessionId: session.id,
        status: "completed",
        credits,
        amount: (session.amount_total || 0) / 100, // Convert from cents
        currency: session.currency || "usd",
        packageType: packageId,
        completedAt: new Date(),
      },
    });

    // Add credits to user account
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: { increment: credits },
        totalSpent: { increment: (session.amount_total || 0) / 100 },
      },
    });

    // Record credit addition
    await tx.creditUsage.create({
      data: {
        userId,
        credits: -credits, // Negative for credits added
        reason: "bonus", // Purchase completion
        metadata: {
          purchase_id: purchase.id,
          stripe_session_id: session.id,
          package_name: packageName,
          amount_paid: (session.amount_total || 0) / 100,
        },
      },
    });

    // Track analytics
    await tx.userActivity.create({
      data: {
        userId,
        action: "purchase_completed",
        metadata: {
          package_id: packageId,
          credits_purchased: credits,
          amount_paid: (session.amount_total || 0) / 100,
          stripe_session_id: session.id,
        },
      },
    });
  });
}

async function handleFailedPayment(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id;
  const packageId = session.metadata?.packageId;
  const credits = parseInt(session.metadata?.credits || "0");

  if (!userId || !packageId) return;

  // Record failed purchase
  await db.purchase.create({
    data: {
      userId,
      stripeSessionId: session.id,
      status: "failed",
      credits,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || "usd",
      packageType: packageId,
      failureReason: "Payment failed during checkout",
    },
  });

  // Track analytics
  await db.userActivity.create({
    data: {
      userId,
      action: "purchase_failed",
      metadata: {
        package_id: packageId,
        failure_reason: "Payment failed during checkout",
        stripe_session_id: session.id,
      },
    },
  });
}

export const paymentsRouter = createTRPCRouter({
  // Create Stripe checkout session
  createCheckoutSession: protectedProcedure
    .input(CreateCheckoutSessionInputSchema)
    .mutation(async ({ ctx, input }): Promise<PurchaseResponse> => {
      try {
        const creditPackage = getPackageById(input.packageId);
        if (!creditPackage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credit package not found",
          });
        }

        const user = ctx.session.user;
        if (!user.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email is required for payment processing",
          });
        }

        // Check for existing pending session
        const existingPurchase = await db.purchase.findFirst({
          where: {
            userId: user.id,
            status: "pending",
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          },
        });

        if (existingPurchase) {
          // Try to retrieve existing Stripe session
          try {
            const existingSession = await stripe.checkout.sessions.retrieve(
              existingPurchase.stripeSessionId
            );

            if (existingSession.status === "open") {
              return {
                success: true,
                checkout_session: {
                  sessionId: existingSession.id,
                  url: existingSession.url || "",
                  packageId: input.packageId,
                  credits: creditPackage.credits,
                  amount: creditPackage.price,
                  expiresAt: new Date(
                    existingSession.expires_at * 1000
                  ).toISOString(),
                },
              };
            }
          } catch (error) {
            // If session retrieval fails, create a new one
            console.warn("Failed to retrieve existing session:", error);
          }
        }

        // Create new Stripe checkout session
        const session = await createStripeCheckoutSession(
          user.id,
          user.email,
          creditPackage,
          input.successUrl,
          input.cancelUrl,
          input.couponCode
        );

        if (!session.url) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create checkout session URL",
          });
        }

        // Record pending purchase
        await db.purchase.create({
          data: {
            userId: user.id,
            stripeSessionId: session.id,
            status: "pending",
            credits: creditPackage.credits,
            amount: creditPackage.price,
            currency: "usd",
            packageType: input.packageId,
          },
        });

        // Track analytics
        await db.userActivity.create({
          data: {
            userId: user.id,
            action: "checkout_initiated",
            metadata: {
              package_id: input.packageId,
              credits: creditPackage.credits,
              amount: creditPackage.price,
              stripe_session_id: session.id,
            },
          },
        });

        return {
          success: true,
          checkout_session: {
            sessionId: session.id,
            url: session.url,
            packageId: input.packageId,
            credits: creditPackage.credits,
            amount: creditPackage.price,
            expiresAt: new Date(session.expires_at * 1000).toISOString(),
          },
        };
      } catch (error) {
        console.error("Stripe checkout session creation failed:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment session",
        });
      }
    }),

  // Verify payment completion
  verifyPayment: protectedProcedure
    .input(VerifyPaymentInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(
          input.sessionId
        );

        // Find purchase record
        const purchase = await db.purchase.findFirst({
          where: {
            userId: ctx.session.user.id,
            stripeSessionId: input.sessionId,
          },
        });

        if (!purchase) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Purchase record not found",
          });
        }

        return {
          session_status: session.status,
          payment_status: session.payment_status,
          purchase_status: purchase.status,
          amount_paid: session.amount_total ? session.amount_total / 100 : 0,
          credits_purchased: purchase.credits,
          completed_at: purchase.completedAt?.toISOString(),
        };
      } catch (error) {
        console.error("Payment verification failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify payment",
        });
      }
    }),

  // Get user's payment methods
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user's email to search for Stripe customers
      const userEmail = ctx.session.user.email;
      if (!userEmail) {
        return { payment_methods: [] };
      }

      // Find Stripe customer
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return { payment_methods: [] };
      }

      const customer = customers.data[0]!;
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: "card",
      });

      return {
        payment_methods: paymentMethods.data.map((pm) => ({
          id: pm.id,
          type: pm.type,
          card: pm.card
            ? {
                brand: pm.card.brand,
                last4: pm.card.last4,
                exp_month: pm.card.exp_month,
                exp_year: pm.card.exp_year,
              }
            : null,
        })),
      };
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      return { payment_methods: [] };
    }
  }),

  // Handle Stripe webhook (public endpoint)
  handleWebhook: publicProcedure
    .input(HandleWebhookInputSchema)
    .mutation(async ({ input }) => {
      try {
        const sig = input.signature;
        const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Webhook secret not configured",
          });
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(
            input.body,
            sig,
            webhookSecret
          );
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid webhook signature",
          });
        }

        // Handle different event types
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("Processing completed checkout session:", session.id);

            if (session.payment_status === "paid") {
              await handleSuccessfulPayment(session);
            }
            break;
          }

          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("Checkout session expired:", session.id);

            // Update purchase status to cancelled
            await db.purchase.updateMany({
              where: { stripeSessionId: session.id },
              data: { status: "cancelled" },
            });
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log("Payment failed:", paymentIntent.id);

            // Find associated session and handle failure
            if (paymentIntent.metadata?.session_id) {
              try {
                const session = await stripe.checkout.sessions.retrieve(
                  paymentIntent.metadata.session_id
                );
                await handleFailedPayment(session);
              } catch (error) {
                console.error("Failed to handle payment failure:", error);
              }
            }
            break;
          }

          case "invoice.payment_succeeded": {
            // Handle subscription payments (if implemented later)
            const invoice = event.data.object as Stripe.Invoice;
            console.log("Invoice payment succeeded:", invoice.id);
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }

        return { success: true, event_type: event.type };
      } catch (error) {
        console.error("Webhook processing failed:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Webhook processing failed",
        });
      }
    }),

  // Get Stripe customer portal URL for managing billing
  getCustomerPortalUrl: protectedProcedure
    .input(z.object({ returnUrl: z.string().url().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userEmail = ctx.session.user.email;
        if (!userEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email is required",
          });
        }

        // Find or create Stripe customer
        let customers = await stripe.customers.list({
          email: userEmail,
          limit: 1,
        });

        let customerId: string;
        if (customers.data.length === 0) {
          // Create new customer
          const customer = await stripe.customers.create({
            email: userEmail,
            name: ctx.session.user.name || undefined,
            metadata: {
              userId: ctx.session.user.id,
            },
          });
          customerId = customer.id;
        } else {
          customerId = customers.data[0]!.id;
        }

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url:
            input.returnUrl || `${env.NEXTAUTH_URL}/dashboard/credits`,
        });

        return {
          success: true,
          portal_url: portalSession.url,
        };
      } catch (error) {
        console.error("Failed to create customer portal session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create customer portal session",
        });
      }
    }),

  // Get payment analytics (admin only)
  getPaymentAnalytics: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      // Check admin permission
      const userEmail = ctx.session.user.email;
      const adminEmails = env.ADMIN_EMAILS?.split(",") || [];

      if (!adminEmails.includes(userEmail || "")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const cutoffDate = new Date(
        Date.now() - input.days * 24 * 60 * 60 * 1000
      );

      const [
        totalRevenue,
        recentPurchases,
        failedPurchases,
        topPackages,
        conversionStats,
      ] = await Promise.all([
        // Total revenue
        db.purchase.aggregate({
          where: {
            status: "completed",
            completedAt: { gte: cutoffDate },
          },
          _sum: { amount: true },
          _count: true,
        }),

        // Recent successful purchases
        db.purchase.findMany({
          where: {
            status: "completed",
            completedAt: { gte: cutoffDate },
          },
          select: {
            packageType: true,
            amount: true,
            credits: true,
            completedAt: true,
          },
        }),

        // Failed purchases
        db.purchase.count({
          where: {
            status: { in: ["failed", "cancelled"] },
            createdAt: { gte: cutoffDate },
          },
        }),

        // Top selling packages
        db.purchase.groupBy({
          by: ["packageType"],
          where: {
            status: "completed",
            completedAt: { gte: cutoffDate },
          },
          _count: true,
          _sum: { amount: true, credits: true },
        }),

        // Conversion stats
        db.userActivity.groupBy({
          by: ["action"],
          where: {
            action: { in: ["checkout_initiated", "purchase_completed"] },
            timestamp: { gte: cutoffDate },
          },
          _count: true,
        }),
      ]);

      const checkoutInitiated =
        conversionStats.find((s) => s.action === "checkout_initiated")
          ?._count || 0;
      const purchaseCompleted =
        conversionStats.find((s) => s.action === "purchase_completed")
          ?._count || 0;
      const conversionRate =
        checkoutInitiated > 0
          ? (purchaseCompleted / checkoutInitiated) * 100
          : 0;

      return {
        total_revenue: totalRevenue._sum.amount || 0,
        total_transactions: totalRevenue._count,
        failed_purchases: failedPurchases,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        average_order_value:
          totalRevenue._count > 0
            ? Math.round(
                ((totalRevenue._sum.amount || 0) / totalRevenue._count) * 100
              ) / 100
            : 0,
        top_packages: topPackages
          .sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0))
          .slice(0, 5),
        daily_revenue: this.calculateDailyRevenue(recentPurchases, input.days),
      };
    }),
});

// Helper function for daily revenue calculation
function calculateDailyRevenue(purchases: any[], days: number): number[] {
  const dailyRevenue = new Array(days).fill(0);
  const now = new Date();

  purchases.forEach((purchase) => {
    if (purchase.completedAt) {
      const purchaseDate = new Date(purchase.completedAt);
      const daysAgo = Math.floor(
        (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysAgo >= 0 && daysAgo < days) {
        dailyRevenue[days - 1 - daysAgo] += purchase.amount;
      }
    }
  });

  return dailyRevenue;
}
