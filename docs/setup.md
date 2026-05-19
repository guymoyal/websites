# Setup Guide

This guide will walk you through setting up your static website generator from scratch.

## Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Git (for version control)
- Code editor (VS Code recommended)

## Initial Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required: Website Information
WEBSITE_TOPIC="Your Topic Here"
WEBSITE_NAME="Your Site Name"
WEBSITE_DESCRIPTION="Your site description"
WEBSITE_URL="https://your-domain.com"

# Required: Content Generation
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Optional: AI Image Generation
REPLICATE_API_TOKEN=your_replicate_token_here
IMAGE_GENERATION_ENABLED=true

# Optional: Database (use JSON by default)
CONTENT_SOURCE=json

# Optional: Monetization
NEXT_PUBLIC_EZOIC_ENABLED=false
NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON={}
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-your-analytics-id
```

### 3. Generate Initial Content

```bash
yarn generate:content
```

This will create:
- 10 blog articles about your topic
- Site configuration
- Navigation structure
- SEO metadata

### 4. Generate Images (Optional)

If you have a Replicate API token:

```bash
yarn generate:images
```

This will create AI-generated images for your articles.

### 5. Start Development Server

```bash
yarn dev
```

Your site will be available at `http://localhost:3000`

## API Key Setup

### DeepSeek API Key

1. Go to [DeepSeek Platform](https://platform.deepseek.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to `DEEPSEEK_API_KEY` in your `.env.local`

### Replicate API Token (Optional)

1. Go to [Replicate](https://replicate.com)
2. Create an account or sign in
3. Go to Account Settings
4. Generate an API token
5. Copy the token to `REPLICATE_API_TOKEN` in your `.env.local`

### EzoicAds (Optional display ads)

1. Follow [Ezoic integration](https://docs.ezoic.com/docs/ezoicads/integration/)
2. Set `NEXT_PUBLIC_EZOIC_ENABLED` and `NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON` in `.env.local` (see `.env.local.example`)

### Google Analytics (Optional)

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property
3. Get your Measurement ID (format: G-xxxxxxxxx)
4. Add to `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` (or `GOOGLE_ANALYTICS_ID`) in your `.env.local`

## Content Customization

### Editing Generated Content

Generated content is stored in the `/content` directory:

- `articles.json` - Blog articles
- `pages.json` - Static pages
- `config.json` - Site configuration

You can edit these files manually or regenerate them.

### Adding Custom Content

To add a new article manually:

1. Edit `content/articles.json`
2. Add your article object:

```json
{
  "title": "Your Article Title",
  "slug": "your-article-slug",
  "metaDescription": "Article description",
  "keywords": ["keyword1", "keyword2"],
  "category": "Your Category",
  "readingTime": 5,
  "content": "Your article content in markdown",
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "featured": false,
  "status": "published"
}
```

### Customizing Site Configuration

Edit `content/config.json`:

```json
{
  "name": "Your Site Name",
  "description": "Your site description",
  "navigation": [
    { "name": "Home", "href": "/" },
    { "name": "Blog", "href": "/blog" }
  ],
  "seo": {
    "defaultTitle": "Your Default Title",
    "defaultDescription": "Your default description",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

## Styling and Branding

### CSS Variables

Edit `app/globals.css` to customize colors:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --accent-color: #f59e0b;
  --background-color: #ffffff;
  --text-color: #1f2937;
}
```

### Logo and Branding

1. Replace logo in `public/logo.svg`
2. Update favicon in `public/favicon.ico`
3. Edit site name in `content/config.json`

### Custom Styling

Component styles are in `*.module.css` files:

- `app/page.module.css` - Homepage styles
- `components/layout/Header.module.css` - Header styles
- `components/layout/Footer.module.css` - Footer styles

## Deployment Setup

### Netlify

1. **Connect Repository**
   - Link your GitHub repository
   - Set build command: `yarn build`
   - Set publish directory: `out`

2. **Environment Variables**
   - Add all environment variables in Netlify dashboard
   - Go to Site settings > Environment variables

3. **Custom Domain**
   - Add your domain in Site settings > Domain management
   - Configure DNS records as shown

### Vercel

1. **Import Project**
   - Import from GitHub in Vercel dashboard
   - Build settings are automatically detected

2. **Environment Variables**
   - Add environment variables in Project settings

3. **Custom Domain**
   - Add domain in Project settings > Domains

### CloudFlare Pages

1. **Connect Repository**
   - Connect GitHub repo to CloudFlare Pages
   - Build command: `yarn build`
   - Output directory: `out`

2. **Environment Variables**
   - Add in Pages project settings

## SEO Optimization

### Meta Tags

The site automatically generates:
- Title tags (configurable)
- Meta descriptions
- Keywords
- Open Graph tags
- Twitter Card tags

### Sitemap

Sitemap is automatically generated at `/sitemap.xml`

### Performance

- Images are optimized automatically
- Code splitting is enabled
- Static generation for fast loading

## Monetization Setup

### Optional display ads (EzoicAds)

1. **Connect site**
   - Complete onboarding in Ezoic and align `ads.txt`

2. **Configure env**
   - Set `NEXT_PUBLIC_EZOIC_ENABLED` and placements JSON (`lib/ezoicZones.ts` documents slot keys)

3. **Customize**
   - Adjust sponsor block (`NEXT_PUBLIC_SPONSOR_*`) and affiliate strip (`NEXT_PUBLIC_AFFILIATES_JSON`) if needed

### Analytics Setup

1. **Google Analytics**
   - Create GA4 property
   - Add tracking ID to environment variables
   - Analytics will be automatically integrated

2. **Performance Monitoring**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals
   - Track conversion goals

## Advanced Configuration

### Database Integration

To use Supabase instead of JSON files:

1. Set `CONTENT_SOURCE=supabase` in `.env.local`
2. Add Supabase credentials
3. Run migration scripts (if available)

### Custom AI Models

To use different AI providers:

1. Edit `lib/aiImages.ts`
2. Add your provider configuration
3. Update generation scripts

### Content Management

For non-technical users:

1. Set up a CMS (optional)
2. Create content templates
3. Build admin interface (advanced)

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check API key format
   - Verify API key is active
   - Check rate limits

2. **Build Errors**
   - Clear `.next` folder
   - Check Node.js version
   - Verify all dependencies

3. **Image Generation Issues**
   - Check Replicate API token
   - Verify image generation is enabled
   - Check file permissions

### Performance Issues

1. **Slow Generation**
   - Reduce number of articles
   - Disable image generation
   - Check API rate limits

2. **Large Bundle Size**
   - Analyze bundle with `yarn analyze`
   - Optimize images
   - Remove unused dependencies

### Content Issues

1. **Poor Quality Content**
   - Improve prompts in generation scripts
   - Use more specific topics
   - Edit generated content manually

2. **SEO Problems**
   - Check meta tags
   - Verify sitemap generation
   - Test with SEO tools

## Next Steps

After setup:

1. **Content Review**
   - Review generated articles
   - Edit and improve content
   - Add more articles as needed

2. **SEO Optimization**
   - Submit to search engines
   - Create backlinks
   - Monitor rankings

3. **Monetization**
   - Optimize ad placement
   - Track revenue
   - Experiment with ad types

4. **Growth**
   - Add more topics
   - Create comparison pages
   - Build email list

## Support

For additional help:

1. Check the main README.md
2. Review the troubleshooting guide
3. Open an issue on GitHub
4. Join the community discussions

---

**You're ready to build!** 🚀