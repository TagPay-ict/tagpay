# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy the entire monorepo
COPY . .

# Prune the workspace to only include server dependencies
RUN turbo prune @tagpay/server --docker

# Install dependencies based on the preferred package manager
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=deps /app/out/json/ .
COPY --from=deps /app/out/package-lock.json* ./
RUN npm ci

# Build the project and its dependencies
COPY --from=deps /app/out/full/ .

# Generate Prisma client and build the application
RUN npm run db:generate
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy the built application
COPY --from=installer /app/dist ./dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json

# Copy database migrations
COPY --from=installer /app/drizzle.config.ts ./drizzle.config.ts

USER nodejs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/server.js"]
