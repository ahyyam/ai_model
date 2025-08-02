# Environment Variables Setup for Zarta

This guide will help you set up all the required environment variables for deploying Zarta to Vercel and Firebase.

## Quick Setup

1. **Copy the template**: Copy `.env.example` to `.env.local`
2. **Fill in your values**: Replace all `your_*` placeholders with your actual API keys
3. **Deploy**: Run `pnpm run deploy`

## Required Environment Variables

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### OpenAI Configuration
```env
OPENAI_API_KEY=your_openai_api_key
```

### Stripe Configuration
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Stripe Price IDs
```env
STRIPE_BASIC_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ELITE_PRICE_ID=price_xxx
STRIPE_MINI_PRICE_ID=price_xxx
STRIPE_STANDARD_PRICE_ID=price_xxx
STRIPE_PLUS_PRICE_ID=price_xxx
```

## How to Get These Values

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click on the web app (</>) icon
6. Copy the config values

### OpenAI Setup
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new API key
4. Copy the key (starts with `sk-`)

### Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API Keys
3. Copy the publishable and secret keys
4. Go to Products to create your pricing plans
5. Copy the Price IDs (start with `price_`)

## Deployment

### Vercel Deployment
```bash
# 1. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 2. Deploy
pnpm run deploy
```

### Firebase Deployment
```bash
# 1. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 2. Deploy
node deploy-firebase.js
```

## Security Notes

- ✅ **Never commit** `.env.local` to git
- ✅ **Use environment variables** in production
- ✅ **Rotate API keys** regularly
- ✅ **Use different keys** for development and production

## Troubleshooting

### Common Issues

1. **"env.local file not found"**
   - Make sure you've created `.env.local` from `.env.example`
   - Check that the file is in the root directory

2. **"API key invalid"**
   - Verify your API keys are correct
   - Check that you've copied the full key

3. **"Firebase connection failed"**
   - Verify Firebase project settings
   - Check that Auth, Firestore, and Storage are enabled

4. **"Stripe checkout failed"**
   - Verify Stripe keys are correct
   - Check that Price IDs exist in your Stripe dashboard 