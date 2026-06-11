import type { PartnerLanding } from '@/lib/partnerLandings';

const DISCLOSURE =
  'Disclosure: this page contains affiliate links. If you sign up or buy through them, aibuzz.world may earn a commission at no extra cost to you.';

function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
    >
      {label}
    </a>
  );
}

export function CampaignLanding({ landing }: { landing: PartnerLanding }) {
  const { program, content, gotolink } = landing;
  const headline = content?.headline ?? program.name;
  const subheadline = content?.subheadline ?? program.siteUrl ?? '';
  const ctaLabel = content?.ctaLabel ?? `Visit ${program.name}`;
  const kicker = program.categories[0]?.name ?? 'Partner offer';

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <section className="text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
          {kicker}
        </span>
        {program.image ? (
          <img
            src={program.image}
            alt={`${program.name} logo`}
            className="mx-auto mb-6 h-20 w-auto object-contain"
            fetchPriority="high"
          />
        ) : null}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{headline}</h1>
        {subheadline ? <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">{subheadline}</p> : null}
        <CtaButton href={gotolink} label={ctaLabel} />
        {content?.intro ? <p className="mx-auto mt-10 max-w-2xl text-left text-gray-700">{content.intro}</p> : null}
        {!content && program.description ? (
          <div
            className="mx-auto mt-10 max-w-2xl text-left text-gray-700"
            dangerouslySetInnerHTML={{ __html: program.description }}
          />
        ) : null}
      </section>

      {/* Benefits */}
      {content?.benefits?.length ? (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Why {program.name}?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* How it works */}
      {content?.howItWorks?.length ? (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">How it works</h2>
          <ol className="mx-auto max-w-2xl space-y-4">
            {content.howItWorks.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-gray-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* FAQ — <details> keeps the page free of client JS */}
      {content?.faq?.length ? (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {content.faq.map((f) => (
              <details key={f.question} className="group rounded-xl border border-gray-200 bg-white p-5">
                <summary className="cursor-pointer font-medium text-gray-900 marker:content-none">
                  {f.question}
                </summary>
                <p className="mt-3 text-gray-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Final CTA + disclosure */}
      <section className="mt-16 text-center">
        <CtaButton href={gotolink} label={ctaLabel} />
        <p className="mx-auto mt-8 max-w-2xl text-xs text-gray-400">{DISCLOSURE}</p>
      </section>
    </main>
  );
}
