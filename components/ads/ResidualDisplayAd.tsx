import React from 'react';

interface ResidualDisplayAdProps {
  /** Kept for call-site compatibility; AdSense Auto ads decides placement. */
  slot: string;
  className?: string;
}

/**
 * In-content display slot. Under AdSense Auto ads, Google injects display and
 * in-article units automatically across the page, so this renders nothing.
 * To run an explicit AdSense unit in a given spot instead, replace the body
 * with an <ins class="adsbygoogle" data-ad-slot="…"> for that placement.
 */
export default function ResidualDisplayAd(_props: ResidualDisplayAdProps) {
  return null;
}
