# ──────────────── Base: Configure pnpm & Turbo ────────────────
FROM node:24-alpine AS base

# Configure pnpm home and PATH for global installs
ENV PNPM_HOME="/var/lib/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

# Enable Corepack (manages pnpm) and install turbo CLI
RUN corepack enable \
 && pnpm add -g turbo

# ──────────────── Builder: Prune monorepo ────────────────
FROM base AS builder

# Install compatibility libs
RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

# Copy root manifests and turbo config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy only the 'appone' app sources
COPY apps/appone ./apps/appone
COPY packages ./packages

# 4.1. Copy root-level envconsul configuration
COPY envconsul-config.hcl ./envconsul-config.hcl

# Prune to only dependencies/files needed for 'appone'
RUN turbo prune appone --docker --use-gitignore=false

# ──────────────── Installer: Install deps ────────────────
FROM base AS installer

# Install compatibility libs again
RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

# Bring in your pnpm config so workspace packages get linked
# COPY .npmrc ./

# copy THE real workspace manifest so pnpm can link local packages
COPY pnpm-workspace.yaml ./

# Copy pruned JSON (lockfile & manifests)
COPY --from=builder /app/out/json ./

# Copy full source for build
COPY --from=builder /app/out/full ./

# Install dependencies deterministically
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Build the Next.js application (only 'appone' workspace)
RUN pnpm turbo run build --filter=appone...

# ──────────────── Runner: Production image ────────────────
FROM node:24-alpine AS runner

# 1. Install dependencies to download & install envconsul
ENV ENVCONSUL_VERSION=0.13.2
RUN apk add --no-cache wget unzip xdg-utils \
    && if [ ! -f /usr/local/bin/envconsul ]; then \
    wget "https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip" \
    && unzip "envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip" -d /usr/local/bin \
    && chmod +x /usr/local/bin/envconsul \
    && rm -f "envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip"; \
    fi     

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

USER nextjs

# Copy standalone output and static assets
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/.next/static   ./apps/appone/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/public          ./apps/appone/public

# 5. Copy the root-level envconsul configuration into the image
COPY --from=builder /app/envconsul-config.hcl /etc/envconsul.hcl       

# 6. Expose Next.js default port
EXPOSE 3000

# 7. Ensure production environment variables
ENV NODE_ENV=production

# 8. Use Envconsul as the entrypoint to fetch KV pairs, then run `node server.js`
ENTRYPOINT ["envconsul", "-config", "/etc/envconsul.hcl", "--"]

# Start the Next.js server
CMD ["node", "apps/appone/server.js"]
