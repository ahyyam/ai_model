"use client"

import Head from 'next/head'

interface PageSEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

export default function PageSEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Zarta Team'
}: PageSEOProps) {
  const fullTitle = title ? `${title} | Zarta` : 'Zarta - AI-Powered Fashion Photography'
  const fullDescription = description || 'Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography.'
  const fullUrl = url ? `https://zarta.com${url}` : 'https://zarta.com'
  const fullImage = image.startsWith('http') ? image : `https://zarta.com${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Zarta" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@zarta" />
      <meta name="twitter:creator" content="@zarta" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="msapplication-TileColor" content="#1a1a1a" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://stripe.com" />
      
      {/* Favicon and app icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  )
}

// Predefined SEO configurations for common pages
export const generatePageSEO = {
  home: () => ({
    title: 'AI-Powered Fashion Photography | Transform Product Photos',
    description: 'Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography for e-commerce brands.',
    keywords: ['AI fashion photography', 'product photo generation', 'e-commerce photography', 'fashion AI'],
    url: '/'
  }),
  
  generate: () => ({
    title: 'Generate AI Fashion Photography',
    description: 'Create stunning fashion photography with AI. Upload your product images and generate professional visuals in minutes.',
    keywords: ['AI image generation', 'fashion photography', 'product visualization'],
    url: '/generate'
  }),
  
  pricing: () => ({
    title: 'Pricing Plans | AI Fashion Photography',
    description: 'Choose the perfect Zarta plan for your fashion photography needs. Starting at $30/month for professional AI-generated visuals.',
    keywords: ['AI photography pricing', 'fashion photography plans', 'e-commerce photography cost'],
    url: '/pricing'
  }),
  
  projects: () => ({
    title: 'My Projects | AI Fashion Photography',
    description: 'View and manage your AI-generated fashion photography projects. Download, share, and organize your professional visuals.',
    keywords: ['fashion photography projects', 'AI image management', 'professional visuals'],
    url: '/projects'
  })
} 