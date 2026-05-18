#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const DEFAULT_ENV_FILE = "/vault/secrets/app.env";
const DEFAULT_TIMEOUT_SECONDS = 120;
const WAIT_INTERVAL_MS = 2000;

function log(message) {
  console.log(`[entrypoint] ${message}`);
}

function waitForEnvFile(path, timeoutSeconds) {
  const deadline = Date.now() + timeoutSeconds * 1000;

  while (!existsSync(path) || statSync(path).size === 0) {
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for Vault env file: ${path}`);
    }

    log(`Waiting for Vault env file at ${path}`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, WAIT_INTERVAL_MS);
  }
}

function parseEnvValue(value) {
  const trimmed = value.trim();

  if (trimmed.startsWith('"')) {
    return JSON.parse(trimmed);
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvFile(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  let loaded = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1);

    if (!key) {
      continue;
    }

    process.env[key] = parseEnvValue(value);
    loaded += 1;
  }

  log(`Loaded ${loaded} values from ${path}`);
}

function runCommand(args) {
  const command = args.length > 0 ? args : ["node", "apps/appone/server.js"];
  const runAsUser = process.env.RUN_AS_USER ?? "nextjs:nodejs";
  const finalCommand =
    runAsUser.toLowerCase() === "false"
      ? command
      : ["su-exec", runAsUser, ...command];

  log(`Starting command: ${finalCommand.join(" ")}`);

  const child = spawn(finalCommand[0], finalCommand.slice(1), {
    env: process.env,
    stdio: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

const envFile = process.env.VAULT_ENV_FILE ?? DEFAULT_ENV_FILE;
const timeoutSeconds = Number.parseInt(
  process.env.VAULT_ENV_TIMEOUT ?? `${DEFAULT_TIMEOUT_SECONDS}`,
  10,
);

waitForEnvFile(envFile, timeoutSeconds);
loadEnvFile(envFile);
runCommand(process.argv.slice(2));
