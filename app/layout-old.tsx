import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getSiteConfig } from '@/lib/content';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  
  return {
    title: {
      default: config.seo.defaultTitle,
      template: `%s | ${config.name}`,
    },
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords.join(', '),
    authors: [{ name: config.name }],
    creator: config.name,
    publisher: config.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(config.url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: config.url,
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      siteName: config.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      creator: '@yourusername',
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
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <html lang="en">
      <head>
        
        {/* Support Script */}
        <script
          src="//couphaithuph.net/ntfc.php?p=9764467"
          data-cfasync="false"
          async
        />
        
        {/* Google AdSense - Keep for testing */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2858012859068424'}`}
          crossOrigin="anonymous"
        />
        
        {/* Google Analytics */}
        {process.env.GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header config={config} />
          <main className="flex-1">
            {children}
          </main>
          <Footer config={config} />
        </div>
      </body>
    </html>
  );
}