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
  dataSerializer?: (data: any) => any;
  dataDecoder?: (data: any) => any;
}
/**
 * Encodes a Uint8Array into a Base64URL string using edge runtime compatible methods.
 *
 * @param {Uint8Array} data - The Uint8Array to encode.
 * @returns {string} - The Base64URL-encoded string.
 * @throws {Error} - If Base64 encoding is not supported.
 */
export function encodeBase64(data: Uint8Array): string {
  if (typeof btoa !== 'function') {
    throw new Error('Base64 encoding is not supported in this environment.');
  }

  // Convert Uint8Array to binary string
  const binary = Array.from(data)
    .map((byte) => String.fromCharCode(byte))
    .join('');

  // Encode binary string to Base64
  const base64 = btoa(binary);

  // Convert Base64 to Base64URL by replacing characters and removing padding
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return base64url;
}

/**
 * Decodes a Base64URL string into a Uint8Array using edge runtime compatible methods.
 *
 * @param {string} base64url - The Base64URL-encoded string to decode.
 * @returns {Uint8Array} - The decoded Uint8Array.
 * @throws {Error} - If the Base64URL string is invalid or decoding fails.
 */
export function decodeBase64(base64url: string): Uint8Array {
  if (typeof atob !== 'function') {
    throw new Error('Base64 decoding is not supported in this environment.');
  }

  try {
    // Convert Base64URL to Base64 by replacing characters
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

    // Pad with '=' to make the length a multiple of 4
    const paddingNeeded = 4 - (base64.length % 4);
    if (paddingNeeded !== 4) {
      base64 += '='.repeat(paddingNeeded);
    }

    // Decode Base64 string to binary string
    const binaryString = atob(base64);

    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    throw new Error('Invalid Base64URL string provided for decoding.');
  }
}

export const defaultDataSerializer = (data: unknown): Uint8Array => {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  } else if (typeof data === 'object' && data !== null && !(data instanceof Uint8Array)) {
    return new TextEncoder().encode(JSON.stringify(data));
  } else if (data instanceof Uint8Array) {
    return data;
  } else {
    return new TextEncoder().encode(String(data));
  }
};

export const defaultDataDecoder = (data: Uint8Array): unknown => {
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
  dataDecoder: defaultDataDecoder,
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

/**
 * Generates cryptographically secure random bytes.
 *
 * @param byteLength - The number of random bytes to generate.
 * @returns A Uint8Array containing random bytes.
 */
function generateRandomBytes(byteLength: number): Uint8Array {
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  return randomBytes;
}

/**
 * Combines multiple Uint8Arrays into a single Uint8Array.
 *
 * @param arrays - An array of Uint8Arrays to combine.
 * @returns A new Uint8Array containing all combined bytes.
 */
function combineUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    combined.set(arr, offset);
    offset += arr.length;
  }
  return combined;
}

/**
 * Appends a part to the token parts array if the condition is met.
 *
 * @param parts - The array of token parts.
 * @param condition - The condition to check.
 * @param part - The part to append if the condition is true.
 */
function appendPartIf<T>(parts: T[], condition: boolean, part: T): void {
  if (condition) {
    parts.push(part);
  }
}

/**
 * Creates a timestamp byte array if the token is timed.
 *
 * @param timed - Whether the token is timed.
 * @param serializer - Function to serialize the timestamp.
 * @returns A Uint8Array containing the timestamp or an empty array.
 */
function createTimestampBytes(timed: boolean, serializer: (data: unknown) => Uint8Array): Uint8Array {
  if (timed) {
    const now = Date.now();
    return serializer(now);
  }
  return new Uint8Array();
}

/**
 * Signs the combined data using the provided HMAC key.
 *
 * @param key - The CryptoKey used for signing.
 * @param data - The data to sign.
 * @returns A Promise that resolves to the signature as a Uint8Array.
 */
async function signData(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  return new Uint8Array(signatureBuffer);
}

/**
 * Generates a secure token by combining random bytes, optional data, and a signature.
 *
 * @param key - The CryptoKey used for HMAC signing.
 * @param data - Optional data to include in the token.
 * @param showData - Whether to include the serialized data in the token.
 * @param timed - Whether the token should include a timestamp.
 * @param tokenByteLength - The length of the random byte segment.
 * @param seperator - The character used to separate token parts.
 * @param serializer - Function to serialize data into Uint8Array.
 * @returns A Promise that resolves to the generated token string.
 */
export async function generateToken(
  key: CryptoKey,
  data: unknown,
  showData: boolean,
  timed: boolean,
  tokenByteLength: number,
  seperator: string,
  serializer: (data: unknown) => Uint8Array
): Promise<string> {
  const parts: string[] = [];

  // Generate random bytes
  const randomBytes = generateRandomBytes(tokenByteLength);

  // Serialize data if provided
  const dataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

  // Append serialized data if showData is true and data exists
  appendPartIf(parts, showData && dataBytes.length > 0, encodeBase64(dataBytes));

  // Create timestamp bytes if timed
  const timestampBytes = createTimestampBytes(timed, serializer);

  // Combine random bytes, data bytes, and timestamp bytes
  const combined = combineUint8Arrays(randomBytes, dataBytes, timestampBytes);

  // Append timestamp to parts if timed
  appendPartIf(parts, timed, encodeBase64(timestampBytes));

  const signature = await signData(key, combined);

  // Append random bytes and signature to parts
  parts.push(encodeBase64(randomBytes));
  parts.push(encodeBase64(signature));

  return parts.join(seperator);
}

/**
 * Splits and trims the token into its constituent parts.
 *
 * @param token - The token string to split.
 * @param seperator - The seperator used in the token.
 * @returns An array of trimmed token parts.
 */
function splitAndTrimToken(token: string, seperator: string): string[] {
  return token.split(seperator).map((part) => part.trim());
}

/**
 * Extracts token parts based on the presence of data and timestamp.
 *
 * @param parts - The array of token parts.
 * @param showData - Whether the token includes data.
 * @param timed - Whether the token includes a timestamp.
 * @returns An object containing the extracted Base64 parts.
 */
function extractTokenParts(
  parts: string[],
  showData: boolean,
  timed: boolean
): {
  dataBase64?: string;
  timeBase64?: string;
  randomBase64: string;
  signatureBase64: string;
} | null {
  let idx = 0;
  let dataBase64: string | undefined;
  let timeBase64: string | undefined;
  let randomBase64: string | undefined;
  let signatureBase64: string | undefined;

  // If showData is true, the first part is the base64-encoded data.
  if (showData) {
    if (idx >= parts.length) return null;
    dataBase64 = parts[idx++] || '';
  }

  // If timed is true, the next part is the base64-encoded timestamp.
  if (timed) {
    if (idx >= parts.length) return null;
    timeBase64 = parts[idx++] || '';
  }

  // Next is always the base64-encoded random bytes.
  if (idx >= parts.length) return null;
  randomBase64 = parts[idx++] || '';

  // Finally, the last part is the signature.
  if (idx >= parts.length) return null;
  signatureBase64 = parts[idx++] || '';

  // If there are any leftover parts, format is invalid.
  if (idx !== parts.length) return null;

  return {
    dataBase64,
    timeBase64,
    randomBase64,
    signatureBase64,
  };
}

/**
 * Compares two Uint8Arrays for equality.
 *
 * @param a - The first Uint8Array.
 * @param b - The second Uint8Array.
 * @returns True if both arrays are equal, false otherwise.
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Extracts and verifies the timestamp from the token.
 *
 * @param timeBase64 - The Base64-encoded timestamp.
 * @param serializer - Function to serialize the timestamp.
 * @returns The timestamp as a number or null if invalid.
 */
function extractTimestamp(timeBase64: string): number | null {
  try {
    const timeBytes = decodeBase64(timeBase64);
    const timeStr = defaultDataDecoder(timeBytes) as string;
    const tokenTime = parseInt(timeStr, 10);
    if (isNaN(tokenTime)) return null;
    return tokenTime;
  } catch {
    return null;
  }
}

/**
 * Handles data bytes by decoding, serializing, and comparing with expected data.
 *
 * @param data - The expected data.
 * @param dataBase64 - The Base64 encoded data from the token.
 * @param serializer - Function to serialize data.
 * @returns The decoded data bytes or null if comparison fails.
 */
async function handleAndCompareData(
  data: unknown,
  dataBase64: string,
  serializer: (data: unknown) => Uint8Array
): Promise<Uint8Array | null> {
  try {
    const extractedDataBytes = decodeBase64(dataBase64);
    if (!extractedDataBytes) return null;

    const expectedDataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

    if (!arraysEqual(extractedDataBytes, expectedDataBytes)) {
      return null; // Data mismatch
    }

    return extractedDataBytes;
  } catch {
    return null; // Invalid Base64 encoding or other errors
  }
}

/**
 * Verifies the integrity and validity of a submitted token.
 *
 * @param key - The CryptoKey used for HMAC verification.
 * @param submitted - The submitted token string.
 * @param data - The expected data to verify against.
 * @param showData - Whether the token includes data.
 * @param timed - Whether the token includes a timestamp.
 * @param seperator - The seperator used in the token.
 * @param serializer - Function to serialize data into Uint8Array.
 * @param maxAgeMs - Optional maximum age in milliseconds for token validity.
 * @returns A Promise that resolves to true if the token is valid, false otherwise.
 */
export async function verifyToken(
  key: CryptoKey,
  submitted: string,
  data: unknown, // The 'expected' data you want to verify against
  showData: boolean,
  timed: boolean,
  seperator: string,
  serializer: (data: unknown) => Uint8Array,
  maxAgeMs?: number // Optional expiration check in milliseconds
): Promise<boolean> {
  // Split and trim the submitted token string into parts.
  const parts = splitAndTrimToken(submitted, seperator);

  // Extract token parts based on showData and timed flags.
  const extractedParts = extractTokenParts(parts, showData, timed);
  if (!extractedParts) return false;

  const { dataBase64, timeBase64, randomBase64, signatureBase64 } = extractedParts;

  let randomBytes: Uint8Array;
  try {
    randomBytes = decodeBase64(randomBase64);
  } catch {
    return false;
  }

  // Handle data bytes.
  const dataBytes = showData && dataBase64 ? await handleAndCompareData(data, dataBase64, serializer) : serializer(data);
  if (showData && dataBase64 && dataBytes === null) {
    return false;
  }

  // Combine random bytes and data bytes.
  let finalCombined = combineUint8Arrays(randomBytes, dataBytes as Uint8Array);
  let tokenTime: number | null = null;

  // Handle timestamp bytes if the token is timed.
  if (timed && timeBase64) {
    tokenTime = extractTimestamp(timeBase64);
    if (tokenTime === null) return false; // Corrupted or invalid timestamp

    // Serialize the timestamp as it was during token generation.
    const timeBytes = serializer(tokenTime);

    // Append the timestamp bytes to the combined data.
    finalCombined = combineUint8Arrays(finalCombined, timeBytes);
  }

  // Decode the signature from Base64.
  let signatureBytes: Uint8Array;
  try {
    signatureBytes = decodeBase64(signatureBase64);
  } catch {
    return false; // Invalid Base64 encoding for signature
  }

  let isVerified: boolean;
  try {
    isVerified = await crypto.subtle.verify('HMAC', key, signatureBytes, finalCombined);
  } catch {
    return false;
  }

  if (!isVerified) {
    return false;
  }

  // Verify the token's age if maxAgeMs is provided.
  if (maxAgeMs && tokenTime) {
    const currentTime = Date.now();
    if (currentTime - tokenTime > maxAgeMs) {
      return false;
    }
  }

  return true;
}

/**
 * Determines if the provided data is considered an edge case.
 *
 * @param data - The data to check.
 * @returns True if data is an edge case, false otherwise.
 */
export function isEdgeCase(data: any): boolean {
  // const edgeCases = [undefined, null, '', 0, false, {}, []];
  if (data === undefined || data === null) return true;
  if (data === '' || data === 0 || data === false) return true;
  if (typeof data === 'object') {
    if (Array.isArray(data)) return data.length === 0;
    return Object.keys(data).length === 0;
  }
  return false;
}

interface edgeTokenType {
  options: Options;
  generate: (data?: unknown) => Promise<string>;
  verify: (submitted: string, data?: unknown) => Promise<boolean>;
  generateWithData: (data: unknown) => Promise<string>;
  verifyWithData: (submitted: string, data: unknown) => Promise<boolean>;
  generateTimed: (data?: unknown) => Promise<string>;
  verifyTimed: (submitted: string, data: unknown, maxAgeMs: number) => Promise<boolean>;
  generateWithDataTimed: (data: unknown) => Promise<string>;
  verifyWithDataTimed: (submitted: string, data: unknown, maxAgeMs: number) => Promise<boolean>;
}

/**
 * Create a CSRF utility object from user options merged with defaults.
 * Users can generate and verify tokens that are tied to optional additional data.
 * Custom data serializers can be provided to handle different data types.
 */
export async function edgeToken(userOptions: Partial<Options>): Promise<edgeTokenType> {
  const options = mergeExtendedOptions(userOptions);

  // Ensure tokenByteLength is valid
  if (options.tokenByteLength <= 0) {
    options.tokenByteLength = defaultOptions.tokenByteLength;
  }

  const key = await getHmacKey(options.secret, options.algorithm);

  // Helper function to sanitize data
  const sanitizeData = (data: unknown): unknown => (isEdgeCase(data) ? '' : data);

  // Helper function to generate token
  const createToken = async (
    data: unknown,
    showData: boolean,
    timed: boolean,
    tokenByteLength = options.tokenByteLength,
    seperator = options.seperator,
    dataSerializer = options.dataSerializer
  ): Promise<string> => {
    data = sanitizeData(data);
    return generateToken(key, data, showData && Boolean(data), timed, tokenByteLength, seperator, dataSerializer);
  };

  // Helper function to verify token
  const checkToken = async (
    submitted: string,
    data: unknown,
    showData: boolean,
    timed: boolean,
    seperator = options.seperator,
    dataSerializer = options.dataSerializer,
    maxAgeMs?: number
  ): Promise<boolean> => {
    data = sanitizeData(data);
    return verifyToken(key, submitted, data, showData && Boolean(data), timed, seperator, dataSerializer, maxAgeMs);
  };

  return {
    options,

    /**
     * Generate a simple token without data and without timing.
     */
    generate: () => createToken('', false, false),

    /**
     * Verify a simple token with or without data and without timing.
     */
    verify: (submitted: string, data: unknown = '') => checkToken(submitted, data, false, false),

    /**
     * Generate a token with embedded data but without timing.
     */
    generateWithData: (data: unknown) => createToken(data, Boolean(data), false),

    /**
     * Verify a token with embedded data but without timing.
     */
    verifyWithData: (submitted: string, data: unknown) => checkToken(submitted, data, Boolean(data), false),

    /**
     * Generate a timed token without embedded data.
     */
    generateTimed: (data: unknown = '') => createToken(data, false, true),

    /**
     * Verify a timed token without embedded data.
     * @param maxAgeMs The maximum age in milliseconds the token is valid for.
     */
    verifyTimed: (submitted: string, data: unknown = '', maxAgeMs: number) =>
      checkToken(submitted, data, false, true, options.seperator, options.dataSerializer, maxAgeMs),

    /**
     * Generate a timed token with embedded data.
     */
    generateWithDataTimed: (data: unknown) => createToken(data, Boolean(data), true),

    /**
     * Verify a timed token with embedded data.
     * @param maxAgeMs The maximum age in milliseconds the token is valid for.
     */
    verifyWithDataTimed: (submitted: string, data: unknown, maxAgeMs: number) =>
      checkToken(submitted, data, Boolean(data), true, options.seperator, options.dataSerializer, maxAgeMs),
  };
}
