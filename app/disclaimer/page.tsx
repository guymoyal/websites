import React from 'react';
import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Disclaimer | AI Buzz World',
  description:
    'Affiliate, advertising, and informational disclaimers for AI Buzz World, including how we earn commissions and the limits of our content.',
  alternates: { canonical: 'https://aibuzz.world/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" updated="June 15, 2026">
      <p>
        The information provided by AI Buzz World (&quot;the Site&quot;) is for general
        informational purposes only. All information is provided in good faith; however, we make no
        representation or warranty of any kind regarding the accuracy, adequacy, validity,
        reliability, or completeness of any information on the Site.
      </p>

      <h2>Affiliate Disclosure</h2>
      <p>
        The Site participates in affiliate programs. This means we may earn a commission when you
        click certain links and make a purchase, at no additional cost to you. We only recommend
        products and services we believe may be useful to our readers, and affiliate relationships
        do not influence our editorial opinions.
      </p>

      <h2>Advertising Disclosure</h2>
      <p>
        The Site displays advertising served by third-party ad networks. These ads help keep our
        content free. We do not control the specific advertisements shown and are not responsible
        for the products or services they promote.
      </p>

      <h2>No Professional Advice</h2>
      <p>
        Content on the Site does not constitute professional, legal, financial, or technical advice.
        You should not rely on the Site as a substitute for advice from a qualified professional.
        Always do your own research before making decisions based on information found here.
      </p>

      <h2>External Links</h2>
      <p>
        The Site may contain links to external websites that are not provided or maintained by us.
        We do not guarantee the accuracy, relevance, or completeness of any information on these
        external sites.
      </p>

      <h2>Use at Your Own Risk</h2>
      <p>
        Your use of the Site and your reliance on any information is solely at your own risk. We are
        not liable for any losses or damages in connection with the use of the Site.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about this Disclaimer? Contact us at
        <a href="mailto:guysites1@gmail.com"> guysites1@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
