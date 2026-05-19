import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User } from 'lucide-react';
import { getArticles, getAllCategories, formatDate } from '@/lib/content';
import MonetizationSidebar from '@/components/ads/MonetizationSidebar';
import ResidualDisplayAd from '@/components/ads/ResidualDisplayAd';
import styles from './page.module.css';

export default async function BlogPage() {
  const articles = await getArticles();
  const categories = await getAllCategories();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Practical guides on AI workflows, tooling, and what changed in {new Date().getFullYear()}
        </p>
      </div>

      <div className={styles.content}>
        <main className={styles.main}>
          <div className={styles.articlesGrid}>
            {articles.map((article) => (
              <article key={article.slug} className={styles.articleCard}>
                <div className={styles.articleImage}>
                  <Image
                    src={article.image || '/images/hero-placeholder.jpg'}
                    alt={article.title}
                    width={400}
                    height={250}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 350px"
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

          <ResidualDisplayAd
            slot="blog-bottom"
            className={styles.bottomAd}
          />
        </main>

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

          <MonetizationSidebar slot="blog-sidebar" />
        </aside>
      </div>
    </div>
  );
}