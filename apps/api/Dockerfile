FROM oven/bun:1.3.0 AS base
WORKDIR /app

RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

RUN bun install -g turbo

FROM base AS pruner
COPY . .
RUN turbo prune api --docker

FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ ./
RUN bun run --cwd packages/shared build

FROM oven/bun:1.3.0-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

RUN apt-get update && apt-get install -y \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=installer /app ./

WORKDIR /app/apps/api

EXPOSE 80
CMD ["bun", "run", "src/index.ts"]
