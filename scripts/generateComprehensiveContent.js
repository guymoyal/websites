const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class ComprehensiveContentGenerator {
  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY ?? "sk-43d9c74deaf54e14be37d49afe836bc3";
    this.contentDir = path.join(__dirname, '..', 'content');
  }

  async generateToolsForCategory(categoryName, categorySlug, toolCount = 8) {
    console.log(`🛠️ Generating ${toolCount} tools for ${categoryName}...`);
    
    const prompt = `Generate ${toolCount} real AI tools for the "${categoryName}" category. 

For each tool, provide:
1. Real tool name (existing AI tools)
2. Accurate website URL
3. Realistic description (50-80 words)
4. Detailed long description (150-200 words)
5. Pricing model (Free/Freemium/Paid/Enterprise)
6. 5-7 key features
7. 4-6 relevant tags
8. Realistic rating (4.0-4.9)
9. Review count (500-15000)

Return as JSON array with this structure:
[
  {
    "name": "Tool Name",
    "website": "https://example.com",
    "description": "Brief description",
    "longDescription": "Detailed description with benefits and use cases",
    "pricing": "Freemium",
    "pricingDetails": "Free tier available, Pro at $X/month",
    "features": ["Feature 1", "Feature 2", ...],
    "tags": ["tag1", "tag2", ...],
    "rating": 4.7,
    "reviewCount": 8500,
    "verified": true,
    "featured": false
  }
]

Focus on real, popular tools in the ${categoryName} space. Make 2-3 tools featured (set featured: true).`;

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
              content: 'You are an AI tools expert. Generate accurate information about real AI tools. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const toolsData = JSON.parse(data.choices[0].message.content);
      
      // Process and format tools
      return toolsData.map((tool, index) => ({
        id: `${categorySlug}-${index + 1}`,
        name: tool.name,
        slug: slugify(tool.name, { lower: true, strict: true }),
        description: tool.description,
        longDescription: tool.longDescription,
        category: categoryName,
        website: tool.website,
        pricing: tool.pricing,
        pricingDetails: tool.pricingDetails,
        features: tool.features,
        tags: tool.tags,
        logo: `/images/${slugify(tool.name, { lower: true, strict: true })}-logo.svg`,
        screenshots: [],
        rating: tool.rating,
        reviewCount: tool.reviewCount,
        verified: tool.verified,
        featured: tool.featured,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      }));

    } catch (error) {
      console.error(`Error generating tools for ${categoryName}:`, error);
      return [];
    }
  }

  async generateArticleForCategory(categoryName, categorySlug) {
    console.log(`📝 Generating articles for ${categoryName}...`);
    
    // Define multiple article topics for each category
    const articleTopics = this.getArticleTopicsForCategory(categoryName);
    const articles = [];
    
    for (let i = 0; i < articleTopics.length; i++) {
      const topic = articleTopics[i];
      console.log(`📄 Generating: ${topic}...`);
      
      const prompt = `Write a comprehensive, SEO-optimized article about "${topic}".

The article should be:
- 1500-2000 words
- Include introduction, main sections, and conclusion
- Cover relevant tools, features, pricing, use cases
- Include practical tips and recommendations
- Be engaging and informative
- Written in markdown format

Structure:
1. Introduction
2. Main content sections (4-6 sections)
3. Practical examples and use cases
4. Tips and recommendations
5. Conclusion with key takeaways

Write in a professional, helpful tone for business professionals and creators.`;

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
                content: 'You are a professional tech writer specializing in AI tools. Write comprehensive, SEO-optimized articles.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 3500
          })
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        const slug = slugify(topic, { lower: true, strict: true });
        
        console.log(`✅ Generated article: ${topic}`);

        articles.push({
          title: topic,
          slug: slug,
          metaDescription: `${topic.split(':')[0]} - Expert guide with reviews, comparisons, and recommendations for ${categoryName.toLowerCase()} professionals.`,
          keywords: [
            `${categoryName.toLowerCase()} ai tools`,
            'ai tools 2024',
            `best ${categoryName.toLowerCase()} tools`,
            'artificial intelligence',
            'productivity tools',
            'ai software'
          ],
          category: categoryName,
          readingTime: Math.ceil(content.split(' ').length / 200),
          targetAudience: 'Business professionals, content creators, developers',
          content: content,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          featured: i < 2, // First 2 articles are featured
          imagePrompt: `Professional illustration for ${topic}, modern AI technology theme, ${categoryName.toLowerCase()} tools, clean design`,
          status: 'published'
        });

        // Add delay between articles
        if (i < articleTopics.length - 1) {
          console.log('⏳ Waiting 2 seconds before next article...');
          await new Promise(resolve => setTimeout(() => resolve(), 2000));
        }

      } catch (error) {
        console.error(`Error generating article "${topic}":`, error);
      }
    }

    return articles;
  }

  async generateAllContent() {
    console.log('🚀 Starting comprehensive content generation for AI Buzz Tools...');
    
    if (!this.deepseekApiKey) {
      console.error('❌ DEEPSEEK_API_KEY is required');
      return;
    }

    await fs.ensureDir(this.contentDir);

    // Define categories
    const categories = [
      { name: 'Writing & Content', slug: 'writing-content', icon: '✍️' },
      { name: 'Design & Creative', slug: 'design-creative', icon: '🎨' },
      { name: 'Productivity', slug: 'productivity', icon: '⚡' },
      { name: 'Development', slug: 'development', icon: '💻' },
      { name: 'Marketing', slug: 'marketing', icon: '📈' },
      { name: 'Analytics', slug: 'analytics', icon: '📊' },
      { name: 'Video & Media', slug: 'video-media', icon: '🎬' },
      { name: 'Business', slug: 'business', icon: '🏢' }
    ];

    let allTools = [];
    let allArticles = [];

    // Generate tools and articles for each category
    for (const category of categories) {
      console.log(`\n📂 Processing ${category.name} category...`);
      
      // Generate tools for this category
      const categoryTools = await this.generateToolsForCategory(
        category.name, 
        category.slug, 
        Math.floor(Math.random() * 4) + 6 // 6-9 tools per category
      );
      
      allTools.push(...categoryTools);
      
      // Generate article for this category
      const categoryArticles = await this.generateArticleForCategory(
        category.name,
        category.slug
      );
      
      if (categoryArticles && categoryArticles.length > 0) {
        allArticles.push(...categoryArticles);
      }

      // Add delay to avoid rate limiting
      console.log('⏳ Waiting 2 seconds before next category...');
      await new Promise(resolve => setTimeout(() => resolve(), 2000));
    }

    // Update categories with actual tool counts
    const updatedCategories = categories.map(category => ({
      id: category.slug,
      name: category.name,
      slug: category.slug,
      description: this.getCategoryDescription(category.name),
      icon: category.icon,
      toolCount: allTools.filter(tool => tool.category === category.name).length,
      featured: true
    }));

    // Generate additional general articles
    console.log('\n📝 Generating additional articles...');
    const additionalArticles = await this.generateAdditionalArticles();
    allArticles.push(...additionalArticles);

    // Save all content
    console.log('\n💾 Saving all content...');
    
    await fs.writeJSON(path.join(this.contentDir, 'tools.json'), allTools, { spaces: 2 });
    await fs.writeJSON(path.join(this.contentDir, 'categories.json'), updatedCategories, { spaces: 2 });
    await fs.writeJSON(path.join(this.contentDir, 'articles.json'), allArticles, { spaces: 2 });

    console.log(`\n📁 Content saved to JSON files:`);
    console.log(`   - content/tools.json (${allTools.length} tools)`);
    console.log(`   - content/categories.json (${updatedCategories.length} categories)`);
    console.log(`   - content/articles.json (${allArticles.length} articles)`);
    console.log(`   - content/config.json (site configuration)`);

    // Generate site config
    const siteConfig = {
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

    await fs.writeJSON(path.join(this.contentDir, 'config.json'), siteConfig, { spaces: 2 });

    console.log(`\n✅ Content generation completed!`);
    console.log(`📊 Generated:`);
    console.log(`   - ${allTools.length} AI tools across ${categories.length} categories`);
    console.log(`   - ${allArticles.length} comprehensive articles`);
    console.log(`   - ${updatedCategories.length} category pages`);
    console.log(`   - Site configuration`);
    console.log(`\n🎉 AI Buzz Tools is ready to launch!`);
  }

  getCategoryDescription(categoryName) {
    const descriptions = {
      'Writing & Content': 'AI tools for content creation, copywriting, and text generation',
      'Design & Creative': 'AI-powered design tools for images, graphics, and creative projects',
      'Productivity': 'AI tools to boost productivity and automate workflows',
      'Development': 'AI coding assistants and development tools',
      'Marketing': 'AI tools for marketing automation and campaign optimization',
      'Analytics': 'AI-powered analytics and data insights tools',
      'Video & Media': 'AI tools for video editing, audio processing, and media creation',
      'Business': 'AI solutions for business operations and management'
    };
    return descriptions[categoryName] || 'AI tools and solutions';
  }

  getArticleTopicsForCategory(categoryName) {
    const topicsByCategory = {
      'Writing & Content': [
        'Best AI Writing Tools for Content Creators in 2024',
        'AI Copywriting Tools: Complete Guide and Comparison',
        'How to Use AI for Blog Writing and SEO Content',
        'AI Grammar Checkers vs Traditional Tools: Which is Better?',
        'Content Marketing with AI: Tools and Strategies'
      ],
      'Design & Creative': [
        'Top AI Image Generators for Designers in 2024',
        'AI Logo Design Tools: Create Professional Logos Instantly',
        'Best AI Art Tools for Digital Artists and Creators',
        'AI Photo Editing Tools vs Photoshop: Complete Comparison',
        'How AI is Revolutionizing Graphic Design Workflows'
      ],
      'Productivity': [
        'Best AI Productivity Tools for Remote Teams in 2024',
        'AI Task Management: Automate Your Workflow',
        'Smart Calendar AI Tools for Better Time Management',
        'AI Note-Taking Apps: Organize Your Ideas Efficiently',
        'How AI Can 10x Your Daily Productivity'
      ],
      'Development': [
        'Best AI Coding Assistants for Developers in 2024',
        'GitHub Copilot vs Other AI Code Tools: Complete Guide',
        'AI Debugging Tools: Find and Fix Bugs Faster',
        'How AI is Changing Software Development',
        'AI Code Review Tools for Better Code Quality'
      ],
      'Marketing': [
        'Best AI Marketing Tools for Small Businesses in 2024',
        'AI Social Media Management: Tools and Strategies',
        'Email Marketing with AI: Personalization at Scale',
        'AI SEO Tools: Boost Your Search Rankings',
        'How AI is Transforming Digital Marketing'
      ],
      'Analytics': [
        'Best AI Analytics Tools for Data-Driven Decisions',
        'AI Business Intelligence: Turn Data into Insights',
        'Predictive Analytics with AI: Tools and Use Cases',
        'AI Reporting Tools: Automate Your Data Analysis',
        'How AI is Revolutionizing Business Analytics'
      ],
      'Video & Media': [
        'Best AI Video Editing Tools for Content Creators',
        'AI Voice Generators: Create Professional Voiceovers',
        'AI Music Production Tools for Musicians and Creators',
        'How AI is Changing Video Content Creation',
        'AI Podcast Tools: From Recording to Distribution'
      ],
      'Business': [
        'Best AI Tools for Small Business Operations in 2024',
        'AI Customer Service Tools: Improve Support Efficiency',
        'AI Project Management: Streamline Your Workflows',
        'How AI is Transforming Business Operations',
        'AI Tools for Entrepreneurs: Start and Scale Faster'
      ]
    };

    return topicsByCategory[categoryName] || [
      `Best ${categoryName} AI Tools in 2024`,
      `How AI is Transforming ${categoryName}`,
      `${categoryName} with AI: Complete Guide`,
      `Top ${categoryName} AI Solutions for Businesses`
    ];
  }

  async generateAdditionalArticles() {
    const additionalTopics = [
      'AI Tools for Small Business: Complete Guide 2024',
      'Free vs Paid AI Tools: Which Should You Choose?',
      'How AI Tools Are Transforming Remote Work',
      'The Future of AI Tools: Trends to Watch in 2024'
    ];

    const articles = [];

    for (const topic of additionalTopics) {
      console.log(`📄 Generating: ${topic}...`);
      
      const prompt = `Write a comprehensive article about "${topic}".

The article should be:
- 1200-1500 words
- SEO-optimized with practical insights
- Include actionable tips and recommendations
- Cover current trends and future outlook
- Written in markdown format
- Engaging for business professionals

Structure with clear headings and provide valuable, actionable content.`;

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
                content: 'You are a professional tech writer. Write comprehensive, SEO-optimized articles about AI tools and technology trends.'
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
          console.error(`API error for ${topic}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        articles.push({
          title: topic,
          slug: slugify(topic, { lower: true, strict: true }),
          metaDescription: `${topic.split(':')[0]} - Expert insights and recommendations for choosing the right AI tools for your needs.`,
          keywords: ['ai tools', 'artificial intelligence', 'business tools', 'productivity', 'technology trends'],
          category: 'AI Tools',
          readingTime: Math.ceil(content.split(' ').length / 200),
          targetAudience: 'Business professionals, entrepreneurs, tech enthusiasts',
          content: content,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          featured: Math.random() > 0.5,
          imagePrompt: `Professional illustration for ${topic}, modern AI technology theme, business focus`,
          status: 'published'
        });

        // Small delay between articles
        await new Promise(resolve => setTimeout(() => resolve(), 1500));

      } catch (error) {
        console.error(`Error generating article "${topic}":`, error);
      }
    }

    return articles;
  }
}

async function main() {
  const generator = new ComprehensiveContentGenerator();
  await generator.generateAllContent();
}

if (require.main === module) {
  main();
}

module.exports = { ComprehensiveContentGenerator };