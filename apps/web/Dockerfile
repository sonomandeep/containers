FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app
RUN apk update
RUN apk add --no-cache libc6-compat

FROM base AS prepare
COPY . .
RUN bun install -g turbo
RUN turbo prune web --docker

FROM base AS builder
ARG NEXT_PUBLIC_API_URL
COPY --from=prepare /app/out/json/ ./
RUN bun install 
COPY --from=prepare /app/out/full/ ./
RUN bun turbo build

FROM oven/bun:1.3.5-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

CMD ["bun", "apps/web/server.js"]
