# ──────────────── Base: Configure pnpm & Turbo ────────────────
FROM node:24-alpine AS base

ENV PNPM_HOME="/var/lib/pnpm"
ENV PATH="${PNPM_HOME}/bin:${PNPM_HOME}:$PATH"

RUN corepack enable \
 && pnpm config set global-bin-dir "${PNPM_HOME}/bin" \
 && pnpm add -g turbo

# ──────────────── Builder: Prune monorepo ────────────────
FROM base AS builder

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/appone ./apps/appone
COPY packages ./packages

RUN turbo prune appone --docker --use-gitignore=false

# ──────────────── Installer: Install deps ────────────────
FROM base AS installer

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /app/out/json ./

COPY --from=builder /app/out/full ./

RUN pnpm install --frozen-lockfile

RUN NEXT_SECURITY_SECRET=build-time-placeholder \
    CSRF_SECRET=build-time-placeholder \
    pnpm turbo run build --filter=appone...

# ──────────────── Runner: Production image ────────────────
FROM node:24-alpine AS runner

RUN apk add --no-cache su-exec

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/.next/static   ./apps/appone/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/appone/public          ./apps/appone/public

COPY docker-entrypoint.prod.mjs /usr/local/bin/docker-entrypoint.prod.mjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["node", "/usr/local/bin/docker-entrypoint.prod.mjs"]

CMD ["node", "apps/appone/server.js"]
