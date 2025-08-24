import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Verified } from 'lucide-react';
import { AITool } from '@/lib/types';
import { getPricingColor } from '@/lib/tools';
import styles from './ToolCard.module.css';

interface ToolCardProps {
  tool: AITool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.logoContainer}>
          <Image
            src={tool.logo || '/images/tool-placeholder.svg'}
            alt={`${tool.name} logo`}
            width={48}
            height={48}
            className={styles.logo}
          />
          {tool.verified && (
            <div className={styles.verifiedBadge}>
              <Verified size={14} />
            </div>
          )}
        </div>
        
        <div className={styles.toolInfo}>
          <div className={styles.toolHeader}>
            <h3 className={styles.toolName}>
              <Link href={`/tools/${tool.slug}`}>
                {tool.name}
              </Link>
            </h3>
            {tool.featured && (
              <span className={styles.featuredBadge}>Featured</span>
            )}
          </div>
          
          <div className={styles.toolMeta}>
            <span className={styles.category}>{tool.category}</span>
            <span className={`${styles.pricing} ${getPricingColor(tool.pricing)}`}>
              {tool.pricing}
            </span>
          </div>
        </div>
      </div>

      <p className={styles.description}>{tool.description}</p>

      <div className={styles.features}>
        {tool.features.slice(0, 3).map((feature, index) => (
          <span key={index} className={styles.feature}>
            {feature}
          </span>
        ))}
        {tool.features.length > 3 && (
          <span className={styles.moreFeatures}>
            +{tool.features.length - 3} more
          </span>
        )}
      </div>

      <div className={styles.tags}>
        {tool.tags.slice(0, 4).map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.actions}>
          <Link href={`/tools/${tool.slug}`} className={styles.detailsButton}>
            Details
          </Link>
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visitButton}
          >
            <ExternalLink size={16} />
            Visit
          </a>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;