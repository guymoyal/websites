import type { Metadata } from 'next';
import Link from 'next/link';
import { getPartnerLandings } from '@/lib/partnerLandings';

export const metadata: Metadata = {
  title: 'Partner offers — aibuzz.world',
  description: 'Hand-picked partner deals and tools we recommend.',
};

export default function PartnersIndexPage() {
  const landings = getPartnerLandings();
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Partner offers</h1>
      <p className="mb-10 text-gray-600">
        Tools and services from our partners. Pages may contain affiliate links.
      </p>
      {landings.length === 0 ? (
        <p className="text-gray-500">No partner offers are live yet — check back soon.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {landings.map((l) => (
            <li key={l.slug} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Link href={`/${l.slug}/`} className="block">
                {l.program.image ? (
                  <img src={l.program.image} alt="" className="mb-4 h-10 w-auto object-contain" />
                ) : null}
                <h2 className="font-semibold text-gray-900">{l.content?.headline ?? l.program.name}</h2>
                {l.content?.subheadline ? (
                  <p className="mt-1 text-sm text-gray-600">{l.content.subheadline}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
