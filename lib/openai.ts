import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini as gpt-4.1-mini doesn't exist
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
          content: `Reference image: ${refURL}\nGarment image: ${garmentURL}`
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
