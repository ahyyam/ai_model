# Stripe Setup Guide for Modelix.ai

This guide will help you set up Stripe integration for subscription billing in your Modelix.ai project.

## 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account verification process
   - Note your API keys from the Dashboard

2. **Get Your API Keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy your **Publishable Key** and **Secret Key**
   - For testing, use the test keys (start with `pk_test_` and `sk_test_`)

## 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Subscription Plan Price IDs
STRIPE_BASIC_PRICE_ID=price_basic_placeholder
STRIPE_PRO_PRICE_ID=price_pro_placeholder
STRIPE_ELITE_PRICE_ID=price_elite_placeholder

# Stripe Token Pack Add-on Price IDs
STRIPE_MINI_PRICE_ID=price_mini_placeholder
STRIPE_STANDARD_PRICE_ID=price_standard_placeholder
STRIPE_PLUS_PRICE_ID=price_plus_placeholder

# App URL for webhooks and redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Create Products and Prices in Stripe

### Step 1: Create Subscription Plans
1. Go to Stripe Dashboard → Products
2. Create three subscription products:

**Basic Plan**
- Name: "Basic Plan"
- Description: "Perfect for getting started with image generation"
- Price: $30/month
- Features: 10 image generations, Basic styling options, Email support, $3.00 per image

**Pro Plan**
- Name: "Pro Plan" 
- Description: "Great value for growing businesses and creators"
- Price: $40/month
- Features: 20 image generations, Advanced styling options, Priority processing, Priority support, $2.00 per image

**Elite Plan**
- Name: "Elite Plan"
- Description: "Best value for high-volume image generation needs"
- Price: $75/month
- Features: 50 image generations, All Pro features, Custom integrations, Dedicated support, $1.50 per image

### Step 2: Create Token Pack Add-ons
1. Create three one-time purchase products for additional tokens:

**Mini Token Pack**
- Name: "Mini Token Pack"
- Description: "3 additional image generation tokens"
- Price: $10 (one-time)
- Tokens: 3 images

**Standard Token Pack**
- Name: "Standard Token Pack"
- Description: "6 additional image generation tokens"
- Price: $20 (one-time)
- Tokens: 6 images

**Plus Token Pack**
- Name: "Plus Token Pack"
- Description: "10 additional image generation tokens"
- Price: $30 (one-time)
- Tokens: 10 images

### Step 3: Get Price IDs
1. After creating each product, click on it
2. Go to the **Pricing** section
3. Copy the **Price ID** (starts with `price_`)
4. Update your `.env` file with the actual price IDs

**⚠️ IMPORTANT: Product ID vs Price ID**
- **Product ID** starts with `prod_` (e.g., `prod_SmNBEyLLA4jtqw`) - DO NOT USE THIS
- **Price ID** starts with `price_` (e.g., `price_1ABC123DEF456`) - USE THIS ONE
- You need the **Price ID**, not the Product ID
- In Stripe Dashboard: Products → [Your Product] → Pricing → Copy Price ID

**Important Notes:**
- Subscription plans should be set to recurring billing (monthly)
- Token packs should be set to one-time purchases
- Make sure to use the correct price IDs for each product type

## 4. Webhook Setup

### Step 1: Create Webhook Endpoint
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Step 2: Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### Step 3: Local Development Setup (Recommended)
For local development, use Stripe CLI to forward webhooks to your local server:

1. **Install Stripe CLI**
   - Download from [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Or install via package manager: `brew install stripe/stripe-cli/stripe`

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Use the webhook secret from Stripe CLI**
   - The CLI will output a webhook secret like: `whsec_1234567890abcdef...`
   - Use this secret in your `.env` file for local development:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
   ```

5. **Alternative: Use ngrok for public URL**
   - Install ngrok: `npm install -g ngrok`
   - Expose localhost: `ngrok http 3000`
   - Use the ngrok URL in Stripe Dashboard: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`

## 5. Testing

### Test Mode
- Use test card numbers from [Stripe's test cards](https://stripe.com/docs/testing#cards)
- Test webhook events using Stripe CLI or Dashboard

### Test Card Numbers
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`

### Testing Subscription Plans
1. Test each subscription plan (Basic, Pro, Elite)
2. Verify webhook events are received
3. Test subscription cancellation and updates

### Testing Token Packs
1. Test each token pack purchase (Mini, Standard, Plus)
2. Verify one-time payment processing
3. Test token pack delivery to user account

## 6. Integration Points

### Frontend Components
- `app/billing/page.tsx` - Customer billing portal with subscription plans and token packs
- `components/pricing-section.tsx` - Pricing display for subscription plans
- Checkout buttons in various components

### API Routes
- `/api/stripe/create-checkout-session` - Create subscription and token pack checkout
- `/api/stripe/create-portal-session` - Customer billing portal
- `/api/stripe/webhook` - Handle Stripe events
- `/api/stripe/customer` - Customer management operations

### Utility Functions
- `lib/stripe.ts` - Main Stripe configuration and product definitions
- `lib/stripe-customer.ts` - Customer management functions

### Product Configuration
The application uses the following product structure defined in `lib/stripe.ts`:

```typescript
export const STRIPE_PRODUCTS = {
  BASIC: { name: 'Basic Plan', priceId: process.env.STRIPE_BASIC_PRICE_ID },
  PRO: { name: 'Pro Plan', priceId: process.env.STRIPE_PRO_PRICE_ID },
  ELITE: { name: 'Elite Plan', priceId: process.env.STRIPE_ELITE_PRICE_ID },
  MINI: { name: 'Mini Token Pack', priceId: process.env.STRIPE_MINI_PRICE_ID },
  STANDARD: { name: 'Standard Token Pack', priceId: process.env.STRIPE_STANDARD_PRICE_ID },
  PLUS: { name: 'Plus Token Pack', priceId: process.env.STRIPE_PLUS_PRICE_ID },
}
```

## 7. Production Deployment

### Environment Variables
- Update `.env` with production Stripe keys
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Update webhook endpoint URL
- Ensure all price IDs are correctly configured

### Security
- Never expose `STRIPE_SECRET_KEY` in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Validate all price IDs before processing payments

## 8. Common Issues

### Webhook Verification Fails
- Check that `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook endpoint is accessible
- Verify the webhook URL is correct

### Checkout Session Creation Fails
- Verify `STRIPE_SECRET_KEY` is correct
- Check that price IDs exist in your Stripe account
- Ensure all required fields are provided
- Verify price IDs match the expected product types (subscription vs one-time)

### Customer Portal Access Denied
- Verify customer ID exists in Stripe
- Check that customer has active subscriptions
- Ensure proper permissions are set

### Token Pack Purchase Issues
- Verify token pack price IDs are configured for one-time purchases
- Check that webhook events are properly handled for token pack deliveries
- Ensure token balance is updated correctly after purchase

## 9. Next Steps

1. **Database Integration**: Connect Stripe customer IDs to your user database
2. **Subscription Management**: Implement subscription status tracking
3. **Usage Limits**: Add usage tracking based on subscription plans
4. **Token Management**: Implement token balance tracking and consumption
5. **Analytics**: Track subscription metrics, token pack sales, and revenue
6. **Customer Support**: Set up Stripe support tools

## 10. Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Products and Prices](https://stripe.com/docs/products-prices)
- [Stripe Checkout](https://stripe.com/docs/checkout) 