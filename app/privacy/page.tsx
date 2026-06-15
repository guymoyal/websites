import React from 'react';
import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | AI Buzz World',
  description:
    'How AI Buzz World collects, uses, and protects your information, including cookies, analytics, advertising, and affiliate links.',
  alternates: { canonical: 'https://aibuzz.world/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 15, 2026">
      <p>
        This Privacy Policy explains how AI Buzz World (&quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;) collects, uses, and safeguards information when you visit
        <a href="https://aibuzz.world"> aibuzz.world</a> (the &quot;Site&quot;). By using the
        Site, you agree to the practices described below.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We do not require you to create an account or submit personal information to browse the
        Site. We automatically collect limited, non-identifying technical data such as your browser
        type, device information, referring pages, and general usage patterns through analytics
        tools. If you contact us by email, we receive the information you choose to share.
      </p>

      <h2>Cookies and Similar Technologies</h2>
      <p>
        We and our third-party partners use cookies and similar technologies to operate the Site,
        remember preferences, measure traffic, and deliver and personalize advertising. You can
        control or disable cookies through your browser settings; some features may not work as
        intended if cookies are disabled.
      </p>

      <h2>Analytics</h2>
      <p>
        We use analytics services (such as Google Analytics) to understand how visitors use the
        Site. These services may set cookies and collect aggregated usage data. We use this data to
        improve our content and user experience.
      </p>

      <h2>Advertising</h2>
      <p>
        The Site is supported by advertising. Third-party vendors, including Google and other ad
        partners, may use cookies to serve ads based on your prior visits to this and other
        websites. You can learn about your choices and opt out of personalized advertising by
        visiting your ad provider&apos;s settings and industry opt-out pages.
      </p>

      <h2>Affiliate Links</h2>
      <p>
        Some links on the Site are affiliate links. If you click an affiliate link and make a
        purchase, we may earn a commission at no additional cost to you. These relationships do not
        influence our editorial recommendations.
      </p>

      <h2>How We Use Information</h2>
      <ul>
        <li>To operate, maintain, and improve the Site and its content.</li>
        <li>To measure and analyze traffic and engagement.</li>
        <li>To display relevant advertising and affiliate offers.</li>
        <li>To respond to inquiries you send us.</li>
      </ul>

      <h2>Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, or delete personal
        information we hold about you, or to object to certain processing. To make a request,
        contact us using the details below.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        The Site is not directed to children under 13, and we do not knowingly collect personal
        information from children.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes are effective when posted on
        this page with an updated revision date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, contact us at
        <a href="mailto:guysites1@gmail.com"> guysites1@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
