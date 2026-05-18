const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load environment variables (check both .env and .env.local)
require('dotenv').config(); // Loads .env by default
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') }); // Override with .env.local if exists

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const contentDir = path.join(__dirname, '..', 'content');

async function analyzeWithDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert analyst of AI SaaS products. Reply with valid JSON only, no markdown fences.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`DeepSeek ${response.status}: ${t}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Fetch webpage content
async function fetchWebpageContent(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
        // Limit to first 50KB to avoid huge pages
        if (data.length > 50000) {
          response.destroy();
          resolve(data.substring(0, 50000));
        }
      });
      
      response.on('end', () => {
        resolve(data);
      });
      
      response.on('error', (err) => {
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Extract text content from HTML (simple extraction)
function extractTextFromHTML(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract text from common content tags
  const contentTags = ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'span', 'div'];
  let extractedText = '';
  
  contentTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        const cleanText = match.replace(/<[^>]+>/g, ' ').trim();
        if (cleanText.length > 10) {
          extractedText += cleanText + ' ';
        }
      });
    }
  });
  
  // Limit to 5000 characters
  return extractedText.substring(0, 5000).trim();
}

function parseAnalysisJson(responseText) {
  let text = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  let analysis;
  try {
    analysis = JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse model response as JSON');
    }
  }
  return analysis;
}

// Analyze tool website — DeepSeek only (no Gemini spend).
async function analyzeToolWebsite(tool) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('Set DEEPSEEK_API_KEY in .env.local (tool analysis uses DeepSeek text only).');
  }

  try {
    console.log(`🌐 Fetching content from ${tool.website}...`);

    let webpageContent = '';
    try {
      const html = await fetchWebpageContent(tool.website);
      webpageContent = extractTextFromHTML(html);
    } catch (error) {
      console.log(`  ⚠️  Could not fetch webpage, using existing description`);
      webpageContent = tool.description;
    }

    const prompt = `Analyze this AI tool's website and provide detailed, accurate information.

Tool Name: ${tool.name}
Current Description: ${tool.description}
Website Content: ${webpageContent.substring(0, 3000)}

Please provide:
1. An improved, detailed description (2-3 sentences)
2. A comprehensive long description (4-6 paragraphs) explaining what the tool does, who it's for, and key benefits
3. List of 5-8 key features (as an array)
4. Updated pricing information if available
5. Best use cases
6. Target audience

Return the response as a JSON object with this structure:
{
  "description": "improved short description",
  "longDescription": "detailed multi-paragraph description",
  "features": ["feature1", "feature2", ...],
  "pricing": "Free/Freemium/Paid/Enterprise",
  "pricingDetails": "specific pricing info if available",
  "useCases": ["use case 1", "use case 2", ...],
  "targetAudience": "description of who should use this"
}`;

    console.log(`  🤖 Analyzing with DeepSeek…`);
    const responseText = await analyzeWithDeepSeek(prompt);

    return parseAnalysisJson(responseText);
  } catch (error) {
    console.error(`  ❌ Error analyzing ${tool.name}:`, error.message);
    return null;
  }
}

// Update tool with Gemini analysis
async function updateToolWithGemini(toolSlug) {
  const toolsPath = path.join(contentDir, 'tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  
  const tool = tools.find(t => t.slug === toolSlug);
  if (!tool) {
    console.error(`❌ Tool "${toolSlug}" not found`);
    return;
  }

  console.log(`\n🔍 Analyzing ${tool.name}...`);
  const analysis = await analyzeToolWebsite(tool);
  
  if (analysis) {
    // Update tool with analysis
    if (analysis.description) tool.description = analysis.description;
    if (analysis.longDescription) tool.longDescription = analysis.longDescription;
    if (analysis.features && Array.isArray(analysis.features)) {
      tool.features = analysis.features;
    }
    if (analysis.pricing) tool.pricing = analysis.pricing;
    if (analysis.pricingDetails) tool.pricingDetails = analysis.pricingDetails;
    
    // Save updated tools
    fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
    console.log(`✅ Updated ${tool.name} with AI analysis`);
  }
}

// Analyze all tools
async function analyzeAllTools() {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ Set DEEPSEEK_API_KEY in .env.local');
    return;
  }

  const toolsPath = path.join(contentDir, 'tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  
  console.log(`📦 Found ${tools.length} tools`);
  console.log(`🤖 Analyzing with DeepSeek…\n`);

  let updated = 0;
  let failed = 0;

  for (const tool of tools) {
    try {
      const analysis = await analyzeToolWebsite(tool);
      
      if (analysis) {
        if (analysis.description) tool.description = analysis.description;
        if (analysis.longDescription) tool.longDescription = analysis.longDescription;
        if (analysis.features && Array.isArray(analysis.features)) {
          tool.features = analysis.features;
        }
        if (analysis.pricing) tool.pricing = analysis.pricing;
        if (analysis.pricingDetails) tool.pricingDetails = analysis.pricingDetails;
        
        updated++;
        console.log(`✅ Updated ${tool.name}`);
      } else {
        failed++;
      }
      
      // Rate limiting - wait 3 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ Failed to analyze ${tool.name}:`, error.message);
      failed++;
    }
  }

  // Save updated tools
  fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
  
  console.log(`\n✨ Completed!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
}

// Run if called directly
if (require.main === module) {
  const toolSlug = process.argv[2];
  
  if (toolSlug) {
    updateToolWithGemini(toolSlug).catch(console.error);
  } else {
    analyzeAllTools().catch(console.error);
  }
}

module.exports = { analyzeToolWebsite, updateToolWithGemini, analyzeAllTools };
