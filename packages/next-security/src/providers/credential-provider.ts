import { Provider, User } from '../provider';

export interface Credentials {
  username: string;
  password: string;
}

export const credentialsProvider: Provider = {
  id: 'credentials',
  async authorize(credentials: Credentials): Promise<User | null> {
    // Implement the authentication logic
    // return null if the credentials are invalid
    // return user object if the credentials are valid
    return null;
  },
};
