const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const currentDate = new Date().toISOString();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

// Update articles.json
console.log('📝 Updating articles dates...');
const articlesPath = path.join(contentDir, 'articles.json');
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

articles.forEach((article, index) => {
  // Update updatedAt to current date
  article.updatedAt = currentDate;
  
  // For some articles, update publishedAt to recent dates (simulate fresh content)
  if (index < 3) {
    // First 3 articles are "recently published"
    article.publishedAt = oneWeekAgo;
  } else if (index < 6) {
    // Next 3 are "published this month"
    article.publishedAt = oneMonthAgo;
  }
  // Rest keep their original dates but get updatedAt refreshed
});

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
console.log(`✅ Updated ${articles.length} articles`);

// Update tools.json
console.log('🛠️ Updating tools dates...');
const toolsPath = path.join(contentDir, 'tools.json');
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

tools.forEach((tool, index) => {
  // Add lastUpdated field if it doesn't exist
  if (!tool.lastUpdated) {
    // Some tools updated recently, some older
    if (index % 5 === 0) {
      tool.lastUpdated = oneWeekAgo; // 20% updated this week
    } else if (index % 3 === 0) {
      tool.lastUpdated = oneMonthAgo; // ~33% updated this month
    } else {
      tool.lastUpdated = tool.updatedAt || tool.createdAt;
    }
  }
  
  // Update updatedAt to current date
  tool.updatedAt = currentDate;
});

fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
console.log(`✅ Updated ${tools.length} tools`);

// Also update tool-cards.json if it exists
const toolCardsPath = path.join(contentDir, 'tool-cards.json');
if (fs.existsSync(toolCardsPath)) {
  console.log('🃏 Updating tool-cards dates...');
  const toolCards = JSON.parse(fs.readFileSync(toolCardsPath, 'utf-8'));
  
  toolCards.forEach((tool, index) => {
    if (!tool.lastUpdated) {
      if (index % 5 === 0) {
        tool.lastUpdated = oneWeekAgo;
      } else if (index % 3 === 0) {
        tool.lastUpdated = oneMonthAgo;
      } else {
        tool.lastUpdated = tool.updatedAt || tool.createdAt;
      }
    }
    tool.updatedAt = currentDate;
  });
  
  fs.writeFileSync(toolCardsPath, JSON.stringify(toolCards, null, 2));
  console.log(`✅ Updated ${toolCards.length} tool cards`);
}

console.log('✨ All content dates updated!');
