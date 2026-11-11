# Site: Dockerfile for Dokploy

## Goal

Deploy the Astro landing page (`apps/site`) on Dokploy, next to the Storybook image.

## What changed

- New `apps/site/Dockerfile`. The build context is the repo root: `docker build -f apps/site/Dockerfile .`
- Build stage: `npm ci --ignore-scripts`, then `npm run build` (tokens + components, since the site imports the workspace `dist/`), then `astro build`.
- `PUBLIC_STORYBOOK_URL` is a build arg. Astro inlines it at build time, so it has to be set as a build arg in Dokploy, not a runtime env var.
- Serve stage: `nginx-unprivileged` on port 8080, with `absolute_redirect off`.

## Verification

- Image builds. In the container, `/`, `/components/` and `/theming/` return 200, an unknown path returns 404, and the Storybook URL from the build arg is in the HTML.

## Findings

- With nginx's default absolute redirects, `/getting-started` redirected to `http://<host>:8080/getting-started/`, which leaks the container port behind Dokploy's proxy. `absolute_redirect off` sends a relative `Location` instead.
