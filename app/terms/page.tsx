import React from 'react';
import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | AI Buzz World',
  description:
    'The terms and conditions that govern your use of AI Buzz World, including acceptable use, intellectual property, and disclaimers.',
  alternates: { canonical: 'https://aibuzz.world/terms' },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 15, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of AI Buzz World
        (&quot;the Site&quot;). By using the Site, you agree to these Terms. If you do not agree,
        please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        You may use the Site for lawful, personal, and non-commercial purposes. You agree not to
        misuse the Site, interfere with its operation, attempt to gain unauthorized access, or use
        automated systems to scrape content in a way that burdens our infrastructure.
      </p>

      <h2>Content and Accuracy</h2>
      <p>
        The Site provides information, reviews, and comparisons about AI tools for general
        informational purposes. While we strive for accuracy, content may contain errors or become
        outdated, and some content may be AI-assisted. We make no warranties about the completeness,
        reliability, or accuracy of any information on the Site.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        The Site and its original content, features, and branding are owned by AI Buzz World and are
        protected by applicable intellectual property laws. Product names, logos, and trademarks
        belong to their respective owners and are used for identification purposes only.
      </p>

      <h2>Third-Party Links and Affiliates</h2>
      <p>
        The Site contains links to third-party websites and affiliate offers. We are not responsible
        for the content, products, or practices of any third-party sites. Clicking an affiliate link
        and making a purchase may earn us a commission at no additional cost to you.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
        any kind, whether express or implied. We do not warrant that the Site will be uninterrupted,
        secure, or error-free.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, AI Buzz World shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of, or inability to use, the
        Site or any content or products referenced on it.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may revise these Terms at any time. Continued use of the Site after changes are posted
        constitutes acceptance of the revised Terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about these Terms? Contact us at
        <a href="mailto:guysites1@gmail.com"> guysites1@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
