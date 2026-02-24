import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Verified } from 'lucide-react';
import { AITool } from '@/lib/types';
import { getPricingColor } from '@/lib/utils';
import styles from './SmallToolCard.module.css';

interface SmallToolCardProps {
  tool: AITool;
}

const SmallToolCard: React.FC<SmallToolCardProps> = ({ tool }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.logoContainer}>
          <Image
            src={tool.logo || '/images/tool-placeholder.svg'}
            alt={`${tool.name} logo`}
            width={32}
            height={32}
            className={styles.logo}
          />
          {tool.verified && (
            <div className={styles.verifiedBadge}>
              <Verified size={10} />
            </div>
          )}
        </div>
        
        <div className={styles.toolInfo}>
          <h3 className={styles.toolName}>
            <Link href={`/tools/${tool.slug}`}>
              {tool.name}
            </Link>
          </h3>
          <div className={styles.toolMeta}>
            <span className={styles.category}>{tool.category}</span>
            <span className={`${styles.pricing} ${getPricingColor(tool.pricing)}`}>
              {tool.pricing}
            </span>
          </div>
        </div>
      </div>

      <p className={styles.description}>{tool.description}</p>

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
            <ExternalLink size={14} />
            Visit
          </a>
        </div>
      </div>
    </div>
  );
};

export default SmallToolCard;
