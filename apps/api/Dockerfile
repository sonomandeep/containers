FROM oven/bun:1.3.6-alpine AS base
WORKDIR /app

RUN apk add --no-cache \
  python3 \
  py3-pip \
  build-base

RUN bun install -g turbo

FROM base AS prepare
COPY . .
RUN turbo prune api --docker

FROM base AS builder
COPY --from=prepare /app/out/bun.lock ./bun.lock
COPY --from=prepare /app/out/json/ ./
RUN bun install --frozen-lockfile
COPY --from=prepare /app/out/full/ ./
RUN bun turbo build

FROM base AS prod-deps
COPY --from=prepare /app/out/bun.lock ./bun.lock
COPY --from=prepare /app/out/json/ ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.6-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=prod-deps /app/node_modules ./node_modules

CMD ["bun", "apps/api/dist/index.js"]
