import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getAffiliateItems } from '@/lib/monetization';
import { SmartCtaButton } from '@/components/landings/SmartCtaButton';
import styles from './AffiliateStrip.module.css';

interface AffiliateStripProps {
  variant?: 'row' | 'compact';
  className?: string;
  /** Max cards when variant is compact (e.g. sidebar). */
  maxItems?: number;
}

export default function AffiliateStrip({
  variant = 'row',
  className = '',
  maxItems = variant === 'compact' ? 2 : 4,
}: AffiliateStripProps) {
  const items = getAffiliateItems().slice(0, maxItems);
  if (items.length === 0) return null;

  return (
    <aside
      className={`${styles.wrap} ${styles[variant]} ${className}`}
      aria-label="Partner offers"
    >
      <span className={styles.label}>Deals &amp; tools we recommend</span>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href} className={styles.item}>
            <SmartCtaButton href={item.href} className={styles.card}>
              <span className={styles.cardInner}>
                <span className={styles.title}>{item.title}</span>
                {item.subtitle && (
                  <span className={styles.subtitle}>{item.subtitle}</span>
                )}
                <span className={styles.cta}>
                  {item.cta || 'Visit'}
                  <ExternalLink size={14} aria-hidden />
                </span>
              </span>
            </SmartCtaButton>
          </li>
        ))}
      </ul>
    </aside>
  );
}
