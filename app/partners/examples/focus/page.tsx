import type { Metadata } from 'next';
import { LandingFocus } from '@/components/landings/LandingFocus';

export const metadata: Metadata = {
  title: 'Landing template: Focus',
  description: 'Minimal text-first partner landing layout (example).',
  robots: { index: false, follow: false },
};

export default function PartnersExampleFocusPage() {
  return (
    <LandingFocus
      kicker="Example"
      title="Straightforward offer page that paints fast"
      subtitle="Single column, system font stack, no client JavaScript. Swap copy and CTA when you wire Admitad entries."
      ctaHref="https://example.com"
      ctaLabel="Continue to partner"
      disclosure="If you use affiliate links, add a clear disclosure here. This URL is a placeholder."
    />
  );
}
