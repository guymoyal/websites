const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const LOGO_MAX_BYTES = 50 * 1024; // 50kb max for logos

// Load environment variables (check both .env and .env.local)
require('dotenv').config(); // Loads .env by default
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') }); // Override with .env.local if exists

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

const contentDir = path.join(__dirname, '..', 'content');
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'tools');

// Ensure images directory exists
async function ensureDirectories() {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return null;
  }
}

// Generate logo using Gemini Vision API (for image generation via Imagen)
// Note: Gemini doesn't directly generate images, but we can use it to create SVG logos
async function generateLogoSVGWithGemini(toolName, toolDescription, category) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create a modern, professional SVG logo design for "${toolName}", an AI tool in the ${category} category.

Description: ${toolDescription}

Requirements:
- Modern, clean design
- Suitable for tech/AI company
- Use colors: primary blue (#2F7FD8) and accent yellow (#FFD700)
- Simple, recognizable icon or symbol
- Text: "${toolName}"
- SVG format, 200x200px viewBox
- Professional appearance

Return ONLY the SVG code, no markdown, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let svgContent = response.text();

    // Clean up the response (remove markdown if present)
    svgContent = svgContent.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim();

    // If Gemini doesn't return valid SVG, create a fallback
    if (!svgContent.includes('<svg')) {
      return createFallbackSVG(toolName);
    }

    return svgContent;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return createFallbackSVG(toolName);
  }
}

// Create fallback SVG logo
function createFallbackSVG(toolName) {
  const initials = toolName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="grad-${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2F7FD8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="24" fill="url(#grad-${initials})"/>
    <text x="100" y="120" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
  </svg>`;
}

// Download logo from Clearbit as fallback
async function downloadLogo(domain, outputPath) {
  return new Promise((resolve) => {
    const url = `https://logo.clearbit.com/${domain}`;
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(outputPath, () => {});
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      fs.unlink(outputPath, () => {});
      resolve(false);
    });
  });
}

// Generate logos for all tools
async function generateAllLogos() {
  await ensureDirectories();

  const geminiLogosAllowed =
    process.env.IMAGE_GENERATION_ENABLED === 'true' && GEMINI_API_KEY;

  const toolsPath = path.join(contentDir, 'tools.json');
  if (!fs.existsSync(toolsPath)) {
    console.error('❌ tools.json not found');
    return;
  }
  
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  console.log(`📦 Found ${tools.length} tools`);
  console.log(
    geminiLogosAllowed
      ? `🎨 Gemini SVG fallback enabled (when Clearbit misses)\n`
      : `🎨 Gemini disabled — Clearbit + free fallback SVG only (set IMAGE_GENERATION_ENABLED=true + GEMINI for paid logo text)\n`
  );
  
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const tool of tools) {
    const logoPath = path.join(imagesDir, `${tool.slug}-logo.png`);
    const logoSvgPath = path.join(imagesDir, `${tool.slug}-logo.svg`);
    
    // Skip if logo already exists
    if (fs.existsSync(logoPath) || fs.existsSync(logoSvgPath)) {
      console.log(`⏭️  Logo exists for ${tool.name}`);
      skipped++;
      continue;
    }
    
    try {
      const domain = extractDomain(tool.website);
      
      // First try Clearbit (faster, better quality)
      if (domain) {
        const downloaded = await downloadLogo(domain, logoPath);
        
        if (downloaded) {
          // Compress PNG to ≤50kb if needed
          try {
            const buf = fs.readFileSync(logoPath);
            if (buf.length > LOGO_MAX_BYTES) {
              let quality = 80;
              let out = await sharp(buf).png({ quality }).toBuffer();
              while (out.length > LOGO_MAX_BYTES && quality > 20) {
                quality -= 10;
                out = await sharp(buf).resize(200, 200, { fit: 'inside' }).png({ quality }).toBuffer();
              }
              fs.writeFileSync(logoPath, out);
              console.log(`  📐 Compressed to ${(out.length / 1024).toFixed(1)}kb`);
            }
          } catch (e) {
            console.warn(`  ⚠️ Could not compress logo:`, e.message);
          }
          tool.logo = `/images/tools/${tool.slug}-logo.png`;
          console.log(`✅ Downloaded logo for ${tool.name} from Clearbit`);
          generated++;
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      }
      
      let svgLogo;
      if (geminiLogosAllowed) {
        console.log(`🤖 Generating SVG logo for ${tool.name} with Gemini...`);
        svgLogo = await generateLogoSVGWithGemini(tool.name, tool.description, tool.category);
      } else {
        console.log(`📋 Free fallback SVG for ${tool.name} (no Gemini)`);
        svgLogo = createFallbackSVG(tool.name);
      }

      fs.writeFileSync(logoSvgPath, svgLogo);
      tool.logo = `/images/tools/${tool.slug}-logo.svg`;
      console.log(`✅ Saved SVG logo for ${tool.name}`);
      generated++;

      await new Promise((resolve) => setTimeout(resolve, geminiLogosAllowed ? 2000 : 200));
      
    } catch (error) {
      console.error(`❌ Failed to generate logo for ${tool.name}:`, error.message);
      failed++;
      
      // Create fallback SVG
      try {
        const svgLogo = createFallbackSVG(tool.name);
        fs.writeFileSync(logoSvgPath, svgLogo);
        tool.logo = `/images/tools/${tool.slug}-logo.svg`;
        console.log(`  → Created fallback SVG logo`);
        generated++;
      } catch (e) {
        console.error(`  → Failed to create fallback:`, e.message);
      }
    }
  }
  
  // Save updated tools.json
  fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
  
  console.log(`\n✨ Completed!`);
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
}

// Run if called directly
if (require.main === module) {
  generateAllLogos().catch(console.error);
}

module.exports = { generateAllLogos, generateLogoSVGWithGemini, createFallbackSVG };
