import goLinks from './goLinks.json';
import prunedSlugs from './prunedSlugs.json';

const prunedSet = new Set(prunedSlugs as string[]);

interface WorkerEnv {
  ASSETS: { fetch: typeof fetch };
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

    // De-indexed merchant pages: return 410 Gone (not soft-404) so search engines
    // drop the ~3,400 pruned partner landing pages cleanly.
    const slugMatch = url.pathname.match(/^\/([^/]+)\/?$/);
    if (slugMatch && prunedSet.has(decodeURIComponent(slugMatch[1]))) {
      return new Response('Gone', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ name: 'Cloudflare' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // /ads.txt is served from the static public/ads.txt (AdSense authorized sellers).
    return env.ASSETS.fetch(request);
  },
};
