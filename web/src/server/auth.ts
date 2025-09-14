import { PrismaAdapter } from "@auth/prisma-adapter";
import { auth, type DefaultSession } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: number;
      totalSpent: number;
      relationshipStage: string;
      totalInteractions: number;
      // ...other properties
    } & DefaultSession["user"];
  }

  interface User {
    credits: number;
    totalSpent: number;
    relationshipStage: string;
    totalInteractions: number;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        // Fetch latest user data from database
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            credits: true,
            totalSpent: true,
            relationshipStage: true,
            totalInteractions: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.credits = dbUser.credits;
          session.user.totalSpent = dbUser.totalSpent;
          session.user.relationshipStage = dbUser.relationshipStage;
          session.user.totalInteractions = dbUser.totalInteractions;
        } else {
          // Fallback values if user not found
          session.user.id = user.id;
          session.user.credits = 0;
          session.user.totalSpent = 0;
          session.user.relationshipStage = "new";
          session.user.totalInteractions = 0;
        }
      }
      return session;
    },
    signIn: async ({ user, account, profile }) => {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if this is a new user
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser && user.email) {
            // New user - give them free trial credits
            const freeTrialCredits = parseInt(env.FREE_TRIAL_CREDITS || "5");

            // Create user with initial credits and data
            await db.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                credits: freeTrialCredits,
                relationshipStage: "new",
                totalInteractions: 0,
                totalSpent: 0,
                personalityTraits: {
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
                },
                relationshipData: {
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
                },
                memories: {
                  basic_memory: {},
                  user_preferences: {},
                  inside_jokes: [],
                  unresolved_topics: [],
                  conversation_themes: [],
                  emotional_moments: [],
                },
                userPreferences: {},
                insideJokes: [],
                emotionalMoments: [],
              },
            });

            // Track the signup event
            await db.userActivity.create({
              data: {
                userId: user.id!,
                action: "signup",
                metadata: {
                  provider: account.provider,
                  freeTrialCredits,
                },
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    signIn: async ({ user, account, isNewUser }) => {
      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`);
      }

      // Track sign in activity
      await db.userActivity.create({
        data: {
          userId: user.id!,
          action: "signin",
          metadata: {
            provider: account?.provider,
            isNewUser,
          },
        },
      });
    },
    signOut: async ({ session }) => {
      if (session?.user?.id) {
        // Track sign out activity
        await db.userActivity.create({
          data: {
            userId: session.user.id,
            action: "signout",
            metadata: {},
          },
        });
      }
    },
  },
  debug: env.NODE_ENV === "development",
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: { req: any; res: any }) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
