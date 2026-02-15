const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const http = require('http');

// Try to use Gemini if available, otherwise use Clearbit
let genAI = null;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const GEMINI_API_KEY = 'AIzaSyBfmtHNmY2prqZ5E6NLXmMSqiZznRsRf7M';
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} catch (e) {
  console.log('Gemini package not installed, using Clearbit API instead');
}

const contentDir = path.join(process.cwd(), 'content');
const imagesDir = path.join(process.cwd(), 'public', 'images', 'tools');

// Ensure images directory exists
async function ensureDirectories() {
  await fs.ensureDir(imagesDir);
}

// Download logo from Clearbit API
async function downloadLogo(domain, outputPath) {
  return new Promise((resolve, reject) => {
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
    }).on('error', (err) => {
      file.close();
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
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

// Create SVG logo placeholder
function createSVGLogo(toolName, colors = { primary: '#2F7FD8', secondary: '#FFD700' }) {
  const initials = toolName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="20" fill="url(#grad)"/>
    <text x="50" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
  </svg>`;
}

// Generate logos for all tools
async function generateAllLogos() {
  await ensureDirectories();
  
  const toolsPath = path.join(contentDir, 'tools.json');
  if (!await fs.pathExists(toolsPath)) {
    console.error('tools.json not found');
    return;
  }
  
  const tools = await fs.readJSON(toolsPath);
  console.log(`Found ${tools.length} tools`);
  
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const tool of tools) {
    const logoPath = path.join(imagesDir, `${tool.slug}-logo.png`);
    const logoSvgPath = path.join(imagesDir, `${tool.slug}-logo.svg`);
    
    // Skip if logo already exists
    if (await fs.pathExists(logoPath) || await fs.pathExists(logoSvgPath)) {
      console.log(`✓ Logo exists for ${tool.name}`);
      skipped++;
      continue;
    }
    
    try {
      const domain = extractDomain(tool.website);
      
      if (domain) {
        // Try to download from Clearbit
        const downloaded = await downloadLogo(domain, logoPath);
        
        if (downloaded) {
          tool.logo = `/images/tools/${tool.slug}-logo.png`;
          console.log(`✓ Downloaded logo for ${tool.name} from ${domain}`);
          generated++;
        } else {
          // Fallback to SVG
          const svgLogo = createSVGLogo(tool.name);
          await fs.writeFile(logoSvgPath, svgLogo);
          tool.logo = `/images/tools/${tool.slug}-logo.svg`;
          console.log(`✓ Created SVG logo for ${tool.name}`);
          generated++;
        }
      } else {
        // No domain, create SVG
        const svgLogo = createSVGLogo(tool.name);
        await fs.writeFile(logoSvgPath, svgLogo);
        tool.logo = `/images/tools/${tool.slug}-logo.svg`;
        console.log(`✓ Created SVG logo for ${tool.name}`);
        generated++;
      }
      
      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`✗ Failed to generate logo for ${tool.name}:`, error.message);
      failed++;
      
      // Create fallback SVG
      try {
        const logoSvgPath = path.join(imagesDir, `${tool.slug}-logo.svg`);
        const svgLogo = createSVGLogo(tool.name);
        await fs.writeFile(logoSvgPath, svgLogo);
        tool.logo = `/images/tools/${tool.slug}-logo.svg`;
        console.log(`  → Created fallback SVG logo`);
      } catch (e) {
        console.error(`  → Failed to create fallback:`, e.message);
      }
    }
  }
  
  // Save updated tools.json
  await fs.writeJSON(toolsPath, tools, { spaces: 2 });
  
  console.log(`\nCompleted! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
}


// Main execution
if (require.main === module) {
  generateAllLogos().catch(console.error);
}

module.exports = { generateAllLogos, createSVGLogo, downloadLogo };
