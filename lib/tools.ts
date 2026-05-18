import fs from 'fs';
import path from 'path';
import { AITool, ToolCategory, SearchFilters } from './types';

const contentDir = path.join(process.cwd(), 'content');

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getTools(): Promise<AITool[]> {
  try {
    // Try tool-cards.json first, then fallback to tools.json
    let toolsPath = path.join(contentDir, 'tool-cards.json');
    if (!await fileExists(toolsPath)) {
      toolsPath = path.join(contentDir, 'tools.json');
    }
    
    if (!await fileExists(toolsPath)) {
      return [];
    }
    const toolsData = await fs.promises.readFile(toolsPath, 'utf-8');
    const tools = JSON.parse(toolsData);
    return tools.filter((tool: AITool) => tool.status === 'active');
  } catch (error) {
    console.error('Error loading tools:', error);
    return [];
  }
}

export async function getTool(slug: string): Promise<AITool | null> {
  const tools = await getTools();
  return tools.find(tool => tool.slug === slug) || null;
}

export async function getFeaturedTools(): Promise<AITool[]> {
  const tools = await getTools();
  // Get only newer tools (created or updated in 2026)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months ago
  
  const newerTools = tools.filter(tool => {
    const createdAt = new Date(tool.createdAt);
    const updatedAt = new Date(tool.updatedAt);
    // Include tools created or updated in the last 6 months
    return createdAt >= sixMonthsAgo || updatedAt >= sixMonthsAgo;
  });
  
  // Sort by most recent (updatedAt first, then createdAt), then by rating
  return newerTools
    .sort((a, b) => {
      const aUpdated = new Date(a.updatedAt).getTime();
      const bUpdated = new Date(b.updatedAt).getTime();
      
      // First sort by most recently updated
      if (bUpdated !== aUpdated) {
        return bUpdated - aUpdated;
      }
      
      // Then by creation date
      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      if (bCreated !== aCreated) {
        return bCreated - aCreated;
      }
      
      // Finally by rating
      return b.rating - a.rating;
    })
    .slice(0, 12); // Show top 12 newest trending tools
}

export async function getNewToolsThisWeek(): Promise<AITool[]> {
  const tools = await getTools();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return tools
    .filter(tool => {
      const lastUpdated = tool.lastUpdated ? new Date(tool.lastUpdated) : new Date(tool.updatedAt);
      return lastUpdated >= oneWeekAgo;
    })
    .sort((a, b) => {
      const aDate = a.lastUpdated ? new Date(a.lastUpdated).getTime() : new Date(a.updatedAt).getTime();
      const bDate = b.lastUpdated ? new Date(b.lastUpdated).getTime() : new Date(b.updatedAt).getTime();
      return bDate - aDate;
    })
    .slice(0, 6);
}

export async function getTrendingTools(): Promise<AITool[]> {
  const tools = await getTools();
  // Sort by rating and review count (simulating trending)
  return tools
    .sort((a, b) => {
      // First by rating
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // Then by review count
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, 6);
}

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  const tools = await getTools();
  return tools.filter(tool => tool.category.toLowerCase() === category.toLowerCase());
}

export async function getCategories(): Promise<ToolCategory[]> {
  try {
    const categoriesPath = path.join(contentDir, 'categories.json');
    if (!await fileExists(categoriesPath)) {
      return [];
    }
    const categoriesData = await fs.promises.readFile(categoriesPath, 'utf-8');
    return JSON.parse(categoriesData);
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

export async function searchTools(query: string, filters?: SearchFilters): Promise<AITool[]> {
  try {
    const tools = await getTools();
    const categories = await getCategories();
    
    // Create a map of slug to category name
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.slug.toLowerCase(), cat.name);
    });
    
    let filteredTools = tools;

  // Apply filters first (before text search for better performance)
  if (filters) {
    if (filters.category) {
      // Convert slug to category name if needed
      const categoryName = categoryMap.get(filters.category.toLowerCase()) || filters.category;
      filteredTools = filteredTools.filter(tool => 
        tool.category.toLowerCase() === categoryName.toLowerCase()
      );
    }

    if (filters.pricing) {
      filteredTools = filteredTools.filter(tool => tool.pricing === filters.pricing);
    }

    if (filters.rating) {
      filteredTools = filteredTools.filter(tool => tool.rating >= filters.rating!);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredTools = filteredTools.filter(tool =>
        filters.tags!.some(tag => tool.tags.includes(tag))
      );
    }

    if (filters.featured) {
      filteredTools = filteredTools.filter(tool => tool.featured);
    }
  }

  // Text search with relevance scoring
  if (query && query.trim()) {
    const searchQuery = query.toLowerCase().trim();
    const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);
    
    // Score each tool based on relevance
    const scoredTools = filteredTools.map(tool => {
      let score = 0;
      const toolNameLower = tool.name.toLowerCase();
      const toolDescLower = tool.description.toLowerCase();
      const toolCategoryLower = tool.category.toLowerCase();
      
      searchTerms.forEach(term => {
        // Exact name match gets highest score
        if (toolNameLower === term) {
          score += 100;
        } else if (toolNameLower.startsWith(term)) {
          score += 50;
        } else if (toolNameLower.includes(term)) {
          score += 30;
        }
        
        // Description matches
        if (toolDescLower.includes(term)) {
          score += 10;
        }
        
        // Tag matches
        const tagMatches = tool.tags.filter(tag => 
          tag.toLowerCase().includes(term)
        ).length;
        score += tagMatches * 15;
        
        // Category match
        if (toolCategoryLower.includes(term)) {
          score += 5;
        }
      });
      
      return { tool, score };
    });
    
    // Filter out tools with score 0 and sort by relevance
    filteredTools = scoredTools
      .filter(item => item.score > 0)
      .sort((a, b) => {
        // Sort by score (descending), then by rating, then by review count
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (b.tool.rating !== a.tool.rating) {
          return b.tool.rating - a.tool.rating;
        }
        return b.tool.reviewCount - a.tool.reviewCount;
      })
      .map(item => item.tool);
  } else {
    // No query, sort by rating and review count
    filteredTools = filteredTools.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });
  }

    return filteredTools;
  } catch (error) {
    console.error('Error searching tools:', error);
    return [];
  }
}

export function getPricingColor(pricing: string): string {
  switch (pricing) {
    case 'Free':
      return 'bg-green-100 text-green-800';
    case 'Freemium':
      return 'bg-blue-100 text-blue-800';
    case 'Paid':
      return 'bg-orange-100 text-orange-800';
    case 'Enterprise':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

