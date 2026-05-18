# Gemini API Setup Guide

## 🔑 Getting Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Choose "Create API key in new project" or select existing project
   - Copy your API key

3. **Add to Environment**
   - Open `.env.local` file
   - Add: `GEMINI_API_KEY=your-api-key-here`
   - Save the file

## 📝 Available Scripts

### 1. Generate Logos with Gemini
```bash
yarn generate:logos:gemini
```
- Generates SVG logos for tools missing logos
- Uses Gemini to create professional logo designs
- Falls back to Clearbit API if available
- Creates fallback SVG if both fail

### 2. Generate Content with Gemini
```bash
yarn generate:content:gemini
```
- Generates blog articles using Gemini
- Better quality than DeepSeek
- More natural, engaging content
- Set `ARTICLES_TO_GENERATE=5` to control number

### 3. Analyze Tool Websites
```bash
# Analyze a specific tool
yarn analyze:tool chatgpt

# Analyze all tools
yarn analyze:tools:all
```
- Fetches tool website content
- Uses Gemini to extract better descriptions
- Updates features, pricing, use cases
- Improves tool information quality

## 🎯 Recommended Workflow

### Initial Setup
1. Add `GEMINI_API_KEY` to `.env.local`
2. Generate missing logos:
   ```bash
   yarn generate:logos:gemini
   ```
3. Analyze all tools for better descriptions:
   ```bash
   yarn analyze:tools:all
   ```

### Weekly Updates
1. Generate new content:
   ```bash
   ARTICLES_TO_GENERATE=3 yarn generate:content:gemini
   ```
2. Update content dates:
   ```bash
   yarn update:dates
   ```

## 💡 Tips

- **Rate Limiting**: Scripts include delays to avoid API limits
- **Cost**: Gemini API has generous free tier
- **Quality**: Gemini produces better content than DeepSeek
- **Logos**: Gemini creates SVG logos, Clearbit provides PNG logos

## 🔧 Troubleshooting

### "GEMINI_API_KEY is required"
- Check `.env.local` file exists
- Verify API key is set correctly
- Restart terminal/IDE after adding key

### API Errors
- Check API key is valid
- Verify you have API access enabled
- Check rate limits (scripts include delays)

### Logo Generation Fails
- Script will create fallback SVG logos
- Check internet connection for Clearbit fallback
- Verify tool websites are accessible

## 📊 What Gets Improved

### With Gemini Logo Generation:
- ✅ Professional SVG logos
- ✅ Brand-consistent designs
- ✅ Better visual appeal

### With Gemini Content:
- ✅ More natural writing
- ✅ Better SEO optimization
- ✅ More engaging articles

### With Tool Analysis:
- ✅ Accurate descriptions
- ✅ Complete feature lists
- ✅ Updated pricing info
- ✅ Better use cases

---

**Ready to use Gemini?** Add your API key and run the scripts!
