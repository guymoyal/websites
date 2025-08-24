'use client';

import { useEffect, useState } from 'react';
import styles from './AdSlot.module.css';

export default function SideAds() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Left Side Ad */}
      <div className={styles.sideAdLeft}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2858012859068424'}
          data-ad-slot="1234567890"
          data-ad-format="vertical"
          data-full-width-responsive="false"
        />
      </div>

      {/* Right Side Ad */}
      <div className={styles.sideAdRight}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2858012859068424'}
          data-ad-slot="0987654321"
          data-ad-format="vertical"
          data-full-width-responsive="false"
        />
      </div>
    </>
  );
}