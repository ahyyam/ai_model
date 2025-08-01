import { NextResponse } from 'next/server'
import { validateOpenAIKey } from '@/lib/openai'

export async function GET() {
  try {
    // Check if OpenAI API key is set
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY
    
    if (!hasOpenAIKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key is not configured',
        details: {
          requiredEnvVar: 'OPENAI_API_KEY',
          currentValue: 'NOT_SET'
        }
      }, { status: 400 })
    }

    // Test the API key
    const isValid = await validateOpenAIKey()
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'OpenAI API key is valid and working',
        details: {
          hasApiKey: true,
          apiKeyValid: true,
          apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) + '...'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key is invalid or not working',
        details: {
          hasApiKey: true,
          apiKeyValid: false,
          apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) + '...'
        }
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error testing OpenAI configuration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test OpenAI configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 