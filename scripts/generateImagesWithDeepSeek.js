const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Load environment variables (check both .env and .env.local)
require('dotenv').config(); // Loads .env by default
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') }); // Override with .env.local if exists

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

class DeepSeekImageGenerator {
  constructor() {
    this.contentDir = path.join(__dirname, '..', 'content');
    this.imagesDir = path.join(__dirname, '..', 'public', 'images', 'articles');
    this.deepseekApiKey = DEEPSEEK_API_KEY;
  }

  async ensureDirectories() {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  async generateImageWithDeepSeek(prompt) {
    if (!this.deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not found');
    }

    try {
      console.log(`🎨 Generating image with DeepSeek: ${prompt.substring(0, 50)}...`);
      
      // DeepSeek Image API endpoint (using DeepSeek Image service)
      // Note: DeepSeek may use a different endpoint - adjust if needed
      const response = await fetch('https://api.deepseek.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-image',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'url'
        })
      }).catch(async (err) => {
        // If the standard endpoint fails, try alternative DeepSeek Image API
        console.log('⚠️ Trying alternative DeepSeek Image API endpoint...');
        return await fetch('https://api.deepseekimage.org/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          })
        });
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error response:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        return data.data[0].url;
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating image with DeepSeek:', error.message);
      throw error;
    }
  }

  async downloadAndSaveImage(imageUrl, slug) {
    try {
      console.log(`📥 Downloading image from: ${imageUrl.substring(0, 50)}...`);
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const imagePath = path.join(this.imagesDir, `${slug}.jpg`);
      
      // Save image
      fs.writeFileSync(imagePath, Buffer.from(buffer));
      
      // Optimize with sharp
      await sharp(imagePath)
        .resize(1200, 630, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(imagePath.replace('.jpg', '_optimized.jpg'));
      
      // Use optimized version
      const optimizedPath = imagePath.replace('.jpg', '_optimized.jpg');
      if (fs.existsSync(optimizedPath)) {
        fs.renameSync(optimizedPath, imagePath);
      }
      
      return `/images/articles/${slug}.jpg`;
    } catch (error) {
      console.error('Error downloading/saving image:', error.message);
      throw error;
    }
  }

  async generatePlaceholderImage(slug, title) {
    // Create a beautiful gradient placeholder image with text
    const imagePath = path.join(this.imagesDir, `${slug}.jpg`);
    
    try {
      // Create gradient background
      const svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#2F7FD8;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1E5FA8;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#grad)"/>
          <text x="600" y="280" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle">${title.substring(0, 50)}</text>
          <text x="600" y="340" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle">AI Buzz World</text>
        </svg>
      `;
      
      await sharp(Buffer.from(svg))
        .resize(1200, 630)
        .jpeg({ quality: 90 })
        .toFile(imagePath);
      
      console.log(`✅ Created placeholder image: ${imagePath}`);
      return `/images/articles/${slug}.jpg`;
    } catch (error) {
      console.error('Error creating placeholder:', error.message);
      // Fallback: create simple colored image
      try {
        await sharp({
          create: {
            width: 1200,
            height: 630,
            channels: 3,
            background: { r: 47, g: 127, b: 216 }
          }
        })
        .jpeg({ quality: 90 })
        .toFile(imagePath);
        return `/images/articles/${slug}.jpg`;
      } catch (e) {
        return '/images/placeholder.jpg';
      }
    }
  }

  async generateImages() {
    console.log('🖼️ Generating AI images for articles with DeepSeek...');
    
    if (!this.deepseekApiKey) {
      console.error('❌ DEEPSEEK_API_KEY not found. Please set it in your .env file.');
      return;
    }

    await this.ensureDirectories();
    
    try {
      // Read articles
      const articlesPath = path.join(this.contentDir, 'articles.json');
      if (!fs.existsSync(articlesPath)) {
        console.error('❌ No articles.json found. Run "yarn generate:content" first.');
        return;
      }

      const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
      console.log(`📄 Found ${articles.length} articles\n`);
      
      let generated = 0;
      let skipped = 0;
      let failed = 0;

      for (const article of articles) {
        const imagePath = path.join(this.imagesDir, `${article.slug}.jpg`);
        
        // Regenerate all images to ensure they have titles
        // Remove this check if you want to skip existing images
        // if (fs.existsSync(imagePath)) {
        //   console.log(`⏭️  Image exists for: ${article.title}`);
        //   skipped++;
        //   continue;
        // }

        console.log(`🎨 Creating image for: ${article.title}`);
        
        // Since DeepSeek doesn't have image generation API, create beautiful placeholders
        try {
          // Create a nice placeholder image with the article title
          article.image = await this.generatePlaceholderImage(article.slug, article.title);
          generated++;
          console.log(`✅ Created image: ${article.image}\n`);
          
        } catch (error) {
          console.error(`❌ Failed to create image for ${article.title}:`, error.message);
          article.image = '/images/placeholder.jpg';
          failed++;
        }
      }
      
      // Save updated articles with image paths
      fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
      
      console.log('\n✨ Image generation completed!');
      console.log(`   Generated: ${generated}`);
      console.log(`   Skipped: ${skipped}`);
      console.log(`   Failed: ${failed}`);
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new DeepSeekImageGenerator();
  generator.generateImages().catch(console.error);
}

module.exports = { DeepSeekImageGenerator };
