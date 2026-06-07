import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Star, TrendingUp, Zap, Sparkles, BookOpen } from 'lucide-react';
import { getSiteConfig, getArticles, formatDate } from '@/lib/content';
import { getFeaturedTools, getCategories, getNewToolsThisWeek, getTrendingTools } from '@/lib/tools';
import { getSiteStats } from '@/lib/siteStats';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/search/SearchBar';
import MonetizationLeaderboard from '@/components/ads/MonetizationLeaderboard';
import ResidualDisplayAd from '@/components/ads/ResidualDisplayAd';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import CompareToolsStrip from '@/components/home/CompareToolsStrip';

import styles from './page.module.css';

export default async function HomePage() {
  const config = await getSiteConfig();
  const featuredTools = await getFeaturedTools();
  const categories = await getCategories();
  const newToolsThisWeek = await getNewToolsThisWeek();
  const trendingTools = await getTrendingTools();
  const articles = await getArticles();
  const stats = await getSiteStats();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>2026 Edition</span>
            <h1 className={styles.heroTitle}>
              Discover the Best AI Tools for Every Need
            </h1>
            <p className={styles.heroSubtitle}>
              Find, compare, and choose curated AI-powered tools—updated regularly—to boost productivity and creativity
            </p>
            <div className={styles.heroActions}>
              <Link href="/tools" className={styles.primaryButton}>
                <Search size={18} />
                Explore Tools
                <ArrowRight size={18} />
              </Link>
              <Link href="/categories" className={styles.secondaryButton}>
                <TrendingUp size={18} />
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBar} aria-label="Site overview">
        <div className={styles.statsInner}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.toolCount}+</span>
            <span className={styles.statLabel}>AI tools</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.categoryCount}</span>
            <span className={styles.statLabel}>categories</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.articleCount}+</span>
            <span className={styles.statLabel}>guides</span>
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
          <Suspense fallback={<div className={styles.searchBarPlaceholder}>Loading search...</div>}>
            <SearchBar 
              categories={categories.map(cat => ({ name: cat.name, slug: cat.slug }))}
            />
          </Suspense>
        </div>
      </section>

      {/* Primary sponsor / Ezoic */}
      <section className={styles.adSection}>
        <MonetizationLeaderboard
          slot="homepage-banner"
          className={styles.homepageAd}
        />
      </section>

      <section className={styles.affiliateSection} aria-label="Partner recommendations">
        <AffiliateStrip variant="row" />
      </section>

      <CompareToolsStrip />

      {/* New Tools This Week */}
      {newToolsThisWeek.length > 0 && (
        <section className={styles.newTools}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Sparkles className={styles.sectionIcon} />
              New AI Tools This Week
            </h2>
            <p className={styles.sectionSubtitle}>
              Discover the latest AI tools added to our directory
            </p>
          </div>
          
          <div className={styles.toolsGrid}>
            {newToolsThisWeek.map((tool) => (
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
      )}

      {/* Trending Tools */}
      {trendingTools.length > 0 && (
        <section className={styles.trendingTools}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp className={styles.sectionIcon} />
              Trending AI Tools Right Now
            </h2>
            <p className={styles.sectionSubtitle}>
              The most popular and highly-rated AI tools that everyone is using in 2026
            </p>
          </div>
          
          <div className={styles.toolsGrid}>
            {trendingTools.map((tool) => (
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
      )}

      {/* Featured Tools */}
      <section className={styles.featuredTools}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Star className={styles.sectionIcon} />
            Featured AI Tools
          </h2>
          <p className={styles.sectionSubtitle}>
            Hand-picked AI tools that stand out for their innovation and value
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

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className={styles.latestArticles}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BookOpen className={styles.sectionIcon} />
              Latest from the Blog
            </h2>
            <p className={styles.sectionSubtitle}>
              Guides, tips, and insights to help you get the most from AI tools
            </p>
          </div>
          <div className={styles.articlesPreview}>
            {articles.slice(0, 6).map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} className={styles.articlePreviewCard}>
                <div className={styles.articlePreviewImage}>
                  <Image
                    src={article.image || '/images/hero-placeholder.jpg'}
                    alt={article.title}
                    width={320}
                    height={180}
                    className={styles.articlePreviewImg}
                  />
                </div>
                <div className={styles.articlePreviewContent}>
                  <h3 className={styles.articlePreviewTitle}>{article.title}</h3>
                  <p className={styles.articlePreviewMeta}>
                    {formatDate(article.publishedAt)} · {article.readingTime} min read
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <Link href="/blog" className={styles.viewAllButton}>
              View All Articles
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

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
          </div>
        </div>
      </section>

      {/* Secondary leaderboard (Ezoic / empty if unmapped) */}
      <section className={styles.adSection}>
        <ResidualDisplayAd
          slot="homepage-bottom"
          className={styles.homepageAd}
        />
      </section>
    </div>
  );
}