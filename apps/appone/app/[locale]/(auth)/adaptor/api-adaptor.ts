import 'server-only';
import { v4 as uuidv4 } from 'uuid';

import fetchWrapper from '@/lib/fetch-wrapper';
import { SessionAdaptor, SessionObj } from '@nartix/next-security';

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
    async getUser(id: string | null): Promise<Record<string, any> | null> {
      if (!id) return null;
      const response = await fetchWrapper(`${apiBaseUrl}/users/${id}`);
      if (!response.ok) return null;
      return response.json();
    },
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
    async getSessionAndUser(sessionToken: string): Promise<SessionObj | null> {
      const decodedToken = atob(sessionToken);

      const response = await fetchWrapper(
        `${apiBaseUrl}/sessions/search/findBySessionId?sessionId=${encodeURIComponent(decodedToken)}`
      );

      if (!response.ok) {
        return null;
      }

      const session = await response.json();

      const user = await this.getUser(session.userId);
      if (!user) {
        return null;
      }

      return { ...session, user: user };
    },
    async createSession(userData, expires): Promise<SessionObj> {
      // Get the current time in milliseconds (UNIX epoch time)
      const creationTime = Date.now();

      // Define the max inactive interval (30 minutes in seconds)
      const maxInactiveInterval = expires || 1800;

      // Calculate the expiry time in milliseconds
      const expiryTime = creationTime + maxInactiveInterval * 1000;

      const sessionObj = {
        primaryId: uuidv4(),
        sessionId: uuidv4(),
        creationTime: creationTime,
        expiryTime: expiryTime,
        lastAccessTime: creationTime,
        maxInactiveInterval: maxInactiveInterval,
        userId: userData.id,
        principalName: userData.username,
      };
      console.log('session', sessionObj);
      const response = await fetchWrapper(`${apiBaseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionObj),
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
    // async updateSession(session: Partial<SessionObj>): Promise<SessionObj | null> {
    //   if (!session.sessionId) {
    //     throw new Error('sessionId is required to update the session.');
    //   }

    //   const existingSessionResponse = await fetchWrapper(
    //     `${apiBaseUrl}/sessions/search/findBySessionId?sessionId=${encodeURIComponent(session.sessionId)}`,
    //     {
    //       method: 'GET',
    //       headers: { 'Content-Type': 'application/json' },
    //     }
    //   );

    //   if (!existingSessionResponse.ok) {
    //     console.error(`Error fetching existing session: ${existingSessionResponse.statusText}`);
    //     return null;
    //   }

    //   const existingSession: SessionObj = await existingSessionResponse.json();

    //   // Update the lastAccessTime to the current time
    //   const currentTime = Date.now();

    //   const updatedSession: SessionObj = {
    //     ...existingSession,
    //     ...session,
    //     lastAccessTime: currentTime,
    //     expiryTime: currentTime + existingSession.maxInactiveInterval * 1000,
    //   };

    //   // Send the updated session to the server
    //   const response = await fetchWrapper(`${apiBaseUrl}/sessions/${encodeURIComponent(updatedSession.primaryId)}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(updatedSession),
    //   });

    //   if (!response.ok) {
    //     console.error(`Error updating session: ${response.statusText}`);
    //     return null;
    //   }

    //   return response.json();
    // },
    async updateSession(session: Partial<SessionObj>): Promise<SessionObj | null> {
      if (!session.sessionId) {
        throw new Error('sessionId is required to update the session.');
      }

      const apiEndpoint = `${apiBaseUrl}/auth/sessions/update`;

      try {
        const response = await fetchWrapper(apiEndpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.sessionId,
            ipAddress: session.ipAddress,
            urlPath: session.urlPath,
            userAgent: session.userAgent,
          }),
        });

        if (!response.ok) {
          console.error(`Error updating session: ${response.statusText}`);
          return null;
        }

        const updatedSession: SessionObj = await response.json();
        console.log('Session updated successfully:', updatedSession);
        return updatedSession;
      } catch (error) {
        console.error('Error occurred while updating the session:', error);
        return null;
      }
    },
    async deleteSession(sessionToken: string): Promise<void> {
      const response = await fetchWrapper(
        `${apiBaseUrl}/sessions/search/deleteBySessionId?sessionId=${encodeURIComponent(sessionToken)}`,
        {
          method: 'GET',
          // headers: {
          //   Accept: 'application/json',
          // },
        }
      );

      // API always returns a 404 if delete successful or not
      if (response.status === 404) {
        console.log('Session delete called successfully');
      } else if (!response.ok) {
        console.error(`Error deleting session: ${response.statusText}`);
      }
    },
  };
}
