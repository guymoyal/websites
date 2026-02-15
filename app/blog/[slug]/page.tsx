import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { getArticle, getArticles, getRelatedArticles, formatDate, parseMarkdown } from '@/lib/content';
import styles from './page.module.css';

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getArticles();
  
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: `${article.title} | AI Buzz World`,
    description: article.metaDescription,
    keywords: article.keywords.join(', '),
    alternates: {
      canonical: `https://aibuzztools.com/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: 'article',
      url: `https://aibuzztools.com/blog/${article.slug}`,
      siteName: 'AI Buzz World',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['AI Buzz World'],
      images: article.image ? [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@aibuzztools',
      title: article.title,
      description: article.metaDescription,
      images: article.image ? [article.image] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.slug);
  const htmlContent = parseMarkdown(article.content);

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <div className={styles.breadcrumb}>
            <Link href="/blog" className={styles.breadcrumbLink}>
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
          
          <div className={styles.articleMeta}>
            <span className={styles.category}>{article.category}</span>
            <div className={styles.metaItems}>
              <span className={styles.metaItem}>
                <Clock size={16} />
                {article.readingTime} min read
              </span>
              <span className={styles.metaItem}>
                <User size={16} />
                {formatDate(article.publishedAt)}
              </span>
            </div>
          </div>
          
          <h1 className={styles.articleTitle}>{article.title}</h1>
          
          <p className={styles.articleDescription}>{article.metaDescription}</p>
          
          <div className={styles.articleKeywords}>
            {article.keywords.map((keyword) => (
              <span key={keyword} className={styles.keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </header>

        {article.image && (
          <div className={styles.articleImage}>
            <Image
              src={article.image}
              alt={article.title}
              width={1200}
              height={600}
              className={styles.articleImg}
              priority
            />
          </div>
        )}

        <div className={styles.articleContent}>
          <div 
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        <footer className={styles.articleFooter}>
          <div className={styles.shareSection}>
            <h3>Share this article</h3>
            <div className={styles.shareButtons}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Share on LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </article>

      {relatedArticles.length > 0 && (
        <section className={styles.relatedArticles}>
          <h2 className={styles.relatedTitle}>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {relatedArticles.map((relatedArticle) => (
              <article key={relatedArticle.slug} className={styles.relatedCard}>
                <div className={styles.relatedImage}>
                  <Image
                    src={relatedArticle.image || '/images/placeholder.jpg'}
                    alt={relatedArticle.title}
                    width={300}
                    height={200}
                    className={styles.relatedImg}
                  />
                </div>
                <div className={styles.relatedContent}>
                  <h3 className={styles.relatedCardTitle}>
                    <Link href={`/blog/${relatedArticle.slug}`}>
                      {relatedArticle.title}
                    </Link>
                  </h3>
                  <p className={styles.relatedDescription}>
                    {relatedArticle.metaDescription}
                  </p>
                  <div className={styles.relatedMeta}>
                    <span className={styles.metaItem}>
                      <Clock size={14} />
                      {relatedArticle.readingTime} min
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}