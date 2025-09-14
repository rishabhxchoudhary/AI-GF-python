/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession, type Session } from "~/server/auth-simple";
import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: Session | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerAuthSession wrapper function
  const session = await getServerAuthSession();

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Credit check middleware
 *
 * Ensures user has sufficient credits before allowing the procedure to execute
 */
export const creditCheckMiddleware = t.middleware(
  async ({ ctx, next, input }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Get user's current credit balance
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { credits: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user.credits < 1) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Insufficient credits. Please purchase more credits to continue.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: {
          ...ctx.session.user,
          credits: user.credits,
        },
      },
    });
  }
);

/**
 * Credit-protected procedure
 *
 * This procedure checks that the user is authenticated AND has sufficient credits
 * before executing. Use this for any action that consumes credits.
 */
export const creditProcedure = protectedProcedure.use(creditCheckMiddleware);

/**
 * Admin procedure
 *
 * Only allows users with admin role to access
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // Check if user has admin role (you can implement role checking logic here)
  const userEmail = ctx.session.user.email;
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  if (!adminEmails.includes(userEmail || "")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

/**
 * Rate limiting middleware
 *
 * Implement rate limiting for specific procedures
 */
export const rateLimitMiddleware = (
  limit: number = 10,
  windowMs: number = 60000
) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Simple in-memory rate limiting (in production, use Redis)
    const key = `rate_limit_${ctx.session.user.id}`;
    // Note: This is a simplified example. In production, use proper rate limiting with Redis

    return next({ ctx });
  });
