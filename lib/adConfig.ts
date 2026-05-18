// Google AdSense Ad Unit Configuration
// Replace these with your actual AdSense ad unit slot IDs after approval

export const AD_SLOTS = {
  // Homepage ads
  'homepage-banner': '1234567890',
  'homepage-bottom': '1234567915',
  
  // Tools page ads
  'tools-top': '1234567916',
  'tools-bottom': '1234567891',
  'tool-top': '1234567892',
  'tool-sidebar': '1234567893', 
  'tool-bottom': '1234567894',
  
  // Search-specific side ads
  'tools-search-left': '1234567895',
  'tools-search-right': '1234567896',
  'category-search-left': '1234567913',
  'category-search-right': '1234567914',
  
  // Blog ads
  'blog-sidebar': '1234567897',
  'blog-bottom': '1234567898',
  'article-top': '1234567899',
  'article-middle': '1234567900',
  'article-bottom': '1234567901',
  
  // Category ads
  'category-top': '1234567902',
  'category-bottom': '1234567903',
  'categories-top': '1234567904',
  'categories-bottom': '1234567905',
  
  // Other pages
  'about-top': '1234567906',
  'about-bottom': '1234567907',
  'submit-top': '1234567908',
  'submit-bottom': '1234567909',
  
  // Side ads for desktop
  'sidebar-left': '1234567910',
  'sidebar-right': '1234567911',
  
  // Mobile sticky ad
  'mobile-sticky-bottom': '1234567912',
} as const;

export type AdSlotId = keyof typeof AD_SLOTS;

export function getAdSlotId(slotName: string): string {
  return AD_SLOTS[slotName as AdSlotId] || slotName;
}

// Check if AdSense is properly configured
export function isAdSenseConfigured(): boolean {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_ADSENSE_CLIENT_ID;
  return Boolean(clientId && clientId !== 'ca-pub-2858012859068424'); // not the placeholder
}
