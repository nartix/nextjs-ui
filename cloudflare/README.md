# Cloudflare Containers Deployment

This directory contains the Cloudflare-only deployment surface for the Next.js UI:

- `wrangler.jsonc` defines the Worker, Container image, Durable Object binding, and custom domain.
- `src/index.ts` routes Worker requests into the Next.js container and injects Worker secrets as container environment variables.
- `scripts/sync-vault-secrets.mjs` mirrors Vault KV values into Cloudflare Worker secrets before deploy.
- `secrets.manifest.json` declares the Vault paths and aliases used by the sync script.

The existing Docker Compose and Vault Agent files are intentionally left in place. They can still be used for local or future Docker Compose deployment.

## Deploy Dev Stage

The Cloudflare dev stage is the Wrangler `staging` environment in `wrangler.jsonc`. It deploys to `workers.dev`, not to `nextjs.ferozfaiz.com`, so it is safe to test before production.

The dev stage Worker name is `nextjs-ui-worker-staging`. Its URL will be:

```text
https://nextjs-ui-worker-staging.<your-workers-subdomain>.workers.dev
```

### From GitHub Actions

The GitHub Actions workflow is manual-only:

1. Open the repository in GitHub.
2. Go to **Actions**.
3. Select **Deploy to Cloudflare Containers**.
4. Click **Run workflow**.
5. Choose `staging` for `target_environment`.
6. Run the workflow.

The workflow will install the Cloudflare dependencies, sync Vault secrets into the staging Worker environment, then deploy the staging Worker and container.

### From Your Machine

Install the Cloudflare Worker dependencies:

```bash
cd cloudflare
npm install --no-package-lock
```

Sync Vault secrets into Cloudflare Worker secrets:

```bash
VAULT_ADDR=... VAULT_TOKEN=... CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npm run secrets:sync:staging
```

Deploy the dev stage Worker and container:

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npm run deploy:staging
```

After deployment, test the app at that URL before running the production deploy.

## Deploy Production

Production disables `workers.dev` and serves `nextjs.ferozfaiz.com` as a custom domain.

Sync production secrets:

```bash
VAULT_ADDR=... VAULT_TOKEN=... CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npm run secrets:sync:production
```

Deploy production:

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npm run deploy:production
```

## Required GitHub Secrets

Create these repository secrets for `.github/workflows/deploy-cloudflare.yml`:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token that can edit Workers, Containers, Durable Objects, `workers.dev`, and the `ferozfaiz.com` Worker custom domain.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID for the zone/account.
- `VAULT_ADDR`: Hashicorp Vault address.
- `VAULT_TOKEN`: Vault token with read access to the KV paths below. Prefer replacing this with GitHub OIDC to Vault when available.
- `VAULT_NAMESPACE`: Optional, only if your Vault uses namespaces.

The GitHub Actions workflow is manual-only. Run it from the Actions tab and choose `staging` or `production` for `target_environment`.

## Worker Secrets

The workflow creates or updates Worker secrets from Vault. Staging secrets and production secrets are separate in Cloudflare. If you set them manually instead, create these for each environment you deploy:

Required by the current app:

- `NEXT_SECURITY_SECRET`
- `CSRF_SECRET`
- `API_URL_PRODUCTION`
- `API_URL_PREFIX`
- `API_URL_VERSION`
- `NEXTJS_OIDC_CLIENT_ID`
- `NEXTJS_OIDC_CLIENT_SECRET`

Recommended or optional, depending on how your Vault data is configured:

- `SESSION_COOKIE_MAXAGE`
- `CSRF_ALGORITHM`
- `CSRF_SALT_LENGTH`
- `CSRF_HEADER_NAME`
- `CSRF_COOKIE_NAME`
- `CSRF_COOKIE_MAXAGE`
- `API_URL_DEVELOPMENT`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`

The Worker injects these static container variables automatically:

- `NODE_ENV=production`
- `PRODUCTION=true`
- `API_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`
- `VAULT_ENV_FILE=false`

`VAULT_ENV_FILE=false` tells the production entrypoint to use Cloudflare-injected env vars instead of waiting for the Docker Compose Vault Agent file.
`API_ENV` controls which Vault API base URL the Next.js server uses. Both Cloudflare staging and production use `API_URL_PRODUCTION`; set `API_ENV=development` only for an environment that can reach the development API and database.

## Vault Paths

The sync script currently reads:

- `kv/data/NEXTJS/NEXTJS-UI`
- `kv/data/GOOGLE_OAUTH`
- `kv/data/MICROSOFT_OAUTH`

For the OAuth paths, generic `client_id` and `client_secret` keys are also aliased to provider-specific Cloudflare secrets.

## DNS

`wrangler.jsonc` attaches the production Worker as a custom domain at `nextjs.ferozfaiz.com`. Cloudflare custom domains should use the exact hostname, not a `/*` route pattern. The hostname must be in a Cloudflare-managed zone and cannot already have a conflicting CNAME record.

The staging environment intentionally has no custom route. It uses `workers_dev = true`, so it is reachable at the generated `workers.dev` URL after deployment.
