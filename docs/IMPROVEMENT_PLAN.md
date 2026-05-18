# AI Buzz World — Improvement Plan

> Plan for improving images, content, and overall site quality. Use with **fullstack-developer** and **ux-ui-expert** skills.

---

## 1. Image Quality Improvements

### Current State
- **Provider**: Gemini Nano Banana (default), Replicate, OpenAI as fallbacks
- **Size limits**: Banners ≤100kb, logos ≤50kb
- **Issue**: Many articles still use placeholders; some AI images may be generic

### Planned Actions

| Phase | Action | Priority |
|-------|--------|----------|
| 1.1 | Re-run `yarn generate:images` during low-traffic periods to replace placeholders | High |
| 1.2 | Add `imagePrompt` to all articles missing it (from title + category) | High |
| 1.3 | Tune prompts per category (e.g. "Design" → visual examples, "Writing" → workspace scene) | Medium |
| 1.4 | Consider Imagen 4 for higher fidelity (if available via Gemini) | Low |
| 1.5 | Add batch retry script for failed articles only | Medium |

### Image Scripts Reference
```
yarn generate:images          # Main: Gemini/Replicate/OpenAI
yarn generate:images:deepseek # Alternative provider
yarn generate:logos:gemini    # Tool logos (SVG + Clearbit PNG)
```

---

## 2. Content Quality Improvements

### Current State
- Articles in `content/articles.json`
- Gemini used for generation (`generateContentWithGemini.js`)
- Refresh scripts: `refreshOldContent.js`, `generateWeeklyNews.js`

### Planned Actions

| Phase | Action | Priority |
|-------|--------|----------|
| 2.1 | Upgrade prompts for fresher, trend-aware content (2025/2026) | High |
| 2.2 | Add trending topics pipeline (e.g. from news/Reddit/HN) | Medium |
| 2.3 | Improve `imagePrompt` generation in content scripts | High |
| 2.4 | Add content audit: outdated dates, broken links, stale tool refs | Medium |
| 2.5 | Implement structured data (JSON-LD) for articles | Medium |
| 2.6 | Add "Last updated" and "Reviewed" metadata | Low |

### Content Scripts Reference
```
yarn generate:content:gemini  # New articles with Gemini
yarn refresh:content           # Refresh existing content
yarn generate:weekly-news     # Weekly news roundup
yarn update:dates             # Update published/updated dates
yarn content:update-all       # Full content pipeline
```

---

## 3. UX/UI Improvements

### Areas to Address

| Area | Current | Target |
|------|---------|--------|
| **Trust** | Minimal | About, editorial policy, author bios |
| **Navigation** | Basic | Clear hierarchy, breadcrumbs, related articles |
| **Mobile** | Responsive | Touch targets, readable fonts, fast load |
| **Accessibility** | Unknown | WCAG 2.1 AA, semantic HTML, keyboard nav |
| **Visual hierarchy** | Good | Consistent spacing, typography scale |
| **CTAs** | Present | Clear, scannable, conversion-focused |

### Planned Actions

| Phase | Action | Priority |
|-------|--------|----------|
| 3.1 | Add About / Editorial policy page | High |
| 3.2 | Improve article layout: TOC, read progress, share buttons | Medium |
| 3.3 | Add "Related articles" section | Medium |
| 3.4 | Audit and fix color contrast (WCAG) | High |
| 3.5 | Add loading states for images (skeleton/blur) | Medium |
| 3.6 | Improve footer: links, sitemap, contact | Low |

---

## 4. Technical / Fullstack Improvements

### Current Stack
- Next.js 14, React 18, Tailwind 4
- Content: JSON files in `content/` + `public/content/`
- Deployment: Cloudflare (Wrangler)

### Planned Actions

| Phase | Action | Priority |
|-------|--------|----------|
| 4.1 | Ensure `copyContentToPublic` runs before every build | High |
| 4.2 | Add image optimization (Next.js Image, sizes, formats) | High |
| 4.3 | Add sitemap.xml and robots.txt generation | Medium |
| 4.4 | Consider ISR or revalidation for content pages | Low |
| 4.5 | Add error boundaries and fallback UI | Medium |
| 4.6 | Add basic analytics (privacy-friendly) | Low |

---

## 5. Next Steps Priority Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│  HIGH IMPACT / LOW EFFORT                                        │
│  • Re-run image generation for placeholder articles              │
│  • Add imagePrompt to articles missing it                        │
│  • Add About / Editorial policy page                             │
│  • Improve image loading (Next.js Image, sizes)                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HIGH IMPACT / MEDIUM EFFORT                                     │
│  • Upgrade content prompts for trends and freshness              │
│  • Add Related articles section                                  │
│  • WCAG accessibility audit                                      │
│  • Sitemap and robots.txt                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  MEDIUM IMPACT / LOW EFFORT                                      │
│  • Category-specific image prompts                               │
│  • Batch retry script for failed images                          │
│  • Content audit script (dates, links)                            │
│  • Loading states for images                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Skills to Use

| Skill | When to Use |
|-------|-------------|
| **fullstack-developer** | Architecture, scripts, deployment, performance, Next.js |
| **ux-ui-expert** | Layout, accessibility, visual design, trust signals |
| **content-expert-ai-buzz** | Content strategy, article prompts |
| **seo-expert** | Keyword strategy, on-page SEO, technical SEO, trend-based content |
| **growth-marketer** | Acquisition, conversion, engagement |
| **product-manager** | Roadmap, prioritization, user needs |

> **Revenue & traffic focus**: See [NEXT_STEPS_REVENUE_GROWTH.md](./NEXT_STEPS_REVENUE_GROWTH.md) for AdSense monetization, trend-based SEO, and traffic growth.

---

## 7. Quick Commands

```bash
# Regenerate all article images (Gemini)
IMAGE_GENERATION_ENABLED=true yarn generate:images

# Regenerate content
yarn generate:content:gemini

# Full content pipeline
yarn content:update-all

# Copy content to public
yarn copy:content

# Build
yarn build
```

---

*Last updated: March 2026*
