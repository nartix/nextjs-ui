import { Credentials } from './providers/credential-provider';

export type ProviderType = 'credentials' | 'oauth';

export interface User {
  id: string;
  username: string;
  email: string;
  // Add other user properties as needed
}

export interface Provider {
  id: ProviderType;
  authorize(credentials: Credentials): Promise<User | null>;
}

/**
 * Authenticate with the appropriate provider from an array of providers.
 * @param providers - Array of available providers.
 * @param providerId - ID of the provider to use for authentication.
 * @param credentials - Credentials to pass to the provider.
 * @returns Authenticated user or null if authentication fails.
 */
export async function authenticateWithProvider(
  providers: Provider[],
  providerId: ProviderType,
  credentials: unknown
): Promise<User | null> {
  // Find the provider by its ID
  const provider = providers.find((p) => p.id === providerId);

  if (!provider) {
    throw new Error(`Provider with id '${providerId}' not found.`);
  }

  // Authenticate with the identified provider
  if (provider.id === 'credentials') {
    return provider.authorize(credentials as Credentials);
  } else if (provider.id === 'oauth') {
    // Implement GitHub OAuth flow or other OAuth logic
    // Example placeholder logic:
    throw new Error('OAuth flow not implemented.');
  } else {
    throw new Error(`Unsupported provider: ${provider.id}`);
  }
}
