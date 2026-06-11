import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/landings/CampaignLanding';
import type { PartnerLanding } from '@/lib/partnerLandings';

export const metadata: Metadata = {
  title: 'Landing template: Campaign',
  description: 'Full campaign landing layout (example).',
  robots: { index: false, follow: false },
};

const SAMPLE: PartnerLanding = {
  slug: 'example-campaign',
  path: '/example-campaign',
  gotolink: 'https://example.com',
  cpcGotolink: null,
  program: {
    name: 'Example AI Suite',
    description: null,
    siteUrl: 'https://example.com',
    image: null,
    categories: [{ id: 1, name: 'AI tools' }],
  },
  content: {
    headline: 'Ship work twice as fast with Example AI Suite',
    subheadline: 'One workspace for writing, research, and automation — powered by AI.',
    intro:
      'Example AI Suite bundles a writing assistant, a research copilot, and workflow automation into one subscription. This sample copy shows how generated content renders.',
    benefits: [
      { title: 'All-in-one workspace', description: 'Writing, research, and automation without switching tabs.' },
      { title: 'Team-ready', description: 'Shared prompts, templates, and usage controls for teams.' },
      { title: 'Private by default', description: 'Your data is never used to train third-party models.' },
      { title: 'Generous free tier', description: 'Try every core feature before paying anything.' },
    ],
    howItWorks: ['Create a free account', 'Connect your docs and tools', 'Automate your first workflow'],
    faq: [
      { question: 'Is there a free plan?', answer: 'Yes, the core features are free forever.' },
      { question: 'Can I cancel anytime?', answer: 'Yes, subscriptions are monthly with no lock-in.' },
      { question: 'Does it work in my language?', answer: 'It supports 30+ languages including English.' },
    ],
    ctaLabel: 'Try Example AI Suite',
    metaTitle: 'Example AI Suite review',
    metaDescription: 'Sample landing page.',
  },
};

export default function PartnersExampleCampaignPage() {
  return <CampaignLanding landing={SAMPLE} />;
}
