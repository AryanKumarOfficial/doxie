FROM node:18-alpine AS base
# 1. Install OpenSSL (Required for Prisma)
RUN apk add --no-cache openssl

FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

# 2. Copy manifest files
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

# 6. Build the application
# === FIX STARTS HERE ===
# We provide dummy values so "next build" doesn't crash validation.
# These will be overwritten by the real .env values at runtime.
ENV MONGODB_URI="mongodb://localhost:27017/build_dummy"
ENV NEXTAUTH_SECRET="build_dummy_secret"
ENV NEXTAUTH_URL="http://localhost:3000"
# =======================

RUN pnpm --filter @doxie/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# 7. Copy standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]