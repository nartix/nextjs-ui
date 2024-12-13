import 'server-only';

export interface CsrfOptions {
  /**
   * The secret used to derive the HMAC key.
   * Must be a secure, random string.
   */
  secret: string;

  /**
   * The name of the hash algorithm to use for HMAC.
   * Supported values include "SHA-1", "SHA-256", "SHA-384", "SHA-512".
   * Defaults to "SHA-256".
   */
  algorithm?: AlgorithmIdentifier;

  /**
   * The byte length of the random token portion.
   * Defaults to 32 bytes.
   */
  tokenByteLength?: number;
}

const defaultOptions: Required<CsrfOptions> = {
  secret: '',
  algorithm: 'SHA-256',
  tokenByteLength: 32,
};

/**
 * Merge user provided CsrfOptions with the default options.
 */
export function mergeOptions(userOptions: Partial<CsrfOptions>): Required<CsrfOptions> {
  return {
    ...defaultOptions,
    ...userOptions,
  };
}

/**
 * Derive a CryptoKey from a secret and an HMAC algorithm using the Web Crypto API.
 */
export async function getHmacKey(secret: string, algorithm: AlgorithmIdentifier): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: algorithm }, false, ['sign', 'verify']);
}

/**
 * Generate a CSRF token using HMAC for integrity.
 * Produces a token and a signature, returned as `token.signature` base64-encoded string.
 */
export async function generateHmacToken(key: CryptoKey, tokenByteLength: number): Promise<string> {
  const tokenBytes = new Uint8Array(tokenByteLength);
  crypto.getRandomValues(tokenBytes);

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, tokenBytes);

  const tokenBase64 = btoa(String.fromCharCode(...tokenBytes));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return `${tokenBase64}.${signatureBase64}`;
}

/**
 * Verify a submitted CSRF token against an HMAC key.
 * Checks that the signature matches the token's content.
 */
export async function verifyHmacToken(key: CryptoKey, submitted: string): Promise<boolean> {
  const [tokenBase64, signatureBase64] = submitted.split('.');
  if (!tokenBase64 || !signatureBase64) {
    return false;
  }

  const tokenBytes = Uint8Array.from(atob(tokenBase64), (c) => c.charCodeAt(0));
  const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

  return crypto.subtle.verify('HMAC', key, signatureBytes, tokenBytes);
}

/**
 * Create a CSRF utility object from user options merged with defaults.
 * This object provides methods to generate and verify CSRF tokens using HMAC.
 */
export async function getCsrf(userOptions: Partial<CsrfOptions>) {
  const options = mergeOptions(userOptions);
  const key = await getHmacKey(options.secret, options.algorithm);

  async function generateCsrfToken(): Promise<string> {
    return generateHmacToken(key, options.tokenByteLength);
  }

  async function verifyCsrfToken(submitted: string): Promise<boolean> {
    return verifyHmacToken(key, submitted);
  }

  return {
    options,
    generateCsrfToken,
    verifyCsrfToken,
  };
}
