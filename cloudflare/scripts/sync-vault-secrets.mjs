#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const cloudflareDir = resolve(repoRoot, "cloudflare");
const manifestPath =
  process.env.CLOUDFLARE_SECRETS_MANIFEST ??
  resolve(cloudflareDir, "secrets.manifest.json");
const wranglerConfig =
  process.env.WRANGLER_CONFIG ?? resolve(cloudflareDir, "wrangler.jsonc");
const cloudflareEnv = process.env.CLOUDFLARE_ENV?.trim();
const dryRun = process.env.DRY_RUN === "true";

const secretNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const secretPutDelayMs = readPositiveInteger(process.env.SECRET_SYNC_DELAY_MS, 1500);
const secretPutMaxAttempts = readPositiveInteger(
  process.env.SECRET_SYNC_MAX_ATTEMPTS,
  5,
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    const spawnError = result.error?.message;
    const signal = result.signal ? `signal ${result.signal}` : undefined;
    const exitCode =
      result.status === null || result.status === undefined
        ? undefined
        : `exit code ${result.status}`;
    const detail =
      [spawnError, stderr, stdout, signal, exitCode].filter(Boolean).join("; ") ||
      "unknown error";
    throw new Error(`${command} ${args.join(" ")} failed: ${detail}`);
  }

  return result.stdout;
}

function sleep(ms) {
  if (ms <= 0) {
    return;
  }

  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isThrottleError(error) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("[code: 971]") ||
    message.includes("Please wait and consider throttling") ||
    message.includes("[code: 429]") ||
    message.includes("Too Many Requests")
  );
}

function assertVaultCliAvailable() {
  try {
    run("vault", ["version"]);
  } catch (error) {
    throw new Error(
      [
        "Vault CLI is required to sync Worker secrets.",
        "Install HashiCorp Vault and make sure `vault` is on PATH, then retry.",
        `Original error: ${error.message}`,
      ].join(" "),
    );
  }
}

function toVaultKvCliPath(path) {
  const kvV2ApiPath = path.match(/^([^/]+)\/data\/(.+)$/);
  return kvV2ApiPath ? `${kvV2ApiPath[1]}/${kvV2ApiPath[2]}` : path;
}

function vaultKvGet(path) {
  const output = run("vault", ["kv", "get", "-format=json", toVaultKvCliPath(path)]);
  const parsed = JSON.parse(output);
  const data = parsed?.data?.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Vault path ${path} did not return a KV v2 data object`);
  }

  return data;
}

function normalizeSecretValue(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function assertValidSecretName(name) {
  if (!secretNamePattern.test(name)) {
    throw new Error(`Invalid Worker secret binding name: ${name}`);
  }
}

function addSecret(secrets, name, value) {
  assertValidSecretName(name);

  if (value === undefined || value === null) {
    return;
  }

  secrets.set(name, normalizeSecretValue(value));
}

function putWorkerSecret(name, value) {
  const envArgs = cloudflareEnv ? ["--env", cloudflareEnv] : [];

  if (dryRun) {
    const envLabel = cloudflareEnv ? ` to ${cloudflareEnv}` : "";
    console.log(`[dry-run] would sync ${name}${envLabel}`);
    return;
  }

  const args = [
    "--prefix",
    cloudflareDir,
    "exec",
    "--",
    "wrangler",
    "secret",
    "put",
    name,
    "--config",
    wranglerConfig,
    ...envArgs,
  ];

  for (let attempt = 1; attempt <= secretPutMaxAttempts; attempt += 1) {
    try {
      run("npm", args, { input: value });

      const envLabel = cloudflareEnv ? ` to ${cloudflareEnv}` : "";
      console.log(`Synced ${name}${envLabel}`);
      sleep(secretPutDelayMs);
      return;
    } catch (error) {
      const canRetry = attempt < secretPutMaxAttempts && isThrottleError(error);

      if (!canRetry) {
        throw error;
      }

      const delayMs = Math.min(secretPutDelayMs * 2 ** attempt, 60_000);
      console.warn(
        `Cloudflare throttled secret ${name}; retrying in ${Math.round(
          delayMs / 1000,
        )}s (${attempt}/${secretPutMaxAttempts})`,
      );
      sleep(delayMs);
    }
  }
}

function collectSecrets(manifest) {
  const secrets = new Map();

  for (const vaultPath of manifest.vaultPaths ?? []) {
    const data = vaultKvGet(vaultPath.path);

    if (vaultPath.copyAll) {
      for (const [name, value] of Object.entries(data)) {
        addSecret(secrets, name, value);
      }
    }

    for (const [sourceName, targetName] of Object.entries(vaultPath.aliases ?? {})) {
      if (Object.hasOwn(data, sourceName)) {
        addSecret(secrets, targetName, data[sourceName]);
      }
    }
  }

  return secrets;
}

function warnForMissingRequiredSecrets(manifest, secrets) {
  const missing = (manifest.requiredWorkerSecrets ?? []).filter(
    (name) => !secrets.has(name),
  );

  if (missing.length > 0) {
    console.warn(
      `Warning: required Worker secrets were not found in Vault data: ${missing.join(", ")}`,
    );
  }
}

const manifest = readJson(manifestPath);
assertVaultCliAvailable();
const secrets = collectSecrets(manifest);

warnForMissingRequiredSecrets(manifest, secrets);

for (const [name, value] of [...secrets.entries()].sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  putWorkerSecret(name, value);
}
