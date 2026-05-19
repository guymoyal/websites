'use client';

import React from 'react';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import EzoicPlaceholder from '@/components/ads/EzoicPlaceholder';
import SponsorBanner from '@/components/ads/SponsorBanner';
import { getAffiliateItems, getSponsorConfig } from '@/lib/monetization';
import { getEzoicPlacementForSlot } from '@/lib/ezoic';
import styles from './MonetizationSidebar.module.css';

interface MonetizationSidebarProps {
  /** Maps to zones in NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON via lib/ezoicZones.ts */
  slot: string;
  className?: string;
}

/** Sidebar: affiliate compact strip, sponsor, then Ezoic when mapped. */
export default function MonetizationSidebar({
  slot,
  className,
}: MonetizationSidebarProps) {
  const hasSponsor = Boolean(getSponsorConfig());
  const ezoSidebarId = getEzoicPlacementForSlot(slot);

  return (
    <div className={`${styles.stack} ${className ?? ''}`}>
      <AffiliateStrip variant="compact" maxItems={2} />
      {hasSponsor && <SponsorBanner variant="compact" />}
      {ezoSidebarId != null ? (
        <EzoicPlaceholder placementId={ezoSidebarId} className={styles.adSlot} />
      ) : null}
    </div>
  );
}
