import OpenAI from 'openai'

let cachedOpenAIClient: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  console.log("OpenAI API Key exists:", !!apiKey)
  console.log("OpenAI API Key length:", apiKey?.length || 0)
  if (!apiKey || apiKey.trim().length === 0) {
    console.log("OpenAI API Key is missing or empty")
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
  usedOpenAI?: boolean
}

export async function generateFashionPrompt(
  refURL: string,
  garmentURL: string,
  userPrompt?: string
): Promise<FashionPromptResponse> {
  const defaultPrompt = "Professional fashion photography featuring the reference outfit, styled on a different model with natural features, realistic skin texture, and subtle makeup. Match the reference pose and framing with soft studio lighting, realistic skin texture, subtle makeup, gentle shadows, professional composition, photorealistic, 4K."
  const enforcePromptLimit = (input: string): string => {
    let s = (input || "").trim()
    if (!s) s = defaultPrompt
    // JavaScript string length is measured in UTF-16 code units, matching the API requirement
    if (s.length > 1000) s = s.slice(0, 1000)
    if (!s) s = defaultPrompt.slice(0, 1000)
    return s
  }
  // If user provided a prompt, use it with default aspect ratio
  if (userPrompt && userPrompt.trim()) {
    return {
      prompt: enforcePromptLimit(userPrompt),
      aspect_ratio: "1:1", // Default aspect ratio
      usedOpenAI: false
    }
  }

  try {
    const client = getOpenAIClient()

    // If no API key is configured, return a sensible default without failing build/runtime
    if (!client) {
      return {
        prompt: enforcePromptLimit(defaultPrompt),
        aspect_ratio: "1:1",
        usedOpenAI: false
      }
    }

    // Convert image URLs to base64 for vision analysis
    const [refImageBase64, garmentImageBase64] = await Promise.all([
      fetchImageAsBase64(refURL),
      fetchImageAsBase64(garmentURL)
    ])

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional AI fashion stylist and photographer for Runway Gen-4 Image. Analyze two images and return ONE final prompt (<= 1,000 characters). Your goal is to create a prompt that focuses on STYLING and PRESENTATION, not duplicating garment details.

CRITICAL INSTRUCTIONS FOR CONSISTENT RESULTS:

1. GARMENT REFERENCE - Keep it simple and focused:
   - Use the garment image to understand what the model should wear
   - Describe it briefly: "the garment from the reference" or "the reference outfit"
   - DO NOT duplicate detailed garment descriptions - focus on styling instead

2. STYLING FOCUS - Emphasize these key elements:
   - BACKGROUND: "studio-backdrop", "white-background", "black-background", "gray-background", "outdoor-urban", "outdoor-nature", "indoor-interior", "brick-wall", "concrete-wall", "wooden-floor", "marble-floor", "carpeted-floor", "outdoor-street", "outdoor-park", "outdoor-beach", "indoor-office", "indoor-home"
   - POSE: "standing-upright", "standing-leaning", "sitting-upright", "sitting-casual", "walking-forward", "walking-sideways", "three-quarter-turn", "profile-view", "full-frontal", "back-view", "head-tilted", "arms-crossed", "hands-on-hips", "hands-in-pockets", "one-hand-raised", "both-hands-raised"
   - MODEL APPEARANCE: "female-model", "male-model", "athletic-build", "slim-build", "curvy-build", "petite-frame", "tall-frame", "medium-height", "young-adult", "mature-adult"
   - SKIN & HAIR: "natural-skin-texture", "realistic-skin-tone", "subtle-makeup", "natural-hair-style", "styled-hair", "hair-up", "hair-down", "natural-hair-color", "styled-hair-color"
   - LIGHTING: "studio-lighting", "natural-daylight", "golden-hour", "blue-hour", "overcast-light", "direct-sunlight", "dramatic-shadows", "soft-shadows", "rim-lighting", "back-lighting", "side-lighting", "front-lighting", "three-point-lighting", "high-key-lighting", "low-key-lighting", "split-lighting"
   - CAMERA ANGLE: "eye-level", "low-angle", "high-angle", "straight-on", "three-quarter-view", "profile-view", "close-up", "medium-shot", "full-body-shot", "head-and-shoulders", "waist-up", "knee-up"
   - MOOD AND STYLE: "editorial-fashion", "casual-lifestyle", "formal-business", "street-style", "high-fashion", "minimalist", "vintage-inspired", "modern-contemporary", "luxury-elegant", "urban-edgy", "bohemian-free", "classic-sophisticated"

3. PROMPT STRUCTURE REQUIREMENTS:
   - Start with "Professional fashion photography featuring"
   - Mention "the reference garment" or "the outfit from the reference" (keep it simple)
   - Focus on the STYLING: background, pose, lighting, model appearance
   - Emphasize the DIFFERENT face while keeping the same outfit
   - Include photography quality terms: "4K-resolution", "studio-quality", "commercial-grade", "magazine-quality", "hyper-realistic", "photorealistic", "professional-lighting", "perfect-composition"

4. HARD CONSTRAINTS:
   - GARMENT: The model wears the SAME outfit from the reference (don't describe it in detail)
   - FACE: A DIFFERENT person with NATURAL features, realistic skin, subtle makeup
   - STYLING: Focus on background, pose, lighting, and presentation

5. OUTPUT FORMAT: Return valid JSON with:
   - "prompt": A single string (<= 1,000 characters) focused on styling
   - "aspect_ratio": A numeric ratio string in the form "W:H" (1:1, 4:5, 3:4, 2:3, 9:16, 16:9)

EXAMPLE PROMPT STRUCTURE:
"Professional fashion photography featuring the reference outfit, styled on a female-model with athletic-build in standing-upright pose with hands-on-hips, three-quarter-turn view, studio-lighting with soft-shadows, white-studio-background, medium-shot from eye-level, different-natural-face with realistic-skin-texture and subtle-makeup, natural-hair-style, 4K-resolution, studio-quality, commercial-grade photography, perfect-composition, hyper-realistic details"

Focus on STYLING and PRESENTATION, not garment details. The goal is to change the model's appearance and setting while keeping the same outfit.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze these two images and create a fashion prompt that focuses on STYLING and PRESENTATION. The goal is to keep the same outfit but change the model's appearance, pose, background, and lighting. Focus on the styling elements, not duplicating garment details."
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
      temperature: 0.3,
      max_tokens: 1000
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

    // Normalize aspect ratio to W:H with integers
    const normalizeRatio = (input: string): string => {
      const cleaned = String(input).trim().toLowerCase().replace(/x|\//g, ":")
      const match = cleaned.match(/^(\d{1,5}):(\d{1,5})$/)
      if (!match) return "1:1"
      const w = parseInt(match[1], 10)
      const h = parseInt(match[2], 10)
      if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return "1:1"
      return `${w}:${h}`
    }

    return {
      prompt: enforcePromptLimit(result.prompt),
      aspect_ratio: normalizeRatio(result.aspect_ratio),
      usedOpenAI: true
    }
  } catch (error) {
    console.error("Error generating fashion prompt:", error)
    
    // Fallback to a more detailed default prompt
    return {
      prompt: defaultPrompt.slice(0, 1000),
      aspect_ratio: "1:1",
      usedOpenAI: false
    }
  }
}
