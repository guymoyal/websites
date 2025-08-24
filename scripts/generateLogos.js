const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class LogoGenerator {
  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || "sk-43d9c74deaf54e14be37d49afe836bc3";
    this.contentDir = path.join(__dirname, '..', 'content');
    this.imagesDir = path.join(__dirname, '..', 'public', 'images');
  }

  async generateLogos() {
    console.log('🎨 Generating logos for AI tools...');
    
    await fs.ensureDir(this.imagesDir);

    try {
      // Read tools from tool-cards.json
      const toolsPath = path.join(this.contentDir, 'tool-cards.json');
      if (!await fs.pathExists(toolsPath)) {
        console.error('❌ tool-cards.json not found. Run generateToolCards.js first.');
        return;
      }

      const tools = await fs.readJSON(toolsPath);
      console.log(`📦 Found ${tools.length} tools to generate logos for`);

      for (const tool of tools) {
        console.log(`🎨 Generating logo for: ${tool.name}`);
        
        try {
          // Generate SVG logo using DeepSeek API
          const logoSvg = await this.generateLogoSvg(tool.name, tool.category);
          
          if (logoSvg) {
            // Save SVG logo
            const logoPath = path.join(this.imagesDir, `${tool.slug}-logo.svg`);
            await fs.writeFile(logoPath, logoSvg);
            console.log(`✅ Generated logo: ${tool.slug}-logo.svg`);
          }
        } catch (error) {
          console.error(`❌ Failed to generate logo for ${tool.name}:`, error.message);
          // Create a simple placeholder SVG
          await this.createPlaceholderLogo(tool.name, tool.slug);
        }
        
        // Add delay to avoid rate limiting
        console.log('⏳ Waiting 2 seconds before next logo...');
        await new Promise(resolve => setTimeout(() => resolve(), 2000));
      }
      
      console.log('✅ Logo generation completed!');
      
    } catch (error) {
      console.error('❌ Logo generation failed:', error);
    }
  }

  async generateLogoSvg(toolName, category) {
    if (!this.deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not found');
    }

    const prompt = `Create a simple, professional SVG logo for the AI tool "${toolName}" in the ${category} category.

Requirements:
- Return ONLY the SVG code (no explanations)
- Use simple geometric shapes and clean design
- Size: 64x64 viewBox
- Use 2-3 colors maximum (prefer blue/purple tech colors)
- Include the first letter or initials of "${toolName}"
- Make it recognizable and professional
- No complex illustrations, keep it minimal

Example format:
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="#3B82F6"/>
  <text x="32" y="40" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">C</text>
</svg>

Generate SVG for "${toolName}":`;

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional logo designer. Create clean, minimal SVG logos. Return ONLY the SVG code without any explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      let svgContent = data.choices[0].message.content.trim();
      
      // Clean up the response to extract only SVG
      if (svgContent.includes('<svg')) {
        const svgStart = svgContent.indexOf('<svg');
        const svgEnd = svgContent.lastIndexOf('</svg>') + 6;
        svgContent = svgContent.substring(svgStart, svgEnd);
      }
      
      // Validate SVG
      if (svgContent.startsWith('<svg') && svgContent.endsWith('</svg>')) {
        return svgContent;
      } else {
        throw new Error('Invalid SVG generated');
      }

    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  async createPlaceholderLogo(toolName, slug) {
    const firstLetter = toolName.charAt(0).toUpperCase();
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const placeholderSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="${color}"/>
  <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold">${firstLetter}</text>
</svg>`;

    const logoPath = path.join(this.imagesDir, `${slug}-logo.svg`);
    await fs.writeFile(logoPath, placeholderSvg);
    console.log(`🔄 Created placeholder logo: ${slug}-logo.svg`);
  }
}

async function main() {
  const generator = new LogoGenerator();
  await generator.generateLogos();
}

if (require.main === module) {
  main();
}

module.exports = { LogoGenerator };