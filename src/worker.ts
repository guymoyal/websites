import goLinks from './goLinks.json';

interface WorkerEnv {
  ASSETS: { fetch: typeof fetch };
  /** Optional: ads.txt redirect from Ezoic (Step 2) — https://docs.ezoic.com/docs/ezoicads/adstxt/ */
  EZOIC_ADSTXT_REDIRECT?: string;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    // Affiliate CTA redirect: /go/<slug>/ → 302 to the tracking link.
    // Server-side so ad blockers can't pattern-match the tracker URL in the
    // page; unknown slugs fall through to the static /go/ page (JS fallback).
    const goMatch = url.pathname.match(/^\/go\/([^/]+)\/?$/);
    if (goMatch) {
      const target = (goLinks as Record<string, string>)[decodeURIComponent(goMatch[1])];
      if (target) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: target,
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        });
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ name: 'Cloudflare' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redirectUrl = env.EZOIC_ADSTXT_REDIRECT?.trim();
    if (
      redirectUrl &&
      /^https:\/\/.+/.test(redirectUrl) &&
      (url.pathname === '/ads.txt' || url.pathname === '/ads.txt/')
    ) {
      return Response.redirect(redirectUrl, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
