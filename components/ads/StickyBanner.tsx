'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MonetagBanner from './MonetagBanner';

// TypeScript declaration for Monetag
declare global {
  interface Window {
    monetag?: any;
    _ehptpzq?: () => void;
    _mkuvpwm?: () => void;
  }
}

const StickyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    // Remove body padding when banner is closed
    document.body.style.paddingBottom = '0';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '80px'
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '8px 16px'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            zIndex: 1001
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
          }}
          aria-label="Close banner"
        >
          <X size={16} />
        </button>

        {/* Monetag Ad Banner - This will display the actual banner image */}
        <div
          style={{
            minHeight: '60px',
            paddingRight: '40px', // Space for close button
            cursor: 'pointer'
          }}
        >
          <MonetagBanner
            zoneId="9768324"
            width="100%"
            height="60px"
            className="monetag-sticky-banner"
          />
        </div>
      </div>

      {/* Mobile responsive adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="minHeight: '80px'"] {
            min-height: 70px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StickyBanner;
