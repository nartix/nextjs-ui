import { Credentials } from '@/providers/credential-provider';

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

export async function authenticateWithProvider(provider: Provider, credentials: unknown): Promise<User | null> {
  if (provider.id === 'credentials') {
    return provider.authorize(credentials as Credentials);
  } else if (provider.id === 'oauth') {
    // Implement GitHub OAuth flow
  } else {
    throw new Error('Unsupported provider');
  }

  return null;
}
