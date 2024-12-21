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

// export async function generateToken(
//   key: CryptoKey,
//   data: unknown,
//   validityTime: number,
//   tokenByteLength: number,
//   seperator: string,
//   serializer: (data: unknown) => Uint8Array
// ): Promise<string> {
//   const tokenBytes = new Uint8Array(tokenByteLength);
//   crypto.getRandomValues(tokenBytes);

//   const dataBytes = (data !== undefined && data !== null)
//     ? serializer(data)
//     : new Uint8Array();

//   const combined = new Uint8Array(tokenBytes.byteLength + dataBytes.byteLength);
//   combined.set(tokenBytes);
//   combined.set(dataBytes, tokenBytes.byteLength);

//   const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, combined));

//   const tokenBase64 = btoa(String.fromCharCode(...tokenBytes));
//   const signatureBase64 = btoa(String.fromCharCode(...signature));

//   console.log('Token String from Char:', String.fromCharCode(...tokenBytes));

//   return `${tokenBase64}${seperator}${signatureBase64}`;
// }

export async function generateToken(
  key: CryptoKey,
  data: unknown,
  showData: boolean,
  timed: boolean,
  tokenByteLength: number,
  seperator: string,
  serializer: (data: unknown) => Uint8Array
): Promise<string> {
  const parts = [];
  const randomBytes = new Uint8Array(tokenByteLength);
  crypto.getRandomValues(randomBytes);

  const dataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

  if (dataBytes && dataBytes.length > 0 && showData) {
    parts.push(btoa(String.fromCharCode(...dataBytes)));
  }

  const combined = new Uint8Array(randomBytes.byteLength + dataBytes.byteLength);
  combined.set(randomBytes);
  combined.set(dataBytes, randomBytes.byteLength);

  let finalCombined = combined;
  let now;

  if (timed) {
    now = Date.now();
    const validityBytes = new Uint8Array(new TextEncoder().encode(String(now)));
    const combinedWithValidity = new Uint8Array(combined.byteLength + validityBytes.byteLength);
    combinedWithValidity.set(combined);
    combinedWithValidity.set(validityBytes, combined.byteLength);
    finalCombined = combinedWithValidity;
    parts.push(btoa(String(now)));
  }

  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, finalCombined));

  parts.push(btoa(String.fromCharCode(...randomBytes)));
  parts.push(btoa(String.fromCharCode(...signature)));

  return parts.join(seperator);
}

// export async function verifyToken(
//   key: CryptoKey,
//   submitted: string,
//   data: unknown,
//   seperator: string,
//   serializer: (data: unknown) => Uint8Array
// ): Promise<boolean> {
//   const [tokenBase64, signatureBase64] = submitted.split(seperator);
//   if (!tokenBase64 || !signatureBase64) return false;

//   const tokenBytes = Uint8Array.from(atob(tokenBase64), c => c.charCodeAt(0));
//   const dataBytes = (data !== undefined && data !== null)
//     ? serializer(data)
//     : new Uint8Array();

//   const combined = new Uint8Array(tokenBytes.byteLength + dataBytes.byteLength);
//   combined.set(tokenBytes);
//   combined.set(dataBytes, tokenBytes.byteLength);

//   const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

//   return crypto.subtle.verify('HMAC', key, signatureBytes, combined);
// }

// export async function verifyToken(
//   key: CryptoKey,
//   submitted: string,
//   data: unknown,
//   separator: string,
//   serializer: (data: unknown) => Uint8Array,
//   maxAgeMs?: number  // optional parameter if you want expiration checks
// ): Promise<boolean> {
//   // Split into parts
//   const parts = submitted.split(separator);

//   let timeStr: string | undefined;
//   let randomBase64: string | undefined;
//   let signatureBase64: string | undefined;

//   if (parts.length === 3) {
//     // Timed token
//     timeStr = parts[0] ? atob(parts[0]) : undefined;
//     randomBase64 = parts[1];
//     signatureBase64 = parts[2];
//   } else if (parts.length === 2) {
//     // Untimed token
//     randomBase64 = parts[0];
//     signatureBase64 = parts[1];
//   } else {
//     // Invalid token format
//     return false;
//   }

//   if (!randomBase64 || !signatureBase64) {
//     return false;
//   }

//   // Decode random bytes
//   const randomBytes = Uint8Array.from(atob(randomBase64), (c) => c.charCodeAt(0));
//   // Serialize `data`
//   const dataBytes = (data !== undefined && data !== null)
//     ? serializer(data)
//     : new Uint8Array();

//   // Combine random + data
//   let combined = new Uint8Array(randomBytes.byteLength + dataBytes.byteLength);
//   combined.set(randomBytes);
//   combined.set(dataBytes, randomBytes.byteLength);

//   // If time was included, append the same timestamp bytes
//   if (timeStr) {
//     const timeBytes = new TextEncoder().encode(timeStr);
//     const combinedWithTime = new Uint8Array(combined.byteLength + timeBytes.byteLength);
//     combinedWithTime.set(combined);
//     combinedWithTime.set(timeBytes, combined.byteLength);

//     combined = combinedWithTime;

//     // Optional expiration check
//     if (maxAgeMs) {
//       const tokenTime = parseInt(timeStr, 10);
//       if (isNaN(tokenTime)) {
//         return false; // corrupted time
//       }
//       const now = Date.now();
//       if (now - tokenTime > maxAgeMs) {
//         return false; // token has expired
//       }
//     }
//   }

//   // Decode the signature
//   const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

//   // Verify signature
//   return await crypto.subtle.verify('HMAC', key, signatureBytes, combined);
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
  // Split the submitted token string into parts.
  const parts = submitted.split(separator);

  // Because 'showData' and 'timed' can vary, we will parse from left to right.
  let idx = 0;
  let dataBase64: string | undefined;
  let timeBase64: string | undefined;
  let randomBase64: string | undefined;
  let signatureBase64: string | undefined;

  // If showData is true, the first part is the base64-encoded data.
  if (showData) {
    if (idx >= parts.length) return false;
    dataBase64 = parts[idx++]?.trim() || '';
  }

  // If timed is true, the next part is the base64-encoded timestamp.
  if (timed) {
    if (idx >= parts.length) return false;
    timeBase64 = parts[idx++]?.trim() || '';
  }

  // Next is always the base64-encoded random bytes.
  if (idx >= parts.length) return false;
  randomBase64 = parts[idx++]?.trim() || '';

  // Finally, the last part is the signature.
  if (idx >= parts.length) return false;
  signatureBase64 = parts[idx++]?.trim() || '';

  // If there are any leftover parts, format is invalid.
  if (idx !== parts.length) return false;

  // --- Decode / reconstruct everything for signature verification. ---

  // 1) Decode the random bytes.
  const randomBytes = Uint8Array.from(atob(randomBase64), (c) => c.charCodeAt(0));

  // 2) Handle data. We can either:
  //    - (a) decode it directly from the token if showData = true and verify it
  //         matches the 'data' parameter (optional integrity check),
  //    - (b) if showData = false, or you’re not verifying they match exactly,
  //         then just use serializer(data) as in normal tokens.
  let dataBytes = new Uint8Array();

  if (showData && dataBase64) {
    // The data was included in the token; decode it.
    const extractedDataBytes = Uint8Array.from(atob(dataBase64), (c) => c.charCodeAt(0));

    // OPTIONAL: Compare extracted data to the `data` you passed in.
    const paramDataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();

    // Simple length + content check (if you need to ensure the token-embedded
    // data matches the expected data):
    if (extractedDataBytes.length !== paramDataBytes.length) {
      return false; // data mismatch
    }
    for (let i = 0; i < extractedDataBytes.length; i++) {
      if (extractedDataBytes[i] !== paramDataBytes[i]) {
        return false; // data mismatch
      }
    }

    dataBytes = extractedDataBytes;
  } else {
    // The token does NOT carry data, or we don’t need to show/verify it.
    dataBytes = data !== undefined && data !== null ? serializer(data) : new Uint8Array();
  }

  // Combine random + data
  let finalCombined = new Uint8Array(randomBytes.byteLength + dataBytes.byteLength);
  finalCombined.set(randomBytes);
  finalCombined.set(dataBytes, randomBytes.byteLength);

  // 3) If the token is timed, we must append the same time bytes
  //    that were used in the signature.
  if (timed && timeBase64) {
    const timeStr = atob(timeBase64);
    const timeBytes = new TextEncoder().encode(timeStr);

    const combinedWithTime = new Uint8Array(finalCombined.byteLength + timeBytes.byteLength);
    combinedWithTime.set(finalCombined);
    combinedWithTime.set(timeBytes, finalCombined.byteLength);

    finalCombined = combinedWithTime;
  }

  // 4) Decode signature from base64, then verify via crypto.subtle.
  const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

  const verified = await crypto.subtle.verify('HMAC', key, signatureBytes, finalCombined);

  if (verified && maxAgeMs && timeBase64) {
    const tokenTime = parseInt(atob(timeBase64), 10);
    if (isNaN(tokenTime)) {
      return false; // corrupted time
    }
    if (Date.now() - tokenTime > maxAgeMs) {
      return false; // token expired
    }
  }

  return verified;
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
      return generateToken(key, data, true, true, options.tokenByteLength, options.seperator, options.dataSerializer);
    },

    async verify(submitted: string, data: unknown = ''): Promise<boolean> {
      return verifyToken(key, submitted, data, true, true, options.seperator, options.dataSerializer, 2000);
    },
  };
}
