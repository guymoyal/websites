'use client';

import React from 'react';
import AdSlot from '@/components/ads/AdSlot';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import SponsorBanner from '@/components/ads/SponsorBanner';
import { getAffiliateItems, getSponsorConfig, isAdSenseActive } from '@/lib/monetization';
import styles from './MonetizationSidebar.module.css';

interface MonetizationSidebarProps {
  adsenseSlot: string;
  className?: string;
}

/** Sidebar monetization: partner links, optional compact sponsor, else AdSense. */
export default function MonetizationSidebar({
  adsenseSlot,
  className,
}: MonetizationSidebarProps) {
  const hasAffiliate = getAffiliateItems().length > 0;
  const hasSponsor = Boolean(getSponsorConfig());
  const showAdsense = !hasAffiliate && !hasSponsor && isAdSenseActive();

  return (
    <div className={`${styles.stack} ${className ?? ''}`}>
      <AffiliateStrip variant="compact" maxItems={2} />
      {hasSponsor && <SponsorBanner variant="compact" />}
      {showAdsense && (
        <AdSlot slot={adsenseSlot} format="rectangle" className={styles.adSlot} />
      )}
    </div>
  );
}
