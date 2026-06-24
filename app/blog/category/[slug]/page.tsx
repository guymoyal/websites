import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { getArticlesByCategory, getAllCategories, categorySlug, formatDate } from '@/lib/content';
import MonetizationSidebar from '@/components/ads/MonetizationSidebar';
import ResidualDisplayAd from '@/components/ads/ResidualDisplayAd';
import styles from '../../page.module.css';

export async function generateStaticParams() {
  const categories = await getAllCategories();

  return categories.map((category) => ({
    slug: categorySlug(category),
  }));
}

async function findCategory(slug: string): Promise<string | undefined> {
  const categories = await getAllCategories();
  return categories.find((category) => categorySlug(category) === slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await findCategory(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested blog category could not be found.',
    };
  }

  return {
    title: `${category} Articles - Blog | AI Buzz World`,
    description: `Guides and articles about ${category.toLowerCase()} AI tools and workflows.`,
    alternates: {
      canonical: `https://aibuzz.world/blog/category/${params.slug}`,
    },
    openGraph: {
      title: `${category} Articles | AI Buzz World`,
      description: `Guides and articles about ${category.toLowerCase()} AI tools and workflows.`,
      url: `https://aibuzz.world/blog/category/${params.slug}`,
      siteName: 'AI Buzz World',
      type: 'website',
    },
  };
}

export default async function BlogCategoryPage({ params }: { params: { slug: string } }) {
  const category = await findCategory(params.slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category);
  const categories = await getAllCategories();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{category}</h1>
        <p className={styles.subtitle}>
          {articles.length} article{articles.length === 1 ? '' : 's'} in this category
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
                  <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  All Articles
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/blog/category/${categorySlug(cat)}`}
                    className={styles.categoryLink}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <MonetizationSidebar slot="blog-sidebar" />
        </aside>
      </div>
    </div>
  );
}
