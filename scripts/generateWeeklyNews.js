const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const currentDate = new Date().toISOString();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

async function generateWeeklyNews() {
  console.log('📰 Generating weekly news article...');
  
  // Load tools
  const toolsPath = path.join(contentDir, 'tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  
  // Get new tools from this week
  const newTools = tools.filter(tool => {
    const lastUpdated = tool.lastUpdated ? new Date(tool.lastUpdated) : new Date(tool.updatedAt);
    return lastUpdated >= oneWeekAgo;
  }).slice(0, 10);
  
  if (newTools.length === 0) {
    console.log('⚠️ No new tools this week. Skipping article generation.');
    return;
  }
  
  // Generate article content
  const weekStart = oneWeekAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const weekEnd = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const article = {
    title: `New AI Tools This Week - ${weekEnd}`,
    slug: `new-ai-tools-${new Date().toISOString().split('T')[0]}`,
    metaDescription: `Discover ${newTools.length} new AI tools added this week. Stay updated with the latest AI innovations and tools.`,
    keywords: ['new ai tools', 'ai tools 2026', 'latest ai tools', 'ai tool updates', 'new ai releases'],
    category: 'News',
    readingTime: Math.ceil(newTools.length * 2),
    targetAudience: 'AI enthusiasts, developers, business professionals',
    content: generateArticleContent(newTools, weekStart, weekEnd),
    publishedAt: currentDate,
    updatedAt: currentDate,
    featured: true,
    status: 'published'
  };
  
  // Load existing articles
  const articlesPath = path.join(contentDir, 'articles.json');
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  
  // Remove old weekly news articles (keep only latest)
  const filteredArticles = articles.filter(a => !a.slug.startsWith('new-ai-tools-'));
  
  // Add new article at the beginning
  filteredArticles.unshift(article);
  
  // Save
  fs.writeFileSync(articlesPath, JSON.stringify(filteredArticles, null, 2));
  console.log(`✅ Generated weekly news article with ${newTools.length} tools`);
}

function generateArticleContent(tools, weekStart, weekEnd) {
  let content = `# New AI Tools This Week - ${weekEnd}\n\n`;
  content += `Welcome to our weekly roundup of new AI tools! This week (${weekStart} - ${weekEnd}), we've added ${tools.length} exciting new AI tools to our directory. Here's what's new:\n\n`;
  
  tools.forEach((tool, index) => {
    content += `## ${index + 1}. ${tool.name}\n\n`;
    content += `**Category:** ${tool.category}\n\n`;
    content += `${tool.description}\n\n`;
    
    if (tool.features && tool.features.length > 0) {
      content += `**Key Features:**\n`;
      tool.features.slice(0, 3).forEach(feature => {
        content += `- ${feature}\n`;
      });
      content += `\n`;
    }
    
    content += `**Pricing:** ${tool.pricing}${tool.pricingDetails ? ` - ${tool.pricingDetails}` : ''}\n\n`;
    content += `[Visit ${tool.name}](${tool.website})\n\n`;
    content += `---\n\n`;
  });
  
  content += `## Stay Updated\n\n`;
  content += `Want to be the first to know about new AI tools? Check back every week for our latest roundup, or browse our complete directory of AI tools.\n\n`;
  content += `**Total Tools in Directory:** ${tools.length} new tools this week\n\n`;
  content += `*Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*`;
  
  return content;
}

// Run if called directly
if (require.main === module) {
  generateWeeklyNews().catch(console.error);
}

module.exports = { generateWeeklyNews };
