import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StickyBanner from '@/components/ads/StickyBanner'
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
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@yourusername',
    title: 'AI Buzz World - Discover the Best AI Tools',
    description: 'Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.',
  },
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2858012859068424" crossOrigin="anonymous"></script>
      
      {/* Google Analytics */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `
        }}
      />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header config={config} />
          <main className="flex-1">
            {children}
          </main>
          <Footer config={config} />
          <StickyBanner />
        </div>
      </body>
    </html>
  )
}
