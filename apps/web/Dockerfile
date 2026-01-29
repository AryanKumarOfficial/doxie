FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.12.1
COPY . .
RUN pnpm install
RUN pnpm --filter @doxie/db db:generate
RUN pnpm --filter @doxie/web build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
