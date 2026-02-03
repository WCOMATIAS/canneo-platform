# =============================================
# CANNEO Hooks - NestJS Production Dockerfile
# =============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace config
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./

# Copy package.json files for all workspaces
COPY apps/hooks/package.json ./apps/hooks/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @canneo/hooks... --filter @canneo/shared --filter @canneo/config

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/hooks/node_modules ./apps/hooks/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY apps/hooks ./apps/hooks
COPY packages ./packages
COPY prisma ./prisma
COPY package.json pnpm-workspace.yaml tsconfig.json ./

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the service
WORKDIR /app/apps/hooks
RUN pnpm build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3010

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/hooks/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/hooks/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@canneo ./node_modules/@canneo
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nestjs

EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["dumb-init", "node", "dist/main.js"]
