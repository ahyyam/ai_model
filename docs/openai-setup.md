# OpenAI Setup Guide for Modelix.ai

This guide will help you set up OpenAI integration for AI-powered image generation in your Modelix.ai project.

## 1. OpenAI Account Setup

1. **Create an OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com) and create an account
   - Complete the account verification process
   - Add payment method (required for API usage)

2. **Get Your API Key**
   - Go to OpenAI Platform → API Keys
   - Click "Create new secret key"
   - Copy your **API Key** (starts with `sk-`)
   - Keep this key secure and never share it publicly

## 2. Environment Variables

Add this to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your_api_key_here
```

## 3. API Usage and Costs

### DALL-E 3 Pricing (as of 2024)
- **Standard Quality (1024x1024)**: $0.040 per image
- **HD Quality (1024x1024)**: $0.080 per image
- **Standard Quality (1792x1024)**: $0.080 per image
- **Standard Quality (1024x1792)**: $0.080 per image

### Usage Limits
- Free tier: $5 credit for first 3 months
- Pay-as-you-go: No monthly limits
- Rate limits: 50 requests per minute

## 4. Testing the Configuration

### Test API Key
Visit this endpoint to test your OpenAI configuration:
```
http://localhost:3000/api/openai/test
```

Expected response:
```json
{
  "success": true,
  "message": "OpenAI API key is valid and working",
  "details": {
    "hasApiKey": true,
    "apiKeyValid": true,
    "apiKeyPrefix": "sk-..."
  }
}
```

### Test Image Generation
Use the generate page in your app:
1. Go to `/generate`
2. Upload a garment image
3. Upload a reference image
4. Add a prompt
5. Click "Generate AI Photoshoot"

## 5. Integration Points

### API Routes
- `/api/generate-image` - Main image generation endpoint
- `/api/openai/test` - Configuration test endpoint

### Frontend Components
- `components/generate/step-generate.tsx` - Image generation UI
- `lib/openai.ts` - OpenAI utility functions

### Utility Functions
- `generateImage()` - Generate images using DALL-E 3
- `generateImageVariations()` - Create variations of existing images
- `validateOpenAIKey()` - Test API key validity

## 6. Image Generation Features

### Supported Parameters
- **Model**: DALL-E 3 (latest)
- **Sizes**: 1024x1024, 1792x1024, 1024x1792
- **Quality**: standard, hd
- **Style**: vivid, natural
- **Format**: URL (direct download links)

### Prompt Engineering
The system automatically enhances prompts with:
- Aesthetic context (e.g., "High Fashion style")
- Professional photography context
- Product visibility requirements
- Reference image matching instructions

## 7. Error Handling

### Common Errors
- **Invalid API Key**: Check your API key format and validity
- **Rate Limit Exceeded**: Wait and retry (50 requests/minute)
- **Content Policy Violation**: Modify your prompt to comply with OpenAI's policies
- **Insufficient Credits**: Add payment method or check account balance

### Error Responses
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error information"
}
```

## 8. Production Deployment

### Environment Variables
- Update `.env` with production OpenAI API key
- Ensure API key has sufficient credits
- Monitor usage and costs

### Security
- Never expose `OPENAI_API_KEY` in client-side code
- Use server-side API routes for all OpenAI calls
- Implement rate limiting for production use

### Monitoring
- Track API usage and costs
- Monitor generation success rates
- Set up alerts for high usage

## 9. Usage Optimization

### Cost Optimization
- Use standard quality for testing
- Use HD quality only for final results
- Implement caching for similar prompts
- Set usage limits per user

### Performance Optimization
- Implement request queuing for high traffic
- Cache generated images
- Use CDN for image delivery
- Optimize prompt engineering

## 10. Troubleshooting

### API Key Issues
1. Verify API key format (starts with `sk-`)
2. Check account has sufficient credits
3. Ensure account is verified
4. Test with OpenAI's playground first

### Generation Issues
1. Check prompt compliance with content policy
2. Verify image uploads are valid
3. Monitor rate limits
4. Check network connectivity

### Performance Issues
1. Monitor API response times
2. Check server resources
3. Implement proper error handling
4. Use appropriate image sizes

## 11. Next Steps

1. **Test Configuration**: Use the test endpoint to verify setup
2. **Generate Test Images**: Try the generate page with sample images
3. **Monitor Usage**: Check OpenAI dashboard for usage metrics
4. **Optimize Prompts**: Refine prompt engineering for better results
5. **Implement Caching**: Add image caching for cost optimization

## 12. Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [DALL-E 3 Guide](https://platform.openai.com/docs/guides/images)
- [OpenAI Pricing](https://openai.com/pricing)
- [Content Policy](https://platform.openai.com/docs/usage-policies)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits) 