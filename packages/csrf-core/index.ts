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

  /**
   * A function to serialize data into a Uint8Array before signing.
   * Defaults to:
   * - string: UTF-8 encoding of the string
   * - object: JSON.stringify + UTF-8
   * - Uint8Array: used directly
   * - others: `String(data)` and then UTF-8 encode
   */
  dataSerializer?: (data: unknown) => Uint8Array;
}

// Define and export the default serializer function
export const defaultDataSerializer = (data: unknown): Uint8Array => {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  } else if (typeof data === 'object' && data !== null && !(data instanceof Uint8Array)) {
    return new TextEncoder().encode(JSON.stringify(data));
  } else if (data instanceof Uint8Array) {
    return data;
  } else {
    // Fallback: Convert to string
    return new TextEncoder().encode(String(data));
  }
};

const defaultOptions: Required<CsrfOptions> = {
  secret: '',
  algorithm: 'SHA-256',
  tokenByteLength: 32,
  dataSerializer: defaultDataSerializer,
};

/**
 * Merge user provided CsrfOptions with the default options.
 */
export function mergeExtendedOptions(userOptions: Partial<CsrfOptions>): Required<CsrfOptions> {
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
 * Generate a CSRF token, tying it to the provided data by signing
 * the combination of random token bytes and the serialized data.
 */
export async function generateToken(
  key: CryptoKey,
  data: unknown,
  tokenByteLength: number,
  serializer: (data: unknown) => Uint8Array
): Promise<string> {
  const tokenBytes = new Uint8Array(tokenByteLength);
  crypto.getRandomValues(tokenBytes);

  let combined: Uint8Array;

  if (data !== undefined && data !== null) {
    const dataBytes = serializer(data);
    combined = new Uint8Array(tokenBytes.byteLength + dataBytes.byteLength);
    combined.set(tokenBytes);
    combined.set(dataBytes, tokenBytes.byteLength);
  } else {
    // No data provided, just sign the token bytes alone
    combined = tokenBytes;
  }

  // Sign the data
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, combined);

  const tokenBase64 = btoa(String.fromCharCode(...tokenBytes));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return `${tokenBase64}.${signatureBase64}`;
}

/**
 * Verify a CSRF token by re-computing the signature over the
 * combination of the token bytes and the provided data.
 */
export async function verifyToken(
  key: CryptoKey,
  submitted: string,
  data: unknown,
  serializer: (data: unknown) => Uint8Array
): Promise<boolean> {
  const [tokenBase64, signatureBase64] = submitted.split('.');
  if (!tokenBase64 || !signatureBase64) return false;

  const tokenBytes = Uint8Array.from(atob(tokenBase64), (c) => c.charCodeAt(0));

  let combined: Uint8Array;

  if (data !== undefined && data !== null) {
    const dataBytes = serializer(data);
    combined = new Uint8Array(tokenBytes.byteLength + dataBytes.byteLength);
    combined.set(tokenBytes);
    combined.set(dataBytes, tokenBytes.byteLength);
  } else {
    // No data provided, just verify token bytes alone
    combined = tokenBytes;
  }

  const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

  return crypto.subtle.verify('HMAC', key, signatureBytes, combined);
}

/**
 * Create a CSRF utility object from user options merged with defaults.
 * Users can generate and verify tokens that are tied to optional additional data.
 * Custom data serializers can be provided to handle different data types.
 */
export async function getCsrf(userOptions: Partial<CsrfOptions>) {
  const options = mergeExtendedOptions(userOptions);
  const key = await getHmacKey(options.secret, options.algorithm);

  return {
    options,
    async generateToken(data: unknown = ''): Promise<string> {
      return generateToken(key, data, options.tokenByteLength, options.dataSerializer);
    },

    async verifyToken(submitted: string, data: unknown = ''): Promise<boolean> {
      return verifyToken(key, submitted, data, options.dataSerializer);
    },
  };
}
