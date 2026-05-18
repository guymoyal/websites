import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Verified, Globe, DollarSign, Users, Calendar, Clock } from 'lucide-react';
import { getTool, getTools, getToolsByCategory } from '@/lib/tools';
import { getPricingColor } from '@/lib/utils';
import ToolCard from '@/components/tools/ToolCard';
import AdSlot from '@/components/ads/AdSlot';
import styles from './page.module.css';

export async function generateStaticParams() {
  const tools = await getTools();
  
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested AI tool could not be found.',
    };
  }

  return {
    title: `${tool.name} - AI Tool Review | AI Buzz World`,
    description: tool.longDescription || tool.description,
    keywords: tool.tags.join(', '),
    alternates: {
      canonical: `https://aibuzztools.com/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} - AI Tool Review`,
      description: tool.longDescription || tool.description,
      type: 'article',
      url: `https://aibuzztools.com/tools/${tool.slug}`,
      siteName: 'AI Buzz World',
      images: tool.logo ? [
        {
          url: tool.logo,
          width: 1200,
          height: 630,
          alt: `${tool.name} logo`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} - AI Tool Review`,
      description: tool.description,
      images: tool.logo ? [tool.logo] : [],
    },
  };
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug);
  
  if (!tool) {
    notFound();
  }

  const relatedTools = await getToolsByCategory(tool.category);
  const filteredRelatedTools = relatedTools.filter(t => t.id !== tool.id).slice(0, 3);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/tools" className={styles.breadcrumbLink}>
          <ArrowLeft size={16} />
          Back to Tools
        </Link>
      </div>

      <div className={styles.toolHeader}>
        <div className={styles.toolInfo}>
          <div className={styles.logoContainer}>
            <Image
              src={tool.logo || '/images/tool-placeholder.svg'}
              alt={`${tool.name} logo`}
              width={80}
              height={80}
              className={styles.logo}
            />
            {tool.verified && (
              <div className={styles.verifiedBadge}>
                <Verified size={20} />
              </div>
            )}
          </div>
          
          <div className={styles.toolDetails}>
            <div className={styles.titleRow}>
              <h1 className={styles.toolName}>{tool.name}</h1>
              {tool.featured && (
                <span className={styles.featuredBadge}>Featured</span>
              )}
            </div>
            
            <p className={styles.description}>{tool.description}</p>
            
            <div className={styles.metaInfo}>
              <span className={styles.category}>{tool.category}</span>
              <span className={`${styles.pricing} ${getPricingColor(tool.pricing)}`}>
                {tool.pricing}
              </span>
              {tool.lastUpdated && (
                <span className={styles.lastUpdated}>
                  <Clock size={14} />
                  Updated {new Date(tool.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visitButton}
          >
            <Globe size={20} />
            Visit Website
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Top Ad */}
      <AdSlot 
        slot="tool-top" 
        format="leaderboard"
        className={styles.topAd}
      />

      <div className={styles.content}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2>About {tool.name}</h2>
            <div className={styles.longDescription}>
              {tool.longDescription.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Key Features</h2>
            <div className={styles.features}>
              {tool.features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  <span className={styles.featureIcon}>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Pricing Information</h2>
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <DollarSign className={styles.pricingIcon} />
                <span className={`${styles.pricingType} ${getPricingColor(tool.pricing)}`}>
                  {tool.pricing}
                </span>
              </div>
              {tool.pricingDetails && (
                <p className={styles.pricingDetails}>{tool.pricingDetails}</p>
              )}
            </div>
          </section>
        </div>

        <div className={styles.sidebar}>
          {/* Sidebar Ad */}
          <AdSlot 
            slot="tool-sidebar" 
            format="rectangle"
            className={styles.sidebarAd}
          />

          <div className={styles.sidebarCard}>
            <h3>Tool Information</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Users size={16} />
                <span>Category: {tool.category}</span>
              </div>
              <div className={styles.infoItem}>
                <Calendar size={16} />
                <span>Added: {new Date(tool.createdAt).toLocaleDateString()}</span>
              </div>

            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h3>Tags</h3>
            <div className={styles.tags}>
              {tool.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ad */}
      <AdSlot 
        slot="tool-bottom" 
        format="leaderboard"
        className={styles.bottomAd}
      />

      {filteredRelatedTools.length > 0 && (
        <section className={styles.relatedTools}>
          <h2>Related Tools in {tool.category}</h2>
          <div className={styles.relatedGrid}>
            {filteredRelatedTools.map((relatedTool) => (
              <ToolCard key={relatedTool.id} tool={relatedTool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}