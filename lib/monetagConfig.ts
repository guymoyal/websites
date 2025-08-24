// Monetag Ad Configuration
// Your Monetag zone IDs from your account

export const MONETAG_ZONES = {
  // Main zone from your script
  'primary': '9764468',
  'secondary': '9764467',
  
  // Different ad formats (you can get these from your Monetag dashboard)
  'banner-top': '9764468',
  'banner-bottom': '9764467',
  'sidebar-left': '9764468',
  'sidebar-right': '9764467',
  'popup': '9764468',
  'push-notification': '9764467',
  'interstitial': '9764468',
  
  // Page-specific zones
  'homepage-banner': '9764468',
  'tools-banner': '9764467',
  'blog-banner': '9764468',
  'article-banner': '9764467',
  
  // Mobile specific
  'mobile-banner': '9764468',
  'mobile-sticky': '9764467',
} as const;

export type MonetagZoneId = keyof typeof MONETAG_ZONES;

export const getMonetagZone = (zoneId: MonetagZoneId): string => {
  return MONETAG_ZONES[zoneId] || MONETAG_ZONES.primary;
};

// Service Worker Configuration
export const MONETAG_SERVICE_WORKER_URL = '/sw.js';

// Push Notification Configuration
export const MONETAG_PUSH_CONFIG = {
  applicationServerKey: null, // Will be provided by Monetag
  userVisibleOnly: true,
};

export const MONETAG_DOMAINS = [
  'couphaithuph.net',
  'monetag.com',
];

// Helper function to check if Monetag is enabled
export const isMonetagEnabled = (): boolean => {
  return process.env.NODE_ENV === 'production' || 
         process.env.NEXT_PUBLIC_ENABLE_MONETAG === 'true';
};

// Helper function to get the script URL
export const getMonetagScriptUrl = (zone: string): string => {
  return `//couphaithuph.net/ntfc.php?p=${zone}`;
};

// Helper function to get the push notification script URL
export const getMonetagPushScriptUrl = (zone: string): string => {
  return `//couphaithuph.net/act/files/ntfc.min.js?p=${zone}`;
};
