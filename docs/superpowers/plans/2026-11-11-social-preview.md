# Social Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved frontpage-based sharing image and metadata.

**Architecture:** Serve a static browser-rendered PNG from Astro's public directory. Add shared metadata using existing page titles/descriptions and the confirmed production domain.

**Tech Stack:** Astro, HTML metadata, PNG; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-11-social-preview-design.md`

## Global Constraints

- Use the approved 1200 × 630 real-component rendering, not AI artwork.
- Production image URL: `https://system.codechem.dev/social-preview.png`.
- Preserve visible pages and their existing titles/descriptions.

## Review Focus

- Image is publicly served as PNG, not an HTML fallback.
- Image URL is absolute and uses the production HTTPS domain.
- Twitter uses `summary_large_image`.
- Non-home pages retain their own titles and descriptions.
- Open Graph dimensions and alternative text match the actual asset.

### Task 1: Publish preview and sharing metadata

**Files:**
- Create: `apps/site/public/social-preview.png`
- Modify: `apps/site/src/layouts/Base.astro`

**Interfaces:** All pages already consume `Base` with optional `title` and `description`; retain this interface.

- [x] Write and run a temporary browser assertion against the homepage and `/components/`: Twitter card type, production image URL, Open Graph image URL/dimensions/alt, and each page's title/description. Confirm it fails before implementation.
- [x] Copy `/tmp/opencode/codechem-social-preview.png` into the public asset path; verify PNG dimensions are 1200 × 630.
- [x] Reuse the existing computed page title for title, Twitter title and Open Graph title. Add Twitter card/image/title/description/image-alt and Open Graph type/title/description/image/image-width/image-height/image-alt tags in `Base.astro`.
- [x] Rerun browser assertions; fetch the asset and confirm HTTP 200 with PNG content type. Run `npm run build -w @codechem/site` and inspect the generated metadata on the homepage and components page.
- [x] Review the diff for unintended visible changes. Leave changes uncommitted unless the user requests a commit.
