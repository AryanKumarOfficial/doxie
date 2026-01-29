FROM node:18-alpine AS base
# 1. Install OpenSSL (Required for Prisma on Alpine Linux)
RUN apk add --no-cache openssl

FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

# 2. Copy manifest files first (Better caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# 3. Install dependencies
RUN pnpm install

# 4. Copy source code
COPY . .

# 5. Generate Database Client
RUN pnpm --filter @doxie/db db:generate

# 6. Build the application (CHANGE THIS LINE for web/api)
RUN pnpm --filter @doxie/admin build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# 7. Copy standalone build
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/public ./apps/admin/public

EXPOSE 3001
CMD ["node", "apps/admin/server.js"]