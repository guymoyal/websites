import fs from 'fs';
import path from 'path';

export type AffiliateItem = {
  href: string;
  title: string;
  subtitle?: string;
  cta?: string;
};

export type SponsorConfig = {
  label: string;
  imageUrl: string;
  href: string;
  headline?: string;
};

export function getSponsorConfig(): SponsorConfig | null {
  const imageUrl =
    process.env.NEXT_PUBLIC_SPONSOR_IMAGE_URL?.trim() ||
    process.env.SPONSOR_IMAGE_URL?.trim() ||
    '';
  const href =
    process.env.NEXT_PUBLIC_SPONSOR_LINK?.trim() ||
    process.env.SPONSOR_LINK?.trim() ||
    '';
  if (!imageUrl || !href) return null;
  return {
    label: (
      process.env.NEXT_PUBLIC_SPONSOR_LABEL?.trim() ||
      'Featured partner'
    ).trim(),
    imageUrl,
    href,
    headline: process.env.NEXT_PUBLIC_SPONSOR_HEADLINE?.trim() || undefined,
  };
}

function parseAffiliates(): AffiliateItem[] {
  const raw =
    process.env.NEXT_PUBLIC_AFFILIATES_JSON?.trim() ||
    process.env.AFFILIATES_JSON?.trim() ||
    '';
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is AffiliateItem =>
        Boolean(
          x &&
          typeof x === 'object' &&
          typeof (x as AffiliateItem).href === 'string' &&
          typeof (x as AffiliateItem).title === 'string' &&
          (x as AffiliateItem).href.startsWith('http')
        )
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

function loadAffiliatePicksFromContent(): AffiliateItem[] {
  try {
    const filePath = path.join(process.cwd(), 'content', 'affiliate-picks.json');
    if (!fs.existsSync(filePath)) return [];
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is AffiliateItem =>
        Boolean(
          x &&
            typeof x === 'object' &&
            typeof (x as AffiliateItem).href === 'string' &&
            typeof (x as AffiliateItem).title === 'string' &&
            (x as AffiliateItem).href.startsWith('http')
        )
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

/** Env `NEXT_PUBLIC_AFFILIATES_JSON` overrides `content/affiliate-picks.json`. */
export function getAffiliateItems(): AffiliateItem[] {
  const fromEnv = parseAffiliates();
  if (fromEnv.length > 0) return fromEnv;
  return loadAffiliatePicksFromContent();
}
