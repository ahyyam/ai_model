import React from "react"
import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: "Zarta - AI-Powered Fashion Photography | Transform Product Photos",
    template: "%s | Zarta"
  },
  icons: {
    icon: [
      { url: '/logo/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  description: "Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography for e-commerce brands.",
  keywords: [
    "AI fashion photography",
    "product photo generation",
    "e-commerce photography",
    "fashion AI",
    "clothing photography",
    "product visualization",
    "fashion brand photography",
    "AI image generation",
    "fashion marketing",
    "e-commerce visuals"
  ],
  authors: [{ name: "Zarta Team" }],
  creator: "Zarta",
  publisher: "Zarta",
  generator: 'Next.js',
  metadataBase: new URL('https://zarta.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Zarta - AI-Powered Fashion Photography | Transform Product Photos",
    description: "Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography.",
    url: 'https://zarta.com',
    siteName: 'Zarta',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zarta - AI-Powered Fashion Photography',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zarta - AI-Powered Fashion Photography',
    description: 'Transform plain clothing product photos into styled, high-quality visuals using AI. Save 95% on photoshoot costs.',
    images: ['/og-image.jpg'],
    creator: '@zarta',
    site: '@zarta',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'AI Fashion Photography Platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scrollbar-thin">
      <body className={cn("font-sans antialiased bg-background text-foreground", inter.variable, sora.variable)} suppressHydrationWarning>
        {/* Google Analytics - Legacy Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-810HSMQQJB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-810HSMQQJB', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
