import OpenAI from 'openai'

// Only initialize OpenAI on the server side
let openai: OpenAI | null = null

if (typeof window === 'undefined') {
  // Server-side only
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }
  
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export { openai }

// Interface for image generation request
export interface ImageGenerationRequest {
  prompt: string
  garmentImage?: string // base64 encoded image
  referenceImage?: string // base64 encoded image
  aesthetic?: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
}

// Interface for image generation response
export interface ImageGenerationResponse {
  success: boolean
  images?: string[]
  error?: string
}

// Generate image using DALL-E 3
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  if (!openai) {
    throw new Error('OpenAI is not initialized')
  }

  try {
    // Build the prompt with context
    let fullPrompt = request.prompt

    // Add aesthetic context if provided
    if (request.aesthetic) {
      fullPrompt = `${request.aesthetic} style: ${fullPrompt}`
    }

    // Add garment and reference image context
    if (request.garmentImage || request.referenceImage) {
      fullPrompt = `Create a high-quality product photo. ${fullPrompt}`
      
      if (request.garmentImage) {
        fullPrompt += ` The garment should be clearly visible and well-lit.`
      }
      
      if (request.referenceImage) {
        fullPrompt += ` Match the style, lighting, and composition of the reference image.`
      }
    }

    // Add professional photography context
    fullPrompt += ` Professional product photography, high resolution, commercial quality, suitable for e-commerce and marketing.`

    console.log('Generating image with prompt:', fullPrompt)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: request.size || "1024x1024",
      quality: request.quality || "standard",
      style: request.style || "vivid",
      response_format: "url",
    })

    if (response.data && response.data.length > 0) {
      return {
        success: true,
        images: response.data.map((img) => img.url!),
      }
    } else {
      return {
        success: false,
        error: "No images generated",
      }
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Generate multiple variations of an image
export async function generateImageVariations(
  baseImageUrl: string,
  count: number = 3
): Promise<ImageGenerationResponse> {
  if (!openai) {
    throw new Error('OpenAI is not initialized')
  }

  try {
    // For variations, we need to download the image first and convert to buffer
    const imageResponse = await fetch(baseImageUrl)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    const response = await openai.images.createVariation({
      image: imageBuffer as any,
      n: count,
      size: "1024x1024",
      response_format: "url",
    })

    if (response.data && response.data.length > 0) {
      return {
        success: true,
        images: response.data.map((img) => img.url!),
      }
    } else {
      return {
        success: false,
        error: "No image variations generated",
      }
    }
  } catch (error) {
    console.error('Error generating image variations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Helper function to convert base64 to buffer for OpenAI
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

// Helper function to validate OpenAI API key
export async function validateOpenAIKey(): Promise<boolean> {
  if (!openai) {
    return false
  }

  try {
    // Make a simple API call to test the key
    await openai.models.list()
    return true
  } catch (error) {
    console.error('OpenAI API key validation failed:', error)
    return false
  }
} 