import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Get customer to find user
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const stripeCustomer = await prisma.stripeCustomer.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (!stripeCustomer) {
          console.error('Stripe customer not found in database');
          break;
        }

        // Update or create subscription
        await prisma.subscription.upsert({
          where: { userId: stripeCustomer.userId },
          update: {
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            plan: 'pro',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          },
          create: {
            userId: stripeCustomer.userId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            plan: 'pro',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const stripeCustomer = await prisma.stripeCustomer.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (stripeCustomer) {
          await prisma.subscription.update({
            where: { userId: stripeCustomer.userId },
            data: {
              status: 'canceled',
              cancelAtPeriodEnd: false,
            },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const stripeCustomer = await prisma.stripeCustomer.findUnique({
          where: { stripeCustomerId: invoice.customer as string },
        });

        if (stripeCustomer && invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await prisma.subscription.update({
            where: { userId: stripeCustomer.userId },
            data: {
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const stripeCustomer = await prisma.stripeCustomer.findUnique({
          where: { stripeCustomerId: invoice.customer as string },
        });

        if (stripeCustomer) {
          await prisma.subscription.update({
            where: { userId: stripeCustomer.userId },
            data: {
              status: 'past_due',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

