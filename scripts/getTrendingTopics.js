#!/usr/bin/env node
/**
 * Output trending AI tool topics for content creation.
 * Use these to prioritize new articles or update existing ones.
 * Run: node scripts/getTrendingTopics.js
 */
const currentYear = new Date().getFullYear();

const TRENDING_TOPICS = [
  // High-volume comparisons (update when models change)
  `ChatGPT vs Claude vs Gemini comparison ${currentYear}`,
  `Best AI coding assistants ${currentYear}`,
  `Sora vs Runway vs Pika: AI video tools compared`,
  `Best AI writing tools for bloggers ${currentYear}`,
  `AI tools for small business ${currentYear}`,
  // New tools / trending
  'Claude 4 and Opus 4: what\'s new',
  'Google Gemini 2.0: features and use cases',
  'OpenAI o1 and o3: reasoning models explained',
  'Best free AI tools 2026',
  'AI image generators: Midjourney vs DALL-E vs Ideogram',
  // Use-case specific
  `Best AI tools for content creators ${currentYear}`,
  `Best AI tools for developers ${currentYear}`,
  `Best AI tools for marketers ${currentYear}`,
  'AI productivity tools for remote teams',
  'AI customer service tools comparison',
];

function main() {
  console.log('\n📈 Trending AI Tool Topics for Content\n');
  console.log('Use these for new articles or to refresh existing content:\n');
  TRENDING_TOPICS.forEach((topic, i) => {
    console.log(`  ${i + 1}. ${topic}`);
  });
  console.log('\n💡 Tip: Check Google Trends for "ai tools", "chatgpt", "claude" to validate.\n');
}

main();
