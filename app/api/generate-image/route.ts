import { NextRequest, NextResponse } from 'next/server'
import { generateImage, ImageGenerationRequest } from '@/lib/openai'
import { auth } from '@/lib/firebase'
import { getUserData } from '@/lib/users'

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { prompt, garmentImage, referenceImage, aesthetic, size, quality, style } = body

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check if user is authenticated (optional for now, can be made required later)
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   )
    // }

    // Check user subscription status (optional for now)
    // const userData = await getUserData(userId)
    // if (userData?.subscriptionStatus === 'free') {
    //   // Check usage limits for free users
    //   // This would be implemented based on your usage tracking system
    // }

    // Prepare the image generation request
    const imageRequest: ImageGenerationRequest = {
      prompt,
      garmentImage,
      referenceImage,
      aesthetic,
      size: size || '1024x1024',
      quality: quality || 'standard',
      style: style || 'vivid',
    }

    console.log('Generating image with request:', {
      prompt,
      aesthetic,
      size: imageRequest.size,
      quality: imageRequest.quality,
      style: imageRequest.style,
    })

    // Generate the image
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
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
} 