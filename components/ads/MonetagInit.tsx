'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/serviceWorker';
import { isMonetagEnabled } from '@/lib/monetagConfig';

const MonetagInit: React.FC = () => {
  useEffect(() => {
    // Only initialize in browser and if Monetag is enabled
    if (typeof window === 'undefined' || !isMonetagEnabled()) {
      return;
    }

    // Initialize Monetag service worker for push notifications
    const initServiceWorker = async () => {
      try {
        const success = await registerServiceWorker();
        if (success) {
          console.log('Monetag service worker initialized successfully');
          
          // Global callback functions for Monetag
          window._lvtopv = function() { 
            console.log('Monetag push notification error'); 
          };
          
          window._lytby = function() { 
            console.log('Monetag push notification ready'); 
          };

        } else {
          console.log('Failed to initialize Monetag service worker');
        }
      } catch (error) {
        console.error('Error initializing Monetag:', error);
      }
    };

    // Delay initialization to not block initial page load
    const timer = setTimeout(initServiceWorker, 2000);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
};

// Extend the Window interface to include Monetag global functions
declare global {
  interface Window {
    _lvtopv?: () => void;
    _lytby?: () => void;
  }
}

export default MonetagInit;
