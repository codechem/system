# syntax=docker/dockerfile:1

# Build context is the repo root: docker build -f apps/site/Dockerfile .

FROM node:26-slim AS build

WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1

ARG PUBLIC_STORYBOOK_URL
ENV PUBLIC_STORYBOOK_URL=$PUBLIC_STORYBOOK_URL

COPY package.json package-lock.json ./
COPY apps/site/package.json apps/site/
COPY apps/storybook/package.json apps/storybook/
COPY packages/components/package.json packages/components/
COPY packages/tokens/package.json packages/tokens/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build \
 && npm run build -w @codechem/site

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    root /usr/share/nginx/html;
    absolute_redirect off;
}
EOF

COPY --from=build /app/apps/site/dist /usr/share/nginx/html

EXPOSE 8080
