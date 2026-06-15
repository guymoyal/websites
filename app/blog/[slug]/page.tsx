import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, User, ArrowLeft, RefreshCw } from 'lucide-react';
import { getArticle, getArticles, getRelatedArticles, formatDate, parseMarkdown, getSiteConfig } from '@/lib/content';
import MonetizationLeaderboard from '@/components/ads/MonetizationLeaderboard';
import ResidualDisplayAd from '@/components/ads/ResidualDisplayAd';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import styles from './page.module.css';

export const dynamicParams = false;

// Build an SEO-friendly <title>: append the brand only when the title doesn't
// already contain it and the result stays within ~60 chars. Otherwise use the
// bare title so the tag doesn't trip "title too long" audits.
function seoTitle(base: string, brand = 'AI Buzz World'): string {
  if (base.includes(brand)) return base;
  const withBrand = `${base} | ${brand}`;
  return withBrand.length <= 60 ? withBrand : base;
}

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
    title: seoTitle(article.title),
    description: article.metaDescription,
    keywords: article.keywords.join(', '),
    alternates: {
      canonical: `https://aibuzz.world/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: 'article',
      url: `https://aibuzz.world/blog/${article.slug}`,
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
  const site = await getSiteConfig();
  const origin = site.url.replace(/\/+$/, '');
  const shareUrl = `${origin}/blog/${article.slug}/`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: article.image ? `https://aibuzz.world${article.image}` : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'AI Buzz World' },
    publisher: { '@type': 'Organization', name: 'AI Buzz World', url: 'https://aibuzz.world' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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
                Published {formatDate(article.publishedAt)}
              </span>
              {article.updatedAt !== article.publishedAt && (
                <span className={styles.metaItem}>
                  <RefreshCw size={16} />
                  Updated {formatDate(article.updatedAt)}
                </span>
              )}
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className={styles.articleImg}
              priority
            />
          </div>
        )}

        <MonetizationLeaderboard
          slot="article-top"
          className={styles.topAd}
        />

        <div className={styles.articleContent}>
          <div 
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        <ResidualDisplayAd
          slot="article-middle"
          className={styles.middleAd}
        />

        <footer className={styles.articleFooter}>
          <div className={styles.shareSection}>
            <h3>Share this article</h3>
            <div className={styles.shareButtons}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Share on LinkedIn
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Share on Facebook
              </a>
            </div>
          </div>
        </footer>
      </article>

      <AffiliateStrip variant="row" className={styles.articleAffiliateRow} />

      <ResidualDisplayAd
        slot="article-bottom"
        className={styles.bottomAd}
      />

      {relatedArticles.length > 0 && (
        <section className={styles.relatedArticles}>
          <h2 className={styles.relatedTitle}>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {relatedArticles.map((relatedArticle) => (
              <article key={relatedArticle.slug} className={styles.relatedCard}>
                <div className={styles.relatedImage}>
                  <Image
                    src={relatedArticle.image || '/images/hero-placeholder.jpg'}
                    alt={relatedArticle.title}
                    width={300}
                    height={200}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
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