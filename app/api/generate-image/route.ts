import { NextRequest, NextResponse } from 'next/server'
import { generateImage, ImageGenerationRequest } from '@/lib/openai'
import { auth } from '@/lib/firebase'
import { getUserData } from '@/lib/users'

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { prompt, model_ref, outfit_ref, aesthetic_ref, mask, size } = body

    // Validate required fields following the structured flow
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }
    if (!model_ref) {
      return NextResponse.json(
        { error: 'model_ref is required - base image for editing' },
        { status: 400 }
      )
    }
    if (!outfit_ref) {
      return NextResponse.json(
        { error: 'outfit_ref is required - outfit reference image' },
        { status: 400 }
      )
    }
    if (!aesthetic_ref) {
      return NextResponse.json(
        { error: 'aesthetic_ref is required - aesthetic reference image' },
        { status: 400 }
      )
    }

    // Prepare the image generation request following the structured flow
    const imageRequest: ImageGenerationRequest = {
      prompt,
      model_ref,
      outfit_ref,
      aesthetic_ref,
      mask,
      size: size || '1024x1024',
    }

    console.log('Generating image with structured request:', {
      hasPrompt: !!prompt,
      hasModelRef: !!model_ref,
      hasOutfitRef: !!outfit_ref,
      hasAestheticRef: !!aesthetic_ref,
      hasMask: !!mask,
      size: imageRequest.size,
    })

    // Generate the image using the structured flow
    const result = await generateImage(imageRequest)

    if (result.success && result.images && result.images.length > 0) {
      return NextResponse.json({
        success: true,
        images: result.images,
        prompt: imageRequest.prompt,
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate image'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in generate-image API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
} 