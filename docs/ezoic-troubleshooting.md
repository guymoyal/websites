# Ezoic: no ads showing

## 0. Production vs local

- **Production** (`yarn build`, CI, `yarn deploy:cloudflare`): Ezoic header scripts + runner are **on by default** (`lib/ezoic.ts`). Opt out with **`NEXT_PUBLIC_EZOIC_DISABLED=true`** in the build env.
- **Local dev** (`yarn dev`): Ezoic is **off** unless **`NEXT_PUBLIC_EZOIC_ENABLED=true`**.

## 1. Placement IDs must be real (most common)

Values in **`NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON`** must be the **numeric placement IDs** from your Ezoic account, not example numbers.

1. Open [Ezoic Ads placeholders / ad positions](https://pubdash.ezoic.com/ezoicads/adpositions/placeholders) (or the Step 3 flow in [Ad placement implementation](https://docs.ezoic.com/docs/ezoicads/implementation/)).
2. For each slot on your site, create or copy a placement and note its **ID** (the number in `ezoic-pub-ad-placeholder-**###**`).
3. Put those numbers in `.env.local` as JSON keys listed in `lib/ezoicZones.ts` (e.g. `homeTop`, `sitewideFooter`, …).
4. Run **`yarn build`** (or **`yarn deploy:cloudflare`**) again — static export bakes env in at build time.

## 2. ads.txt

Complete [Step 2 ads.txt](https://docs.ezoic.com/docs/ezoicads/adstxt/) (redirect in Worker **`EZOIC_ADSTXT_REDIRECT`** or paste Ezoic’s full file into **`public/ads.txt`**). Incomplete ads.txt can limit demand.

## 3. Account / browser

- Site must be **onboarded and approved** for EzoicAds in the publisher dashboard.
- Disable **ad blockers** and test in a normal window.
- New sites often see **low or no fill** until traffic and classification stabilize.

## 4. Verify scripts on the live page

View source on production and confirm **`ezojs.com/ezoic/sa.min.js`** and placeholder divs like **`id="ezoic-pub-ad-placeholder-123"`** (with your real IDs). If scripts are missing, set **`NEXT_PUBLIC_EZOIC_DISABLED=true`** by mistake, or the build was not a production build.
