# syntax=docker/dockerfile:1

# ---- Build: compile packages (including the manifest), build static Storybook ----
FROM node:26-slim AS build

WORKDIR /app
ENV STORYBOOK_DISABLE_TELEMETRY=1

# Install dependencies first so this layer is cached until a package.json or the lockfile changes.
COPY package.json package-lock.json ./
COPY apps/storybook/package.json apps/storybook/
COPY packages/components/package.json packages/components/
COPY packages/tokens/package.json packages/tokens/

# --ignore-scripts matches `allowScripts` in package.json: every dependency install script is denied.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build-storybook

# ---- Serve: static files on nginx, running as a non-root user ----
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY --from=build /app/apps/storybook/storybook-static /usr/share/nginx/html

EXPOSE 8080
