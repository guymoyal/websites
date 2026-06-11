import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignLanding } from '@/components/landings/CampaignLanding';
import { getPartnerLandingBySlug, getPartnerLandings } from '@/lib/partnerLandings';

// Static export: only slugs from generateStaticParams are built; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPartnerLandings().map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) return {};
  return {
    title: landing.content?.metaTitle ?? `${landing.program.name} — aibuzz.world`,
    description:
      landing.content?.metaDescription ?? landing.content?.subheadline ?? landing.program.name,
  };
}

export default function PartnerCampaignPage({ params }: { params: { slug: string } }) {
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) notFound();
  return <CampaignLanding landing={landing} />;
}
