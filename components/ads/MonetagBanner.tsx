'use client';

import React, { useEffect, useRef } from 'react';

interface MonetagBannerProps {
  zoneId: string;
  width?: string;
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    monetag?: any;
  }
}

const MonetagBanner: React.FC<MonetagBannerProps> = ({ 
  zoneId, 
  width = '100%', 
  height = '60px',
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const loadMonetagScript = () => {
      if (scriptLoadedRef.current || !containerRef.current) return;

      try {
        const adContainer = containerRef.current;

        // Create a container for the ad
        const adDiv = document.createElement('div');
        adDiv.id = `monetag-${zoneId}`;
        adDiv.style.width = width;
        adDiv.style.height = height;
        adDiv.style.minHeight = height;
        adDiv.style.position = 'relative';
        adDiv.style.overflow = 'hidden';
        adDiv.style.background = 'transparent';

        // Clear and append
        adContainer.innerHTML = '';
        adContainer.appendChild(adDiv);

        // Create script tag with zone
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = `//madurird.com/tag.min.js`;
        script.setAttribute('data-zone', zoneId);

        script.onload = () => {
          console.log(`🟢 Monetag script loaded for zone ${zoneId}`);
          scriptLoadedRef.current = true;
          // Script loaded - banner is ready for clicks, but no auto-triggering
        };

        script.onerror = () => {
          console.log(`🔴 Monetag script failed for zone ${zoneId}`);
        };

        // Append to head
        document.head.appendChild(script);

      } catch (error) {
        console.error('Error loading Monetag script:', error);
      }
    };

    // Load script after component mounts
    const timer = setTimeout(loadMonetagScript, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [zoneId, width, height]);

  return (
    <>
      <style jsx>{`
        .monetag-ad-container {
          width: ${width};
          height: ${height};
          min-height: ${height};
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .monetag-ad-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .monetag-ad-container iframe {
          max-width: 100%;
          max-height: 100%;
          border: none;
        }
        .monetag-ad-container * {
          box-sizing: border-box;
        }
      `}</style>
      <div
        ref={containerRef}
        className={`monetag-ad-container ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`🟢 Monetag banner clicked - Zone: ${zoneId}`);
          
          // Only trigger if we actually have Monetag available
          if (window.monetag && typeof window.monetag.trigger === 'function') {
            try {
              window.monetag.trigger(zoneId);
              console.log(`✅ Monetag triggered for zone: ${zoneId}`);
              return; // Exit early if Monetag worked
            } catch (e) {
              console.log('Monetag trigger error:', e);
            }
          }
          
          // Try native Monetag functions only if main trigger failed
          if (typeof window._ehptpzq === 'function') {
            try {
              window._ehptpzq();
              console.log(`✅ Monetag _ehptpzq triggered`);
              return;
            } catch (e) {
              console.log('_ehptpzq error:', e);
            }
          }
          
          if (typeof window._mkuvpwm === 'function') {
            try {
              window._mkuvpwm();
              console.log(`✅ Monetag _mkuvpwm triggered`);
              return;
            } catch (e) {
              console.log('_mkuvpwm error:', e);
            }
          }
          
          console.log('⚠️ No Monetag functions available');
        }}
      >
        {/* This will be replaced by Monetag ad content */}
      </div>
    </>
  );
};

export default MonetagBanner;
