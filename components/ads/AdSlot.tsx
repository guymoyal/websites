'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getAdSlotId, isAdSenseConfigured } from '@/lib/adConfig';
import styles from './AdSlot.module.css';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'leaderboard' | 'banner' | 'square' | 'mobile-sticky' | 'side';
  responsive?: boolean;
  keywords?: string[];
  className?: string;
  position?: 'left' | 'right'; // for side ads
  closeable?: boolean; // for mobile sticky ads
}

const AdSlot: React.FC<AdSlotProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  keywords = [],
  className = '',
  position = 'right',
  closeable = false
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isLoaded.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_ADSENSE_CLIENT_ID;
    if (!clientId) {
      console.warn('Google AdSense client ID not found');
      return;
    }

    // Load AdSense script if not already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize ad
    const initAd = () => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          (window as any).adsbygoogle.push({});
          isLoaded.current = true;
        }
      } catch (error) {
        console.error('Error initializing ad:', error);
      }
    };

    // Wait for script to load
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      initAd();
    } else {
      const checkAdSense = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          clearInterval(checkAdSense);
          initAd();
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkAdSense);
    }
  }, [slot]);

  const getAdStyle = () => {
    switch (format) {
      case 'leaderboard':
        return { width: '728px', height: '90px' };
      case 'banner':
        return { width: '468px', height: '60px' };
      case 'rectangle':
        return { width: '300px', height: '250px' };
      case 'square':
        return { width: '250px', height: '250px' };
      case 'side':
        return { width: '160px', height: '600px' };
      case 'mobile-sticky':
        return { width: '320px', height: '50px' };
      default:
        return responsive ? { width: '100%', height: 'auto' } : { width: '320px', height: '50px' };
    }
  };

  const getAdClasses = () => {
    let classes = `${styles.adSlot} ${className}`;
    
    if (format === 'side') {
      classes += ` ${styles.sideAd} ${styles[position]}`;
    } else if (format === 'mobile-sticky') {
      classes += ` ${styles.mobileSticky}`;
    }
    
    return classes;
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render mobile sticky ads on desktop
  if (format === 'mobile-sticky' && !isMobile) {
    return null;
  }

  // Don't render side ads on mobile
  if (format === 'side' && isMobile) {
    return null;
  }

  // Don't render if closed
  if (!isVisible) {
    return null;
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_ADSENSE_CLIENT_ID;
  if (!clientId) {
    // Don't show placeholder for side ads or mobile sticky if not configured
    if (format === 'side' || format === 'mobile-sticky') {
      return null;
    }

    return (
      <div className={`${styles.adSlot} ${styles.placeholder} ${className}`}>
        <div className={styles.placeholderContent}>
          <span>Advertisement</span>
          <small>Configure Google AdSense to show ads here</small>
        </div>
      </div>
    );
  }

  return (
    <div className={getAdClasses()} ref={adRef}>
      {closeable && format === 'mobile-sticky' && (
        <button 
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Close ad"
        >
          <X size={12} />
        </button>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...getAdStyle() }}
        data-ad-client={clientId}
        data-ad-slot={getAdSlotId(slot)}
        data-ad-format={format === 'side' || format === 'mobile-sticky' ? 'auto' : format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-ad-keywords={keywords.join(', ')}
      />
    </div>
  );
};

export default AdSlot;