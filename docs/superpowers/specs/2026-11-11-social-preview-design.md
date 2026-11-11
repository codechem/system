# Social sharing preview

Use the approved 1200 × 630 browser-rendered frontpage preview, captured with the actual CodeChem components, logo, fonts and tokens. Do not use the AI-generated approximation.

## Approaches

- AI illustration: rejected by the user; not faithful to the actual components.
- HTML/CSS rendering of the actual frontpage: selected and visually approved.

Serve the PNG at `/social-preview.png`. Use absolute image URL `https://system.codechem.dev/social-preview.png` in the shared Astro layout's Twitter large-image card and Open Graph metadata. Preserve each page's existing title and description. Include image dimensions and descriptive alternative text. Do not change the visible frontpage or introduce dependencies.

The browser capture currently lives at `/tmp/opencode/codechem-social-preview.png`; its throwaway capture script is `/tmp/opencode/codechem-social-preview.mjs`.
