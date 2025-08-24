export default {
  async fetch(request: Request, env: { ASSETS: any }): Promise<Response> {
    const url = new URL(request.url);

    // Example API route handled by the Worker. Adjust/remove as needed.
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ name: "Cloudflare" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Serve static files from the bound assets directory
    return env.ASSETS.fetch(request);
  },
};


