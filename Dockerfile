# ------------------------------------------------
# Stage 1: Turborepo Build + Next.js Standalone
# ------------------------------------------------
FROM node:22-alpine AS builder

# 1. Create and set the root working directory
WORKDIR /repo-root

# 2. Install Turborepo globally if using pnpm/yarn (optional; see your workspace setup)
#    e.g., for pnpm: RUN corepack enable && corepack prepare pnpm@latest --activate
#    For npm-only monorepo, skip this step if you don't need a global turbo binary.

# 3. Copy root manifests to leverage Docker layer caching
COPY package.json package-lock.json ./       
# Root-level manifests 
COPY turbo.json ./

# 4. Copy all workspace definitions (apps and packages), but do not copy build artifacts
# Copy top-level apps folder 
COPY apps ./apps                    

COPY packages ./packages                      
# Copy shared packages 

# 4.1. Copy root-level envconsul configuration
COPY envconsul-config.hcl ./envconsul-config.hcl

# 5. Install root dependencies (including workspaces) without running build scripts
RUN npm ci --ignore-scripts                   
# Ensures all workspace symlinks resolve 

# 6. Navigate to the Next.js app folder and build in standalone mode
WORKDIR /repo-root/apps/appone
RUN npm run build                              
# `next build` emits .next/standalone 

# ------------------------------------------------
# Stage 2: Production Runtime with Envconsul
# ------------------------------------------------
FROM node:22-alpine AS runner

# 1. Install dependencies to download & install envconsul
ENV ENVCONSUL_VERSION=0.13.2
RUN apk add --no-cache wget unzip xdg-utils \
    && if [ ! -f /usr/local/bin/envconsul ]; then \
    wget "https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip" \
    && unzip "envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip" -d /usr/local/bin \
    && chmod +x /usr/local/bin/envconsul \
    && rm -f "envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip"; \
    fi                                     # Install Envconsul binary :contentReference[oaicite:19]{index=19}

# 2. Create and set working directory for the standalone output
WORKDIR /app

# 3. Copy Next.js standalone build output from builder stage
#    This includes `server.js` and only the traced dependencies under .next/standalone/node_modules
COPY --from=builder /repo-root/apps/appone/.next/standalone .     
# Minimal server + traced node_modules 

# 4. Manually copy static assets so that `server.js` can serve them
COPY --from=builder /repo-root/apps/appone/public ./apps/appone/public
COPY --from=builder /repo-root/apps/appone/.next/static ./apps/appone/.next/static  

# 5. Copy the root-level envconsul configuration into the image
COPY --from=builder /repo-root/envconsul-config.hcl /etc/envconsul.hcl               

# 6. Expose Next.js default port
EXPOSE 3000

# 7. Ensure production environment variables
ENV NODE_ENV=production

# 8. Use Envconsul as the entrypoint to fetch KV pairs, then run `node server.js`
ENTRYPOINT ["envconsul", "-config", "/etc/envconsul.hcl", "--"]

# Launch the Next.js minimal server
CMD ["node", "apps/appone/server.js"]   

