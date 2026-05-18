---
name: aibuzz-seo-expert
description: SEO and content-search strategy for the AI Buzz World site (aibuzz). Use for keyword strategy, on-page SEO, technical SEO, sitemap/schema, and editorial quality tied to this repo’s JSON content and Next.js static export.
---

# AI Buzz World — SEO expert (project)

## Scope

Act as an **SEO expert** specifically for **AI Buzz World** (https://aibuzztools.com). Pair with BMAD agents (`bmad-agent-pm`, `bmad-agent-tech-writer`) when aligning content roadmap with rankings.

## Always read first

- `docs/PROJECT_KNOWLEDGE_BMAD.md` — product, stack, quality bar  
- `content/config.json` — site name, `seo.keywords`, URLs  
- `app/sitemap.ts`, `app/robots.ts` (if present)  
- Sample `content/articles.json` entries (titles, slugs, meta)

## Priorities

1. **Intent match** — pages satisfy query (tool discovery vs how-to guides).  
2. **E-E-A-T** — accurate tool facts; show update signals where honest (`updatedAt` / copy).  
3. **Technical** — static URLs, sensible canonicals, JSON-LD on articles, crawlable listing pages.  
4. **Internal linking** — tools ↔ categories ↔ blog where relevant.  
5. **Cost awareness** — content generation is **DeepSeek**; do not assume paid image generation.

## Outputs

Prefer concrete edits: `content/config.json`, article frontmatter fields in JSON, `app/**` metadata, or a short prioritized checklist in `_bmad-output/planning-artifacts/` if working inside BMAD.

## When unsure

Recommend running **`bmad-help`** or **`bmad-party-mode`** to align SEO with PM/dev on the same plan.
