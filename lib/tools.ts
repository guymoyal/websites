import fs from 'fs-extra';
import path from 'path';
import { AITool, ToolCategory, SearchFilters } from './types';

const contentDir = path.join(process.cwd(), 'content');

export async function getTools(): Promise<AITool[]> {
  try {
    // Try tool-cards.json first, then fallback to tools.json
    let toolsPath = path.join(contentDir, 'tool-cards.json');
    if (!await fs.pathExists(toolsPath)) {
      toolsPath = path.join(contentDir, 'tools.json');
    }
    
    if (!await fs.pathExists(toolsPath)) {
      return [];
    }
    const tools = await fs.readJSON(toolsPath);
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
  // Get featured tools and sort by rating and review count (trending/popular)
  const featured = tools.filter(tool => tool.featured);
  // Sort by rating (descending) then by review count (descending) to show most popular first
  return featured
    .sort((a, b) => {
      // First sort by rating
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // Then by review count (more reviews = more popular/trending)
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, 12); // Show top 12 trending tools
}

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  const tools = await getTools();
  return tools.filter(tool => tool.category.toLowerCase() === category.toLowerCase());
}

export async function getCategories(): Promise<ToolCategory[]> {
  try {
    const categoriesPath = path.join(contentDir, 'categories.json');
    if (!await fs.pathExists(categoriesPath)) {
      return [];
    }
    return await fs.readJSON(categoriesPath);
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

export async function searchTools(query: string, filters?: SearchFilters): Promise<AITool[]> {
  const tools = await getTools();
  
  let filteredTools = tools;

  // Text search
  if (query) {
    const searchQuery = query.toLowerCase();
    filteredTools = filteredTools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery) ||
      tool.description.toLowerCase().includes(searchQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
      tool.category.toLowerCase().includes(searchQuery)
    );
  }

  // Apply filters
  if (filters) {
    if (filters.category) {
      filteredTools = filteredTools.filter(tool => 
        tool.category.toLowerCase() === filters.category!.toLowerCase()
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

  return filteredTools;
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

