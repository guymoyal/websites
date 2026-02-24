'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '@/lib/types';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  categories: Array<{ name: string; slug: string }>;
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  categories, 
  placeholder = "Search AI tools...",
  initialQuery = '',
  initialFilters = {}
}) => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});

  // Sync state with URL params when they change
  useEffect(() => {
    try {
      if (!searchParams) return;
      
      const urlQuery = searchParams.get('q') || '';
      const urlCategory = searchParams.get('category') || undefined;
      const urlPricing = searchParams.get('pricing') || undefined;
      const urlRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;
      const urlFeatured = searchParams.get('featured') === 'true';

      setQuery(urlQuery);
      setFilters({
        category: urlCategory,
        pricing: urlPricing,
        rating: urlRating,
        featured: urlFeatured || undefined,
      });
    } catch (error) {
      console.error('Error syncing search params:', error);
    }
  }, [searchParams]);

  const buildSearchUrl = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (searchQuery?.trim()) params.set('q', searchQuery.trim());
    if (searchFilters?.category) params.set('category', searchFilters.category);
    if (searchFilters?.pricing) params.set('pricing', searchFilters.pricing);
    if (searchFilters?.rating) params.set('rating', searchFilters.rating.toString());
    if (searchFilters?.featured) params.set('featured', 'true');
    
    const queryString = params.toString();
    return queryString ? `/tools?${queryString}` : '/tools';
  }, []);

  const handleSearch = useCallback(() => {
    const url = buildSearchUrl(query, filters);
    // Simple client-side navigation - just update URL without reload
    window.history.pushState({}, '', url);
    // Trigger a popstate event so useSearchParams updates
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [query, filters, buildSearchUrl]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearFilters = useCallback(() => {
    const newFilters: SearchFilters = {};
    setFilters(newFilters);
    const url = buildSearchUrl(query, newFilters);
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [query, buildSearchUrl]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    const url = buildSearchUrl(query, newFilters);
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [query, filters, buildSearchUrl]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={styles.input}
          />
          {query && (
            <button
              onClick={() => {
                const newQuery = '';
                setQuery(newQuery);
                const url = buildSearchUrl(newQuery, filters);
                window.history.pushState({}, '', url);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className={styles.searchButton}
        >
          Search
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.filterButton} ${activeFilterCount > 0 ? styles.hasFilters : ''}`}
        >
          <Filter size={18} />
          {activeFilterCount > 0 && (
            <span className={styles.filterCount}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <h3>Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className={styles.clearFilters}>
                Clear all
              </button>
            )}
          </div>
          
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value || undefined)}
                className={styles.select}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Pricing</label>
              <select
                value={filters.pricing || ''}
                onChange={(e) => updateFilter('pricing', e.target.value || undefined)}
                className={styles.select}
              >
                <option value="">All Pricing</option>
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Minimum Rating</label>
              <select
                value={filters.rating || ''}
                onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : undefined)}
                className={styles.select}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={(e) => updateFilter('featured', e.target.checked || undefined)}
                  className={styles.checkbox}
                />
                Featured only
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;