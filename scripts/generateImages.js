const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

class ImageGenerator {
  constructor() {
    this.contentDir = path.join(__dirname, '../content');
    this.imagesDir = path.join(__dirname, '../public/images');
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.provider = process.env.IMAGE_PROVIDER || 'replicate'; // 'replicate', 'openai', or 'placeholder'
  }

  async generateImages() {
    console.log('🖼️ Generating AI images for articles...');
    
    // Check API keys based on provider
    if (this.provider === 'replicate' && !this.replicateApiToken) {
      console.warn('⚠️ REPLICATE_API_TOKEN not found. Using placeholder images.');
      this.provider = 'placeholder';
    } else if (this.provider === 'openai' && !this.openaiApiKey) {
      console.warn('⚠️ OPENAI_API_KEY not found. Using placeholder images.');
      this.provider = 'placeholder';
    }

    console.log(`🎨 Using image provider: ${this.provider}`);
    
    try {
      // Read articles
      const articlesPath = path.join(this.contentDir, 'articles.json');
      if (!await fs.pathExists(articlesPath)) {
        console.error('❌ No articles.json found. Run "yarn generate:content" first.');
        return;
      }

      const articles = await fs.readJSON(articlesPath);
      
      await fs.ensureDir(this.imagesDir);
      
      for (const article of articles) {
        console.log(`🎨 Generating image for: ${article.title}`);
        
        try {
          let imageUrl = null;
          
          switch (this.provider) {
            case 'replicate':
              imageUrl = await this.generateImageWithReplicate(article.imagePrompt || article.title);
              break;
            case 'openai':
              imageUrl = await this.generateImageWithOpenAI(article.imagePrompt || article.title);
              break;
            default:
              imageUrl = await this.generatePlaceholderImage(article.slug);
              break;
          }
          
          if (imageUrl) {
            // Download and save image (or use placeholder path)
            const imagePath = this.provider === 'placeholder' 
              ? imageUrl 
              : await this.downloadAndSaveImage(imageUrl, article.slug);
            
            article.image = imagePath;
            console.log(`✅ Generated image: ${imagePath}`);
          }
        } catch (error) {
          console.error(`❌ Failed to generate image for ${article.title}:`, error.message);
          // Use placeholder image as fallback
          article.image = await this.generatePlaceholderImage(article.slug);
          console.log(`🔄 Using placeholder image instead: ${article.image}`);
        }
        
        // Add delay to avoid rate limiting
        if (this.provider !== 'placeholder') {
          console.log('⏳ Waiting 3 seconds before next image...');
          await new Promise(resolve => setTimeout(() => resolve(), 3000));
        }
      }
      
      // Save updated articles with image paths
      await fs.writeJSON(articlesPath, articles, { spaces: 2 });
      
      console.log('✅ Image generation completed!');
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
    }
  }

  async generateImageWithReplicate(prompt) {
    if (!this.replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN not found');
    }

    try {
      console.log(`🎨 Generating image with Replicate: ${prompt.substring(0, 50)}...`);
      
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          input: {
            prompt: this.enhancePrompt(prompt),
            width: 1024,
            height: 768,
            scheduler: 'K_EULER',
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 20,
            seed: Math.floor(Math.random() * 1000000),
          },
        }),
      });

      const prediction = await response.json();
      
      if (prediction.error) {
        console.error('Replicate prediction error:', prediction.error);
        throw new Error(prediction.error);
      }

      console.log(`⏳ Waiting for image generation (ID: ${prediction.id})...`);
      
      // Poll for completion
      let result = prediction;
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout
      
      while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
        if (attempts % 10 === 0) {
          console.log(`⏳ Still processing... (${attempts}s)`);
        }
        await new Promise(resolve => setTimeout(() => resolve(), 1000));
        attempts++;
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${this.replicateApiToken}`,
          },
        });
        
        result = await statusResponse.json();
      }

      if (result.status === 'succeeded' && result.output && result.output.length > 0) {
        console.log(`✅ Image generated successfully!`);
        return result.output[0];
      }

      console.error('Image generation failed:', result);
      throw new Error(`Image generation failed with status: ${result.status}`);

    } catch (error) {
      console.error('Replicate API error:', error);
      throw error;
    }
  }

  async generateImageWithOpenAI(prompt) {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not found');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: this.enhancePrompt(prompt),
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data[0].url;

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async downloadAndSaveImage(imageUrl, slug) {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const imagePath = `/images/${slug}.webp`;
      const fullPath = path.join(this.imagesDir, `${slug}.webp`);

      // Convert to WebP for better performance
      await sharp(Buffer.from(buffer))
        .webp({ quality: 85 })
        .resize(1024, 768, { fit: 'cover' })
        .toFile(fullPath);

      return imagePath;

    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async generatePlaceholderImage(slug) {
    const imagePath = `/images/${slug}-placeholder.jpg`;
    const fullPath = path.join(this.imagesDir, `${slug}-placeholder.jpg`);
    
    // Generate a simple gradient placeholder
    const colors = [
      { r: 59, g: 130, b: 246 },   // Blue
      { r: 139, g: 92, b: 246 },   // Purple
      { r: 245, g: 158, b: 11 },   // Orange
      { r: 34, g: 197, b: 94 },    // Green
      { r: 239, g: 68, b: 68 },    // Red
    ];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    await sharp({
      create: {
        width: 1024,
        height: 768,
        channels: 3,
        background: color
      }
    })
    .jpeg({ quality: 80 })
    .toFile(fullPath);
    
    return imagePath;
  }

  enhancePrompt(prompt) {
    return `${prompt}, professional illustration, modern design, clean and engaging, high quality, suitable for blog article, digital art, vibrant colors, technology theme`;
  }

  async generateHeroImage() {
    console.log('🎨 Generating hero image...');
    
    const heroImagePath = '/images/hero-placeholder.jpg';
    const fullPath = path.join(this.imagesDir, 'hero-placeholder.jpg');
    
    await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 59, g: 130, b: 246 }
      }
    })
    .jpeg({ quality: 80 })
    .toFile(fullPath);
    
    console.log('✅ Hero image generated!');
    return heroImagePath;
  }
}

async function main() {
  const generator = new ImageGenerator();
  
  try {
    await fs.ensureDir(generator.imagesDir);
    await generator.generateHeroImage();
    
    if (process.env.IMAGE_GENERATION_ENABLED === 'true') {
      await generator.generateImages();
    } else {
      console.log('⚠️ Image generation disabled. Set IMAGE_GENERATION_ENABLED=true to enable.');
      console.log('💡 Using placeholder images instead.');
      await generator.generateImages(); // Will use placeholders
    }
    
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ImageGenerator };