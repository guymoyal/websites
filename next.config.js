/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for development - uncomment only for static export builds
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
    GOOGLE_ADSENSE_CLIENT_ID: process.env.GOOGLE_ADSENSE_CLIENT_ID,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;