# CloudFlare Pages Deployment Instructions

Deploy your AI Buzz World static website to CloudFlare Pages for fast, global distribution.

## 🚀 Quick Deployment Guide

### Method 1: Direct Upload (Recommended for First Deploy)

1. **Build Your Website**
   ```bash
   npm run build
   ```
   This creates the static files in the `./out` directory.

2. **Login to CloudFlare Dashboard**
   - Go to [CloudFlare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Pages** in the left sidebar

3. **Create New Project**
   - Click **"Create a project"**
   - Choose **"Upload assets"** tab
   - Click **"Create a new project"**

4. **Upload Your Site**
   - **Project name**: `ai-buzz-world` (or your preferred name)
   - **Production branch**: Leave as `main`
   - Drag and drop the entire `./out` folder OR click **"Select from computer"** and choose the `./out` directory
   - Click **"Deploy site"**

5. **Configure Custom Domain**
   - After deployment, go to **Custom domains** tab
   - Click **"Set up a custom domain"**
   - Enter: `aibuzztools.com`
   - Follow DNS configuration instructions

### Method 2: Git Integration (Recommended for Ongoing Updates)

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Buzz World"
   git branch -M main
   git remote add origin https://github.com/yourusername/ai-buzz-world.git
   git push -u origin main
   ```

2. **Connect to CloudFlare Pages**
   - In CloudFlare Dashboard, go to **Pages**
   - Click **"Create a project"**
   - Choose **"Connect to Git"** tab
   - Select your GitHub repository

3. **Configure Build Settings**
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: npm run build
   Build output directory: out
   Root directory: /
   ```

4. **Environment Variables**
   - Go to **Settings** > **Environment variables**
   - Add your environment variables:
   ```
   WEBSITE_TOPIC=AI Tools Directory
   WEBSITE_NAME=AI Buzz World
   WEBSITE_DESCRIPTION=Discover the best AI tools with comprehensive reviews and guides
   WEBSITE_URL=https://aibuzztools.com
   DEEPSEEK_API_KEY=your_deepseek_key_here
   REPLICATE_API_TOKEN=your_replicate_token_here
   IMAGE_PROVIDER=replicate
   IMAGE_GENERATION_ENABLED=true
   GOOGLE_ADSENSE_CLIENT_ID=your_adsense_id
   GOOGLE_ANALYTICS_ID=your_analytics_id
   ARTICLES_TO_GENERATE=10
   ```

5. **Deploy**
   - Click **"Save and Deploy"**
   - CloudFlare will automatically build and deploy your site

## 🔧 Build Configuration

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Generate content (run before build)
npm run generate:content
npm run generate:images
```

### Build Settings for CloudFlare Pages
```yaml
Build command: npm run build
Build output directory: out
Node.js version: 18.x
```

## 🌐 Domain Configuration

### DNS Settings for aibuzztools.com

1. **Add CNAME Record**
   ```
   Type: CNAME
   Name: aibuzztools.com (or @)
   Target: your-project.pages.dev
   ```

2. **Add WWW Redirect**
   ```
   Type: CNAME
   Name: www
   Target: your-project.pages.dev
   ```

### SSL/TLS Configuration
- CloudFlare automatically provides SSL certificates
- Set SSL/TLS mode to **"Full (strict)"** for best security

## 📊 Performance Optimization

### CloudFlare Settings
1. **Speed** > **Optimization**
   - Enable **Auto Minify** (HTML, CSS, JS)
   - Enable **Brotli** compression
   - Enable **Rocket Loader**

2. **Caching** > **Configuration**
   - Set **Browser Cache TTL** to 1 month
   - Enable **Always Online**

3. **Speed** > **Polish**
   - Enable **Polish** for image optimization
   - Set to **Lossless** or **Lossy** based on preference

## 🔄 Automatic Deployments

### GitHub Integration Benefits
- **Automatic builds** on every push to main branch
- **Preview deployments** for pull requests
- **Rollback capability** to previous deployments
- **Build logs** for debugging

### Deployment Workflow
1. Make changes to your code
2. Commit and push to GitHub
3. CloudFlare automatically detects changes
4. Builds and deploys new version
5. Updates live site at aibuzztools.com

## 📈 Analytics & Monitoring

### CloudFlare Analytics
- Go to **Analytics & Logs** > **Web Analytics**
- View traffic, performance, and security metrics
- Set up **Real User Monitoring (RUM)**

### Custom Analytics
- Your Google Analytics is already configured
- AdSense integration ready for monetization

## 🛡️ Security Features

### Automatic Security
- **DDoS protection**
- **Web Application Firewall (WAF)**
- **Bot management**
- **SSL/TLS encryption**

### Additional Security
- Enable **Security Level** to Medium or High
- Configure **Rate Limiting** if needed
- Set up **Page Rules** for specific paths

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build locally first
   npm run build
   
   # Check build logs in CloudFlare dashboard
   # Ensure all environment variables are set
   ```

2. **Images Not Loading**
   ```bash
   # Ensure images are in public directory
   # Check image paths in components
   # Verify image generation completed
   ```

3. **Environment Variables Not Working**
   - Double-check variable names in CloudFlare dashboard
   - Ensure no extra spaces or quotes
   - Redeploy after adding variables

4. **Domain Not Working**
   - Check DNS propagation (can take up to 24 hours)
   - Verify CNAME records are correct
   - Check SSL/TLS settings

### Support Resources
- [CloudFlare Pages Documentation](https://developers.cloudflare.com/pages/)
- [CloudFlare Community](https://community.cloudflare.com/)
- [Next.js Static Export Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Build works locally (`npm run build`)
- [ ] All environment variables configured
- [ ] Content generated (`npm run generate:content`)
- [ ] Images generated (`npm run generate:images`)
- [ ] Domain purchased and DNS configured

### Post-Deployment
- [ ] Site loads correctly at custom domain
- [ ] All pages and links work
- [ ] Images display properly
- [ ] Google Analytics tracking works
- [ ] AdSense ads display (if configured)
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags present

### Ongoing Maintenance
- [ ] Monitor CloudFlare analytics
- [ ] Update content regularly
- [ ] Check for broken links
- [ ] Monitor site performance
- [ ] Update dependencies monthly

---

**Your AI Buzz World website is now live on CloudFlare Pages!** 🎉

Visit your site at: **https://aibuzztools.com**