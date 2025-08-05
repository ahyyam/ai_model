# Environment Variables Template

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

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

## Important Notes:

1. **STRIPE_WEBHOOK_SECRET**: This is NOT a URL. It's a secret key that starts with `whsec_` provided by Stripe when you create a webhook endpoint.

2. **For Local Development**: Use Stripe CLI to get a webhook secret:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   The CLI will output a webhook secret like `whsec_1234567890abcdef...` - use this in your `.env` file.

3. **Price IDs**: Replace the placeholder values with actual Stripe price IDs from your Stripe dashboard.

4. **Never commit your `.env` file**: Make sure `.env` is in your `.gitignore` file. 