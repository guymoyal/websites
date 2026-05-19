/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for Cloudflare Pages/Workers static deployment
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'replicate.delivery'],
  },
  typescript: {
    // Allow production build despite type errors (useful when external TS files are present)
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    WEBSITE_TOPIC: process.env.WEBSITE_TOPIC,
    WEBSITE_NAME: process.env.WEBSITE_NAME,
    WEBSITE_DESCRIPTION: process.env.WEBSITE_DESCRIPTION,
    WEBSITE_URL: process.env.WEBSITE_URL,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_EZOIC_ENABLED: process.env.NEXT_PUBLIC_EZOIC_ENABLED,
    NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON: process.env.NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    // Prevent fs-extra from being bundled in client code
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs-extra': false,
    };
    return config;
  },
};

module.exports = nextConfig;