import { v4 as uuidv4 } from 'uuid';

import fetchWrapper from '@/lib/fetch-wrapper';
import { SessionAdaptor, Session, SessionObj } from '@nartix/auth-appone';

export default function ApiAdaptor(client: any, options = {}): SessionAdaptor {
  const apiBaseUrl = `${process.env.API_URL_GLOBAL}/${process.env.API_URL_PREFIX}/${process.env.API_URL_VERSION}`;

  return {
    // async createUser(user: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
    //   const response = await fetch(`${apiBaseUrl}/users`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(user),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error creating user: ${response.statusText}`);
    //   }
    //   return response.json();
    // },
    // async getUser(id: string): Promise<AdapterUser | null> {
    //   const response = await fetchWrapper(`${apiBaseUrl}/users/${id}`);
    //   if (!response.ok) return null;
    //   return response.json();
    // },
    // async getUserByEmail(email: string): Promise<AdapterUser | null> {
    //   const response = await fetch(`${apiBaseUrl}/findByEmail?email=${encodeURIComponent(email)}`);
    //   if (!response.ok) {
    //     return null;
    //   }
    //   const users: AdapterUser[] = await response.json();
    //   return users[0] || null;
    // },
    // async getUserByAccount({
    //   providerAccountId,
    //   provider,
    // }: {
    //   providerAccountId: string;
    //   provider: string;
    // }): Promise<AdapterUser | null> {
    //   const response = await fetch(
    //     `${apiBaseUrl}/accounts?provider=${encodeURIComponent(provider)}&providerAccountId=${encodeURIComponent(providerAccountId)}`
    //   );
    //   if (!response.ok) {
    //     return null;
    //   }
    //   const accounts: AdapterAccount[] = await response.json();
    //   if (accounts.length === 0) {
    //     return null;
    //   }
    //   const userId = accounts[0].userId;
    //   return this.getUser(userId);
    // },
    // async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
    //   const response = await fetch(`${apiBaseUrl}/users/${user.id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(user),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error updating user: ${response.statusText}`);
    //   }
    //   return response.json();
    // },
    // async deleteUser(userId: string): Promise<void> {
    //   const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
    //     method: 'DELETE',
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error deleting user: ${response.statusText}`);
    //   }
    // },
    // async linkAccount(account: AdapterAccount): Promise<void> {
    //   const response = await fetch(`${apiBaseUrl}/accounts`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(account),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error linking account: ${response.statusText}`);
    //   }
    // },
    // async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }): Promise<void> {
    //   const response = await fetch(`${apiBaseUrl}/accounts`, {
    //     method: 'DELETE',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ providerAccountId, provider }),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error unlinking account: ${response.statusText}`);
    //   }
    // },
    async createSession(session: SessionObj): Promise<SessionObj> {
      console.log('session', session);
      const response = await fetchWrapper(`${apiBaseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (!response.ok) {
        throw new Error(`Error creating session: ${response.statusText}`);
      }
      return response.json();

      // const responseData = await response.json();

      // responseData.id = responseData.sessionId;
      // delete responseData.sessionId;

      // return responseData;
    },
    // async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
    //   const response = await fetch(`${apiBaseUrl}/sessions/${encodeURIComponent(sessionToken)}`);
    //   if (!response.ok) {
    //     return null;
    //   }
    //   const session: AdapterSession = await response.json();
    //   const user = await this.getUser(session.userId);
    //   if (!user) {
    //     return null;
    //   }
    //   return { session, user };
    // },
    async updateSession(session: Partial<Session> & { sessionToken: string }): Promise<Session | null> {
      const response = await fetch(`${apiBaseUrl}/sessions/${encodeURIComponent(session.sessionToken)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (!response.ok) {
        throw new Error(`Error updating session: ${response.statusText}`);
      }
      return response.json();
    },
    async deleteSession(sessionToken: string): Promise<void> {
      const response = await fetchWrapper(`${apiBaseUrl}/sessions/${encodeURIComponent(sessionToken)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting session: ${response.statusText}`);
      }
    },
  };
}
