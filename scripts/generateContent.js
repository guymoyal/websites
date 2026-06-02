#!/usr/bin/env node
/**
 * Generate blog articles using DeepSeek (chat API). No Gemini required.
 * Usage: yarn generate:content
 * Env: DEEPSEEK_API_KEY, optional ARTICLES_TO_GENERATE, WEBSITE_TOPIC
 */
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

async function callDeepSeek(systemPrompt, userPrompt, maxTokens = 4000) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from DeepSeek');
  return text.trim();
}

async function generateArticleContent() {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is required. Set it in .env or .env.local (https://platform.deepseek.com).');
  }

  const currentYear = new Date().getFullYear();
  const articleTopics = [
    `Best AI Writing Tools for Content Creators ${currentYear}`,
    `ChatGPT vs Claude vs Gemini comparison ${currentYear}`,
    `Best AI coding assistants ${currentYear}`,
    'AI Video Editing Tools: Sora, Runway, Pika compared',
    'AI Productivity Tools Every Professional Needs',
    'AI Marketing Automation Tools for 2026',
    `Best AI tools for small business ${currentYear}`,
    'AI Analytics Tools for Data-Driven Decisions',
    'Voice AI Technology and Speech Recognition',
    'AI-Powered Customer Service Solutions',
    'AI Tools for Social Media Management',
    `Best free AI tools ${currentYear}`,
    'AI image generators: Midjourney vs DALL-E vs Ideogram',
    'Natural Language Processing Tools',
    'Automated Content Generation Platforms',
  ];

  const randomTopic = articleTopics[Math.floor(Math.random() * articleTopics.length)];

  const userPrompt = `Write a comprehensive, SEO-optimized blog article about "${randomTopic}" for an AI tools directory website.

The article should be:
- 1500-2000 words long
- Written in an engaging, professional tone
- Include practical tips and actionable advice
- Have clear headings and subheadings (use ## for H2, ### for H3)
- Include specific tool recommendations with brief descriptions and current pricing where known
- Be valuable for both beginners and experienced users
- Include real-world use cases and examples
- Reflect the latest ${currentYear} AI landscape: mention recent product updates, new entrants, and industry shifts
- Avoid generic AI-sounding phrases; use concrete, specific language
- Ground recommendations in practical experience (e.g., "we tested X and found...")
- Add unique perspectives or comparisons that readers won't find elsewhere

Structure the article with:
1. Introduction (hook the reader, explain why this matters in ${currentYear})
2. Main content with 4-5 sections covering different aspects
3. Practical examples and use cases
4. Pros and cons where relevant
5. Conclusion with key takeaways and actionable next steps

Write in markdown format. Be specific, accurate, and helpful. Do not hallucinate facts or pricing—use approximate or "starts at" if uncertain.`;

  console.log(`📝 Generating article about: ${randomTopic}`);

  const content = await callDeepSeek(
    'You are an expert technology and SEO writer for an AI tools directory. Output only the article markdown, no preamble.',
    userPrompt,
    6000
  );

  const slug = slugify(randomTopic, { lower: true, strict: true });
  const keywords = generateKeywords(randomTopic);
  const category = categorizeArticle(randomTopic);

  return {
    title: randomTopic,
    slug,
    metaDescription: generateMetaDescription(randomTopic),
    keywords,
    category,
    readingTime: Math.ceil(content.split(/\s+/).length / 200),
    targetAudience: 'AI enthusiasts, business professionals, content creators',
    content,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    featured: Math.random() > 0.7,
    imagePrompt: generateImagePrompt(randomTopic),
    status: 'published',
  };
}

function generateKeywords(title) {
  const baseKeywords = ['ai tools', 'artificial intelligence', 'technology', 'productivity'];
  const titleWords = title.toLowerCase().split(' ').filter((word) => word.length > 3);
  return [...baseKeywords, ...titleWords].slice(0, 8);
}

function categorizeArticle(title) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('writing') || titleLower.includes('content') || titleLower.includes('copywriting')) {
    return 'Writing & Content';
  }
  if (titleLower.includes('image') || titleLower.includes('design') || titleLower.includes('creative')) {
    return 'Design & Creative';
  }
  if (titleLower.includes('productivity') || titleLower.includes('automation')) {
    return 'Productivity';
  }
  if (titleLower.includes('code') || titleLower.includes('developer') || titleLower.includes('programming')) {
    return 'Development';
  }
  if (titleLower.includes('marketing') || titleLower.includes('social media')) {
    return 'Marketing';
  }
  if (
    titleLower.includes('analytics') ||
    titleLower.includes('data') ||
    titleLower.includes('business intelligence')
  ) {
    return 'Analytics';
  }
  if (titleLower.includes('video') || titleLower.includes('media')) {
    return 'Video & Media';
  }
  return 'General';
}

function generateMetaDescription(title) {
  const year = new Date().getFullYear();
  return `Discover the best ${title.toLowerCase()}. Comprehensive guide with reviews, comparisons, and recommendations for ${year}.`;
}

function generateImagePrompt(title) {
  return `Modern, professional illustration representing ${title}, tech/AI theme, clean design, blue and yellow color scheme`;
}

async function generateContent() {
  console.log('🚀 Starting content generation with DeepSeek…');

  if (!DEEPSEEK_API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY is required. Add it to .env or .env.local — https://platform.deepseek.com');
    process.exit(1);
  }

  const articlesToGenerate = parseInt(process.env.ARTICLES_TO_GENERATE, 10) || 10;
  const websiteTopic = process.env.WEBSITE_TOPIC || 'AI Tools Directory';

  console.log(`📝 Generating ${articlesToGenerate} articles (topic context: ${websiteTopic})…`);

  const contentDir = path.join(__dirname, '..', 'content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const articlesPath = path.join(contentDir, 'articles.json');
  let articles = [];
  if (fs.existsSync(articlesPath)) {
    articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  }

  for (let i = 0; i < articlesToGenerate; i++) {
    console.log(`📄 Article ${i + 1}/${articlesToGenerate}…`);
    const article = await generateArticleContent();
    articles.push(article);
    await new Promise((r) => setTimeout(r, 2000));
  }

  fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
  console.log(`\n✅ Saved ${articlesToGenerate} articles → ${articlesPath}`);
}

if (require.main === module) {
  generateContent().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generateArticleContent, generateContent, callDeepSeek };
