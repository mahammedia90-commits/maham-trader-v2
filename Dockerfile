FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_APP_ID=merchant-portal
ARG VITE_OAUTH_PORTAL_URL=https://admin.mahamexpo.sa
ARG VITE_ANALYTICS_ENDPOINT=https://analytics.mahamexpo.sa
ARG VITE_ANALYTICS_WEBSITE_ID=merchant-analytics
ARG VITE_FRONTEND_FORGE_API_KEY=
ARG VITE_FRONTEND_FORGE_API_URL=

RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
