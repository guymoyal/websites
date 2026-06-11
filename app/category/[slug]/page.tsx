import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCategories, getToolsByCategory } from '@/lib/tools';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/search/SearchBar';
import MonetizationLeaderboard from '@/components/ads/MonetizationLeaderboard';
import ResidualDisplayAd from '@/components/ads/ResidualDisplayAd';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import styles from './page.module.css';

export async function generateStaticParams() {
  const categories = await getCategories();
  
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categories = await getCategories();
  const category = categories.find(cat => cat.slug === params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} AI Tools - Directory | AI Buzz World`,
    description: `Discover the best ${category.name.toLowerCase()} AI tools. ${category.description}`,
    keywords: [category.name.toLowerCase(), 'ai tools', 'directory', 'reviews'].join(', '),
    alternates: {
      canonical: `https://aibuzz.world/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} AI Tools`,
      description: `Discover the best ${category.name.toLowerCase()} AI tools. ${category.description}`,
      url: `https://aibuzz.world/category/${category.slug}`,
      siteName: 'AI Buzz World',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@aibuzztools',
      title: `${category.name} AI Tools`,
      description: `Discover the best ${category.name.toLowerCase()} AI tools.`,
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categories = await getCategories();
  const category = categories.find(cat => cat.slug === params.slug);
  
  if (!category) {
    notFound();
  }

  const tools = await getToolsByCategory(category.name);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/categories" className={styles.breadcrumbLink}>
          <ArrowLeft size={16} />
          Back to Categories
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.categoryIcon}>
          {category.icon}
        </div>
        <h1 className={styles.title}>{category.name} AI Tools</h1>
        <p className={styles.subtitle}>{category.description}</p>
        <div className={styles.stats}>
          <span className={styles.toolCount}>{tools.length} tools available</span>
        </div>
      </div>

      <Suspense fallback={<div style={{ padding: '1rem', textAlign: 'center' }}>Loading search...</div>}>
        <SearchBar 
          categories={categories.map(cat => ({ name: cat.name, slug: cat.slug }))}
          placeholder={`Search ${category.name.toLowerCase()} tools...`}
        />
      </Suspense>

      <MonetizationLeaderboard slot="categories-top" className={styles.categoryAd} />
      <AffiliateStrip variant="row" className={styles.affiliateStrip} />

      {tools.length > 0 ? (
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className={styles.noTools}>
          <div className={styles.noToolsIcon}>🔍</div>
          <h3>No tools found in this category</h3>
          <p>Check back later as we're constantly adding new tools</p>
          <Link href="/tools" className={styles.browseAllButton}>
            Browse All Tools
          </Link>
        </div>
      )}

      <ResidualDisplayAd slot="categories-bottom" className={styles.categoryAd} />

      {/* Related Categories */}
      <section className={styles.relatedCategories}>
        <h2>Related Categories</h2>
        <div className={styles.relatedGrid}>
          {categories
            .filter(cat => cat.id !== category.id)
            .slice(0, 4)
            .map((relatedCategory) => (
              <Link 
                key={relatedCategory.id} 
                href={`/category/${relatedCategory.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedIcon}>
                  {relatedCategory.icon}
                </div>
                <h3>{relatedCategory.name}</h3>
                <span className={styles.relatedCount}>
                  {relatedCategory.toolCount} tools
                </span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}