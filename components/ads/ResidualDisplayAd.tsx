'use client';

import React from 'react';
import EzoicPlaceholder from '@/components/ads/EzoicPlaceholder';
import { getEzoicPlacementForSlot } from '@/lib/ezoic';

interface ResidualDisplayAdProps {
  /** Maps to zones in NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON via lib/ezoicZones.ts */
  slot: string;
  className?: string;
}

/** Secondary horizontal placement (Ezoic only in this codebase). */
export default function ResidualDisplayAd({
  slot,
  className,
}: ResidualDisplayAdProps) {
  const ezoId = getEzoicPlacementForSlot(slot);
  if (ezoId == null) return null;
  return <EzoicPlaceholder placementId={ezoId} className={className} />;
}
