import { auth } from './firebase'

export interface GenerateRequest {
  referenceImageURL: string
  garmentImageURL: string
  userPrompt?: string
}

export interface GenerateResponse {
  success: boolean
  projectId: string
  finalImageURL: string
  prompt: string
  aspect_ratio: string
}

export interface EditRequest {
  projectId: string
  newPrompt: string
}

export interface EditResponse {
  success: boolean
  projectId: string
  version: number
  finalImageURL: string
  prompt: string
}

class ApiClient {
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }
    return await user.getIdToken()
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const token = await this.getAuthToken()
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Generation failed')
    }

    return await response.json()
  }

  async edit(request: EditRequest): Promise<EditResponse> {
    const token = await this.getAuthToken()
    
    const response = await fetch('/api/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Edit failed')
    }

    return await response.json()
  }
}

export const apiClient = new ApiClient()
