FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.12.1
COPY . .
RUN pnpm install
RUN pnpm --filter @doxie/db db:generate
RUN pnpm --filter @doxie/admin build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# In a real setup, we copy .next and other artifacts.
# This is simplified.
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static

EXPOSE 3001
CMD ["node", "apps/admin/server.js"]
