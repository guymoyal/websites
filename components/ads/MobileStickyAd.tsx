'use client';

import { useEffect, useState } from 'react';
import styles from './AdSlot.module.css';

export default function MobileStickyAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Only show on mobile/tablet
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isVisible || isClosed) return null;

  return (
    <div className={styles.mobileStickyAd}>
      <button 
        className={styles.adCloseButton}
        onClick={() => setIsClosed(true)}
        aria-label="Close ad"
      >
        ×
      </button>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2858012859068424'}
        data-ad-slot="1111111111"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}