import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getSiteConfig } from '@/lib/content'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aibuzztools.com'),
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
    canonical: 'https://aibuzztools.com/',
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  verification: {
    google: 'your-google-verification-code',
  },
  openGraph: {
    title: 'AI Buzz World - Discover the Best AI Tools',
    description: 'Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.',
    url: 'https://aibuzztools.com/',
    siteName: 'AI Buzz World',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://aibuzztools.com/og-image.jpg',
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
    images: ['https://aibuzztools.com/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2201239508910470" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'AI Buzz World',
              url: 'https://aibuzztools.com',
              description: 'Discover the best AI tools for every need. Find, compare, and choose from thousands of AI-powered tools.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://aibuzztools.com/tools?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Header config={config} />
          <main className="flex-1">
            {children}
          </main>
          <Footer config={config} />
        </div>
      </body>
    </html>
  )
}
