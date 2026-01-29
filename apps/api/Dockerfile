FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
# We need to handle workspace logic in a real build, but for this Dockerfile scope we assume context is root or we copy relevant parts.
# Since we are in a monorepo, Dockerfiles are tricky.
# Usually we build from root context.
# For now, I'll create a simple Dockerfile assuming independent build or appropriate context usage.

# This is a placeholder for a production build
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install

COPY packages/db packages/db
RUN pnpm --filter @doxie/db db:generate

COPY apps/api apps/api
RUN pnpm --filter @doxie/api build

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
