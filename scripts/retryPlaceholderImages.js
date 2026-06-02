#!/usr/bin/env node
/**
 * Re-run image generation only for articles that still use placeholder images.
 * Usage: IMAGE_GENERATION_ENABLED=true node scripts/retryPlaceholderImages.js
 */
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const fs = require('fs-extra');
const { ImageGenerator } = require('./generateImages');

async function main() {
  const generator = new ImageGenerator();
  if (generator.provider === 'placeholder') {
    console.log(
      'ℹ️  IMAGE_PROVIDER is placeholder (default = free, no image API).\n' +
        '   Skipping. To pay for images later set IMAGE_PROVIDER=gemini|openai|replicate|openrouter and IMAGE_GENERATION_ENABLED=true.'
    );
    return;
  }
  if (process.env.IMAGE_GENERATION_ENABLED !== 'true') {
    console.log('ℹ️  Set IMAGE_GENERATION_ENABLED=true to run paid image generation.');
    return;
  }

  const articlesPath = path.join(__dirname, '..', 'content', 'articles.json');
  if (!await fs.pathExists(articlesPath)) {
    console.error('❌ No articles.json found.');
    process.exit(1);
  }

  const articles = await fs.readJSON(articlesPath);
  const placeholders = articles.filter(
    (a) => a.image && (a.image.includes('-placeholder') || a.image.endsWith('-placeholder.jpg'))
  );

  if (placeholders.length === 0) {
    console.log('✅ No placeholder images found. All articles have real images.');
    return;
  }

  console.log(`🔄 Found ${placeholders.length} articles with placeholder images. Retrying...`);
  console.log('   Articles:', placeholders.map((a) => a.title).join(', '));

  await fs.ensureDir(generator.articlesImagesDir);

  for (const article of placeholders) {
    console.log(`\n🎨 Generating image for: ${article.title}`);
    const prompt = generator.buildArticleImagePrompt(article);

    try {
      let imageUrl = null;
      let imageBuffer = null;
      switch (generator.provider) {
        case 'gemini':
          imageBuffer = await generator.generateImageWithGeminiWithRetry(prompt);
          break;
        case 'replicate':
          imageUrl = await generator.generateImageWithReplicate(prompt);
          break;
        case 'openai':
          imageUrl = await generator.generateImageWithOpenAI(prompt);
          break;
        case 'openrouter':
          imageBuffer = await generator.generateImageWithOpenRouterWithRetry(prompt);
          break;
        default:
          break;
      }

      if (imageBuffer) {
        const imagePath = await generator.saveBufferAsBanner(imageBuffer, article.slug);
        article.image = imagePath;
        console.log(`✅ Generated: ${imagePath}`);
      } else if (imageUrl) {
        const imagePath = await generator.downloadAndSaveImage(imageUrl, article.slug);
        article.image = imagePath;
        console.log(`✅ Generated: ${imagePath}`);
      } else {
        console.log('⚠️ Skipped (no image buffer/URL from provider)');
      }
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }

    if (generator.provider !== 'placeholder') {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await fs.writeJSON(articlesPath, articles, { spaces: 2 });
  console.log('\n✅ Done. Run "yarn copy:content" to sync to public.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
