# AI Buzz World — BMAD project knowledge

Grounding for **BMAD** agents (`bmad-agent-pm`, `bmad-agent-dev`, `bmad-agent-tech-writer`, `bmad-party-mode`) and the **`aibuzz-seo-expert`** skill.  
BMAD `project_knowledge` in `_bmad/bmm/config.yaml` points to this `docs/` folder.

## Product

- **Name:** AI Buzz World  
- **URL:** https://aibuzztools.com  
- **Purpose:** Directory of AI tools (cards, categories, search), blog (guides), comparisons. Monetization: AdSense, outbound tool links.

## Users & goals

- **Visitors:** Professionals and creators comparing AI tools; SEO discovery.  
- **Business goals:** Trustworthy listings, fresh editorial content, organic traffic, low API cost (text via **DeepSeek** only; **no paid image APIs** unless explicitly enabled).

## Tech stack

- **Framework:** Next.js 14 App Router, **static export** (`output: 'export'`), `trailingSlash: true`.  
- **Deploy:** Cloudflare Workers + assets from `/out` (`wrangler.toml` → `ASSETS`).  
- **Content:** JSON in `content/` → copied to `public/content/` on build (`yarn copy:content` / build hook).  
- **Images:** Article and tool assets under `public/images/`; default **placeholders** (see `.env.local.example`).  
- **Styling:** CSS modules per page, Tailwind in `globals.css`.

## Key paths

| Area | Path |
|------|------|
| Site config & nav | `content/config.json` |
| Tools (source) | `content/tool-cards.json`, `content/tools.json` |
| Articles | `content/articles.json` |
| Homepage | `app/page.tsx`, `app/page.module.css` |
| Tools UI | `app/tools/`, `components/tools/` |
| Blog | `app/blog/` |
| Content scripts | `scripts/generateContent.js` (DeepSeek), `scripts/sitePublish.js` |

## Quality bar (cross-role)

1. **PM:** Prioritize trust (accurate tool data), clear IA, measurable SEO outcomes, sustainable content pipeline (schedule + `yarn site:publish`).  
2. **SEO:** `content/config.json` keywords, titles/meta, internal links, sitemap, structured data on articles; avoid thin/duplicate AI slop.  
3. **Tech writer:** Accurate pricing/feature claims, dated “last updated” when relevant, scannable headings.  
4. **Dev:** Accessible UI, fast LCP, no regressions to static export; env guards for paid APIs.

## Multi-agent discussion

Use Cursor skill **`bmad-party-mode`** to orchestrate a roundtable (PM, architect, dev, QA, UX as installed).  
For **SEO-specific** review, also invoke **`aibuzz-seo-expert`** (this repo) or your global **`seo-expert`** skill.

## Suggested BMAD flow for “better website”

1. `bmad-product-brief` or `bmad-brainstorming` — align vision.  
2. `bmad-create-prd` — requirements for UX, content, SEO, perf.  
3. `bmad-create-ux-design` — if UI overhaul.  
4. `bmad-create-architecture` — technical approach (optional for this codebase).  
5. `bmad-create-epics-and-stories` + `bmad-sprint-planning` — implementation slices.  
6. `bmad-dev-story` / `bmad-quick-dev` — ship.  
7. `bmad-help` — anytime you’re unsure what’s next.

Artifacts go under `_bmad-output/planning-artifacts/` and `_bmad-output/implementation-artifacts/`.

## Re-install / update BMAD

```bash
npx bmad-method install --directory . --modules bmm --tools cursor --output-folder _bmad-output --yes
```

For upgrades: `--action update` (see [BMAD docs](https://docs.bmad-method.org)).
