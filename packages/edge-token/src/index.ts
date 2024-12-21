import 'server-only';

export interface Options {
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
   * The character used to separate the token and signature in the serialized token.
   * Defaults to ".".
   */
  seperator?: string;

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

const defaultDataDecoder = (data: Uint8Array): unknown => {
  const decodedString = new TextDecoder().decode(data);
  try {
    const parsedData = JSON.parse(decodedString);
    return parsedData;
  } catch (e) {
    // If it's not JSON, return the decoded string
    return decodedString;
  }
};

const defaultOptions: Required<Options> = {
  secret: '',
  algorithm: 'SHA-256',
  tokenByteLength: 32,
  seperator: '.',
  dataSerializer: defaultDataSerializer,
};

/**
 * Merge user provided CsrfOptions with the default options.
 */
export function mergeExtendedOptions(userOptions: Partial<Options>): Required<Options> {
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

export async function generateToken(
  key: CryptoKey,
  data: unknown,
  validityTime: number,
  tokenByteLength: number,
  seperator: string,
  serializer: (data: unknown) => Uint8Array
): Promise<string> {
  const tokenBytes = new Uint8Array(tokenByteLength);
  crypto.getRandomValues(tokenBytes);

  const dataBytes = (data !== undefined && data !== null)
    ? serializer(data)
    : new Uint8Array();

  const combined = new Uint8Array(tokenBytes.byteLength + dataBytes.byteLength);
  combined.set(tokenBytes);
  combined.set(dataBytes, tokenBytes.byteLength);

  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, combined));

  const tokenBase64 = btoa(String.fromCharCode(...tokenBytes));
  const signatureBase64 = btoa(String.fromCharCode(...signature));

  return `${tokenBase64}${seperator}${signatureBase64}`;
}

export async function verifyToken(
  key: CryptoKey,
  submitted: string,
  data: unknown,
  seperator: string,
  serializer: (data: unknown) => Uint8Array
): Promise<boolean> {
  const [tokenBase64, signatureBase64] = submitted.split(seperator);
  if (!tokenBase64 || !signatureBase64) return false;

  const tokenBytes = Uint8Array.from(atob(tokenBase64), c => c.charCodeAt(0));
  const dataBytes = (data !== undefined && data !== null)
    ? serializer(data)
    : new Uint8Array();

  const combined = new Uint8Array(tokenBytes.byteLength + dataBytes.byteLength);
  combined.set(tokenBytes);
  combined.set(dataBytes, tokenBytes.byteLength);

  const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
  
  return crypto.subtle.verify('HMAC', key, signatureBytes, combined);
}


/**
 * Create a CSRF utility object from user options merged with defaults.
 * Users can generate and verify tokens that are tied to optional additional data.
 * Custom data serializers can be provided to handle different data types.
 */
export async function edgeToken(userOptions: Partial<Options>) {
  const options = mergeExtendedOptions(userOptions);
  const key = await getHmacKey(options.secret, options.algorithm);

  return {
    options,
    async generate(data: unknown = ''): Promise<string> {
      return generateToken(key, data, 0, options.tokenByteLength, options.seperator, options.dataSerializer);
    },

    async verify(submitted: string, data: unknown = ''): Promise<boolean> {
      return verifyToken(key, submitted, data, options.seperator, options.dataSerializer);
    },
  };
}
