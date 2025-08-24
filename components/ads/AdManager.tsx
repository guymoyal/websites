'use client';

import React from 'react';
import MonetagAd from './MonetagAd';
import AdSlot from './AdSlot';
import { type MonetagZoneId } from '@/lib/monetagConfig';

interface AdManagerProps {
  type: 'monetag' | 'google' | 'both';
  zone?: MonetagZoneId | string;
  slot?: string;
  format?: 'banner' | 'rectangle' | 'side' | 'mobile-sticky' | 'leaderboard';
  position?: 'left' | 'right';
  closeable?: boolean;
  keywords?: string[];
  className?: string;
}

const AdManager: React.FC<AdManagerProps> = ({
  type,
  zone = 'primary', // Default to primary Monetag zone
  slot = 'default',
  format = 'banner',
  position = 'right',
  closeable = false,
  keywords = [],
  className = ''
}) => {
  // For testing: show both ads if type is 'both'
  if (type === 'both') {
    return (
      <div className="ad-manager-container">
        <MonetagAd
          zone={zone}
          format={format}
          position={position}
          closeable={closeable}
          className={className}
        />
        <AdSlot
          slot={slot}
          format={format}
          position={position}
          closeable={closeable}
          keywords={keywords}
          className={className}
        />
      </div>
    );
  }

  // Show only Monetag ads
  if (type === 'monetag') {
    return (
      <MonetagAd
        zone={zone}
        format={format}
        position={position}
        closeable={closeable}
        className={className}
      />
    );
  }

  // Show only Google ads (for testing)
  if (type === 'google') {
    return (
      <AdSlot
        slot={slot}
        format={format}
        position={position}
        closeable={closeable}
        keywords={keywords}
        className={className}
      />
    );
  }

  return null;
};

export default AdManager;
