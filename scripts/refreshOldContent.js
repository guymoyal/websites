const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const currentDate = new Date().toISOString();
const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

async function refreshOldContent() {
  console.log('🔄 Refreshing old content...');
  
  const articlesPath = path.join(contentDir, 'articles.json');
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  
  let updatedCount = 0;
  
  articles.forEach(article => {
    const updatedAt = new Date(article.updatedAt);
    
    if (updatedAt < threeMonthsAgo) {
      // Update the updatedAt date
      article.updatedAt = currentDate;
      
      // Add update notice to content if it doesn't have one
      if (!article.content.includes('Last Updated') && !article.content.includes('Updated:')) {
        const updateNotice = `\n\n> **Last Updated:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n> This article has been refreshed with the latest information.\n\n`;
        article.content = article.content + updateNotice;
      }
      
      updatedCount++;
    }
  });
  
  fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
  console.log(`✅ Refreshed ${updatedCount} old articles`);
}

// Run if called directly
if (require.main === module) {
  refreshOldContent().catch(console.error);
}

module.exports = { refreshOldContent };
