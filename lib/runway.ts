export interface RunwayImageRequest {
  prompt: string
  referenceImageURL: string
  garmentImageURL: string
  aspect_ratio: string
}

export interface RunwayImageResponse {
  id: string
  status: string
  output?: {
    images: Array<{
      url: string
    }>
  }
  error?: string
}

export async function generateImageWithRunway(
  request: RunwayImageRequest
): Promise<RunwayImageResponse> {
  try {
    const response = await fetch("https://api.runwayml.com/v1/images", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gen4-image",
        prompt: request.prompt,
        images: [
          { image: request.referenceImageURL, weight: 0.6 },
          { image: request.garmentImageURL, weight: 0.4 }
        ],
        aspect_ratio: request.aspect_ratio,
        num_images: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Runway API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json() as RunwayImageResponse
    
    // Check if the generation was successful
    if (result.status === "failed" || result.error) {
      throw new Error(result.error || "Image generation failed")
    }

    return result
  } catch (error) {
    console.error("Error generating image with Runway:", error)
    throw error
  }
}

// Helper function to wait for image generation completion
export async function waitForRunwayGeneration(
  generationId: string,
  maxWaitTime: number = 300000 // 5 minutes
): Promise<RunwayImageResponse> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`https://api.runwayml.com/v1/images/${generationId}`, {
        headers: {
          "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to check generation status: ${response.status}`)
      }

      const result = await response.json() as RunwayImageResponse
      
      if (result.status === "succeeded" && result.output?.images) {
        return result
      } else if (result.status === "failed" || result.error) {
        throw new Error(result.error || "Image generation failed")
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Error checking generation status:", error)
      throw error
    }
  }

  throw new Error("Image generation timed out")
}
