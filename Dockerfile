# ──────────────── Base: Configure pnpm & Turbo ────────────────
FROM node:24-alpine AS base

ENV PNPM_HOME="/var/lib/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN corepack enable \
 && pnpm add -g turbo

# ──────────────── Builder: Build all & Prune ────────────────
FROM base AS builder

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/appone ./apps/appone
COPY packages ./packages
COPY envconsul-config.hcl ./envconsul-config.hcl

RUN pnpm install --frozen-lockfile

# TEMP: List packages and exit for debugging
RUN ls -l /app/packages && exit 1

RUN pnpm turbo run build

RUN turbo prune appone --docker --use-gitignore=false

# ──────────────── Installer: Install pruned deps ────────────────
FROM base AS installer

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY --from=builder /app/out/json ./
COPY --from=builder /app/out/full ./

# Install only production dependencies for pruned output
RUN pnpm install --frozen-lockfile --prod

# ──────────────── Runner: Production image ────────────────
FROM node:24-alpine AS runner

ENV ENVCONSUL_VERSION=0.13.2
RUN apk add --no-cache wget unzip xdg-utils \
    && if [ ! -f /usr/local/bin/envconsul ]; then \
    wget "https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip" \
    && unzip "envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip" -d /usr/local/bin \
    && chmod +x /usr/local/bin/envconsul \
    && rm -f "envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip"; \
    fi     

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

USER nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/.next/static   ./apps/appone/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/public        ./apps/appone/public

COPY --from=builder /app/envconsul-config.hcl /etc/envconsul.hcl       

EXPOSE 3000
ENV NODE_ENV=production

ENTRYPOINT ["envconsul", "-config", "/etc/envconsul.hcl", "--"]
CMD ["node", "apps/appone/server.js"]