# Vault Agent Docker Compose

This deployment keeps Vault access out of the Next.js image. Vault Agent renders
runtime environment variables into a shared tmpfs volume, and the Next.js
container reads `/vault/secrets/app.env` before starting the standalone server.

## Local Token File

Vault Agent reads the Vault address from `VAULT_ADDR`; it is not hardcoded in
the Compose file or agent config.

Set the Vault address and create a local token file before starting Compose:

```sh
export VAULT_ADDR='<vault-address>'
printf '%s' '<vault-token>' > vault-agent/.vault-token
chmod 600 vault-agent/.vault-token
```

The token file is ignored by git and excluded from the Docker build context. You
can also put `VAULT_ADDR=<vault-address>` in a local `.env` file because Docker
Compose reads it automatically.

To use a token file in another location:

```sh
VAULT_ADDR='<vault-address>' VAULT_TOKEN_FILE=/path/to/token docker compose -f docker-compose.prod.yml up -d
```

## Build And Run

Build the local production image:

```sh
docker compose -f docker-compose.prod.yml build
```

Start the deployment:

```sh
docker compose -f docker-compose.prod.yml up -d
```

The local production image is tagged as `nextjs-ui:local`.

By default, the app binds to `127.0.0.1:13000`. Override it with:

```sh
NEXTJS_UI_PORT=13001 docker compose -f docker-compose.prod.yml up -d
```

## Verify

Check that Vault Agent is healthy and rendered the secret file:

```sh
docker compose -f docker-compose.prod.yml ps vault-agent
docker compose -f docker-compose.prod.yml logs --tail=50 vault-agent
```

The app container reads:

```text
/vault/secrets/app.env
```
