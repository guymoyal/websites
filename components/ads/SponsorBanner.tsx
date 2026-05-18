import React from 'react';
import { getSponsorConfig } from '@/lib/monetization';
import styles from './SponsorBanner.module.css';

interface SponsorBannerProps {
  variant?: 'leaderboard' | 'compact';
  className?: string;
}

export default function SponsorBanner({
  variant = 'leaderboard',
  className = '',
}: SponsorBannerProps) {
  const sponsor = getSponsorConfig();
  if (!sponsor) return null;

  return (
    <aside
      className={`${styles.wrap} ${styles[variant]} ${className}`}
      aria-label="Sponsored placement"
    >
      <span className={styles.label}>{sponsor.label}</span>
      {sponsor.headline && (
        <p className={styles.headline}>{sponsor.headline}</p>
      )}
      <a
        href={sponsor.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={styles.link}
      >
        <img
          src={sponsor.imageUrl}
          alt={sponsor.headline ?? sponsor.label}
          width={728}
          height={90}
          className={styles.image}
          loading="lazy"
        />
      </a>
    </aside>
  );
}
