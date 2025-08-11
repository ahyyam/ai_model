import RunwayML, { TaskFailedError } from '@runwayml/sdk'
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
  usedRatio?: string
  model?: string
  taskResponse?: any
}

export async function generateImageWithRunway(
  request: RunwayImageRequest
): Promise<RunwayImageResponse> {
  try {
    // Ensure Runway API key exists (SDK reads RUNWAYML_API_SECRET)
    const runwaySecret = process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY
    console.log("Runway API Secret exists:", !!runwaySecret)
    console.log("Runway API Secret length:", runwaySecret?.length || 0)
    if (!runwaySecret) {
      console.log("Runway API Secret is missing")
      throw new Error('Runway API key is not set. Provide RUNWAYML_API_SECRET or RUNWAY_API_KEY')
    }

    // Validate request parameters
    if (!request.prompt || !request.referenceImageURL || !request.garmentImageURL) {
      throw new Error('Missing required parameters: prompt, referenceImageURL, or garmentImageURL')
    }

    async function toDataUri(url: string): Promise<string> {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      const arrayBuffer = await res.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      return `data:${contentType};base64,${base64}`
    }

    const [refUri, garmentUri] = await Promise.all([
      toDataUri(request.referenceImageURL),
      toDataUri(request.garmentImageURL)
    ])

    function mapToRunwayRatio(input: string | undefined):
      | '1920:1080' | '1080:1920' | '1024:1024' | '1360:768' | '1080:1080'
      | '1168:880' | '1440:1080' | '1080:1440' | '1808:768' | '2112:912'
      | '1280:720' | '720:1280' | '720:720' | '960:720' | '720:960' | '1680:720' {
      // Map normalized aspect ratio to the exact accepted list from Runway docs
      // Accepted values:
      // "1920:1080","1080:1920","1024:1024","1360:768","1080:1080","1168:880",
      // "1440:1080","1080:1440","1808:768","2112:912","1280:720","720:1280",
      // "720:720","960:720","720:960","1680:720"
      const allowed = [
        '1920:1080','1080:1920','1024:1024','1360:768','1080:1080','1168:880',
        '1440:1080','1080:1440','1808:768','2112:912','1280:720','720:1280',
        '720:720','960:720','720:960','1680:720'
      ] as const
      // Normalize input like 1:1, 4:5 etc. into the closest accepted value
      const fallback = '1024:1024'
      if (!input) return fallback
      const cleaned = String(input).trim().toLowerCase().replace(/x|\//g, ':')
      const m = cleaned.match(/^(\d{1,4}):(\d{1,4})$/)
      if (!m) return fallback
      const w = parseInt(m[1], 10)
      const h = parseInt(m[2], 10)
      if (!(w > 0 && h > 0)) return fallback
      const target = w / h
      let best: typeof allowed[number] = fallback as typeof allowed[number]
      let bestDiff = Infinity
      for (const candidate of allowed) {
        const [cw, ch] = candidate.split(':').map(Number)
        const r = cw / ch
        const diff = Math.abs(r - target)
        if (diff < bestDiff) {
          bestDiff = diff
          best = candidate
        }
      }
      return best
    }

    const model = (process.env.RUNWAY_MODEL as 'gen4_image' | 'gen4_image_turbo') || 'gen4_image'
    const client = new RunwayML({ apiKey: runwaySecret })

    const usedRatio = mapToRunwayRatio(request.aspect_ratio)
    const task = await client.textToImage.create({
      model,
      promptText: request.prompt.slice(0, 1000),
      ratio: usedRatio,
      referenceImages: [
        { uri: refUri, tag: 'reference' },
        { uri: garmentUri, tag: 'garment' }
      ]
    })

    // Return the created task id; caller will wait for completion
    return { id: task.id, status: 'processing', usedRatio, model, taskResponse: task }
  } catch (error) {
    console.error('Error generating image with Runway SDK:', error)
    if (error instanceof TaskFailedError) {
      throw new Error('Image generation failed')
    }
    throw error
  }
}

// Helper function to wait for image generation completion
export async function waitForRunwayGeneration(
  generationId: string,
  maxWaitTime: number = 300000 // 5 minutes
): Promise<RunwayImageResponse> {
  const startTime = Date.now()
  const runwaySecret = process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY || ''
  console.log("Runway API Secret for status check exists:", !!runwaySecret)
  console.log("Runway API Secret for status check length:", runwaySecret?.length || 0)
  const client = new RunwayML({ apiKey: runwaySecret })
  console.log(`Waiting for Runway generation ${generationId} to complete...`)

  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check task status using the tasks.retrieve method
      const taskDetails = await client.tasks.retrieve(generationId)
      console.log('Task status:', taskDetails.status)
      
      if (taskDetails.status === 'SUCCEEDED') {
        console.log("Task succeeded! Full task details:", JSON.stringify(taskDetails, null, 2))
        
        const imageUrls: string[] = []
        
        // Handle the actual Runway response structure
        if (Array.isArray(taskDetails.output)) {
          // Direct array of URLs
          console.log("Direct output array found:", taskDetails.output)
          for (const url of taskDetails.output) {
            if (typeof url === 'string') {
              console.log("Direct URL:", url)
              imageUrls.push(url)
            }
          }
        } else {
          // Fallback to assets/images structure
          const assets: Array<any> = (taskDetails as any).output?.assets || (taskDetails as any).output?.images || []
          console.log("Assets found:", assets)
          
          if (Array.isArray(assets)) {
            for (const a of assets) {
              const url = a?.uri || a?.url
              console.log("Asset URL:", url)
              if (typeof url === 'string') imageUrls.push(url)
            }
          }
        }
        
        console.log("Extracted image URLs:", imageUrls)
        
        const result = {
          id: generationId,
          status: 'succeeded',
          output: imageUrls.length ? { images: imageUrls.map(u => ({ url: u })) } : undefined
        }
        
        console.log("Returning result:", JSON.stringify(result, null, 2))
        return result
      } else if (taskDetails.status === 'FAILED' || taskDetails.status === 'CANCELLED') {
        throw new Error(`Task ${taskDetails.status.toLowerCase()}`)
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      if (error instanceof TaskFailedError) {
        throw new Error('Image generation failed')
      }
      console.error('Error checking Runway task status:', error)
      throw error
    }
  }

  throw new Error('Image generation timed out after 5 minutes')
}
