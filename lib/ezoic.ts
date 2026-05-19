/** EzoicAds — https://docs.ezoic.com/docs/ezoicads/integration */

import type { EzoicZoneKey } from '@/lib/ezoicZones';
import { getZoneKeyForMonetizationSlot } from '@/lib/ezoicZones';

export type EzoicPlacementsMap = Partial<Record<EzoicZoneKey, number>>;

/**
 * Production builds (`next build`, `NODE_ENV === 'production'`): Ezoic is **on by default**
 * so shipped HTML always includes scripts + runner (ads are not accidentally left off).
 *
 * Opt out of Ezoic in a production build: `NEXT_PUBLIC_EZOIC_DISABLED=true`
 *
 * Local dev (`next dev`): Ezoic stays **opt-in** via `NEXT_PUBLIC_EZOIC_ENABLED=true` (or 1 / yes).
 *
 * Placement IDs still come from `NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON` at build time.
 */
export function isEzoicActive(): boolean {
  const disabled = process.env.NEXT_PUBLIC_EZOIC_DISABLED?.trim().toLowerCase();
  if (disabled === 'true' || disabled === '1' || disabled === 'yes') {
    return false;
  }

  if (process.env.NODE_ENV === 'production') {
    return true;
  }

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
