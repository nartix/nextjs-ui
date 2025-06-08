import 'server-only';

let accessToken: string | null = null;
let tokenExpiry: number | null = null; // Expiration timestamp in milliseconds
let tokenFetchPromise: Promise<string> | null = null; // Shared promise for token fetching to prevent concurrent requests

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
  const baseURL = process.env.PRODUCTION ? process.env.API_URL_PRODUCTION : process.env.API_URL_DEVELOPMENT;
  if (!baseURL) {
    throw new Error('API base URL is not defined in environment variables');
  }
  try {
    const response = await fetch(`${baseURL}/oauth2/token`, {
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
    console.error('Error fetching new token:', error);
    throw new Error('Could not fetch access token');
  }
}
