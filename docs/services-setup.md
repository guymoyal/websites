# Services Setup Guide

This comprehensive guide will walk you through setting up all the external services needed for your static website generator.

## 🔑 Required API Keys

### 1. DeepSeek API (Content Generation) - **REQUIRED**

DeepSeek is used for AI-powered content generation.

**Setup Steps:**

1. **Create Account**
   - Visit [DeepSeek Platform](https://platform.deepseek.com)
   - Sign up with your email or GitHub account
   - Verify your email address

2. **Get API Key**
   - Log into your DeepSeek dashboard
   - Navigate to "API Keys" section
   - Click "Create New API Key"
   - Copy the generated key (starts with `sk-`)

3. **Add to Environment**
   ```env
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
   ```

4. **Pricing**
   - Pay-per-use model
   - Very affordable for content generation
   - Check current pricing on their website

---

## 🖼️ Image Generation Services (Optional)

Choose one of these services for AI image generation:

### Option 1: Replicate API (Recommended)

**Setup Steps:**

1. **Create Account**
   - Visit [Replicate](https://replicate.com)
   - Sign up with GitHub or email
   - Verify your account

2. **Get API Token**
   - Go to Account Settings
   - Navigate to "API tokens"
   - Create a new token
   - Copy the token (starts with `r8_`)

3. **Add to Environment**
   ```env
   REPLICATE_API_TOKEN=r8_your-replicate-token-here
   IMAGE_PROVIDER=replicate
   IMAGE_GENERATION_ENABLED=true
   ```

4. **Pricing**
   - Pay per image generated
   - ~$0.01-0.05 per image
   - No monthly fees

### Option 2: OpenAI DALL-E

**Setup Steps:**

1. **Create Account**
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Sign up and verify your account
   - Add payment method (required for API access)

2. **Get API Key**
   - Go to API Keys section
   - Create new secret key
   - Copy the key (starts with `sk-`)

3. **Add to Environment**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   IMAGE_PROVIDER=openai
   IMAGE_GENERATION_ENABLED=true
   ```

4. **Pricing**
   - DALL-E 3: $0.040 per image (1024×1024)
   - DALL-E 2: $0.020 per image (1024×1024)

### Option 3: No AI Images (Free)

If you don't want to use AI image generation:

```env
IMAGE_GENERATION_ENABLED=false
IMAGE_PROVIDER=placeholder
```

This will generate colorful placeholder images instead.

---

## 🗄️ Database Services (Optional)

### Option 1: JSON Files (Default - Free)

No setup required. Content is stored in local JSON files.

```env
CONTENT_SOURCE=json
```

### Option 2: Supabase Database

**Setup Steps:**

1. **Create Project**
   - Visit [Supabase](https://supabase.com)
   - Sign up with GitHub
   - Create a new project
   - Choose a region close to your users
   - Wait for project setup (2-3 minutes)

2. **Get Credentials**
   - Go to Project Settings > API
   - Copy the following:
     - Project URL
     - Anon public key
     - Service role key (keep secret!)

3. **Add to Environment**
   ```env
   CONTENT_SOURCE=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. **Database Setup**
   - The application will create necessary tables automatically
   - Or run migration scripts if provided

5. **Pricing**
   - Free tier: 500MB database, 2GB bandwidth
   - Paid plans start at $25/month

---

## 💰 Monetization Services (Optional)

### EzoicAds

**Setup Steps:**

1. **Sign up & connect site**
   - Follow [Ezoic integration](https://docs.ezoic.com/docs/ezoicads/integration/)

2. **Configure environment**
   ```env
   NEXT_PUBLIC_EZOIC_ENABLED=true
   NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON={}
   ```

3. **Placements**
   - Map placeholders to Ezoic placement IDs (`lib/ezoicZones.ts` + env JSON)

4. **`ads.txt`**
   - Use the snippet Ezoic provides; this project may redirect `/ads.txt` via Cloudflare Worker (`EZOIC_ADSTXT_REDIRECT`).

### Google Analytics

**Setup Steps:**

1. **Create Property**
   - Visit [Google Analytics](https://analytics.google.com)
   - Create new account/property
   - Choose "Web" platform
   - Enter your website details

2. **Get Measurement ID**
   - Copy your Measurement ID (format: `G-xxxxxxxxx`)

3. **Add to Environment**
   ```env
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-your-measurement-id
   ```

---

## 🚀 Deployment Services

### Option 1: Netlify (Recommended)

**Setup Steps:**

1. **Create Account**
   - Visit [Netlify](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Site**
   - Connect your GitHub repository
   - Build command: `yarn build`
   - Publish directory: `out`

3. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add all your environment variables
   - **Important:** Don't add secret keys to client-side variables

4. **Custom Domain**
   - Go to Domain settings
   - Add your custom domain
   - Configure DNS records as shown

5. **Pricing**
   - Free tier: 100GB bandwidth, 300 build minutes
   - Pro: $19/month for more resources

### Option 2: Vercel

**Setup Steps:**

1. **Import Project**
   - Visit [Vercel](https://vercel.com)
   - Import from GitHub
   - Build settings are auto-detected

2. **Environment Variables**
   - Add in Project settings > Environment variables

3. **Custom Domain**
   - Add in Project settings > Domains

4. **Pricing**
   - Free tier: 100GB bandwidth
   - Pro: $20/month per user

### Option 3: Cloudflare Pages

**Setup Steps:**

1. **Connect Repository**
   - Visit [Cloudflare Pages](https://pages.cloudflare.com)
   - Connect GitHub repository
   - Build command: `yarn build`
   - Output directory: `out`

2. **Environment Variables**
   - Add in Pages project settings

3. **Custom Domain**
   - Automatic if using Cloudflare DNS
   - Or configure DNS records

4. **Pricing**
   - Free tier: Unlimited bandwidth
   - Paid plans for advanced features

---

## 📧 Email Services (Optional)

### EmailJS (Contact Forms)

**Setup Steps:**

1. **Create Account**
   - Visit [EmailJS](https://emailjs.com)
   - Sign up for free account

2. **Setup Email Service**
   - Add email service (Gmail, Outlook, etc.)
   - Create email template
   - Get service ID and template ID

3. **Add to Environment**
   ```env
   EMAILJS_SERVICE_ID=your-service-id
   EMAILJS_TEMPLATE_ID=your-template-id
   EMAILJS_PUBLIC_KEY=your-public-key
   ```

---

## 🔍 SEO Services (Optional)

### Google Search Console

**Setup Steps:**

1. **Add Property**
   - Visit [Google Search Console](https://search.google.com/search-console)
   - Add your website URL
   - Verify ownership (HTML file or DNS)

2. **Submit Sitemap**
   - Go to Sitemaps section
   - Submit: `https://yoursite.com/sitemap.xml`

### Bing Webmaster Tools

**Setup Steps:**

1. **Add Site**
   - Visit [Bing Webmaster Tools](https://www.bing.com/webmasters)
   - Add your website
   - Verify ownership

2. **Submit Sitemap**
   - Submit your sitemap URL

---

## 🛡️ Security & Performance (Optional)

### Cloudflare (CDN & Security)

**Setup Steps:**

1. **Add Site**
   - Visit [Cloudflare](https://cloudflare.com)
   - Add your domain
   - Update nameservers

2. **Configure Settings**
   - Enable SSL/TLS
   - Set up caching rules
   - Configure security settings

---

## 📋 Complete Environment File Example

Here's a complete `.env.local` file with all possible configurations:

```env
# Website Configuration
WEBSITE_TOPIC="AI Tools 2025"
WEBSITE_NAME="AI Tools Hub"
WEBSITE_DESCRIPTION="Your ultimate guide to AI tools and technologies"
WEBSITE_URL="https://your-domain.com"

# Content Generation (REQUIRED)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# Image Generation (Choose one or use placeholder)
REPLICATE_API_TOKEN=r8_your-replicate-token-here
# OR
OPENAI_API_KEY=sk-your-openai-api-key-here

IMAGE_PROVIDER=replicate  # 'replicate', 'openai', or 'placeholder'
IMAGE_GENERATION_ENABLED=true

# Database (Optional - defaults to JSON)
CONTENT_SOURCE=json  # or 'supabase'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Monetization (Optional)
NEXT_PUBLIC_EZOIC_ENABLED=false
NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON={}
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-your-measurement-id

# Email (Optional)
EMAILJS_SERVICE_ID=your-service-id
EMAILJS_TEMPLATE_ID=your-template-id
EMAILJS_PUBLIC_KEY=your-public-key

# Build Configuration
ARTICLES_TO_GENERATE=10
```

---

## 🚀 Quick Start Checklist

### Minimum Setup (Free)
- [ ] Get DeepSeek API key
- [ ] Set `IMAGE_GENERATION_ENABLED=false`
- [ ] Set `CONTENT_SOURCE=json`
- [ ] Run `yarn generate:content`
- [ ] Deploy to Netlify/Vercel

### Recommended Setup
- [ ] Get DeepSeek API key
- [ ] Get Replicate API token
- [ ] Optionally enable Ezoic via env (`NEXT_PUBLIC_EZOIC_*`)
- [ ] Set up Google Analytics
- [ ] Deploy with custom domain

### Full Setup
- [ ] All of the above
- [ ] Set up Supabase database
- [ ] Configure email service
- [ ] Set up SEO tools
- [ ] Configure Cloudflare

---

## 🆘 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check key format and validity
   - Verify environment variable names
   - Restart development server after changes

2. **Image Generation Fails**
   - Check API quotas and billing
   - Verify internet connection
   - Try different image provider

3. **Build Errors**
   - Clear `.next` folder
   - Check Node.js version (18+)
   - Verify all dependencies installed

4. **Deployment Issues**
   - Check build logs
   - Verify environment variables
   - Test build locally first

### Getting Help

- Check the main README.md
- Review error logs carefully
- Test API keys independently
- Contact service support if needed

---

**Ready to build your AI-powered website!** 🚀