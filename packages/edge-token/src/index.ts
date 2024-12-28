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
 * Encodes a Uint8Array into a Base64 string.
 *
 * @param data - The Uint8Array to encode.
 * @returns The Base64-encoded string.
 * @throws If no suitable Base64 encoding method is available.
 */
export function encodeBase64(data: Uint8Array): string {
  if (typeof btoa !== 'undefined') {
    // Convert Uint8Array to binary string
    let binary = '';
    const len = data.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i] ?? 0);
    }
    return btoa(binary);
  } else {
    throw new Error('No suitable Base64 encoding method available.');
  }
}

/**
 * Decodes a Base64 string into a Uint8Array.
 *
 * Edge Runtime Compatible Implementation:
 * - Utilizes the `atob` function, which is available in Edge environments.
 *
 * @param base64 - The Base64 string to decode.
 * @returns The decoded Uint8Array.
 * @throws If the Base64 string is invalid or decoding fails.
 */
export function decodeBase64(base64: string): Uint8Array {
  try {
    // Decode the Base64 string to a binary string
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    // Convert each character to its byte value
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    // Handle errors (e.g., invalid Base64 string)
    throw new Error('Invalid Base64 string provided for decoding.');
  }
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
 * @param separator - The character used to separate token parts.
 * @param serializer - Function to serialize data into Uint8Array.
 * @returns A Promise that resolves to the generated token string.
 */
export async function generateToken(
  key: CryptoKey,
  data: unknown,
  showData: boolean,
  timed: boolean,
  tokenByteLength: number,
  separator: string,
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

  // Sign the combined data
  const signature = await signData(key, combined);

  // Append random bytes and signature to parts
  parts.push(encodeBase64(randomBytes));
  parts.push(encodeBase64(signature));

  // Join all parts using the specified separator
  return parts.join(separator);
}

// export async function verifyToken(
//   key: CryptoKey,
//   submitted: string,
//   data: unknown, // The 'expected' data you want to verify against
//   showData: boolean, // Matches generateToken’s 'showData'
//   timed: boolean, // Matches generateToken’s 'timed'
//   separator: string,
//   serializer: (data: unknown) => Uint8Array,
//   maxAgeMs?: number // Optional expiration check in milliseconds
// ): Promise<boolean> {
//   // Split the submitted token string into parts.
//   const parts = submitted.split(separator);

//   // Because 'showData' and 'timed' can vary, we will parse from left to right.
//   let idx = 0;
//   let dataBase64: string | undefined;
//   let timeBase64: string | undefined;
//   let randomBase64: string | undefined;
//   let signatureBase64: string | undefined;

//   // If showData is true, the first part is the base64-encoded data.
//   if (showData) {
//     if (idx >= parts.length) return false;
//     dataBase64 = parts[idx++]?.trim() || '';
//   }

//   // If timed is true, the next part is the base64-encoded timestamp.
//   if (timed) {
//     if (idx >= parts.length) return false;
//     timeBase64 = parts[idx++]?.trim() || '';
//   }

//   // Next is always the base64-encoded random bytes.
//   if (idx >= parts.length) return false;
//   randomBase64 = parts[idx++]?.trim() || '';

//   // Finally, the last part is the signature.
//   if (idx >= parts.length) return false;
//   signatureBase64 = parts[idx++]?.trim() || '';

//   // If there are any leftover parts, format is invalid.
//   if (idx !== parts.length) return false;

//   // --- Decode / reconstruct everything for signature verification. ---

//   // 1) Decode the random bytes.
//   const randomBytes = Uint8Array.from(atob(randomBase64), (c) => c.charCodeAt(0));

//   // 2) Handle data. We can either:
//   //    - (a) decode it directly from the token if showData = true and verify it
//   //         matches the 'data' parameter (optional integrity check),
//   //    - (b) if showData = false, or you’re not verifying they match exactly,
//   //         then just use serializer(data) as in normal tokens.
//   let dataBytes = new Uint8Array();

//   if (showData && dataBase64) {
//     // The data was included in the token; decode it.
//     const extractedDataBytes = Uint8Array.from(atob(dataBase64), (c) => c.charCodeAt(0));

//     // OPTIONAL: Compare extracted data to the `data` you passed in.
//     const paramDataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

//     // Simple length + content check (if you need to ensure the token-embedded
//     // data matches the expected data):
//     if (extractedDataBytes.length !== paramDataBytes.length) {
//       return false; // data mismatch
//     }
//     for (let i = 0; i < extractedDataBytes.length; i++) {
//       if (extractedDataBytes[i] !== paramDataBytes[i]) {
//         return false; // data mismatch
//       }
//     }

//     dataBytes = extractedDataBytes;
//   } else {
//     // The token does NOT carry data, or we don’t need to show/verify it.
//     dataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();
//   }

//   // Combine random + data
//   let finalCombined = new Uint8Array(randomBytes.byteLength + dataBytes.byteLength);
//   finalCombined.set(randomBytes);
//   finalCombined.set(dataBytes, randomBytes.byteLength);

//   // 3) If the token is timed, we must append the same time bytes
//   //    that were used in the signature.
//   if (timed && timeBase64) {
//     const timeStr = atob(timeBase64);
//     const timeBytes = new TextEncoder().encode(timeStr);

//     const combinedWithTime = new Uint8Array(finalCombined.byteLength + timeBytes.byteLength);
//     combinedWithTime.set(finalCombined);
//     combinedWithTime.set(timeBytes, finalCombined.byteLength);

//     finalCombined = combinedWithTime;
//   }

//   // 4) Decode signature from base64, then verify via crypto.subtle.
//   const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

//   const verified = await crypto.subtle.verify('HMAC', key, signatureBytes, finalCombined);

//   if (verified && maxAgeMs && timeBase64) {
//     const tokenTime = parseInt(atob(timeBase64), 10);
//     if (isNaN(tokenTime)) {
//       return false; // corrupted time
//     }
//     if (Date.now() - tokenTime > maxAgeMs) {
//       return false; // token expired
//     }
//   }

//   return verified;
// }

/**
 * Splits and trims the token into its constituent parts.
 *
 * @param token - The token string to split.
 * @param separator - The separator used in the token.
 * @returns An array of trimmed token parts.
 */
function splitAndTrimToken(token: string, separator: string): string[] {
  return token.split(separator).map((part) => part.trim());
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
 * Converts a Base64 string to a Uint8Array.
 *
 * @param base64 - The Base64 string to convert.
 * @returns The resulting Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  return decodeBase64(base64);
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
    const timeBytes = base64ToUint8Array(timeBase64);
    const timeStr = defaultDataDecoder(timeBytes) as string;
    const tokenTime = parseInt(timeStr, 10);
    if (isNaN(tokenTime)) return null;
    return tokenTime;
  } catch {
    return null;
  }
}

// working =======================
/**
 * Verifies the integrity and validity of a submitted token.
 *
 * @param key - The CryptoKey used for HMAC verification.
 * @param submitted - The submitted token string.
 * @param data - The expected data to verify against.
 * @param showData - Whether the token includes data.
 * @param timed - Whether the token includes a timestamp.
 * @param separator - The separator used in the token.
 * @param serializer - Function to serialize data into Uint8Array.
 * @param maxAgeMs - Optional maximum age in milliseconds for token validity.
 * @returns A Promise that resolves to true if the token is valid, false otherwise.
 */
// export async function verifyToken(
//   key: CryptoKey,
//   submitted: string,
//   data: unknown, // The 'expected' data you want to verify against
//   showData: boolean, // Matches generateToken’s 'showData'
//   timed: boolean, // Matches generateToken’s 'timed'
//   separator: string,
//   serializer: (data: unknown) => Uint8Array,
//   maxAgeMs?: number // Optional expiration check in milliseconds
// ): Promise<boolean> {
//   // Split and trim the submitted token string into parts.
//   const parts = splitAndTrimToken(submitted, separator);

//   // Extract token parts based on showData and timed flags.
//   const extractedParts = extractTokenParts(parts, showData, timed);
//   if (!extractedParts) return false;

//   const { dataBase64, timeBase64, randomBase64, signatureBase64 } = extractedParts;

//   // Decode the random bytes.
//   let randomBytes: Uint8Array;
//   try {
//     randomBytes = base64ToUint8Array(randomBase64);
//   } catch {
//     return false; // Invalid Base64 encoding for random bytes
//   }

//   // Handle data bytes.
//   let dataBytes: Uint8Array = new Uint8Array();
//   if (showData && dataBase64) {
//     try {
//       // Decode the data from the token.
//       const extractedDataBytes = base64ToUint8Array(dataBase64);

//       // Serialize the expected data.
//       const expectedDataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

//       // Compare the extracted data with the expected data.
//       if (!arraysEqual(extractedDataBytes, expectedDataBytes)) {
//         return false; // Data mismatch
//       }

//       dataBytes = extractedDataBytes;
//     } catch {
//       return false; // Invalid Base64 encoding for data bytes
//     }
//   } else {
//     // The token does NOT carry data, or we don’t need to show/verify it.
//     dataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();
//   }

//   // Combine random bytes and data bytes.
//   let finalCombined = combineUint8Arrays(randomBytes, dataBytes);

//   // Handle timestamp bytes if the token is timed.
//   if (timed && timeBase64) {
//     const tokenTime = extractTimestamp(timeBase64);
//     if (tokenTime === null) return false; // Corrupted or invalid timestamp

//     // Serialize the timestamp as it was during token generation.
//     const timeBytes = serializer(tokenTime);

//     // Append the timestamp bytes to the combined data.
//     finalCombined = combineUint8Arrays(finalCombined, timeBytes);

//     // Verify the token's age if maxAgeMs is provided.
//     if (maxAgeMs !== undefined) {
//       const currentTime = Date.now();
//       if (currentTime - tokenTime > maxAgeMs) {
//         return false; // Token expired
//       }
//     }
//   }

//   // Decode the signature from Base64.
//   let signatureBytes: Uint8Array;
//   try {
//     signatureBytes = base64ToUint8Array(signatureBase64);
//   } catch {
//     return false; // Invalid Base64 encoding for signature
//   }

//   // Verify the signature using the CryptoKey.
//   let isVerified: boolean;
//   try {
//     isVerified = await crypto.subtle.verify('HMAC', key, signatureBytes, finalCombined);
//   } catch {
//     return false; // Verification process failed
//   }

//   return isVerified;
// }

export async function verifyToken(
  key: CryptoKey,
  submitted: string,
  data: unknown, // The 'expected' data you want to verify against
  showData: boolean, // Matches generateToken’s 'showData'
  timed: boolean, // Matches generateToken’s 'timed'
  separator: string,
  serializer: (data: unknown) => Uint8Array,
  maxAgeMs?: number // Optional expiration check in milliseconds
): Promise<boolean> {
  // Split and trim the submitted token string into parts.
  const parts = splitAndTrimToken(submitted, separator);

  // Extract token parts based on showData and timed flags.
  const extractedParts = extractTokenParts(parts, showData, timed);
  if (!extractedParts) return false;

  const { dataBase64, timeBase64, randomBase64, signatureBase64 } = extractedParts;

  // Decode the random bytes.
  let randomBytes: Uint8Array;
  try {
    randomBytes = base64ToUint8Array(randomBase64);
  } catch {
    return false; // Invalid Base64 encoding for random bytes
  }

  // Handle data bytes.
  let dataBytes: Uint8Array = new Uint8Array();
  if (showData && dataBase64) {
    try {
      // Decode the data from the token.
      const extractedDataBytes = base64ToUint8Array(dataBase64);

      // Serialize the expected data.
      const expectedDataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

      // Compare the extracted data with the expected data.
      if (!arraysEqual(extractedDataBytes, expectedDataBytes)) {
        return false; // Data mismatch
      }

      dataBytes = extractedDataBytes;
    } catch {
      return false; // Invalid Base64 encoding for data bytes
    }
  } else {
    // The token does NOT carry data, or we don’t need to show/verify it.
    dataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();
  }

  // Combine random bytes and data bytes.
  let finalCombined = combineUint8Arrays(randomBytes, dataBytes);
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
    signatureBytes = base64ToUint8Array(signatureBase64);
  } catch {
    return false; // Invalid Base64 encoding for signature
  }

  // Verify the signature using the CryptoKey.
  let isVerified: boolean;
  try {
    isVerified = await crypto.subtle.verify('HMAC', key, signatureBytes, finalCombined);
  } catch {
    return false; // Verification process failed
  }

  if (!isVerified) {
    return false;
  }

  // Verify the token's age if maxAgeMs is provided.
  if (maxAgeMs && tokenTime) {
    const currentTime = Date.now();
    if (currentTime - tokenTime > maxAgeMs) {
      return false; // Token expired
    }
  }

  return true;
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

    /**
     * Generate a simple token without data and without timing.
     */
    async generate(data: unknown = ''): Promise<string> {
      return generateToken(key, data, false, false, options.tokenByteLength, options.seperator, options.dataSerializer);
    },

    /**
     * Verify a simple token without data and without timing.
     */
    async verify(submitted: string, data: unknown = ''): Promise<boolean> {
      return verifyToken(
        key,
        submitted,
        data,
        false,
        false,
        options.seperator,
        options.dataSerializer,
        undefined // maxAgeMs not applicable
      );
    },

    /**
     * Generate a token with embedded data but without timing.
     */
    async generateWithData(data: unknown): Promise<string> {
      return generateToken(
        key,
        data,
        true, // showData
        false, // timed
        options.tokenByteLength,
        options.seperator,
        options.dataSerializer
      );
    },

    /**
     * Verify a token with embedded data but without timing.
     */
    async verifyWithData(submitted: string, data: unknown): Promise<boolean> {
      return verifyToken(
        key,
        submitted,
        data,
        true, // showData
        false, // timed
        options.seperator,
        options.dataSerializer,
        undefined // maxAgeMs not applicable
      );
    },

    /**
     * Generate a timed token without embedded data.
     */
    async generateTimed(data: unknown = ''): Promise<string> {
      return generateToken(
        key,
        data,
        false, // showData
        true, // timed
        options.tokenByteLength,
        options.seperator,
        options.dataSerializer
      );
    },

    /**
     * Verify a timed token without embedded data.
     * @param maxAgeMs The maximum age in milliseconds the token is valid for.
     */
    async verifyTimed(submitted: string, data: unknown = '', maxAgeMs: number): Promise<boolean> {
      return verifyToken(
        key,
        submitted,
        data,
        false, // showData
        true, // timed
        options.seperator,
        options.dataSerializer,
        maxAgeMs
      );
    },

    /**
     * Generate a timed token with embedded data.
     */
    async generateWithDataTimed(data: unknown): Promise<string> {
      return generateToken(
        key,
        data,
        true, // showData
        true, // timed
        options.tokenByteLength,
        options.seperator,
        options.dataSerializer
      );
    },

    /**
     * Verify a timed token with embedded data.
     * @param maxAgeMs The maximum age in milliseconds the token is valid for.
     */
    async verifyWithDataTimed(submitted: string, data: unknown, maxAgeMs: number): Promise<boolean> {
      return verifyToken(
        key,
        submitted,
        data,
        true, // showData
        true, // timed
        options.seperator,
        options.dataSerializer,
        maxAgeMs
      );
    },
  };
}
