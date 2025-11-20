# Vercel Deployment Checklist

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Database
- `DATABASE_URL` - Your Neon PostgreSQL connection string (production)

### Clerk (Authentication)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- `CLERK_SECRET_KEY` - From Clerk Dashboard

### Stripe (Billing)
- `STRIPE_SECRET_KEY` - From Stripe Dashboard (use **LIVE** key for production)
- `STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard (use **LIVE** key for production)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as above (LIVE key)
- `STRIPE_PRO_PRICE_ID` - Your Pro Plan Price ID (LIVE mode)
- `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard webhook configuration (see below)

## Database Migration

**Important:** Run this after first deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure `DATABASE_URL` is set
3. Go to Deployments tab
4. Click on the latest deployment → "View Function Logs"
5. Or use Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

Alternatively, the `postinstall` script will generate Prisma client automatically during build.

## Stripe Webhook Setup (Production)

**Critical:** Set up webhook endpoint in Stripe Dashboard:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Clerk Redirect URLs

Update in Clerk Dashboard:

1. Go to Clerk Dashboard → Paths
2. Set Sign-in redirect: `https://your-domain.vercel.app/app`
3. Set Sign-up redirect: `https://your-domain.vercel.app/app`

## Testing After Deployment

1. ✅ Check homepage loads
2. ✅ Sign up flow works
3. ✅ Sign in flow works
4. ✅ App page loads (authenticated)
5. ✅ "Upgrade to Pro" button works
6. ✅ Stripe Checkout redirects correctly
7. ✅ After payment, webhook processes subscription
8. ✅ Pro badge appears after payment

## Common Issues

### Build Fails
- Check all environment variables are set
- Check `DATABASE_URL` is correct
- Check Prisma client generates (see build logs)

### Webhook Not Working
- Verify webhook URL in Stripe Dashboard matches your Vercel URL
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook events are being sent (Stripe Dashboard → Webhooks → Your endpoint → Events)

### Subscription Not Updating
- Check webhook is receiving events
- Check database has subscription record
- Check webhook handler logs in Vercel function logs

## Switch to Live Mode

**Important:** When ready for real payments:

1. Switch Stripe Dashboard to **Live mode**
2. Update all Stripe keys in Vercel (use LIVE keys, not test keys)
3. Update `STRIPE_PRO_PRICE_ID` to LIVE price ID
4. Create new webhook endpoint for live mode
5. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

