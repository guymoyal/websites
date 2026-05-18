# DeepSeek Image Generation Guide

## 🎨 Generate Images with DeepSeek

You can now generate images for your articles using your DeepSeek API key!

## 🚀 Quick Start

```bash
# Generate images for all articles
yarn generate:images:deepseek
```

## 📋 What It Does

1. **Reads articles** from `content/articles.json`
2. **Generates images** using DeepSeek API for each article
3. **Downloads and optimizes** images (1200x630px, optimized JPEG)
4. **Saves images** to `public/images/articles/`
5. **Updates articles.json** with image paths

## ⚙️ Setup

Your DeepSeek API key is already configured in `.env`:
```
DEEPSEEK_API_KEY=sk-43d9c74deaf54e14be37d49afe836bc3
```

## 📝 Image Prompts

The script uses:
- `article.imagePrompt` if available
- Or generates a prompt from the article title

Example prompt format:
```
Professional illustration for article: [Title]. Modern, clean design, tech/AI theme, blue and yellow color scheme, suitable for blog header
```

## 🔄 Rate Limiting

- **3 second delay** between requests to avoid rate limits
- **Skips existing images** - won't regenerate if image already exists

## 📊 Output

After running, you'll see:
```
✨ Image generation completed!
   Generated: 10
   Skipped: 5
   Failed: 0
```

## 🛠️ Troubleshooting

### API Endpoint Issues
If you get API errors, the script tries two endpoints:
1. `https://api.deepseek.com/v1/images/generations`
2. `https://api.deepseekimage.org/v1/images/generations`

### Missing Images
- Check that `DEEPSEEK_API_KEY` is set in `.env`
- Verify your API key has image generation permissions
- Check API rate limits

### Placeholder Fallback
If image generation fails, the script creates a placeholder image automatically.

## 📁 File Structure

```
public/
  images/
    articles/
      article-slug.jpg          # Generated images
```

## 💡 Tips

- **Run after generating content**: Generate articles first with `yarn generate:content:gemini`
- **Batch processing**: The script processes all articles automatically
- **Optimization**: Images are automatically optimized to 1200x630px for web

---

**Ready to generate images?** Run `yarn generate:images:deepseek`!
