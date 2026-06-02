const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// Load environment variables (check both .env and .env.local)
require('dotenv').config(); // Loads .env by default
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') }); // Override with .env.local if exists

// Size limits (in bytes): logos ≤50kb, article banners ≤100kb
const BANNER_MAX_BYTES = 100 * 1024;

class ImageGenerator {
  constructor() {
    this.contentDir = path.join(__dirname, '../content');
    this.imagesDir = path.join(__dirname, '../public/images');
    this.articlesImagesDir = path.join(__dirname, '../public/images/articles');
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    this.openrouterApiKey = process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    /** @see https://openrouter.ai/models?output_modalities=image */
    this.openrouterImageModel =
      process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image';
    // Default: placeholder only. Paid APIs run ONLY when IMAGE_GENERATION_ENABLED=true (see below).
    this.provider = process.env.IMAGE_PROVIDER || 'placeholder';
    this.paidImagesEnabled = process.env.IMAGE_GENERATION_ENABLED === 'true';
    if (!this.paidImagesEnabled && this.provider !== 'placeholder') {
      console.warn(
        '⚠️  Paid image generation is OFF (IMAGE_GENERATION_ENABLED is not "true"). Using placeholders only — no Gemini/Replicate/OpenAI/OpenRouter image spend.'
      );
      this.provider = 'placeholder';
    }
  }

  async generateImages() {
    console.log('🖼️ Generating AI images for articles...');
    
    // Check API keys based on provider
    if (this.provider === 'gemini' && !this.geminiApiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found. Using placeholder images.');
      this.provider = 'placeholder';
    } else if (this.provider === 'replicate' && !this.replicateApiToken) {
      console.warn('⚠️ REPLICATE_API_TOKEN not found. Using placeholder images.');
      this.provider = 'placeholder';
    } else if (this.provider === 'openai' && !this.openaiApiKey) {
      console.warn('⚠️ OPENAI_API_KEY not found. Using placeholder images.');
      this.provider = 'placeholder';
    } else if (this.provider === 'openrouter' && !this.openrouterApiKey) {
      console.warn('⚠️ OPEN_ROUTER_API_KEY (or OPENROUTER_API_KEY) not found. Using placeholder images.');
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
      await fs.ensureDir(this.articlesImagesDir);
      
      for (const article of articles) {
        console.log(`🎨 Generating image for: ${article.title}`);
        const prompt = this.buildArticleImagePrompt(article);
        
        try {
          let imageUrl = null, imageBuffer = null;
          switch (this.provider) {
            case 'gemini':
              imageBuffer = await this.generateImageWithGeminiWithRetry(prompt);
              break;
            case 'replicate':
              imageUrl = await this.generateImageWithReplicate(prompt);
              break;
            case 'openai':
              imageUrl = await this.generateImageWithOpenAI(prompt);
              break;
            case 'openrouter':
              imageBuffer = await this.generateImageWithOpenRouterWithRetry(prompt);
              break;
            default:
              imageUrl = await this.generatePlaceholderImage(article.slug, article.title);
              break;
          }
          
          if (imageUrl || imageBuffer) {
            const imagePath = this.provider === 'placeholder' 
              ? imageUrl 
              : imageBuffer 
                ? await this.saveBufferAsBanner(imageBuffer, article.slug)
                : await this.downloadAndSaveImage(imageUrl, article.slug);
            
            article.image = imagePath;
            console.log(`✅ Generated image: ${imagePath}`);
          }
        } catch (error) {
          console.error(`❌ Failed to generate image for ${article.title}:`, error.message);
          article.image = await this.generatePlaceholderImage(article.slug, article.title);
          console.log(`🔄 Using placeholder (retry later for real image): ${article.image}`);
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
    if (process.env.IMAGE_GENERATION_ENABLED !== 'true') {
      throw new Error('Replicate blocked: set IMAGE_GENERATION_ENABLED=true to opt in (costs money).');
    }
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

  async generateImageWithGemini(prompt) {
    if (process.env.IMAGE_GENERATION_ENABLED !== 'true') {
      throw new Error('Gemini image generation blocked: set IMAGE_GENERATION_ENABLED=true to opt in (costs money).');
    }
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${this.geminiApiKey}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: this.enhancePromptForGemini(prompt) }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }
    let b64 = null;
    for (const cand of data.candidates || []) {
      for (const part of (cand.content?.parts || [])) {
        const inline = part.inlineData || part.inline_data;
        if (inline && (inline.data || inline.bytesBase64Encoded)) {
          b64 = inline.data || inline.bytesBase64Encoded;
          break;
        }
      }
      if (b64) break;
    }
    if (!b64) {
      throw new Error('No image in response');
    }
    return Buffer.from(b64, 'base64');
  }

  /** Build a prompt that produces an illustration clearly related to the article topic. */
  buildArticleImagePrompt(article) {
    const topic = article.imagePrompt || article.title;
    const category = article.category || 'General';
    const categoryScenes = {
      'Writing & Content': 'writer at laptop with AI assistant, modern desk, documents, creative workspace',
      'Design & Creative': 'designer using digital canvas, creative studio, art tools, vibrant visuals',
      'Productivity': 'professional at organized desk, workflow tools, calendar, task management',
      'Development': 'developer coding with AI pair programmer, code on screen, terminal',
      'Marketing': 'marketer at dashboard with charts, campaign analytics, social media',
      'Analytics': 'analyst viewing data visualization, charts, insights, business intelligence',
      'Video & Media': 'creator editing video, multimedia production, camera, studio setup',
      'General': 'modern AI technology concept, innovation, automation, professional',
    };
    const sceneHint = categoryScenes[category] || categoryScenes.General;
    return `Create a striking illustration for a blog article. The article is about: "${topic}". 
Scene: ${sceneHint}. Show a clear visual subject in the foreground - people, objects, or a conceptual scene that illustrates the topic.
Do NOT output just a background, gradient, or abstract pattern. There must be a definite illustrated subject.
Style: professional, modern, vibrant, suitable for tech/AI blog. Tight crop, no borders, centered composition.`;
  }

  async generateImageWithGeminiWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateImageWithGemini(prompt);
      } catch (err) {
        console.warn(`  ⚠️ Attempt ${attempt}/${maxRetries} failed:`, err.message);
        if (attempt < maxRetries) {
          const delay = attempt * 5000;
          console.log(`  ⏳ Retrying in ${delay / 1000}s...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
  }

  enhancePromptForGemini(prompt) {
    return prompt;
  }

  async saveBufferAsBanner(buffer, slug) {
    await fs.ensureDir(this.articlesImagesDir);
    const fullPath = path.join(this.articlesImagesDir, `${slug}.webp`);
    let quality = 85;
    let output = await sharp(buffer)
      .resize(1024, 768, { fit: 'cover' })
      .webp({ quality })
      .toBuffer();
    while (output.length > BANNER_MAX_BYTES && quality > 20) {
      quality -= 10;
      output = await sharp(buffer)
        .resize(1024, 768, { fit: 'cover' })
        .webp({ quality })
        .toBuffer();
    }
    await fs.writeFile(fullPath, output);
    return `/images/articles/${slug}.webp`;
  }

  async generateImageWithOpenAI(prompt) {
    if (process.env.IMAGE_GENERATION_ENABLED !== 'true') {
      throw new Error('OpenAI image generation blocked: set IMAGE_GENERATION_ENABLED=true to opt in (costs money).');
    }
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

  parseOpenRouterModalities() {
    const raw = process.env.OPENROUTER_MODALITIES || 'image,text';
    return raw
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  dataUrlToBuffer(dataUrl) {
    const m = /^data:image\/[\w+.-]+;base64,(.+)$/i.exec(String(dataUrl));
    if (!m) {
      throw new Error('OpenRouter: expected base64 data URL in image response');
    }
    return Buffer.from(m[1], 'base64');
  }

  async generateImageWithOpenRouter(prompt) {
    if (process.env.IMAGE_GENERATION_ENABLED !== 'true') {
      throw new Error('OpenRouter image generation blocked: set IMAGE_GENERATION_ENABLED=true to opt in (costs money).');
    }
    if (!this.openrouterApiKey) {
      throw new Error('OPEN_ROUTER_API_KEY or OPENROUTER_API_KEY not found');
    }

    const modalities = this.parseOpenRouterModalities();
    const body = {
      model: this.openrouterImageModel,
      messages: [{ role: 'user', content: this.enhancePrompt(prompt) }],
      modalities,
    };

    if (process.env.OPENROUTER_IMAGE_ASPECT_RATIO || process.env.OPENROUTER_IMAGE_SIZE) {
      body.image_config = {};
      if (process.env.OPENROUTER_IMAGE_ASPECT_RATIO) {
        body.image_config.aspect_ratio = process.env.OPENROUTER_IMAGE_ASPECT_RATIO;
      }
      if (process.env.OPENROUTER_IMAGE_SIZE) {
        body.image_config.image_size = process.env.OPENROUTER_IMAGE_SIZE;
      }
    } else {
      body.image_config = { aspect_ratio: '16:9' };
    }

    const headers = {
      Authorization: `Bearer ${this.openrouterApiKey}`,
      'Content-Type': 'application/json',
    };
    const site = process.env.WEBSITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL;
    if (site) {
      headers['HTTP-Referer'] = site;
    }
    if (process.env.OPENROUTER_APP_NAME) {
      headers['X-Title'] = process.env.OPENROUTER_APP_NAME;
    }

    console.log(`🎨 OpenRouter image (${this.openrouterImageModel}): ${prompt.substring(0, 48)}...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`OpenRouter: invalid JSON (${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      const msg = data?.error?.message || text.slice(0, 400);
      throw new Error(`OpenRouter ${response.status}: ${msg}`);
    }

    const message = data?.choices?.[0]?.message;
    const images = message?.images;
    if (!Array.isArray(images) || images.length === 0) {
      const hint =
        'No images in response. Check OPENROUTER_IMAGE_MODEL supports image output; try OPENROUTER_MODALITIES=image,text or image only.';
      throw new Error(hint);
    }

    const first = images[0];
    const url = first?.image_url?.url || first?.imageUrl?.url;
    if (!url || typeof url !== 'string') {
      throw new Error('OpenRouter: missing image URL on first image object');
    }

    if (url.startsWith('data:')) {
      return this.dataUrlToBuffer(url);
    }
    const r = await fetch(url);
    if (!r.ok) {
      throw new Error(`OpenRouter: failed to download image: ${r.status}`);
    }
    return Buffer.from(await r.arrayBuffer());
  }

  async generateImageWithOpenRouterWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateImageWithOpenRouter(prompt);
      } catch (err) {
        console.warn(`  ⚠️ OpenRouter attempt ${attempt}/${maxRetries} failed:`, err.message);
        if (attempt < maxRetries) {
          const delay = attempt * 4000;
          console.log(`  ⏳ Retrying in ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
  }

  async downloadAndSaveImage(imageUrl, slug) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      return await this.saveBufferAsBanner(buffer, slug);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async generatePlaceholderImage(slug, title = '') {
    const imagePath = `/images/${slug}-placeholder.jpg`;
    const fullPath = path.join(this.imagesDir, `${slug}-placeholder.jpg`);
    const shortTitle = (title || slug).replace(/-/g, ' ').slice(0, 50);
    const colors = [
      [59, 130, 246], [139, 92, 246], [245, 158, 11], [34, 197, 94], [239, 68, 68]
    ];
    const [r1, g1, b1] = colors[Math.floor(Math.random() * colors.length)];
    const [r2, g2, b2] = colors[(Math.floor(Math.random() * colors.length) + 1) % colors.length];
    const svg = `<svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="rgb(${r1},${g1},${b1})"/><stop offset="100%" stop-color="rgb(${r2},${g2},${b2})"/></linearGradient></defs>
      <rect width="1024" height="768" fill="url(#g)"/>
      <text x="512" y="384" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="rgba(255,255,255,0.9)" text-anchor="middle">${shortTitle}</text>
    </svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(fullPath);
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