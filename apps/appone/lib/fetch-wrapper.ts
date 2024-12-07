// 'use server';

// import { getServerSideToken } from '@/app/[locale]/(auth)/lib/token-manager';

// interface FetchOptions extends RequestInit {
//   headers?: HeadersInit;
// }

// const fetchWrapper = async (url: string, options: FetchOptions = {}): Promise<Response> => {
//   // Check if Authorization header is already set
//   const hasAuthHeader = options.headers && 'Authorization' in options.headers;

//   // Get the token only if Authorization header is not set
//   const token = hasAuthHeader ? '' : await getServerSideToken();

//   // Set the default headers
//   const defaultHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

//   // Merge custom headers with default headers
//   const headers: HeadersInit = {
//     ...defaultHeaders,
//     ...options.headers,
//   };

//   const defaultOptions: FetchOptions = {
//     headers,
//   };

//   // Merge custom options with default options
//   const updatedOptions: FetchOptions = {
//     ...options,
//     ...defaultOptions,
//   };

//   // Call the original fetch function
//   return fetch(url, updatedOptions);
// };

// export default fetchWrapper;

import 'server-only';
import { getServerSideToken, invalidateToken } from '@/app/[locale]/(auth)/lib/token-manager';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Fetch wrapper that automatically adds the Authorization header with the server-side token.
 * If the token is invalid, it will attempt to refresh the token and retry the request.
 * @param url The URL to fetch
 * @param options The fetch options
 * @param authenticated Whether the request requires authentication
 * @returns The fetch response
 */
const fetchWrapper = async (url: string, options: FetchOptions = {}, authenticated = true): Promise<Response> => {
  // Determine if Authorization header is already present
  const hasAuthHeader = options.headers && Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization');

  // Retrieve token if Authorization header is not set
  let token = hasAuthHeader ? '' : await getServerSideToken();

  // Set default headers
  const defaultHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  // Merge headers (case-insensitive)
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...options.headers,
  };

  // Prepare updated options
  const updatedOptions: FetchOptions = {
    ...options,
    headers,
  };

  // First fetch attempt
  let response = await fetch(url, updatedOptions);

  // // Case where authorization server changes RSA kay pair used to sign JWT
  // // In this case, the existing token will be invalid and the server will return 401
  // // Authenticated flag required for credentials login api backend as it returns 401 for invalid credentials
  // if (authenticated && response.status === 401 && !hasAuthHeader) {
  //   try {
  //     // Invalidate the cached token
  //     await invalidateToken();

  //     // Fetch a new token
  //     const newToken = await getServerSideToken();

  //     // Update headers with new token
  //     const retryHeaders: HeadersInit = {
  //       ...options.headers,
  //       Authorization: `Bearer ${newToken}`,
  //     };

  //     const retryOptions: FetchOptions = {
  //       ...options,
  //       headers: retryHeaders,
  //     };

  //     // Retry the original request with the new token
  //     response = await fetch(url, retryOptions);
  //   } catch (error) {
  //     // Handle refresh failure (e.g., redirect to login, throw error)
  //     console.error('Token refresh failed:', error);
  //     throw new Error('Authentication failed. Please log in again.');
  //   }
  // }

  return response;
};

export default fetchWrapper;
