import React from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/tools';
import AdSlot from '@/components/ads/AdSlot';
import { ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Tool Categories</h1>
        <p className={styles.subtitle}>
          Explore AI tools organized by their primary use cases and functionalities
        </p>
      </div>

      <AdSlot 
        slot="categories-top" 
        format="leaderboard"
        className={styles.adSlot}
      />

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/category/${category.slug}`} 
            className={styles.categoryCard}
          >
            <div className={styles.categoryIcon}>
              {category.icon}
            </div>
            <h2 className={styles.categoryName}>{category.name}</h2>
            <p className={styles.categoryDescription}>{category.description}</p>
            <div className={styles.categoryFooter}>
              <span className={styles.toolCount}>{category.toolCount} tools</span>
              <ArrowRight className={styles.arrow} size={20} />
            </div>
          </Link>
        ))}
      </div>

      <AdSlot 
        slot="categories-bottom" 
        format="leaderboard"
        className={styles.adSlot}
      />
    </div>
  );
}