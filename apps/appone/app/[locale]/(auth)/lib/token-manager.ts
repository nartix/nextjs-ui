import 'server-only';
import { API_BASE_URL } from '@/config/server-config';

let accessToken: string | null = null;
let tokenExpiry: number | null = null; // Expiration timestamp in milliseconds
let tokenFetchPromise: Promise<string> | null = null; // Shared promise for token fetching to prevent concurrent requests

function getSafeApiBaseUrlLabel() {
  if (!API_BASE_URL) {
    return 'unset';
  }

  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'invalid-url';
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// expires earlier than actual expiry to avoid token expiry during request
// const CLOCK_SKEW_BUFFER = 60 * 1000; // 60 seconds buffer

/**
 * Fetches a valid token from the API, always fetching a new token if needed.
 */
export async function getServerSideToken(): Promise<string> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // If a token is already being fetched, reuse the promise
  tokenFetchPromise ??= fetchNewToken();

  try {
    return await tokenFetchPromise;
  } finally {
    // Clear the promise once resolved or rejected
    tokenFetchPromise = null;
  }
}

/**
 * Invalidates the currently cached token.
 */
export async function invalidateToken(): Promise<void> {
  accessToken = null;
  tokenExpiry = null;
}

/**
 * Fetches a new token from the API.
 */
async function fetchNewToken(): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not defined in environment variables');
  }
  try {
    const response = await fetch(`${API_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.NEXTJS_OIDC_CLIENT_ID ?? '',
        client_secret: process.env.NEXTJS_OIDC_CLIENT_SECRET ?? '',
        scope: 'read write',
      }).toString(),
    });

    if (!response.ok) {
      console.error('Token endpoint returned an error', {
        apiBaseUrl: getSafeApiBaseUrlLabel(),
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.access_token || !data.expires_in) {
      throw new Error('Invalid token response');
    }

    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000; // Convert seconds to milliseconds

    return accessToken ?? '';
  } catch (error) {
    console.error('Error fetching new token', {
      apiBaseUrl: getSafeApiBaseUrlLabel(),
      error: getErrorMessage(error),
    });
    throw new Error('Could not fetch access token');
  }
}
