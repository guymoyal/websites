#!/usr/bin/env node
/**
 * Add imagePrompt to articles missing it. Prompts are topic-specific for better AI image generation.
 */
const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '..', 'content', 'articles.json');

function buildImagePrompt(article) {
  const title = article.title || '';
  const category = article.category || 'AI tools';
  // Create a concise, visual description for image generation
  const prompts = {
    'Writing & Content': 'person writing on laptop with AI assistant, modern workspace',
    'Design & Creative': 'designer using AI art tools, digital canvas, creative studio',
    'Productivity': 'professional at desk with AI tools, organized workflow',
    'Development': 'developer coding with AI assistant, code on screen',
    'Marketing': 'marketer analyzing AI campaign dashboard, charts and data',
    'Analytics': 'analyst viewing AI-powered data visualization, insights',
    'Video & Media': 'creator editing video with AI tools, multimedia production',
    'General': 'modern AI technology concept, innovation and automation',
  };
  const base = prompts[category] || 'AI tools and technology, modern professional';
  return `${title}. Visual: ${base}`;
}

async function main() {
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  let updated = 0;
  for (const article of articles) {
    if (!article.imagePrompt) {
      article.imagePrompt = buildImagePrompt(article);
      updated++;
    }
  }
  fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
  console.log(`✅ Added imagePrompt to ${updated} articles`);
}

main().catch(console.error);
