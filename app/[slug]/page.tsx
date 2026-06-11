import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignLanding } from '@/components/landings/CampaignLanding';
import { getPartnerLandingBySlug, getPartnerLandings } from '@/lib/partnerLandings';

// Static export: only slugs from generateStaticParams are built; anything else
// 404s at the host. (No `dynamicParams = false` — it trips a Next 14 dev-mode
// bug with output:'export' that 500s every page; export behavior is the same.)

// Next 14 + output:'export' rejects an empty generateStaticParams result, so a
// placeholder page is emitted until the first approved program produces real slugs.
const PLACEHOLDER_SLUG = 'partner-offers-coming-soon';

export async function generateStaticParams() {
  const landings = getPartnerLandings();
  if (landings.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return landings.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  if (params.slug === PLACEHOLDER_SLUG) {
    return {
      title: 'Partner offers coming soon — aibuzz.world',
      robots: { index: false, follow: false },
    };
  }
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) return {};
  return {
    title: landing.content?.metaTitle ?? `${landing.program.name} — aibuzz.world`,
    description:
      landing.content?.metaDescription ?? landing.content?.subheadline ?? landing.program.name,
    alternates: {
      canonical: `https://aibuzz.world/${params.slug}`,
    },
  };
}

export default function PartnerCampaignPage({ params }: { params: { slug: string } }) {
  if (params.slug === PLACEHOLDER_SLUG) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Partner offers coming soon</h1>
        <p className="text-gray-600">
          We are preparing hand-picked partner deals. Check back shortly.
        </p>
      </main>
    );
  }
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) notFound();

  const faq = landing.content?.faq ?? [];
  const faqJsonLd =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <CampaignLanding landing={landing} />
    </>
  );
}
