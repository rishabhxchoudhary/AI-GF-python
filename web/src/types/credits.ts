// Credits and payments types for monetization system

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  stripePriceId: string;
  features: string[];
  bonusPercentage?: number;
}

export interface CreditBalance {
  current: number;
  lifetime_purchased: number;
  lifetime_spent: number;
  last_purchase?: string;
  next_expiry?: string;
}

export interface CreditUsage {
  id: string;
  userId: string;
  credits: number;
  reason: CreditUsageReason;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreditUsageStats {
  total_used: number;
  daily_usage: number;
  weekly_usage: number;
  monthly_usage: number;
  most_used_feature: CreditUsageReason;
  usage_by_reason: Record<CreditUsageReason, number>;
  average_daily_usage: number;
}

export interface Purchase {
  id: string;
  userId: string;
  packageId: string;
  stripeSessionId: string;
  status: PurchaseStatus;
  credits: number;
  amount: number;
  currency: string;
  packageName: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface PurchaseHistory {
  purchases: Purchase[];
  total_spent: number;
  total_credits_purchased: number;
  first_purchase?: string;
  last_purchase?: string;
  favorite_package?: string;
}

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
  packageId: string;
  credits: number;
  amount: number;
  expiresAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  packageId: string;
  userId: string;
}

export interface RefundRequest {
  purchaseId: string;
  reason: RefundReason;
  description?: string;
  amount?: number;
}

// Enums
export type PurchaseStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type CreditUsageReason =
  | 'chat_message'
  | 'personality_update'
  | 'relationship_milestone'
  | 'agentic_behavior'
  | 'premium_feature'
  | 'voice_message'
  | 'image_generation'
  | 'extended_conversation'
  | 'priority_response'
  | 'custom_prompt'
  | 'memory_access'
  | 'admin_adjustment'
  | 'refund'
  | 'bonus'
  | 'trial';

export type RefundReason =
  | 'accidental_purchase'
  | 'technical_issue'
  | 'unsatisfied_with_service'
  | 'billing_dispute'
  | 'duplicate_charge'
  | 'other';

export type PaymentProvider = 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';

// Response interfaces for tRPC
export interface CreditStatusResponse {
  balance: CreditBalance;
  usage_stats: CreditUsageStats;
  recent_usage: CreditUsage[];
  low_balance_warning: boolean;
  estimated_days_remaining?: number;
}

export interface PurchaseResponse {
  success: boolean;
  purchase?: Purchase;
  checkout_session?: StripeCheckoutSession;
  error?: string;
}

export interface RefundResponse {
  success: boolean;
  refund_amount?: number;
  processing_time_days: number;
  error?: string;
}

// Input schemas
export interface PurchasePackageInput {
  packageId: string;
  successUrl?: string;
  cancelUrl?: string;
  couponCode?: string;
}

export interface DeductCreditsInput {
  amount: number;
  reason: CreditUsageReason;
  description?: string;
  metadata?: Record<string, any>;
}

export interface AddCreditsInput {
  amount: number;
  reason: CreditUsageReason;
  description?: string;
  purchaseId?: string;
  adminNote?: string;
}

export interface CreditUsageQuery {
  limit?: number;
  offset?: number;
  reason?: CreditUsageReason;
  start_date?: string;
  end_date?: string;
}

export interface PurchaseHistoryQuery {
  limit?: number;
  offset?: number;
  status?: PurchaseStatus;
  start_date?: string;
  end_date?: string;
}

// Default credit packages
export const DEFAULT_CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    price: 4.99,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    features: [
      '10 chat messages',
      'Basic personality features',
      'Standard response time'
    ]
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 50,
    price: 19.99,
    originalPrice: 24.95,
    discount: 20,
    bonusPercentage: 20,
    popular: true,
    stripePriceId: process.env.STRIPE_POPULAR_PRICE_ID || '',
    features: [
      '50 chat messages',
      'Advanced personality evolution',
      'Agentic behaviors',
      'Relationship milestones',
      'Priority support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 100,
    price: 34.99,
    originalPrice: 49.95,
    discount: 30,
    bonusPercentage: 30,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    features: [
      '100 chat messages',
      'Full personality system',
      'Advanced agentic behaviors',
      'Detailed relationship tracking',
      'Memory system access',
      'Custom prompts',
      'Priority support'
    ]
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    credits: 250,
    price: 79.99,
    originalPrice: 124.75,
    discount: 35,
    bonusPercentage: 35,
    stripePriceId: process.env.STRIPE_ULTIMATE_PRICE_ID || '',
    features: [
      '250 chat messages',
      'Complete AI girlfriend experience',
      'All premium features',
      'Extended conversation sessions',
      'Voice message support',
      'Image generation (coming soon)',
      'VIP support',
      'Early access to new features'
    ]
  }
];

// Credit costs for different features
export const CREDIT_COSTS: Record<CreditUsageReason, number> = {
  chat_message: 1,
  personality_update: 0,
  relationship_milestone: 0,
  agentic_behavior: 0,
  premium_feature: 2,
  voice_message: 3,
  image_generation: 5,
  extended_conversation: 2,
  priority_response: 2,
  custom_prompt: 3,
  memory_access: 1,
  admin_adjustment: 0,
  refund: 0,
  bonus: 0,
  trial: 0
};

// Utility functions
export function calculatePackageValue(pkg: CreditPackage): number {
  return pkg.credits / pkg.price;
}

export function getBestValuePackage(packages: CreditPackage[] = DEFAULT_CREDIT_PACKAGES): CreditPackage {
  return packages.reduce((best, current) =>
    calculatePackageValue(current) > calculatePackageValue(best) ? current : best
  );
}

export function getPackageById(id: string, packages: CreditPackage[] = DEFAULT_CREDIT_PACKAGES): CreditPackage | undefined {
  return packages.find(pkg => pkg.id === id);
}

export function calculateEstimatedDaysRemaining(
  currentCredits: number,
  dailyUsage: number
): number | null {
  if (dailyUsage <= 0) return null;
  return Math.floor(currentCredits / dailyUsage);
}

export function shouldShowLowBalanceWarning(
  currentCredits: number,
  dailyUsage: number,
  warningThreshold: number = 5
): boolean {
  if (currentCredits <= warningThreshold) return true;

  const estimatedDays = calculateEstimatedDaysRemaining(currentCredits, dailyUsage);
  return estimatedDays !== null && estimatedDays <= 2;
}

export function formatCreditAmount(amount: number): string {
  return `${amount} credit${amount === 1 ? '' : 's'}`;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
}

export function getCreditCost(reason: CreditUsageReason): number {
  return CREDIT_COSTS[reason] || 1;
}

// Type guards
export function isValidCreditUsageReason(reason: string): reason is CreditUsageReason {
  return Object.keys(CREDIT_COSTS).includes(reason);
}

export function isPurchaseStatus(status: string): status is PurchaseStatus {
  return [
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
  ].includes(status);
}

export function isCreditPackage(obj: any): obj is CreditPackage {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.credits === 'number' &&
    typeof obj.price === 'number' &&
    typeof obj.stripePriceId === 'string' &&
    Array.isArray(obj.features);
}

// Constants
export const FREE_TRIAL_CREDITS = 5;
export const LOW_BALANCE_THRESHOLD = 5;
export const MAX_CREDITS_PER_USER = 10000;
export const CREDIT_EXPIRY_DAYS = null; // Credits never expire
export const MAX_REFUND_DAYS = 30;
export const MIN_PURCHASE_AMOUNT = 1.00;
export const MAX_PURCHASE_AMOUNT = 999.99;

// Analytics types
export interface CreditAnalytics {
  total_users_with_credits: number;
  total_credits_in_circulation: number;
  total_credits_purchased_today: number;
  total_credits_spent_today: number;
  average_credits_per_user: number;
  conversion_rate: number;
  most_popular_package: string;
  revenue_today: number;
  revenue_this_month: number;
}

export interface UserCreditAnalytics {
  user_id: string;
  total_purchased: number;
  total_spent: number;
  current_balance: number;
  first_purchase_date?: string;
  last_purchase_date?: string;
  average_daily_usage: number;
  most_used_feature: CreditUsageReason;
  lifetime_value: number;
}
