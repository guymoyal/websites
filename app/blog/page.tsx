import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, Search } from 'lucide-react';
import { getArticles, getAllCategories, formatDate } from '@/lib/content';
import AdSlot from '@/components/ads/AdSlot';
import styles from './page.module.css';

export default async function BlogPage() {
  const articles = await getArticles();
  const categories = await getAllCategories();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Discover the latest insights, guides, and tips
        </p>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Categories</h3>
            <ul className={styles.categoryList}>
              <li>
                <Link href="/blog" className={styles.categoryLink}>
                  All Articles ({articles.length})
                </Link>
              </li>
              {categories.map((category) => {
                const count = articles.filter(article => article.category === category).length;
                return (
                  <li key={category}>
                    <Link 
                      href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className={styles.categoryLink}
                    >
                      {category} ({count})
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <AdSlot 
            slot="blog-sidebar" 
            format="rectangle"
            className={styles.sidebarAd}
          />
        </aside>

        <main className={styles.main}>
          <div className={styles.articlesGrid}>
            {articles.map((article) => (
              <article key={article.slug} className={styles.articleCard}>
                <div className={styles.articleImage}>
                  <Image
                    src={article.image || '/images/placeholder.jpg'}
                    alt={article.title}
                    width={400}
                    height={250}
                    className={styles.articleImg}
                  />
                  <div className={styles.articleCategory}>
                    {article.category}
                  </div>
                </div>
                
                <div className={styles.articleContent}>
                  <h2 className={styles.articleTitle}>
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  
                  <p className={styles.articleDescription}>
                    {article.metaDescription}
                  </p>
                  
                  <div className={styles.articleMeta}>
                    <span className={styles.metaItem}>
                      <Clock size={16} />
                      {article.readingTime} min read
                    </span>
                    <span className={styles.metaItem}>
                      <User size={16} />
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  
                  <div className={styles.articleKeywords}>
                    {article.keywords.slice(0, 3).map((keyword) => (
                      <span key={keyword} className={styles.keyword}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <AdSlot 
            slot="blog-bottom" 
            format="leaderboard"
            className={styles.bottomAd}
          />
        </main>
      </div>
    </div>
  );
}