import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';

export interface Article {
  title: string;
  slug: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  readingTime: number;
  targetAudience: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  image?: string;
  imagePrompt?: string;
  status: 'published' | 'draft';
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  topic: string;
  navigation: Array<{ name: string; href: string }>;
  social: {
    twitter: string;
    linkedin: string;
    github: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
}

export interface PageContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  about: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    content: string;
  };
  comparisons: Array<{
    title: string;
    slug: string;
    content: string;
  }>;
}

const contentDir = path.join(process.cwd(), 'content');

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const configPath = path.join(contentDir, 'config.json');
    const config = await fs.readJSON(configPath);
    return config;
  } catch (error) {
    console.error('Error loading site config:', error);
    return {
      name: 'AI Buzz World',
      description: 'Your ultimate guide to AI tools and technologies at AI Buzz World',
      url: 'https://your-domain.com',
      topic: 'AI Tools',
      navigation: [
        { name: 'Home', href: '/' },
        { name: 'Blog', href: '/blog' },
        { name: 'Compare', href: '/compare' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' }
      ],
      social: {
        twitter: 'https://twitter.com/yourusername',
        linkedin: 'https://linkedin.com/company/yourcompany',
        github: 'https://github.com/yourusername'
      },
      seo: {
        defaultTitle: 'AI Buzz World - Complete Guide and Tools',
        defaultDescription: 'Discover the best AI tools with our comprehensive guides, reviews, and comparisons.',
        keywords: ['ai tools', 'guide', 'tools', 'reviews', 'comparison']
      }
    };
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const articlesPath = path.join(contentDir, 'articles.json');
    const articles = await fs.readJSON(articlesPath);
    return articles.filter((article: Article) => article.status === 'published');
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

export async function getArticle(slug: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find(article => article.slug === slug) || null;
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter(article => article.featured);
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter(article => article.category === category);
}

export async function getPageContent(): Promise<PageContent> {
  try {
    const pagesPath = path.join(contentDir, 'pages.json');
    const pages = await fs.readJSON(pagesPath);
    return pages;
  } catch (error) {
    console.error('Error loading page content:', error);
    return {
      hero: {
        title: 'Welcome to AI Buzz World',
        subtitle: 'Discover the best AI tools and technologies',
        cta: 'Get Started'
      },
      about: {
        title: 'About Us',
        content: 'We are dedicated to helping you navigate the world of AI tools.'
      },
      contact: {
        title: 'Contact Us',
        content: 'Get in touch with our team for any questions or suggestions.'
      },
      comparisons: []
    };
  }
}

export function parseMarkdown(content: string): string {
  return marked(content);
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export async function getAllCategories(): Promise<string[]> {
  const articles = await getArticles();
  const categories = [...new Set(articles.map(article => article.category))];
  return categories.sort();
}

export async function getRelatedArticles(currentSlug: string, limit: number = 3): Promise<Article[]> {
  const articles = await getArticles();
  const currentArticle = articles.find(article => article.slug === currentSlug);
  
  if (!currentArticle) return [];
  
  const relatedArticles = articles
    .filter(article => 
      article.slug !== currentSlug && 
      article.category === currentArticle.category
    )
    .slice(0, limit);
  
  // If not enough articles in same category, fill with other articles
  if (relatedArticles.length < limit) {
    const otherArticles = articles
      .filter(article => 
        article.slug !== currentSlug && 
        article.category !== currentArticle.category
      )
      .slice(0, limit - relatedArticles.length);
    
    relatedArticles.push(...otherArticles);
  }
  
  return relatedArticles;
}