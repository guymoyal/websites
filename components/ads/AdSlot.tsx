'use client';

import React, { useEffect } from 'react';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'leaderboard';
  className?: string;
}

const AdSlot: React.FC<AdSlotProps> = ({ slot, format = 'auto', className = '' }) => {
  useEffect(() => {
    try {
      // @ts-ignore - adsbygoogle is loaded from Google AdSense script
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2201239508910470"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
