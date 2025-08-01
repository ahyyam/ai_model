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

// Interface for image generation request following the structured flow
export interface ImageGenerationRequest {
  prompt: string
  model_ref: string // base64 encoded model image (base image for editing)
  outfit_ref: string // base64 encoded outfit reference image
  aesthetic_ref: string // base64 encoded aesthetic reference image
  mask?: string // base64 encoded mask for clothing area (optional)
  size?: '1024x1024' | '256x256' | '512x512' | '1536x1024' | '1024x1536' | 'auto'
}

// Interface for image generation response
export interface ImageGenerationResponse {
  success: boolean
  images?: string[]
  error?: string
}

// Generate image using DALL-E 3 following the structured flow
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  if (!openai) {
    throw new Error('OpenAI is not initialized')
  }

  try {
    // Step 1: Validate all required inputs
    if (!request.model_ref) {
      throw new Error('model_ref is required - base image for editing')
    }
    if (!request.outfit_ref) {
      throw new Error('outfit_ref is required - outfit reference image')
    }
    if (!request.aesthetic_ref) {
      throw new Error('aesthetic_ref is required - aesthetic reference image')
    }
    if (!request.prompt) {
      throw new Error('prompt is required')
    }

    console.log('Validated all required inputs:', {
      hasModelRef: !!request.model_ref,
      hasOutfitRef: !!request.outfit_ref,
      hasAestheticRef: !!request.aesthetic_ref,
      hasPrompt: !!request.prompt,
      hasMask: !!request.mask
    })

    // Step 2: Build the enhanced prompt following the structure
    let enhancedPrompt = request.prompt

    // Step 3: Ensure prompt describes the outfit from outfit_ref
    if (!enhancedPrompt.toLowerCase().includes('outfit') && 
        !enhancedPrompt.toLowerCase().includes('clothing') && 
        !enhancedPrompt.toLowerCase().includes('garment') &&
        !enhancedPrompt.toLowerCase().includes('dress') &&
        !enhancedPrompt.toLowerCase().includes('shirt') &&
        !enhancedPrompt.toLowerCase().includes('pants')) {
      enhancedPrompt += " The model is wearing the outfit shown in the second reference image."
    }

    // Step 4: Ensure prompt reflects visual tone, lighting, and composition from aesthetic_ref
    if (!enhancedPrompt.toLowerCase().includes('lighting') && 
        !enhancedPrompt.toLowerCase().includes('style') && 
        !enhancedPrompt.toLowerCase().includes('tone') &&
        !enhancedPrompt.toLowerCase().includes('composition')) {
      enhancedPrompt += " The image should match the lighting and photo style of the third reference image."
    }

    // Step 5: Specify that only clothing area should be altered, face and pose must remain same
    enhancedPrompt += " Only the clothing area should be changed - the face, pose, and body position must remain exactly the same as in the base image."

    // Step 6: Add professional context
    enhancedPrompt += " Professional product photography, high resolution, commercial quality, suitable for e-commerce and marketing."

    console.log('Enhanced prompt:', enhancedPrompt)

    // Step 7: Use the proper OpenAI endpoint for image editing/inpainting
    // Convert base64 images to buffers
    const modelImageBuffer = base64ToBuffer(request.model_ref)
    const outfitImageBuffer = base64ToBuffer(request.outfit_ref)
    const aestheticImageBuffer = base64ToBuffer(request.aesthetic_ref)
    
    let maskBuffer: Buffer | undefined
    if (request.mask) {
      maskBuffer = base64ToBuffer(request.mask)
    }

    // Use image editing endpoint with model_ref as base image
    const response = await openai.images.edit({
      image: modelImageBuffer as any,
      mask: maskBuffer as any, // Apply mask if available
      prompt: enhancedPrompt,
      n: 1,
      size: request.size || "1024x1024",
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