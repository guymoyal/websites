/** EzoicAds — https://docs.ezoic.com/docs/ezoicads/integration */

import type { EzoicZoneKey } from '@/lib/ezoicZones';
import { getZoneKeyForMonetizationSlot } from '@/lib/ezoicZones';

export type EzoicPlacementsMap = Partial<Record<EzoicZoneKey, number>>;

/**
 * Ezoic is opt-in at **build time** (static export inlines `NEXT_PUBLIC_*`).
 * Wrangler/Worker secrets do not change already-built HTML — rebuild after changing these.
 *
 * Accepts common truthy strings so `True` / `1` from dashboards still works.
 */
export function isEzoicActive(): boolean {
  const raw = process.env.NEXT_PUBLIC_EZOIC_ENABLED?.trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
}

/** Map dashboard placement IDs (JSON keyed by zone) from Ezoic “Step 3” docs. */
function parsePlacements(): EzoicPlacementsMap {
  const raw =
    process.env.NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON?.trim() ||
    '';
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    if (!obj || typeof obj !== 'object') return {};
    const out: EzoicPlacementsMap = {};
    for (const [k, v] of Object.entries(obj)) {
      const num = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : NaN;
      if (!Number.isFinite(num) || num <= 0) continue;
      if (!isZoneKey(k)) continue;
      out[k] = num;
    }
    return out;
  } catch {
    return {};
  }
}

function isZoneKey(k: string): k is EzoicZoneKey {
  return (
    typeof k === 'string' &&
    [
      'homeTop',
      'homeBottom',
      'toolsTop',
      'toolsBottom',
      'categoriesTop',
      'categoriesBottom',
      'blogSidebar',
      'blogListingBottom',
      'articleTop',
      'articleMiddle',
      'articleBottom',
      'toolTop',
      'toolSidebar',
      'toolBottom',
      'sitewideFooter',
    ].includes(k)
  );
}

let cachedPlacements: EzoicPlacementsMap | null = null;
export function getEzoicPlacements(): EzoicPlacementsMap {
  if (!cachedPlacements) cachedPlacements = parsePlacements();
  return cachedPlacements;
}

export function getEzoicPlacementForSlot(slug: string): number | undefined {
  if (!isEzoicActive()) return undefined;
  const zone = getZoneKeyForMonetizationSlot(slug);
  if (!zone) return undefined;
  const id = getEzoicPlacements()[zone];
  return typeof id === 'number' ? id : undefined;
}
