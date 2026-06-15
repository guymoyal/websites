import React from 'react';
import Link from 'next/link';

// Static custom 404. Having a static app not-found also ensures `next build`
// (output: export) emits app/_not-found.html and uses the copy-to-404 path,
// avoiding the moveExportedPage("/_error") branch that needs pages-manifest.json.
export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '5rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: '#2F7FD8' }}>404</p>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.75rem 0', color: '#111827' }}>
        Page not found
      </h1>
      <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '2rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved. Explore our AI tools and
        guides instead.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/"
          style={{
            background: '#2F7FD8',
            color: '#fff',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
        <Link
          href="/tools"
          style={{
            border: '1px solid #2F7FD8',
            color: '#2F7FD8',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Browse AI tools
        </Link>
      </div>
    </div>
  );
}
