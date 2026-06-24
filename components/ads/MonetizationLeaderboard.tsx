'use client';

import React from 'react';
import SponsorBanner from '@/components/ads/SponsorBanner';
import { getSponsorConfig } from '@/lib/monetization';

interface MonetizationLeaderboardProps {
  /** Kept for call-site compatibility; display ads are placed by AdSense Auto ads. */
  slot: string;
  className?: string;
}

/** Renders a paid sponsor banner when one is configured; otherwise nothing
 *  (AdSense Auto ads handles display placements sitewide). */
export default function MonetizationLeaderboard({
  slot: _slot,
  className,
}: MonetizationLeaderboardProps) {
  if (getSponsorConfig()) {
    return <SponsorBanner variant="leaderboard" className={className} />;
  }
  return null;
}
