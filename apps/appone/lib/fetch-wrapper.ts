'use server';

import { getServerSideToken } from '@/app/[locale]/(auth)/lib/token-manager';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

const fetchWrapper = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  // Check if Authorization header is already set
  const hasAuthHeader = options.headers && 'Authorization' in options.headers;

  // Get the token only if Authorization header is not set
  const token = hasAuthHeader ? '' : await getServerSideToken();

  // Set the default headers
  const defaultHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  // Merge custom headers with default headers
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...options.headers,
  };

  const defaultOptions: FetchOptions = {
    headers,
  };

  // Merge custom options with default options
  const updatedOptions: FetchOptions = {
    ...options,
    ...defaultOptions,
  };

  // Call the original fetch function
  return fetch(url, updatedOptions);
};

export default fetchWrapper;
