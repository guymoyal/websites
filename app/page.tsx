import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Star, TrendingUp, Zap } from 'lucide-react';
import { getSiteConfig } from '@/lib/content';
import { getFeaturedTools, getCategories, getTools } from '@/lib/tools';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/search/SearchBar';

import styles from './page.module.css';

export default async function HomePage() {
  const config = await getSiteConfig();
  const featuredTools = await getFeaturedTools();
  const categories = await getCategories();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Discover the Best AI Tools for Every Need
            </h1>
            <p className={styles.heroSubtitle}>
              Find, compare, and choose from thousands of AI-powered tools to boost your productivity and creativity
            </p>
            <div className={styles.heroActions}>
              <Link href="/tools" className={styles.primaryButton}>
                <Search size={20} />
                Explore Tools
                <ArrowRight size={20} />
              </Link>
              <Link href="/categories" className={styles.secondaryButton}>
                <TrendingUp size={20} />
                Browse Categories
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center"
              alt="AI Tools Dashboard"
              width={600}
              height={400}
              className={styles.heroImg}
              priority
            />
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <h2 className={styles.searchTitle}>
            <Zap className={styles.searchIcon} />
            Find Your Perfect AI Tool
          </h2>
          <SearchBar 
            categories={categories.map(cat => ({ name: cat.name, slug: cat.slug }))}
          />
        </div>
      </section>



      {/* Featured Tools */}
      <section className={styles.featuredTools}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp className={styles.sectionIcon} />
            Trending AI Tools Right Now
          </h2>
          <p className={styles.sectionSubtitle}>
            The most talked-about and popular AI tools that everyone is using in 2026
          </p>
        </div>
        
        <div className={styles.toolsGrid}>
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        
        <div className={styles.sectionFooter}>
          <Link href="/tools" className={styles.viewAllButton}>
            View All Tools
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Browse by Category</h2>
          <p className={styles.sectionSubtitle}>
            Explore tools organized by their primary use cases
          </p>
        </div>
        
        <div className={styles.categoriesGrid}>
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                {category.icon}
              </div>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <p className={styles.categoryDescription}>{category.description}</p>
              <span className={styles.categoryCount}>{category.toolCount} tools</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Ready to Supercharge Your Workflow?
          </h2>
          <p className={styles.ctaDescription}>
            Join thousands of professionals who discover and use the best AI tools daily
          </p>
          <div className={styles.ctaActions}>
            <Link href="/tools" className={styles.primaryButton}>
              Explore All Tools
            </Link>
            <Link href="/submit" className={styles.secondaryButton}>
              Submit a Tool
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}