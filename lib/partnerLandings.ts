import fs from 'fs';
import path from 'path';

export interface PartnerLandingContent {
  headline: string;
  subheadline: string;
  intro: string;
  benefits: Array<{ title: string; description: string }>;
  howItWorks: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaLabel: string;
  metaTitle: string;
  metaDescription: string;
  language?: string;
  generatedAt?: string;
}

export interface PartnerLanding {
  slug: string;
  path: string;
  gotolink: string;
  /** Optional per-click (CPC) link variant — used by the hero CTA when set. */
  cpcGotolink: string | null;
  program: {
    name: string;
    description: string | null;
    siteUrl: string | null;
    image: string | null;
    categories: Array<{ id: number; name: string }>;
  };
  content: PartnerLandingContent | null;
}

const DATA_FILE = path.join(process.cwd(), 'content', 'admitad-landings.json');
const ALLOWLIST_FILE = path.join(process.cwd(), 'content', 'relevant-slugs.json');

function loadAllowlist(): Set<string> | null {
  try {
    const slugs = JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf8')) as string[];
    return Array.isArray(slugs) && slugs.length ? new Set(slugs) : null;
  } catch {
    return null; // no allowlist yet → behave as before (all entries)
  }
}

/** Entries that can become live pages: approved programs with a tracking link. */
export function getPartnerLandings(): PartnerLanding[] {
  let payload: any;
  try {
    payload = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
  const entries: any[] = Array.isArray(payload?.entries) ? payload.entries : [];
  const allow = loadAllowlist();
  return entries
    .filter((e) => e?.admitad?.gotolink && e?.slug && (!allow || allow.has(e.slug)))
    .map((e) => ({
      slug: e.slug,
      path: e.path,
      gotolink: e.admitad.gotolink,
      cpcGotolink: e.admitad.cpcGotolink ?? null,
      program: {
        name: e.program?.name ?? e.slug,
        description: e.program?.description ?? null,
        siteUrl: e.program?.siteUrl ?? null,
        image: e.program?.image ?? null,
        categories: e.program?.categories ?? [],
      },
      content: e.content ?? null,
    }))
    .sort((a, b) => a.program.name.localeCompare(b.program.name));
}

export function getPartnerLandingBySlug(slug: string): PartnerLanding | undefined {
  return getPartnerLandings().find((e) => e.slug === slug);
}
