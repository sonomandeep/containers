FROM oven/bun:1.3.5-alpine AS builder
WORKDIR /app
RUN apk update
RUN apk add --no-cache libc6-compat

COPY apps/www/package.json ./package.json
RUN bun install

COPY apps/www ./
RUN bun run build

FROM nginx:1.29.5-alpine3.23 AS runner
COPY ./apps/www/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

