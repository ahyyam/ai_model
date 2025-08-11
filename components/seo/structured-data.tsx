"use client"

import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product' | 'faq'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'organization' ? 'Organization' : 
             type === 'website' ? 'WebSite' : 
             type === 'product' ? 'SoftwareApplication' : 'FAQPage',
    ...data
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// Predefined structured data for common use cases
export const OrganizationData = {
  name: 'Zarta',
  url: 'https://zarta.com',
      logo: 'https://zarta.com/logo/logo.png',
  description: 'AI-powered fashion photography platform that transforms plain product photos into styled, professional visuals.',
  sameAs: [
    'https://twitter.com/zarta',
    'https://linkedin.com/company/zarta',
    'https://facebook.com/zarta'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-123-4567',
    contactType: 'customer service',
    email: 'support@zarta.com'
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressLocality: 'San Francisco',
    addressRegion: 'CA'
  }
}

export const WebsiteData = {
  name: 'Zarta - AI-Powered Fashion Photography',
  url: 'https://zarta.com',
  description: 'Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://zarta.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}

export const ProductData = {
  name: 'Zarta AI Fashion Photography Platform',
  description: 'AI-powered platform for generating professional fashion photography from plain product photos.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '30',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250'
  }
}

export const FAQData = {
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Zarta work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zarta uses AI to transform plain product photos into styled, professional fashion photography. Upload your product image, add a reference style, and our AI generates high-quality visuals in minutes.'
      }
    },
    {
      '@type': 'Question',
      name: 'How much does Zarta cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zarta offers flexible pricing starting at $29/month for 10 image generations. Pro plans start at $39/month for 20 generations, and Elite plans at $74/month for 50 generations.'
      }
    },
    {
      '@type': 'Question',
      name: 'What types of images can I generate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can generate on-model product shots, lifestyle photography, creative compositions, and various fashion styles. Our AI maintains brand consistency while creating diverse visual content.'
      }
    }
  ]
} 