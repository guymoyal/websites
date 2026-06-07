# Monetization quickstart (AI Buzz World)

**Goal:** Turn growing traffic into revenue with the least setup. This site already has ad slots wired in code.

## Easiest path: Ezoic (recommended)

Ezoic is already integrated (`components/ads/EzoicHead`, `EzoicRunner`, homepage/tool/blog placeholders). You do **not** need to paste ad code into every page.

### Checklist

1. **Sign up** at [Ezoic](https://pubdash.ezoic.com/) and add **aibuzztools.com**.
2. **ads.txt** — follow [Ezoic ads.txt](https://docs.ezoic.com/docs/ezoicads/adstxt/). For Cloudflare Workers, set `EZOIC_ADSTXT_REDIRECT` in Wrangler (see `docs/ezoic-troubleshooting.md`).
3. **Placement IDs** — in the Ezoic dashboard, create placements and copy numeric IDs into `.env.local`:

```bash
NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON={"homeTop":YOUR_ID,"homeBottom":YOUR_ID,"sitewideFooter":YOUR_ID,"toolsTop":YOUR_ID,"toolsBottom":YOUR_ID,"blogSidebar":YOUR_ID,"articleTop":YOUR_ID,"articleBottom":YOUR_ID}
```

Keys are defined in `lib/ezoicZones.ts`. At minimum set **`homeTop`**, **`homeBottom`**, and **`sitewideFooter`**.

4. **Production build** — Ezoic scripts are **on by default** when you run `pnpm build` / deploy. To disable: `NEXT_PUBLIC_EZOIC_DISABLED=true`.
5. **Local preview** — `NEXT_PUBLIC_EZOIC_ENABLED=true` in `.env.local`, then `pnpm dev`.
6. **Redeploy** after changing placement JSON (values are inlined at build time).

Troubleshooting: `docs/ezoic-troubleshooting.md`.

## Optional: direct sponsor banner

No network required — one negotiated partner:

```bash
NEXT_PUBLIC_SPONSOR_LABEL=Featured partner
NEXT_PUBLIC_SPONSOR_IMAGE_URL=https://your-cdn/banner.png
NEXT_PUBLIC_SPONSOR_LINK=https://partner.com/?utm_source=aibuzz
```

Renders via `SponsorBanner` ahead of programmatic ads on supported slots.

## Optional: affiliate tool strip

**Default:** `content/affiliate-picks.json` (ChatGPT, Claude, Gemini, etc.) renders on homepage, category, about, and tools when you have not set env overrides.

**Override** with your own tracked links:

```bash
NEXT_PUBLIC_AFFILIATES_JSON=[{"href":"https://example.com/?ref=x","title":"Tool name","subtitle":"One line","cta":"Try it"}]
```

See `.env.local.example`.

Verify setup before deploy:

```bash
pnpm monetization:check
```

Content + copy in one step (needs `DEEPSEEK_API_KEY`):

```bash
pnpm pm:growth
# optional: ARTICLES_TO_GENERATE=5 pnpm pm:growth
```

## What we do **not** recommend for “easy”

- **Admitad mass landers** — poor fit for bulk automated pages; program/link APIs are heavy.
- **1000 thin affiliate pages** — policy and SEO risk; prefer quality tool pages + blog.

## Measure results

Set **`NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`** (GA4) and watch:

- RPM / earnings in Ezoic dashboard  
- Pages per session and bounce on ad-heavy templates  
- Core Web Vitals (avoid stacking too many above-the-fold ads)

## PM priority order

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | Ezoic live with 3+ placements | Low (config + deploy) |
| 2 | GA4 confirmed | Low |
| 3 | Sponsor or affiliate strip if you have partners | Low |
| 4 | More editorial content (`pnpm generate:content`) | Medium |
| 5 | A/B ad density via Ezoic dashboard | Low |
