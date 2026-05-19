---
name: aibuzz-technical-content-writer
description: Technical content writer for AI Buzz World — accurate guides and tool copy aligned with content/articles.json, content/tools.json, static Next export, SEO, and human editorial standards.
---

# AI Buzz World — Technical content writer (project)

Use this skill when drafting or revising **blog articles**, **tool descriptions**, comparison pages, or monetization-adjacent copy for **this repo** (Next.js static export, JSON-backed content).

## Pair with

- **`content-expert-ai-buzz`** — strategy, POV, AI/tool landscape (`~/.cursor/skills/content-expert-ai-buzz/SKILL.md`).
- **`aibuzz-seo-expert`** — keyword/on-page/search alignment for this site.
- **`bmad-agent-tech-writer`** (Paige) — BMAD-style docs and structured artifacts.

## Repo facts (do not contradict)

1. **Articles live in** `content/articles.json` — array of objects with at least: `title`, `slug`, `metaDescription`, `keywords[]`, `category`, `readingTime`, `targetAudience`, `content` (Markdown string), `publishedAt`, `updatedAt`, `featured`, `status`, `image`.
2. **Tools live in** `content/tools.json` — match existing schema (slug, descriptions, category, pricing, features, logo paths under `/images/...`).
3. **Bulk generation** uses DeepSeek scripts (`yarn generate:content`, etc.); **manual edits** go straight into JSON after `yarn copy:content` / build pipeline copies into `public` where applicable.
4. **Tone**: Clear, credible, practitioner-oriented; define jargon once; flag uncertainty instead of inventing specs or prices.
5. **Accuracy**: Fact-check pricing, feature claims, and model names against vendor pages; LLM drafts hallucinate — treat every stat as suspicious until verified.

## Writing standards

- **Headings**: Logical H2/H3; one clear H1-equivalent opening line in Markdown (`# Title`).
- **SEO**: Natural keywords; meta description ≤ ~155 chars where possible; align slug with primary intent.
- **Internal links**: Prefer linking to `/tools/[slug]` and `/category/[slug]` where relevant (site URLs as deployed).
- **Dates**: Keep `publishedAt` / `updatedAt` honest when materially revising; do not imply “today” unless true.
- **Images**: Paths like `/images/articles/{slug}.webp`; don’t invent filenames without checking `public/images/articles/`.

## Outputs

- **New article**: Full JSON object ready to append (or patch) into `content/articles.json`, plus any suggested internal links list.
- **Tool refresh**: Focused JSON field-level edits + changelog note for humans.
- **Outline-only**: When asked, headings + bullets before full prose.

## When unclear

Read `docs/PROJECT_KNOWLEDGE_BMAD.md`, sample entries in `content/articles.json`, and `content/config.json` for naming/site voice before writing.
