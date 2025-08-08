import OpenAI from 'openai'

let cachedOpenAIClient: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    return null
  }
  if (cachedOpenAIClient) return cachedOpenAIClient
  cachedOpenAIClient = new OpenAI({ apiKey })
  return cachedOpenAIClient
}

// Helper function to fetch image and convert to base64
async function fetchImageAsBase64(imageURL: string): Promise<string> {
  try {
    const response = await fetch(imageURL)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return base64
  } catch (error) {
    console.error('Error converting image to base64:', error)
    throw error
  }
}

export interface FashionPromptResponse {
  prompt: string
  aspect_ratio: string
}

export async function generateFashionPrompt(
  refURL: string,
  garmentURL: string,
  userPrompt?: string
): Promise<FashionPromptResponse> {
  // If user provided a prompt, use it with default aspect ratio
  if (userPrompt && userPrompt.trim()) {
    return {
      prompt: userPrompt.trim(),
      aspect_ratio: "1:1" // Default aspect ratio
    }
  }

  try {
    const client = getOpenAIClient()

    // If no API key is configured, return a sensible default without failing build/runtime
    if (!client) {
      return {
        prompt: "Professional fashion photography with the garment styled on a model, high quality, studio lighting, clean background",
        aspect_ratio: "1:1"
      }
    }

    // Convert image URLs to base64 for vision analysis
    const [refImageBase64, garmentImageBase64] = await Promise.all([
      fetchImageAsBase64(refURL),
      fetchImageAsBase64(garmentURL)
    ])

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional AI fashion stylist. Your task is to analyze two images and create a detailed prompt for AI image generation.

Instructions:
1. Analyze the garment image for type, fit, cut, fabric, color, and style details
2. Analyze the reference image for pose, lighting, gender, body type, and background
3. Output ONE single, detailed prompt to depict the model in the reference image wearing the garment exactly, preserving its cut, fit, and color
4. Match the aspect ratio of the reference image
5. Focus on creating a professional, high-quality fashion photography result

Output format must be valid JSON:
{
  "prompt": "detailed description here",
  "aspect_ratio": "width:height"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze these two images and create a detailed fashion prompt:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${refImageBase64}`,
                detail: "high"
              }
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${garmentImageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response content from OpenAI")
    }

    const result = JSON.parse(content) as FashionPromptResponse
    
    // Validate the response
    if (!result.prompt || !result.aspect_ratio) {
      throw new Error("Invalid response format from OpenAI")
    }

    return result
  } catch (error) {
    console.error("Error generating fashion prompt:", error)
    
    // Fallback to a default prompt
    return {
      prompt: "Professional fashion photography with the garment styled on a model, high quality, studio lighting, clean background",
      aspect_ratio: "1:1"
    }
  }
}
