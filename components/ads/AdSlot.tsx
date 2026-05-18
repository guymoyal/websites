'use client';

import React, { useEffect } from 'react';
import { getAdSlotId } from '@/lib/adConfig';
import { isAdSenseActive, getAdSensePublisherId } from '@/lib/monetization';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'leaderboard';
  className?: string;
}

const AdSlot: React.FC<AdSlotProps> = ({ slot, format = 'auto', className = '' }) => {
  const clientId = getAdSensePublisherId();

  useEffect(() => {
    if (!isAdSenseActive() || !clientId) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [clientId]);

  if (!isAdSenseActive() || !clientId) {
    return null;
  }

  const slotId = getAdSlotId(slot);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
