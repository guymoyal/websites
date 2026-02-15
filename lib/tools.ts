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

