import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Gift,
  Globe,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { PartnerLanding } from '@/lib/partnerLandings';
import { SmartCtaButton } from './SmartCtaButton';

const DISCLOSURE =
  'Disclosure: this page contains affiliate links. If you sign up or buy through them, aibuzz.world may earn a commission at no extra cost to you.';

const BENEFIT_ICONS = [Zap, Star, ShieldCheck, Gift, TrendingUp, Sparkles];

function screenshotUrl(siteUrl: string) {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(siteUrl)}?w=1280&h=800`;
}

function hostnameOf(siteUrl: string | null) {
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function CampaignLanding({ landing }: { landing: PartnerLanding }) {
  const { program, content } = landing;
  // First-party redirect instead of the raw tracking link: the worker 302s
  // /go/<slug>/ to the tracker, so ad blockers never see the tracker URL here.
  const goHref = `/go/${landing.slug}/`;
  // Funnel split: impulse clicks at the top earn per-click (CPC) when the
  // program has a CPC link; readers who reach the bottom CTA have shown
  // intent, so that one stays per-sale (CPA).
  const heroHref = landing.cpcGotolink ? `/go/${landing.slug}~cpc/` : goHref;
  const headline = content?.headline ?? program.name;
  const subheadline = content?.subheadline ?? program.siteUrl ?? '';
  const ctaLabel = content?.ctaLabel ?? `Visit ${program.name}`;
  const kicker = program.categories[0]?.name ?? 'Partner offer';
  const domain = hostnameOf(program.siteUrl);

  const ctaClass =
    'group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2F7FD8] to-[#1E5FA8] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30';

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-blue-50/70 via-white to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[#2F7FD8]/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-[-6%] h-64 w-64 rounded-full bg-[#FFD700]/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="text-center lg:text-left">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F7FD8]/10 px-3.5 py-1.5 text-sm font-medium text-[#1E5FA8]">
                <Sparkles size={14} aria-hidden />
                {kicker}
              </span>
              {domain ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-500">
                  <Globe size={14} aria-hidden />
                  {domain}
                </span>
              ) : null}
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {headline}
            </h1>
            {subheadline ? (
              <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600 lg:mx-0">{subheadline}</p>
            ) : null}
            <SmartCtaButton href={heroHref} className={ctaClass}>
              {ctaLabel}
              <ArrowUpRight
                size={20}
                aria-hidden
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </SmartCtaButton>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500 lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-[#2F7FD8]" aria-hidden />
                Official partner link
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#2F7FD8]" aria-hidden />
                No extra cost to you
              </span>
            </div>
          </div>

          {/* Site preview in a browser frame */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/10">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                {domain ? (
                  <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-200">
                    {domain}
                  </span>
                ) : null}
              </div>
              {program.siteUrl ? (
                <img
                  src={screenshotUrl(program.siteUrl)}
                  alt={`Preview of the ${program.name} website`}
                  width={1280}
                  height={800}
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-[16/10] w-full bg-slate-100 object-cover object-top"
                />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                  {program.image ? (
                    <img
                      src={program.image}
                      alt={`${program.name} logo`}
                      className="max-h-16 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-300">{program.name}</span>
                  )}
                </div>
              )}
            </div>
            {program.image && program.siteUrl ? (
              <div className="absolute -bottom-5 left-6 rounded-xl bg-white px-5 py-3 shadow-lg ring-1 ring-slate-900/5">
                <img
                  src={program.image}
                  alt={`${program.name} logo`}
                  className="h-9 w-auto max-w-[140px] object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Intro */}
        {content?.intro ? (
          <section className="mx-auto max-w-2xl pt-14">
            <p className="text-lg leading-relaxed text-slate-700">{content.intro}</p>
          </section>
        ) : null}
        {!content && program.description ? (
          <section className="mx-auto max-w-2xl pt-14">
            <div
              className="text-lg leading-relaxed text-slate-700"
              dangerouslySetInnerHTML={{ __html: program.description }}
            />
          </section>
        ) : null}

        {/* Benefits */}
        {content?.benefits?.length ? (
          <section className="pt-16">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900">
              Why {program.name}?
            </h2>
            <p className="mb-10 text-center text-slate-500">
              What makes this offer worth a look
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.benefits.map((b, i) => {
                const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                return (
                  <div
                    key={b.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#2F7FD8]/30 hover:shadow-lg hover:shadow-blue-600/5"
                  >
                    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F7FD8]/10 text-[#1E5FA8] transition group-hover:bg-[#2F7FD8] group-hover:text-white">
                      <Icon size={22} aria-hidden />
                    </span>
                    <h3 className="mb-1.5 font-semibold text-slate-900">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{b.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* How it works */}
        {content?.howItWorks?.length ? (
          <section className="pt-16">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">
              How it works
            </h2>
            <ol className="mx-auto max-w-2xl">
              {content.howItWorks.map((step, i) => (
                <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
                  {i < content.howItWorks.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute left-[19px] top-12 h-[calc(100%-3rem)] w-px bg-slate-200"
                    />
                  ) : null}
                  <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F7FD8] to-[#1E5FA8] font-semibold text-white shadow-md shadow-blue-600/20">
                    {i + 1}
                  </span>
                  <p className="pt-2 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* FAQ — <details> keeps the page free of client JS */}
        {content?.faq?.length ? (
          <section className="pt-16">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">
              Frequently asked questions
            </h2>
            <div className="mx-auto max-w-2xl space-y-3">
              {content.faq.map((f) => (
                <details
                  key={f.question}
                  className="group rounded-xl border border-slate-200 bg-white px-5 py-4 transition open:border-[#2F7FD8]/30 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-[#2F7FD8]/10 group-open:text-[#1E5FA8]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-slate-600">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* Final CTA + disclosure */}
        <section className="py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F7FD8] to-[#1E5FA8] px-6 py-14 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#FFD700]/20 blur-2xl"
            />
            <h2 className="relative mb-3 text-3xl font-bold tracking-tight text-white">
              Ready to try {program.name}?
            </h2>
            <p className="relative mx-auto mb-8 max-w-xl text-blue-100">
              {content?.subheadline ?? `Head over to ${program.name} and see it for yourself.`}
            </p>
            <SmartCtaButton
              href={goHref}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-8 py-4 text-lg font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ffdf33] hover:shadow-xl"
            >
              {ctaLabel}
              <ArrowUpRight
                size={20}
                aria-hidden
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </SmartCtaButton>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-slate-400">
            {DISCLOSURE}
          </p>
        </section>
      </div>
    </main>
  );
}
