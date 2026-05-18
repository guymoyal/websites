#!/usr/bin/env node
/**
 * Content audit: check dates, extract links, flag stale content.
 * Usage: node scripts/auditContent.js
 */
const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const articlesPath = path.join(contentDir, 'articles.json');

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s\)\]"']+/g;
  return (text.match(urlRegex) || []).filter((u) => !u.endsWith('.'));
}

function main() {
  if (!fs.existsSync(articlesPath)) {
    console.error('❌ No articles.json found.');
    process.exit(1);
  }

  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  const now = Date.now();
  const report = {
    total: articles.length,
    outdated: [],
    veryOld: [],
    placeholders: [],
    urls: new Map(),
  };

  for (const article of articles) {
    const updated = new Date(article.updatedAt).getTime();
    const age = now - updated;

    if (age > SIX_MONTHS_MS) {
      report.outdated.push({ title: article.title, slug: article.slug, updatedAt: article.updatedAt });
    }
    if (age > ONE_YEAR_MS) {
      report.veryOld.push({ title: article.title, slug: article.slug });
    }
    if (article.image && article.image.includes('-placeholder')) {
      report.placeholders.push({ title: article.title, slug: article.slug });
    }

    const urls = extractUrls(article.content || '');
    urls.forEach((url) => {
      const base = url.replace(/[?#].*$/, '');
      report.urls.set(base, (report.urls.get(base) || 0) + 1);
    });
  }

  console.log('\n📋 Content Audit Report\n');
  console.log(`Total articles: ${report.total}`);
  console.log(`\n⏰ Outdated (not updated in 6+ months): ${report.outdated.length}`);
  report.outdated.slice(0, 5).forEach((a) => console.log(`   - ${a.title}`));
  if (report.outdated.length > 5) console.log(`   ... and ${report.outdated.length - 5} more`);

  console.log(`\n📅 Very old (1+ year): ${report.veryOld.length}`);
  report.veryOld.slice(0, 3).forEach((a) => console.log(`   - ${a.title}`));

  console.log(`\n🖼️ Placeholder images: ${report.placeholders.length}`);
  report.placeholders.slice(0, 5).forEach((a) => console.log(`   - ${a.title}`));

  console.log(`\n🔗 Unique URLs in content: ${report.urls.size}`);

  console.log('\n💡 Suggestions:');
  if (report.outdated.length > 0) {
    console.log('   - Run "yarn refresh:content" to update old articles');
  }
  if (report.placeholders.length > 0) {
    console.log('   - Run "IMAGE_GENERATION_ENABLED=true node scripts/retryPlaceholderImages.js"');
  }
  console.log('');
}

main();
