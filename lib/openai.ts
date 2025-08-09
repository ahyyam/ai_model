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
  const defaultPrompt = "Professional fashion photography featuring the uploaded garment styled on a model, matching the reference image pose and lighting, high-quality studio photography with clean background, detailed fabric texture and color accuracy"
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
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional AI fashion stylist and photographer. Analyze two images and produce a single, vivid prompt that reads naturally in the following style:

"Let the [concise model description from reference] wear [clear garment name from garment image] in [precise color and fabric], with [distinct design details]. Scene: [lighting] and [background/environment] as in the reference. Pose: [pose]. Camera: [angle/perspective]. Add photography terms as needed."

CRITICAL INSTRUCTIONS:
1. GARMENT ANALYSIS: Analyze the garment image in detail and describe:
   - Exact garment type (dress, shirt, pants, jacket, etc.)
   - Specific fit (slim, loose, fitted, oversized, etc.)
   - Precise cut and style (V-neck, round neck, long sleeve, short sleeve, etc.)
   - Fabric type and texture (cotton, silk, denim, leather, etc.)
   - Exact colors and patterns (solid navy blue, floral print, striped, etc.)
   - Design details (buttons, zippers, pockets, ruffles, pleats, etc.)
   - Length and proportions (midi dress, cropped top, high-waisted, etc.)

2. REFERENCE IMAGE ANALYSIS: Analyze the reference image for:
   - Model's pose and positioning (standing, sitting, walking, etc.)
   - Exact lighting setup (studio lighting, natural light, dramatic shadows, etc.)
   - Background and environment (studio backdrop, outdoor setting, urban, etc.)
   - Model's gender, body type, and appearance
   - Camera angle and perspective
   - Overall mood and style (casual, formal, editorial, etc.)

3. PROMPT REQUIREMENTS:
   - Create one comprehensive, natural-sounding line beginning with "Let the ..."
   - Explicitly name the garment CATEGORY (exact one-word type): choose one of {"dress","shirt","t-shirt","blouse","jacket","coat","sweater","hoodie","pants","jeans","shorts","skirt"}. If none fits, pick the closest.
   - Combine ALL garment details with the reference style
   - Include specific fabric textures, colors, and design elements
   - Match the exact pose, lighting, and background from the reference
   - Ensure the garment fits the model exactly as shown in the garment image
   - Use professional fashion photography terminology
   - Include technical details like camera settings, lighting, and composition

4. OUTPUT FORMAT: Return valid JSON with:
   - "prompt": A detailed, specific description (prefer 1-2 sentences in the described style) and MUST include the exact garment category word you chose
   - "aspect_ratio": A numeric ratio string in the form "W:H" using small integers (allowed values include 1:1, 4:5, 3:4, 2:3, 9:16, 16:9). Choose the closest match to the reference image.

Example prompt structure:
"[Garment type] in [exact color] [fabric type] with [specific details], styled on [model description] in [pose] pose, [lighting description], [background description], [camera angle], professional fashion photography, high resolution, studio quality"

Be extremely specific and detailed - avoid generic terms like "professional" or "high quality" without context.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze these two images and create a highly detailed, specific fashion prompt that includes all garment details and reference page styling:"
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
