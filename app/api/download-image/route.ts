import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTNAMES = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
  'images.runwayml.com',
])

function ensureAllowed(urlString: string): URL {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    throw new Error('Invalid URL')
  }
  
  // Allow CloudFront URLs (Runway uses these)
  if (url.hostname.endsWith('.cloudfront.net')) {
    return url
  }
  
  if (!ALLOWED_HOSTNAMES.has(url.hostname)) {
    throw new Error('Hostname not allowed')
  }
  return url
}

export async function POST(request: NextRequest) {
  try {
    const { url: imageUrl } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }
    
    console.log('Download request for URL:', imageUrl)
    
    const url = ensureAllowed(imageUrl)
    console.log('URL validated, hostname:', url.hostname)

    const upstream = await fetch(url.toString(), { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'Zarta-Download-API/1.0'
      }
    })
    
    if (!upstream.ok) {
      console.error('Upstream fetch failed:', upstream.status, upstream.statusText)
      return NextResponse.json({ error: `Upstream fetch failed: ${upstream.status} ${upstream.statusText}` }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    const contentLength = upstream.headers.get('content-length')
    console.log('Downloading image:', contentType, contentLength ? `${contentLength} bytes` : 'unknown size')
    
    const arrayBuffer = await upstream.arrayBuffer()
    const filename = `zarta-image-${Date.now()}.jpg`

    console.log('Download completed successfully:', arrayBuffer.byteLength, 'bytes')

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Download API error:', error)
    const message = error instanceof Error ? error.message : 'Download failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}


