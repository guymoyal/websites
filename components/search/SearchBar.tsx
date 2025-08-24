'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '@/lib/types';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  categories: Array<{ name: string; slug: string }>;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  categories, 
  placeholder = "Search AI tools..." 
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (filters.category) searchParams.set('category', filters.category);
    if (filters.pricing) searchParams.set('pricing', filters.pricing);
    if (filters.rating) searchParams.set('rating', filters.rating.toString());
    if (filters.featured) searchParams.set('featured', 'true');
    
    router.push(`/tools?${searchParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
    if (query) {
      router.push(`/tools?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/tools');
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (newFilters.category) searchParams.set('category', newFilters.category);
    if (newFilters.pricing) searchParams.set('pricing', newFilters.pricing);
    if (newFilters.rating) searchParams.set('rating', newFilters.rating.toString());
    if (newFilters.featured) searchParams.set('featured', 'true');
    
    router.push(`/tools?${searchParams.toString()}`);
  };

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
                setQuery('');
                // Keep existing filters but remove query
                const searchParams = new URLSearchParams();
                if (filters.category) searchParams.set('category', filters.category);
                if (filters.pricing) searchParams.set('pricing', filters.pricing);
                if (filters.rating) searchParams.set('rating', filters.rating.toString());
                if (filters.featured) searchParams.set('featured', 'true');
                
                const queryString = searchParams.toString();
                router.push(queryString ? `/tools?${queryString}` : '/tools');
              }}
              className={styles.clearButton}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button
          onClick={handleSearch}
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