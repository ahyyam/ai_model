# Environment Variables Template

This document lists all the required environment variables for the AI image generation pipeline.

## Firebase Configuration

```env
# Firebase Client SDK (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin SDK (for backend API endpoints)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

## AI Services

```env
# OpenAI API (for prompt generation; model gpt-4)
OPENAI_API_KEY=

# Runway ML API (for image generation)
# Prefer RUNWAYML_API_SECRET; RUNWAY_API_KEY is also accepted
RUNWAYML_API_SECRET=your_runway_api_key_here
RUNWAY_API_KEY=

# Optional overrides
# RUNWAY_API_BASE=https://api.runwayml.com/v1
# RUNWAY_MODEL=gen4_image
```

## Stripe Configuration (for billing)

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_basic_monthly
STRIPE_PRO_PRICE_ID=price_pro_monthly
STRIPE_ELITE_PRICE_ID=price_elite_monthly
```

## Vercel Configuration

```env
# Vercel (if deploying to Vercel)
VERCEL_URL=your-app.vercel.app
```

## Setup Instructions

1. **Firebase Setup:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Download the service account key for Admin SDK
   - Set up Firestore security rules
   - Set up Storage security rules

2. **OpenAI Setup:**
   - Create an account at https://platform.openai.com
   - Generate an API key
   - Ensure you have access to GPT-4o-mini model

3. **Runway Setup:**
   - Create an account at https://runwayml.com
   - Generate an API key
   - Ensure you have access to Gen-4 Image model

4. **Stripe Setup:**
   - Create a Stripe account at https://stripe.com
   - Set up products and pricing plans
   - Configure webhooks for subscription management

## Security Notes

- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate API keys
- Set up proper CORS and security headers
- Use environment-specific Firebase projects 

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID= 