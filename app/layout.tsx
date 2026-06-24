import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getSiteConfig } from '@/lib/content'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import GoogleAdsense from '@/components/ads/GoogleAdsense'


const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aibuzz.world'),
  title: 'AI Buzz World - Discover the Best AI Tools',
  description: 'Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.',
  authors: [{ name: 'AI Buzz World' }],
  keywords: 'ai tools, artificial intelligence, ai buzz world, technology, productivity, automation, machine learning, ai reviews',
  creator: 'AI Buzz World',
  publisher: 'AI Buzz World',
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
  alternates: {
    canonical: 'https://aibuzz.world/',
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  verification: {
    // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token from Search Console
    // (Settings → Ownership verification → HTML tag). Omitted when unset so we
    // never ship a bogus google-site-verification tag that fails verification.
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    other: {
      'verify-admitad': '557ea85493',
    },
  },
  openGraph: {
    title: 'AI Buzz World - Discover the Best AI Tools',
    description: 'Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.',
    url: 'https://aibuzz.world/',
    siteName: 'AI Buzz World',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://aibuzz.world/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Buzz World - Discover the Best AI Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@aibuzztools',
    title: 'AI Buzz World - Discover the Best AI Tools',
    description: 'Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.',
    images: ['https://aibuzz.world/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#2F7FD8',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = await getSiteConfig();

  return (
    <html lang="en">
      <head>
        <GoogleAdsense />
      </head>
      <body className={dmSans.className}>
        <GoogleAnalytics />
        <a href="#main-content" className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:bg-[#2F7FD8] focus-visible:text-white focus-visible:rounded">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'AI Buzz World',
              url: 'https://aibuzz.world',
              description: 'Discover the best AI tools for every need. Find, compare, and choose from thousands of AI-powered tools.',
              publisher: { '@id': 'https://aibuzz.world/#organization' },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://aibuzz.world/tools?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://aibuzz.world/#organization',
              name: 'AI Buzz World',
              url: 'https://aibuzz.world',
              logo: {
                '@type': 'ImageObject',
                url: 'https://aibuzz.world/images/bee-mascot.png',
                width: 83,
                height: 96,
              },
              sameAs: ['https://twitter.com/aibuzztools'],
            }),
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Header config={config} />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer config={config} />
        </div>
      </body>
    </html>
  )
}
