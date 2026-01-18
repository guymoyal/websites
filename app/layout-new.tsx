import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Buzz World - Discover the Best AI Tools',
  description: 'Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.',
  author: 'AI Buzz World',
  keywords: 'ai tools, artificial intelligence, ai buzz world, technology, productivity, automation, machine learning, ai reviews',
  creator: 'AI Buzz World',
  publisher: 'AI Buzz World',
  robots: 'index, follow',
  googlebot: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1',
  canonical: 'https://aibuzztools.com/',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        
        {/* Secondary Script */}
        <script 
          src="//couphaithuph.net/ntfc.php?p=9764467" 
          data-cfasync="false" 
          async
        />
        
        {/* Google AdSense */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2858012859068424`}
          crossOrigin="anonymous"
        />
        
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
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
