import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPartnerLandingBySlug, getPartnerLandings } from '@/lib/partnerLandings';

// First-party redirect for partner tracking links. Ad-block filter lists hide
// anchors that point directly at known affiliate domains (EasyList has a rule
// for tatrck.com), so CTAs link here and this page forwards to the tracker.
export const dynamicParams = false;

const PLACEHOLDER_SLUG = 'partner-offers-coming-soon';

export function generateStaticParams() {
  const landings = getPartnerLandings();
  if (landings.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return landings.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const landing = getPartnerLandingBySlug(params.slug);
  return {
    title: landing ? `Redirecting to ${landing.program.name}…` : 'Redirecting…',
    robots: { index: false, follow: false },
  };
}

export default function GoRedirectPage({ params }: { params: { slug: string } }) {
  if (params.slug === PLACEHOLDER_SLUG) notFound();
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) notFound();

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(landing.gotolink)});`,
        }}
      />
      <p className="text-gray-600">
        Taking you to <strong>{landing.program.name}</strong>…
      </p>
      <a
        href={landing.gotolink}
        rel="sponsored nofollow noopener noreferrer"
        className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
      >
        Continue to {landing.program.name}
      </a>
    </main>
  );
}
