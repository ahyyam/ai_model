import React, { Suspense } from "react"
import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import PixelTracker from "./pixel-tracker"

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
      <head>
        {/* Meta Pixel Code */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '747891917948872');
fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={cn("font-sans antialiased bg-background text-foreground", inter.variable, sora.variable)} suppressHydrationWarning>
        {/* Route-change tracking */}
        <Suspense fallback={null}>
          <PixelTracker />
        </Suspense>
        {/* Noscript fallback */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} alt="fb-pixel"
            src={`https://www.facebook.com/tr?id=747891917948872&ev=PageView&noscript=1`} />
        </noscript>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
