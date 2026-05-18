'use client';

import React from 'react';
import AdSlot from '@/components/ads/AdSlot';
import SponsorBanner from '@/components/ads/SponsorBanner';
import { getSponsorConfig, isAdSenseActive } from '@/lib/monetization';

interface MonetizationLeaderboardProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'leaderboard';
  className?: string;
}

/** Leaderboard: sponsor banner first, otherwise AdSense when enabled. */
export default function MonetizationLeaderboard({
  slot,
  format = 'leaderboard',
  className,
}: MonetizationLeaderboardProps) {
  if (getSponsorConfig()) {
    return <SponsorBanner variant="leaderboard" className={className} />;
  }
  if (!isAdSenseActive()) return null;
  return <AdSlot slot={slot} format={format} className={className} />;
}
