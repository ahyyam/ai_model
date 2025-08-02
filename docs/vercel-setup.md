# Vercel Deployment Setup

This project uses Vercel for hosting while keeping Firebase for Auth, Database, and Storage.

## Architecture

| Layer | Tool | Why |
|-------|------|-----|
| **Frontend** | Vercel | Fastest React hosting + clean CI/CD |
| **Auth** | Firebase Auth | Simple, scalable, great with Firebase UI SDK |
| **Database** | Firestore | Flexible, real-time, image-friendly |
| **Storage** | Firebase Storage | Ideal for uploading product/reference images |
| **Image Gen** | OpenAI API (DALL·E) | External API |
| **Dashboard Hosting** | Vercel | Push to Git = live deploy |
| **Backend Functions** | Vercel Edge Functions | Handle OpenAI calls securely |

## Setup Instructions

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Create Storage buckets for images and projects
5. Set up Firestore security rules
6. Set up Storage security rules

### 4. Deploy to Vercel

#### Option 1: Using the deployment script
```bash
pnpm run deploy
```

#### Option 2: Manual deployment
```bash
# Build the project
pnpm build

# Deploy to Vercel
vercel --prod
```

#### Option 3: Git-based deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

### 5. Environment Variables in Vercel

After deployment, add your environment variables in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add all the variables from your `.env.local` file

## Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects can only be accessed by their owner
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    match /projects/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Benefits of This Setup

### Vercel Benefits
- **Fastest hosting** for React/Next.js applications
- **Automatic deployments** from Git
- **Edge functions** for API routes
- **Global CDN** for static assets
- **Zero configuration** for Next.js

### Firebase Benefits
- **Scalable authentication** with multiple providers
- **Real-time database** with Firestore
- **File storage** with Firebase Storage
- **Security rules** for data protection
- **Offline support** for mobile apps

## Troubleshooting

### Common Issues

1. **Environment variables not working**
   - Make sure all variables are set in Vercel dashboard
   - Check that variable names match exactly

2. **Firebase connection issues**
   - Verify Firebase config in `.env.local`
   - Check Firebase project settings

3. **Build failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed

4. **API route timeouts**
   - Increase function timeout in `vercel.json`
   - Optimize API route performance

### Support

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs) 