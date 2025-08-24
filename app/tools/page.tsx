import React, { Suspense } from 'react';
import { searchTools, getCategories } from '@/lib/tools';
import { SearchFilters } from '@/lib/types';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/search/SearchBar';
import AdSlot from '@/components/ads/AdSlot';
import { Filter, Grid, List } from 'lucide-react';
import styles from './page.module.css';

export const dynamic = 'force-static';

interface PageProps {
  searchParams: {
    q?: string;
    category?: string;
    pricing?: string;
    rating?: string;
    featured?: string;
  };
}

export default async function ToolsPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  
  const filters: SearchFilters = {
    category: searchParams.category,
    pricing: searchParams.pricing as any,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    featured: searchParams.featured === 'true',
  };

  const tools = await searchTools(searchParams.q || '', filters);
  const hasSearchQuery = Boolean(searchParams.q || searchParams.category || searchParams.pricing || searchParams.rating || searchParams.featured);

  return (
    <div className={styles.container}>
      {/* Side ads for desktop - only show when searching */}
      {hasSearchQuery && (
        <>
          <AdSlot 
            slot="tools-search-left" 
            format="side"
            position="left"
            keywords={['AI tools', 'search', 'productivity']}
          />
          <AdSlot 
            slot="tools-search-right" 
            format="side"
            position="right"
            keywords={['AI tools', 'search', 'productivity']}
          />
        </>
      )}
      <div className={styles.header}>
        <h1 className={styles.title}>AI Tools Directory</h1>
        <p className={styles.subtitle}>
          Discover and explore {tools.length} AI tools to boost your productivity
        </p>
      </div>

      <SearchBar 
        categories={categories.map(cat => ({ name: cat.name, slug: cat.slug }))}
        placeholder="Search from thousands of AI tools..."
      />



      <div className={styles.content}>
        <div className={styles.resultsHeader}>
          <div className={styles.resultsInfo}>
            <span className={styles.resultsCount}>
              {tools.length} tools found
            </span>
            {searchParams.q && (
              <span className={styles.searchQuery}>
                for "{searchParams.q}"
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

        {tools.length > 0 ? (
          <div className={styles.toolsGrid}>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No tools found</h3>
            <p>Try adjusting your search criteria or browse all categories</p>
          </div>
        )}
      </div>

      {/* Only show bottom ad when NOT searching or when there are results */}
      {(!hasSearchQuery || tools.length > 0) && (
        <AdSlot 
          slot="tools-bottom" 
          format="leaderboard"
          keywords={['AI tools', 'directory']}
          className={styles.adSlot}
        />
      )}
    </div>
  );
}