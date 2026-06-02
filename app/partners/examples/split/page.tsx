import type { Metadata } from 'next';
import { LandingSplit } from '@/components/landings/LandingSplit';

export const metadata: Metadata = {
  title: 'Landing template: Split',
  description: 'Hero + copy split partner landing layout (example).',
  robots: { index: false, follow: false },
};

export default function PartnersExampleSplitPage() {
  return (
    <LandingSplit
      kicker="Example"
      title="Split layout for when a visual carries the story"
      subtitle="Responsive grid: stacked on small screens, side-by-side from md. Hero uses explicit width and height to reduce CLS."
      ctaHref="https://example.com"
      ctaLabel="View offer"
      disclosure="Replace imageSrc with your generated or brand-safe hero. This page is noindex for demos only."
      imageSrc="/images/hero-placeholder.jpg"
      imageAlt="Decorative gradient placeholder hero"
      imagePriority
    />
  );
}
