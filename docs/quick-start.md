# Quick Start Guide

Get your AI-powered website up and running in minutes!

## 🚀 1-Minute Setup (Free Version)

### Step 1: Get DeepSeek API Key
1. Visit [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up and create an API key
3. Copy the key (starts with `sk-`)

### Step 2: Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your DeepSeek API key:
```env
DEEPSEEK_API_KEY=sk-your-key-here
IMAGE_GENERATION_ENABLED=false
```

### Step 3: Generate Content
```bash
yarn install
yarn generate:content
yarn generate:images  # Creates placeholder images
```

### Step 4: Start Development
```bash
yarn dev
```

Visit `http://localhost:3000` - Your site is ready! 🎉

---

## 🎨 5-Minute Setup (With AI Images)

### Additional Step: Get Image Generation API

**Option A: Replicate (Recommended)**
1. Visit [Replicate](https://replicate.com)
2. Sign up and get API token
3. Add to `.env.local`:
```env
REPLICATE_API_TOKEN=r8_your-token-here
IMAGE_PROVIDER=replicate
IMAGE_GENERATION_ENABLED=true
```

**Option B: OpenAI DALL-E**
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Get API key and add billing
3. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
IMAGE_PROVIDER=openai
IMAGE_GENERATION_ENABLED=true
```

Then run:
```bash
yarn generate:images  # Generates AI images
```

---

## 💰 10-Minute Setup (With Monetization)

### Additional Steps: Setup AdSense & Analytics

1. **Google AdSense**
   - Apply at [Google AdSense](https://adsense.google.com)
   - Get publisher ID: `ca-pub-xxxxxxxxx`

2. **Google Analytics**
   - Create property at [Google Analytics](https://analytics.google.com)
   - Get measurement ID: `G-xxxxxxxxx`

3. **Add to `.env.local`:**
```env
GOOGLE_ADSENSE_CLIENT_ID=ca-pub-your-id
GOOGLE_ANALYTICS_ID=G-your-id
```

---

## 🚀 Deploy in 2 Minutes

### Netlify (Recommended)
1. Push code to GitHub
2. Visit [Netlify](https://netlify.com)
3. Connect repository
4. Build command: `yarn build`
5. Publish directory: `out`
6. Add environment variables in Netlify dashboard

### Vercel
1. Visit [Vercel](https://vercel.com)
2. Import from GitHub
3. Add environment variables
4. Deploy!

---

## 📝 Customization

### Change Topic
Edit `.env.local`:
```env
WEBSITE_TOPIC="Your New Topic"
WEBSITE_NAME="Your Site Name"
```

Then regenerate content:
```bash
yarn generate:content
```

### Edit Content
- Articles: `content/articles.json`
- Pages: `content/pages.json`
- Config: `content/config.json`

### Styling
- Colors: `app/globals.css`
- Components: `components/**/*.module.css`

---

## 🆘 Need Help?

- 📖 Full documentation: `docs/services-setup.md`
- 🐛 Issues: Check error logs
- 💬 Support: Open GitHub issue

**Happy building!** 🚀