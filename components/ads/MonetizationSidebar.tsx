'use client';

import React from 'react';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import SponsorBanner from '@/components/ads/SponsorBanner';
import { getAffiliateItems, getSponsorConfig } from '@/lib/monetization';
import styles from './MonetizationSidebar.module.css';

interface MonetizationSidebarProps {
  /** Kept for call-site compatibility; display ads are placed by AdSense Auto ads. */
  slot: string;
  className?: string;
}

/** Sidebar: affiliate compact strip + sponsor banner. Display ads are injected
 *  sitewide by AdSense Auto ads. */
export default function MonetizationSidebar({
  slot: _slot,
  className,
}: MonetizationSidebarProps) {
  const hasSponsor = Boolean(getSponsorConfig());

  return (
    <div className={`${styles.stack} ${className ?? ''}`}>
      <AffiliateStrip variant="compact" maxItems={2} />
      {hasSponsor && <SponsorBanner variant="compact" />}
    </div>
  );
}
