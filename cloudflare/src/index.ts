import { Container, getRandom } from "@cloudflare/containers";
import { env as workerEnv } from "cloudflare:workers";

const DEFAULT_INSTANCE_COUNT = 3;

const STATIC_CONTAINER_ENV = {
  NODE_ENV: "production",
  PRODUCTION: "true",
  PORT: "3000",
  HOSTNAME: "0.0.0.0",
  VAULT_ENV_FILE: "false",
};

const CONTAINER_SECRET_NAMES = [
  "NEXT_SECURITY_SECRET",
  "CSRF_SECRET",
  "CSRF_ALGORITHM",
  "CSRF_SALT_LENGTH",
  "CSRF_HEADER_NAME",
  "CSRF_COOKIE_NAME",
  "CSRF_COOKIE_MAXAGE",
  "SESSION_COOKIE_MAXAGE",
  "API_URL_PRODUCTION",
  "API_URL_DEVELOPMENT",
  "API_URL_PREFIX",
  "API_URL_VERSION",
  "NEXTJS_OIDC_CLIENT_ID",
  "NEXTJS_OIDC_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "MICROSOFT_CLIENT_ID",
  "MICROSOFT_CLIENT_SECRET",
] as const;

const CONTAINER_VAR_NAMES = ["API_ENV"] as const;

const REQUIRED_SECRET_NAMES = [
  "NEXT_SECURITY_SECRET",
  "CSRF_SECRET",
  "API_URL_PREFIX",
  "API_URL_VERSION",
  "NEXTJS_OIDC_CLIENT_ID",
  "NEXTJS_OIDC_CLIENT_SECRET",
] as const;

type ContainerSecretName = (typeof CONTAINER_SECRET_NAMES)[number];
type ContainerVarName = (typeof CONTAINER_VAR_NAMES)[number];
type RequiredSecretName = (typeof REQUIRED_SECRET_NAMES)[number];
type RequiredApiUrlName = "API_URL_PRODUCTION" | "API_URL_DEVELOPMENT";

type SecretBindings = Partial<Record<ContainerSecretName, string>>;
type ConfigBindings = Partial<Record<ContainerVarName, string>>;

export interface Env extends SecretBindings, ConfigBindings {
  NEXTJS_UI: DurableObjectNamespace<NextjsUI>;
  CONTAINER_INSTANCE_COUNT?: string;
}

function buildContainerEnv(envSource: SecretBindings & ConfigBindings): Record<string, string> {
  const containerEnv: Record<string, string> = { ...STATIC_CONTAINER_ENV };

  for (const name of [...CONTAINER_SECRET_NAMES, ...CONTAINER_VAR_NAMES]) {
    const value = envSource[name];

    if (typeof value === "string" && value.length > 0) {
      containerEnv[name] = value;
    }
  }

  return containerEnv;
}

function useDevelopmentApi(envSource: ConfigBindings): boolean {
  return ["development", "dev", "local"].includes(
    envSource.API_ENV?.toLowerCase() ?? "",
  );
}

function requiredApiUrlName(envSource: ConfigBindings): RequiredApiUrlName {
  return useDevelopmentApi(envSource) ? "API_URL_DEVELOPMENT" : "API_URL_PRODUCTION";
}

function missingRequiredSecrets(
  envSource: SecretBindings & ConfigBindings,
): Array<RequiredSecretName | RequiredApiUrlName> {
  return [...REQUIRED_SECRET_NAMES, requiredApiUrlName(envSource)].filter(
    (name) => !envSource[name],
  );
}

function getContainerInstanceCount(envSource: Env): number {
  const configuredCount = Number(envSource.CONTAINER_INSTANCE_COUNT);

  if (Number.isInteger(configuredCount) && configuredCount > 0) {
    return configuredCount;
  }

  return DEFAULT_INSTANCE_COUNT;
}

export class NextjsUI extends Container {
  defaultPort = 3000;
  sleepAfter = "10m";
  envVars = buildContainerEnv(workerEnv as unknown as SecretBindings);

  override onStart() {
    console.log("NextjsUI container started");
  }

  override onStop({ exitCode, reason }: { exitCode?: number; reason?: string }) {
    console.log("NextjsUI container stopped", { exitCode, reason });
  }

  override onError(error: unknown) {
    console.error("NextjsUI container error", error);
    throw error;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const missing = missingRequiredSecrets(env);

    if (missing.length > 0) {
      return new Response(`Missing Cloudflare Worker secrets: ${missing.join(", ")}`, {
        status: 500,
      });
    }

    const container = await getRandom(env.NEXTJS_UI, getContainerInstanceCount(env));
    return container.fetch(request);
  },
};
