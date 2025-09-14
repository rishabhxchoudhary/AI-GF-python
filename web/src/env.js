import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL",
      )
      .optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z
      .preprocess(
        // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
        // Since NextAuth.js automatically uses the VERCEL_URL if present.
        (str) => process.env.VERCEL_URL ?? str,
        // VERCEL_URL doesn't include `https` so it cant be validated as a URL
        process.env.VERCEL ? z.string() : z.string().url(),
      )
      .optional(),
    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    // AI Providers
    OPENAI_API_KEY: z.string().optional(),
    HUGGINGFACE_API_KEY: z.string().min(1, "Hugging Face API key is required"),
    // Stripe Configuration
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_STARTER_PRICE_ID: z.string().optional(),
    STRIPE_POPULAR_PRICE_ID: z.string().optional(),
    STRIPE_PREMIUM_PRICE_ID: z.string().optional(),
    STRIPE_ULTIMATE_PRICE_ID: z.string().optional(),
    // Application Configuration
    APP_URL: z.string().url().optional(),
    APP_NAME: z.string().default("AI Girlfriend"),
    // Feature Flags
    ENABLE_FREE_TRIAL: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default("true"),
    FREE_TRIAL_CREDITS: z.string().default("5"),
    ENABLE_REFERRAL_SYSTEM: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default("false"),
    ENABLE_PREMIUM_FEATURES: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default("true"),
    // Content Safety
    OPENAI_MODERATION_ENABLED: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default("true"),
    CONTENT_SAFETY_STRICT_MODE: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default("false"),
    // Rate Limiting
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    // Analytics
    GOOGLE_ANALYTICS_ID: z.string().optional(),
    POSTHOG_KEY: z.string().optional(),
    // Email Configuration
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    // AWS Configuration
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default("us-east-1"),
    AWS_S3_BUCKET: z.string().optional(),
    // Sentry Error Tracking
    SENTRY_DSN: z.string().optional(),
    // Admin Configuration
    ADMIN_EMAILS: z.string().optional(),
  },
  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_NAME: z.string().default("AI Girlfriend"),
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default("false"),
  },
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // OAuth Providers
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    // AI Providers (Hugging Face is primary)
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // Stripe Configuration
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
    STRIPE_POPULAR_PRICE_ID: process.env.STRIPE_POPULAR_PRICE_ID,
    STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
    STRIPE_ULTIMATE_PRICE_ID: process.env.STRIPE_ULTIMATE_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // Application Configuration
    APP_URL: process.env.APP_URL,
    APP_NAME: process.env.APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    // Feature Flags
    ENABLE_FREE_TRIAL: process.env.ENABLE_FREE_TRIAL,
    FREE_TRIAL_CREDITS: process.env.FREE_TRIAL_CREDITS,
    ENABLE_REFERRAL_SYSTEM: process.env.ENABLE_REFERRAL_SYSTEM,
    ENABLE_PREMIUM_FEATURES: process.env.ENABLE_PREMIUM_FEATURES,
    // Content Safety
    OPENAI_MODERATION_ENABLED: process.env.OPENAI_MODERATION_ENABLED,
    CONTENT_SAFETY_STRICT_MODE: process.env.CONTENT_SAFETY_STRICT_MODE,
    // Rate Limiting
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    // Analytics
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    // Email Configuration
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    // AWS Configuration
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    // Sentry Error Tracking
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Admin Configuration
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  },
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
