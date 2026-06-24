import React from 'react';

export const ADSENSE_CLIENT = 'ca-pub-2201239508910470';

/**
 * Google AdSense Auto ads — one head script sitewide; placements are managed
 * from the AdSense dashboard (Ads → aibuzz.world → Auto ads ON).
 * https://support.google.com/adsense/answer/9261307
 */
export default function GoogleAdsense() {
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
