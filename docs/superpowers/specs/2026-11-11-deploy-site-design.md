# Front-page deployment

## Intent and scope

Publish the existing Astro front page through Dokploy, like Storybook. Add a separate `.github/workflows/deploy-site.yml`, triggered after successful push CI on `main`, with a manual trigger. Use the `site` GitHub environment and its own `DOKPLOY_WEBHOOK_URL` secret. Preserve the existing Storybook workflow.

## Approaches

Selected: a separate workflow mirroring Storybook, keeping deployments independent. A combined workflow would couple both deployments; publishing static files directly from Actions would replace the established Dokploy build model. Neither alternative is needed.

## Constraints and setup

Dokploy builds using `apps/site/Dockerfile`, with the repository root as build context, and serves port `8080`. Document these settings, Auto Deploy, the environment-scoped webhook secret, and the optional `PUBLIC_STORYBOOK_URL` build argument. Do not configure infrastructure or trigger a live deployment.

## Verification

Validate workflow structure and exercise its shell step locally with mocked `curl`: missing secrets and non-200 replies fail; a 200 reply succeeds; payload metadata survives quoting. Check automatic-event guards and manual dispatch against Storybook. Do not expose credentials.

## Approval

User approved this scope in conversation. Implementation details follow existing repository conventions; no UI or application changes are needed.
