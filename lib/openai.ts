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
  const defaultPrompt = "Professional fashion photography featuring a fitted cotton t-shirt in solid white with crew-neck design and short-sleeve cut, styled on a female-model with athletic-build in standing-upright pose with hands-on-hips, three-quarter-turn view, studio-lighting with soft-shadows, white-studio-background, medium-shot from eye-level, slightly-modified-face with natural-face-features and enhanced-facial-details, 4K-resolution, studio-quality, commercial-grade photography, perfect-composition, hyper-realistic details"
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
          content: `You are a professional AI fashion stylist and photographer specializing in hyper-realistic fashion photography. Your task is to analyze two images and create an extremely detailed, specific prompt that will generate consistent, high-quality results.

CRITICAL INSTRUCTIONS FOR CONSISTENT RESULTS:

1. GARMENT ANALYSIS - Be extremely specific about:
   - EXACT garment type: Choose from {"dress","shirt","t-shirt","blouse","jacket","coat","sweater","hoodie","pants","jeans","shorts","skirt","jumpsuit","blazer","cardigan","vest","tank-top","polo","sweatshirt","leggings","trousers","chinos","cargo-pants","mini-skirt","midi-skirt","maxi-skirt","pencil-skirt","a-line-skirt","pleated-skirt"}
   - PRECISE fit description: "fitted", "loose-fit", "slim-fit", "oversized", "relaxed-fit", "skinny-fit", "straight-leg", "wide-leg", "high-waisted", "low-waisted", "cropped", "full-length"
   - EXACT cut and style: "V-neck", "round-neck", "crew-neck", "scoop-neck", "square-neck", "off-shoulder", "one-shoulder", "halter-neck", "turtle-neck", "mock-neck", "long-sleeve", "short-sleeve", "sleeveless", "cap-sleeve", "bell-sleeve", "flared-sleeve", "cuffed-sleeve"
   - SPECIFIC fabric type: "cotton", "silk", "denim", "leather", "suede", "wool", "cashmere", "linen", "polyester", "rayon", "velvet", "satin", "chiffon", "crepe", "jersey", "knit", "woven", "mesh", "lace", "embroidery"
   - EXACT colors: Use specific color names like "navy-blue", "emerald-green", "coral-red", "mustard-yellow", "burgundy", "olive-green", "rust-orange", "teal-blue", "maroon", "forest-green", "cobalt-blue", "terracotta", "sage-green", "aubergine", "champagne", "ivory", "cream", "beige", "taupe", "charcoal"
   - DETAILED patterns: "solid-color", "striped", "polka-dot", "floral-print", "geometric-pattern", "animal-print", "tie-dye", "ombre", "gradient", "checkered", "plaid", "tartan", "houndstooth", "herringbone", "chevron", "zigzag", "abstract-print", "ethnic-pattern"
   - SPECIFIC design elements: "button-front", "zipper-closure", "drawstring-waist", "elastic-waist", "side-pockets", "back-pockets", "chest-pockets", "patch-pockets", "welt-pockets", "pleats", "ruffles", "gathers", "darts", "seams", "topstitching", "embroidery", "beading", "sequins", "fringe", "tassels", "studs", "grommets"

2. REFERENCE IMAGE ANALYSIS - Capture exact details:
   - MODEL DESCRIPTION: "female-model", "male-model", "athletic-build", "slim-build", "curvy-build", "petite-frame", "tall-frame", "medium-height", "young-adult", "mature-adult"
   - EXACT POSE: "standing-upright", "standing-leaning", "sitting-upright", "sitting-casual", "walking-forward", "walking-sideways", "three-quarter-turn", "profile-view", "full-frontal", "back-view", "head-tilted", "arms-crossed", "hands-on-hips", "hands-in-pockets", "one-hand-raised", "both-hands-raised"
   - PRECISE LIGHTING: "studio-lighting", "natural-daylight", "golden-hour", "blue-hour", "overcast-light", "direct-sunlight", "dramatic-shadows", "soft-shadows", "rim-lighting", "back-lighting", "side-lighting", "front-lighting", "three-point-lighting", "high-key-lighting", "low-key-lighting", "split-lighting"
   - SPECIFIC BACKGROUND: "studio-backdrop", "white-background", "black-background", "gray-background", "outdoor-urban", "outdoor-nature", "indoor-interior", "brick-wall", "concrete-wall", "wooden-floor", "marble-floor", "carpeted-floor", "outdoor-street", "outdoor-park", "outdoor-beach", "indoor-office", "indoor-home"
   - CAMERA ANGLE: "eye-level", "low-angle", "high-angle", "straight-on", "three-quarter-view", "profile-view", "close-up", "medium-shot", "full-body-shot", "head-and-shoulders", "waist-up", "knee-up"
   - MOOD AND STYLE: "editorial-fashion", "casual-lifestyle", "formal-business", "street-style", "high-fashion", "minimalist", "vintage-inspired", "modern-contemporary", "luxury-elegant", "urban-edgy", "bohemian-free", "classic-sophisticated"

3. PROMPT STRUCTURE REQUIREMENTS:
   - Start with "Professional fashion photography featuring"
   - Include the EXACT garment category word from the list above
   - Specify the PRECISE fit, cut, and style details
   - Include the EXACT fabric type and texture
   - Specify the EXACT color and pattern
   - List ALL visible design elements and details
   - Match the EXACT pose from the reference image
   - Include the PRECISE lighting setup
   - Specify the EXACT background/environment
   - Include the CAMERA angle and perspective
   - Add photography quality terms: "4K-resolution", "studio-quality", "commercial-grade", "magazine-quality", "hyper-realistic", "photorealistic", "professional-lighting", "perfect-composition"
   - Include face modification: "slightly-modified-face", "natural-face-features", "enhanced-facial-details", "professional-makeup", "natural-skin-texture", "subtle-face-enhancement"

4. OUTPUT FORMAT: Return valid JSON with:
   - "prompt": A highly detailed, specific description (2-3 sentences) that includes ALL the specific details above
   - "aspect_ratio": A numeric ratio string in the form "W:H" using small integers (allowed values include 1:1, 4:5, 3:4, 2:3, 9:16, 16:9). Choose the closest match to the reference image.

EXAMPLE PROMPT STRUCTURE:
"Professional fashion photography featuring a fitted V-neck long-sleeve cotton t-shirt in solid navy-blue with ribbed-texture and crew-neck design, styled on a female-model with athletic-build in standing-upright pose with hands-on-hips, three-quarter-turn view, studio-lighting with soft-shadows, white-studio-background, medium-shot from eye-level, slightly-modified-face with natural-face-features and enhanced-facial-details, 4K-resolution, studio-quality, commercial-grade photography, perfect-composition, hyper-realistic details"

Be extremely specific and detailed - every detail matters for consistent results. Avoid generic terms and always use the exact descriptive words from the lists above.`
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
