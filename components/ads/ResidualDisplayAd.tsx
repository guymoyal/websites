'use client';

import React from 'react';
import AdSlot from '@/components/ads/AdSlot';
import { isAdSenseActive } from '@/lib/monetization';

interface ResidualDisplayAdProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'leaderboard';
  className?: string;
}

/** Uses AdSense only (no sponsor), for secondary placements on a page. */
export default function ResidualDisplayAd({
  slot,
  format = 'leaderboard',
  className,
}: ResidualDisplayAdProps) {
  if (!isAdSenseActive()) return null;
  return <AdSlot slot={slot} format={format} className={className} />;
}
