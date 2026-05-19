interface WorkerEnv {
  ASSETS: { fetch: typeof fetch };
  /** Optional: ads.txt redirect from Ezoic (Step 2) — https://docs.ezoic.com/docs/ezoicads/adstxt/ */
  EZOIC_ADSTXT_REDIRECT?: string;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

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
