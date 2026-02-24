'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilters, AITool } from '@/lib/types';
import ToolCard from '@/components/tools/ToolCard';
import SmallToolCard from '@/components/tools/SmallToolCard';
import SearchBar from '@/components/search/SearchBar';
import { Grid, List } from 'lucide-react';
import styles from './page.module.css';

// Client-side search function
function searchToolsClient(tools: AITool[], query: string, filters?: SearchFilters): AITool[] {
  let filteredTools = tools.filter((tool: AITool) => tool.status === 'active');

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

    if (filters.featured) {
      filteredTools = filteredTools.filter(tool => tool.featured);
    }
  }

  // Text search
  if (query && query.trim()) {
    const searchQuery = query.toLowerCase().trim();
    const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);
    
    const scoredTools = filteredTools.map(tool => {
      let score = 0;
      const toolNameLower = tool.name.toLowerCase();
      const toolDescLower = tool.description.toLowerCase();
      const toolCategoryLower = tool.category.toLowerCase();
      
      searchTerms.forEach(term => {
        if (toolNameLower === term) {
          score += 100;
        } else if (toolNameLower.startsWith(term)) {
          score += 50;
        } else if (toolNameLower.includes(term)) {
          score += 30;
        }
        
        if (toolDescLower.includes(term)) {
          score += 10;
        }
        
        const tagMatches = tool.tags.filter(tag => 
          tag.toLowerCase().includes(term)
        ).length;
        score += tagMatches * 15;
        
        if (toolCategoryLower.includes(term)) {
          score += 5;
        }
      });
      
      return { tool, score };
    });
    
    filteredTools = scoredTools
      .filter(item => item.score > 0)
      .sort((a, b) => {
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
    // Sort by rating and review count
    filteredTools = filteredTools.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });
  }

  return filteredTools;
}

export default function ToolsPage() {
  const searchParams = useSearchParams();
  const [allTools, setAllTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Load tools and categories once on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load from public folder (works with static export)
        const [toolsRes, categoriesRes] = await Promise.all([
          fetch('/content/tool-cards.json').catch(() => fetch('/content/tools.json')),
          fetch('/content/categories.json')
        ]);
        
        const toolsData = await toolsRes.json();
        const categoriesData = await categoriesRes.json();
        
        const activeTools = (toolsData as AITool[]).filter((tool: AITool) => tool.status === 'active');
        setAllTools(activeTools);
        setCategories(categoriesData.map((cat: any) => ({ name: cat.name, slug: cat.slug })));
        setLoading(false);
      } catch (error) {
        console.error('Error loading tools:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Get filters from URL params
  const filters: SearchFilters = useMemo(() => ({
    category: searchParams?.get('category') || undefined,
    pricing: searchParams?.get('pricing') || undefined,
    rating: searchParams?.get('rating') ? Number(searchParams.get('rating')) : undefined,
    featured: searchParams?.get('featured') === 'true',
  }), [searchParams]);

  const query = searchParams?.get('q') || '';

  // Handle category slug to name conversion
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => {
      map.set(cat.slug.toLowerCase(), cat.name);
    });
    return map;
  }, [categories]);

  const effectiveFilters = useMemo(() => {
    if (!filters.category) return filters;
    const categoryName = categoryMap.get(filters.category.toLowerCase()) || filters.category;
    return { ...filters, category: categoryName };
  }, [filters, categoryMap]);

  // Filter tools client-side
  const filteredTools = useMemo(() => {
    return searchToolsClient(allTools, query, effectiveFilters);
  }, [allTools, query, effectiveFilters]);

  const hasSearchQuery = Boolean(query || filters.category || filters.pricing || filters.rating || filters.featured);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>AI Tools Directory</h1>
          <p className={styles.subtitle}>Loading tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Tools Directory</h1>
        <p className={styles.subtitle}>
          Discover and explore {filteredTools.length} AI tools to boost your productivity
        </p>
      </div>

      <SearchBar 
        categories={categories}
        placeholder="Search from thousands of AI tools..."
        initialQuery={query}
        initialFilters={filters}
      />

      <div className={styles.content}>
        <div className={styles.resultsHeader}>
          <div className={styles.resultsInfo}>
            <span className={styles.resultsCount}>
              {filteredTools.length} tools found
            </span>
            {query && (
              <span className={styles.searchQuery}>
                for "{query}"
              </span>
            )}
          </div>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewButton} ${styles.active}`}>
              <Grid size={18} />
            </button>
            <button className={styles.viewButton}>
              <List size={18} />
            </button>
          </div>
        </div>
        {filteredTools.length > 0 ? (
          <>
            {/* Show small cards when searching */}
            {hasSearchQuery && (
              <div className={styles.smallCardsGrid}>
                {filteredTools.slice(0, 6).map((tool) => (
                  <SmallToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
            {/* Show regular cards (3 per row) */}
            <div className={styles.toolsGrid}>
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No tools found</h3>
            <p>Try adjusting your search criteria or browse all categories</p>
          </div>
        )}
      </div>
    </div>
  );
}
