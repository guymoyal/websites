#!/usr/bin/env node
/**
 * Update tools.json:
 * 1. Remove tools whose logo file doesn't exist
 * 2. Add new tools (Bolt.new, Manus, etc.)
 * 3. Create placeholder SVG logos for new tools
 */

const fs = require('fs-extra');
const path = require('path');

const contentDir = path.join(process.cwd(), 'content');
const imagesDir = path.join(process.cwd(), 'public', 'images');
const toolsPath = path.join(contentDir, 'tools.json');

function createSVGLogo(toolName, slug) {
  const initials = toolName
    .split(/[\s.-]+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2F7FD8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E5FA8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="16" fill="url(#g)"/>
  <text x="50" y="58" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
</svg>`;
}

const newTools = [
  {
    name: 'Bolt.new',
    slug: 'bolt-new',
    description: 'AI-powered full-stack app builder that generates and deploys web applications from natural language',
    longDescription: 'Bolt.new is an AI-powered development platform that lets you build full-stack web applications by describing what you want in natural language. It generates React, Node.js, and database code, then deploys your app instantly. Perfect for rapid prototyping and MVPs.',
    category: 'No-Code/Low-Code',
    website: 'https://bolt.new',
    pricing: 'Freemium',
    pricingDetails: 'Free tier available, paid plans for production apps',
    features: [
      'Natural language to code',
      'Full-stack generation',
      'Instant deployment',
      'React and Node.js',
      'Database integration',
      'Real-time collaboration',
      'One-click hosting',
    ],
    tags: ['no-code', 'app builder', 'full-stack', 'ai coding', 'bolt', 'v0'],
  },
  {
    name: 'Manus',
    slug: 'manus',
    description: 'AI-powered hand tracking and gesture recognition for VR and AR applications',
    longDescription: 'Manus provides AI-driven hand tracking and gesture recognition for virtual and augmented reality. It enables natural hand interactions in VR/AR experiences, supporting developers building immersive applications.',
    category: 'Development',
    website: 'https://manus.ai',
    pricing: 'Freemium',
    pricingDetails: 'Free tier for developers, enterprise plans available',
    features: [
      'Hand tracking',
      'Gesture recognition',
      'VR/AR integration',
      'Real-time processing',
      'SDK for developers',
      'Cross-platform support',
    ],
    tags: ['vr', 'ar', 'hand tracking', 'gestures', 'development', 'manus'],
  },
  {
    name: 'v0 by Vercel',
    slug: 'v0-vercel',
    description: 'AI-powered UI component generator that creates React and Tailwind components from prompts',
    longDescription: 'v0 by Vercel uses AI to generate beautiful, production-ready UI components from simple text descriptions. It creates React components with Tailwind CSS, shadcn/ui, and Radix primitives. Perfect for accelerating frontend development.',
    category: 'No-Code/Low-Code',
    website: 'https://v0.dev',
    pricing: 'Freemium',
    pricingDetails: 'Free tier available, Pro for unlimited generation',
    features: [
      'Text-to-UI generation',
      'React components',
      'Tailwind CSS',
      'shadcn/ui integration',
      'Copy-paste code',
      'Iterative refinement',
    ],
    tags: ['ui', 'react', 'tailwind', 'design', 'v0', 'vercel'],
  },
  {
    name: 'Lovable',
    slug: 'lovable',
    description: 'AI-powered app builder that creates production-ready applications from descriptions',
    longDescription: 'Lovable (formerly GPT Engineer) is an AI app builder that turns your ideas into fully functional applications. Describe your app, and it generates the code, database, and deploys it. Supports web and mobile apps.',
    category: 'No-Code/Low-Code',
    website: 'https://lovable.dev',
    pricing: 'Freemium',
    pricingDetails: 'Free tier available, Pro plans for teams',
    features: [
      'AI app generation',
      'Full-stack apps',
      'Database setup',
      'One-click deploy',
      'Iterative editing',
      'Export code',
    ],
    tags: ['no-code', 'app builder', 'ai', 'lovable', 'gpt-engineer'],
  },
  {
    name: 'Replit',
    slug: 'replit',
    description: 'AI-powered cloud IDE and deployment platform for building and shipping apps',
    longDescription: 'Replit combines an online IDE with AI assistance to help you code, run, and deploy applications in the browser. It supports 50+ languages, includes AI pair programming, and offers instant deployment. Popular for education and rapid development.',
    category: 'Development',
    website: 'https://replit.com',
    pricing: 'Freemium',
    pricingDetails: 'Free tier available, Hacker at $7/month, Pro at $20/month',
    features: [
      'Cloud IDE',
      'AI pair programming',
      '50+ languages',
      'Instant deployment',
      'Collaborative coding',
      'Database hosting',
    ],
    tags: ['ide', 'coding', 'development', 'replit', 'cloud'],
  },
];

async function main() {
  const tools = await fs.readJson(toolsPath);
  const existingSlugs = new Set(tools.map((t) => t.slug));

  // Alias map: tools.json path -> actual file (when names differ)
  const logoAliases = {
    '/images/notion-logo.svg': 'notion-ai-logo.svg',
    '/images/copilot-logo.svg': 'github-copilot-logo.svg',
    '/images/jasper-logo.svg': 'jasper-ai-logo.svg',
    '/images/runway-logo.svg': 'runway-ml-logo.svg',
    '/images/canva-logo.svg': 'canva-ai-logo.svg',
    '/images/dalle-logo.svg': 'dall-e-2-logo.svg',
    '/images/salesforce-logo.svg': 'salesforce-einstein-logo.svg',
    '/images/otter-logo.svg': 'otterai-logo.svg',
  };

  // 1. Filter tools - keep only those with existing logo files
  const filtered = [];
  for (const tool of tools) {
    const logoPath = tool.logo?.replace(/^\//, '');
    let fullPath = path.join(process.cwd(), 'public', logoPath || '');
    const altFile = logoAliases[tool.logo];
    if (altFile) {
      fullPath = path.join(imagesDir, altFile);
    }
    const exists = tool.logo && (await fs.pathExists(fullPath));
    if (exists) {
      // Update logo path if we used an alias
      const updatedTool = { ...tool };
      if (altFile) {
        updatedTool.logo = `/images/${altFile}`;
      }
      filtered.push(updatedTool);
    } else {
      console.log(`Removing ${tool.name} (${tool.slug}) - logo not found: ${tool.logo}`);
    }
  }

  // 2. Add new tools (only if not already present)
  let nextId = String(Math.max(...filtered.map((t) => parseInt(t.id, 10)), 0) + 1);
  const now = new Date().toISOString();

  for (const newTool of newTools) {
    if (existingSlugs.has(newTool.slug)) {
      console.log(`Skipping ${newTool.name} - already exists`);
      continue;
    }

    const logoFilename = `${newTool.slug}-logo.svg`;
    const logoPath = `/images/${logoFilename}`;
    const svgPath = path.join(imagesDir, logoFilename);

    await fs.writeFile(svgPath, createSVGLogo(newTool.name, newTool.slug));
    console.log(`Created logo: ${logoFilename}`);

    filtered.push({
      id: nextId,
      name: newTool.name,
      slug: newTool.slug,
      description: newTool.description,
      longDescription: newTool.longDescription,
      category: newTool.category,
      website: newTool.website,
      pricing: newTool.pricing,
      pricingDetails: newTool.pricingDetails,
      features: newTool.features,
      tags: newTool.tags,
      logo: logoPath,
      screenshots: [],
      rating: 4.5,
      reviewCount: 1000,
      verified: true,
      featured: false,
      createdAt: now,
      updatedAt: now,
      status: 'active',
    });
    nextId = String(parseInt(nextId, 10) + 1);
    existingSlugs.add(newTool.slug);
  }

  // Renumber IDs sequentially
  const final = filtered.map((t, i) => ({ ...t, id: String(i + 1) }));

  await fs.writeJson(toolsPath, final, { spaces: 2 });
  console.log(`\nUpdated tools.json: ${final.length} tools (removed ${tools.length - filtered.length}, added ${filtered.length - (tools.length - (tools.length - filtered.length))})`);
}

main().catch(console.error);
