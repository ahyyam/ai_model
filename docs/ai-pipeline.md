# AI Image Generation Pipeline

This document describes the complete AI image generation pipeline that replaces the mock generation system with real AI-powered image synthesis.

## Overview

The pipeline uses a combination of:
- **OpenAI GPT-4o-mini** for intelligent prompt generation
- **Runway Gen-4 Image API** for high-quality image synthesis
- **Firebase** for authentication, storage, and database
- **Vercel Edge Functions** for backend API endpoints

## Architecture

```
User Upload → Firebase Storage → OpenAI Prompt Generation → Runway Image Generation → Firebase Storage → User Download
```

## API Endpoints

### `/api/generate` - Main Generation Endpoint

**Method:** POST  
**Authentication:** Required (Firebase Auth token)  
**Credit Check:** Required (1 credit per generation)

**Request Body:**
```json
{
  "referenceImageURL": "string",
  "garmentImageURL": "string", 
  "userPrompt": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "string",
  "finalImageURL": "string",
  "prompt": "string",
  "aspect_ratio": "string"
}
```

**Flow:**
1. Authenticate user and verify credits
2. Upload images to Firebase Storage
3. Generate prompt using OpenAI (or use user prompt)
4. Generate image using Runway API
5. Upload final image to Firebase Storage
6. Update project in Firestore
7. Deduct 1 credit from user

### `/api/edit` - Edit/Version Generation

**Method:** POST  
**Authentication:** Required (Firebase Auth token)  
**Credit Check:** Required (1 credit per edit)

**Request Body:**
```json
{
  "projectId": "string",
  "newPrompt": "string"
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "string",
  "version": 2,
  "finalImageURL": "string",
  "prompt": "string"
}
```

**Flow:**
1. Authenticate user and verify credits
2. Fetch original project data
3. Generate new image using Runway with new prompt
4. Upload new version to Firebase Storage
5. Update project with new version metadata
6. Deduct 1 credit from user

## Firestore Schema

### Projects Collection

```json
{
  "userId": "string",
  "status": "processing" | "complete" | "error",
  "referenceImageURL": "string",
  "garmentImageURL": "string", 
  "finalImageURL": "string",
  "prompt": "string",
  "aspect_ratio": "string",
  "version": 1,
  "versions": [
    {
      "version": 1,
      "prompt": "string",
      "finalImageURL": "string",
      "status": "complete",
      "createdAt": "timestamp"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "error": "string (if status is error)"
}
```

### Users Collection

```json
{
  "uid": "string",
  "email": "string",
  "credits": 10,
  "subscriptionStatus": "basic" | "pro" | "elite",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Storage Structure

```
projects/
├── {userId}/
│   ├── {projectId}/
│   │   ├── garment-{timestamp}.jpg
│   │   ├── reference-{timestamp}.jpg
│   │   ├── final-{timestamp}.jpg
│   │   └── version-{n}-{timestamp}.jpg
│   └── ...
└── ...
```

## Environment Variables

Required environment variables for the AI pipeline:

```env
# OpenAI API
OPENAI_API_KEY=sk-your_openai_api_key

# Runway ML API  
RUNWAY_API_KEY=your_runway_api_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

## Error Handling

The pipeline includes comprehensive error handling:

- **Authentication errors:** 401 Unauthorized
- **Insufficient credits:** 402 Payment Required  
- **Missing data:** 400 Bad Request
- **Generation failures:** 500 Internal Server Error
- **API timeouts:** 500 Internal Server Error

All errors are logged and tracked in Firestore for debugging.

## Security

- All API endpoints require Firebase Auth tokens
- User can only access their own projects
- Credits are verified before generation
- Images are stored in user-specific folders
- API keys are stored server-side only

## Performance

- Images are uploaded to Firebase Storage for fast access
- Generation status is tracked in real-time
- Failed generations can be retried
- Version history is maintained for rollbacks

## Monitoring

- All API calls are logged with timestamps
- Generation success/failure rates are tracked
- Credit usage is monitored
- Error patterns are identified for debugging

## Testing

Test the pipeline with:

```bash
# Test endpoint availability
curl https://your-domain.vercel.app/api/test-generation

# Test with real data (requires authentication)
curl -X POST https://your-domain.vercel.app/api/generate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"referenceImageURL":"...","garmentImageURL":"..."}'
```

## Troubleshooting

Common issues and solutions:

1. **"Unauthorized" errors:** Check Firebase Auth token
2. **"Insufficient credits" errors:** User needs to purchase credits
3. **"Generation failed" errors:** Check OpenAI/Runway API keys and quotas
4. **"Image upload failed" errors:** Check Firebase Storage permissions
5. **"Project not found" errors:** Verify project ID and user ownership

## Future Enhancements

- Batch generation for multiple images
- Advanced prompt engineering
- Image quality assessment
- Automatic retry logic
- Generation queue management
- Real-time progress updates
- Image editing tools
- Style transfer capabilities
