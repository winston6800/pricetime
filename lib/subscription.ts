import { prisma } from './db';

/**
 * Check if user has an active Pro subscription
 */
export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return false;
  }

  // Active subscription statuses
  const activeStatuses = ['active', 'trialing'];
  return activeStatuses.includes(subscription.status) && subscription.plan === 'pro';
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      isPro: false,
      status: 'free',
      plan: 'free',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  return {
    isPro: ['active', 'trialing'].includes(subscription.status) && subscription.plan === 'pro',
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

/**
 * Get or create Stripe customer for user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  // Check if customer already exists
  const existing = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing.stripeCustomerId;
  }

  // Create new Stripe customer
  const stripe = (await import('./stripe')).stripe;
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Save to database
  await prisma.stripeCustomer.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

