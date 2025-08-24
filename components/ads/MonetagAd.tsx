'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getMonetagZone, getMonetagScriptUrl, isMonetagEnabled, type MonetagZoneId } from '@/lib/monetagConfig';
import styles from './AdSlot.module.css';

interface MonetagAdProps {
  zone: MonetagZoneId | string;
  format?: 'banner' | 'rectangle' | 'side' | 'mobile-sticky' | 'leaderboard' | 'popup' | 'push';
  position?: 'left' | 'right';
  closeable?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

const MonetagAd: React.FC<MonetagAdProps> = ({
  zone,
  format = 'banner',
  position = 'right',
  closeable = false,
  className = '',
  width,
  height
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
    if (isLoaded || !adRef.current) return;

    // Initialize Monetag ad
    const initMonetagAd = () => {
      try {
        const adContainer = adRef.current;
        if (!adContainer) return;

        // Clear any existing content
        adContainer.innerHTML = '';

        // Create the ad script element
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        
        // Different script sources based on format
        switch (format) {
          case 'popup':
          case 'push':
            // For popup/push ads, use the main script
            script.src = `//couphaithuph.net/ntfc.php?p=${zone}`;
            break;
          case 'banner':
          case 'rectangle':
          case 'leaderboard':
          default:
            // For display ads, create a banner ad script
            script.innerHTML = `
              (function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.src = '//couphaithuph.net/act/files/ntfc.min.js?p=${zone}';
                script.setAttribute('data-cfasync', 'false');
                document.head.appendChild(script);
              })();
            `;
            break;
        }

        script.setAttribute('data-cfasync', 'false');
        script.onerror = () => {
          console.log('Monetag ad failed to load for zone:', zone);
        };
        script.onload = () => {
          console.log('Monetag ad loaded for zone:', zone);
          setIsLoaded(true);
        };

        if (format === 'popup' || format === 'push') {
          document.head.appendChild(script);
        } else {
          adContainer.appendChild(script);
        }

      } catch (error) {
        console.error('Error loading Monetag ad:', error);
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(initMonetagAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [zone, format]);

  const getAdStyle = () => {
    // If custom dimensions provided, use them
    if (width && height) {
      return { width: `${width}px`, height: `${height}px` };
    }

    // Default dimensions based on format
    switch (format) {
      case 'leaderboard':
        return { width: '728px', height: '90px' };
      case 'banner':
        return { width: '468px', height: '60px' };
      case 'rectangle':
        return { width: '300px', height: '250px' };
      case 'side':
        return { width: '160px', height: '600px' };
      case 'mobile-sticky':
        return { width: '320px', height: '50px' };
      case 'popup':
      case 'push':
        return { display: 'none' }; // These don't need visible containers
      default:
        return { width: '100%', minHeight: '60px' };
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

  // For popup and push ads, render invisible container
  if (format === 'popup' || format === 'push') {
    return <div ref={adRef} style={{ display: 'none' }} data-monetag-zone={zone} />;
  }

  return (
    <div className={getAdClasses()} ref={adRef} data-monetag-zone={zone}>
      {closeable && format === 'mobile-sticky' && (
        <button 
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Close ad"
        >
          <X size={12} />
        </button>
      )}
      <div 
        style={{ 
          ...getAdStyle(), 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          color: '#6c757d',
          fontSize: '14px'
        }}
      >
        {!isLoaded && (
          <span>Loading ad...</span>
        )}
      </div>
    </div>
  );
};

export default MonetagAd;
