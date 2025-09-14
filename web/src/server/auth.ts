import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
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
export const authConfig: NextAuthConfig = {
  callbacks: {
    session: ({ session, user }) => {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.credits = (user as any).credits ?? 0;
        session.user.totalSpent = (user as any).totalSpent ?? 0;
        session.user.relationshipStage =
          (user as any).relationshipStage ?? "new";
        session.user.totalInteractions = (user as any).totalInteractions ?? 0;
      }
      return session;
    },
    signIn: async ({ user, account }) => {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if this is a new user
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser && user.email) {
            // New user - give them free trial credits
            const freeTrialCredits = parseInt(env.FREE_TRIAL_CREDITS || "5");

            // The adapter will create the user, we just need to track the signup
            console.log(
              `New user signing up: ${user.email} with ${freeTrialCredits} free credits`,
            );
          }

          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db) as any,
  providers: [
    // Only add OAuth providers if keys are configured
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: { strategy: "database" },
  events: {
    createUser: async ({ user }) => {
      // Give new users free trial credits
      const freeTrialCredits = parseInt(env.FREE_TRIAL_CREDITS || "5");

      await db.user.update({
        where: { id: user.id },
        data: {
          credits: freeTrialCredits,
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

      console.log(
        `New user created: ${user.email} with ${freeTrialCredits} free credits`,
      );
    },
  },
  debug: false,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Wrapper for `auth()` so that you don't need to import it in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async () => {
  return await auth();
};
