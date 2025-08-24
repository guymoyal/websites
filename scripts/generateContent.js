const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function generateArticleContent(topic) {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!deepseekApiKey) {
    throw new Error('DEEPSEEK_API_KEY is required');
  }

  // Article topics related to AI tools
  const articleTopics = [
    'Best AI Writing Tools for Content Creators',
    'Top AI Image Generators Revolutionizing Design',
    'AI Productivity Tools Every Professional Needs',
    'Machine Learning Platforms for Beginners',
    'AI Video Editing Tools Changing Content Creation',
    'Conversational AI Chatbots for Business',
    'AI Code Assistants for Developers',
    'AI Analytics Tools for Data-Driven Decisions',
    'Voice AI Technology and Speech Recognition',
    'AI Marketing Automation Tools',
    'Computer Vision Applications in Business',
    'Natural Language Processing Tools',
    'AI-Powered Customer Service Solutions',
    'Automated Content Generation Platforms',
    'AI Tools for Social Media Management'
  ];

  const randomTopic = articleTopics[Math.floor(Math.random() * articleTopics.length)];
  
  const prompt = `Write a comprehensive, SEO-optimized blog article about "${randomTopic}". 

The article should be:
- 1500-2000 words long
- Written in an engaging, professional tone
- Include practical tips and actionable advice
- Have clear headings and subheadings
- Include specific tool recommendations
- Be valuable for both beginners and experienced users

Structure the article with:
1. Introduction (hook the reader)
2. Main content with 4-5 sections
3. Practical examples and use cases
4. Pros and cons where relevant
5. Conclusion with key takeaways

Write in markdown format.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional SEO content writer specializing in AI tools and technology. Write engaging, informative articles that provide real value to readers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Generate article metadata
    const slug = slugify(randomTopic, { lower: true, strict: true });
    const keywords = generateKeywords(randomTopic);
    const category = categorizeArticle(randomTopic);
    
    return {
      title: randomTopic,
      slug: slug,
      metaDescription: generateMetaDescription(randomTopic),
      keywords: keywords,
      category: category,
      readingTime: Math.ceil(content.split(' ').length / 200),
      targetAudience: 'AI enthusiasts, business professionals, content creators',
      content: content,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: Math.random() > 0.7, // 30% chance of being featured
      imagePrompt: generateImagePrompt(randomTopic),
      status: 'published'
    };

  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
}

function generateKeywords(title) {
  const baseKeywords = ['ai tools', 'artificial intelligence', 'technology', 'productivity'];
  const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
  return [...baseKeywords, ...titleWords].slice(0, 8);
}

function categorizeArticle(title) {
  const categories = {
    'writing': ['writing', 'content', 'text', 'copywriting'],
    'design': ['image', 'design', 'visual', 'graphics', 'video'],
    'productivity': ['productivity', 'automation', 'workflow', 'efficiency'],
    'development': ['code', 'programming', 'development', 'software'],
    'marketing': ['marketing', 'social media', 'advertising', 'seo'],
    'analytics': ['analytics', 'data', 'insights', 'metrics'],
    'business': ['business', 'enterprise', 'customer', 'service']
  };

  const titleLower = title.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => titleLower.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  return 'AI Tools';
}

function generateMetaDescription(title) {
  return `Discover the best ${title.toLowerCase()} in 2024. Complete guide with reviews, features, pricing, and recommendations for professionals and businesses.`;
}

function generateImagePrompt(title) {
  return `Professional illustration for ${title}, modern AI technology theme, clean design, suitable for blog article`;
}

async function generateSiteConfig() {
  return {
    name: "AI Buzz Tools",
    description: "Discover the best AI tools with our comprehensive reviews, comparisons, and guides",
    url: "https://aibuzztools.com",
    topic: "AI Tools Directory",
    navigation: [
      { name: "Home", href: "/" },
      { name: "Tools", href: "/tools" },
      { name: "Categories", href: "/categories" },
      { name: "Blog", href: "/blog" },
      { name: "About", href: "/about" },
      { name: "Submit Tool", href: "/submit" }
    ],
    social: {
      twitter: "https://twitter.com/aibuzztools",
      linkedin: "https://linkedin.com/company/aibuzztools",
      github: "https://github.com/aibuzztools"
    },
    seo: {
      defaultTitle: "AI Buzz Tools - Discover the Best AI Tools",
      defaultDescription: "Find the perfect AI tools for your needs. Comprehensive reviews, comparisons, and guides for AI-powered productivity and creativity.",
      keywords: ["ai tools", "artificial intelligence", "ai buzz", "technology", "productivity", "automation", "machine learning", "ai reviews"]
    }
  };
}

async function generateToolsData() {
  return [
    {
      id: "1",
      name: "ChatGPT",
      slug: "chatgpt",
      description: "Advanced conversational AI for writing, coding, and problem-solving",
      longDescription: "ChatGPT is a state-of-the-art language model that can assist with a wide range of tasks including writing, coding, analysis, and creative projects. It's designed to understand context and provide helpful, accurate responses.",
      category: "Writing",
      website: "https://chat.openai.com",
      pricing: "Freemium",
      pricingDetails: "Free tier available, Plus subscription at $20/month",
      features: ["Natural language processing", "Code generation", "Creative writing", "Problem solving", "Multi-language support"],
      tags: ["chatbot", "writing", "coding", "ai assistant"],
      logo: "/images/chatgpt-logo.svg",
      screenshots: [],
      rating: 4.8,
      reviewCount: 15420,
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active"
    },
    {
      id: "2",
      name: "Midjourney",
      slug: "midjourney",
      description: "AI-powered image generation tool for creating stunning artwork",
      longDescription: "Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species through AI-generated art.",
      category: "Design",
      website: "https://midjourney.com",
      pricing: "Paid",
      pricingDetails: "Plans start at $10/month",
      features: ["High-quality image generation", "Artistic styles", "Discord integration", "Commercial usage rights"],
      tags: ["image generation", "art", "design", "creativity"],
      logo: "/images/midjourney-logo.svg",
      screenshots: [],
      rating: 4.7,
      reviewCount: 8930,
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active"
    },
    {
      id: "3",
      name: "Notion AI",
      slug: "notion-ai",
      description: "AI-powered writing assistant integrated into Notion workspace",
      longDescription: "Notion AI helps you write better, think bigger, and work faster. It's seamlessly integrated into your Notion workspace to help with writing, brainstorming, editing, and summarizing.",
      category: "Productivity",
      website: "https://notion.so/ai",
      pricing: "Freemium",
      pricingDetails: "Free trial, then $10/month per user",
      features: ["Writing assistance", "Content generation", "Summarization", "Brainstorming", "Workspace integration"],
      tags: ["productivity", "writing", "workspace", "collaboration"],
      logo: "/images/notion-logo.svg",
      screenshots: [],
      rating: 4.6,
      reviewCount: 5670,
      verified: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active"
    }
  ];
}

async function generateCategoriesData() {
  return [
    {
      id: "1",
      name: "Writing & Content",
      slug: "writing-content",
      description: "AI tools for content creation, copywriting, and text generation",
      icon: "✍️",
      toolCount: 25,
      featured: true
    },
    {
      id: "2",
      name: "Design & Creative",
      slug: "design-creative",
      description: "AI-powered design tools for images, graphics, and creative projects",
      icon: "🎨",
      toolCount: 18,
      featured: true
    },
    {
      id: "3",
      name: "Productivity",
      slug: "productivity",
      description: "AI tools to boost productivity and automate workflows",
      icon: "⚡",
      toolCount: 22,
      featured: true
    },
    {
      id: "4",
      name: "Development",
      slug: "development",
      description: "AI coding assistants and development tools",
      icon: "💻",
      toolCount: 15,
      featured: true
    },
    {
      id: "5",
      name: "Marketing",
      slug: "marketing",
      description: "AI tools for marketing automation and campaign optimization",
      icon: "📈",
      toolCount: 20,
      featured: true
    },
    {
      id: "6",
      name: "Analytics",
      slug: "analytics",
      description: "AI-powered analytics and data insights tools",
      icon: "📊",
      toolCount: 12,
      featured: true
    },
    {
      id: "7",
      name: "Video & Media",
      slug: "video-media",
      description: "AI tools for video editing, audio processing, and media creation",
      icon: "🎬",
      toolCount: 16,
      featured: false
    },
    {
      id: "8",
      name: "Business",
      slug: "business",
      description: "AI solutions for business operations and management",
      icon: "🏢",
      toolCount: 14,
      featured: false
    }
  ];
}

async function generateContent() {
  console.log('🚀 Starting content generation for AI Buzz Tools...');
  
  // Check if DEEPSEEK_API_KEY is available
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY is required. Please set it in your .env.local file.');
    process.exit(1);
  }

  const articlesToGenerate = parseInt(process.env.ARTICLES_TO_GENERATE) || 10;
  const websiteTopic = process.env.WEBSITE_TOPIC || 'AI Tools Directory';
  
  console.log(`📝 Generating ${articlesToGenerate} articles about ${websiteTopic}...`);

  try {
    // Create content directory if it doesn't exist
    const contentDir = path.join(__dirname, '..', 'content');
    await fs.ensureDir(contentDir);

    // Generate site configuration
    console.log('⚙️ Generating site configuration...');
    const siteConfig = await generateSiteConfig();
    await fs.writeJSON(path.join(contentDir, 'config.json'), siteConfig, { spaces: 2 });

    // Generate tools data
    console.log('🛠️ Generating tools data...');
    const toolsData = await generateToolsData();
    await fs.writeJSON(path.join(contentDir, 'tools.json'), toolsData, { spaces: 2 });

    // Generate categories data
    console.log('📂 Generating categories data...');
    const categoriesData = await generateCategoriesData();
    await fs.writeJSON(path.join(contentDir, 'categories.json'), categoriesData, { spaces: 2 });

    // Generate articles
    const articles = [];
    for (let i = 0; i < articlesToGenerate; i++) {
      console.log(`📄 Generating article ${i + 1}/${articlesToGenerate}...`);
      
      const article = await generateArticleContent(websiteTopic);
      articles.push(article);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(() => resolve(), 1000));
    }

    // Save articles to JSON file
    const articlesPath = path.join(contentDir, 'articles.json');
    await fs.writeJSON(articlesPath, articles, { spaces: 2 });
    
    console.log(`✅ Successfully generated ${articles.length} articles!`);
    console.log(`📁 Content saved to: ${contentDir}`);
    console.log('🎉 AI Buzz Tools is ready to launch!');
    
  } catch (error) {
    console.error('❌ Error generating content:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateContent();
}

module.exports = { generateContent };