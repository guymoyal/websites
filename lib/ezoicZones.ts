/**
 * Zones match keys in NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON.
 * Slot names match the Monetization_* components’ `slot` prop strings.
 */

export type EzoicZoneKey =
  | 'homeTop'
  | 'homeBottom'
  | 'toolsTop'
  | 'toolsBottom'
  | 'categoriesTop'
  | 'categoriesBottom'
  | 'blogSidebar'
  | 'blogListingBottom'
  | 'articleTop'
  | 'articleMiddle'
  | 'articleBottom'
  | 'toolTop'
  | 'toolSidebar'
  | 'toolBottom'
  /** One slot in global Footer — every route (about, category, etc.) */
  | 'sitewideFooter';

const SLOT_TO_ZONE: Record<string, EzoicZoneKey> = {
  'homepage-banner': 'homeTop',
  'homepage-bottom': 'homeBottom',
  'tools-top': 'toolsTop',
  'tools-bottom': 'toolsBottom',
  'categories-top': 'categoriesTop',
  'categories-bottom': 'categoriesBottom',
  'blog-sidebar': 'blogSidebar',
  'blog-bottom': 'blogListingBottom',
  'article-top': 'articleTop',
  'article-middle': 'articleMiddle',
  'article-bottom': 'articleBottom',
  'tool-top': 'toolTop',
  'tool-sidebar': 'toolSidebar',
  'tool-bottom': 'toolBottom',
  'sitewide-footer': 'sitewideFooter',
};

export function getZoneKeyForMonetizationSlot(slug: string): EzoicZoneKey | undefined {
  return SLOT_TO_ZONE[slug];
}
