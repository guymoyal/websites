'use client';

import React from 'react';

/**
 * Step 3 placeholder — IDs must match Ezoic dashboard placement IDs (numeric).
 * https://docs.ezoic.com/docs/ezoicads/implementation/
 * Do not add layout styles to this div per Ezoic guidance.
 */
export default function EzoicPlaceholder({
  placementId,
  className,
}: {
  placementId: number;
  className?: string;
}) {
  return <div id={`ezoic-pub-ad-placeholder-${placementId}`} className={className} />;
}
