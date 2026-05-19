'use client';

import React from 'react';
import EzoicPlaceholder from '@/components/ads/EzoicPlaceholder';
import SponsorBanner from '@/components/ads/SponsorBanner';
import { getSponsorConfig } from '@/lib/monetization';
import { getEzoicPlacementForSlot } from '@/lib/ezoic';

interface MonetizationLeaderboardProps {
  /** Maps to zones in NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON via lib/ezoicZones.ts */
  slot: string;
  className?: string;
}

/** Sponsor first, otherwise Ezoic placement for this slot when configured. */
export default function MonetizationLeaderboard({
  slot,
  className,
}: MonetizationLeaderboardProps) {
  if (getSponsorConfig()) {
    return <SponsorBanner variant="leaderboard" className={className} />;
  }
  const ezoId = getEzoicPlacementForSlot(slot);
  if (ezoId != null) {
    return <EzoicPlaceholder placementId={ezoId} className={className} />;
  }
  return null;
}
